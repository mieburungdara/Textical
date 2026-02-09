extends Control

## CombatScreen - Tactical Simulation Viewer
## Visualizes server-generated battle replays with grid-based movement and effects.

@onready var grid_container = $TacticalGrid
@onready var grid_lines = $TacticalGrid/Lines
@onready var units_layer = $TacticalGrid/Units
@onready var log_label = $VBoxContainer/LogPanel/RichTextLabel
@onready var result_popup = $ResultPopup
@onready var result_text = $ResultPopup/VBoxContainer/ResultText
@onready var loot_text = $ResultPopup/VBoxContainer/LootText
@onready var close_btn = $ResultPopup/VBoxContainer/CloseBtn

const HIT_VFX = preload("res://assets/vfx/HitEffect.tscn")
const GRID_SIZE = 50
const TICK_DELAY = 0.12 # Visual progression speed

var battle_data = null
var unit_nodes = {} # { instance_id: Node2D }
var cell_size: Vector2 = Vector2.ZERO
var is_replaying = false

func _ready():
    result_popup.hide()
    close_btn.pressed.connect(_on_close_pressed)
    grid_lines.draw.connect(_on_grid_draw)
    
    ServerConnector.request_completed.connect(_on_request_completed)
    ServerConnector.error_occurred.connect(_on_error)
    
    if GameState.current_user:
        var target_monster = GameState.target_monster_id
        
        # Smart Fallback: Pick first monster from current region if none selected
        if target_monster == -1:
            if GameState.current_region_data and GameState.current_region_data.has("monsters"):
                var monsters = GameState.current_region_data.get("monsters", [])
                if monsters.size() > 0:
                    target_monster = int(monsters[0].get("id", 6001))
            
            if target_monster == -1: target_monster = 6001 # Absolute fallback
            
        var uid = GameState.current_user.get("id")
        if uid:
            print("[COMBAT] Starting battle for user ", uid, " vs monster ", target_monster)
            ServerConnector.start_battle(int(uid), target_monster)

func _process(_delta):
    if grid_container.size.x > 0 and cell_size == Vector2.ZERO:
        cell_size = grid_container.size / GRID_SIZE
        grid_lines.queue_redraw()

func _on_grid_draw():
    if cell_size == Vector2.ZERO: return
    for i in range(GRID_SIZE + 1):
        var x = i * cell_size.x
        var y = i * cell_size.y
        grid_lines.draw_line(Vector2(x, 0), Vector2(x, grid_container.size.y), Color(1, 1, 1, 0.05))
        grid_lines.draw_line(Vector2(0, y), Vector2(grid_container.size.x, y), Color(1, 1, 1, 0.05))

func _on_request_completed(endpoint, data):
    if "battle/start" in endpoint:
        print("[COMBAT] Battle data received. Type of data: ", typeof(data))
        
        var raw_data = data
        if data is Dictionary and data.has("data"):
            raw_data = data.get("data")
            print("[COMBAT] Extracted inner data. Type: ", typeof(raw_data))
            
        # AAA: Robust JSON Parsing for string responses
        if raw_data is String:
            print("[COMBAT] raw_data is String, attempting parse...")
            var json = JSON.new()
            var parse_result = json.parse(raw_data)
            if parse_result == OK:
                battle_data = json.get_data()
                print("[COMBAT] Parse success. New type: ", typeof(battle_data))
            else:
                print("[COMBAT] Error parsing JSON string: ", json.get_error_message())
                battle_data = null
        else:
            battle_data = raw_data
            print("[COMBAT] Assigned raw_data directly. Type: ", typeof(battle_data))
            
        if battle_data is Dictionary:
            print("[COMBAT] battle_data is Dictionary, setting up battlefield...")
            _setup_battlefield()
        else:
            print("[COMBAT] battle_data is NOT Dictionary. Final Type: ", typeof(battle_data))
            log_label.append_text("[color=red]Failed to initialize combat data.[/color]\n")

func _on_error(_endpoint, message):
    log_label.append_text("[color=red][ERROR][/color] " + message + "\n")

func _setup_battlefield():
    if not battle_data: return
    
    for child in units_layer.get_children(): child.queue_free()
    unit_nodes.clear()
    
    var initial_units = battle_data.get("initialUnits", [])
    print("[COMBAT] Initializing battlefield with ", initial_units.size(), " units")
    
    if initial_units.size() == 0:
        log_label.append_text("[color=yellow]Your formation is empty! Deploy heroes in the Party menu.[/color]\n")
    
    for u in initial_units:
        var node = _create_unit_visual(u)
        units_layer.add_child(node)
        
        var uid = u.get("id")
        if uid != null:
            unit_nodes[uid] = node
            var ux = u.get("x", 0)
            var uy = u.get("y", 0)
            node.position = Vector2(ux * cell_size.x, uy * cell_size.y) + (cell_size / 2)
    
    _run_replay()

func _create_unit_visual(u_data) -> Node2D:
    var node = Node2D.new()
    var poly = Polygon2D.new()
    var radius = min(cell_size.x, cell_size.y) * 0.45
    
    # Simple circle-like polygon
    var points = []
    for i in range(12):
        var angle = (PI * 2 / 12) * i
        points.append(Vector2(cos(angle), sin(angle)) * radius)
    poly.polygon = PackedVector2Array(points)
    
    var team = u_data.get("team", "PLAYER")
    poly.color = Color(0, 0.8, 1) if team == "PLAYER" else Color(1, 0.3, 0.2)
    node.add_child(poly)
    
    # Name Label
    var name_lbl = Label.new()
    name_lbl.text = u_data.get("name", "Unit").split(" ")[0]
    name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    name_lbl.add_theme_font_size_override("font_size", 10)
    name_lbl.position = Vector2(-50, radius + 2)
    name_lbl.custom_minimum_size = Vector2(100, 0)
    node.add_child(name_lbl)
    
    # HP Bar
    var bar = ProgressBar.new()
    bar.show_percentage = false
    bar.custom_minimum_size = Vector2(cell_size.x * 0.9, 4)
    bar.position = Vector2(-cell_size.x * 0.45, -radius - 12)
    
    var max_hp = u_data.get("maxHp", 100)
    bar.max_value = max_hp
    bar.value = max_hp
    node.add_child(bar)
    node.set_meta("hp_bar", bar)
    
    return node

func _run_replay():
    if not battle_data: return
    is_replaying = true
    
    var ticks = battle_data.get("ticks", [])
    print("[COMBAT] Starting replay with ", ticks.size(), " ticks")
    
    for tick_data in ticks:
        if not is_inside_tree(): return
        
        # AAA: Validate tick_data is a Dictionary before accessing
        if not tick_data is Dictionary:
            print("[COMBAT] Warning: tick_data is not Dictionary, skipping. Type: ", typeof(tick_data))
            continue
        
        # 1. Update Unit States (Only for units present in this tick's delta)
        var units_state = tick_data.get("units", [])
        for u_state in units_state:
            var uid = u_state.get("id")
            if uid == null: continue
            
            var node = unit_nodes.get(uid)
            if is_instance_valid(node):
                # Update Position if included in delta
                if u_state.has("pos"):
                    var pos = u_state.get("pos")
                    var target_pos = Vector2(pos.x * cell_size.x, pos.y * cell_size.y) + (cell_size / 2)
                    
                    # Smooth move
                    var tw = create_tween().set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
                    tw.tween_property(node, "position", target_pos, TICK_DELAY * 0.8)
                
                # Update HP if included in delta
                var bar = node.get_meta("hp_bar")
                if bar and u_state.has("hp"):
                    var hp_val = u_state.get("hp")
                    bar.value = int(hp_val) if hp_val != null else bar.value
                    if bar.value <= 0: node.modulate.a = 0.3

        # 2. Process Events in this tick
        var events = tick_data.get("events", [])
        for event in events:
            var type = event.get("type")
            var msg = event.get("msg", "")
            
            if msg != "":
                log_label.append_text(msg + "\n")
            
            if type == "ATTACK":
                var e_data = event.get("data", {})
                var target_id = e_data.get("targetId")
                if target_id and unit_nodes.has(target_id):
                    _play_vfx(HIT_VFX, unit_nodes[target_id].position)
        
        await get_tree().create_timer(TICK_DELAY).timeout

    # Final result
    var result = battle_data.get("result", "DEFEAT")
    _show_result(result == "VICTORY")

func _play_vfx(vfx_scene: PackedScene, pos: Vector2):
    if vfx_scene:
        var effect = vfx_scene.instantiate()
        add_child(effect)
        effect.global_position = pos

func _show_result(won: bool):
    is_replaying = false
    result_popup.show()
    result_text.text = "VICTORY" if won else "DEFEAT"
    result_text.modulate = Color.GREEN if won else Color.RED
    
    if won:
        var loot = battle_data.get("loot", [])
        if loot.size() > 0:
            var loot_str = "Loot: "
            for item in loot:
                loot_str += "%d %s, " % [item.get("quantity", 1), item.get("name", "Item")]
            loot_text.text = loot_str.rstrip(", ")
        else:
            loot_text.text = "No loot discovered."
    else:
        loot_text.text = "Your units have retreated safely."

func _on_close_pressed():
    get_tree().change_scene_to_file(GameState.last_visited_hub)

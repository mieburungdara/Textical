extends Control

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
const TICK_DELAY = 0.05 # Faster ticks for AP system

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
        if target_monster == -1: target_monster = 6001 # Slime fallback
        ServerConnector.start_battle(GameState.current_user.id, target_monster)

func _process(_delta):
    if grid_container.size.x > 0 and cell_size == Vector2.ZERO:
        cell_size = grid_container.size / GRID_SIZE
        grid_lines.queue_redraw()

func _on_grid_draw():
    if cell_size == Vector2.ZERO: return
    for i in range(GRID_SIZE + 1):
        var x = i * cell_size.x
        var y = i * cell_size.y
        grid_lines.draw_line(Vector2(x, 0), Vector2(x, grid_container.size.y), Color(1, 1, 1, 0.1))
        grid_lines.draw_line(Vector2(0, y), Vector2(grid_container.size.x, y), Color(1, 1, 1, 0.1))

func _on_request_completed(endpoint, data):
    if "battle/start" in endpoint:
        battle_data = data
        _setup_battlefield()

func _on_error(_endpoint, message):
    log_label.append_text("[color=red][ERROR][/color] " + message + "\n")

func _setup_battlefield():
    # 1. Clear previous units
    for child in units_layer.get_children(): child.queue_free()
    unit_nodes.clear()
    
    # 2. Spawn units using initial positions
    for u in battle_data.initialUnits:
        var node = _create_unit_visual(u)
        units_layer.add_child(node)
        unit_nodes[u.id] = node
        node.position = Vector2(u.x * cell_size.x, u.y * cell_size.y) + (cell_size / 2)
    
    # 3. Start Replay
    _run_replay()

func _create_unit_visual(u_data) -> Node2D:
    var node = Node2D.new()
    
    # Unit Circle
    var poly = Polygon2D.new()
    var radius = min(cell_size.x, cell_size.y) * 0.4
    var points = []
    for i in range(16):
        var angle = (PI * 2 / 16) * i
        points.append(Vector2(cos(angle), sin(angle)) * radius)
    poly.polygon = PackedVector2Array(points)
    poly.color = Color.CYAN if u_data.team == "PLAYER" else Color.RED
    node.add_child(poly)
    
    # Health Bar (Mini)
    var bar = ProgressBar.new()
    bar.show_percentage = false
    bar.custom_minimum_size = Vector2(cell_size.x * 0.8, 4)
    bar.position = Vector2(-cell_size.x * 0.4, -radius - 10)
    bar.max_value = u_data.maxHp
    bar.value = u_data.maxHp
    node.add_child(bar)
    node.set_meta("hp_bar", bar)
    
    return node

async function _run_replay():
    is_replaying = true
    for log_entry in battle_data.replay:
        if not is_inside_tree(): return
        
        # 1. Update EVERY unit position and health based on state snapshot
        for uid in log_entry.unit_states:
            var state = log_entry.unit_states[uid]
            var node = unit_nodes.get(uid)
            if is_instance_valid(node):
                # Animate Move
                var target_pos = Vector2(state.pos.x * cell_size.x, state.pos.y * cell_size.y) + (cell_size / 2)
                if node.position != target_pos:
                    var tw = create_tween().set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
                    tw.tween_property(node, "position", target_pos, TICK_DELAY)
                
                # Update HP Bar
                var bar = node.get_meta("hp_bar")
                if bar:
                    var tw_hp = create_tween()
                    tw_hp.tween_property(bar, "value", float(state.hp), TICK_DELAY)

        # 2. Trigger Event Specific VFX
        match log_entry.type:
            "ATTACK":
                _play_attack_vfx(log_entry)
            "DEATH":
                _play_death_vfx(log_entry)
            "GAME_START":
                log_label.append_text("[b]BATTLE ENGAGED[/b]\n")

        if log_entry.message != "":
            log_label.append_text(log_entry.message + "\n")
        
        await get_tree().create_timer(TICK_DELAY).timeout
    
    _show_result()

func _play_attack_vfx(entry):
    var target_id = entry.data.get("target_id")
    var target_node = unit_nodes.get(target_id)
    if is_instance_valid(target_node):
        var vfx = HIT_VFX.instantiate()
        add_child(vfx)
        vfx.global_position = target_node.global_position
        
        var tw = create_tween()
        tw.tween_property(target_node, "modulate", Color.WHITE * 2, 0.05)
        tw.tween_property(target_node, "modulate", Color.WHITE, 0.05)

func _play_death_vfx(entry):
    var target_id = entry.data.get("target_id")
    var node = unit_nodes.get(target_id)
    if is_instance_valid(node):
        var tw = create_tween()
        tw.tween_property(node, "modulate:a", 0.0, 0.2)
        tw.tween_callback(node.queue_free)

func _show_result():
    result_text.text = battle_data.result
    if battle_data.loot.size() > 0:
        loot_text.text = "Loot Acquired: " + str(battle_data.loot.size()) + " items"
    else:
        loot_text.text = "No loot found."
    result_popup.show()

func _on_close_pressed():
    get_tree().change_scene_to_file(GameState.last_visited_hub)

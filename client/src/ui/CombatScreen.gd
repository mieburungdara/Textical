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
const TICK_DELAY = 0.15 # Kecepatan per visual tick

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
    for child in units_layer.get_children(): child.queue_free()
    unit_nodes.clear()
    
    for u in battle_data.initialUnits:
        var node = _create_unit_visual(u)
        units_layer.add_child(node)
        unit_nodes[u.id] = node
        node.position = Vector2(u.x * cell_size.x, u.y * cell_size.y) + (cell_size / 2)
    
    _run_replay()

func _create_unit_visual(u_data) -> Node2D:
    var node = Node2D.new()
    var poly = Polygon2D.new()
    var radius = min(cell_size.x, cell_size.y) * 0.4
    var points = []
    for i in range(16):
        var angle = (PI * 2 / 16) * i
        points.append(Vector2(cos(angle), sin(angle)) * radius)
    poly.polygon = PackedVector2Array(points)
    poly.color = Color.CYAN if u_data.team == "PLAYER" else Color.RED
    node.add_child(poly)
    
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
                # ... (existing movement/HP logic)
                
                # NEW: Visual Status Indicator (Color Tinting)
                var base_color = Color.CYAN if "hero_" in uid else Color.RED
                var tint = base_color
                
                # Check for active effects in unit_states (we need to send this from server)
                if state.has("effects"):
                    for eff in state.effects:
                        if eff == "STUN": tint = Color.YELLOW
                        elif eff == "BURN": tint = Color.ORANGE
                
                var poly = node.get_child(0)
                if poly is Polygon2D:
                    poly.color = tint

        # 2. Trigger Event Specific VFX
        for event in log_entry.events:
            match event.type:
                "ATTACK":
                    _play_attack_vfx(event)
                "CAST_SKILL":
                    _play_skill_vfx(event)
                "DEATH":
                    _play_death_vfx(event)
                "GAME_OVER":
                    log_label.append_text("[b]BATTLE FINISHED[/b]\n")

            if event.message != "":
                log_label.append_text(event.message + "\n")
        
        # Tunggu satu durasi tick sebelum memproses tick berikutnya
        await get_tree().create_timer(TICK_DELAY).timeout
    
    _show_result()

func _play_attack_vfx(ev):
    var target_id = ev.data.get("target_id")
    var target_node = unit_nodes.get(target_id)
    if is_instance_valid(target_node):
        var vfx = HIT_VFX.instantiate()
        add_child(vfx)
        vfx.global_position = target_node.global_position
        
        var tw = create_tween()
        tw.tween_property(target_node, "modulate", Color.WHITE * 2, 0.05)
        tw.tween_property(target_node, "modulate", Color.WHITE, 0.05)

        # NEW: Animate Knockback
        if ev.data.has("knockback") and ev.data.knockback != null:
            var kb = ev.data.knockback
            var kb_pos = Vector2(kb.to.x * cell_size.x, kb.to.y * cell_size.y) + (cell_size / 2)
            var kb_tw = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
            kb_tw.tween_property(target_node, "position", kb_pos, 0.1)

func _play_skill_vfx(ev):
    # Flash all impacted tiles
    if ev.data.has("impact_tiles"):
        for tile in ev.data.impact_tiles:
            var rect = ColorRect.new()
            rect.size = cell_size
            rect.position = Vector2(tile.x * cell_size.x, tile.y * cell_size.y)
            rect.color = Color(1, 1, 0, 0.3) # Yellow flash
            grid_container.add_child(rect)
            
            var tw = create_tween()
            tw.tween_property(rect, "modulate:a", 0.0, 0.3)
            tw.tween_callback(rect.queue_free)
    
    # Also play standard hit VFX on all hit victims
    if ev.data.has("result") and ev.data.result.has("hit_ids"):
        for victim_id in ev.data.result.hit_ids:
            var victim_node = unit_nodes.get(victim_id)
            if is_instance_valid(victim_node):
                var vfx = HIT_VFX.instantiate()
                add_child(vfx)
                vfx.global_position = victim_node.global_position

func _play_death_vfx(ev):
    var target_id = ev.data.get("target_id")
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

extends Node2D
class_name CombatReplayScene

@onready var grid: GridVisual = $Grid
@onready var replay_manager: ReplayManager = $ReplayManager
@onready var camera: Camera2D = $Camera2D
@onready var play_button: Button = $UI/Panel/VBox/PlayButton
@onready var pause_button: Button = $UI/Panel/VBox/PauseButton
@onready var stop_button: Button = $UI/Panel/VBox/StopButton
@onready var speed_slider: HSlider = $UI/Panel/VBox/SpeedSlider
@onready var tick_label: Label = $UI/Panel/VBox/TickLabel
@onready var progress_bar: ProgressBar = $UI/ProgressBar
@onready var winner_label: Label = $UI/WinnerLabel

var units_container: Node2D
var current_replay_path: String = ""

func _ready() -> void:
    units_container = Node2D.new()
    units_container.name = "Units"
    add_child(units_container)
    
    # Connect UI
    play_button.pressed.connect(_on_play_pressed)
    pause_button.pressed.connect(_on_pause_pressed)
    stop_button.pressed.connect(_on_stop_pressed)
    speed_slider.value_changed.connect(_on_speed_changed)
    
    # Connect ReplayManager
    replay_manager.s_start.connect(_on_combat_started)
    replay_manager.s_end.connect(_on_combat_ended)
    replay_manager.s_tick.connect(_on_tick_reached)
    
    # Connect unit signals
    replay_manager.s_move.connect(_on_unit_move)
    replay_manager.s_damage.connect(_on_unit_damage)
    replay_manager.s_heal.connect(_on_unit_heal)
    replay_manager.s_mana.connect(_on_unit_mana)
    replay_manager.s_death.connect(_on_unit_death)
    
    _center_camera()
    
    # Auto-load sample replay for testing
    var replay_path = "res://replays/sample_replay.json"
    if load_replay(replay_path):
        print("[CombatReplayScene] Loaded: " + replay_path)
        replay_manager.play()

func _center_camera() -> void:
    if camera:
        var gs = grid.get_grid_size()
        camera.position = Vector2(gs.x * grid.cell_size / 2, gs.y * grid.cell_size / 2)

func setup_grid(width: int, height: int) -> void:
    grid.setup(width, height, 64)
    _center_camera()

# Load replay from file path
func load_replay(replay_path: String) -> bool:
    current_replay_path = replay_path
    var file = FileAccess.open(replay_path, FileAccess.READ)
    if file == null:
        return false
    var json_string = file.get_as_text()
    file.close()
    
    var json = JSON.new()
    if json.parse(json_string) != OK:
        return false
    
    var data = json.get_data()
    return load_replay_data(data)

# Load replay from dictionary (e.g., from socket)
func load_replay_from_dict(data: Dictionary) -> bool:
    return load_replay_data(data)

func load_replay_data(data: Dictionary) -> bool:
    var w = data.get("gridWidth", data.get("gridWidth", 20))
    var h = data.get("gridHeight", data.get("gridHeight", 20))
    setup_grid(w, h)
    
    # Convert dict to JSON string for ReplayManager
    var json_string = JSON.stringify(data)
    if not replay_manager.load_json(json_string):
        return false
    
    _spawn_units(data)
    return true

func _spawn_units(data: Dictionary) -> void:
    for child in units_container.get_children():
        child.queue_free()
    
    var units = data.get("units", [])
    var positions = data.get("initialPositions", {})
    
    for unit_data in units:
        var uid = unit_data.get("id", "")
        var u_name = unit_data.get("name", "Unit")
        var max_hp = unit_data.get("maxHp", 100)
        var max_mana = unit_data.get("magic", 0)  # magic stat as max mana
        var pos_data = positions.get(uid, {"x": 0, "y": 0})
        var gpos = Vector2i(int(pos_data.get("x", 0)), int(pos_data.get("y", 0)))
        _spawn_unit(uid, u_name, max_hp, max_mana, gpos)

# =============================================================================
# HELPER: Create styled progress bar
# =============================================================================

func _create_bar(pos: Vector2, max_val: int, fill_color: Color, bg_color: Color, _border_color: Color) -> ProgressBar:
    var bar = ProgressBar.new()
    bar.position = pos
    bar.size = Vector2(48, 8)
    bar.max_value = max_val
    bar.value = max_val
    bar.show_percentage = false
    
    # Background - dark fill showing the empty portion
    var bg = StyleBoxFlat.new()
    bg.bg_color = bg_color
    bg.corner_radius_top_left = 3
    bg.corner_radius_top_right = 3
    bg.corner_radius_bottom_left = 3
    bg.corner_radius_bottom_right = 3
    bar.add_theme_stylebox_override("background", bg)
    
    # Fill - the colored portion showing current value
    var fill = StyleBoxFlat.new()
    fill.bg_color = fill_color
    fill.corner_radius_top_left = 3
    fill.corner_radius_top_right = 3
    fill.corner_radius_bottom_left = 3
    fill.corner_radius_bottom_right = 3
    bar.add_theme_stylebox_override("fill", fill)
    
    return bar

func _spawn_unit(uid: String, unit_name: String, max_hp: int, max_mana: int, gpos: Vector2i) -> Node:
    var unit = Node2D.new()
    unit.name = uid
    unit.set_meta("unit_id", uid)
    unit.set_meta("max_hp", max_hp)
    unit.set_meta("current_hp", max_hp)
    unit.set_meta("max_mana", max_mana)
    unit.set_meta("current_mana", max_mana)
    unit.set_meta("grid_pos", gpos)
    
    # Sprite
    var sprite = Sprite2D.new()
    sprite.name = "Sprite"
    sprite.modulate = _get_unit_color(uid)
    unit.add_child(sprite)
    
    # HP Bar - Red with dark background and black border
    var hp_bar = _create_bar(
        Vector2(-24, -42),
        max_hp,
        Color(0.95, 0.2, 0.15),  # Bright red fill
        Color(0.2, 0.05, 0.05),   # Dark red bg
        Color(0.1, 0.1, 0.1)     # Black border
    )
    hp_bar.name = "HPBar"
    unit.add_child(hp_bar)
    
    # Mana Bar - Blue with dark background (only if has mana)
    if max_mana > 0:
        var mana_bar = _create_bar(
            Vector2(-24, -32),
            max_mana,
            Color(0.2, 0.5, 0.95),  # Bright blue fill
            Color(0.05, 0.1, 0.2),   # Dark blue bg
            Color(0.1, 0.1, 0.1)    # Black border
        )
        mana_bar.name = "ManaBar"
        unit.add_child(mana_bar)
    
    # Name Label
    var lbl = Label.new()
    lbl.text = unit_name
    lbl.position = Vector2(-24, -54)
    lbl.add_theme_font_size_override("font_size", 11)
    unit.add_child(lbl)
    
    # Position
    var wp = grid.get_cell_position(gpos.x, gpos.y) + Vector2(grid.cell_size / 2.0, grid.cell_size / 2.0)
    unit.position = wp
    
    units_container.add_child(unit)
    replay_manager.reg(uid, unit)
    
    return unit

func _get_unit_color(uid: String) -> Color:
    if uid.begins_with("player") or uid.begins_with("hero"):
        return Color(0.3, 0.6, 1.0)
    elif uid.begins_with("enemy") or uid.begins_with("monster"):
        return Color(1.0, 0.4, 0.3)
    return Color(0.7, 0.7, 0.7)

func _get_unit(uid: String) -> Node:
    for c in units_container.get_children():
        if c.get_meta("unit_id", "") == uid:
            return c
    return null

# =============================================================================
# SIGNAL HANDLERS
# =============================================================================

func _on_unit_move(uid: String, _from_pos: Vector2i, to_pos: Vector2i) -> void:
    var unit = _get_unit(uid)
    if unit:
        unit.set_meta("grid_pos", to_pos)
        var wp = grid.get_cell_position(to_pos.x, to_pos.y) + Vector2(grid.cell_size / 2.0, grid.cell_size / 2.0)
        var tw = create_tween()
        tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
        tw.tween_property(unit, "position", wp, 0.35)

func _on_unit_damage(tid: String, _sid: String, dmg: int, delta: int, crit: bool, _miss: bool) -> void:
    var unit = _get_unit(tid)
    if unit:
        # Reduce HP from current stored value
        var current_hp = unit.get_meta("current_hp", 100)
        var new_hp = max(0, current_hp + delta)  # delta is negative for damage
        unit.set_meta("current_hp", new_hp)
        
        var hp_bar = unit.get_node("HPBar")
        if hp_bar:
            # Smooth tween with ease out for damage
            var tw = create_tween()
            tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
            tw.tween_property(hp_bar, "value", float(new_hp), 0.25)
        
        _show_float(unit, str(abs(dmg)), Color.RED if dmg > 0 else Color.WHITE, crit)
        
        var spr = unit.get_node("Sprite")
        if spr:
            var tw = create_tween()
            tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
            tw.tween_property(spr, "modulate", Color.RED, 0.05)
            tw.tween_property(spr, "modulate", Color.WHITE, 0.2)

func _on_unit_heal(tid: String, _sid: String, amt: int, _hp_b: int, hp_a: int) -> void:
    var unit = _get_unit(tid)
    if unit:
        # Increase HP from current stored value
        var current_hp = unit.get_meta("current_hp", 100)
        var max_hp = unit.get_meta("max_hp", 100)
        var new_hp = min(max_hp, current_hp + amt)
        unit.set_meta("current_hp", new_hp)
        
        var hp_bar = unit.get_node("HPBar")
        if hp_bar:
            # Smooth tween with ease out for heal
            var tw = create_tween()
            tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
            tw.tween_property(hp_bar, "value", float(new_hp), 0.35)
        
        _show_float(unit, "+" + str(amt), Color.GREEN, false)

func _on_unit_mana(uid: String, _mana_b: int, mana_a: int, delta: int) -> void:
    var unit = _get_unit(uid)
    if unit:
        unit.set_meta("current_mana", mana_a)
        var mana_bar = unit.get_node("ManaBar")
        if mana_bar:
            # Smooth tween with ease out for mana
            var tw = create_tween()
            tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
            tw.tween_property(mana_bar, "value", float(mana_a), 0.2)
        
        if delta != 0:
            var col = Color.CYAN if delta < 0 else Color.BLUE
            _show_float(unit, str(delta), col, false)

func _on_unit_death(uid: String) -> void:
    var unit = _get_unit(uid)
    if unit:
        var tw = create_tween()
        tw.set_ease(Tween.EASE_IN).set_trans(Tween.TRANS_CUBIC)
        tw.tween_property(unit, "modulate:a", 0.0, 0.6)

func _on_unit_knockback(uid: String, _sid: String, _from: Vector2i, to: Vector2i, _dist: int, _dmg: int) -> void:
    var unit = _get_unit(uid)
    if unit:
        unit.set_meta("grid_pos", to)
        var wp = grid.get_cell_position(to.x, to.y) + Vector2(grid.cell_size / 2.0, grid.cell_size / 2.0)
        var tw = create_tween()
        tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
        tw.tween_property(unit, "position", wp, 0.25)

func _on_unit_level_up(uid: String, _old_lvl: int, _new_lvl: int) -> void:
    var unit = _get_unit(uid)
    if unit:
        var spr = unit.get_node("Sprite")
        if spr:
            var tw = create_tween()
            tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
            tw.tween_property(spr, "modulate", Color.YELLOW, 0.25)
            tw.tween_property(spr, "modulate", Color.WHITE, 0.35)
        
        # Also pulse the HP bar on level up
        var hp_bar = unit.get_node("HPBar")
        if hp_bar:
            var tw = create_tween()
            tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
            tw.tween_property(hp_bar, "value", hp_bar.max_value, 0.3)
        
        _show_float(unit, "LEVEL UP!", Color.YELLOW, true)

func _show_float(unit: Node, txt: String, col: Color, big: bool) -> void:
    var lbl = Label.new()
    lbl.text = txt
    lbl.modulate = col
    lbl.position = Vector2(-20, -60)
    lbl.add_theme_font_size_override("font_size", 20 if big else 14)
    unit.add_child(lbl)
    
    var tw = create_tween()
    tw.set_parallel(true)
    tw.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
    tw.tween_property(lbl, "position:y", lbl.position.y - 35, 0.7)
    tw.set_parallel(false)
    tw.tween_property(lbl, "modulate:a", 0.0, 0.7)
    tw.tween_callback(lbl.queue_free)

# =============================================================================
# UI
# =============================================================================

func _on_play_pressed() -> void:
    replay_manager.play()

func _on_pause_pressed() -> void:
    replay_manager.pause()

func _on_stop_pressed() -> void:
    replay_manager.stop()

func _on_speed_changed(val: float) -> void:
    replay_manager.speed(val)

func _on_combat_started(_ticks: int, _seed_val: String) -> void:
    winner_label.text = ""

func _on_combat_ended(winner: String) -> void:
    winner_label.text = winner.to_upper() + " WINS!"
    winner_label.modulate = Color.GREEN if winner == "player" else Color.RED

func _on_playback_finished() -> void:
    pass

func _on_tick_reached(tick: int) -> void:
    tick_label.text = "Tick: %d" % tick
    var info = replay_manager.info()
    progress_bar.value = float(tick) / info["ticks"] * 100.0 if info["ticks"] > 0 else 0

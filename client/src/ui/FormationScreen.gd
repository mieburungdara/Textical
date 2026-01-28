extends Control

@onready var tactical_grid = $MarginContainer/MainFrame/VBox/TacticalGrid
@onready var inspector_name = $MarginContainer/MainFrame/VBox/Inspector/HBox/Info/HeroName
@onready var inspector_details = $MarginContainer/MainFrame/VBox/Inspector/HBox/Info/HeroDetails
@onready var avatar_initial = $MarginContainer/MainFrame/VBox/Inspector/HBox/AvatarFrame/Initial
@onready var mirror_btn = $MarginContainer/MainFrame/VBox/Header/StrategyButtons/MirrorBtn

const GRID_SIZE = 50
const ENEMY_ROWS = 25

var cell_size: Vector2 = Vector2.ZERO
var current_preset_id = -1
var selected_hero_id = -1 
var grid_slots = {}
var hero_data_map = {}
var is_mirror_view = false

var formation_loaded = false
var heroes_loaded = false

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    tactical_grid.gui_input.connect(_on_grid_input)
    tactical_grid.draw.connect(_on_grid_draw)
    mirror_btn.pressed.connect(_on_mirror_toggle)
    refresh()

func _process(_delta):
    if tactical_grid.size.x <= 0 or tactical_grid.size.y <= 0: return
    var new_size = tactical_grid.size / GRID_SIZE
    if new_size.snapped(Vector2(0.01, 0.01)) != cell_size.snapped(Vector2(0.01, 0.01)):
        cell_size = new_size
        tactical_grid.queue_redraw()

func refresh():
    if GameState.current_user:
        formation_loaded = false
        heroes_loaded = false
        ServerConnector.fetch_formation(GameState.current_user.id)
        ServerConnector.fetch_heroes(GameState.current_user.id)

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if endpoint.contains("/formation") and not endpoint.contains("move"):
        current_preset_id = int(data.id)
        grid_slots = {}
        for slot in data.slots:
            grid_slots["%d,%d" % [int(slot.gridX), int(slot.gridY)]] = int(slot.heroId)
        formation_loaded = true
        _check_initial_sync()
    elif endpoint.contains("/heroes"):
        hero_data_map = {}
        for h in data: 
            var hid = int(h.id)
            hero_data_map[hid] = h
        heroes_loaded = true
        _check_initial_sync()
    elif endpoint.contains("formation/move"):
        inspector_name.text = "STRATEGY SYNCED"
        inspector_details.text = "[color=green]Unit position updated at command center.[/color]"

func _check_initial_sync():
    if formation_loaded and heroes_loaded:
        var changed = _auto_slot_new_heroes()
        var fixed = _fix_illegal_positions()
        if changed or fixed:
            # If we performed an auto-fix, we still use full sync for safety
            _save_full()
        tactical_grid.queue_redraw()

func _fix_illegal_positions() -> bool:
    var keys = grid_slots.keys()
    var dirty = false
    for key in keys:
        var pos = key.split(",")
        var gy = int(pos[1])
        if gy < ENEMY_ROWS:
            var hid = grid_slots[key]
            grid_slots.erase(key)
            var new_pos = _find_first_empty_player_slot()
            if new_pos != "":
                grid_slots[new_pos] = hid
                dirty = true
    return dirty

func _auto_slot_new_heroes() -> bool:
    var placed_ids = grid_slots.values()
    var dirty = false
    for hid in hero_data_map.keys():
        if !placed_ids.has(int(hid)):
            var empty_pos = _find_first_empty_player_slot()
            if empty_pos != "":
                grid_slots[empty_pos] = int(hid)
                dirty = true
    return dirty

func _find_first_empty_player_slot():
    for y in range(ENEMY_ROWS, GRID_SIZE):
        for x in range(GRID_SIZE):
            var key = "%d,%d" % [x, y]
            if !grid_slots.has(key): return key
    return ""

func _on_mirror_toggle():
    is_mirror_view = !is_mirror_view
    mirror_btn.text = "MIRROR ON" if is_mirror_view else "MIRROR OFF"
    if is_mirror_view:
        inspector_name.text = "ENEMY PERSPECTIVE"
        inspector_details.text = "[color=yellow]Viewing your units as the enemy sees them. Deployment disabled.[/color]"
    else:
        inspector_name.text = "PLAYER PERSPECTIVE"
        inspector_details.text = "[color=cyan]Standard deployment mode active.[/color]"
    tactical_grid.queue_redraw()

func _on_grid_draw():
    var top_color = Color(0.4, 0.1, 0.1, 0.3) if !is_mirror_view else Color(0.1, 0.3, 0.4, 0.3)
    var bottom_color = Color(0.1, 0.3, 0.4, 0.3) if !is_mirror_view else Color(0.4, 0.1, 0.1, 0.3)
    
    tactical_grid.draw_rect(Rect2(Vector2.ZERO, Vector2(tactical_grid.size.x, cell_size.y * ENEMY_ROWS)), top_color)
    tactical_grid.draw_rect(Rect2(Vector2(0, cell_size.y * ENEMY_ROWS), Vector2(tactical_grid.size.x, cell_size.y * ENEMY_ROWS)), bottom_color)
    
    for i in range(GRID_SIZE + 1):
        tactical_grid.draw_line(Vector2(i * cell_size.x, 0), Vector2(i * cell_size.x, tactical_grid.size.y), Color(1, 1, 1, 0.05))
        tactical_grid.draw_line(Vector2(0, i * cell_size.y), Vector2(tactical_grid.size.x, i * cell_size.y), Color(1, 1, 1, 0.05))
    
    tactical_grid.draw_line(Vector2(0, cell_size.y * ENEMY_ROWS), Vector2(tactical_grid.size.x, cell_size.y * ENEMY_ROWS), Color.WHITE, 2.0)

    for key in grid_slots.keys():
        var pos = key.split(",")
        var gx = int(pos[0])
        var gy = int(pos[1])
        var hid = int(grid_slots[key])
        
        var draw_x = gx
        var draw_y = gy
        if is_mirror_view:
            draw_x = (GRID_SIZE - 1) - gx
            draw_y = (GRID_SIZE - 1) - gy
        
        var rect = Rect2(Vector2(draw_x * cell_size.x + 1, draw_y * cell_size.y + 1), cell_size - Vector2(2, 2))   
        var color = Color.CYAN
        if hid == selected_hero_id: color = Color.GOLD
        
        tactical_grid.draw_rect(rect, color)

func _on_grid_input(event):
    if is_mirror_view: return 
    if cell_size.x <= 0: return # Final safety check
    if event is InputEventMouseButton and event.pressed:
        var gx = int(event.position.x / cell_size.x)
        var gy = int(event.position.y / cell_size.y)
        if gx < 0 or gx >= GRID_SIZE or gy < 0 or gy >= GRID_SIZE: return
        _handle_touch(gx, gy)

func _handle_touch(gx, gy):
    var key = "%d,%d" % [gx, gy]
    var hero_at_slot = grid_slots.get(key, -1)
    
    if selected_hero_id == -1:
        # PICK UP
        if hero_at_slot != -1:
            selected_hero_id = int(hero_at_slot)
            if hero_data_map.has(selected_hero_id):
                _show_hero_details(hero_data_map[selected_hero_id])
            else:
                inspector_name.text = "LOADING UNIT..."
    else:        # MOVE OR SWAP
        if gy < ENEMY_ROWS:
            inspector_name.text = "FORBIDDEN"
            inspector_details.text = "[color=red]Commander, we cannot deploy units in enemy territory.[/color]"
            selected_hero_id = -1
        else:
            if hero_at_slot == -1:
                # 1. MOVE TO EMPTY
                var old_key = _find_hero_pos(selected_hero_id)
                grid_slots.erase(old_key)
                grid_slots[key] = selected_hero_id
                
                # Server Sync (Single Unit)
                _sync_move(selected_hero_id, gx, gy)
            else:
                # 2. SWAP (Two units involved)
                var old_key = _find_hero_pos(selected_hero_id)
                var old_pos = old_key.split(",")
                var old_gx = int(old_pos[0])
                var old_gy = int(old_pos[1])
                
                # Update Local State
                grid_slots[old_key] = hero_at_slot
                grid_slots[key] = selected_hero_id
                
                # Server Sync (Two Units)
                _sync_move(selected_hero_id, gx, gy)
                _sync_move(hero_at_slot, old_gx, old_gy)
                
            selected_hero_id = -1
        
    tactical_grid.queue_redraw()

func _sync_move(hid: int, x: int, y: int):
    if GameState.current_user:
        ServerConnector.move_unit_position(GameState.current_user.id, current_preset_id, hid, x, y)

func _show_hero_details(hero):
    inspector_name.text = hero.name.to_upper()
    avatar_initial.text = hero.name[0].to_upper()
    var h_class = hero.get("combatClass", {}).get("name", "Unit")
    inspector_details.text = "[b]Class:[/b] %s | [b]Level:[/b] %d\n" % [h_class, int(hero.level)]

func _remove_hero_from_anywhere(hid):
    for k in grid_slots.keys():
        if int(grid_slots[k]) == int(hid):
            grid_slots.erase(k)
            return

func _find_hero_pos(hid):
    for k in grid_slots.keys():
        if int(grid_slots[k]) == int(hid): return k
    return ""

func _save_full():
    var slots = []
    for key in grid_slots:
        var pos = key.split(",")
        slots.push_back({
            "heroId": int(grid_slots[key]), 
            "gridX": int(pos[0]), 
            "gridY": int(pos[1])
        })
    if GameState.current_user:
        ServerConnector.update_formation(GameState.current_user.id, current_preset_id, slots)

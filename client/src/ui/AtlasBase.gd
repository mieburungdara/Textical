extends Control
class_name AtlasBase

@onready var pins_layer = $MapLayer/Pins if has_node("MapLayer/Pins") else null
@onready var landmarks_layer = $MapLayer/Landmarks if has_node("MapLayer/Landmarks") else null
@onready var player_marker = $MapLayer/PlayerMarker if has_node("MapLayer/PlayerMarker") else null
@onready var connections_layer = $MapLayer/Connections if has_node("MapLayer/Connections") else null
@onready var debug_grid = $MapLayer/DebugGrid if has_node("MapLayer/DebugGrid") else null
@onready var cam = $Camera2D if has_node("Camera2D") else null

var SHOW_DEBUG_GRID = true
var _active_connections = [] # Store paths to draw

func _spawn_map_elements():
    if not is_node_ready(): await ready
    
    # 1. Landmarks
    for child in landmarks_layer.get_children(): child.queue_free()
    for lm in GameState.FLAVOR_LANDMARKS:
        var l = Label.new()
        l.text = lm.name
        l.position = lm.pos
        l.add_theme_color_override("font_color", Color(0.4, 0.3, 0.2))
        l.add_theme_font_size_override("font_size", 32)
        l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        landmarks_layer.add_child(l)
    
    # 2. Setup Canvas Drawings
    if not connections_layer.draw.is_connected(_draw_connections):
        connections_layer.draw.connect(_draw_connections)
    if not debug_grid.draw.is_connected(_draw_debug_grid):
        debug_grid.draw.connect(_draw_debug_grid)
    
    debug_grid.queue_redraw()
    ServerConnector.fetch_all_regions()

func _draw_connections():
    for path in _active_connections:
        _draw_dashed_line(connections_layer, path.from, path.to, Color(0.4, 0.2, 0.1, 0.5), 4.0)

func _draw_debug_grid():
    if not SHOW_DEBUG_GRID: return
    var grid_size = 5000
    var step = 200
    var color = Color(0, 0, 0, 0.1)
    
    for i in range(0, grid_size + step, step):
        # Lines
        debug_grid.draw_line(Vector2(i, 0), Vector2(i, grid_size), color, 1.0)
        debug_grid.draw_line(Vector2(0, i), Vector2(grid_size, i), color, 1.0)
        
        # Major Labels every 1000
        if i % 1000 == 0:
            for j in range(0, grid_size + step, 1000):
                var label = "[%d,%d]" % [i, j]
                debug_grid.draw_string(ThemeDB.fallback_font, Vector2(i + 5, j + 25), label, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0, 0, 0, 0.4))

func _populate_pins(regions, click_callback: Callable):
    if pins_layer == null:
        print("AtlasBase: pins_layer is null, skipping _populate_pins")
        return
    for child in pins_layer.get_children(): child.queue_free()
    
    _active_connections.clear()
    
    for r in regions:
        # Skip if r is not a Dictionary or doesn't have 'id'
        if not r is Dictionary or not r.has("id"):
            continue
        var origin_id = int(r.id)
        var origin_pos = GameState.REGION_POSITIONS.get(origin_id, Vector2.ZERO)
        
        # Prepare connections for the draw signal
        var connections = r.get("connections")
        if connections is Array:
            for conn in connections:
                if conn is Dictionary:
                    var target_id = int(conn.get("targetRegionId", 0))
                    var target_pos = GameState.REGION_POSITIONS.get(target_id, Vector2.ZERO)
                    if origin_pos != Vector2.ZERO and target_pos != Vector2.ZERO:
                        _active_connections.append({"from": origin_pos, "to": target_pos})

        # Draw Pin
        var btn = Button.new()
        btn.text = str(r.get("name", "Unknown"))
        btn.position = origin_pos - Vector2(100, 30)
        btn.custom_minimum_size = Vector2(200, 60)
        btn.pressed.connect(click_callback.bind(r))
        pins_layer.add_child(btn)
    
    connections_layer.queue_redraw()

func _draw_dashed_line(canvas: Node2D, from: Vector2, to: Vector2, color: Color, width: float):
    const DASH_LEN = 15.0
    const GAP_LEN = 10.0
    const STEP = DASH_LEN + GAP_LEN

    if STEP <= 0: return

    var diff = to - from
    var length = diff.length()
    var direction = diff.normalized()
    var current_dist = 0.0

    while current_dist < length:
        var end_dist = min(current_dist + DASH_LEN, length)
        canvas.draw_line(from + direction * current_dist, from + direction * end_dist, color, width)
        current_dist += STEP

func _update_player_position(is_traveling: bool = false):
    if !GameState.current_user: return
    var rid_raw = GameState.current_user.get("currentRegion", 1)
    if is_traveling and GameState.active_task:
        rid_raw = GameState.active_task.get("originRegionId", rid_raw)
    
    var rid = int(str(rid_raw).to_float())
    player_marker.position = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))
    player_marker.show()

func _center_on_player():
    if GameState.current_user:
        var rid = int(str(GameState.current_user.get("currentRegion", 1)).to_float())
        cam.global_position = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))

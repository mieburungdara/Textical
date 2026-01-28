extends Control
class_name AtlasBase

@onready var pins_layer = $MapLayer/Pins
@onready var landmarks_layer = $MapLayer/Landmarks
@onready var player_marker = $MapLayer/PlayerMarker
@onready var connections_layer = $MapLayer/Connections
@onready var debug_grid = $MapLayer/DebugGrid
@onready var cam = $Camera2D

var SHOW_DEBUG_GRID = true

func _spawn_map_elements():
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
    # We rely on GameState data populated after ServerConnector call
    pass # Logic will be in _populate_pins

func _draw_debug_grid():
    if not SHOW_DEBUG_GRID: return
    var size = 5000
    var step = 200
    var color = Color(0, 0, 0, 0.1)
    
    for i in range(0, size + step, step):
        # Lines
        debug_grid.draw_line(Vector2(i, 0), Vector2(i, size), color, 1.0)
        debug_grid.draw_line(Vector2(0, i), Vector2(size, i), color, 1.0)
        
        # Major Labels every 1000
        if i % 1000 == 0:
            for j in range(0, size + step, 1000):
                var label = "[%d,%d]" % [i, j]
                debug_grid.draw_string(ThemeDB.fallback_font, Vector2(i + 5, j + 25), label, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0, 0, 0, 0.4))

func _populate_pins(regions, click_callback: Callable):
    for child in pins_layer.get_children(): child.queue_free()
    
    # Draw Paths between connected regions
    connections_layer.queue_redraw()
    
    # We will manually draw connections in this loop for efficiency
    for r in regions:
        var origin_id = int(r.id)
        var origin_pos = GameState.REGION_POSITIONS.get(origin_id, Vector2.ZERO)
        
        # Draw connections
        if r.has("connections"):
            for conn in r.connections:
                var target_id = int(conn.targetRegionId)
                var target_pos = GameState.REGION_POSITIONS.get(target_id, Vector2.ZERO)
                if origin_pos != Vector2.ZERO and target_pos != Vector2.ZERO:
                    _draw_dashed_line(connections_layer, origin_pos, target_pos, Color(0.4, 0.2, 0.1, 0.5), 4.0)

        # Draw Pin
        var btn = Button.new()
        btn.text = r.name
        btn.position = origin_pos - Vector2(100, 30)
        btn.custom_minimum_size = Vector2(200, 60)
        btn.pressed.connect(click_callback.bind(r))
        pins_layer.add_child(btn)

func _draw_dashed_line(canvas: Node2D, from: Vector2, to: Vector2, color: Color, width: float):
    var dash_length = 15.0
    var gap_length = 10.0
    var diff = to - from
    var length = diff.length()
    var direction = diff.normalized()
    var current_dist = 0.0
    
    while current_dist < length:
        var end_dist = min(current_dist + dash_length, length)
        canvas.draw_line(from + direction * current_dist, from + direction * end_dist, color, width)
        current_dist += dash_length + gap_length

extends Node2D
## MapGridLayer - Renders the world map grid from database regions
##
## Enhanced version with visual effects:
## - Gradient terrain colors
## - Animated grid lines
## - Region hover effects
## - Special landmark markers
## - Fog of war visualization
## - Compass indicator

# Grid configuration
const GRID_SIZE := 35  # 35x35 grid
const WORLD_SIZE := 5000.0  # 5000x5000 pixel world
const CELL_SIZE := WORLD_SIZE / GRID_SIZE  # ~142.85 pixels per cell

# Z-Index for layer ordering
@export var layer_z_index: int = -10  # Below pins but above background

# Animation
var time_elapsed := 0.0
var hovered_cell := Vector2i(-1, -1)
var selected_cell := Vector2i(-1, -1)

# Visual settings
var show_grid_lines := true
var show_coordinates := false
var show_hover := true

# Terrain color mapping with gradient support
const TERRAIN_COLORS := {
    "OCEAN": {"base": Color(0.15, 0.35, 0.75, 0.7), "highlight": Color(0.25, 0.45, 0.85, 0.8)},
    "FOREST": {"base": Color(0.2, 0.55, 0.25, 0.65), "highlight": Color(0.35, 0.7, 0.4, 0.75)},
    "DESERT": {"base": Color(0.85, 0.75, 0.4, 0.6), "highlight": Color(0.95, 0.85, 0.55, 0.7)},
    "MOUNTAIN": {"base": Color(0.45, 0.35, 0.25, 0.7), "highlight": Color(0.6, 0.5, 0.4, 0.8)},
    "SNOW": {"base": Color(0.85, 0.9, 0.95, 0.7), "highlight": Color(0.95, 0.98, 1.0, 0.8)},
    "VOLCANO": {"base": Color(0.55, 0.15, 0.1, 0.75), "highlight": Color(0.75, 0.3, 0.2, 0.85)},
    "RUINS": {"base": Color(0.35, 0.35, 0.4, 0.7), "highlight": Color(0.5, 0.5, 0.55, 0.8)},
    "TOWN": {"base": Color(0.65, 0.6, 0.45, 0.85), "highlight": Color(0.8, 0.75, 0.6, 0.9)},
    "LAKE": {"base": Color(0.25, 0.45, 0.8, 0.7), "highlight": Color(0.4, 0.6, 0.9, 0.8)},
    "PLAINS": {"base": Color(0.5, 0.7, 0.35, 0.6), "highlight": Color(0.65, 0.8, 0.5, 0.7)},
    "SWAMP": {"base": Color(0.3, 0.45, 0.25, 0.7), "highlight": Color(0.45, 0.6, 0.4, 0.8)},
    "VILLAGE": {"base": Color(0.65, 0.6, 0.45, 0.85), "highlight": Color(0.85, 0.8, 0.65, 0.95)},
    "CITADEL": {"base": Color(0.55, 0.55, 0.65, 0.85), "highlight": Color(0.75, 0.75, 0.85, 0.95)},
    "BOSS": {"base": Color(0.75, 0.1, 0.1, 0.9), "highlight": Color(0.95, 0.3, 0.3, 1.0)},
    "BRIDGE": {"base": Color(0.45, 0.35, 0.25, 0.75), "highlight": Color(0.6, 0.5, 0.4, 0.85)},
    "CHASM": {"base": Color(0.25, 0.15, 0.25, 0.75), "highlight": Color(0.4, 0.3, 0.4, 0.85)},
    "BLACK": {"base": Color(0.08, 0.08, 0.08, 0.85), "highlight": Color(0.2, 0.2, 0.2, 0.95)},
    "CASTLE": {"base": Color(0.5, 0.5, 0.6, 0.85), "highlight": Color(0.7, 0.7, 0.8, 0.95)},
    "DUNGEON": {"base": Color(0.3, 0.2, 0.35, 0.8), "highlight": Color(0.5, 0.4, 0.55, 0.9)},
}

# Zone type colors (fallback)
const ZONE_COLORS := {
    "WATER": {"base": Color(0.15, 0.35, 0.75, 0.7), "highlight": Color(0.25, 0.45, 0.85, 0.8)},
    "GREEN": {"base": Color(0.2, 0.55, 0.25, 0.65), "highlight": Color(0.35, 0.7, 0.4, 0.75)},
    "YELLOW": {"base": Color(0.85, 0.75, 0.4, 0.6), "highlight": Color(0.95, 0.85, 0.55, 0.7)},
    "RED": {"base": Color(0.75, 0.25, 0.25, 0.6), "highlight": Color(0.9, 0.4, 0.4, 0.7)},
    "BLUE": {"base": Color(0.25, 0.4, 0.75, 0.6), "highlight": Color(0.4, 0.55, 0.9, 0.7)},
    "NEUTRAL": {"base": Color(0.5, 0.5, 0.55, 0.7), "highlight": Color(0.65, 0.65, 0.7, 0.8)},
    "ROYAL": {"base": Color(0.6, 0.5, 0.7, 0.8), "highlight": Color(0.8, 0.7, 0.9, 0.9)},
}

# Parsed region data from database
var regions: Array = []
var region_by_id: Dictionary = {}
var region_by_grid: Dictionary = {}  # "x,y" -> region data

# Player position marker
var player_position: Vector2i = Vector2i(17, 17)  # Default center

func _ready() -> void:
    print("[MapGridLayer] Loading map data from server...")
    z_index = layer_z_index
    
    # Request regions from server via HTTP request
    var http_request = HTTPRequest.new()
    add_child(http_request)
    http_request.request_completed.connect(_on_http_request_completed)
    
    var server_url = "http://localhost:5000"
    if has_node("/root/ServerConnector"):
        var connector = get_node("/root/ServerConnector")
        var url = connector.get("server_url")
        if url != null:
            server_url = url
    
    var error = http_request.request(server_url + "/api/regions")
    if error != OK:
        push_error("[MapGridLayer] HTTP request failed!")
        _generate_fallback_grid()


func _process(delta: float) -> void:
    time_elapsed += delta
    queue_redraw()  # Animate effects


func _on_http_request_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
    print("[MapGridLayer] HTTP request completed: ", result, " ", response_code)
    
    if result != HTTPRequest.RESULT_SUCCESS or response_code != 200:
        push_error("[MapGridLayer] HTTP request failed with code: ", response_code)
        _generate_fallback_grid()
        return
    
    var json_string = body.get_string_from_utf8()
    var json = JSON.new()
    var parse_result = json.parse(json_string)
    
    if parse_result != OK:
        push_error("[MapGridLayer] JSON parse error!")
        _generate_fallback_grid()
        return
    
    var response = json.get_data()
    if response is Dictionary:
        regions = response.get("data", [])
        _parse_regions()
        queue_redraw()
        print("[MapGridLayer] Loaded %d regions" % regions.size())
    else:
        push_error("[MapGridLayer] Invalid response format")
        _generate_fallback_grid()


func _parse_regions() -> void:
    region_by_id.clear()
    region_by_grid.clear()
    
    for region: Dictionary in regions:
        var id = region.get("id", 0)
        var grid_x = region.get("gridX", region.get("grid_x", 0))
        var grid_y = region.get("gridY", region.get("grid_y", 0))
        
        region_by_id[id] = region
        region_by_grid["%d,%d" % [grid_x, grid_y]] = region
    
    print("[MapGridLayer] Parsed %d regions into lookup tables" % region_by_grid.size())


func _generate_fallback_grid() -> void:
    # Generate a visually interesting fallback grid
    var terrain_types = TERRAIN_COLORS.keys()
    
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            # Create varied terrain based on position
            var terrain = "FOREST"
            if y < 5:
                terrain = "OCEAN"
            elif y < 8:
                terrain = "PLAINS"
            elif x < 5:
                terrain = "MOUNTAIN"
            elif x > 28:
                terrain = "DESERT"
            elif (x + y) % 10 == 0:
                terrain = "VILLAGE"
            elif (x * y) % 25 == 0:
                terrain = "LAKE"
            
            region_by_grid["%d,%d" % [x, y]] = {
                "id": y * GRID_SIZE + x,
                "gridX": x,
                "gridY": y,
                "visualType": terrain,
                "zoneType": "GREEN",
                "name": "Region %d" % (y * GRID_SIZE + x)
            }
    queue_redraw()
    print("[MapGridLayer] Generated enhanced fallback grid")


func _draw() -> void:
    _draw_background_gradient()
    _draw_regions()
    _draw_grid_lines()
    _draw_special_markers()
    _draw_player_marker()
    _draw_hover_effect()
    _draw_compass()


func _draw_background_gradient() -> void:
    # Draw a subtle gradient background
    var bg_rect = Rect2(-CELL_SIZE, -CELL_SIZE, WORLD_SIZE + CELL_SIZE*2, WORLD_SIZE + CELL_SIZE*2)
    
    # Draw dark base
    draw_rect(bg_rect, Color(0.05, 0.05, 0.1, 1.0))
    
    # Add subtle vignette effect
    var center = Vector2(WORLD_SIZE/2, WORLD_SIZE/2)
    for i in range(10, 0, -1):
        var radius = WORLD_SIZE * 0.5 + i * 100
        var alpha = 0.03 * (10 - i)
        draw_circle(center, radius, Color(0.1, 0.1, 0.2, alpha))


func _draw_regions() -> void:
    for grid_key: String in region_by_grid.keys():
        var parts = grid_key.split(",")
        if parts.size() != 2:
            continue
        
        var grid_x = int(parts[0])
        var grid_y = int(parts[1])
        var region: Dictionary = region_by_grid[grid_key]
        
        var visual_type = region.get("visualType", region.get("zoneType", "FOREST"))
        var colors = TERRAIN_COLORS.get(visual_type, ZONE_COLORS.get(region.get("zoneType", "GREEN"), {"base": Color(0.5, 0.5, 0.5, 0.5), "highlight": Color(0.6, 0.6, 0.6, 0.6)}))
        
        var base_color = colors.get("base", Color(0.5, 0.5, 0.5, 0.5))
        
        # Calculate pixel position (flip Y for Godot coordinates)
        var pixel_x: float = grid_x * CELL_SIZE
        var pixel_y: float = (GRID_SIZE - 1 - grid_y) * CELL_SIZE
        
        var rect := Rect2(pixel_x, pixel_y, CELL_SIZE, CELL_SIZE)
        
        # Draw terrain with slight padding for grid effect
        var padded_rect = rect.grow(-2)
        draw_rect(padded_rect, base_color)
        
        # Add gradient effect based on position
        var gradient_factor = float(grid_x) / float(GRID_SIZE)
        var tinted_color = base_color.lightened(gradient_factor * 0.15)
        draw_rect(padded_rect, tinted_color)
        
        # Draw border
        var border_color = base_color.darkened(0.4)
        draw_rect(rect, border_color, false, 1.5)


func _draw_grid_lines() -> void:
    if not show_grid_lines:
        return
    
    var grid_color = Color(1, 1, 1, 0.08)
    
    # Vertical lines
    for x in range(GRID_SIZE + 1):
        var pixel_x = x * CELL_SIZE
        draw_line(
            Vector2(pixel_x, 0),
            Vector2(pixel_x, WORLD_SIZE),
            grid_color,
            1.0
        )
    
    # Horizontal lines
    for y in range(GRID_SIZE + 1):
        var pixel_y = y * CELL_SIZE
        draw_line(
            Vector2(0, pixel_y),
            Vector2(WORLD_SIZE, pixel_y),
            grid_color,
            1.0
        )


func _draw_special_markers() -> void:
    for region: Dictionary in regions:
        var visual_type = region.get("visualType", "")
        var grid_x = region.get("gridX", region.get("grid_x", 0))
        var grid_y = region.get("gridY", region.get("grid_y", 0))
        
        var pixel_x = grid_x * CELL_SIZE + CELL_SIZE / 2
        var pixel_y = (GRID_SIZE - 1 - grid_y) * CELL_SIZE + CELL_SIZE / 2
        var center = Vector2(pixel_x, pixel_y)
        
        # Different markers for different region types
        match visual_type:
            "VILLAGE", "TOWN":
                # House icon (triangle)
                _draw_village_marker(center)
            "CITADEL", "CASTLE":
                # Castle icon (fortress shape)
                _draw_citadel_marker(center)
            "BOSS", "DUNGEON":
                # Danger marker (skull)
                _draw_danger_marker(center)
            "MOUNTAIN":
                # Mountain peak
                _draw_mountain_marker(center)
            "LAKE":
                # Water drop
                _draw_water_marker(center)


func _draw_village_marker(center: Vector2) -> void:
    # Animated glow
    var glow_size = 12.0 + sin(time_elapsed * 2) * 2
    draw_circle(center, glow_size, Color(1, 0.9, 0.6, 0.3))
    draw_circle(center, glow_size - 3, Color(1, 0.9, 0.6, 0.5))
    
    # House shape
    var house_points = PackedVector2Array([
        center + Vector2(0, -10),
        center + Vector2(8, 2),
        center + Vector2(8, 10),
        center + Vector2(-8, 10),
        center + Vector2(-8, 2),
    ])
    draw_colored_polygon(house_points, Color(0.9, 0.75, 0.5, 0.9))
    draw_polyline(house_points, Color(0.6, 0.5, 0.3, 1), 1.5)


func _draw_citadel_marker(center: Vector2) -> void:
    # Strong animated glow
    var glow_size = 18.0 + sin(time_elapsed * 1.5) * 3
    draw_circle(center, glow_size, Color(0.7, 0.8, 1, 0.4))
    draw_circle(center, glow_size - 5, Color(0.8, 0.9, 1, 0.6))
    
    # Castle tower shape
    var tower_points = PackedVector2Array([
        center + Vector2(-10, 10),
        center + Vector2(-10, -5),
        center + Vector2(-7, -5),
        center + Vector2(-7, -10),
        center + Vector2(-3, -10),
        center + Vector2(-3, -5),
        center + Vector2(3, -5),
        center + Vector2(3, -10),
        center + Vector2(7, -10),
        center + Vector2(7, -5),
        center + Vector2(10, -5),
        center + Vector2(10, 10),
    ])
    draw_colored_polygon(tower_points, Color(0.6, 0.65, 0.8, 0.95))
    draw_polyline(tower_points, Color(0.4, 0.45, 0.6, 1), 2)


func _draw_danger_marker(center: Vector2) -> void:
    # Pulsing red glow
    var pulse = (sin(time_elapsed * 3) + 1) / 2  # 0 to 1
    var glow_size = 14.0 + pulse * 6
    var glow_color = Color(1, 0.2, 0.2, 0.4 + pulse * 0.3)
    draw_circle(center, glow_size, glow_color)
    
    # Skull shape (simplified)
    draw_circle(center, 8, Color(0.9, 0.9, 0.9, 0.95))
    # Eyes
    draw_circle(center + Vector2(-3, -2), 2.5, Color(0.2, 0.1, 0.1, 1))
    draw_circle(center + Vector2(3, -2), 2.5, Color(0.2, 0.1, 0.1, 1))


func _draw_mountain_marker(center: Vector2) -> void:
    # Mountain peak
    var peak_points = PackedVector2Array([
        center + Vector2(0, -12),
        center + Vector2(-10, 8),
        center + Vector2(10, 8),
    ])
    draw_colored_polygon(peak_points, Color(0.6, 0.55, 0.5, 0.9))
    # Snow cap
    var snow_points = PackedVector2Array([
        center + Vector2(0, -12),
        center + Vector2(-4, -6),
        center + Vector2(4, -6),
    ])
    draw_colored_polygon(snow_points, Color(0.95, 0.95, 1, 0.9))


func _draw_water_marker(center: Vector2) -> void:
    # Animated water ripple
    var ripple = sin(time_elapsed * 2) * 0.3 + 0.7
    draw_circle(center, 10 * ripple, Color(0.4, 0.6, 0.9, 0.5))
    draw_circle(center, 6 * ripple, Color(0.5, 0.7, 1, 0.7))


func _draw_player_marker() -> void:
    var pixel_x = player_position.x * CELL_SIZE + CELL_SIZE / 2
    var pixel_y = (GRID_SIZE - 1 - player_position.y) * CELL_SIZE + CELL_SIZE / 2
    var center = Vector2(pixel_x, pixel_y)
    
    # Player glow
    var glow_size = 20.0 + sin(time_elapsed * 4) * 4
    draw_circle(center, glow_size, Color(0.2, 0.9, 0.5, 0.3))
    
    # Player circle
    draw_circle(center, 12, Color(0.3, 0.8, 0.5, 0.8))
    draw_circle(center, 8, Color(0.5, 1, 0.7, 1))
    
    # Inner dot
    draw_circle(center, 4, Color(1, 1, 1, 1))
    
    # Direction indicator (arrow)
    var arrow_angle = time_elapsed * 0.5
    var arrow_start = center + Vector2(cos(arrow_angle), sin(arrow_angle)) * 14
    var arrow_end = center + Vector2(cos(arrow_angle), sin(arrow_angle)) * 22
    draw_line(arrow_start, arrow_end, Color(1, 1, 1, 0.8), 2)


func _draw_hover_effect() -> void:
    if not show_hover or hovered_cell.x < 0:
        return
    
    var pixel_x = hovered_cell.x * CELL_SIZE
    var pixel_y = (GRID_SIZE - 1 - hovered_cell.y) * CELL_SIZE
    var rect = Rect2(pixel_x, pixel_y, CELL_SIZE, CELL_SIZE)
    
    # Highlight effect
    var highlight_color = Color(1, 1, 0.5, 0.3 + sin(time_elapsed * 5) * 0.1)
    draw_rect(rect, highlight_color, true)
    
    # Border
    draw_rect(rect, Color(1, 1, 0.8, 0.8), false, 3)


func _draw_compass() -> void:
    # Draw compass in top-right corner
    var compass_pos = Vector2(WORLD_SIZE - 60, 60)
    var compass_size = 40.0
    
    # Compass background
    draw_circle(compass_pos, compass_size, Color(0.1, 0.1, 0.15, 0.8))
    draw_circle(compass_pos, compass_size - 2, Color(0.2, 0.2, 0.25, 0.9))
    
    # North indicator
    var north_color = Color(1, 0.3, 0.3, 1)
    var north_points = PackedVector2Array([
        compass_pos + Vector2(0, -25),
        compass_pos + Vector2(-5, -10),
        compass_pos + Vector2(5, -10),
    ])
    draw_colored_polygon(north_points, north_color)
    
    # South indicator
    var south_color = Color(0.8, 0.8, 0.8, 1)
    var south_points = PackedVector2Array([
        compass_pos + Vector2(0, 25),
        compass_pos + Vector2(-5, 10),
        compass_pos + Vector2(5, 10),
    ])
    draw_colored_polygon(south_points, south_color)
    
    # Labels
    # (Would need Font rendering, skipping for simplicity)


func set_hovered_cell(grid_pos: Vector2i) -> void:
    hovered_cell = grid_pos
    queue_redraw()


func set_selected_cell(grid_pos: Vector2i) -> void:
    selected_cell = grid_pos
    queue_redraw()


func set_player_position(grid_pos: Vector2i) -> void:
    player_position = grid_pos
    queue_redraw()


## Get region at specific world position
func get_region_at_position(world_pos: Vector2) -> Dictionary:
    var grid_x: int = int(world_pos.x / CELL_SIZE)
    var grid_y: int = int((WORLD_SIZE - world_pos.y) / CELL_SIZE)
    
    grid_x = clamp(grid_x, 0, GRID_SIZE - 1)
    grid_y = clamp(grid_y, 0, GRID_SIZE - 1)
    
    return region_by_grid.get("%d,%d" % [grid_x, grid_y], {})


func get_region_by_id(region_id: int) -> Dictionary:
    return region_by_id.get(region_id, {})


func get_traversal_at_position(world_pos: Vector2) -> String:
    var region = get_region_at_position(world_pos)
    return region.get("traversalType", "WALK")


func is_traversable(world_pos: Vector2, traversal_type: String = "WALK") -> bool:
    var region = get_region_at_position(world_pos)
    var required = region.get("traversalType", "WALK")
    
    match traversal_type:
        "FLY":
            return true
        "BOAT":
            return required in ["BOAT", "WALK", "BRIDGE"]
        "WALK":
            return required == "WALK"
    
    return false


func get_special_locations() -> Array:
    var locations: Array = []
    
    for region: Dictionary in regions:
        var visual_type = region.get("visualType", "")
        var grid_x = region.get("gridX", 0)
        var grid_y = region.get("gridY", 0)
        
        if visual_type in ["VILLAGE", "TOWN", "CITADEL", "CASTLE", "BOSS", "DUNGEON"]:
            locations.append({
                "id": region.get("id", 0),
                "name": region.get("name", "Unknown"),
                "visualType": visual_type,
                "grid_pos": Vector2i(grid_x, grid_y),
                "world_pos": Vector2(grid_x * CELL_SIZE + CELL_SIZE/2, (GRID_SIZE - 1 - grid_y) * CELL_SIZE + CELL_SIZE/2),
                "traversal": region.get("traversalType", "WALK"),
                "landmark": region.get("landmarkName", "")
            })
    
    return locations


func get_landmarks() -> Array:
    var landmarks: Array = []
    
    for region: Dictionary in regions:
        var landmark_name = region.get("landmarkName", "")
        if landmark_name and landmark_name != "":
            var grid_x = region.get("gridX", 0)
            var grid_y = region.get("gridY", 0)
            
            landmarks.append({
                "id": region.get("id", 0),
                "name": region.get("name", "Unknown"),
                "landmark": landmark_name,
                "grid_pos": Vector2i(grid_x, grid_y),
                "world_pos": Vector2(grid_x * CELL_SIZE + CELL_SIZE/2, (GRID_SIZE - 1 - grid_y) * CELL_SIZE + CELL_SIZE/2),
                "visualType": region.get("visualType", "FOREST"),
                "description": region.get("description", ""),
                "flavorText": region.get("flavorText", "")
            })
    
    return landmarks


func get_connections_from_region(region_id: int) -> Array:
    var region = get_region_by_id(region_id)
    if region.is_empty():
        return []
    
    var grid_x = region.get("gridX", 0)
    var grid_y = region.get("gridY", 0)
    
    var adjacent = [
        {"x": grid_x - 1, "y": grid_y},
        {"x": grid_x + 1, "y": grid_y},
        {"x": grid_x, "y": grid_y - 1},
        {"x": grid_x, "y": grid_y + 1}
    ]
    
    var connections = []
    for adj in adjacent:
        var key = "%d,%d" % [adj.x, adj.y]
        var neighbor = region_by_grid.get(key, {})
        if not neighbor.is_empty():
            connections.append({
                "target_id": neighbor.get("id", 0),
                "target_name": neighbor.get("name", "Unknown"),
                "grid_pos": Vector2i(adj.x, adj.y)
            })
    
    return connections

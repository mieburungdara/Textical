extends Control
## MapScreen - Standalone world map screen
##
## Pan/zoom implemented via MapContainer.position + MapContainer.scale.
## Camera2D is disabled to avoid double-transform coordinate issues.
## Features:
## - 35x35 grid world display
## - Pan with mouse drag (clamped to map bounds)
## - Zoom with scroll wheel (fast, smooth)
## - Click region for details
## - Travel to selected region

# References
@onready var map_container: Node2D = $MapContainer
@onready var camera: Camera2D = $MapContainer/Camera2D
@onready var info_panel: PanelContainer = $UI/InfoPanel
@onready var region_name_label: Label = $UI/InfoPanel/Margin/VBox/RegionName
@onready var region_type_label: Label = $UI/InfoPanel/Margin/VBox/RegionType
@onready var region_desc_label: RichTextLabel = $UI/InfoPanel/Margin/VBox/RegionDesc
@onready var travel_btn: Button = $UI/InfoPanel/Margin/VBox/TravelBtn
@onready var back_btn: Button = $UI/TopBar/HBox/BackBtn
@onready var http_request: HTTPRequest = $HTTPRequest
@onready var region_count_label: Label = $UI/StatsPanel/Margin/VBox/RegionCount

# Map settings
const WORLD_SIZE := 5000.0
const GRID_SIZE := 35
const CELL_SIZE := WORLD_SIZE / GRID_SIZE

# SideHUD width constant
const SIDEBAR_WIDTH := 160.0

# Camera/pan settings
var current_zoom := 0.5
var target_zoom := 0.5
var is_dragging := false
var drag_start := Vector2.ZERO
var camera_offset := Vector2.ZERO
var last_mouse_grid := Vector2i(-1, -1)
const MIN_ZOOM := 0.15
const MAX_ZOOM := 2.5
const ZOOM_FACTOR := 1.25  # 25% per scroll step (was 15%)

# Region data
var region_by_grid := {}  # "x,y" -> region data
var selected_region := {}

func _ready() -> void:
    # Disable Camera2D to prevent double-transform issues.
    # We use map_container.position + map_container.scale instead.
    camera.enabled = false

    # Connect signals
    back_btn.pressed.connect(_on_back_pressed)
    travel_btn.pressed.connect(_on_travel_pressed)
    http_request.request_completed.connect(_on_request_completed)

    # Connect button hover effects
    for btn in [back_btn, travel_btn]:
        btn.mouse_entered.connect(_on_btn_hover.bind(btn, true))
        btn.mouse_exited.connect(_on_btn_hover.bind(btn, false))

    # Setup initial info panel state
    info_panel.modulate.a = 0.0
    info_panel.visible = false

    set_process_input(true)

    # Fetch regions from server first
    _fetch_regions()
    
    # Connect window resize signal
    get_tree().root.size_changed.connect(_on_viewport_size_changed)

func _on_btn_hover(btn: Button, is_hover: bool) -> void:
    if btn.pivot_offset == Vector2.ZERO:
        btn.pivot_offset = btn.size / 2

    var tween = create_tween()
    tween.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
    if is_hover:
        tween.tween_property(btn, "scale", Vector2(1.05, 1.05), 0.2)
    else:
        tween.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.2)

# ── Camera & Coordinate Helpers ──────────────────────────────────────

## Convert screen position to world (MapContainer local) position.
func _screen_to_world(screen_pos: Vector2) -> Vector2:
    return (screen_pos - map_container.position) / current_zoom

## Convert world position back to screen position.
func _world_to_screen(world_pos: Vector2) -> Vector2:
    return world_pos * current_zoom + map_container.position

## Convert screen position to grid coordinate.
func _screen_to_grid(screen_pos: Vector2) -> Vector2i:
    var world_pos := _screen_to_world(screen_pos)

    # grid_x is straightforward
    var grid_x := int(floor(world_pos.x / CELL_SIZE))

    # grid_y is flipped: pixel_y = (GRID_SIZE-1-grid_y) * CELL_SIZE
    # so grid_y = GRID_SIZE - 1 - floor(pixel_y / CELL_SIZE)
    var grid_y := GRID_SIZE - 1 - int(floor(world_pos.y / CELL_SIZE))

    grid_x = clampi(grid_x, 0, GRID_SIZE - 1)
    grid_y = clampi(grid_y, 0, GRID_SIZE - 1)

    return Vector2i(grid_x, grid_y)

## Clamp camera_offset so the map never scrolls outside the visible area.
func _clamp_camera() -> void:
    var vp := get_viewport_rect().size
    var map_scaled := WORLD_SIZE * current_zoom

    # Horizontal: visible area starts at SIDEBAR_WIDTH
    var visible_w := vp.x - SIDEBAR_WIDTH
    if map_scaled >= visible_w:
        # Map is bigger – keep map edges within viewport
        var max_x := SIDEBAR_WIDTH          # left edge of map can't go further right
        var min_x := vp.x - map_scaled      # right edge of map can't go further left
        camera_offset.x = clamp(camera_offset.x, min_x, max_x)
    else:
        # Map is smaller – center it in the visible area
        camera_offset.x = SIDEBAR_WIDTH + (visible_w - map_scaled) / 2.0

    # Vertical
    if map_scaled >= vp.y:
        camera_offset.y = clamp(camera_offset.y, vp.y - map_scaled, 0.0)
    else:
        camera_offset.y = (vp.y - map_scaled) / 2.0

## Apply current camera_offset and zoom to the map container.
func _apply_camera() -> void:
    map_container.position = camera_offset
    map_container.scale = Vector2(current_zoom, current_zoom)

# ── Center on Player ─────────────────────────────────────────────────

func _center_on_player() -> void:
    var grid_x := 17  # Default center fallback
    var grid_y := 17
    var found_pos := false
    
    # Priority 1: Search for the player's region ID in the map data we just loaded
    if GameState.current_user and GameState.current_user.has("currentRegion"):
        var player_rid = int(GameState.current_user.currentRegion)
        for key in region_by_grid:
            var r = region_by_grid[key]
            if int(r.get("id", -1)) == player_rid:
                grid_x = r.get("gridX", r.get("grid_x", 17))
                grid_y = r.get("gridY", r.get("grid_y", 17))
                found_pos = true
                print("[MapScreen] Found player region %d in map data at (%d, %d)" % [player_rid, grid_x, grid_y])
                break
    
    # Priority 2: Use GameState.current_region_data if available and not found in map data
    if not found_pos and GameState.current_region_data:
        grid_x = GameState.current_region_data.get("gridX", GameState.current_region_data.get("grid_x", 17))
        grid_y = GameState.current_region_data.get("gridY", GameState.current_region_data.get("grid_y", 17))
        found_pos = true
        print("[MapScreen] Using GameState.current_region_data coordinates: (%d, %d)" % [grid_x, grid_y])

    # World position of the player's cell center
    var player_world_x := grid_x * CELL_SIZE + CELL_SIZE / 2.0
    var player_world_y := (GRID_SIZE - 1 - grid_y) * CELL_SIZE + CELL_SIZE / 2.0

    # Screen center of the visible map area (right of sidebar)
    var vp := get_viewport_rect().size
    var screen_center := Vector2(
        SIDEBAR_WIDTH + (vp.x - SIDEBAR_WIDTH) / 2.0,
        vp.y / 2.0
    )

    # camera_offset so that player_world maps to screen_center
    camera_offset = screen_center - Vector2(player_world_x, player_world_y) * current_zoom
    _clamp_camera()
    _apply_camera()

    # Sync player marker in grid layer
    if map_container.has_method("set_player_position"):
        map_container.set_player_position(Vector2i(grid_x, grid_y))

    if found_pos:
        print("[MapScreen] Centered on player region at grid (", grid_x, ",", grid_y, ")")
    else:
        print("[MapScreen] Player region pos not found, centered on default (17,17)")

func _on_viewport_size_changed() -> void:
    _center_on_player()

# ── Data Loading ─────────────────────────────────────────────────────

func _fetch_regions() -> void:
    var cached := GameState.load_regions_from_cache()
    if not cached.is_empty():
        print("[MapScreen] Loaded regions from cache file:", cached.size())
        _parse_regions(cached)
        map_container.queue_redraw()
        return
    _fetch_from_server()

func _fetch_from_server() -> void:
    var server_url := "http://localhost:5000"
    if has_node("/root/ServerConnector"):
        var connector := get_node("/root/ServerConnector")
        var url = connector.get("server_url")
        if url != null:
            server_url = url

    var error := http_request.request(server_url + "/api/regions")
    if error != OK:
        push_error("[MapScreen] HTTP request failed, using fallback")
        _generate_fallback_grid()

func _on_request_completed(_result: int, _response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
    if _result != HTTPRequest.RESULT_SUCCESS:
        push_error("[MapScreen] Request failed: " + str(_result))
        _generate_fallback_grid()
        return

    var parse_result = JSON.parse_string(body.get_string_from_utf8())
    if parse_result == null:
        push_error("[MapScreen] Failed to parse JSON")
        _generate_fallback_grid()
        return

    var regions_data = parse_result
    if parse_result is Dictionary and parse_result.has("data"):
        regions_data = parse_result["data"]

    if regions_data is Array:
        _parse_regions(regions_data)
        map_container.queue_redraw()
        print("[MapScreen] Loaded %d regions" % regions_data.size())
    else:
        push_error("[MapScreen] Invalid regions data format")
        _generate_fallback_grid()

func _parse_regions(regions: Array) -> void:
    region_by_grid.clear()

    for region: Dictionary in regions:
        var grid_x: int = region.get("gridX", region.get("grid_x", 0))
        var grid_y: int = region.get("gridY", region.get("grid_y", 0))
        region_by_grid["%d,%d" % [grid_x, grid_y]] = region

    print("[MapScreen] Parsed %d regions" % region_by_grid.size())

    var new_version := GameState.get_cached_regions_version() + 1
    GameState.save_regions_to_cache(regions, new_version)

    if region_count_label:
        region_count_label.text = "Regions: %d / %d" % [region_by_grid.size(), GRID_SIZE * GRID_SIZE]

    _center_on_player()

func _generate_fallback_grid() -> void:
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            region_by_grid["%d,%d" % [x, y]] = {
                "id": y * GRID_SIZE + x,
                "gridX": x,
                "gridY": y,
                "visualType": "FOREST",
                "name": "Region %d" % (y * GRID_SIZE + x)
            }
    map_container.queue_redraw()
    print("[MapScreen] Generated fallback grid")

    if region_count_label:
        region_count_label.text = "Regions: %d / %d (Demo)" % [region_by_grid.size(), GRID_SIZE * GRID_SIZE]

    _center_on_player()

# ── Input Handling ───────────────────────────────────────────────────

func _input(event: InputEvent) -> void:
    # Hover
    if event is InputEventMouseMotion:
        var grid_pos := _screen_to_grid(event.position)
        if event.position.x < SIDEBAR_WIDTH:
            grid_pos = Vector2i(-1, -1)

        if grid_pos != last_mouse_grid:
            last_mouse_grid = grid_pos
            if map_container.has_method("set_hovered_cell"):
                map_container.set_hovered_cell(grid_pos)

    # Mouse buttons (pan / zoom)
    if event is InputEventMouseButton:
        if event.pressed and event.position.x < SIDEBAR_WIDTH:
            return # Ignore clicks over SideHUD

        if event.button_index == MOUSE_BUTTON_LEFT:
            is_dragging = event.pressed
            if event.pressed:
                drag_start = event.position - camera_offset
        elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
            _zoom_toward(event.position, ZOOM_FACTOR)
        elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
            _zoom_toward(event.position, 1.0 / ZOOM_FACTOR)

    # Dragging
    if event is InputEventMouseMotion and is_dragging:
        camera_offset = event.position - drag_start
        _clamp_camera()
        _apply_camera()

    # ESC
    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        _on_back_pressed()

    # Click to select
    if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed:
        if event.position.x >= SIDEBAR_WIDTH:
            _handle_region_click(event.position)

## Zoom toward a specific screen point (keeps the point under the cursor).
func _zoom_toward(screen_pos: Vector2, factor: float) -> void:
    var new_zoom: float = clamp(current_zoom * factor, MIN_ZOOM, MAX_ZOOM)
    if new_zoom == current_zoom:
        return

    # Keep the world point under the cursor stationary
    # world_pt = (screen_pos - offset) / zoom  (before)
    # world_pt = (screen_pos - new_offset) / new_zoom  (after)
    # → new_offset = screen_pos - world_pt * new_zoom
    var world_pt := _screen_to_world(screen_pos)
    current_zoom = new_zoom
    target_zoom = new_zoom
    camera_offset = screen_pos - world_pt * current_zoom
    _clamp_camera()
    _apply_camera()

func _handle_region_click(screen_pos: Vector2) -> void:
    var grid_pos := _screen_to_grid(screen_pos)

    var key := "%d,%d" % [grid_pos.x, grid_pos.y]
    if region_by_grid.has(key):
        selected_region = region_by_grid[key]
        _show_region_info(selected_region)
        if map_container.has_method("set_selected_cell"):
            map_container.set_selected_cell(grid_pos)
    else:
        _hide_region_info()

# ── Info Panel ───────────────────────────────────────────────────────

func _show_region_info(region: Dictionary) -> void:
    if not info_panel.visible or info_panel.modulate.a == 0.0:
        info_panel.visible = true
        info_panel.modulate.a = 0.0
        info_panel.position.x += 50
        var tween := create_tween()
        tween.set_parallel(true)
        tween.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
        tween.tween_property(info_panel, "modulate:a", 1.0, 0.4)
        tween.tween_property(info_panel, "position:x", info_panel.position.x - 50, 0.4)

    region_name_label.text = region.get("name", "Unknown").to_upper()
    region_type_label.text = "Type: " + region.get("visualType", region.get("zoneType", "UNKNOWN"))

    var region_icon := get_node_or_null("UI/InfoPanel/Margin/VBox/RegionIcon")
    if region_icon:
        region_icon.text = _get_region_icon(region.get("visualType", ""))

    var zone_label := get_node_or_null("UI/InfoPanel/Margin/VBox/RegionZone")
    if zone_label:
        var zone_type: String = region.get("zoneType", "")
        var danger: int = region.get("dangerLevel", 0)
        var zone_text: String = "Zone: " + zone_type if zone_type else ""
        if danger > 0:
            zone_text += " | Danger: " + str(danger)
        zone_label.text = zone_text

    region_desc_label.text = region.get("description", region.get("flavorText", "No description available."))

func _get_region_icon(visual_type: String) -> String:
    match visual_type:
        "VILLAGE", "TOWN":
            return "🏘️"
        "CITADEL", "CASTLE":
            return "🏰"
        "FOREST":
            return "🌲"
        "MOUNTAIN":
            return "⛰️"
        "OCEAN", "LAKE":
            return "🌊"
        "DESERT":
            return "🏜️"
        "SNOW":
            return "❄️"
        "VOLCANO":
            return "🌋"
        "RUINS":
            return "🏛️"
        "BOSS", "DUNGEON":
            return "💀"
        "PLAINS":
            return "🌾"
        "SWAMP":
            return "🐊"
        "BRIDGE":
            return "🌉"
        "CHASM":
            return "🕳️"
        "BLACK":
            return "⚫"
        _:
            return "🗺️"

func _hide_region_info() -> void:
    if not info_panel.visible or info_panel.modulate.a == 0.0:
        selected_region = {}
        return

    var tween := create_tween()
    tween.set_parallel(true)
    tween.set_ease(Tween.EASE_IN).set_trans(Tween.TRANS_SINE)
    tween.tween_property(info_panel, "modulate:a", 0.0, 0.2)
    tween.tween_property(info_panel, "position:x", info_panel.position.x + 50, 0.2)
    tween.chain().tween_callback(func():
        info_panel.visible = false
        info_panel.position.x -= 50
    )
    selected_region = {}

# ── Process (smooth zoom) ───────────────────────────────────────────

func _process(_delta: float) -> void:
    # Smooth zoom interpolation is no longer needed because _zoom_toward
    # applies zoom instantly. We keep _process only for future animations.
    pass

# ── Navigation ───────────────────────────────────────────────────────

func _on_back_pressed() -> void:
    get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")

func _on_travel_pressed() -> void:
    if selected_region.is_empty():
        return

    var region_id = selected_region.get("id")
    if region_id == null:
        return

    print("[MapScreen] Travel to region: " + str(region_id))

    if not GameState.current_user or GameState.current_heroes.size() == 0:
        push_warning("[MapScreen] No heroes available for travel")
        return

    if has_node("/root/ServerConnector"):
        var connector := get_node("/root/ServerConnector")
        var uid = GameState.current_user.get("id")
        var hid = GameState.current_heroes[0].get("id")
        if uid and hid:
            connector.travel_to_region(int(uid), int(hid), int(region_id))
            print("[MapScreen] Initiating travel to region ", region_id)

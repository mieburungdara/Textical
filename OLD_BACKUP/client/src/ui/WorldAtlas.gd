extends AtlasBase

@onready var travel_system = $MapLayer/PathGroup
@onready var ui_panel = $UI/InfoPanel
@onready var treasure_layer = $MapLayer/TreasureMarkers if has_node("MapLayer/TreasureMarkers") else null

# Treasure Map state
var _treasure_handler: Node = null
var _active_treasure_maps: Array = []
var _is_digging: bool = false
var _dig_progress: float = 0.0
var _current_dig_map_id: int = 0

# Dig UI
var _dig_button: Button = null
var _dig_progress_bar: ProgressBar = null

## Setup as overlay logic
func setup_as_overlay(_data: Dictionary = {}):
    # Sembunyikan HUD internal saja, biarkan InfoPanel tetap bisa muncul
    if has_node("UI/TopHUD"): $UI/TopHUD.visible = false
    if has_node("UI/TaskListHUD"): $UI/TaskListHUD.visible = false
    
    # Map HARUS full screen (x=0), tidak boleh ada offset di root
    self.offset_left = 0
    
    # Tapi InfoPanel (UI interaksi) harus tergeser agar tidak tertutup sidebar
    if has_node("UI/InfoPanel"):
        $UI/InfoPanel.offset_left = 160
    
    # Ensure map content is properly centered
    _center_on_player()
    
    # Setup treasure handler
    _setup_treasure_handler()
    _fetch_active_treasure_maps()

func _ready():
    # 1. Component Signal Connections
    travel_system.camera = cam
    ui_panel.action_requested.connect(_on_action_requested)
    ui_panel.close_requested.connect(_on_close_panel_requested)
    travel_system.travel_finished.connect(_on_travel_finished)
    ServerConnector.task_completed.connect(_on_task_completed)
    ServerConnector.request_completed.connect(_on_request_completed)
    
    # Cache references
    _spawn_map_elements()
    var is_busy = GameState.active_task and GameState.active_task.type == "TRAVEL"
    _update_player_position(is_busy)
    
    if is_busy:
        player_marker.hide()
        travel_system.start_cinematic(GameState.active_task)
    else:
        _center_on_player()
    
    ui_panel.hide()
    travel_system.hide()

func _on_request_completed(endpoint, data):
    print("[WorldAtlas] _on_request_completed called")
    print("[WorldAtlas] endpoint:", endpoint)
    print("[WorldAtlas] data type:", typeof(data))
    print("[WorldAtlas] data:", data)
    
    if endpoint.contains("/regions"): 
        if data is Array:
            print("[WorldAtlas] Regions data is Array with", data.size(), "items")
            _populate_pins(data, ui_panel.display_region)
        elif data is Dictionary and data.has("regions"):
            print("[WorldAtlas] Regions data is Dictionary, extracting 'regions' key")
            _populate_pins(data.regions, ui_panel.display_region)
        elif data is Dictionary and data.has("data"):
            print("[WorldAtlas] Regions data is Dictionary, extracting 'data' key")
            var regions_data = data.get("data")
            if regions_data is Array:
                print("[WorldAtlas] Found", regions_data.size(), "regions")
                _populate_pins(regions_data, ui_panel.display_region)
            else:
                print("[WorldAtlas] ERROR: 'data' key is not Array:", typeof(regions_data))
        else:
            print("[WorldAtlas] ERROR: Unknown data format for regions")
            push_error("[WorldAtlas] Unknown regions data format: " + str(data))
    elif endpoint.contains("/action/travel"): 
        # [BUGFIX] Unwrap response wrapper standard (success, message, data)
        var travel_data = data
        if data is Dictionary and data.has("data"):
            if data.get("success", true) == false:
                # Handle Server Error logic (e.g. Not enough energy)
                push_error("[WorldAtlas] Travel Request Failed: " + str(data.get("message", "Unknown")))
                ui_panel.start_btn.disabled = false
                return
            travel_data = data.get("data")
            
        print("[WorldAtlas] Starting Cinematic with Task Data: ", travel_data)
        player_marker.hide()
        travel_system.start_cinematic(travel_data)

func _on_action_requested(rid):
    if rid == int(str(GameState.current_user.currentRegion).to_float()):
        _route_to(DataManager.get_region(rid).get("type", "TOWN"))
    else:
        ui_panel.start_btn.disabled = true
        ServerConnector.travel(GameState.current_user.id, rid)

func _on_travel_finished(tid, t_type):
    GameState.set_active_task(null)
    if GameState.current_user:
        GameState.current_user.currentRegion = tid
        # Update shared state for HUD navigation
        GameState.current_region_data = DataManager.get_region(tid)
        _update_player_position(false)
    
    # Close overlay before routing to new scene
    if UIManager.is_overlay_open("World"):
        UIManager.close_overlay("World")
        
    _route_to(t_type)

func _route_to(r_type):
    get_tree().change_scene_to_file(GameState.get_region_scene(r_type))

func _on_task_completed(d):
    if d.type == "TRAVEL": 
        _on_travel_finished(int(d.targetRegionId), d.targetRegionType)

func _on_close_panel_requested():
    if UIManager.is_overlay_open("World"):
        UIManager.close_overlay("World")
    else:
        ui_panel.hide()

func _exit_tree():
    # Signal Cleanup penting untuk mencegah memory leak dan ghost calls
    if ServerConnector.request_completed.is_connected(_on_request_completed):
        ServerConnector.request_completed.disconnect(_on_request_completed)
    if ServerConnector.task_completed.is_connected(_on_task_completed):
        ServerConnector.task_completed.disconnect(_on_task_completed)
    
    # Cleanup treasure handler signals
    if _treasure_handler:
        if _treasure_handler.has_signal("dig_started"):
            if _treasure_handler.dig_started.is_connected(_on_dig_started):
                _treasure_handler.dig_started.disconnect(_on_dig_started)
        if _treasure_handler.has_signal("treasure_claimed"):
            if _treasure_handler.treasure_claimed.is_connected(_on_treasure_claimed):
                _treasure_handler.treasure_claimed.disconnect(_on_treasure_claimed)

# === TREASURE MAP FUNCTIONS ===

func _setup_treasure_handler():
    if has_node("/root/TreasureMapHandler"):
        _treasure_handler = get_node("/root/TreasureMapHandler")
    else:
        _treasure_handler = preload("res://src/network/TreasureMapHandler.gd").new()
        _treasure_handler.name = "TreasureMapHandler"
        get_tree().root.add_child(_treasure_handler)
    
    # Connect signals
    if _treasure_handler and _treasure_handler.has_signal("dig_started"):
        _treasure_handler.dig_started.connect(_on_dig_started)
        _treasure_handler.treasure_claimed.connect(_on_treasure_claimed)

func _fetch_active_treasure_maps():
    if _treasure_handler:
        _treasure_handler.get_active_maps()

func _on_treasure_maps_received(maps: Array):
    _active_treasure_maps = maps
    _update_treasure_markers()
    _check_dig_eligibility()

func _update_treasure_markers():
    if not treasure_layer: return
    
    # Clear existing markers
    for child in treasure_layer.get_children():
        child.queue_free()
    
    # Add markers for each active treasure map
    for map_data in _active_treasure_maps:
        if map_data.get("isUsed", false) and not map_data.get("isClaimed", false):
            var region_id = map_data.get("regionId", 0)
            var coords_x = map_data.get("coordinatesX", 0)
            var coords_y = map_data.get("coordinatesY", 0)
            var rarity = map_data.get("rarity", "COMMON")
            
            # Get position from region or coordinates
            var pos = Vector2.ZERO
            if region_id > 0:
                pos = GameState.REGION_POSITIONS.get(region_id, Vector2.ZERO)
            else:
                pos = Vector2(coords_x * 256, coords_y * 256)
            
            # Create marker
            var marker = _create_treasure_marker(pos, rarity, map_data)
            treasure_layer.add_child(marker)

func _create_treasure_marker(pos: Vector2, rarity: String, map_data: Dictionary) -> Control:
    var container = Control.new()
    container.position = pos - Vector2(30, 60)
    container.custom_minimum_size = Vector2(60, 60)
    
    # Choose emoji based on rarity
    var emoji = "💰"
    match rarity:
        "LEGENDARY": emoji = "👑"
        "RARE": emoji = "💎"
        "UNCOMMON": emoji = "💵"
        _: emoji = "💰"
    
    var label = Label.new()
    label.text = emoji
    label.add_theme_font_size_override("font_size", 40)
    label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    container.add_child(label)
    
    # Add glow effect based on rarity
    var glow = Panel.new()
    var glow_style = StyleBoxFlat.new()
    var color = _get_rarity_color(rarity)
    glow_style.bg_color = color
    glow_style.bg_color.a = 0.3
    glow_style.corner_radius_top_left = 30
    glow_style.corner_radius_top_right = 30
    glow_style.corner_radius_bottom_right = 30
    glow_style.corner_radius_bottom_left = 30
    glow.add_theme_stylebox_override("panel", glow_style)
    glow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    glow.position = Vector2(-10, -10)
    glow.custom_minimum_size = Vector2(80, 80)
    container.add_child(glow)
    container.move_child(glow, 0)
    
    return container

func _get_rarity_color(rarity: String) -> Color:
    match rarity:
        "LEGENDARY": return Color(1.0, 0.6, 0.1)
        "RARE": return Color(0.2, 0.5, 0.9)
        "UNCOMMON": return Color(0.2, 0.8, 0.2)
        _: return Color(0.7, 0.7, 0.7)

func _check_dig_eligibility():
    # Check if player is at a treasure location
    if not GameState.current_user: return
    
    var current_region = int(str(GameState.current_user.get("currentRegion", 0)).to_float())
    
    for map_data in _active_treasure_maps:
        if not map_data.get("isUsed", false) or map_data.get("isClaimed", false):
            continue
        
        var target_region = map_data.get("regionId", 0)
        var coords_x = map_data.get("coordinatesX", 0)
        var coords_y = map_data.get("coordinatesY", 0)
        var offset_x = map_data.get("coordOffsetX", 0)
        var offset_y = map_data.get("coordOffsetY", 0)
        
        # Check if player is at the right location
        # For region-based maps, check region
        # For coordinate-based maps, check coordinates with offset
        var can_dig = false
        
        if target_region > 0 and current_region == target_region:
            can_dig = true
        elif coords_x > 0 or coords_y > 0:
            # Check if current region is within the offset range
            var base_region = map_data.get("baseRegionId", target_region)
            if current_region == base_region or current_region == target_region:
                can_dig = true
        
        if can_dig:
            _show_dig_button(map_data)
            return
    
    # Not at treasure location - hide dig button
    _hide_dig_button()

func _show_dig_button(map_data: Dictionary):
    if not ui_panel: return
    
    # Create dig button if not exists
    if not _dig_button:
        _create_dig_ui()
    
    _dig_button.visible = true
    _dig_button.disabled = false
    _dig_button.text = "DIG FOR TREASURE"
    _dig_button.tooltip_text = "Dig for hidden treasure! (3 second channel)"
    
    # Store current map id
    _current_dig_map_id = map_data.get("id", 0)

func _hide_dig_button():
    if _dig_button:
        _dig_button.visible = false
    if _dig_progress_bar:
        _dig_progress_bar.visible = false
    _is_digging = false
    _dig_progress = 0.0

func _create_dig_ui():
    if not ui_panel: return
    
    # Get the actions container from the panel
    var actions_vbox = ui_panel.get_node("Actions") if ui_panel.has_node("Actions") else null
    if not actions_vbox: return
    
    # Create dig button
    _dig_button = Button.new()
    _dig_button.name = "DigButton"
    _dig_button.custom_minimum_size = Vector2(0, 50)
    _dig_button.text = "DIG FOR TREASURE"
    _dig_button.pressed.connect(_on_dig_pressed)
    
    # Style the button
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0.8, 0.6, 0.1, 1)
    style.border_width_left = 2
    style.border_width_top = 2
    style.border_width_right = 2
    style.border_width_bottom = 2
    style.border_color = Color(1, 0.9, 0.5, 0.5)
    style.corner_radius_top_left = 8
    style.corner_radius_top_right = 8
    style.corner_radius_bottom_right = 8
    style.corner_radius_bottom_left = 8
    _dig_button.add_theme_stylebox_override("normal", style)
    _dig_button.add_theme_color_override("font_color", Color(1, 1, 1))
    
    actions_vbox.add_child(_dig_button)
    
    # Create progress bar
    _dig_progress_bar = ProgressBar.new()
    _dig_progress_bar.name = "DigProgress"
    _dig_progress_bar.custom_minimum_size = Vector2(0, 20)
    _dig_progress_bar.visible = false
    
    var pg_style = StyleBoxFlat.new()
    pg_style.bg_color = Color(0.1, 0.1, 0.1, 0.8)
    pg_style.corner_radius_top_left = 4
    pg_style.corner_radius_top_right = 4
    pg_style.corner_radius_bottom_right = 4
    pg_style.corner_radius_bottom_left = 4
    _dig_progress_bar.add_theme_stylebox_override("background", pg_style)
    
    var pg_fill = StyleBoxFlat.new()
    pg_fill.bg_color = Color(0.8, 0.6, 0.1, 1)
    pg_fill.corner_radius_top_left = 4
    pg_fill.corner_radius_top_right = 4
    pg_fill.corner_radius_bottom_right = 4
    pg_fill.corner_radius_bottom_left = 4
    _dig_progress_bar.add_theme_stylebox_override("fill", pg_fill)
    _dig_progress_bar.show_percentage = false
    
    actions_vbox.add_child(_dig_progress_bar)

func _on_dig_pressed():
    if _is_digging or _current_dig_map_id == 0: return
    
    # Start digging
    if _treasure_handler:
        _treasure_handler.start_dig(_current_dig_map_id)
        
        _is_digging = true
        _dig_progress = 0.0
        _dig_button.disabled = true
        _dig_button.text = "DIGGING..."
        _dig_progress_bar.visible = true
        _dig_progress_bar.max_value = 3.0  # 3 seconds
        _dig_progress_bar.value = 0.0

func _process(delta):
    if _is_digging:
        _dig_progress += delta
        if _dig_progress_bar:
            _dig_progress_bar.value = _dig_progress
        
        if _dig_progress >= 3.0:
            # Dig complete - claim treasure
            _complete_dig()

func _complete_dig():
    if _treasure_handler and _current_dig_map_id > 0:
        # Get task ID if available
        var task_id = 0
        if GameState.active_task:
            task_id = GameState.active_task.get("id", 0)
        
        _treasure_handler.complete_dig(_current_dig_map_id, task_id)
    
    _is_digging = false
    _dig_progress = 0.0
    if _dig_button:
        _dig_button.disabled = false
        _dig_button.text = "DIG FOR TREASURE"
    if _dig_progress_bar:
        _dig_progress_bar.visible = false

func _on_dig_started(finishes_at: int):
    print("[WorldAtlas] Dig started, finishes at: ", finishes_at)
    # The process function handles the progress

func _on_treasure_claimed(loot: Dictionary, rewards: Dictionary):
    print("[WorldAtlas] Treasure claimed! Loot: ", loot, " Rewards: ", rewards)
    
    # Show celebration/notification
    _show_treasure_result(loot, rewards)
    
    # Refresh maps
    _fetch_active_treasure_maps()

func _show_treasure_result(loot: Dictionary, rewards: Dictionary):
    # Could show a modal or notification with the rewards
    var gold = rewards.get("gold", 0)
    var items = loot.get("items", [])
    
    var message = "You found " + str(gold) + " gold!"
    if items.size() > 0:
        message += "\nItems: "
        for item in items:
            message += item.get("name", "Unknown") + ", "
    
    print("[WorldAtlas] ", message)

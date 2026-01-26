extends Control

# NODES
@onready var cam = $Camera2D
@onready var pins_layer = $MapLayer/Pins
@onready var landmarks_layer = $MapLayer/Landmarks
@onready var player_marker = $MapLayer/PlayerMarker
@onready var info_panel = $UI/InfoPanel
@onready var start_btn = $UI/InfoPanel/Margin/VBox/HBox/StartBtn
@onready var close_btn = $UI/InfoPanel/Margin/VBox/HBox/CloseBtn

# UI ELEMENTS
@onready var name_label = $UI/InfoPanel/Margin/VBox/RegionName
@onready var lore_label = $UI/InfoPanel/Margin/VBox/LoreLabel
@onready var tips_label = $UI/InfoPanel/Margin/VBox/TipsLabel

# PATH NODES
@onready var path_group = $MapLayer/PathGroup
@onready var path_2d = $MapLayer/PathGroup/Path2D
@onready var line_2d = $MapLayer/PathGroup/Path2D/Line2D
@onready var follow_2d = $MapLayer/PathGroup/Path2D/PathFollow2D

# CAMERA VARS
var min_zoom = 0.1
var max_zoom = 3.0
var zoom_speed = 0.1
var target_zoom = 0.5 
var is_dragging = false

# STATE
var selected_region = null
var is_traveling = false
var _target_type = "TOWN"
var _local_progress = 0.0
var _travel_duration = 5.0 

func _ready():
    _setup_signals()
    _spawn_map_elements()
    _update_player_position()
    _center_on_player()
    
    info_panel.hide()
    path_group.hide()

func _setup_signals():
    close_btn.pressed.connect(func(): info_panel.hide())
    start_btn.pressed.connect(_on_start_journey)
    ServerConnector.request_completed.connect(_on_request_completed)
    # REMOVED: task_completed listener (We use local timer now)

func _spawn_map_elements():
    for child in landmarks_layer.get_children(): child.queue_free()
    for lm in GameState.FLAVOR_LANDMARKS:
        var l = Label.new()
        l.text = lm.name
        l.position = lm.pos
        l.add_theme_color_override("font_color", Color(0.4, 0.3, 0.2))
        l.add_theme_font_size_override("font_size", 32)
        l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        landmarks_layer.add_child(l)
    ServerConnector.fetch_all_regions()

func _update_player_position():
    if GameState.current_user:
        var rid_raw = GameState.current_user.get("currentRegion", 1)
        var rid = int(str(rid_raw).to_float())
        var pos = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))
        player_marker.position = pos
        player_marker.show()
        if !is_traveling: path_group.hide()

func _center_on_player():
    if GameState.current_user:
        var rid_raw = GameState.current_user.get("currentRegion", 1)
        var rid = int(str(rid_raw).to_float())
        var pos = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))
        cam.global_position = pos

func _process(delta):
    cam.zoom = cam.zoom.lerp(Vector2(target_zoom, target_zoom), 0.1)
    
    if is_traveling:
        # PURE LOCAL ANIMATION (Smoother than server sync)
        _local_progress += delta / _travel_duration
        var p = clamp(_local_progress, 0.0, 1.0)
        
        if path_2d.curve and path_2d.curve.get_baked_length() > 0:
            follow_2d.progress_ratio = p
            cam.global_position = cam.global_position.lerp(follow_2d.global_position, 0.1)
        
        if p >= 1.0:
            _complete_travel_locally()

func _unhandled_input(event):
    if is_traveling: return 
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_LEFT: is_dragging = event.pressed
        if event.button_index == MOUSE_BUTTON_WHEEL_UP: target_zoom = clamp(target_zoom + zoom_speed, min_zoom, max_zoom)
        if event.button_index == MOUSE_BUTTON_WHEEL_DOWN: target_zoom = clamp(target_zoom - zoom_speed, min_zoom, max_zoom)
    if event is InputEventMouseMotion and is_dragging:
        cam.global_position -= event.relative / cam.zoom

func _on_request_completed(endpoint, data):
    if endpoint.contains("/regions"):
        _populate_pins(data)
    elif endpoint.contains("/action/travel"):
        _start_cinematic_travel(data)

func _populate_pins(regions):
    for child in pins_layer.get_children(): child.queue_free()
    for r in regions:
        var btn = Button.new()
        btn.text = r.name
        btn.position = GameState.REGION_POSITIONS.get(int(r.id), Vector2(0,0)) - Vector2(100, 30)
        btn.custom_minimum_size = Vector2(200, 60)
        btn.pressed.connect(_on_pin_clicked.bind(r))
        pins_layer.add_child(btn)

func _on_pin_clicked(region):
    if is_traveling: return
    selected_region = region
    name_label.text = region.name
    var meta = JSON.parse_string(region.get("metadata", "{}"))
    if meta is Dictionary:
        lore_label.text = meta.get("lore", "Exploring this region...")
        var tips = meta.get("tips", ["Stay safe."])
        tips_label.text = "TIP: " + tips[0]
    info_panel.show()

func _on_start_journey():
    if !GameState.current_user or !selected_region: return
    start_btn.disabled = true
    ServerConnector.travel(GameState.current_user.id, selected_region.id)

func _start_cinematic_travel(task):
    var tr = task.get("targetRegion", {})
    _target_type = tr.get("type", "TOWN")
    
    var origin_val = task.get("originRegionId", 1)
    	var origin_rid = int(str(origin_val).to_float())
    	_target_id = int(str(task.get("targetRegionId", 1)).to_float())
    	
    	var start_pos = GameState.REGION_POSITIONS.get(origin_rid, Vector2(2500, 2500))
    	var end_pos = GameState.REGION_POSITIONS.get(_target_id, Vector2(2500, 2500))    
    var curve = Curve2D.new()
    curve.add_point(start_pos)
    curve.add_point(end_pos)
    path_2d.curve = curve
    
    line_2d.clear_points()
    line_2d.add_point(start_pos)
    line_2d.add_point(end_pos)
    
    player_marker.hide()
    path_group.show() 
    
    _local_progress = 0.0
    is_traveling = true
    info_panel.hide()
    GameState.set_active_task(task)

func _complete_travel_locally():
	is_traveling = false
	GameState.set_active_task(null)
	
	# BUG FIX: Visually snap player to new region immediately
	if GameState.current_user:
		var rid = int(str(_target_id).to_float()) # Use the target ID we saved
		# Update local GameState region too (Optimistic update)
		GameState.current_user.currentRegion = rid 
		_update_player_position()
	
	_route_by_type(_target_type)
func _route_by_type(r_type):
    if r_type == "TOWN": get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
    else: get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

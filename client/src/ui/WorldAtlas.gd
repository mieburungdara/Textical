extends Control

# NODES
@onready var cam = $Camera2D
@onready var pins_layer = $MapLayer/Pins
@onready var landmarks_layer = $MapLayer/Landmarks
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

func _ready():
	_setup_signals()
	_spawn_map_elements()
	_center_on_player()
	
	info_panel.hide()
	path_group.hide()

func _setup_signals():
	close_btn.pressed.connect(func(): info_panel.hide())
	start_btn.pressed.connect(_on_start_journey)
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.task_completed.connect(_on_task_completed)

func _spawn_map_elements():
	for lm in GameState.FLAVOR_LANDMARKS:
		var l = Label.new()
		l.text = lm.name
		l.position = lm.pos
		l.add_theme_color_override("font_color", Color(0.4, 0.3, 0.2))
		l.add_theme_font_size_override("font_size", 32)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		landmarks_layer.add_child(l)
	
	ServerConnector.fetch_all_regions()

func _center_on_player():
	if GameState.current_user:
		var rid_raw = GameState.current_user.get("currentRegion", 1)
		var rid = int(str(rid_raw).to_float())
		var pos = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))
		cam.global_position = pos

func _process(_delta):
	cam.zoom = cam.zoom.lerp(Vector2(target_zoom, target_zoom), 0.1)
	
	if is_traveling:
		var progress = _calculate_server_progress()
		follow_2d.progress_ratio = progress
		cam.global_position = cam.global_position.lerp(follow_2d.global_position, 0.1)

func _unhandled_input(event):
	# Using _unhandled_input to ensure we don't drag while clicking UI buttons
	if is_traveling: return 
	
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			is_dragging = event.pressed
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			target_zoom = clamp(target_zoom + zoom_speed, min_zoom, max_zoom)
		if event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			target_zoom = clamp(target_zoom - zoom_speed, min_zoom, max_zoom)

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
		btn.position = GameState.REGION_POSITIONS.get(int(r.id), Vector2(0,0))
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
	if !selected_region: return
	start_btn.disabled = true
	ServerConnector.travel(GameState.current_user.id, selected_region.id)

func _start_cinematic_travel(task):
	is_traveling = true
	info_panel.hide()
	path_group.show() 
	
	var origin_rid = int(str(task.get("originRegionId", 1)).to_float())
	var target_rid = int(str(task.get("targetRegionId", 1)).to_float())
	
	var start_pos = GameState.REGION_POSITIONS.get(origin_rid, Vector2(2500, 2500))
	var end_pos = GameState.REGION_POSITIONS.get(target_rid, Vector2(2500, 2500))
	
	var curve = Curve2D.new()
	curve.add_point(start_pos)
	curve.add_point(end_pos)
	path_2d.curve = curve
	
	line_2d.clear_points()
	line_2d.add_point(start_pos)
	line_2d.add_point(end_pos)
	
	GameState.set_active_task(task)

func _calculate_server_progress() -> float:
	var task = GameState.active_task
	if !task or task.get("status", "") != "RUNNING": return 1.0
	
	var finishes_at = task.get("finishesAt", "")
	var started_at = task.get("startedAt", "")
	if finishes_at == "" or started_at == "": return 0.0
	
	var finish_unix = Time.get_unix_time_from_datetime_string(finishes_at)
	var start_unix = Time.get_unix_time_from_datetime_string(started_at)
	var now_unix = Time.get_unix_time_from_system()
	
	var remaining = max(0, finish_unix - now_unix)
	var total = finish_unix - start_unix
	var p = (total - remaining) / total if total > 0 else 1.0
	return clamp(p, 0.0, 1.0)

func _on_task_completed(data):
	if data.type == "TRAVEL":
		GameState.set_active_task(null)
		GameState.current_user.currentRegion = data.targetRegionId
		_route_by_type(data.targetRegionType)

func _route_by_type(r_type):
	if r_type == "TOWN": get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
	else: get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
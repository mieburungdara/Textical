extends ProgressBaseScene

@onready var dest_name = find_child("DestName")
@onready var lore_label = find_child("LoreBox").get_child(0) if find_child("LoreBox") else null
@onready var tips_label = find_child("TipsBox").find_child("Text") if find_child("TipsBox") else null
@onready var next_tip_btn = find_child("NextTipBtn")

# CINEMATIC PATH NODES
@onready var path_node = find_child("Path2D")
@onready var line_node = find_child("Line2D")
@onready var follow_node = find_child("PathFollow2D")

var _target_id = -1
var _target_type = "TOWN"
var _tips = []
var _current_tip_idx = 0

func _setup_scene():
	if next_tip_btn: next_tip_btn.pressed.connect(_on_next_tip)
	
	var task = GameState.active_task
	if task and task.get("type") == "TRAVEL":
		# BUG FIX: Use safe float-to-int conversion
		var tid_val = task.get("targetRegionId", -1)
		_target_id = int(str(tid_val).to_float())
		
		var origin_val = task.get("originRegionId", 1)
		var origin_id = int(str(origin_val).to_float())
		
		_build_geographic_path(origin_id, _target_id)
		
		# Metadata Capture
		if task.has("targetRegion"):
			var tr = task.get("targetRegion", {})
			dest_name.text = tr.get("name", "Unknown Region")
			_target_type = tr.get("type", "TOWN")
			
			var meta_str = tr.get("metadata", "{}")
			var meta = JSON.parse_string(meta_str)
			if meta is Dictionary:
				if lore_label: lore_label.text = meta.get("lore", "")
				_tips = meta.get("tips", ["Stay alert."])
				_show_tip(0)
	else:
		_log("No travel task detected. Triggering recovery...")
		_force_sync()

func _build_geographic_path(start_id: int, end_id: int):
	if !path_node or !line_node: return
	
	var start_pos = GameState.REGION_POSITIONS.get(start_id, Vector2(360, 1000))
	var end_pos = GameState.REGION_POSITIONS.get(end_id, Vector2(360, 1000))
	
	var curve = Curve2D.new()
	curve.add_point(start_pos)
	
	var mid_point = (start_pos + end_pos) / 2
	mid_point.x += 50 
	curve.add_point(mid_point)
	curve.add_point(end_pos)
	
	path_node.curve = curve
	
	line_node.clear_points()
	var step = curve.get_baked_length() / 100.0
	for i in range(101):
		line_node.add_point(curve.sample_baked(i * step))

func _process(delta):
	super._process(delta)
	if follow_node and progress_bar:
		follow_node.progress_ratio = progress_bar.value / 100.0

func _show_tip(idx):
	if tips_label and _tips.size() > 0:
		tips_label.text = _tips[idx % _tips.size()]

func _on_next_tip():
	_current_tip_idx += 1
	_show_tip(_current_tip_idx)

func _on_timer_finished():
	GameState.set_active_task(null)
	_route_by_type(_target_type)

func _handle_task_completion(data):
	if data.type == "TRAVEL":
		_is_waiting_for_socket = false

func _handle_request_result(endpoint, data):
	if endpoint.contains("/user/"):
		var active_task_on_server = data.get("activeTask")
		if active_task_on_server == null:
			var metadata = data.get("currentRegionData", {})
			_route_by_type(metadata.get("type", "TOWN"))

func _route_by_type(r_type: String):
	if _is_changing_scene: return
	_is_changing_scene = true
	if r_type == "TOWN": get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
	else: get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
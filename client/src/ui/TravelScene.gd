extends ProgressBaseScene

@onready var dest_name = $VBoxContainer/DestName
@onready var lore_label = $VBoxContainer/LoreBox/Label
@onready var history_label = $VBoxContainer/InfoGrid/HistoryBox/Text
@onready var tips_label = $VBoxContainer/InfoGrid/TipsBox/Text
@onready var next_tip_btn = $VBoxContainer/InfoGrid/TipsBox/NextTipBtn

var _target_id = -1
var _target_type = "TOWN"
var _tips = []
var _current_tip_idx = 0

func _setup_scene():
	next_tip_btn.pressed.connect(_on_next_tip)
	
	var task = GameState.active_task
	if task and task.get("type") == "TRAVEL":
		_log("Incoming Task Metadata: " + str(task.get("targetRegion", "NONE")))
		_parse_region_data(task.get("targetRegion", {}))
		
		dest_name.text = str(_target_id) # Initial fallback
		if task.has("targetRegion"):
			dest_name.text = task.targetRegion.get("name", "Unknown")
			
		_log("Traveling to: " + dest_name.text + " (Type: " + _target_type + ")")
	else:
		_log("No travel task detected. Triggering recovery...")
		_force_sync()

func _parse_region_data(tr):
	if !tr or tr.is_empty(): 
		_log("ERROR: Region template is null or empty.")
		return
		
	_target_id = int(tr.get("id", -1))
	_target_type = tr.get("type", "TOWN")
	
	# Parse Lore/Tips/History from metadata JSON string
	var meta_str = tr.get("metadata", "{}")
	_log("Raw Metadata String: " + meta_str)
	
	var meta = JSON.parse_string(meta_str)
	if meta is Dictionary:
		lore_label.text = meta.get("lore", "No lore recorded.")
		history_label.text = meta.get("history", "History is lost.")
		_tips = meta.get("tips", ["Stay alert."])
		_show_tip(0)
	else:
		_log("ERROR: Metadata string failed to parse into Dictionary.")

func _show_tip(idx):
	if _tips.size() > 0:
		tips_label.text = _tips[idx % _tips.size()]

func _on_next_tip():
	_current_tip_idx += 1
	_show_tip(_current_tip_idx)

func _on_timer_finished():
	GameState.set_active_task(null)
	_route_by_type(_target_type)

func _handle_task_completion(data):
	if data.type == "TRAVEL":
		_log("Socket arrival. Metadata: " + str(data.get("targetRegion", "NONE")))
		# Update target type if provided in late packet
		if data.has("targetRegion"):
			_target_type = data.targetRegion.get("type", _target_type)
		_is_waiting_for_socket = false

func _handle_request_result(endpoint, data):
	if endpoint.contains("/user/"):
		var active_task_on_server = data.get("activeTask")
		if active_task_on_server == null:
			var metadata = data.get("currentRegionData", {})
			_route_by_type(metadata.get("type", "TOWN"))
		else:
			# Recovery during travel: re-parse region
			_log("Recovery sync found task. Re-parsing region...")
			_parse_region_data(active_task_on_server.get("targetRegion", {}))

func _route_by_type(r_type: String):
	if _is_changing_scene: return
	_is_changing_scene = true
	if r_type == "TOWN": get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
	else: get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
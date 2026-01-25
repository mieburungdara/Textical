extends Control

@onready var dest_label = $VBoxContainer/DestinationLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var debug_log = $DebugConsole

var _fallback_timer = 0.0
var _is_waiting_for_socket = false

func _ready():
	_log("Scene Loaded. Monitoring signals...")
	if !ServerConnector.task_completed.is_connected(_on_task_completed):
		ServerConnector.task_completed.connect(_on_task_completed)
	
	# Also listen for general requests in case we force sync
	if !ServerConnector.request_completed.is_connected(_on_request_completed):
		ServerConnector.request_completed.connect(_on_request_completed)
		
	_update_display()

func _log(msg: String):
	var time = Time.get_time_string_from_system()
	debug_log.append_text("[%s] %s\n" % [time, msg])
	print("[TRAVEL_DEBUG] ", msg)

func _process(delta):
	_update_timer()
	
	if _is_waiting_for_socket:
		_fallback_timer += delta
		if _fallback_timer > 3.0: # If 3 seconds pass after timer 0
			_log("Socket Timeout. Triggering Force Sync...")
			_force_sync()
			_is_waiting_for_socket = false

func _update_display():
	var task = GameState.active_task
	if task:
		_log("Active Task: " + str(task.type))
		dest_label.text = "TRAVELING TO REGION " + str(task.get("targetRegionId", "?"))
	else:
		_log("No task in state. Attempting recovery sync...")
		_force_sync()

func _update_timer():
	var task = GameState.active_task
	if !task or task.get("status", "") != "RUNNING": return
	
	var finishes_at = task.get("finishesAt", "")
	var started_at = task.get("startedAt", "")
	if finishes_at == "" or started_at == "": return
	
	var finish_unix = Time.get_unix_time_from_datetime_string(finishes_at)
	var start_unix = Time.get_unix_time_from_datetime_string(started_at)
	var now_unix = Time.get_unix_time_from_system()
	
	var remaining = max(0, finish_unix - now_unix)
	var total = finish_unix - start_unix
	
	if total > 0:
		progress_bar.value = ((total - remaining) / total) * 100
	
	if remaining <= 0 and !_is_waiting_for_socket:
		status_label.text = "Arriving..."
		_log("Timer at 0. Awaiting Server Confirmation...")
		_is_waiting_for_socket = true

func _on_task_completed(data):
	_log("SOCKET SIGNAL RECEIVED!")
	_process_arrival(data)

func _force_sync():
	_log("Syncing with server...")
	ServerConnector.fetch_profile(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	# If we are syncing and find that the user is already in a new region
	if endpoint.contains("/user/"):
		_log("Profile Synced. Current Region: " + str(data.currentRegion))
		if GameState.active_task == null or GameState.active_task.get("status") != "RUNNING":
			_log("No running task on server. Routing to Hub...")
			_route_by_type(data.get("region", {}).get("type", "TOWN"))

func _process_arrival(data):
	if data.type == "TRAVEL":
		_log("Arrival confirmed by Server.")
		GameState.current_user.currentRegion = data.targetRegionId
		GameState.set_active_task(null)
		_route_by_type(data.get("targetRegionType", "TOWN"))

func _route_by_type(r_type: String):
	if r_type == "TOWN":
		_log("Loading Town...")
		get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
	else:
		_log("Loading Wilderness...")
		get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
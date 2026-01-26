extends Control

@onready var dest_label = $VBoxContainer/DestinationLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var debug_log = $DebugConsole

var _fallback_timer = 0.0
var _is_waiting_for_socket = false
var _target_id = -1

func _ready():
    _log("Scene Loaded. Monitoring signals...")
    if !ServerConnector.task_completed.is_connected(_on_task_completed):
        ServerConnector.task_completed.connect(_on_task_completed)
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
        if _fallback_timer > 3.0: 
            _log("Socket Timeout (3s). Triggering Force Sync...")
            _fallback_timer = 0.0 
            _force_sync()

func _update_display():
	var task = GameState.active_task
	if task and task.get("type") == "TRAVEL":
		_target_id = int(task.get("targetRegionId", -1))
		_log("Active Task: TRAVEL to ID " + str(_target_id))
		dest_label.text = "TRAVELING TO REGION " + str(_target_id)
	elif task:
		_log("ERROR: Wrong task type in TravelScene: " + task.type)
		_force_sync() # Recover to correct scene
	else:
		_log("No task in state. Attempting recovery sync...")
		_force_sync()

func _update_timer():
	var task = GameState.active_task
	if !task or task.get("status", "") != "RUNNING" or task.get("type") != "TRAVEL": return    
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
        _log("Timer reached 0. Awaiting Server Confirmation...")
        _is_waiting_for_socket = true
        _fallback_timer = 0.0

func _force_sync():
    _log("Syncing Profile with Server...")
    if GameState.current_user:
        ServerConnector.fetch_profile(GameState.current_user.id)

func _on_task_completed(data):
    _log("SOCKET SIGNAL RECEIVED!")
    if data.type == "TRAVEL":
        _log("Journey Finished. Unlocking UI...")
        GameState.set_active_task(null)
        _route_by_type(data.get("targetRegionType", "TOWN"))

func _on_request_completed(endpoint, data):
    if endpoint.contains("/user/"):
        var current_reg = int(data.get("currentRegion", -1))
        var active_task_on_server = data.get("activeTask")
        
        _log("Sync Result -> Region ID: " + str(current_reg))
        
        # Reset waiting flag since we got a fresh state
        _is_waiting_for_socket = false
        
        if current_reg == _target_id or active_task_on_server == null:
            _log("Location Confirmed or Task Finished. Routing...")
            var region = data.get("region", {})
            _route_by_type(region.get("type", "TOWN"))
        else:
            _log("Server still reports task RUNNING. Waiting for next pulse...")

func _route_by_type(r_type: String):
    if r_type == "TOWN":
        _log("Transitioning to Town...")
        get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
    else:
        _log("Transitioning to Wilderness...")
        get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

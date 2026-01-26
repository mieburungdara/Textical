extends Control

@onready var dest_label = $VBoxContainer/DestinationLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var debug_log = $DebugConsole

var _fallback_timer = 0.0
var _is_waiting_for_socket = false
var _target_id = -1
var _is_changing_scene = false

func _ready():
    _log("Scene Loaded. Monitoring signals...")
    if !ServerConnector.task_completed.is_connected(_on_task_completed):
        ServerConnector.task_completed.connect(_on_task_completed)
    
    if !ServerConnector.task_started.is_connected(_on_task_started):
        ServerConnector.task_started.connect(_on_task_started)
        
    if !ServerConnector.request_completed.is_connected(_on_request_completed):
        ServerConnector.request_completed.connect(_on_request_completed)
        
    _update_display()

func _log(msg: String):
    var time = Time.get_time_string_from_system()
    debug_log.append_text("[%s] %s\n" % [time, msg])
    print("[TRAVEL_DEBUG] ", msg)

func _process(delta):
    if _is_changing_scene: return
    _update_timer()
    
    if _is_waiting_for_socket:
        _fallback_timer += delta
        if _fallback_timer > 3.0: 
            _log("Socket Timeout. Force Sync...")
            _fallback_timer = 0.0 
            _force_sync()

func _update_display():
    var task = GameState.active_task
    if task and task.get("type") == "TRAVEL":
        var tid = task.get("targetRegionId", -1)
        if tid == -1 and task.has("targetRegion"): tid = task.get("targetRegion", {}).get("id", -1)
            
        _target_id = int(tid)
        _log("Active Task: TRAVEL to ID " + str(_target_id))
        dest_label.text = "TRAVELING TO REGION " + str(_target_id)
        status_label.text = "On the Road..."
        _is_waiting_for_socket = false # Reset wait state for new leg
    else:
        _log("No travel task. Routing out...")
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
        _log("Timer 0. Waiting server confirmation...")
        _is_waiting_for_socket = true
        _fallback_timer = 0.0

func _on_task_started(data):
    if data.type == "TRAVEL":
        _log("NEXT TASK DETECTED! Starting next leg...")
        _update_display()

func _on_task_completed(data):
    if data.type == "TRAVEL":
        _log("Arrival confirmed.")
        # WAIT A MOMENT to see if a 'task_started' arrives immediately (Queue)
        await get_tree().create_timer(0.5).timeout
        
        # If GameState still has a running TRAVEL task, don't leave!
        if GameState.active_task and GameState.active_task.type == "TRAVEL" and GameState.active_task.status == "RUNNING":
            _log("Staying in TravelScene for next task.")
            return
        
        GameState.set_active_task(null)
        _route_by_type(data.get("targetRegionType", "TOWN"))

func _force_sync():
    if GameState.current_user:
        ServerConnector.fetch_profile(GameState.current_user.id)

func _on_request_completed(endpoint, data):
    if endpoint.contains("/user/"):
        var current_reg = int(data.get("currentRegion", -1))
        var active_task_on_server = data.get("activeTask")
        _log("Sync -> Region " + str(current_reg))
        _is_waiting_for_socket = false
        
        if active_task_on_server == null:
            _log("No task on server. Routing...")
            var r_type = "TOWN"
            if data.has("region"): r_type = data.get("region", {}).get("type", "TOWN")
            _route_by_type(r_type)

func _route_by_type(r_type: String):
    if _is_changing_scene: return
    _is_changing_scene = true
    if r_type == "TOWN":
        get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
    else:
        get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
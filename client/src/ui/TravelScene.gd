extends Control

@onready var dest_label = $VBoxContainer/DestinationLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var debug_log = $DebugConsole

func _ready():
	_log("Scene Loaded. Connecting signals...")
	if !ServerConnector.task_completed.is_connected(_on_task_completed):
		ServerConnector.task_completed.connect(_on_task_completed)
	_update_display()

func _log(msg: String):
	var time = Time.get_time_string_from_system()
	debug_log.append_text("[%s] %s\n" % [time, msg])
	print("[TRAVEL_DEBUG] ", msg)

func _process(_delta):
	_update_timer()

func _update_display():
	var task = GameState.active_task
	if task:
		_log("Task Found: " + task.type + " to " + str(task.get("targetRegionId", "??")))
		dest_label.text = "TRAVELING TO REGION " + str(task.get("targetRegionId", "?"))
	else:
		_log("WARNING: No active task in GameState.")

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
	
	if remaining <= 0 and status_label.text != "Arriving...":
		status_label.text = "Arriving..."
		_log("Timer reached 0. Awaiting WebSocket 'task_completed'...")

func _on_task_completed(data):
	_log("SIGNAL RECEIVED: task_completed")
	_log("Data Payload: " + str(data))
	
	if data.type == "TRAVEL":
		_log("Confirmed Type: TRAVEL. Target ID: " + str(data.get("targetRegionId")))
		_log("Target Type: " + str(data.get("targetRegionType")))
		
		# Update State
		GameState.current_user.currentRegion = data.targetRegionId
		GameState.set_active_task(null)
		
		# Check Type and Route
		var r_type = data.get("targetRegionType", "")
		if r_type == "TOWN":
			_log("Routing to TownScreen...")
			get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
		elif r_type == "WILDERNESS":
			_log("Routing to WildernessScreen...")
			get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
		else:
			_log("ERROR: targetRegionType is missing or invalid in payload!")
	else:
		_log("Ignored task type: " + data.type)

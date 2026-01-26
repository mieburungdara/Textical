extends Control
class_name ProgressBaseScene

@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var debug_log = $DebugConsole

var _fallback_timer = 0.0
var _is_waiting_for_socket = false
var _is_changing_scene = false

func _ready():
	_log("Base Scene Initialized. Connecting signals...")
	ServerConnector.task_completed.connect(_on_task_completed_base)
	ServerConnector.request_completed.connect(_on_request_completed_base)
	_log("Handing over to Child: _setup_scene()")
	_setup_scene()

func _log(msg: String):
	if !debug_log: return
	var time = Time.get_time_string_from_system()
	debug_log.append_text("[%s] %s\n" % [time, msg])
	print("[%s] %s" % [name, msg])

func _process(delta):
	if _is_changing_scene: return
	_process_timer()
	
	if _is_waiting_for_socket:
		_fallback_timer += delta
		if _fallback_timer > 3.0: 
			_log("Socket Timeout (3s). Triggering Recovery...")
			_fallback_timer = 0.0 
			_force_sync()

func _process_timer():
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
		_on_timer_finished()

func _on_timer_finished():
	# Default behavior: Wait for server
	status_label.text = "Processing..."
	_log("Timer reached 0. Awaiting Server Response...")
	_is_waiting_for_socket = true
	_fallback_timer = 0.0

func _force_sync():
	_log("Syncing Profile with Server...")
	if GameState.current_user:
		ServerConnector.fetch_profile(GameState.current_user.id)

# --- OVERRIDABLE METHODS ---

func _setup_scene():
	pass

func _on_task_completed_base(data):
	_log("Base received task_completed. Handing over to Child: _handle_task_completion()")
	_handle_task_completion(data)

func _on_request_completed_base(endpoint, data):
	_log("Base received request_completed. Handing over to Child: _handle_request_result()")
	_handle_request_result(endpoint, data)

func _handle_task_completion(_data):
	pass

func _handle_request_result(_endpoint, _data):
	pass

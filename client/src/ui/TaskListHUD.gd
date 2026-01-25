extends Control

@onready var task_name = $Panel/VBox/TaskName
@onready var time_label = $Panel/VBox/TimeLabel
@onready var progress_bar = $Panel/VBox/ProgressBar

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    # Poll for task status on start
    if GameState.current_user:
        ServerConnector.fetch_profile(GameState.current_user.id)

func _process(_delta):
    _update_timer_display()

func _on_request_completed(endpoint, data):
	# STRICT CHECK: Only update if it's the task endpoint OR a dictionary with a task status
	if endpoint.contains("/task"):
		GameState.set_active_task(data)
	elif data is Dictionary and data.has("status") and data.get("status") is String and data.get("status") == "RUNNING":
		# Only set as active task if it's actually a task payload
		if data.has("type") and data.has("finishesAt"):
			GameState.set_active_task(data)
func _update_timer_display():
    var task = GameState.active_task
    
    # Use .get() for safe access to avoid "Invalid access" crashes
    if !task or task.get("status", "") != "RUNNING":
        visible = false
        return
    
    visible = true
    task_name.text = task.get("type", "TASK")
    
    # Calculate remaining time from ISO string
    var finishes_at = task.get("finishesAt", "")
    if finishes_at == "":
        visible = false
        return
        
    var finish_unix = Time.get_unix_time_from_datetime_string(finishes_at)
    var now_unix = Time.get_unix_time_from_system()
    var remaining = max(0, finish_unix - now_unix)
    
    time_label.text = "%ds remaining" % int(remaining)
    
    # Calculate progress percentage
    var started_at = task.get("startedAt", "")
    if started_at != "":
        var start_unix = Time.get_unix_time_from_datetime_string(started_at)
        var total_duration = finish_unix - start_unix
        if total_duration > 0:
            progress_bar.value = ((total_duration - remaining) / total_duration) * 100
    
    if remaining <= 0:
        time_label.text = "Completing..."
        # Server heartbeat will clear this shortly

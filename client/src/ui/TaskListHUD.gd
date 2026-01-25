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
    if endpoint.contains("/task") or (data is Dictionary and data.has("type")):
        GameState.set_active_task(data)

func _update_timer_display():
    var task = GameState.active_task
    if !task or task.status != "RUNNING":
        visible = false
        return
    
    visible = true
    task_name.text = task.type
    
    # Calculate remaining time from ISO string
    var finish_unix = Time.get_unix_time_from_datetime_string(task.finishesAt)
    var now_unix = Time.get_unix_time_from_system()
    var remaining = max(0, finish_unix - now_unix)
    
    time_label.text = "%ds remaining" % int(remaining)
    
    # Calculate progress percentage (requires startedAt)
    var start_unix = Time.get_unix_time_from_datetime_string(task.startedAt)
    var total_duration = finish_unix - start_unix
    if total_duration > 0:
        progress_bar.value = ((total_duration - remaining) / total_duration) * 100
    
    if remaining <= 0:
        time_label.text = "Completing..."
        # We'll let the Heartbeat handle it, but we could poll here.

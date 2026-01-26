extends Control

@onready var task_name = $Panel/VBox/TaskName
@onready var time_label = $Panel/VBox/TimeLabel
@onready var progress_bar = $Panel/VBox/ProgressBar

func _ready():
	GameState.task_updated.connect(_on_task_updated)
	# Initial check
	_on_task_updated(GameState.active_task)

func _process(_delta):
	if visible:
		_update_timer_display()

func _on_task_updated(task):
	if !task or task.get("status", "") != "RUNNING":
		hide()
	else:
		show()
		task_name.text = task.get("type", "TASK")

func _update_timer_display():
	var task = GameState.active_task
	if !task: return
	
	var finishes_at = task.get("finishesAt", "")
	var started_at = task.get("startedAt", "")
	if finishes_at == "": return
		
	var finish_unix = Time.get_unix_time_from_datetime_string(finishes_at)
	var now_unix = Time.get_unix_time_from_system()
	var remaining = max(0, finish_unix - now_unix)
	
	time_label.text = "%ds remaining" % int(remaining)
	
	if started_at != "":
		var start_unix = Time.get_unix_time_from_datetime_string(started_at)
		var total_duration = finish_unix - start_unix
		if total_duration > 0:
			progress_bar.value = ((total_duration - remaining) / total_duration) * 100
	
	if remaining <= 0:
		time_label.text = "Finishing..."

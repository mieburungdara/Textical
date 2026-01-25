extends Control

@onready var dest_label = $VBoxContainer/DestinationLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel

func _ready():
	ServerConnector.task_completed.connect(_on_task_completed)
	_update_display()

func _process(_delta):
	_update_timer()

func _update_display():
	var task = GameState.active_task
	if task:
		dest_label.text = "TRAVELING TO REGION " + str(task.targetRegionId)
		status_label.text = "On the Road..."

func _update_timer():
	var task = GameState.active_task
	if !task or task.get("status", "") != "RUNNING": return
	
	var finish_unix = Time.get_unix_time_from_datetime_string(task.finishesAt)
	var start_unix = Time.get_unix_time_from_datetime_string(task.startedAt)
	var now_unix = Time.get_unix_time_from_system()
	
	var remaining = max(0, finish_unix - now_unix)
	var total = finish_unix - start_unix
	
	if total > 0:
		progress_bar.value = ((total - remaining) / total) * 100
	
	if remaining <= 0:
		status_label.text = "Arriving..."

func _on_task_completed(data):
	if data.type == "TRAVEL":
		# Update State
		GameState.current_user.currentRegion = data.targetRegionId
		# Auto-route to the correct screen
		ServerConnector.get_region_details(data.targetRegionId)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/region/"):
		if data.type == "TOWN":
			get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
		else:
			get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

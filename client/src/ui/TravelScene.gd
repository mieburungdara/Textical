extends Control

@onready var dest_label = $VBoxContainer/DestinationLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel

func _ready():
	ServerConnector.task_completed.connect(_on_task_completed)
	ServerConnector.request_completed.connect(_on_request_completed)
	
	# Initial UI Setup
	_update_display()

func _process(_delta):
	_update_timer()

func _update_display():
	var task = GameState.active_task
	if task:
		dest_label.text = "TRAVELING TO REGION " + str(task.get("targetRegionId", "?"))
		status_label.text = "On the Road..."
	else:
		status_label.text = "Waiting for server signal..."

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
	
	if remaining <= 0:
		status_label.text = "Arriving..."

func _on_task_completed(data):
	# Match type exactly from server (e.g. "TRAVEL")
	if data.type == "TRAVEL" or data.type == "AUDIT_TEST":
		print("[NAV] Arrival detected via Socket. Syncing location...")
		status_label.text = "Region Reached!"
		
		# Clear task locally
		GameState.set_active_task(null)
		
		# Update current region ID
		if data.has("targetRegionId"):
			GameState.current_user.currentRegion = data.targetRegionId
		
		# Small delay before fetching details to ensure DB transaction is fully committed
		await get_tree().create_timer(0.5).timeout
		ServerConnector.get_region_details(GameState.current_user.currentRegion)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/region/"):
		print("[NAV] Region details received. Routing...")
		# Final verification of region type
		if data.get("type") == "TOWN":
			get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
		else:
			get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

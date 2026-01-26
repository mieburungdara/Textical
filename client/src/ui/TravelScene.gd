extends ProgressBaseScene

@onready var dest_label = $VBoxContainer/DestinationLabel
var _target_id = -1
var _target_type = "TOWN"

func _setup_scene():
	var task = GameState.active_task
	if task and task.get("type") == "TRAVEL":
		# Predictive ID Capture (Handles both flat and nested responses)
		var tid = task.get("targetRegionId", -1)
		if tid == -1 and task.has("targetRegion"):
			tid = task.get("targetRegion", {}).get("id", -1)
			
		_target_id = int(tid)
		_target_type = task.get("targetRegionType", "TOWN")
		
		_log("Traveling to Region: " + str(_target_id))
		dest_label.text = "TRAVELING TO REGION " + str(_target_id)
		status_label.text = "On the Road..."
	else:
		_log("No travel task detected. Triggering recovery...")
		_force_sync()

# OPTIMISTIC ARRIVAL: Transition immediately when timer hits zero
func _on_timer_finished():
	_log("Arrival Timer Finished. Routing instantly (Optimistic)...")
	
	# Update local state so TopHUD cleans up
	GameState.set_active_task(null)
	
	# Route immediately using metadata we already have
	_route_by_type(_target_type)

func _handle_task_completion(data):
	if data.type == "TRAVEL":
		_log("Late arrival signal received from Socket. State already synced.")
		_is_waiting_for_socket = false

func _handle_request_result(endpoint, data):
	if endpoint.contains("/user/"):
		var active_task_on_server = data.get("activeTask")
		if active_task_on_server == null:
			_log("Sync confirmed arrival. Routing...")
			var region = data.get("region", {})
			_route_by_type(region.get("type", "TOWN"))

func _route_by_type(r_type: String):
	if _is_changing_scene: return
	_is_changing_scene = true
	
	if r_type == "TOWN":
		_log("Transitioning to Town...")
		get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
	else:
		_log("Transitioning to Wilderness...")
		get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
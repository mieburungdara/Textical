extends ProgressBaseScene

@onready var dest_label = $VBoxContainer/DestinationLabel
var _target_id = -1
var _target_type = "TOWN"

func _setup_scene():
    var task = GameState.active_task
    if task and task.get("type") == "TRAVEL":
        # Capture Target ID
        _target_id = int(task.get("targetRegionId", -1))
        
        # Capture Target Type from Metadata (Flattend or Nested)
        if task.has("targetRegionType"):
            _target_type = task.get("targetRegionType", "TOWN")
        elif task.has("targetRegion"):
            _target_type = task.get("targetRegion", {}).get("type", "TOWN")
        else:
            _target_type = "TOWN" # Fallback
            
        _log("Traveling to Region: " + str(_target_id) + " (" + _target_type + ")")
        dest_label.text = "TRAVELING TO REGION " + str(_target_id)
        status_label.text = "On the Road..."
    else:
        _log("No travel task detected. Triggering recovery sync...")
        _force_sync()

# OPTIMISTIC ARRIVAL: Transition immediately when timer hits zero
func _on_timer_finished():
    _log("Arrival Timer Finished. Routing instantly to " + _target_type)
    
    # Update local state so TopHUD cleans up
    GameState.set_active_task(null)
    
    # Route immediately using metadata we already have
    _route_by_type(_target_type)

func _handle_task_completion(data):
    if data.type == "TRAVEL":
        _log("Late arrival signal received from Socket. Syncing location state...")
        _is_waiting_for_socket = false
        _target_type = data.get("targetRegionType", "TOWN")
        # We don't call route here because _on_timer_finished will do it
        # or if the timer is already done, we check if we need to force route.

func _handle_request_result(endpoint, data):
    if endpoint.contains("/user/"):
        var active_task_on_server = data.get("activeTask")
        if active_task_on_server == null:
            # RECOVERY LOGIC: Use the explicitly provided currentRegionData
            var metadata = data.get("currentRegionData", {})
            var r_type = metadata.get("type", "TOWN")
            _log("Sync confirmed arrival. Routing to: " + r_type)
            _route_by_type(r_type)

func _route_by_type(r_type: String):
    if _is_changing_scene: return
    _is_changing_scene = true
    
    if r_type == "TOWN":
        _log("Transitioning to Town...")
        get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
    else:
        _log("Transitioning to Wilderness...")
        get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

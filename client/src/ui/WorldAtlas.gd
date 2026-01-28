extends AtlasBase

@onready var travel_system = $MapLayer/PathGroup
@onready var ui_panel = $UI/InfoPanel

func _ready():
    # 1. Component Signal Connections
    travel_system.camera = cam
    ui_panel.action_requested.connect(_on_action_requested)
    travel_system.travel_finished.connect(_on_travel_finished)
    ServerConnector.request_completed.connect(_on_request_completed)
    ServerConnector.task_completed.connect(func(d): 
        if d.type == "TRAVEL": _on_travel_finished(int(d.targetRegionId), d.targetRegionType)
    )
    
    # 2. State Sync
    _spawn_map_elements()
    var is_busy = GameState.active_task and GameState.active_task.type == "TRAVEL"
    _update_player_position(is_busy)
    
    if is_busy:
        player_marker.hide()
        travel_system.start_cinematic(GameState.active_task)
    else:
        _center_on_player()
    
    ui_panel.hide()
    travel_system.hide()

func _on_request_completed(endpoint, data):
    if endpoint.contains("/regions"): _populate_pins(data, ui_panel.display_region)
    elif endpoint.contains("/action/travel"): 
        player_marker.hide()
        travel_system.start_cinematic(data)

func _on_action_requested(rid):
    if rid == int(str(GameState.current_user.currentRegion).to_float()):
        _route_to(DataManager.get_region(rid).get("type", "TOWN"))
    else:
        ui_panel.start_btn.disabled = true
        ServerConnector.travel(GameState.current_user.id, rid)

func _on_travel_finished(tid, t_type):
    GameState.set_active_task(null)
    if GameState.current_user:
        GameState.current_user.currentRegion = tid
        # Update shared state for HUD navigation
        GameState.current_region_data = DataManager.get_region(tid)
        _update_player_position(false)
    _route_to(t_type)

func _route_to(r_type):
    get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn" if r_type == "TOWN" else "res://src/ui/WildernessScreen.tscn")

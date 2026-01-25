extends Control

@onready var map_container = $Panel/VBoxContainer/MapArea
@onready var status_label = $Panel/VBoxContainer/StatusLabel
@onready var close_btn = $Panel/VBoxContainer/CloseButton

var regions = []

func _ready():
    close_btn.pressed.connect(func(): hide())
    ServerConnector.request_completed.connect(_on_request_completed)

func refresh():
    if GameState.current_user:
        for child in map_container.get_children(): child.queue_free()
        var l = Label.new()
        l.text = "Drawing Map..."
        map_container.add_child(l)
        ServerConnector.fetch_all_regions()

func _on_request_completed(endpoint, data):
	if endpoint.contains("/regions") and data is Array:
		regions = data
		_draw_map()
	elif endpoint.contains("/action/travel"):
		status_label.text = "Travel started! 15s remaining."
		# Use global timer logic or let TaskHUD show progress
		await get_tree().create_timer(15.0).timeout
		ServerConnector.get_region_details(data.targetRegionId)
	elif endpoint.contains("/region/"):
		GameState.current_user.currentRegion = data.id
		if data.type == "TOWN":
			get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
		else:
			get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
func _draw_map():
    for child in map_container.get_children(): child.queue_free()
    
    var grid = GridContainer.new()
    grid.columns = 3
    grid.add_theme_constant_override("h_separation", 40)
    grid.add_theme_constant_override("v_separation", 40)
    map_container.add_child(grid)
    
    var current_region_id = GameState.current_user.currentRegion
    
    for region in regions:
        var region_panel = PanelContainer.new()
        var vbox = VBoxContainer.new()
        
        var name_label = Label.new()
        name_label.text = region.name
        if region.id == current_region_id:
            name_label.text += " (HERE)"
            name_label.modulate = Color.GREEN
        vbox.add_child(name_label)
        
        var travel_btn = Button.new()
        travel_btn.text = "Travel"
        
        # Only allow travel to connected regions
        var is_connected = false
        for conn in region.connections:
            if conn.targetRegionId == current_region_id or conn.originRegionId == current_region_id:
                is_connected = true
                break
        
        if region.id == current_region_id:
            travel_btn.disabled = true
            travel_btn.text = "Current"
        elif not is_connected:
            travel_btn.disabled = true
            travel_btn.text = "No Path"
        
        travel_btn.pressed.connect(func(): _on_travel_pressed(region.id))
        vbox.add_child(travel_btn)
        
        region_panel.add_child(vbox)
        grid.add_child(region_panel)

func _on_travel_pressed(target_id):
    ServerConnector.travel(GameState.current_user.id, target_id)

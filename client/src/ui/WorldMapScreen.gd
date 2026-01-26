extends Control

@onready var map_container = $VBoxContainer/MapArea
@onready var back_btn = $VBoxContainer/BackButton
@onready var status_label = $VBoxContainer/StatusLabel

func _ready():
	back_btn.pressed.connect(_on_back_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.error_occurred.connect(_on_error)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_all_regions()

func _on_error(endpoint, msg):
	if "travel" in endpoint:
		print("[MAP_ERROR] Travel rejected: ", msg)
		status_label.text = "Travel Failed: " + msg

func _on_request_completed(endpoint, data):
	if endpoint.contains("/regions"):
		_draw_map(data)
	elif endpoint.contains("/action/travel"):
		print("[MAP_DEBUG] Server confirmed travel. Transitioning...")
		# Server response now includes 'targetRegion' relation!
		GameState.set_active_task(data)
		get_tree().change_scene_to_file("res://src/ui/TravelScene.tscn")

func _draw_map(regions):
	for child in map_container.get_children(): child.queue_free()
	var grid = GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 40)
	grid.add_theme_constant_override("v_separation", 40)
	map_container.add_child(grid)
	
	for region in regions:
		var btn = Button.new()
		btn.text = region.name
		
		var current_region_id = int(GameState.current_user.get("currentRegion", -1))
		var target_region_id = int(region.id)
		
		if target_region_id == current_region_id:
			btn.modulate = Color.GREEN
			btn.text += " (HERE)"
		
		btn.pressed.connect(_on_region_pressed.bind(region))
		grid.add_child(btn)

func _on_region_pressed(region):
	status_label.text = "Authorizing travel to " + region.name + "..."
	ServerConnector.travel(GameState.current_user.id, region.id)

func _on_back_pressed():
	get_tree().change_scene_to_file(GameState.last_visited_hub)
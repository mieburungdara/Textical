extends Control

@onready var map_container = $VBoxContainer/MapArea
@onready var back_btn = $VBoxContainer/BackButton

func _ready():
	back_btn.pressed.connect(_on_back_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.error_occurred.connect(_on_error)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_all_regions()

func _on_error(endpoint, msg):
	print("[MAP_DEBUG] Error on ", endpoint, ": ", msg)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/regions"):
		_draw_map(data)
	elif endpoint.contains("/action/travel"):
		print("[MAP_DEBUG] Travel confirmed. Switching to TravelScene...")
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
		
		# FIX: Use bind() to pass the correct region data to the function
		btn.pressed.connect(_on_region_pressed.bind(region))
		grid.add_child(btn)

func _on_region_pressed(region):
	print("[MAP_DEBUG] Traveling to: ", region.name, " (ID: ", region.id, ")")
	ServerConnector.travel(GameState.current_user.id, region.id)

func _on_back_pressed():
	get_tree().change_scene_to_file(GameState.last_visited_hub)

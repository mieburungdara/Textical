extends Control

@onready var map_container = $VBoxContainer/MapArea
@onready var back_btn = $VBoxContainer/BackButton

func _ready():
	back_btn.pressed.connect(_on_back_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_all_regions()

func _on_request_completed(endpoint, data):
	if endpoint.contains("/regions"):
		_draw_map(data)
	elif endpoint.contains("/action/travel"):
		# Switch to animated travel scene
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
		if region.id == GameState.current_user.currentRegion:
			btn.modulate = Color.GREEN
			btn.text += " (HERE)"
		btn.pressed.connect(func(): ServerConnector.travel(GameState.current_user.id, region.id))
		grid.add_child(btn)

func _on_back_pressed():
	get_tree().change_scene_to_file(GameState.last_visited_hub)

extends Control

@onready var title_label = $VBoxContainer/Title
@onready var resource_container = $VBoxContainer/ResourceList
@onready var action_label = $VBoxContainer/ActionStatus
@onready var map_btn = $VBoxContainer/MapButton
@onready var map_ui = $WorldMapUI

var current_region_data = null

func _ready():
	map_btn.pressed.connect(_on_map_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	
	# ROBUST CHECK: If region is already known in state, display immediately
	if GameState.current_region_data:
		current_region_data = GameState.current_region_data
		_update_ui()
	elif GameState.current_user:
		_fetch_data()

func _fetch_data():
	title_label.text = "Fetching Regional Data..."
	ServerConnector.get_region_details(GameState.current_user.currentRegion)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/region/"):
		current_region_data = data
		GameState.current_region_data = data # Sync to state
		_update_ui()
	elif endpoint.contains("/action/gather"):
		action_label.text = "Gathering sequence initiated..."

func _update_ui():
	if not current_region_data: 
		title_label.text = "Region Unavailable"
		return
	
	title_label.text = current_region_data.name.to_upper()
	title_label.modulate = Color.YELLOW if current_region_data.dangerLevel > 1 else Color.WHITE
	
	for child in resource_container.get_children(): child.queue_free()
	
	if current_region_data.resources.size() == 0:
		var l = Label.new()
		l.text = "No trackable resources found."
		resource_container.add_child(l)
	else:
		for res in current_region_data.resources:
			var btn = Button.new()
			btn.text = "Gather %s\n(10s - 3 Vit)" % res.item.name
			btn.custom_minimum_size = Vector2(0, 60)
			btn.pressed.connect(func(): _on_gather_pressed(res.id))
			resource_container.add_child(btn)

	var hunt_btn = Button.new()
	hunt_btn.text = "HUNT SLIME\n(5 Vitality)"
	hunt_btn.custom_minimum_size = Vector2(0, 60)
	hunt_btn.pressed.connect(_on_hunt_pressed)
	resource_container.add_child(hunt_btn)

func _on_hunt_pressed():
	get_tree().change_scene_to_file("res://src/ui/CombatScreen.tscn")

func _on_gather_pressed(resource_id):
	if GameState.current_heroes.size() > 0:
		ServerConnector.gather(GameState.current_user.id, GameState.current_heroes[0].id, resource_id)
	else:
		ServerConnector.fetch_heroes(GameState.current_user.id)

func _on_map_pressed():
	map_ui.show()
	map_ui.refresh()

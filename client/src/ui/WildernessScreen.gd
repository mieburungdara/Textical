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
	
	if GameState.current_user:
		_fetch_data()

func _fetch_data():
	title_label.text = "Loading Region..."
	ServerConnector.get_region_details(GameState.current_user.currentRegion)

func _on_request_completed(endpoint, data):
	if "region/" in endpoint:
		current_region_data = data
		_update_ui()
	elif "action/gather" in endpoint:
		action_label.text = "Gathering started..."
	elif "action/travel" in endpoint:
		# Map UI handles closing itself
		# HUD handles timer
		await get_tree().create_timer(15.0).timeout
		if data.has("targetRegionId"):
			GameState.current_user.currentRegion = data.targetRegionId
			if data.targetRegionId == 1:
				get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
			else:
				# Refresh current screen
				_fetch_data()

func _update_ui():
	if not current_region_data: return
	
	title_label.text = current_region_data.name + "\n(Danger: " + str(current_region_data.dangerLevel) + ")"
	
	for child in resource_container.get_children():
		child.queue_free()
	
	if current_region_data.resources.size() == 0:
		var l = Label.new()
		l.text = "No resources here."
		resource_container.add_child(l)
	else:
		for res in current_region_data.resources:
			var btn = Button.new()
			btn.text = "Gather " + res.item.name + "\n(10s - 3 Vitality)"
			btn.custom_minimum_size = Vector2(0, 50)
			btn.pressed.connect(func(): _on_gather_pressed(res.id))
			resource_container.add_child(btn)

	var hunt_btn = Button.new()
	hunt_btn.text = "Hunt Slime\n(5 Vitality)"
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
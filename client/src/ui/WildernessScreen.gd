extends Control

@onready var title_label = $VBoxContainer/Title
@onready var resource_container = $VBoxContainer/ResourceList
@onready var action_label = $VBoxContainer/ActionStatus
@onready var back_btn = $VBoxContainer/BackButton

var current_region_data = null

func _ready():
	back_btn.pressed.connect(_on_back_pressed)
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
		action_label.text = "Gathering started... (10s)"
		# In a real game, we'd start a local timer matching the server task
		await get_tree().create_timer(10.0).timeout
		action_label.text = "Gathering complete! Check Inventory."
	elif "action/travel" in endpoint:
		action_label.text = "Traveling... (15s)"
		await get_tree().create_timer(15.0).timeout
		# Assume success and move scene
		GameState.current_user.currentRegion = 1 # Hack: Assume back to town (1)
		get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")

func _update_ui():
	if not current_region_data: return
	
title_label.text = current_region_data.name + "\n(Danger: " + str(current_region_data.dangerLevel) + ")"
	
	# Clear old
	for child in resource_container.get_children():
		child.queue_free()
	
	# Resources
	if current_region_data.resources.size() == 0:
		var l = Label.new()
		l.text = "No resources here."
		resource_container.add_child(l)
	else:
		for res in current_region_data.resources:
			var btn = Button.new()
			btn.text = "Gather " + res.item.name + "\n(10s - 3 Vitality)"
			btn.custom_minimum_size = Vector2(0, 50)
			# Find a valid hero (Hack: just pick the first one for now)
			# In prod, we'd ask user to select a hero
			var hero_id = -1
			# We need heroes in GameState to pick one. 
			# Assuming ServerConnector.fetch_heroes was called at login or we fetch now.
			# For this demo, we'll assume the user knows their hero ID or we hardcode fetching heroes.
			
			btn.pressed.connect(func(): _on_gather_pressed(res.id))
			resource_container.add_child(btn)

	# Monsters (New Section)
	var hunt_btn = Button.new()
	hunt_btn.text = "Hunt Slime\n(5 Vitality)"
	hunt_btn.custom_minimum_size = Vector2(0, 60)
	hunt_btn.pressed.connect(_on_hunt_pressed)
	resource_container.add_child(hunt_btn)

func _on_hunt_pressed():
	# For demo, hardcoding Monster ID 6001 (Slime)
	get_tree().change_scene_to_file("res://src/ui/CombatScreen.tscn")

func _on_gather_pressed(resource_id):
	# We need a hero ID. Let's assume we fetch heroes first or stored them.
	# Since GameState doesn't verify heroes yet, we might fail here.
	# TODO: Ensure GameState has heroes.
	# For the demo, we will blindly try to use the first hero if available, or fetch them.
	if GameState.current_heroes.size() > 0:
		ServerConnector.gather(GameState.current_user.id, GameState.current_heroes[0].id, resource_id)
	else:
		action_label.text = "Error: No heroes found. Fetching..."
		ServerConnector.fetch_heroes(GameState.current_user.id)
		# We need to listen for heroes response to retry, but for now just error.

func _on_back_pressed():
	# Travel back to Town (ID 1)
	ServerConnector.travel(GameState.current_user.id, 1)

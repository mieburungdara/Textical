extends Control

@onready var grid_container = $VBoxContainer/HBox/GridContainer
@onready var hero_list = $VBoxContainer/HBox/HeroList
@onready var back_btn = $VBoxContainer/BackButton

var current_preset_id = -1
var selected_hero_id = -1
var grid_slots = {} 

func _ready():
	back_btn.pressed.connect(func(): get_tree().change_scene_to_file(GameState.last_visited_hub))
	ServerConnector.request_completed.connect(_on_request_completed)
	
	for y in range(3):
		for x in range(3):
			var slot = Button.new()
			slot.custom_minimum_size = Vector2(100, 100)
			slot.text = "Empty"
			slot.pressed.connect(func(): _on_grid_pressed(x, y, slot))
			grid_container.add_child(slot)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_formation(GameState.current_user.id)
		ServerConnector.fetch_heroes(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/formation"):
		current_preset_id = data.id
		_populate_grid(data.slots)
	elif endpoint.contains("/heroes"):
		_populate_hero_list(data)

func _populate_grid(slots):
	grid_slots = {}
	for child in grid_container.get_children(): child.text = "Empty"
	for slot in slots:
		grid_slots["%d,%d" % [slot.gridX, slot.gridY]] = slot.heroId
		var idx = slot.gridY * 3 + slot.gridX
		grid_container.get_child(idx).text = "Hero\n%d" % slot.heroId

func _populate_hero_list(heroes):
	for child in hero_list.get_children(): child.queue_free()
	for hero in heroes:
		var btn = Button.new()
		btn.text = hero.name
		btn.pressed.connect(func(): selected_hero_id = hero.id)
		hero_list.add_child(btn)

func _on_grid_pressed(x, y, btn):
	if selected_hero_id != -1:
		grid_slots["%d,%d" % [x, y]] = selected_hero_id
		btn.text = "Hero\n%d" % selected_hero_id
		selected_hero_id = -1
		_save()
	else:
		grid_slots.erase("%d,%d" % [x, y])
		btn.text = "Empty"
		_save()

func _save():
	var slots = []
	for key in grid_slots:
		var pos = key.split(",")
		slots.push_back({"heroId": grid_slots[key], "gridX": int(pos[0]), "gridY": int(pos[1])})
	ServerConnector.update_formation(GameState.current_user.id, current_preset_id, slots)

extends Control

@onready var grid_container = $Panel/VBoxContainer/GridContainer
@onready var hero_list = $Panel/VBoxContainer/HeroList
@onready var save_btn = $Panel/VBoxContainer/SaveButton
@onready var close_btn = $Panel/VBoxContainer/CloseButton

var current_preset_id = -1
var selected_hero_id = -1
var grid_slots = {} # Key: "x,y", Value: heroId

func _ready():
	close_btn.pressed.connect(func(): hide())
	save_btn.pressed.connect(_on_save_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	
	# Initialize 3x3 Grid visually
	for y in range(3):
		for x in range(3):
			var slot = Button.new()
			slot.custom_minimum_size = Vector2(80, 80)
			slot.text = "[%d,%d]\nEmpty" % [x, y]
			slot.pressed.connect(func(): _on_grid_pressed(x, y, slot))
			grid_container.add_child(slot)

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
	# Reset grid visuals
	for child in grid_container.get_children():
		child.text = "Empty"
	
	for slot in slots:
		grid_slots["%d,%d" % [slot.gridX, slot.gridY]] = slot.heroId
		var idx = slot.gridY * 3 + slot.gridX
		var btn = grid_container.get_child(idx)
		btn.text = "Hero\nID:%d" % slot.heroId

func _populate_hero_list(heroes):
	for child in hero_list.get_children(): child.queue_free()
	
	for hero in heroes:
		var btn = Button.new()
		btn.text = "%s (Lvl %d)" % [hero.name, hero.level]
		btn.pressed.connect(func(): selected_hero_id = hero.id)
		hero_list.add_child(btn)

func _on_grid_pressed(x, y, btn):
	if selected_hero_id != -1:
		# Place hero
		grid_slots["%d,%d" % [x, y]] = selected_hero_id
		btn.text = "Hero\nID:%d" % selected_hero_id
		selected_hero_id = -1 # Reset selection
	else:
		# Remove hero
		grid_slots.erase("%d,%d" % [x, y])
		btn.text = "Empty"

func _on_save_pressed():
	var slots = []
	for key in grid_slots:
		var pos = key.split(",")
		slots.push_back({
			"heroId": grid_slots[key],
			"gridX": int(pos[0]),
			"gridY": int(pos[1])
		})
	
	ServerConnector.update_formation(GameState.current_user.id, current_preset_id, slots)

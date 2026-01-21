class_name FormationEditor
extends Control

signal formation_confirmed(party_data: Dictionary) # { Vector2i: UnitData }
signal formation_changed # Emitted when a unit is dropped onto a slot

@export var available_units: Array[UnitData] = []
@export var grid_width: int = 3 # Player area width
@export var grid_height: int = 8

@onready var grid_container: GridContainer = $HBox/GridArea/Center/Grid
@onready var inventory_container: VBoxContainer = $HBox/InventoryPanel/Scroll/VBox
@onready var slot_scene = preload("res://src/game/ui/formation/GridSlot.tscn")

var slots: Dictionary = {} # Vector2i -> GridSlot

func _ready():
	_setup_grid()
	_setup_inventory()

func _setup_grid():
	grid_container.columns = grid_width
	
	for y in range(grid_height):
		for x in range(grid_width):
			var slot = slot_scene.instantiate()
			# Coordinate system: x=0 is front-line? Let's assume standard (0,0) top-left
			# In BattleController, player starts at x=1. Let's map 0..2 to 1..3 logic later.
			var pos = Vector2i(x, y) 
			slot.setup(pos)
			grid_container.add_child(slot)
			slots[pos] = slot

func _setup_inventory():
	for unit in available_units:
		var item = TextureRect.new()
		item.custom_minimum_size = Vector2(64, 64)
		item.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		item.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		
		if unit.icon:
			item.texture = unit.icon
			item.modulate = unit.model_color
		else:
			# Fallback visual
			var placeholder = PlaceholderTexture2D.new()
			placeholder.size = Vector2(64,64)
			item.texture = placeholder
			item.modulate = unit.model_color
			
		item.set_script(load("res://src/game/ui/formation/draggable_unit.gd"))
		item.call("setup", unit)
		inventory_container.add_child(item)

func _on_start_pressed():
	var party: Dictionary = {}
	for pos in slots:
		var slot = slots[pos]
		if slot.current_unit:
			# Map editor grid (0..2) to battle grid (1..3)
			# Assuming battle grid has padding x=0
			var battle_pos = Vector2i(pos.x + 1, pos.y)
			party[battle_pos] = slot.current_unit
	
	if party.is_empty():
		print("Party is empty!")
		return
		
	# Change scene to battle or signal up
	# For prototype, we'll assume we load battle scene and pass data
	print("Starting battle with: ", party)
	# In a real app, you'd use a Global/Singleton to pass this data 
	# or change scene with param.
	GlobalGameManager.start_battle_with_party(party)

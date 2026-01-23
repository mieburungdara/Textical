class_name InventoryUI
extends Control

## Main UI for managing the player's global item collection.

@onready var item_grid: GridContainer = $HBox/Left/Scroll/Grid
@onready var detail_name: Label = $HBox/Right/VBox/Name
@onready var detail_desc: Label = $HBox/Right/VBox/Description
@onready var detail_stats: RichTextLabel = $HBox/Right/VBox/Stats
@onready var action_button: Button = $HBox/Right/ActionBtn

var selected_item: ItemData = null
var current_filter: int = -1 # -1 = All

func _ready():
	_refresh_display()
	InventoryManager.inventory_changed.connect(_refresh_display)

func _refresh_display():
	for child in item_grid.get_children():
		child.queue_free()
	
	var instances = InventoryManager.items
	# ... (filtering logic could go here)
		
	for inst in instances:
		_add_item_icon(inst)

func _add_item_icon(inst: ItemInstance):
	var btn = Button.new()
	btn.custom_minimum_size = Vector2(64, 64)
	var item_data = inst.data
	
	if item_data.icon:
		btn.icon = item_data.icon
		btn.expand_icon = true
	else:
		btn.text = item_data.name.left(2)
		
	btn.pressed.connect(_on_item_selected.bind(inst))
	item_grid.add_child(btn)

func _on_item_selected(inst: ItemInstance):
	selected_item = inst
	var item_data = inst.data
	detail_name.text = item_data.name
	detail_desc.text = item_data.description
	
	var stats_text = "[color=gray]ID: %s[/color]\n" % inst.uid
	if item_data is EquipmentData:
		stats_text += "[b]SLOT:[/b] %s\n\n[b]BONUSES:[/b]\n" % str(item_data.slot)
		for s_name in item_data.stat_bonuses:
			stats_text += "%s: +%d\n" % [s_name.capitalize(), item_data.stat_bonuses[s_name]]
	# ... (consumable logic)
	detail_stats.text = stats_text
	
	# Update Action Button
	action_button.visible = true
	if item.type == ItemData.ItemType.CONSUMABLE:
		action_button.text = "USE ITEM"
	else:
		action_button.text = "DISCARD"

func _on_action_pressed():
	if not selected_item: return
	
	if selected_item.type == ItemData.ItemType.CONSUMABLE:
		# Use logic... (e.g. heal party)
		print("Used: ", selected_item.name)
		InventoryManager.remove_item(selected_item)
	else:
		# Discard logic
		InventoryManager.remove_item(selected_item)
	
	selected_item = null
	detail_name.text = "Select an item"
	detail_desc.text = ""
	detail_stats.text = ""
	action_button.visible = false

func _on_back_pressed():
	get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")
class_name InventoryUI
extends Control

## Main UI for managing the player's global item collection.
## Supports ItemInstances and detailed stat viewing.

@onready var item_grid: GridContainer = $HBox/Left/Scroll/Grid
@onready var detail_name: Label = $HBox/Right/VBox/Name
@onready var detail_desc: Label = $HBox/Right/VBox/Description
@onready var detail_stats: RichTextLabel = $HBox/Right/VBox/Stats
@onready var action_button: Button = $HBox/Right/ActionBtn

var selected_item: ItemInstance = null

func _ready():
	_refresh_display()
	InventoryManager.inventory_changed.connect(_refresh_display)

func _refresh_display():
	for child in item_grid.get_children():
		child.queue_free()
	
	for inst in InventoryManager.items:
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
	
	var stats_text = "[color=gray]UID: %s[/color]\n" % inst.uid
	if item_data is EquipmentData:
		stats_text += "[b]SLOT:[/b] %s\n\n[b]BONUSES:[/b]\n" % str(item_data.slot)
		for s_name in item_data.stat_bonuses:
			stats_text += "%s: +%d\n" % [s_name.capitalize(), item_data.stat_bonuses[s_name]]
	elif item_data is ConsumableData:
		stats_text += "[b]TYPE:[/b] Consumable\n\n[b]EFFECTS:[/b]\n"
		if item_data.hp_restore > 0: stats_text += "Heals: %d HP\n" % item_data.hp_restore
		if item_data.mana_restore > 0: stats_text += "Restores: %d Mana\n" % item_data.mana_restore
	
	detail_stats.text = stats_text
	action_button.visible = true
	action_button.text = "USE ITEM" if item_data is ConsumableData else "DISCARD"

func _on_action_pressed():
	if not selected_item: return
	InventoryManager.remove_item(selected_item.uid)
	_reset_details()

func _reset_details():
	selected_item = null
	detail_name.text = "Select an item"
	detail_desc.text = ""
	detail_stats.text = ""
	action_button.visible = false

func _on_back_pressed():
	get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

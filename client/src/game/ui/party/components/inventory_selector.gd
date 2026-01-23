class_name InventorySelector
extends Control

## A popup to select equipment for a specific slot.

signal item_selected(item: EquipmentData)

@onready var item_list: VBoxContainer = $Panel/Scroll/VBox

func open(slot: EquipmentData.Slot):
	for child in item_list.get_children():
		child.queue_free()
	
	var none_btn = Button.new()
	none_btn.text = "< UNEQUIP >"
	none_btn.custom_minimum_size.y = 50
	none_btn.pressed.connect(func(): item_selected.emit(null); hide())
	item_list.add_child(none_btn)
	
	var available = InventoryManager.get_equipment_for_slot(slot)
	
	if available.is_empty():
		var label = Label.new()
		label.text = "No compatible items in inventory."
		label.horizontal_alignment = HorizontalAlignment.HORIZONTAL_ALIGNMENT_CENTER
		item_list.add_child(label)
	
	for item in available:
		var btn = Button.new()
		var stats_brief = ""
		for s in item.stat_bonuses:
			stats_brief += " +%d %s" % [item.stat_bonuses[s], s.left(3).to_upper()]
			
		btn.text = "%s (%s)" % [item.name, stats_brief]
		btn.icon = item.icon
		btn.expand_icon = true
		btn.custom_minimum_size.y = 50
		btn.alignment = HorizontalAlignment.HORIZONTAL_ALIGNMENT_LEFT
		
		btn.pressed.connect(func(): item_selected.emit(item); hide())
		item_list.add_child(btn)
	
	show()

func _on_close_pressed():
	hide()
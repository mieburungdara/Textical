class_name HeroDetailsComponent
extends BasePartyComponent

@export var stats_label: RichTextLabel
@export var slot_container: HBoxContainer # To be added in TSCN

var current_hero: HeroData
var slot_scene = preload("res://src/game/ui/party/components/EquipSlot.tscn")

func display(data: HeroData):
	current_hero = data
	_update_text(data)
	_update_slots(data)

func _update_text(data: HeroData):
	var text = "[b][size=20]%s[/size][/b]\n" % data.name
	text += "[color=gray]%s[/color]\n\n" % data.description
	text += "[b]STATS:[/b]\n"
	text += "HP: %d\n" % data.hp_base
	text += "Mana: %d\n" % data.mana_base
	text += "Attack: %d\n" % data.damage_base
	text += "Range: %d\n" % data.range_base
	text += "Speed: %d\n" % data.speed_base
	stats_label.text = text

func _update_slots(data: HeroData):
	# Clear old slots
	for child in slot_container.get_children():
		child.queue_free()
	
	# Create slots for each type
	var slots = [
		{"type": EquipmentData.Slot.MAIN_HAND, "label": "Weapon"},
		{"type": EquipmentData.Slot.ARMOR, "label": "Armor"},
		{"type": EquipmentData.Slot.ACCESSORY, "label": "Acc."}
	]
	
	for s_info in slots:
		var slot_node = slot_scene.instantiate() as EquipSlot
		slot_container.add_child(slot_node)
		slot_node.slot_type = s_info["type"]
		slot_node.get_node("Label").text = s_info["label"]
		
		# Set current item if exists
		var equipped = data.equipment.get(s_info["type"])
		slot_node.set_item(equipped)
		
		# Connect to manager
		slot_node.slot_clicked.connect(manager._on_slot_clicked)
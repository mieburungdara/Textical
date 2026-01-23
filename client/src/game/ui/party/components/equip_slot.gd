class_name EquipSlot
extends Button

## A UI slot representing an equipment piece on a hero.

signal slot_clicked(slot_type: EquipmentData.Slot)

@export var slot_type: EquipmentData.Slot = EquipmentData.Slot.MAIN_HAND
@onready var icon_rect: TextureRect = $Icon

func _ready():
	custom_minimum_size = Vector2(64, 64)
	pressed.connect(_on_pressed)

func set_item(item: EquipmentData):
	if item:
		icon_rect.texture = item.icon
		icon_rect.modulate = Color.WHITE
		tooltip_text = "%s\n%s" % [item.name, item.description]
	else:
		icon_rect.texture = null
		tooltip_text = "Empty Slot"

func _on_pressed():
	slot_clicked.emit(slot_type)

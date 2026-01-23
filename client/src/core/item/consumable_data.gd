class_name ConsumableData
extends ItemData

## Data for items that can be used once.

@export_group("Effect Settings")
@export var hp_restore: int = 0
@export var mana_restore: int = 0

func _init():
    type = ItemType.CONSUMABLE
    stackable = true

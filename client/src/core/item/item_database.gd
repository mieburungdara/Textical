class_name ItemDatabase
extends Resource

## Professional Master Registry for all items in the game.
## This allows you to find items by ID without knowing their file path.

@export var all_items: Array[ItemData] = []

var _id_map: Dictionary = {}

func initialize():
	_id_map.clear()
	for item in all_items:
		if item: _id_map[item.id] = item

func get_item(id: String) -> ItemData:
	if _id_map.is_empty(): initialize()
	return _id_map.get(id)

func get_all_weapons() -> Array[EquipmentData]:
	var list: Array[EquipmentData] = []
	for item in all_items:
		if item is EquipmentData and item.slot == EquipmentData.Slot.MAIN_HAND:
			list.append(item)
	return list

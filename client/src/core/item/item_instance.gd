class_name ItemInstance
extends Resource

## Professional wrapper for items owned by players.
## Distinguishes the static data from the unique instance data.

@export var data: ItemData # Reference to the static resource (.tres)
@export var uid: String # Unique ID for this specific object (e.g. "uuid_123")
@export var level: int = 1
@export var extra_attributes: Dictionary = {}

func _init(p_data: ItemData = null):
	data = p_data
	uid = str(Time.get_unix_time_from_system()) + "_" + str(randi() % 1000)

func get_stat_bonus(stat_name: String) -> int:
	if not (data is EquipmentData): return 0
	return data.stat_bonuses.get(stat_name, 0)

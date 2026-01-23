class_name ItemTrait
extends Resource

## Professional trait system for items.
## Can be used for "On Hit" effects, "Status Immunities", etc.

@export var display_name: String = "Burn"
@export_multiline var description: String = "Applies burn on hit."

## Called when the unit wearing this item attacks
func on_attack(user: Object, target: Object, damage_dealt: int):
	pass

## Called when the unit wearing this item takes damage
func on_take_damage(user: Object, attacker: Object, damage_received: int):
	pass

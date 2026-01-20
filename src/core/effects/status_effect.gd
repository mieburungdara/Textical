class_name StatusEffect
extends Resource

enum Type { BUFF, DEBUFF }

@export var id: String = "effect_id"
@export var name: String = "Effect Name"
@export var type: Type = Type.DEBUFF
@export var duration_turns: int = 3 # Duration in turns (when AP hits 100)

# Optional: Stats affected
@export var stat_changes: Dictionary = {} # e.g. { "speed": -0.5 } for 50% slow

var current_duration: int = 0

func _init():
	current_duration = duration_turns

## Called every time the unit gets a turn
func process_turn(unit: Object) -> bool:
	current_duration -= 1
	return current_duration <= 0 # Returns true if effect should be removed

## Apply the modifiers to the unit's stats
func apply(unit: Object):
	for stat_name in stat_changes.keys():
		var modifier_value = stat_changes[stat_name]
		# We assume PERCENT_ADD for simplicity in stat changes dictionary
		unit.stats.add_modifier(stat_name, modifier_value, StatModifier.Type.PERCENT_ADD, id)

## Remove the modifiers
func remove(unit: Object):
	for stat_name in stat_changes.keys():
		var stat_obj = unit.stats.get(stat_name)
		if stat_obj is Stat:
			stat_obj.remove_modifiers_from_source(id)

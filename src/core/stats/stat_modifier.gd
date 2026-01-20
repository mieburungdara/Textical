class_name StatModifier
extends Resource

## Enum defining how the modifier is applied
enum Type {
	FLAT,           ## Adds directly to the base (e.g., +10 STR)
	PERCENT_ADD,    ## Adds percentage of base (e.g., +10% STR = +1 if base is 10)
	PERCENT_MULT    ## Multiplies the final result (e.g., x1.5 Damage)
}

@export var value: float = 0.0
@export var type: Type = Type.FLAT
@export var source: String = "" # Optional: Debugging aid (e.g., "Iron Sword", "Buff")

func _init(p_value: float = 0.0, p_type: Type = Type.FLAT, p_source: String = ""):
	value = p_value
	type = p_type
	source = p_source

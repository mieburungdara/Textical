class_name Stat
extends Resource

## Emitted when the calculated value changes
signal value_changed(new_value: float, old_value: float)

@export var base_value: float = 0.0:
	set(val):
		var old = get_value()
		base_value = val
		_recalculate_and_emit(old)

## Array to hold active StatModifiers
var _modifiers: Array[StatModifier] = []

## Cache the value to avoid recalculating every frame
var _cached_value: float = 0.0
var _is_dirty: bool = true

func _init(p_base: float = 0.0):
	base_value = p_base

## Returns the final calculated value
func get_value() -> float:
	if _is_dirty:
		_cached_value = _calculate()
		_is_dirty = false
	return _cached_value

## Adds a modifier and marks the stat as dirty
func add_modifier(mod: StatModifier):
	_modifiers.append(mod)
	_is_dirty = true
	_recalculate_and_emit(get_value()) # Trigger update

## Removes a specific modifier
func remove_modifier(mod: StatModifier):
	if mod in _modifiers:
		_modifiers.erase(mod)
		_is_dirty = true
		_recalculate_and_emit(get_value())

## Removes all modifiers from a specific source string
func remove_modifiers_from_source(source_name: String):
	var to_remove = []
	for mod in _modifiers:
		if mod.source == source_name:
			to_remove.append(mod)
	
	if not to_remove.is_empty():
		for mod in to_remove:
			_modifiers.erase(mod)
		_is_dirty = true
		_recalculate_and_emit(get_value())

func _calculate() -> float:
	var final_val = base_value
	var sum_percent_add = 0.0
	var total_percent_mult = 1.0
	
	for mod in _modifiers:
		match mod.type:
			StatModifier.Type.FLAT:
				final_val += mod.value
			StatModifier.Type.PERCENT_ADD:
				sum_percent_add += mod.value
			StatModifier.Type.PERCENT_MULT:
				total_percent_mult *= mod.value
	
	# Apply Percent Add (Additive Multiplier logic: 10% + 10% = +20% of base)
	# Note: Usually Percent Add applies to the Base Value or the Flat-Modified Value.
	# Here we apply it to the (Base + Flat) to allow scaling.
	final_val *= (1.0 + sum_percent_add)
	
	# Apply Percent Mult (True Multiplier: x2 Damage)
	final_val *= total_percent_mult
	
	return final_val

func _recalculate_and_emit(old_value_check: float = -99999.0):
	# Force recalc
	_is_dirty = true
	var new_val = get_value()
	
	if old_value_check != -99999.0 and new_val != old_value_check:
		value_changed.emit(new_val, old_value_check)

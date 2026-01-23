class_name EffectSkill
extends DamageSkill

@export_group("Effect Settings")
@export var status_effect: StatusEffect
@export var apply_chance: float = 1.0 # 100% chance

func execute(user: Object, target_pos: Vector2i, grid_ref: Object) -> Dictionary:
	# 1. Run damage first (inherited from DamageSkill)
	var log_data = super.execute(user, target_pos, grid_ref)
	
	# 2. Try to apply effect to all units hit
	if status_effect:
		var affected_tiles = grid_ref.get_tiles_in_pattern(target_pos, aoe_pattern, aoe_size)
		for tile in affected_tiles:
			var target_unit = grid_ref.get_unit_at(tile)
			if target_unit and target_unit != user and target_unit.team_id != user.team_id:
				if randf() <= apply_chance:
					target_unit.add_effect(status_effect)
					if not log_data.has("applied_effects"): log_data["applied_effects"] = []
					log_data["applied_effects"].append({"unit": target_unit.data.name, "effect": status_effect.name})
	
	return log_data

class_name DamageSkill
extends SkillData

@export_group("Damage Settings")
@export var damage_multiplier: float = 1.5
@export var flat_damage_bonus: int = 0
@export var hit_chance: float = 1.0

func execute(user: Object, target_pos: Vector2i, grid_ref: Object) -> Dictionary:
	var log_data = {}
	var affected_tiles = grid_ref.get_tiles_in_pattern(target_pos, aoe_pattern, aoe_size)
	
	var total_damage_dealt = 0
	var units_hit_names = []
	var units_hit_ids = []
	
	# We need access to simulation rules. 
	# A bit tricky since Skill doesn't have Sim ref, 
	# but we can assume user has access to it or we do calculation here.
	# For simplicity and AoE, we'll implement a local version of rules.
	
	for tile in affected_tiles:
		var target_unit = grid_ref.get_unit_at(tile)
		if target_unit == null or target_unit == user or target_unit.team_id == user.team_id:
			continue
		
		# 1. Base Damage (local calculation to include multiplier)
		var dmg = user.stats.attack_damage.get_value() * damage_multiplier + flat_damage_bonus
		
		# 2. Crit Check
		var is_crit = false
		if randf() < user.stats.critical_chance.get_value():
			dmg *= user.stats.critical_damage.get_value()
			is_crit = true
			
		# 3. Defense & Resist
		var def = target_unit.stats.defense.get_value()
		dmg = max(1, dmg - def)
		
		var resist = target_unit.data.get_resistance_for_element(element)
		dmg *= resist
		
		var final_dmg = int(dmg)
		
		# 4. Dodge check
		if randf() < target_unit.stats.evasion.get_value():
			final_dmg = 0 # Dodged!
		
		target_unit.take_damage(final_dmg, user)
		
		total_damage_dealt += final_dmg
		units_hit_names.append(target_unit.data.name)
		units_hit_ids.append(target_unit.data.id)
		
		if not log_data.has("individual_hits"): log_data["individual_hits"] = {}
		log_data["individual_hits"][target_unit.data.id] = final_dmg

	log_data["type"] = "damage"
	log_data["damage_total"] = total_damage_dealt
	log_data["hits"] = units_hit_names
	log_data["hit_ids"] = units_hit_ids
	log_data["target_pos"] = target_pos
	
	return log_data

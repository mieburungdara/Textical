class_name StatProcessor
extends RefCounted

## Professional Stat Decorator / Processor.
## Aggregates base stats, jobs, equipment, and temporary buffs.

static func calculate_final_stats(hero: Object) -> UnitStats:
	var s = hero.create_base_runtime_stats()
	
	# 1. Potential Modifiers
	s.health_max.add_modifier(StatModifier.new(hero.hp_bonus, StatModifier.Type.FLAT, "Potential"))
	s.attack_damage.add_modifier(StatModifier.new(hero.damage_bonus, StatModifier.Type.FLAT, "Potential"))
	s.speed.add_modifier(StatModifier.new(hero.speed_bonus, StatModifier.Type.FLAT, "Potential"))
	
	# 2. Job Decorators
	if hero.current_job:
		_apply_job_bonuses(s, hero.current_job, hero)
	
	# 3. Equipment Decorators
	for slot in hero.equipment:
		var item_instance = hero.equipment[slot]
		if item_instance and item_instance is ItemInstance:
			_apply_equip_bonuses(s, item_instance)
			
	s.initialize_state()
	return s

static func _apply_job_bonuses(s: UnitStats, job: JobData, hero: Object):
	s.health_max.add_modifier(StatModifier.new(job.hp_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"))
	s.mana_max.add_modifier(StatModifier.new(job.mana_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"))
	s.attack_damage.add_modifier(StatModifier.new(job.damage_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"))
	s.speed.add_modifier(StatModifier.new(job.speed_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"))
	s.attack_range.add_modifier(StatModifier.new(job.range_bonus, StatModifier.Type.FLAT, "Job"))
	
	# Important: Job-granted skills
	for skill in job.granted_skills:
		if skill and skill not in hero.skills:
			hero.skills.append(skill)

static func _apply_equip_bonuses(s: UnitStats, inst: ItemInstance):
	if not (inst.data is EquipmentData): return
	var equip_data = inst.data as EquipmentData
	for stat_name in equip_data.stat_bonuses:
		var val = equip_data.stat_bonuses[stat_name]
		s.add_modifier(stat_name, val, StatModifier.Type.FLAT, "Equip_" + inst.uid)
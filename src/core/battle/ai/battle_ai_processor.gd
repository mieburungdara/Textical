class_name BattleAIProcessor
extends "res://src/core/battle/ai/base_ai_processor.gd"

## Concrete implementation of the Tactical AI.

func decide_action(actor: Object, sim: Object) -> void:
	# 1. Find Target via Component
	var target = finder.find_target(actor, sim.units, sim.grid)
	if not target:
		sim.log_entry(BattleLogEntry.Type.WAIT, "%s found no targets." % actor.data.name, {"actor_id": actor.data.id})
		return
	
	var dist = sim.grid.get_distance(actor.grid_pos, target.grid_pos)
	
	# 2. Flee Instinct
	var hp_percent = actor.stats.current_health / actor.stats.health_max.get_value()
	if hp_percent <= actor.data.flee_threshold:
		executor.execute_flee(actor, target, sim)
		return

	# 3. Try Skills
	var usable_skills = actor.get_usable_skills()
	var chosen_skill: SkillData = null
	for skill in usable_skills:
		if skill.target_type == SkillData.TargetType.ENEMY and dist <= skill.skill_range:
			chosen_skill = skill
			break
	
	if chosen_skill:
		executor.execute_skill(actor, chosen_skill, target, sim)
		return

	# 4. Combat Logic
	var range_val = actor.stats.attack_range.get_value()
	if dist <= range_val:
		sim.rules.perform_attack(actor, target, sim)
		return
		
	# 5. Movement
	executor.execute_move(actor, target, sim)
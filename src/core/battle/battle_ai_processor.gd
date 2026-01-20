class_name BattleAIProcessor
extends RefCounted

## Logic component for unit decision making with multiple targeting priorities.

func decide_action(actor: Object, sim: Object) -> void:
	var target = _find_target(actor, sim.units, sim)
	if not target:
		sim.log_entry(BattleLogEntry.Type.WAIT, "%s found no targets." % actor.data.name, {"actor_id": actor.data.id})
		return
	
	var dist = sim.grid.get_distance(actor.grid_pos, target.grid_pos)
	
	# 1. Try Skills
	var usable_skills = actor.get_usable_skills()
	var chosen_skill: SkillData = null
	for skill in usable_skills:
		if skill.target_type == SkillData.TargetType.ENEMY and dist <= skill.skill_range:
			chosen_skill = skill
			break
	
	if chosen_skill:
		_execute_skill(actor, chosen_skill, target, sim)
		return

	# 2. Try Basic Attack
	var range_val = actor.stats.attack_range.get_value()
	if dist <= range_val:
		sim.rules.perform_attack(actor, target, sim)
		return
		
	# 3. Move
	_execute_move(actor, target, sim)

func _execute_skill(actor: Object, skill: SkillData, target: Object, sim: Object):
	actor.put_skill_on_cooldown(skill)
	var result = skill.execute(actor, target.grid_pos, sim.grid)
	
	var vfx_path = ""
	if skill.vfx_scene: vfx_path = skill.vfx_scene.resource_path
	
	sim.log_entry(BattleLogEntry.Type.CAST_SKILL, "%s casts %s at %s!" % [actor.data.name, skill.name, target.grid_pos],
		{
			"actor_id": actor.data.id,
			"target_pos": target.grid_pos,
			"skill_name": skill.name,
			"anim": skill.animation_name,
			"vfx_path": vfx_path,
			"result": result
		})

func _execute_move(actor: Object, target: Object, sim: Object):
	var next_pos = sim.grid.get_next_step_towards(actor.grid_pos, target.grid_pos)
	if next_pos != actor.grid_pos:
		sim.grid.move_unit(actor, next_pos)
		sim.log_entry(BattleLogEntry.Type.MOVE, "%s moved to %s" % [actor.data.name, next_pos], 
			{
				"actor_id": actor.data.id, 
				"from": actor.grid_pos, 
				"to": next_pos
			})
	else:
		sim.log_entry(BattleLogEntry.Type.WAIT, "%s is blocked/waiting." % actor.data.name, {"actor_id": actor.data.id})

func _find_target(actor: Object, all_units: Array, sim: Object) -> Object:
	var potential_targets = []
	for unit in all_units:
		if unit.is_dead or unit.team_id == actor.team_id: continue
		potential_targets.append(unit)
	
	if potential_targets.is_empty(): return null
	
	# Priority Logic
	match actor.data.target_priority:
		UnitData.TargetPriority.CLOSEST:
			potential_targets.sort_custom(func(a, b): 
				return sim.grid.get_distance(actor.grid_pos, a.grid_pos) < sim.grid.get_distance(actor.grid_pos, b.grid_pos)
			)
		UnitData.TargetPriority.FURTHEST:
			potential_targets.sort_custom(func(a, b): 
				return sim.grid.get_distance(actor.grid_pos, a.grid_pos) > sim.grid.get_distance(actor.grid_pos, b.grid_pos)
			)
		UnitData.TargetPriority.LOWEST_HP:
			potential_targets.sort_custom(func(a, b): 
				return a.stats.current_health < b.stats.current_health
			)
		UnitData.TargetPriority.HIGHEST_HP:
			potential_targets.sort_custom(func(a, b): 
				return a.stats.current_health > b.stats.current_health
			)
		UnitData.TargetPriority.MOST_DANGEROUS:
			potential_targets.sort_custom(func(a, b): 
				return a.stats.attack_damage.get_value() > b.stats.attack_damage.get_value()
			)
			
	return potential_targets[0]

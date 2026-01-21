class_name AIActionExecutor
extends RefCounted

## Component responsible for executing physical/logical actions in the simulation.

func execute_skill(actor: Object, skill: SkillData, target: Object, sim: Object):
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

func execute_move(actor: Object, target: Object, sim: Object):
	var next_pos = sim.grid.get_next_step_towards(actor.grid_pos, target.grid_pos)
	
	# Check if already at preferred range
	var dist = sim.grid.get_distance(actor.grid_pos, target.grid_pos)
	if dist <= actor.data.preferred_range and dist <= actor.stats.attack_range.get_value():
		sim.log_entry(BattleLogEntry.Type.WAIT, "%s maintains distance." % actor.data.name, {"actor_id": actor.data.id})
		return

	if next_pos != actor.grid_pos:
		sim.grid.move_unit(actor, next_pos)
		sim.log_entry(BattleLogEntry.Type.MOVE, "%s moved to %s" % [actor.data.name, next_pos], 
			{
				"actor_id": actor.data.id, 
				"from": actor.grid_pos, 
				"to": next_pos
			})
	else:
		sim.log_entry(BattleLogEntry.Type.WAIT, "%s is blocked." % actor.data.name, {"actor_id": actor.data.id})

func execute_flee(actor: Object, target: Object, sim: Object):
	var dir = (actor.grid_pos - target.grid_pos)
	var flee_pos = actor.grid_pos + Vector2i(sign(dir.x), sign(dir.y))
	
	if sim.grid.is_valid_pos(flee_pos) and not sim.grid.is_occupied(flee_pos):
		sim.grid.move_unit(actor, flee_pos)
		sim.log_entry(BattleLogEntry.Type.MOVE, "%s flees to %s!" % [actor.data.name, flee_pos], 
			{"actor_id": actor.data.id, "from": actor.grid_pos, "to": flee_pos})
	else:
		sim.rules.perform_attack(actor, target, sim)

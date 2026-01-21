class_name AITargetFinder
extends RefCounted

## Component responsible for finding targets based on unit priorities.

func find_target(actor: Object, all_units: Array, grid: Object) -> Object:
	var potential_targets = []
	for unit in all_units:
		if unit.is_dead or unit.team_id == actor.team_id: continue
		potential_targets.append(unit)
	
	if potential_targets.is_empty(): return null
	
	match actor.data.target_priority:
		UnitData.TargetPriority.CLOSEST:
			potential_targets.sort_custom(func(a, b): return grid.get_distance(actor.grid_pos, a.grid_pos) < grid.get_distance(actor.grid_pos, b.grid_pos))
		UnitData.TargetPriority.FURTHEST:
			potential_targets.sort_custom(func(a, b): return grid.get_distance(actor.grid_pos, a.grid_pos) > grid.get_distance(actor.grid_pos, b.grid_pos))
		UnitData.TargetPriority.LOWEST_HP:
			potential_targets.sort_custom(func(a, b): return a.stats.current_health < b.stats.current_health)
		UnitData.TargetPriority.HIGHEST_HP:
			potential_targets.sort_custom(func(a, b): return a.stats.current_health > b.stats.current_health)
		UnitData.TargetPriority.MOST_DANGEROUS:
			potential_targets.sort_custom(func(a, b): return a.stats.attack_damage.get_value() > b.stats.attack_damage.get_value())
			
	return potential_targets[0]

class_name BattleSimulation
extends BaseBattleSimulation

## Coordination class for the battle simulation.

const MAX_TICKS: int = 1000

var ai: BattleAIProcessor
var rules: BattleRuleProcessor

func _init(grid_width: int, grid_height: int):
	super._init(grid_width, grid_height)
	ai = BattleAIProcessor.new()
	rules = BattleRuleProcessor.new()

func add_unit(unit_data: UnitData, team: int, pos: Vector2i):
	var unit = load("res://src/core/battle/battle_unit.gd").new(unit_data, team, pos)
	if grid.place_unit(unit, pos):
		units.append(unit)
		return unit
	else:
		push_error("Failed to place unit at %s" % pos)
		return null

func run_simulation() -> Array[BattleLogEntry]:
	log_entry(BattleLogEntry.Type.GAME_START, "Battle Started!")
	while not is_finished and current_tick < MAX_TICKS:
		_process_tick()
	return logs

func _process_tick():
	current_tick += 1
	for unit in units:
		if not unit.is_dead: unit.tick(1.0)
	
	units.sort_custom(func(a, b): return a.current_action_points > b.current_action_points)
	
	for unit in units:
		if unit.is_dead: continue
		if unit.is_ready_to_act():
			unit.reset_action_points()
			unit.reduce_cooldowns()
			ai.decide_action(unit, self)
			rules.apply_regen(unit) # Apply regeneration after turn
			if rules.check_win_condition(self): return

	rules.resolve_deaths(self)
	rules.check_win_condition(self)
class_name BaseBattleSimulation
extends RefCounted

## Base class for simulation state.

var grid: BattleGrid
var units: Array = []
var current_tick: int = 0
var logs: Array[BattleLogEntry] = []
var is_finished: bool = false
var winner_team: int = -1

func _init(grid_width: int, grid_height: int):
	grid = BattleGrid.new(grid_width, grid_height)

func log_entry(type: BattleLogEntry.Type, msg: String, data: Dictionary = {}):
	var entry = BattleLogEntry.new(current_tick, type, msg, data)
	# Snapshot state
	for unit in units:
		entry.unit_states[unit.data.id] = {
			"hp": unit.stats.current_health,
			"ap": unit.current_action_points
		}
	logs.append(entry)

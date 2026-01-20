class_name BaseLogPlayer
extends Node

## Abstract base class for playing back logs simultaneously per tick.

var board: Node2D
var controller: Node
var vfx: Node2D

func setup(p_board: Node2D, p_controller: Node, p_vfx: Node2D):
	board = p_board
	controller = p_controller
	vfx = p_vfx

func play_logs(logs: Array[BattleLogEntry]):
	var i = 0
	while i < logs.size():
		var current_tick = logs[i].tick
		var batch: Array[BattleLogEntry] = []
		
		# Group logs that happen in the same tick
		while i < logs.size() and logs[i].tick == current_tick:
			batch.append(logs[i])
			i += 1
		
		# Execute all logs in the batch SIMULTANEOUSLY
		for entry in batch:
			update_unit_visuals(entry)
			process_entry(entry) # No 'await' here to allow parallel execution
		
		# Wait for a brief moment after each batch (tick moment)
		# This controls the "Real-time" speed feeling.
		await get_tree().create_timer(_get_wait_time_for_batch(batch)).timeout

func update_unit_visuals(entry: BattleLogEntry):
	for unit_id in entry.unit_states.keys():
		var view = board.get_view(unit_id)
		if view and is_instance_valid(view):
			var state = entry.unit_states[unit_id]
			view.update_action_bar(state["ap"], 100.0)
			
			var sim_unit = controller.find_unit_in_sim(unit_id)
			if sim_unit:
				view.update_hp(state["hp"], sim_unit.stats.health_max.get_value())
			else:
				view.update_hp(state["hp"])

func _get_wait_time_for_batch(batch: Array[BattleLogEntry]) -> float:
	# If something important happened (Attack/Skill), wait longer.
	# If it's just movement or start, wait shorter.
	for entry in batch:
		if entry.type in [BattleLogEntry.Type.ATTACK, BattleLogEntry.Type.CAST_SKILL, BattleLogEntry.Type.DEATH]:
			return 0.6 # Longer pause for impact
	return 0.2 # Fast movement

func process_entry(entry: BattleLogEntry):
	controller.emit_signal("log_message", entry.to_string())

func wait_for_entry(_entry: BattleLogEntry):
	pass # Deprecated by batch logic

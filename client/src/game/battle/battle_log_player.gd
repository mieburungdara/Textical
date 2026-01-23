class_name BattleLogPlayer
extends BaseLogPlayer

## Orchestra class that handles data conversion from Server JSON to Godot Types.

@onready var move_handler: LogMoveHandler = $MoveHandler
@onready var attack_handler: LogAttackHandler = $AttackHandler
@onready var skill_handler: LogSkillHandler = $SkillHandler
@onready var state_handler: LogStateHandler = $StateHandler

func play_logs(raw_logs: Array):
	var converted_logs: Array[BattleLogEntry] = []
	for dict in raw_logs:
		var type_idx = _get_type_enum(dict["type"])
		var entry = BattleLogEntry.new(int(dict["tick"]), type_idx as BattleLogEntry.Type, dict["message"], dict["data"])
		entry.unit_states = dict["unit_states"]
		if entry.data.has("actor_id"): entry.actor_id = entry.data["actor_id"]
		if entry.data.has("target_id"): entry.target_id = entry.data["target_id"]
		_fix_json_vector_data(entry)
		converted_logs.append(entry)
	super.play_logs(converted_logs)

func _get_type_enum(type_name: String) -> int:
	match type_name:
		"MOVE": return BattleLogEntry.Type.MOVE
		"ATTACK": return BattleLogEntry.Type.ATTACK
		"CAST_SKILL": return BattleLogEntry.Type.CAST_SKILL
		"DEATH": return BattleLogEntry.Type.DEATH
		"GAME_START": return BattleLogEntry.Type.GAME_START
		"GAME_OVER": return BattleLogEntry.Type.GAME_OVER
		"VFX": return BattleLogEntry.Type.VFX
	return BattleLogEntry.Type.WAIT

func process_entry(entry: BattleLogEntry):
	# Pre-playback data conversion
	_fix_json_vector_data(entry)
	super.process_entry(entry)
	
	match entry.type:
		BattleLogEntry.Type.MOVE: await move_handler.handle(entry)
		BattleLogEntry.Type.ATTACK: await attack_handler.handle(entry)
		BattleLogEntry.Type.CAST_SKILL: await skill_handler.handle(entry)
		BattleLogEntry.Type.VFX:
			var vfx_name = entry.data.get("vfx", "burn")
			var grid_pos = Vector2i(0,0)
			if entry.unit_states.has(entry.actor_id): grid_pos = entry.unit_states[entry.actor_id]["pos"]
			vfx.spawn_vfx(vfx_name, grid_pos)
		BattleLogEntry.Type.DEATH, BattleLogEntry.Type.GAME_OVER:
			await state_handler.handle(entry)
		BattleLogEntry.Type.WAIT: await get_tree().create_timer(0.3).timeout

func _fix_json_vector_data(entry: BattleLogEntry):
	if entry.data.has("to") and entry.data["to"] is Dictionary:
		entry.data["to"] = Vector2i(int(entry.data["to"]["x"]), int(entry.data["to"]["y"]))
	if entry.data.has("target_pos") and entry.data["target_pos"] is Dictionary:
		entry.data["target_pos"] = Vector2i(int(entry.data["target_pos"]["x"]), int(entry.data["target_pos"]["y"]))
	for id in entry.unit_states:
		var state = entry.unit_states[id]
		if state.has("pos") and state["pos"] is Dictionary:
			state["pos"] = Vector2i(int(state["pos"]["x"]), int(state["pos"]["y"]))
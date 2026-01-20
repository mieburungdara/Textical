class_name BattleLogEntry
extends RefCounted

enum Type {
	MOVE,
	ATTACK,
	CAST_SKILL,
	HEAL,
	BUFF,
	DEATH,
	WAIT,
	GAME_START,
	GAME_OVER
}

var type: Type
var tick: int
var actor_id: String # Or index in unit list
var target_id: String
var message: String
var data: Dictionary = {} # Extra data
var unit_states: Dictionary = {} # Snapshot: { "unit_id": {"hp": 50, "ap": 20} }

func _init(p_tick: int, p_type: Type, p_msg: String, p_data: Dictionary = {}):
	tick = p_tick
	type = p_type
	message = p_msg
	data = p_data

func _to_string():
	return "[Tick %s] %s" % [tick, message]

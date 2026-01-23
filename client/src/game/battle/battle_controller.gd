class_name BattleController
extends BaseBattleController

## Professional Authoritative Battle Controller.
## Handles Server Rewards, Quests, and Visual Synchronization.

@onready var board: BattleBoard = $BattleBoard
@onready var vfx: VFXManager = $VFXManager
@onready var log_player: BattleLogPlayer = $BattleLogPlayer
@onready var log_label: RichTextLabel = $UI/LogPanel/ScrollContainer/LogLabel

var authoritative_registry: Dictionary = {}
var pending_rewards: Dictionary = {}
var pending_kills: Array = []

const HERO_MAP = {
	"Novice": "res://data/units/heroes/Novice.tres",
	"Knight": "res://data/units/heroes/Knight.tres",
	"Archer": "res://data/units/heroes/Archer.tres",
	"Mage": "res://data/units/heroes/Mage.tres"
}

const MONSTER_MAP = {
	"mob_orc": "res://data/units/monsters/Orc.tres"
}

func _ready():
	vfx.setup(board)
	log_player.setup(board, self, vfx)
	ServerConnector.battle_result_received.connect(_on_battle_result_received)
	request_battle_from_server()

func request_battle_from_server():
	var dungeon_id = AdventureManager.current_region.id if AdventureManager.current_region else "starter_village"
	ServerConnector.request_battle(dungeon_id, GlobalGameManager.player_party)

func _on_battle_result_received(result: Dictionary):
	pending_rewards = result.get("rewards", {"gold": 0, "exp": 0})
	pending_kills = result.get("killed_monsters", [])
	_spawn_initial_views(result)
	
	await log_player.play_logs(result["logs"])
	
	_apply_rewards()

func _spawn_initial_views(result: Dictionary):
	authoritative_registry.clear()
	for child in board.get_children(): if child is UnitView: child.queue_free()
	
	var state = result.get("initial_state", {})
	for info in state.get("players", []):
		var pos = Vector2i(int(info["pos"]["x"]), int(info["pos"]["y"]))
		var res = load(HERO_MAP.get(info["id"], HERO_MAP["Novice"]))
		var view = board.spawn_unit_view(res, 0, pos)
		view.unit_id = info["instance_id"]
		authoritative_registry[view.unit_id] = { "health_max": info["final_stats"]["health_max"], "data": res }
	
	for info in state.get("enemies", []):
		var pos = Vector2i(int(info["pos"]["x"]), int(info["pos"]["y"]))
		var res = load(MONSTER_MAP.get(info["id"], MONSTER_MAP["mob_orc"]))
		var view = board.spawn_unit_view(res, 1, pos)
		view.unit_id = info["instance_id"]
		authoritative_registry[view.unit_id] = { "health_max": info["final_stats"]["health_max"], "data": res }

func _apply_rewards():
	if pending_rewards.get("gold", 0) > 0:
		GlobalGameManager.gold += pending_rewards["gold"]
		log_label.append_text("\n[b][color=gold]VICTORY! Gained %d Gold.[/color][/b]" % pending_rewards["gold"])
	
	## Update Hero XP
	for pos in GlobalGameManager.player_party:
		var hero = GlobalGameManager.player_party[pos] as HeroData
		if hero: hero.experience += pending_rewards.get("exp", 0)
	
	## Update Quest Progress (CRITICAL FIX)
	for monster_id in pending_kills:
		GlobalGameManager.update_quest_progress(monster_id, 1)
	
	SaveManager.save_game()

func get_max_hp(p_unit_id: String) -> float:
	return authoritative_registry.get(p_unit_id, {}).get("health_max", 100.0)

func get_unit_data(p_unit_id: String) -> UnitData:
	return authoritative_registry.get(p_unit_id, {}).get("data")
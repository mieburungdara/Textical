extends Node

## Singleton for managing global state, player progression, and economy.

# Economy & Collection
var gold: int = 500
var owned_heroes: Array[HeroData] = []

# Party & Battle State
var player_party: Dictionary = {} # Pos (Vector2i) -> UnitData
var enemy_party_to_load: Array[MonsterData] = []
var enemy_level: int = 1

# Progression
var active_quests: Array[QuestData] = []

func update_quest_progress(monster_id: String, amount: int = 1):
	for quest in active_quests:
		if quest.type == QuestData.QuestType.KILL_MONSTER and quest.target_id == monster_id:
			quest.current_amount += amount
			if quest.check_completion():
				print("Quest Completed: ", quest.title)

func start_battle_with_party(party: Dictionary):
	player_party = party
	get_tree().change_scene_to_file("res://src/game/battle/BattleScene.tscn")
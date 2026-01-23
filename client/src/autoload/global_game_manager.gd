extends Node

## Singleton for managing global state, player progression, and economy.

# Economy
var gold: int = 500

# Party & Battle State
var player_party: Dictionary = {} # Pos (Vector2i) -> UnitData
var enemy_party_to_load: Array[MonsterData] = []
var enemy_level: int = 1

# Progression
var active_quests: Array[QuestData] = []
var fame_score: int = 0 # Increased by completing quests

func update_quest_progress(monster_id: String, amount: int = 1):
	for quest in active_quests:
		if quest.type == QuestData.QuestType.KILL_MONSTER and quest.target_id == monster_id:
			if not quest.is_completed:
				quest.current_amount += amount
				if quest.check_completion():
					quest.is_completed = true
					fame_score += 10 # Increase fame
					print("Quest Completed: ", quest.title, " | Fame +10")

func start_battle_with_party(party: Dictionary):
	player_party = party
	get_tree().change_scene_to_file("res://src/game/battle/BattleScene.tscn")
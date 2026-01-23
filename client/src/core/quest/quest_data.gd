class_name QuestData
extends Resource

## Data representing a quest for job promotion or rewards.

enum QuestType { KILL_MONSTER, COLLECT_ITEM, REACH_LEVEL }

@export_group("Identity")
@export var id: String = "quest_001"
@export var title: String = "Trial of Strength"
@export_multiline var description: String = ""

@export_group("Requirements")
@export var type: QuestType = QuestType.KILL_MONSTER
@export var target_id: String = "" # ID of monster or item
@export var target_amount: int = 10

@export_group("Promotion")
@export var reward_job: JobData # The class granted upon completion

# Runtime State (Should be handled by a Manager or HeroData)
var current_amount: int = 0
var is_completed: bool = false

func check_completion() -> bool:
	return current_amount >= target_amount

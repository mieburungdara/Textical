class_name MonsterData
extends UnitData

enum MonsterRank { MINION, ELITE, BOSS, WORLD_BOSS }

@export_group("Monster Specifics")
@export var rank: MonsterRank = MonsterRank.MINION
@export var experience_reward: int = 10
@export var gold_reward_min: int = 1
@export var gold_reward_max: int = 5

## Loot Table: Array of LootItems (Resource) - Will implement later
# @export var loot_table: Array[LootData]

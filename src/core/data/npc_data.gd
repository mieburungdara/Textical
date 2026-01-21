class_name NPCData
extends Resource

## Data representing an NPC in a town or village.

@export_group("Identity")
@export var id: String = "npc_001"
@export var name: String = "Job Master"
@export var icon: Texture2D
@export_multiline var welcome_message: String = "Greetings, traveler!"

@export_group("Offerings")
## The quest this NPC can give to the player
@export var offered_quest: QuestData
## If the player already has this job, show this message
@export_multiline var completed_message: String = "You have proven your worth."

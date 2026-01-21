class_name JobData
extends Resource

## Data representing a specific Hero Class/Job.

@export_group("Identity")
@export var id: String = "job_warrior"
@export var display_name: String = "Warrior"
@export var icon: Texture2D
@export var description: String = ""

@export_group("Promotion Requirements")
@export var tier: int = 1 
@export var required_level: int = 10
@export var required_job_ids: Array[String] = [] 
@export var unlock_quest: QuestData # Quest needed to unlock this job

@export_group("Stat Modifiers")
## Multipliers applied to base unit stats when this job is active.
## 1.2 = +20% bonus to that stat.
@export var hp_mult: float = 1.0
@export var mana_mult: float = 1.0
@export var damage_mult: float = 1.0
@export var speed_mult: float = 1.0
@export var range_bonus: int = 0

@export_group("Job Content")
## Skills automatically granted by this job.
@export var granted_skills: Array[SkillData] = []
## Passive traits granted by this job.
@export var granted_traits: Array[Trait] = []

@export_group("Evolution")
## What this class can turn into next.
@export var promotion_options: Array[JobData] = []

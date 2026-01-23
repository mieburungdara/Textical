class_name HeroData
extends UnitData

## Data for a persistent hero with unique individual growth and stats.

enum Rarity { NORMAL, UNCOMMON, RARE, EPIC, LEGENDARY }

@export_group("Job System")
@export var current_job: JobData
@export var experience: int = 0
@export var level: int = 1

@export_group("Individual Potentials")
@export var rarity: Rarity = Rarity.NORMAL
@export var hp_bonus: int = 0
@export var damage_bonus: int = 0
@export var speed_bonus: float = 0.0

@export_group("Loadout")
## Key: EquipmentData.Slot (int), Value: ItemInstance (The unique owned item)
@export var equipment: Dictionary = {}

func _init():
	pass

## Randomize this hero's unique potential based on rarity.
func generate_random_stats(p_rarity: Rarity = Rarity.NORMAL):
	rarity = p_rarity
	var mult = 1.0 + (int(rarity) * 0.5)
	hp_bonus = int(randi_range(5, 20) * mult)
	damage_bonus = int(randi_range(1, 5) * mult)
	speed_bonus = snapped(randf_range(-0.5, 1.5) * mult, 0.1)

func get_rarity_color() -> Color:
	match rarity:
		Rarity.UNCOMMON: return Color.CYAN
		Rarity.RARE: return Color.GOLD
		Rarity.EPIC: return Color.PURPLE
		Rarity.LEGENDARY: return Color.ORANGE_RED
		_: return Color.WHITE

func create_base_runtime_stats() -> UnitStats:
	return super.create_runtime_stats()

func create_runtime_stats() -> UnitStats:
	# DECORATOR PATTERN: Delegate to centralized Processor
	return load("res://src/core/stats/stat_processor.gd").calculate_final_stats(self)
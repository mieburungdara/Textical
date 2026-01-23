class_name UnitData
extends Resource

@export_group("Identity")
@export var id: String = "unit_id"
@export var name: String = "Unit Name"
@export_multiline var description: String = ""
@export var icon: Texture2D

@export_group("Visual Configuration")
@export var model_color: Color = Color.WHITE
@export var model_scale: float = 1.0
@export var default_projectile_scene: PackedScene

enum Element { NEUTRAL, FIRE, WATER, NATURE, EARTH, LIGHTNING }
@export var element: Element = Element.NEUTRAL

@export_group("Base Stats Template")
@export var hp_base: int = 100
@export var mana_base: int = 50
@export var damage_base: int = 10
@export var defense_base: int = 0
@export var speed_base: int = 5
@export var range_base: int = 1

@export_group("Sustain Stats")
@export var hp_regen: int = 0    ## HP restored every time this unit acts
@export var mana_regen: int = 2  ## Mana restored every time this unit acts

@export_group("Secondary Stats")
@export var crit_chance: float = 0.05
@export var crit_damage: float = 1.5
@export var dodge_chance: float = 0.0  ## Chance to completely avoid an attack
@export var block_chance: float = 0.0  ## Chance to reduce damage further

@export_group("Elemental Resistances")
## 1.0 = Neutral, 0.5 = Resistant (Half damage), 2.0 = Weak (Double damage)
@export var res_fire: float = 1.0
@export var res_water: float = 1.0
@export var res_wind: float = 1.0
@export var res_earth: float = 1.0
@export var res_lightning: float = 1.0

@export_group("Skills")
@export var skills: Array[SkillData] = []

@export_group("Traits")
@export var traits: Array[Trait] = []

@export_group("AI Behavior")
enum TargetPriority { CLOSEST, FURTHEST, LOWEST_HP, HIGHEST_HP, MOST_DANGEROUS }
@export var target_priority: TargetPriority = TargetPriority.CLOSEST
@export var preferred_range: int = 1
@export var flee_threshold: float = 0.0 ## Flee to corner if HP % below this (0.0 to 1.0)

## Creates a runtime instance of UnitStats (unique copy)
func create_runtime_stats() -> UnitStats:
	var s = UnitStats.new()
	
	s.health_max = Stat.new(hp_base)
	s.mana_max = Stat.new(mana_base)
	s.attack_damage = Stat.new(damage_base)
	s.defense = Stat.new(defense_base)
	s.speed = Stat.new(speed_base)
	s.attack_range = Stat.new(range_base)
	s.critical_chance = Stat.new(crit_chance)
	s.critical_damage = Stat.new(crit_damage)
	
	# New mappings
	s.hp_regen = Stat.new(hp_regen)
	s.mana_regen = Stat.new(mana_regen)
	s.evasion = Stat.new(dodge_chance)
	s.block = Stat.new(block_chance)
	
	s.initialize_state()
	return s

## Helper to get resistance by element enum from SkillData
func get_resistance_for_element(element: int) -> float:
	match element:
		1: return res_fire    # Element.FIRE
		2: return res_water   # Element.WATER
		3: return res_wind    # Element.WIND
		4: return res_earth   # Element.EARTH
		5: return res_lightning # Element.LIGHTNING
		_: return 1.0
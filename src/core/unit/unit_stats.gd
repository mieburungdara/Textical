class_name UnitStats
extends Resource

# Core Stats
@export var health_max: Stat
@export var mana_max: Stat
@export var attack_damage: Stat
@export var defense: Stat
@export var speed: Stat
@export var attack_range: Stat

# Secondary/Complex Stats
@export var critical_chance: Stat
@export var critical_damage: Stat
@export var evasion: Stat # Dodge chance
@export var block: Stat   # Block chance

# Regen Stats
@export var hp_regen: Stat
@export var mana_regen: Stat

# Current State (Volatile data)
var current_health: float
var current_mana: float
var current_action_points: float = 0.0

func _init():
	# Default init if not provided by UnitData
	if not health_max: health_max = Stat.new(100)
	if not mana_max: mana_max = Stat.new(50)
	if not attack_damage: attack_damage = Stat.new(10)
	if not defense: defense = Stat.new(0)
	if not speed: speed = Stat.new(5)
	if not attack_range: attack_range = Stat.new(1)
	if not critical_chance: critical_chance = Stat.new(0.05)
	if not critical_damage: critical_damage = Stat.new(1.5)
	if not evasion: evasion = Stat.new(0.0)
	if not block: block = Stat.new(0.0)
	if not hp_regen: hp_regen = Stat.new(0)
	if not mana_regen: mana_regen = Stat.new(2)
	
	initialize_state()

func initialize_state():
	current_health = health_max.get_value()
	current_mana = mana_max.get_value()
	current_action_points = 0.0

func add_modifier(stat_name: String, value: float, type: StatModifier.Type, source: String) -> StatModifier:
	var stat_obj = get(stat_name) as Stat
	if stat_obj:
		var mod = StatModifier.new(value, type, source)
		stat_obj.add_modifier(mod)
		return mod
	return null
class_name BattleUnit
extends RefCounted

## Represents a unit instance inside a specific battle simulation.
## This is NOT a Godot Node. It is a pure data class.

var data: UnitData
var stats: UnitStats
var team_id: int = 0 # 0 for Player, 1 for Enemy/Opponent
var grid_pos: Vector2i = Vector2i.ZERO

# Simulation State
var current_action_points: float = 0.0
var is_dead: bool = false
var target_unit: Object = null # Using Object to avoid circular dependency

# Skill State: Key = SkillData.id, Value = current cooldown (int)
var skill_cooldowns: Dictionary = {}

# Status Effects
var active_effects: Array = []

func _init(p_data: UnitData, p_team: int, start_pos: Vector2i):
	data = p_data
	team_id = p_team
	grid_pos = start_pos
	
	# Create unique runtime stats
	stats = data.create_runtime_stats()
	
	# Init Cooldowns
	for skill in data.skills:
		if skill:
			skill_cooldowns[skill.id] = 0

func add_effect(effect_data: StatusEffect):
	# Check if effect already exists (refresh duration)
	for existing in active_effects:
		if existing.id == effect_data.id:
			existing.current_duration = effect_data.duration_turns
			return
	
	# New effect
	var new_instance = effect_data.duplicate()
	new_instance.current_duration = effect_data.duration_turns
	active_effects.append(new_instance)
	new_instance.apply(self)

func tick(delta_time: float):
	if is_dead: return
	
	# Speed formula: A unit with 10 Speed gains 10 AP per second (if delta is 1.0)
	var speed_val = stats.speed.get_value()
	current_action_points += speed_val * delta_time

func reduce_cooldowns():
	# 1. Process turn-based status effects
	var to_remove = []
	for effect in active_effects:
		if effect.process_turn(self):
			to_remove.append(effect)
	
	for effect in to_remove:
		effect.remove(self)
		active_effects.erase(effect)

	# 2. Process skill cooldowns
	for sk_id in skill_cooldowns.keys():
		if skill_cooldowns[sk_id] > 0:
			skill_cooldowns[sk_id] -= 1

func get_usable_skills() -> Array[SkillData]:
	var usable: Array[SkillData] = []
	for skill in data.skills:
		if not skill: continue
		var cd = skill_cooldowns.get(skill.id, 0)
		var cost = skill.mana_cost
		if cd <= 0 and stats.current_mana >= cost:
			usable.append(skill)
	return usable

func put_skill_on_cooldown(skill: SkillData):
	skill_cooldowns[skill.id] = skill.cooldown_turns
	stats.current_mana -= skill.mana_cost

func is_ready_to_act() -> bool:
	return current_action_points >= 100.0

func reset_action_points():
	current_action_points = 0.0

func take_damage(amount: float, _source: Object):
	stats.current_health -= amount
	if stats.current_health <= 0:
		stats.current_health = 0

func heal(amount: float):
	stats.current_health += amount
	if stats.current_health > stats.health_max.get_value():
		stats.current_health = stats.health_max.get_value()

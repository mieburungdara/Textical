extends VBoxContainer
class_name SkillsTab

## SkillsTab - Component untuk menampilkan tab skills hero
## Features: Active skills dan passive skills dengan visualisasi detail

# === PRELOADS ===
const SkillListItemScene = preload("res://src/ui/components/SkillListItem.tscn")

# === NODE REFERENCES ===
@onready var active_list: VBoxContainer = $ScrollContainer/Content/ActiveSection/ActiveList
@onready var passive_list: VBoxContainer = $ScrollContainer/Content/PassiveSection/PassiveList
@onready var active_section: VBoxContainer = $ScrollContainer/Content/ActiveSection
@onready var passive_section: VBoxContainer = $ScrollContainer/Content/PassiveSection

# === PRIVATE VARIABLES ===
var _current_hero: Dictionary = {}
var _mastery_data: Dictionary = {}  # skillId -> mastery info

# === PUBLIC METHODS ===

## Update skills tab dengan data hero
func update_skills(hero_data: Dictionary):
	_current_hero = hero_data
	_update_active_skills()
	_update_passive_skills()
	
	# Fetch mastery data from server
	var hero_id = hero_data.get("id", 0)
	if hero_id > 0 and SkillMasteryHandler:
		SkillMasteryHandler.fetch_hero_masteries(hero_id)
		SkillMasteryHandler.mastery_data_received.connect(_on_mastery_data_received)
		SkillMasteryHandler.mastery_error.connect(_on_mastery_error)

## Clear semua content
func clear_content():
	_clear_container(active_list)
	_clear_container(passive_list)

# === PRIVATE METHODS ===

func _update_active_skills():
	if not active_list: return
	
	_clear_container(active_list)
	
	var skills = _current_hero.get("skills", [])
	
	if skills.is_empty():
		var no_skills = Label.new()
		no_skills.text = "No active skills learned."
		no_skills.modulate = Color(0.5, 0.5, 0.5)
		no_skills.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		active_list.add_child(no_skills)
	else:
		for skill in skills:
			# Normalisasi data skill jika hanya string nama
			var skill_data = {}
			if skill is String:
				skill_data = {"name": skill, "description": "Basic skill knowledge.", "element": "PHYSICAL"}
			elif skill is Dictionary:
				skill_data = skill
			
			# Merge with mastery data if available
			var skill_id = skill_data.get("id", 0)
			if skill_id > 0 and _mastery_data.has(skill_id):
				var mastery = _mastery_data[skill_id]
				skill_data["mastery_level"] = mastery.get("level", "NOVICE")
				skill_data["mastery_use_count"] = mastery.get("useCount", 0)
				skill_data["mastery_bonus"] = _get_bonus_text(mastery)
			
			var item = SkillListItemScene.instantiate()
			active_list.add_child(item)
			item.setup(skill_data, false)

func _update_passive_skills():
	if not passive_list: return
	
	_clear_container(passive_list)
	
	var passives = _current_hero.get("passives", [])
	
	if passives.is_empty():
		var no_passives = Label.new()
		no_passives.text = "No passive traits."
		no_passives.modulate = Color(0.5, 0.5, 0.5)
		no_passives.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		passive_list.add_child(no_passives)
	else:
		for passive in passives:
			# Data sudah di-flatten oleh backend (name, level, description, category)
			var passive_data: Dictionary = {}
			if passive is String:
				passive_data = {"name": passive, "description": "Inherent trait.", "category": "TRAIT", "level": 1}
			elif passive is Dictionary:
				passive_data = passive
			
			var item = SkillListItemScene.instantiate()
			passive_list.add_child(item)
			item.setup(passive_data, true)

func _clear_container(container: Node):
	if not container: return
	for child in container.get_children():
		child.queue_free()

## Handle mastery data received from server
func _on_mastery_data_received(hero_id: int, masteries: Array):
	# Convert array to dictionary for easier lookup
	_mastery_data.clear()
	for mastery in masteries:
		var skill_id = mastery.get("skillId", 0)
		if skill_id > 0:
			_mastery_data[skill_id] = mastery
	
	# Refresh the skills display with mastery data
	_update_active_skills()
	_update_passive_skills()

## Handle mastery fetch error
func _on_mastery_error(message: String):
	push_warning("[SkillsTab] Mastery fetch error: " + message)

## Get bonus text for mastery display
func _get_bonus_text(mastery: Dictionary) -> String:
	var level = mastery.get("level", "NOVICE")
	if level == "NOVICE":
		return ""
	
	var bonuses = []
	var skill_damage = mastery.get("skillDamageBonus", 0)
	var effect_duration = mastery.get("effectDurationBonus", 0)
	var crit_chance = mastery.get("critChanceBonus", 0)
	var cost_reduction = mastery.get("costReduction", 0)
	
	if skill_damage > 0:
		bonuses.append("+%d%% damage" % skill_damage)
	if effect_duration > 0:
		bonuses.append("+%d%% duration" % effect_duration)
	if crit_chance > 0:
		bonuses.append("+%d%% crit" % crit_chance)
	if cost_reduction > 0:
		bonuses.append("-%d%% cost" % cost_reduction)
	
	return ", ".join(bonuses)

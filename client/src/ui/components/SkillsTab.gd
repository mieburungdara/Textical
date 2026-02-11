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

# === PUBLIC METHODS ===

## Update skills tab dengan data hero
func update_skills(hero_data: Dictionary):
	_current_hero = hero_data
	_update_active_skills()
	_update_passive_skills()

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
			# Normalisasi
			var passive_data = {}
			if passive is String:
				passive_data = {"name": passive, "description": "Inherent trait.", "category": "TRAIT"}
			elif passive is Dictionary:
				passive_data = passive
			
			var item = SkillListItemScene.instantiate()
			passive_list.add_child(item)
			item.setup(passive_data, true)

func _clear_container(container: Node):
	if not container: return
	for child in container.get_children():
		child.queue_free()

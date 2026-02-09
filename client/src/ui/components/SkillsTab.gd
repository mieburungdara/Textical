extends VBoxContainer
class_name SkillsTab

## SkillsTab - Component untuk menampilkan tab skills hero
## Features: Active skills dan passive skills

# === NODE REFERENCES ===
@onready var active_skills_content: VBoxContainer = $ActiveSkillsPanel/ActiveSkillsContent
@onready var passive_skills_content: VBoxContainer = $PassiveSkillsPanel/PassiveSkillsContent

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
	_clear_active_skills()
	_clear_passive_skills()

# === PRIVATE METHODS ===

func _update_active_skills():
	if not active_skills_content: return
	
	# Clear existing content
	_clear_active_skills()
	
	var skills = _current_hero.get("skills", [])
	
	if skills.is_empty():
		var no_skills = Label.new()
		no_skills.text = "No skills available"
		no_skills.modulate = Color(0.5, 0.5, 0.5)
		active_skills_content.add_child(no_skills)
	else:
		for skill in skills:
			var skill_name = ""
			if skill is Dictionary:
				skill_name = skill.get("name", "Unknown")
			elif skill is String:
				skill_name = skill
			
			var skill_label = Label.new()
			skill_label.text = "• " + skill_name
			active_skills_content.add_child(skill_label)

func _clear_active_skills():
	if not active_skills_content: return
	for child in active_skills_content.get_children():
		child.queue_free()

func _update_passive_skills():
	if not passive_skills_content: return
	
	# Clear existing content
	_clear_passive_skills()
	
	var passives = _current_hero.get("passives", [])
	
	if passives.is_empty():
		var no_passives = Label.new()
		no_passives.text = "No passive skills"
		no_passives.modulate = Color(0.5, 0.5, 0.5)
		passive_skills_content.add_child(no_passives)
	else:
		for passive in passives:
			var passive_name = ""
			if passive is Dictionary:
				passive_name = passive.get("name", "Unknown")
			elif passive is String:
				passive_name = passive
			
			var passive_item_label = Label.new()
			passive_item_label.text = "• " + passive_name
			passive_skills_content.add_child(passive_item_label)

func _clear_passive_skills():
	if not passive_skills_content: return
	for child in passive_skills_content.get_children():
		child.queue_free()

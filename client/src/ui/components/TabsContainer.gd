extends TabContainer
class_name HeroTabsContainer

## HeroTabsContainer - Component untuk menampilkan tab Stats/Equipment/Skills
## Features: Stats tab, Equipment tab, Skills tab dengan dynamic content

# === NODE REFERENCES ===
@onready var stats_tab = $StatsTab
@onready var equipment_tab = $EquipmentTab
@onready var skills_tab = $SkillsTab

# === PRIVATE VARIABLES ===
var _current_hero: Dictionary = {}

func _ready():
	_setup_tabs()

func _setup_tabs():
	# Setup tab names
	set_tab_title(0, "Stats")
	set_tab_title(1, "Equipment")
	set_tab_title(2, "Skills")

# === PUBLIC METHODS ===

## Update semua tab dengan data hero
func update_tabs(hero_data: Dictionary):
	_current_hero = hero_data
	
	# Update individual tabs
	if stats_tab and stats_tab.has_method("update_stats"):
		stats_tab.update_stats(hero_data)
	
	if equipment_tab and equipment_tab.has_method("update_equipment"):
		equipment_tab.update_equipment(hero_data)
	
	if skills_tab and skills_tab.has_method("update_skills"):
		skills_tab.update_skills(hero_data)


## Clear semua content tab
func clear_tabs():
	if stats_tab and stats_tab.has_method("clear_content"):
		stats_tab.clear_content()
	
	if equipment_tab and equipment_tab.has_method("clear_content"):
		equipment_tab.clear_content()
	
	if skills_tab and skills_tab.has_method("clear_content"):
		skills_tab.clear_content()

extends PanelContainer
class_name HeroProfilePanel

## HeroProfilePanel - Panel untuk menampilkan detail hero
## Features: Hero info, tabs for stats/equipment/skills, stat display

signal equipment_changed(hero_id: int, slot: String, item_id: int)

# === NODE REFERENCES ===
@onready var header_section: HBoxContainer = $HeaderSection
@onready var avatar_frame: ColorRect = $HeaderSection/AvatarFrame
@onready var avatar_initial: Label = $HeaderSection/AvatarFrame/AvatarInitial
@onready var info_section: VBoxContainer = $HeaderSection/InfoSection
@onready var name_label: Label = $HeaderSection/InfoSection/NameLabel
@onready var level_label: Label = $HeaderSection/InfoSection/LevelLabel
@onready var class_label: Label = $HeaderSection/InfoSection/ClassLabel
@onready var rarity_label: Label = $HeaderSection/InfoSection/RarityLabel
@onready var stats_summary: HBoxContainer = $HeaderSection/StatsSummary
@onready var tab_container: TabContainer = $TabContainer
@onready var stats_tab: VBoxContainer = $TabContainer/StatsTab
@onready var equipment_tab: HBoxContainer = $TabContainer/EquipmentTab
@onready var skills_tab: VBoxContainer = $TabContainer/SkillsTab
@onready var loading_label: Label = $LoadingLabel

# === PRIVATE VARIABLES ===
var _current_hero: Dictionary = {}
var _stat_displays: Dictionary = {}

func _ready():
	_setup_ui()
	_connect_signals()
	_show_loading()

func _setup_ui():
	# Setup tab names
	tab_container.set_tab_title(0, "Stats")
	tab_container.set_tab_title(1, "Equipment")
	tab_container.set_tab_title(2, "Skills")
	
	# Hide initially
	header_section.visible = false
	tab_container.visible = false

func _connect_signals():
	# Connect to server signals for real-time updates
	if ServerConnector:
		# Check if signals exist before connecting
		if ServerConnector.has_signal("stats_updated"):
			ServerConnector.stats_updated.connect(_on_stats_updated)
		if ServerConnector.has_signal("equipment_updated"):
			ServerConnector.equipment_updated.connect(_on_equipment_updated)

# === PUBLIC METHODS ===

func display_hero(hero_data: Dictionary):
	print("[HeroProfilePanel] display_hero called with: ", hero_data)
	
	# Validate input
	if hero_data.is_empty():
		print("[HeroProfilePanel] ERROR: hero_data is empty!")
		_show_loading()
		return
	
	_current_hero = hero_data
	print("[HeroProfilePanel] Hero name: ", hero_data.get("name", "Unknown"))
	_update_display()

func clear_display():
	_current_hero.clear()
	_show_loading()

# === PRIVATE METHODS ===

func _show_loading():
	loading_label.visible = true
	header_section.visible = false
	tab_container.visible = false

func _update_display():
	if _current_hero.is_empty():
		print("[HeroProfilePanel] _current_hero is empty, showing loading")
		_show_loading()
		return
	
	print("[HeroProfilePanel] _update_display: ", _current_hero.get("name", "Unknown"))
	
	loading_label.visible = false
	header_section.visible = true
	tab_container.visible = true
	
	# Update header info
	name_label.text = _current_hero.get("name", "Unknown")
	
	var level = int(_current_hero.get("level", 1))
	level_label.text = "Level %d" % level
	
	var combat_class = _current_hero.get("combatClass", {})
	var hero_class_name = ""
	if combat_class is Dictionary:
		hero_class_name = combat_class.get("name", "Unit")
	elif combat_class is String:
		hero_class_name = combat_class
	else:
		hero_class_name = "Unit"
	class_label.text = hero_class_name
	
	var rarity = _current_hero.get("rarity", "COMMON")
	rarity_label.text = rarity
	_rarity_color(rarity)
	
	# Avatar initial
	var name = _current_hero.get("name", "U")
	avatar_initial.text = name.substr(0, 1).to_upper()
	
	# Update stats summary
	_update_stats_summary()
	
	# Update tabs
	_update_stats_tab()
	_update_equipment_tab()
	_update_skills_tab()
	
	# Fetch fresh data from server
	_fetch_hero_data()

func _rarity_color(rarity: String):
	var color_map = {
		"COMMON": Color(0.8, 0.8, 0.8),
		"RARE": Color(1.0, 0.8, 0.0),
		"EPIC": Color(0.6, 0.4, 1.0),
		"LEGENDARY": Color(1.0, 0.4, 0.0),
		"MYTHIC": Color(1.0, 0.2, 0.2)
	}
	var color = color_map.get(rarity, color_map["COMMON"])
	rarity_label.add_theme_color_override("font_color", color)

func _update_stats_summary():
	# Clear existing - Godot 4.x compatible
	for child in stats_summary.get_children():
		child.queue_free()
	
	var stats = _current_hero.get("totalStats", {})
	
	# Add key stats
	var key_stats = [
		{"name": "HP", "value": stats.get("hp", 0), "icon": "❤️"},
		{"name": "MP", "value": stats.get("mp", 0), "icon": "💙"},
		{"name": "ATK", "value": stats.get("attack", 0), "icon": "⚔️"},
		{"name": "DEF", "value": stats.get("defense", 0), "icon": "🛡️"}
	]
	
	for stat in key_stats:
		var label = Label.new()
		label.text = "%s %s" % [stat.icon, str(stat.value)]
		stats_summary.add_child(label)

func _update_stats_tab():
	# Clear existing - Godot 4.x compatible
	for child in stats_tab.get_children():
		child.queue_free()
	
	# Add title
	var title = Label.new()
	title.text = "Statistics"
	title.add_theme_font_size_override("font_size", 18)
	stats_tab.add_child(title)
	
	# Main stats section
	var main_stats_label = Label.new()
	main_stats_label.text = "Main Stats"
	main_stats_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	stats_tab.add_child(main_stats_label)
	
	var stats = _current_hero.get("totalStats", {})
	var main_stats = ["hp", "mp", "ap", "attack", "defense", "magic_attack", "magic_defense", "speed"]
	
	for stat_name in main_stats:
		if stats.has(stat_name):
			var row = HBoxContainer.new()
			
			var name_label = Label.new()
			name_label.text = stat_name.capitalize() + ":"
			name_label.custom_minimum_size.x = 120
			row.add_child(name_label)
			
			var value_label = Label.new()
			value_label.text = str(stats[stat_name])
			row.add_child(value_label)
			
			stats_tab.add_child(row)
	
	# Elemental affinities
	var elem_label = Label.new()
	elem_label.text = "\nElemental Affinities"
	elem_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	stats_tab.add_child(elem_label)
	
	var affinities = _current_hero.get("elementalAffinities", [])
	var elements = ["fire", "water", "earth", "wind", "light", "dark"]
	var icons = {"fire": "🔥", "water": "💧", "earth": "🌍", "wind": "🌪️", "light": "☀️", "dark": "🌙"}
	
	for element in elements:
		var value = 0
		if affinities is Array and affinities.size() > 0:
			if affinities[0] is Dictionary:
				value = affinities[0].get(element, 0)
			else:
				var idx = elements.find(element)
				if idx < affinities.size():
					value = affinities[idx]
		
		var row = HBoxContainer.new()
		var icon_label = Label.new()
		icon_label.text = icons.get(element, "•")
		row.add_child(icon_label)
		
		var name_label = Label.new()
		name_label.text = element.capitalize() + ":"
		name_label.custom_minimum_size.x = 80
		row.add_child(name_label)
		
		var value_label = Label.new()
		var sign_str = "+" if value >= 0 else ""
		value_label.text = "%s%d%%" % [sign_str, value]
		value_label.modulate = Color(0.3, 0.9, 0.4) if value >= 0 else Color(0.9, 0.3, 0.3)
		row.add_child(value_label)
		
		stats_tab.add_child(row)

func _update_equipment_tab():
	# Clear existing - Godot 4.x compatible
	for child in equipment_tab.get_children():
		child.queue_free()
	
	# Left side - Equipment slots
	var slots_container = VBoxContainer.new()
	slots_container.size_flags_horizontal = 3
	equipment_tab.add_child(slots_container)
	
	var slots_title = Label.new()
	slots_title.text = "Equipment"
	slots_title.add_theme_font_size_override("font_size", 16)
	slots_container.add_child(slots_title)
	
	var slot_names = ["Head", "Body", "Weapon", "Offhand", "Accessory"]
	
	for slot_name in slot_names:
		var slot_row = HBoxContainer.new()
		
		var slot_label = Label.new()
		slot_label.text = slot_name + ":"
		slot_label.custom_minimum_size.x = 80
		slot_row.add_child(slot_label)
		
		var item_label = Label.new()
		var equipment = _current_hero.get("equipment", {})
		print("Equipment type:", typeof(equipment), " Value:", equipment)
		var equipped_item = {}
		if equipment is Dictionary:
			equipped_item = equipment.get(slot_name.to_lower(), {})
		if equipped_item and equipped_item is Dictionary:
			item_label.text = equipped_item.get("name", "Empty")
		else:
			item_label.text = "Empty"
			item_label.modulate = Color(0.5, 0.5, 0.5)
		
		slot_row.add_child(item_label)
		slots_container.add_child(slot_row)
	
	# Right side - Item details
	var details_container = VBoxContainer.new()
	details_container.size_flags_horizontal = 3
	equipment_tab.add_child(details_container)
	
	var details_title = Label.new()
	details_title.text = "Item Details"
	details_title.add_theme_font_size_override("font_size", 16)
	details_container.add_child(details_title)
	
	var details_label = Label.new()
	details_label.text = "Select an item to view details"
	details_label.modulate = Color(0.6, 0.6, 0.6)
	details_container.add_child(details_label)

func _update_skills_tab():
	# Clear existing - Godot 4.x compatible
	for child in skills_tab.get_children():
		child.queue_free()
	
	# Active skills section
	var active_label = Label.new()
	active_label.text = "Active Skills"
	active_label.add_theme_font_size_override("font_size", 16)
	skills_tab.add_child(active_label)
	
	var skills = _current_hero.get("skills", [])
	if skills.is_empty():
		var no_skills = Label.new()
		no_skills.text = "No skills available"
		no_skills.modulate = Color(0.5, 0.5, 0.5)
		skills_tab.add_child(no_skills)
	else:
		for skill in skills:
			var skill_name = ""
			if skill is Dictionary:
				skill_name = skill.get("name", "Unknown")
			elif skill is String:
				skill_name = skill
			
			var skill_label = Label.new()
			skill_label.text = "• " + skill_name
			skills_tab.add_child(skill_label)
	
	# Passive skills
	var passive_label = Label.new()
	passive_label.text = "\nPassive Skills"
	passive_label.add_theme_font_size_override("font_size", 16)
	skills_tab.add_child(passive_label)
	
	var passives = _current_hero.get("passives", [])
	if passives.is_empty():
		var no_passives = Label.new()
		no_passives.text = "No passive skills"
		no_passives.modulate = Color(0.5, 0.5, 0.5)
		skills_tab.add_child(no_passives)
	else:
		for passive in passives:
			var passive_name = ""
			if passive is Dictionary:
				passive_name = passive.get("name", "Unknown")
			elif passive is String:
				passive_name = passive
			
			var passive_item_label = Label.new()
			passive_item_label.text = "• " + passive_name
			skills_tab.add_child(passive_item_label)

func _fetch_hero_data():
	var hero_id = _current_hero.get("id", -1)
	if hero_id == -1:
		return
	
	if ServerConnector:
		ServerConnector.fetch_unit_stats(hero_id)
		ServerConnector.fetch_elemental_affinities(hero_id)
		ServerConnector.fetch_set_bonuses(hero_id)

func _on_stats_updated(unit_id, stats_data):
	var hero_id = _current_hero.get("id", -1)
	if unit_id == hero_id:
		_current_hero["totalStats"] = stats_data
		_update_stats_summary()
		_update_stats_tab()

func _on_equipment_updated(hero_id, equipment_data):
	if hero_id == _current_hero.get("id", -1):
		_current_hero["equipment"] = equipment_data
		_update_equipment_tab()

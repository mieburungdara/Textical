extends Panel
class_name HeroDetail

## Full Hero Detail View
## Shows: Stats, Equipment, Skills, and more

# UI Elements
@onready var hero_name_label: Label = $MainContainer/Header/HeroName if has_node("MainContainer/Header/HeroName") else null
@onready var close_button: Button = $MainContainer/Header/CloseButton if has_node("MainContainer/Header/CloseButton") else null

# Content Panels
@onready var stats_container: VBoxContainer = $MainContainer/Content/StatsContainer if has_node("MainContainer/Content/StatsContainer") else null
@onready var equipment_container: VBoxContainer = $MainContainer/Content/EquipmentContainer if has_node("MainContainer/Content/EquipmentContainer") else null
@onready var skills_container: VBoxContainer = $MainContainer/Content/SkillsContainer if has_node("MainContainer/Content/SkillsContainer") else null
@onready var info_container: VBoxContainer = $MainContainer/Content/InfoContainer if has_node("MainContainer/Content/InfoContainer") else null

# Data
var hero_data: Dictionary = {}
var is_visible: bool = false
var game_manager: Node = null

# Equipment slot type mapping
enum EquipSlotType { WEAPON, ARMOR, HELMET, BOOTS, ACCESSORY }

func _ready() -> void:
	game_manager = Theme.get_game_manager()
	visible = false
	
	if close_button:
		close_button.pressed.connect(_on_close_pressed)

func show_hero(hero: Dictionary) -> void:
	hero_data = hero
	visible = true
	is_visible = true
	_refresh_display()

func hide_hero() -> void:
	visible = false
	is_visible = false
	hero_data = {}

func toggle() -> void:
	if is_visible:
		hide_hero()
	else:
		show_hero(hero_data)

func _refresh_display() -> void:
	# Header
	if hero_name_label:
		hero_name_label.text = hero_data.get("name", "Unknown Hero")
	
	# Stats
	_refresh_stats()
	
	# Equipment
	_refresh_equipment()
	
	# Skills
	_refresh_skills()
	
	# Info
	_refresh_info()

func _refresh_stats() -> void:
	if stats_container == null:
		return
	
	# Clear existing
	for child in stats_container.get_children():
		child.queue_free()
	
	# Title
	_add_section_title(stats_container, "📊 BASE STATS")
	
	# Get stats (with defaults)
	var stats = hero_data.get("stats", {})
	_add_stat_row(stats_container, "STR", stats.get("str", 0), "Physical damage")
	_add_stat_row(stats_container, "DEX", stats.get("dex", 0), "Speed, Accuracy")
	_add_stat_row(stats_container, "INT", stats.get("int", 0), "Magic damage")
	_add_stat_row(stats_container, "DEF", stats.get("def", 0), "Damage reduction")
	_add_stat_row(stats_container, "SPD", stats.get("spd", 0), "Action order")
	_add_stat_row(stats_container, "VIT", stats.get("vit", 0), "Health pool")
	_add_stat_row(stats_container, "MND", stats.get("mnd", 0), "Mana pool")
	_add_stat_row(stats_container, "LCK", stats.get("lck", 0), "Critical chance")
	
	# Combat stats
	_add_section_title(stats_container, "⚔️ COMBAT STATS")
	_add_stat_row(stats_container, "Attack", hero_data.get("attack", 0), "Base attack power")
	_add_stat_row(stats_container, "Defense", hero_data.get("defense", 0), "Base defense")
	_add_stat_row(stats_container, "Magic", hero_data.get("magic", 0), "Base magic power")
	_add_stat_row(stats_container, "HP", hero_data.get("hp", 100), "Max health")
	_add_stat_row(stats_container, "MP", hero_data.get("mp", 50), "Max mana")

func _refresh_equipment() -> void:
	if equipment_container == null:
		return
	
	# Clear existing
	for child in equipment_container.get_children():
		child.queue_free()
	
	# Title
	_add_section_title(equipment_container, "⚒️ EQUIPMENT (Click to change)")
	
	var equipment = hero_data.get("equipment", {})
	
	# Weapon
	_add_equip_slot(equipment_container, "Weapon", equipment.get("weapon", "[Empty]"), EquipSlotType.WEAPON)
	_add_equip_slot(equipment_container, "Armor", equipment.get("armor", "[Empty]"), EquipSlotType.ARMOR)
	_add_equip_slot(equipment_container, "Helmet", equipment.get("helmet", "[Empty]"), EquipSlotType.HELMET)
	_add_equip_slot(equipment_container, "Boots", equipment.get("boots", "[Empty]"), EquipSlotType.BOOTS)
	_add_equip_slot(equipment_container, "Accessory", equipment.get("accessory", "[Empty]"), EquipSlotType.ACCESSORY)

func _refresh_skills() -> void:
	if skills_container == null:
		return
	
	# Clear existing
	for child in skills_container.get_children():
		child.queue_free()
	
	# Title
	_add_section_title(skills_container, "✨ SKILLS")
	
	var skills = hero_data.get("skills", [])
	if skills.size() == 0:
		_add_info_row(skills_container, "No skills learned")
	else:
		for skill in skills:
			_add_skill_row(skills_container, skill)

func _refresh_info() -> void:
	if info_container == null:
		return
	
	# Clear existing
	for child in info_container.get_children():
		child.queue_free()
	
	# Title
	_add_section_title(info_container, "ℹ️ HERO INFO")
	
	_add_info_row(info_container, "ID", hero_data.get("id", "unknown"))
	_add_info_row(info_container, "Class", hero_data.get("class", "Novice"))
	_add_info_row(info_container, "Level", str(hero_data.get("level", 1)))
	_add_info_row(info_container, "Experience", str(hero_data.get("experience", 0)))
	_add_info_row(info_container, "Status", hero_data.get("status", "active").to_upper())
	
	# Position in formation
	var pos = hero_data.get("grid_position", {})
	if pos:
		_add_info_row(info_container, "Position", "(%d, %d)" % [pos.get("x", 0), pos.get("y", 0)]])
	
	# Traits
	var traits = hero_data.get("traits", [])
	if traits.size() > 0:
		_add_section_title(info_container, "🎯 TRAITS")
		for trait in traits:
			_add_info_row(info_container, "•", trait)

# =============================================================================
# Helper Functions
# =============================================================================

func _add_section_title(container: VBoxContainer, title: String) -> void:
	var label = Label.new()
	label.text = title
	label.add_theme_font_size_override("font_size", Theme.FONT_BODY)
	label.modulate = Theme.COLOR_ACCENT
	container.add_child(label)
	
	# Separator
	var sep = HSeparator.new()
	sep.modulate = Theme.COLOR_SURFACE_LIGHT
	container.add_child(sep)

func _add_stat_row(container: VBoxContainer, stat_name: String, value: int, description: String) -> void:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, Theme.SPACING_LARGE + 8)
	
	var name_label = Label.new()
	name_label.text = stat_name
	name_label.custom_minimum_size = Vector2(Theme.SPACING_LARGE * 2 + Theme.SPACING_SMALL, 0)
	name_label.modulate = Theme.COLOR_TEXT_PRIMARY
	row.add_child(name_label)
	
	var value_label = Label.new()
	value_label.text = str(value)
	value_label.custom_minimum_size = Vector2(Theme.SPACING_LARGE + Theme.SPACING_SMALL, 0)
	value_label.modulate = Theme.COLOR_ACCENT
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(value_label)
	
	var desc_label = Label.new()
	desc_label.text = " - " + description
	desc_label.modulate = Theme.COLOR_TEXT_SECONDARY
	desc_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(desc_label)
	
	container.add_child(row)

func _add_equip_slot(container: VBoxContainer, slot_name: String, item_name: String, slot_type: EquipSlotType = EquipSlotType.WEAPON) -> void:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, Theme.SPACING_LARGE + 8)
	row.set_meta("slot_type", slot_type)
	
	var slot_label = Label.new()
	slot_label.text = slot_name + ":"
	slot_label.custom_minimum_size = Vector2(Theme.SPACING_LARGE * 4, 0)
	slot_label.modulate = Theme.COLOR_TEXT_SECONDARY
	row.add_child(slot_label)
	
	# Make item clickable using UIButton component
	var item_button = UIButton.new()
	item_button.setup(item_name)
	item_button.custom_minimum_size = Vector2(Theme.SPACING_LARGE * 6, 0)
	item_button.pressed.connect(_on_equip_slot_clicked.bind(slot_type, item_name))
	row.add_child(item_button)
	
	# Add unequip button if not empty
	if item_name != "[Empty]" and item_name != "None":
		var unequip_btn = UIButton.new()
		unequip_btn.setup("✕")
		unequip_btn.custom_minimum_size = Vector2(Theme.SIZE_BUTTON_SMALL, 0)
		unequip_btn.pressed.connect(_on_unequip_slot.bind(slot_type))
		row.add_child(unequip_btn)
	
	container.add_child(row)

func _on_equip_slot_clicked(slot_type: EquipSlotType, current_item: String) -> void:
	print("[HeroDetail] Equip slot clicked: %s, current: %s" % [EquipSlotType.keys()[slot_type], current_item])
	_show_equipment_selection(slot_type)

func _on_unequip_slot(slot_type: EquipSlotType) -> void:
	print("[HeroDetail] Unequip slot: %s" % EquipSlotType.keys()[slot_type])
	# Update hero equipment
	var equipment = hero_data.get("equipment", {}).duplicate()
	match slot_type:
		EquipSlotType.WEAPON: equipment["weapon"] = "[Empty]"
		EquipSlotType.ARMOR: equipment["armor"] = "[Empty]"
		EquipSlotType.HELMET: equipment["helmet"] = "[Empty]"
		EquipSlotType.BOOTS: equipment["boots"] = "[Empty]"
		EquipSlotType.ACCESSORY: equipment["accessory"] = "[Empty]"
	hero_data["equipment"] = equipment
	_refresh_equipment()

func _show_equipment_selection(slot_type: EquipSlotType) -> void:
	if game_manager == null:
		push_warning("[HeroDetail] GameManager not found")
		return
	
	# Get inventory items of this type
	var inventory = game_manager.inventory
	var matching_items: Array = []
	
	var item_type := ""
	match slot_type:
		EquipSlotType.WEAPON: item_type = "weapon"
		EquipSlotType.ARMOR: item_type = "armor"
		EquipSlotType.HELMET: item_type = "helmet"
		EquipSlotType.BOOTS: item_type = "boots"
		EquipSlotType.ACCESSORY: item_type = "accessory"
	
	for item in inventory:
		if item.get("type", "") == item_type:
			matching_items.append(item)
	
	if matching_items.is_empty():
		print("[HeroDetail] No %s items in inventory" % item_type)
		# TODO: Show a message or simple dialog
		return
	
	# Show equipment selection - open InventoryUI focused on this slot type
	_open_inventory_with_filter(slot_type, matching_items)

func _open_inventory_with_filter(slot_type: EquipSlotType, items: Array) -> void:
	var game_scene = get_tree().root.get_node_or_null("GameScene")
	if game_scene:
		var inventory_ui = game_scene.get_node_or_null("InventoryUI")
		if inventory_ui and inventory_ui.has_method("show_with_filter"):
			inventory_ui.show_with_filter(slot_type, items)
		elif inventory_ui and inventory_ui.has_method("show_inventory"):
			inventory_ui.show_inventory()

func _add_skill_row(container: VBoxContainer, skill: Dictionary) -> void:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, Theme.SPACING_LARGE + 8)
	
	var icon = Label.new()
	icon.text = "•"
	icon.custom_minimum_size = Vector2(Theme.SPACING_MEDIUM, 0)
	icon.modulate = Theme.COLOR_PRIMARY
	row.add_child(icon)
	
	var name_label = Label.new()
	name_label.text = skill.get("name", "Unknown Skill")
	name_label.modulate = Theme.COLOR_TEXT_PRIMARY
	row.add_child(name_label)
	
	var level_label = Label.new()
	level_label.text = "Lv." + str(skill.get("level", 1))
	level_label.modulate = Theme.COLOR_SUCCESS
	row.add_child(level_label)
	
	container.add_child(row)

func _add_info_row(container: VBoxContainer, label_text: String, value_text: String) -> void:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, Theme.SPACING_LARGE + 6)
	
	var label = Label.new()
	label.text = label_text + ":"
	label.custom_minimum_size = Vector2(Theme.SPACING_LARGE * 4, 0)
	label.modulate = Theme.COLOR_TEXT_SECONDARY
	row.add_child(label)
	
	var value = Label.new()
	value.text = value_text
	value.modulate = Theme.COLOR_TEXT_PRIMARY
	value.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(value)
	
	container.add_child(row)

func _on_close_pressed() -> void:
	hide_hero()

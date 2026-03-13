extends Panel
class_name BlacksmithUI

## Blacksmith UI - Upgrade equipment

# UI Elements
@onready var title_label: Label = $MainContainer/Header/TitleLabel if has_node("MainContainer/Header/TitleLabel") else null
@onready var close_button: Button = $MainContainer/Header/CloseButton if has_node("MainContainer/Header/CloseButton") else null
@onready var gold_label: Label = $MainContainer/Header/GoldLabel if has_node("MainContainer/Header/GoldLabel") else null

@onready var hero_dropdown: OptionButton = $MainContainer/Content/HeroPanel/HeroDropdown if has_node("MainContainer/Content/HeroPanel/HeroDropdown") else null
@onready var equipment_list: VBoxContainer = $MainContainer/Content/EquipmentPanel/EquipmentList if has_node("MainContainer/Content/EquipmentPanel/EquipmentList") else null

@onready var info_label: Label = $MainContainer/UpgradePanel/InfoLabel if has_node("MainContainer/UpgradePanel/InfoLabel") else null
@onready var upgrade_cost_label: Label = $MainContainer/UpgradePanel/UpgradeCost if has_node("MainContainer/UpgradePanel/UpgradeCost") else null
@onready var upgrade_effect_label: Label = $MainContainer/UpgradePanel/UpgradeEffect if has_node("MainContainer/UpgradePanel/UpgradeEffect") else null

@onready var upgrade_btn: Button = $MainContainer/Buttons/UpgradeBtn if has_node("MainContainer/Buttons/UpgradeBtn") else null
@onready var message_label: Label = $MainContainer/MessageLabel if has_node("MainContainer/MessageLabel") else null

# Data
var game_manager: Node = null
var is_visible: bool = false

var selected_hero_index: int = -1
var selected_hero: Dictionary = {}
var selected_equipment: Dictionary = {}

# Constants
const MAX_UPGRADE_LEVEL: int = 10
const UPGRADE_BONUS_PER_LEVEL: float = 0.10  # 10% per level
const UPGRADE_COST_MULTIPLIER: float = 1.5  # Cost increases by 1.5x per level

func _ready() -> void:
	game_manager = Theme.get_game_manager()
	visible = false
	
	if close_button:
		close_button.pressed.connect(_on_close_pressed)
	
	if hero_dropdown:
		hero_dropdown.item_selected.connect(_on_hero_selected)
	
	if upgrade_btn:
		upgrade_btn.pressed.connect(_on_upgrade_pressed)
		upgrade_btn.disabled = true

func show_blacksmith() -> void:
	_close_other_panels()
	visible = true
	is_visible = true
	_update_gold()
	_refresh_hero_dropdown()
	_clear_equipment_selection()
	_set_message("Welcome to the Blacksmith! Upgrade your equipment to become stronger.")

func hide_blacksmith() -> void:
	visible = false
	is_visible = false

func toggle() -> void:
	if is_visible:
		hide_blacksmith()
	else:
		show_blacksmith()

func _close_other_panels() -> void:
	var game_scene = get_tree().root.get_node_or_null("GameScene")
	if game_scene:
		var hero_roster = game_scene.get_node_or_null("HeroRoster")
		if hero_roster and hero_roster.has_method("hide_roster"):
			hero_roster.hide_roster()
		
		var quest_board = game_scene.get_node_or_null("QuestBoardUI")
		if quest_board and quest_board.has_method("hide_quest_board"):
			quest_board.hide_quest_board()
		
		var inventory_ui = game_scene.get_node_or_null("InventoryUI")
		if inventory_ui and inventory_ui.has_method("hide_inventory"):
			inventory_ui.hide_inventory()
		
		var shop_ui = game_scene.get_node_or_null("ShopUI")
		if shop_ui and shop_ui.has_method("hide_shop"):
			shop_ui.hide_shop()

func _update_gold() -> void:
	if gold_label and game_manager:
		gold_label.text = "💰 %,d" % game_manager.gold

func _refresh_hero_dropdown() -> void:
	if hero_dropdown == null:
		return
	
	hero_dropdown.clear()
	
	var heroes = game_manager.heroes if game_manager else []
	
	if heroes.is_empty():
		hero_dropdown.add_item("No heroes available")
		hero_dropdown.disabled = true
		return
	
	hero_dropdown.disabled = false
	
	for i in range(heroes.size()):
		var hero = heroes[i]
		hero_dropdown.add_item(hero.get("name", "Hero %d" % (i + 1)), i)

func _on_hero_selected(index: int) -> void:
	selected_hero_index = index
	
	var heroes = game_manager.heroes if game_manager else []
	if index >= 0 and index < heroes.size():
		selected_hero = heroes[index]
		_refresh_equipment_list()
	else:
		selected_hero = {}
		_clear_equipment_selection()

func _refresh_equipment_list() -> void:
	if equipment_list == null:
		return
	
	# Clear existing
	for child in equipment_list.get_children():
		child.queue_free()
	
	if selected_hero.is_empty():
		return
	
	# Get equipment from hero
	var equipment = selected_hero.get("equipment", {})
	
	# Add equipment slots
	var slot_names = {
		"weapon": "⚔️ Weapon",
		"armor": "🛡️ Armor",
		"helmet": "⛑️ Helmet",
		"boots": "👢 Boots",
		"accessory": "💍 Accessory"
	}
	
	for slot_name in slot_names.keys():
		var slot_container = _create_equipment_slot(slot_name, slot_names[slot_name], equipment.get(slot_name, {}))
		equipment_list.add_child(slot_container)

func _create_equipment_slot(slot_name: String, slot_label: String, item: Dictionary) -> Control:
	var container = UIButton.new()
	container.custom_minimum_size = Vector2(0, Theme.SIZE_BUTTON_LARGE + Theme.SPACING_SMALL)
	
	if item.is_empty():
		container.setup(slot_label + " [Empty]", "", Theme.COLOR_TEXT_DISABLED)
		container.disabled = true
	else:
		var upgrade_level = item.get("upgrade_level", 0)
		var display_text = slot_label
		if upgrade_level > 0:
			display_text += " +%d" % upgrade_level
		container.setup(display_text)
		
		# Set metadata for later reference
		container.set_meta("slot_name", slot_name)
		container.set_meta("item_data", item)
	
	container.pressed.connect(_on_equipment_selected.bind(slot_name, item))
	
	return container

func _on_equipment_selected(slot_name: String, item: Dictionary) -> void:
	selected_equipment = item
	_show_upgrade_info(item)

func _show_upgrade_info(item: Dictionary) -> void:
	if item.is_empty():
		_clear_upgrade_info()
		return
	
	var item_name = item.get("name", "Unknown")
	var item_value = item.get("value", 100)
	var upgrade_level = item.get("upgrade_level", 0)
	
	if info_label:
		info_label.text = "%s (Level %d)" % [item_name, upgrade_level]
	
	# Calculate upgrade cost
	var upgrade_cost = _calculate_upgrade_cost(item_value, upgrade_level)
	
	if upgrade_cost_label:
		if upgrade_level >= MAX_UPGRADE_LEVEL:
			upgrade_cost_label.text = "MAX LEVEL REACHED"
		else:
			upgrade_cost_label.text = "Upgrade Cost: %d gold" % upgrade_cost
	
	if upgrade_effect_label:
		var next_bonus = int((upgrade_level + 1) * UPGRADE_BONUS_PER_LEVEL * 100)
		upgrade_effect_label.text = "Current: +%d%% | Next: +%d%%" % [upgrade_level * 10, next_bonus]
	
	if upgrade_btn:
		upgrade_btn.disabled = (upgrade_level >= MAX_UPGRADE_LEVEL)

func _clear_upgrade_info() -> void:
	if info_label:
		info_label.text = "Select equipment to see upgrade info"
	if upgrade_cost_label:
		upgrade_cost_label.text = "Upgrade Cost: 0 gold"
	if upgrade_effect_label:
		upgrade_effect_label.text = "Effect: +10% per level"
	if upgrade_btn:
		upgrade_btn.disabled = true

func _clear_equipment_selection() -> void:
	selected_hero = {}
	selected_equipment = {}
	_clear_upgrade_info()

func _calculate_upgrade_cost(base_value: int, current_level: int) -> int:
	# Cost = base_value * (1.5 ^ current_level)
	var cost = base_value
	for i in range(current_level):
		cost = int(cost * UPGRADE_COST_MULTIPLIER)
	return cost

func _on_upgrade_pressed() -> void:
	if selected_equipment.is_empty() or game_manager == null:
		return
	
	var upgrade_level = selected_equipment.get("upgrade_level", 0)
	var item_value = selected_equipment.get("value", 100)
	var upgrade_cost = _calculate_upgrade_cost(item_value, upgrade_level)
	
	if upgrade_level >= MAX_UPGRADE_LEVEL:
		_set_message("Equipment is already at maximum level!")
		return
	
	if game_manager.gold < upgrade_cost:
		_set_message("Not enough gold! Need %d gold." % upgrade_cost)
		return
	
	# Deduct gold
	game_manager.gold -= upgrade_cost
	
	# Upgrade equipment
	selected_equipment["upgrade_level"] = upgrade_level + 1
	
	# Update hero's equipment
	if selected_hero_index >= 0:
		var heroes = game_manager.heroes
		if selected_hero_index < heroes.size():
			var hero = heroes[selected_hero_index]
			var equipment = hero.get("equipment", {})
			
			# Find the slot name from selected_equipment
			var slot_name = ""
			for key in ["weapon", "armor", "helmet", "boots", "accessory"]:
				if equipment.has(key) and equipment[key].get("id") == selected_equipment.get("id"):
					slot_name = key
					break
			
			if slot_name != "":
				equipment[slot_name] = selected_equipment
				hero["equipment"] = equipment
				heroes[selected_hero_index] = hero
				game_manager.heroes = heroes
	
	_update_gold()
	_refresh_equipment_list()
	_show_upgrade_info(selected_equipment)
	
	_set_message("Upgraded %s to +%d!" % [selected_equipment.get("name", "equipment"), upgrade_level + 1])

func _set_message(msg: String) -> void:
	if message_label:
		message_label.text = msg

func _on_close_pressed() -> void:
	hide_blacksmith()

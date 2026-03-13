extends Panel
class_name TownHallUI

## Town Hall UI - Manage heroes and enter combat

# UI Elements
@onready var title_label: Label = $MainContainer/Header/TitleLabel if has_node("MainContainer/Header/TitleLabel") else null
@onready var close_button: Button = $MainContainer/Header/CloseButton if has_node("MainContainer/Header/CloseButton") else null
@onready var gold_label: Label = $MainContainer/Header/GoldLabel if has_node("MainContainer/Header/GoldLabel") else null

@onready var welcome_msg: Label = $MainContainer/Content/WelcomeMsg if has_node("MainContainer/Content/WelcomeMsg") else null
@onready var party_info: Label = $MainContainer/Content/PartySection/PartyInfo if has_node("MainContainer/Content/PartySection/PartyInfo") else null

@onready var forest_btn: Button = $MainContainer/Content/LocationSection/LocationButtons/ForestBtn if has_node("MainContainer/Content/LocationSection/LocationButtons/ForestBtn") else null
@onready var dungeon_btn: Button = $MainContainer/Content/LocationSection/LocationButtons/DungeonBtn if has_node("MainContainer/Content/LocationSection/LocationButtons/DungeonBtn") else null
@onready var citadel_btn: Button = $MainContainer/Content/LocationSection/LocationButtons/CitadelBtn if has_node("MainContainer/Content/LocationSection/LocationButtons/CitadelBtn") else null
@onready var message_label: Label = $MainContainer/MessageLabel if has_node("MainContainer/MessageLabel") else null

# Data
var game_manager: Node = null
var location_manager: Node = null
var is_visible: bool = false

func _ready() -> void:
	game_manager = Theme.get_game_manager()
	location_manager = get_tree().root.get_node_or_null("LocationManager")
	
	if location_manager == null:
		push_warning("[TownHallUI] LocationManager not found - navigation may not work properly")
	
	visible = false
	
	if close_button:
		close_button.pressed.connect(_on_close_pressed)
	
	if forest_btn:
		forest_btn.pressed.connect(_on_forest_pressed)
	if dungeon_btn:
		dungeon_btn.pressed.connect(_on_dungeon_pressed)
	if citadel_btn:
		citadel_btn.pressed.connect(_on_citadel_pressed)

func show_town_hall() -> void:
	_close_other_panels()
	visible = true
	is_visible = true
	_update_gold()
	_refresh_party_info()
	_set_message("Welcome to the Town Hall! Select a location to begin your adventure.")

func hide_town_hall() -> void:
	visible = false
	is_visible = false

func toggle() -> void:
	if is_visible:
		hide_town_hall()
	else:
		show_town_hall()

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
		
		var blacksmith_ui = game_scene.get_node_or_null("BlacksmithUI")
		if blacksmith_ui and blacksmith_ui.has_method("hide_blacksmith"):
			blacksmith_ui.hide_blacksmith()

func _update_gold() -> void:
	if gold_label and game_manager:
		gold_label.text = "💰 %,d" % game_manager.gold

func _refresh_party_info() -> void:
	if party_info == null:
		return
	
	var heroes = game_manager.heroes if game_manager else []
	var hero_count = heroes.size()
	
	# Calculate total party power
	var total_power: int = 0
	for hero in heroes:
		total_power += hero.get("power", 0)
	
	party_info.text = "Heroes: %d | Total Power: %d" % [hero_count, total_power]
	
	# Disable buttons if no heroes
	var has_heroes = hero_count > 0
	if forest_btn:
		forest_btn.disabled = not has_heroes
	if dungeon_btn:
		dungeon_btn.disabled = not has_heroes
	if citadel_btn:
		citadel_btn.disabled = not has_heroes

func _on_forest_pressed() -> void:
	_navigate_to_location(location_manager.LocationType.FOREST if location_manager else 1)

func _on_dungeon_pressed() -> void:
	_navigate_to_location(location_manager.LocationType.DUNGEON if location_manager else 2)

func _on_citadel_pressed() -> void:
	_navigate_to_location(location_manager.LocationType.CITADEL if location_manager else 3)

func _navigate_to_location(location_type: int) -> void:
	if location_manager == null:
		_set_message("Cannot navigate - LocationManager not found")
		return
	
	if game_manager == null or game_manager.heroes.is_empty():
		_set_message("You need at least one hero to go to battle!")
		return
	
	# Hide town hall UI
	hide_town_hall()
	
	# Navigate to location
	location_manager.change_location(location_type)
	
	# TODO: Start combat with server
	# For now, just show message
	_set_message("Entering battle! (Combat integration coming soon)")

func _set_message(msg: String) -> void:
	if message_label:
		message_label.text = msg

func _on_close_pressed() -> void:
	hide_town_hall()

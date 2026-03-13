extends Panel
class_name QuestBoardUI

## Quest Board UI - Shows available quests for the player

# UI Elements
@onready var title_label: Label = $MainContainer/Header/TitleLabel if has_node("MainContainer/Header/TitleLabel") else null
@onready var close_button: Button = $MainContainer/Header/CloseButton if has_node("MainContainer/Header/CloseButton") else null
@onready var quest_list: VBoxContainer = $MainContainer/ScrollContainer/QuestList if has_node("MainContainer/ScrollContainer/QuestList") else null

# Data
var game_manager: Node = null
var is_visible: bool = false

# Sample quests
var _sample_quests: Array = [
	{
		"id": "quest_slime",
		"title": "Slime Problem",
		"description": "Clear the village of pesky slimes",
		"difficulty": "easy",
		"reward_gold": 100,
		"reward_exp": 50,
		"location": "Darkwood Forest",
		"enemy_count": 5
	},
	{
		"id": "quest_goblin",
		"title": "Goblin Raid",
		"description": "Stop the goblin raiders from attacking the village",
		"difficulty": "medium",
		"reward_gold": 250,
		"reward_exp": 150,
		"location": "Darkwood Forest",
		"enemy_count": 10
	},
	{
		"id": "quest_forest_treasure",
		"title": "Lost Treasure",
		"description": "Find the ancient treasure hidden in the forest",
		"difficulty": "medium",
		"reward_gold": 500,
		"reward_exp": 200,
		"location": "Darkwood Forest",
		"enemy_count": 8
	},
	{
		"id": "quest_dungeon_explore",
		"title": "Dungeon Delve",
		"description": "Explore the depths of the ancient dungeon",
		"difficulty": "hard",
		"reward_gold": 1000,
		"reward_exp": 500,
		"location": "Dungeon",
		"floor": 5
	},
	{
		"id": "quest_citadel",
		"title": "Citadel Defense",
		"description": "Help defend the citadel from monsters",
		"difficulty": "hard",
		"reward_gold": 2000,
		"reward_exp": 1000,
		"location": "Solara Citadel",
		"enemy_count": 20
	}
]

# Difficulty to rarity mapping
const _DIFFICULTY_TO_RARITY := {
	"easy": "common",
	"medium": "uncommon",
	"hard": "rare"
}

func _ready() -> void:
	game_manager = Theme.get_game_manager()
	visible = false
	
	if close_button:
		close_button.pressed.connect(_on_close_pressed)

func show_quest_board() -> void:
	# Close other panels first
	_close_other_panels()
	visible = true
	is_visible = true
	_refresh_quest_list()

func hide_quest_board() -> void:
	visible = false
	is_visible = false

func toggle() -> void:
	if is_visible:
		hide_quest_board()
	else:
		show_quest_board()

func _close_other_panels() -> void:
	# Close other UI panels to prevent overlap
	var game_scene = get_tree().root.get_node_or_null("GameScene")
	if game_scene:
		# Close HeroRoster
		var hero_roster = game_scene.get_node_or_null("HeroRoster")
		if hero_roster and hero_roster.has_method("hide_roster"):
			hero_roster.hide_roster()
		
		# Close InventoryUI
		var inventory_ui = game_scene.get_node_or_null("InventoryUI")
		if inventory_ui and inventory_ui.has_method("hide_inventory"):
			inventory_ui.hide_inventory()

func _refresh_quest_list() -> void:
	if quest_list == null:
		return
	
	# Clear existing
	for child in quest_list.get_children():
		child.queue_free()
	
	# Add quest items using UICard component
	for quest in _sample_quests:
		var quest_card = _create_quest_card(quest)
		quest_list.add_child(quest_card)

func _create_quest_card(quest: Dictionary) -> UICard:
	var difficulty = quest.get("difficulty", "easy")
	var rarity = _DIFFICULTY_TO_RARITY.get(difficulty, "common")
	
	# Build content string
	var content = "%s\n\n📍 %s\n💰 %d  ✨ %d" % [
		quest.get("description", ""),
		quest.get("location", "Unknown"),
		quest.get("reward_gold", 0),
		quest.get("reward_exp", 0)
	]
	
	# Create card with quest data
	var card = UICard.new()
	card.setup({
		"title": quest.get("title", "Unknown Quest"),
		"subtitle": "[%s] %s" % [difficulty.to_upper(), quest.get("location", "")],
		"content": content,
		"rarity": rarity,
		"action_text": "ACCEPT QUEST"
	})
	
	# Connect action button
	card.action_pressed.connect(_on_accept_quest)
	
	return card

func _on_accept_quest(data: Dictionary) -> void:
	print("[QuestBoard] Accepted quest: %s" % data.get("title", ""))
	# TODO: Add quest to player's active quests
	hide_quest_board()

func _on_close_pressed() -> void:
	hide_quest_board()

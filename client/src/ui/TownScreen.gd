extends Control

@onready var tavern_btn = $Actions/TavernButton
@onready var market_btn = $Actions/MarketButton
@onready var inventory_btn = $Actions/InventoryButton
@onready var quest_btn = $Actions/QuestButton
@onready var crafting_btn = $Actions/CraftingButton
@onready var formation_btn = $Actions/FormationButton
@onready var hero_btn = $Actions/HeroButton
@onready var map_btn = $Actions/MapButton

func _ready():
	tavern_btn.pressed.connect(_on_tavern_pressed)
	market_btn.pressed.connect(_on_market_pressed)
	inventory_btn.pressed.connect(_on_inventory_pressed)
	quest_btn.pressed.connect(_on_quest_pressed)
	crafting_btn.pressed.connect(_on_crafting_pressed)
	formation_btn.pressed.connect(_on_formation_pressed)
	hero_btn.pressed.connect(_on_hero_pressed)
	map_btn.pressed.connect(_on_map_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	
	GameState.last_visited_hub = "res://src/ui/TownScreen.tscn"

func _on_request_completed(endpoint, _data):
	if "tavern/enter" in endpoint:
		get_tree().change_scene_to_file("res://src/ui/TavernScreen.tscn")
	elif "action/travel" in endpoint:
		get_tree().change_scene_to_file("res://src/ui/TravelScene.tscn")

func _on_tavern_pressed(): ServerConnector.enter_tavern(GameState.current_user.id)
func _on_market_pressed(): get_tree().change_scene_to_file("res://src/ui/MarketScreen.tscn")
func _on_inventory_pressed(): get_tree().change_scene_to_file("res://src/ui/InventoryScreen.tscn")
func _on_quest_pressed(): get_tree().change_scene_to_file("res://src/ui/QuestScreen.tscn")
func _on_crafting_pressed(): get_tree().change_scene_to_file("res://src/ui/CraftingScreen.tscn")
func _on_formation_pressed(): get_tree().change_scene_to_file("res://src/ui/FormationScreen.tscn")
func _on_map_pressed(): get_tree().change_scene_to_file("res://src/ui/WorldMapScreen.tscn")

func _on_hero_pressed():
	if GameState.current_heroes.size() > 0:
		GameState.selected_hero_id = GameState.current_heroes[0].id
		get_tree().change_scene_to_file("res://src/ui/HeroProfileScreen.tscn")
	else:
		ServerConnector.fetch_heroes(GameState.current_user.id)

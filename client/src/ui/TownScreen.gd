extends Control

@onready var tavern_btn = $Actions/TavernButton
@onready var market_btn = $Actions/MarketButton
@onready var inventory_btn = $Actions/InventoryButton
@onready var quest_btn = $Actions/QuestButton
@onready var crafting_btn = $Actions/CraftingButton
@onready var formation_btn = $Actions/FormationButton
@onready var hero_btn = $Actions/HeroButton
@onready var map_btn = $Actions/MapButton

@onready var inventory_ui = $InventoryUI
@onready var quest_ui = $QuestUI
@onready var hero_ui = $HeroProfileUI
@onready var market_ui = $MarketUI
@onready var crafting_ui = $CraftingUI
@onready var formation_ui = $FormationUI
@onready var map_ui = $WorldMapUI

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

func _on_tavern_pressed():
	ServerConnector.enter_tavern(GameState.current_user.id)

func _on_market_pressed():
	market_ui.show()
	market_ui.refresh()

func _on_inventory_pressed():
	inventory_ui.show()
	inventory_ui.refresh()

func _on_quest_pressed():
	quest_ui.show()
	quest_ui.refresh()

func _on_crafting_pressed():
	crafting_ui.show()
	crafting_ui.refresh()

func _on_formation_pressed():
	formation_ui.show()
	formation_ui.refresh()

func _on_map_pressed():
	map_ui.show()
	map_ui.refresh()

func _on_hero_pressed():
	if GameState.current_heroes.size() > 0:
		hero_ui.show_hero(GameState.current_heroes[0].id)
	else:
		ServerConnector.fetch_heroes(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if "tavern/enter" in endpoint:
		get_tree().change_scene_to_file("res://src/ui/TavernScreen.tscn")
	elif "action/travel" in endpoint:
		# Navigation is handled after the 15s timer by checking GameState currentRegion 
		# OR we can just rely on the TaskHUD to show completion.
		# For this demo, let's assume the user checks the map or we auto-switch after 15s.
		await get_tree().create_timer(15.0).timeout
		# Determine target region (simplification for demo)
		# A real implementation would parse the 'data' to see the target region.
		if data.has("targetRegionId"):
			GameState.current_user.currentRegion = data.targetRegionId
			if data.targetRegionId == 1:
				get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
			else:
				get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
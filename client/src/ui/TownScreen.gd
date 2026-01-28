extends Control

@onready var tavern_btn = $Actions/TavernButton
@onready var market_btn = $Actions/MarketButton
@onready var quest_btn = $Actions/QuestButton
@onready var crafting_btn = $Actions/CraftingButton

func _ready():
    # BUG FIX: Auto-redirect if a task is already running (Sequential Queue support)
    if GameState.active_task:
        if GameState.active_task.type == "TRAVEL":
            get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn")
            return

    tavern_btn.pressed.connect(_on_tavern_pressed)
    market_btn.pressed.connect(_on_market_pressed)
    quest_btn.pressed.connect(_on_quest_pressed)
    crafting_btn.pressed.connect(_on_crafting_pressed)
    ServerConnector.request_completed.connect(_on_request_completed)
    
    GameState.last_visited_hub = "res://src/ui/TownScreen.tscn"

func _on_request_completed(endpoint, _data):
    if "tavern/enter" in endpoint:
        get_tree().change_scene_to_file("res://src/ui/TavernScreen.tscn")

func _on_tavern_pressed(): 
    if GameState.current_user: ServerConnector.enter_tavern(GameState.current_user.id)

func _on_market_pressed(): get_tree().change_scene_to_file("res://src/ui/MarketScreen.tscn")
func _on_quest_pressed(): get_tree().change_scene_to_file("res://src/ui/QuestScreen.tscn")
func _on_crafting_pressed(): get_tree().change_scene_to_file("res://src/ui/CraftingScreen.tscn")

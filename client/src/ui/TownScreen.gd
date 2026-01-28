extends Control

@onready var tavern_btn = $ActionGrid/TavernButton
@onready var market_btn = $ActionGrid/MarketButton
@onready var quest_btn = $ActionGrid/QuestButton
@onready var crafting_btn = $ActionGrid/CraftingButton
@onready var town_title = $HeaderContainer/TownTitle
@onready var action_grid = $ActionGrid

func _ready():
    # BUG FIX: Auto-redirect if a task is already running
    if GameState.active_task:
        if GameState.active_task.type == "TRAVEL":
            get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn")
            return

    # Dynamic Title with BBCode Wave Effect
    if GameState.current_region_data:
        var raw_name = GameState.current_region_data.get("name", "UNNAMED TOWN").to_upper()
        town_title.text = "[center][wave amp=30 freq=3]%s[/wave][/center]" % raw_name
    else:
        town_title.text = "[center][wave amp=30 freq=3]RIVERDALE VILLAGE[/wave][/center]"

    # Clean signal connections to prevent duplicates
    if ServerConnector.request_completed.is_connected(_on_request_completed):
        ServerConnector.request_completed.disconnect(_on_request_completed)
    ServerConnector.request_completed.connect(_on_request_completed)

    tavern_btn.pressed.connect(_on_tavern_pressed)
    market_btn.pressed.connect(_on_market_pressed)
    quest_btn.pressed.connect(_on_quest_pressed)
    crafting_btn.pressed.connect(_on_crafting_pressed)
    
    GameState.last_visited_hub = "res://src/ui/TownScreen.tscn"
    
    _play_entry_animation()

func _play_entry_animation():
    var delay = 0.0
    for child in action_grid.get_children():
        if child is Button:
            child.modulate.a = 0
            child.scale = Vector2(0.8, 0.8)
            child.pivot_offset = Vector2(80, 80) # Fixed pivot for 160x160 cards
            
            var tw = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
            tw.tween_interval(delay)
            tw.tween_property(child, "modulate:a", 1.0, 0.4)
            tw.parallel().tween_property(child, "scale", Vector2(1, 1), 0.4)
            delay += 0.05

func _on_request_completed(endpoint: String, _data):
    if endpoint.contains("tavern/enter"):
        get_tree().change_scene_to_file("res://src/ui/TavernScreen.tscn")

func _on_tavern_pressed(): 
    if GameState.current_user:
        ServerConnector.enter_tavern(GameState.current_user.id)
    else:
        # Fallback for debugging
        push_error("TownScreen: No current user in GameState")

func _on_market_pressed(): get_tree().change_scene_to_file("res://src/ui/MarketScreen.tscn")
func _on_quest_pressed(): get_tree().change_scene_to_file("res://src/ui/QuestScreen.tscn")
func _on_crafting_pressed(): get_tree().change_scene_to_file("res://src/ui/CraftingScreen.tscn")

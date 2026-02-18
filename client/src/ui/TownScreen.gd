extends Control

@onready var tavern_btn = $ActionGrid/TavernButton
@onready var market_btn = $ActionGrid/MarketButton
@onready var quest_btn = $ActionGrid/QuestButton
@onready var crafting_btn = $ActionGrid/CraftingButton
@onready var island_btn = $ActionGrid/IslandButton
@onready var town_title = $HeaderContainer/TownTitle
@onready var action_grid = $ActionGrid

func _ready():
    # BUG FIX: Auto-redirect if a task is already running
    if GameState.active_task:
        if GameState.active_task.type == "TRAVEL":
            get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn")
            return

    # Fetch data to ensure sync (SideHUD, etc)
    if GameState.current_user:
        var rid = GameState.current_user.get("currentRegion", 1)
        ServerConnector.get_region_details(int(rid))

    # Dynamic Title with BBCode Wave Effect
    _update_town_title()

    # Clean signal connections to prevent duplicates
    if ServerConnector.request_completed.is_connected(_on_request_completed):
        ServerConnector.request_completed.disconnect(_on_request_completed)
    ServerConnector.request_completed.connect(_on_request_completed)

    tavern_btn.pressed.connect(_on_tavern_pressed)
    market_btn.pressed.connect(_on_market_pressed)
    quest_btn.pressed.connect(_on_quest_pressed)
    crafting_btn.pressed.connect(_on_crafting_pressed)
    island_btn.pressed.connect(_on_island_pressed)
    
    GameState.last_visited_hub = "res://src/ui/TownScreen.tscn"
    
    _play_entry_animation()
    _check_quest_markers()

func _check_quest_markers():
    # Remove existing markers
    for child in quest_btn.get_children():
        if child.name == "QuestMarker":
            child.queue_free()
    
    # Logic to show marker if available (mocked for now, should check server)
    var marker_packed = load("res://src/ui/QuestMarker.tscn")
    var marker = marker_packed.instantiate()
    marker.name = "QuestMarker"
    marker.position = Vector2(130, 10) # Position on top right of 160x160 button
    quest_btn.add_child(marker)

func _update_town_title():
    if GameState.current_region_data:
        var raw_name = GameState.current_region_data.get("name", "UNNAMED TOWN").to_upper()
        town_title.text = "[center][wave amp=30 freq=3]%s[/wave][/center]" % raw_name
    else:
        town_title.text = "[center][wave amp=30 freq=3]LOADING...[/wave][/center]"

func _play_entry_animation():
    # ... (rest of function)
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

func _on_request_completed(endpoint: String, data):
    if endpoint.contains("tavern/enter"):
        get_tree().change_scene_to_file("res://src/ui/TavernScreen.tscn")
    elif "region/" in endpoint:
        var r_data = data.get("data", data)
        if r_data is Dictionary:
            GameState.current_region_data = r_data
            _update_town_title()

func _on_tavern_pressed(): 
    if GameState.current_user:
        ServerConnector.enter_tavern(GameState.current_user.id)
    else:
        # Fallback for debugging
        push_error("TownScreen: No current user in GameState")

func _on_market_pressed(): get_tree().change_scene_to_file("res://src/ui/MarketScreen.tscn")
func _on_quest_pressed():
    if UIManager:
        UIManager.open_overlay("Quests", "res://src/ui/QuestScreen.tscn")
    else:
        get_tree().change_scene_to_file("res://src/ui/QuestScreen.tscn")
func _on_crafting_pressed(): get_tree().change_scene_to_file("res://src/ui/CraftingScreen.tscn")

func _on_island_pressed():
    if UIManager:
        UIManager.open_overlay("PrivateIsland", "res://src/ui/PrivateIslandScreen.tscn")
    else:
        get_tree().change_scene_to_file("res://src/ui/PrivateIslandScreen.tscn")

extends Control

@onready var recipe_list = $MarginContainer/VBoxContainer/ScrollContainer/RecipeList

## Setup as overlay logic
func setup_as_overlay(_data: Dictionary = {}):
    # Sembunyikan HUD internal agar tidak tumpang tindih
    if has_node("TopHUD"): $TopHUD.visible = false
    if has_node("SideHUD"): $SideHUD.visible = false
    if has_node("TaskListHUD"): $TaskListHUD.visible = false
    
    # Beri margin agar tidak menabrak SideHUD di kiri
    if has_node("MarginContainer"):
        $MarginContainer.offset_left = 200
        $MarginContainer.offset_right = -40
        $MarginContainer.offset_top = 40
        $MarginContainer.offset_bottom = -40

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    refresh()

func refresh():
    if GameState.current_user:
        ServerConnector.fetch_recipes(GameState.current_user.id)

func _on_request_completed(endpoint, data):
    if endpoint.contains("/recipes"):
        _populate_recipes(data)
    elif endpoint.contains("/action/craft"):
        get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")

func _populate_recipes(recipes):
    for child in recipe_list.get_children(): child.queue_free()
    for recipe in recipes:
        # Validate recipe is a Dictionary before accessing properties
        if not recipe is Dictionary:
            print("CraftingScreen: Skipping invalid recipe data (not a Dictionary)")
            continue
        var recipe_name = str(recipe.get("name", "Unknown"))
        var result_item = recipe.get("resultItem")
        var result_name = "Unknown"
        if result_item is Dictionary:
            result_name = str(result_item.get("name", "Unknown"))
        elif result_item is String:
            result_name = str(result_item)
        var craft_time = int(recipe.get("craftTimeSeconds", 0))
        var recipe_id = recipe.get("id", 0)
        
        var btn = Button.new()
        btn.text = "%s -> %s (%ds)" % [recipe_name, result_name, craft_time]
        btn.pressed.connect(func(): 
            if GameState.current_user and recipe_id:
                ServerConnector.craft(GameState.current_user.id, recipe_id)
        )
        recipe_list.add_child(btn)

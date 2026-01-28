extends Control

@onready var recipe_list = $MarginContainer/VBoxContainer/ScrollContainer/RecipeList

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
		var btn = Button.new()
		btn.text = "%s -> %s (%ds)" % [recipe.name, recipe.resultItem.name, recipe.craftTimeSeconds]
		btn.pressed.connect(func(): 
			if GameState.current_user:
				ServerConnector.craft(GameState.current_user.id, recipe.id)
		)
		recipe_list.add_child(btn)

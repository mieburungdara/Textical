extends Control

@onready var recipe_list = $Panel/VBoxContainer/ScrollContainer/RecipeList
@onready var status_label = $Panel/VBoxContainer/StatusLabel
@onready var close_btn = $Panel/VBoxContainer/CloseButton

func _ready():
	close_btn.pressed.connect(func(): hide())
	ServerConnector.request_completed.connect(_on_request_completed)

func refresh():
	if GameState.current_user:
		recipe_list.get_children().map(func(c): c.queue_free())
		var l = Label.new()
		l.text = "Loading recipes..."
		recipe_list.add_child(l)
		ServerConnector.fetch_recipes(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/recipes"):
		_populate_recipes(data)
	elif endpoint.contains("/action/craft"):
		status_label.text = "Crafting started!"
		hide() # Close UI to show world map/progress

func _populate_recipes(recipes):
	for child in recipe_list.get_children():
		child.queue_free()
	
	if recipes.size() == 0:
		var l = Label.new()
		l.text = "No recipes learned yet."
		recipe_list.add_child(l)
		return

	for recipe in recipes:
		var panel = PanelContainer.new()
		var vbox = VBoxContainer.new()
		
		var title = Label.new()
		title.text = recipe.name + " -> " + recipe.resultItem.name
		vbox.add_child(title)
		
		var ing_text = "Requires: "
		for ing in recipe.ingredients:
			ing_text += "%dx %s, " % [ing.quantity, ing.item.name]
		
		var ingredients_label = Label.new()
		ingredients_label.text = ing_text
		vbox.add_child(ingredients_label)
		
		var craft_btn = Button.new()
		craft_btn.text = "Craft (%ds - 10 Vitality)" % recipe.craftTimeSeconds
		craft_btn.pressed.connect(func(): _on_craft_pressed(recipe.id))
		vbox.add_child(craft_btn)
		
		panel.add_child(vbox)
		recipe_list.add_child(panel)

func _on_craft_pressed(recipe_id):
	ServerConnector.craft(GameState.current_user.id, recipe_id)

extends Control

## Codex_Recipes - SRP Component
## Manages Crafting records with dynamic server data.

@onready var recipe_list = %RecipeList

func _ready():
	ServerConnector.request_completed.connect(_on_request_completed)

func refresh():
	ServerConnector.fetch_templates("recipes")

func _on_request_completed(endpoint: String, response):
	if endpoint.contains("/assets/templates/recipes"):
		var data = response.get("data", response) if response is Dictionary else response
		if data is Array:
			_populate_recipes(data)

func _populate_recipes(recipes: Array):
	if not recipe_list: return
	for child in recipe_list.get_children():
		child.queue_free()
	
	if recipes.is_empty():
		var lbl = Label.new()
		lbl.text = "No crafting recipes found in the database."
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		recipe_list.add_child(lbl)
		return

	for recipe in recipes:
		var card = _create_recipe_card(recipe)
		recipe_list.add_child(card)

func _create_recipe_card(recipe: Dictionary) -> Control:
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.15, 0.12, 0.8)
	style.content_margin_left = 15
	style.content_margin_right = 15
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	panel.add_theme_stylebox_override("panel", style)
	
	var vbox = VBoxContainer.new()
	
	var header = HBoxContainer.new()
	var name_lbl = Label.new()
	var result_item = recipe.get("resultItem", {})
	name_lbl.text = recipe.get("name", result_item.get("name", "Unknown Recipe")).to_upper()
	name_lbl.add_theme_font_size_override("font_size", 16)
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var time_lbl = Label.new()
	time_lbl.text = "%ds" % recipe.get("craftTimeSeconds", 30)
	time_lbl.add_theme_font_size_override("font_size", 12)
	time_lbl.add_theme_color_override("font_color", Color(0.6, 0.8, 1.0))
	
	header.add_child(name_lbl)
	header.add_child(time_lbl)
	
	var ingredients_box = HBoxContainer.new()
	ingredients_box.add_theme_constant_override("separation", 10)
	
	var ingredients = recipe.get("ingredients", [])
	for ing in ingredients:
		var ing_item = ing.get("item", {})
		var ing_lbl = Label.new()
		ing_lbl.text = "• %dx %s" % [ing.get("quantity", 1), ing_item.get("name", "Material")]
		ing_lbl.add_theme_font_size_override("font_size", 11)
		ing_lbl.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
		ingredients_box.add_child(ing_lbl)
	
	vbox.add_child(header)
	vbox.add_child(ingredients_box)
	panel.add_child(vbox)
	
	return panel

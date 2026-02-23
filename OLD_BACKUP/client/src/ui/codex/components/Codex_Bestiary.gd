extends Control

## Codex_Bestiary - SRP Component
## Manages Monster encyclopedia with dynamic server data.

@onready var monster_list = %MonsterList

func _ready():
	ServerConnector.request_completed.connect(_on_request_completed)

func refresh():
	ServerConnector.fetch_templates("monsters")

func _on_request_completed(endpoint: String, response):
	if endpoint.contains("/assets/templates/monsters"):
		var data = response.get("data", response) if response is Dictionary else response
		if data is Array:
			_populate_monsters(data)

func _populate_monsters(monsters: Array):
	if not monster_list: return
	for child in monster_list.get_children():
		child.queue_free()
	
	if monsters.is_empty():
		var lbl = Label.new()
		lbl.text = "No monsters discovered in the database."
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		monster_list.add_child(lbl)
		return

	for monster in monsters:
		var card = _create_monster_card(monster)
		monster_list.add_child(card)

func _create_monster_card(monster: Dictionary) -> Control:
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.15, 0.12, 0.1, 0.8)
	style.content_margin_left = 15
	style.content_margin_right = 15
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	style.corner_radius_top_left = 4
	style.corner_radius_bottom_left = 4
	panel.add_theme_stylebox_override("panel", style)
	
	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 20)
	
	var icon = Label.new()
	icon.text = "👾" # Default icon
	icon.add_theme_font_size_override("font_size", 32)
	
	var vbox = VBoxContainer.new()
	vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var name_lbl = Label.new()
	name_lbl.text = monster.get("name", "Unknown").to_upper()
	name_lbl.add_theme_font_size_override("font_size", 18)
	name_lbl.add_theme_color_override("font_color", Color(1, 0.8, 0.6))
	
	var category = monster.get("category", {})
	var cat_name = category.get("name", "General") if category is Dictionary else "General"
	
	var info_lbl = Label.new()
	info_lbl.text = "Category: %s | HP: %d | DMG: %d" % [
		cat_name, 
		monster.get("hp_base", 0), 
		monster.get("damage_base", 0)
	]
	info_lbl.add_theme_font_size_override("font_size", 12)
	info_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	
	vbox.add_child(name_lbl)
	vbox.add_child(info_lbl)
	
	hbox.add_child(icon)
	hbox.add_child(vbox)
	panel.add_child(hbox)
	
	return panel

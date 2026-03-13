extends Control

## Citadel location view — displays royal castle atmosphere
## Emits building_clicked when player clicks a building

signal building_clicked(building_name: String)

const BUILDINGS := [
	{"name": "Shop", "emoji": "🏪", "label": "Shop", "color": GameTheme.COLOR_PRIMARY},
	{"name": "Blacksmith", "emoji": "⚒️", "label": "Blacksmith", "color": GameTheme.COLOR_SECONDARY},
]

var _building_buttons: Array[Control] = []

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	# Background
	var bg := ColorRect.new()
	bg.name = "Background"
	bg.color = GameTheme.COLOR_CITADEL
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	# Upper dark band (wall)
	var top_wall := ColorRect.new()
	top_wall.name = "TopWall"
	top_wall.color = GameTheme.darken(GameTheme.COLOR_CITADEL, 0.25)
	top_wall.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top_wall.offset_bottom = 40
	top_wall.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(top_wall)

	# Lower dark band (wall)
	var bottom_wall := ColorRect.new()
	bottom_wall.name = "BottomWall"
	bottom_wall.color = GameTheme.darken(GameTheme.COLOR_CITADEL, 0.25)
	bottom_wall.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	bottom_wall.offset_top = -40
	bottom_wall.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bottom_wall)

	# Towers
	var towers := Control.new()
	towers.name = "Towers"
	towers.set_anchors_preset(Control.PRESET_FULL_RECT)
	towers.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(towers)

	var tower_positions := [0.15, 0.5, 0.85]
	for i in range(tower_positions.size()):
		var tower := ColorRect.new()
		tower.name = "Tower%d" % i
		tower.size = Vector2(50, 100)
		tower.color = GameTheme.darken(GameTheme.COLOR_CITADEL, 0.15)
		tower.set_anchors_preset(Control.PRESET_CENTER_TOP)
		tower.offset_left = int(tower_positions[i] * 1280) - 640 - 25
		tower.offset_right = int(tower_positions[i] * 1280) - 640 + 25
		tower.offset_top = 50
		tower.offset_bottom = 150
		tower.mouse_filter = Control.MOUSE_FILTER_IGNORE
		towers.add_child(tower)

	# Title section
	var title_container := VBoxContainer.new()
	title_container.name = "TitleSection"
	title_container.set_anchors_preset(Control.PRESET_CENTER)
	title_container.offset_left = -200
	title_container.offset_right = 200
	title_container.offset_top = -60
	title_container.offset_bottom = 40
	title_container.alignment = BoxContainer.ALIGNMENT_CENTER
	title_container.add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
	add_child(title_container)

	var title := Label.new()
	title.name = "LocationTitle"
	title.text = "🏰 SOLARA CITADEL"
	title.add_theme_font_size_override("font_size", GameTheme.FONT_LARGE)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_container.add_child(title)

	var desc := Label.new()
	desc.name = "LocationDesc"
	desc.text = "The royal castle of the kingdom"
	desc.add_theme_font_size_override("font_size", GameTheme.FONT_BODY)
	desc.modulate = GameTheme.COLOR_TEXT_SECONDARY
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_container.add_child(desc)

	# Safe zone indicator
	var safe_label := Label.new()
	safe_label.name = "SafeLabel"
	safe_label.text = "🛡️ Safe Zone — Kingdom stronghold"
	safe_label.add_theme_font_size_override("font_size", GameTheme.FONT_SUBTITLE)
	safe_label.modulate = GameTheme.COLOR_SUCCESS
	safe_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	safe_label.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	safe_label.offset_top = -120
	safe_label.offset_bottom = -80
	safe_label.offset_left = -200
	safe_label.offset_right = 200
	add_child(safe_label)

	# Buildings grid (centered)
	var buildings_container := HBoxContainer.new()
	buildings_container.name = "BuildingsContainer"
	buildings_container.set_anchors_preset(Control.PRESET_CENTER)
	buildings_container.offset_left = -200
	buildings_container.offset_right = 200
	buildings_container.offset_top = 40
	buildings_container.offset_bottom = 200
	buildings_container.add_theme_constant_override("separation", GameTheme.SPACING_LARGE)
	buildings_container.alignment = BoxContainer.ALIGNMENT_CENTER
	add_child(buildings_container)

	for b in BUILDINGS:
		var card := _create_building_card(b)
		buildings_container.add_child(card)
		_building_buttons.append(card)

## Creates a styled building card with emoji, label, and hover effect
## @param data Dictionary containing building info (name, emoji, label, color)
## @returns PanelContainer the styled building card
func _create_building_card(data: Dictionary) -> PanelContainer:
	var card := PanelContainer.new()
	card.name = data["name"]
	card.custom_minimum_size = Vector2(140, 140)
	card.mouse_filter = Control.MOUSE_FILTER_STOP

	# Card background style
	var style := GameTheme.create_bordered_panel(
		GameTheme.darken(data["color"], 0.5),
		data["color"],
		GameTheme.RADIUS_LARGE,
		GameTheme.BORDER_MEDIUM
	)
	style.content_margin_left = GameTheme.SPACING_MEDIUM
	style.content_margin_right = GameTheme.SPACING_MEDIUM
	style.content_margin_top = GameTheme.SPACING_MEDIUM
	style.content_margin_bottom = GameTheme.SPACING_MEDIUM
	card.add_theme_stylebox_override("panel", style)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
	card.add_child(vbox)

	# Emoji icon
	var icon_label := Label.new()
	icon_label.text = data["emoji"]
	icon_label.add_theme_font_size_override("font_size", 36)
	icon_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(icon_label)

	# Building name
	var name_label := Label.new()
	name_label.text = data["label"]
	name_label.add_theme_font_size_override("font_size", GameTheme.FONT_BODY)
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(name_label)

	# Click handler
	card.gui_input.connect(_on_card_input.bind(data["name"]))

	return card

## Handles click input on building cards
## @param event InputEvent the input event
## @param building_name String name of the building clicked
func _on_card_input(event: InputEvent, building_name: String) -> void:
	if event is InputEventMouseButton:
		var mouse := event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			building_clicked.emit(building_name)

class_name BaseLocationView
extends Control

## BaseLocationView - Base class for all location views
## Handles common functionality like building cards
## Responsibilities:
## - Building card creation
## - Building click handling
## - Emit building_clicked signal

signal building_clicked(building_name: String)

var buildings: Array = []
var _building_cards: Array[Control] = []


# =============================================================================
# Building Card Management (Common for Village and Citadel)
# =============================================================================

## Create building cards from buildings array
## @param buildings_array Array building data
func _create_building_cards(buildings_array: Array) -> void:
	buildings = buildings_array
	_building_cards.clear()
	
	for b in buildings:
		var card := _create_building_card(b)
		_building_cards.append(card)


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

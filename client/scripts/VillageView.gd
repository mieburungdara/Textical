extends BaseLocationView

## Village location view — displays buildings and village atmosphere
## Extends BaseLocationView for common building card functionality

const BUILDINGS := [
	{"name": "Shop", "emoji": "🏪", "label": "Shop", "color": GameTheme.COLOR_PRIMARY},
	{"name": "QuestBoard", "emoji": "📜", "label": "Quest Board", "color": GameTheme.COLOR_WARNING},
	{"name": "Blacksmith", "emoji": "⚒️", "label": "Blacksmith", "color": GameTheme.COLOR_SECONDARY},
]

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	# Background gradient
	var bg := ColorRect.new()
	bg.name = "Background"
	bg.color = GameTheme.COLOR_VILLAGE
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	# Dark overlay at bottom for depth
	var gradient_overlay := ColorRect.new()
	gradient_overlay.name = "GradientOverlay"
	gradient_overlay.color = Color(0, 0, 0, 0.15)
	gradient_overlay.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	gradient_overlay.offset_top = -200
	gradient_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(gradient_overlay)

	# Title section (centered top)
	var title_container := VBoxContainer.new()
	title_container.name = "TitleSection"
	title_container.set_anchors_preset(Control.PRESET_CENTER_TOP)
	title_container.offset_top = 80
	title_container.offset_left = -200
	title_container.offset_right = 200
	title_container.alignment = BoxContainer.ALIGNMENT_CENTER
	title_container.add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
	add_child(title_container)

	var title := Label.new()
	title.name = "LocationTitle"
	title.text = "🏘️ SOLARA VILLAGE"
	title.add_theme_font_size_override("font_size", GameTheme.FONT_LARGE)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_container.add_child(title)

	var desc := Label.new()
	desc.name = "LocationDesc"
	desc.text = "A peaceful village in the Solara Plains"
	desc.add_theme_font_size_override("font_size", GameTheme.FONT_BODY)
	desc.modulate = GameTheme.COLOR_TEXT_SECONDARY
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_container.add_child(desc)

	# Buildings grid (centered)
	var buildings_container := HBoxContainer.new()
	buildings_container.name = "BuildingsContainer"
	buildings_container.set_anchors_preset(Control.PRESET_CENTER)
	buildings_container.offset_left = -320
	buildings_container.offset_right = 320
	buildings_container.offset_top = -40
	buildings_container.offset_bottom = 120
	buildings_container.add_theme_constant_override("separation", GameTheme.SPACING_LARGE)
	buildings_container.alignment = BoxContainer.ALIGNMENT_CENTER
	add_child(buildings_container)

	# Use base class to create building cards
	_create_building_cards(BUILDINGS)
	for card in _building_cards:
		buildings_container.add_child(card)

extends BaseLocationView

## Citadel location view — displays royal castle atmosphere
## Extends BaseLocationView for common building card functionality

const BUILDINGS := [
	{"name": "Shop", "emoji": "🏪", "label": "Shop", "color": GameTheme.COLOR_PRIMARY},
	{"name": "Blacksmith", "emoji": "⚒️", "label": "Blacksmith", "color": GameTheme.COLOR_SECONDARY},
]

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

	# Use base class to create building cards
	_create_building_cards(BUILDINGS)
	for card in _building_cards:
		buildings_container.add_child(card)

extends Control

## Forest location view — displays dark forest atmosphere with decorative trees

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	# Background
	var bg := ColorRect.new()
	bg.name = "Background"
	bg.color = GameTheme.COLOR_FOREST
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	# Darker overlay at bottom for depth
	var overlay := ColorRect.new()
	overlay.name = "BottomOverlay"
	overlay.color = Color(0, 0, 0, 0.25)
	overlay.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	overlay.offset_top = -250
	overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(overlay)

	# Trees container
	var trees := Control.new()
	trees.name = "Trees"
	trees.set_anchors_preset(Control.PRESET_FULL_RECT)
	trees.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(trees)

	# Generate decorative trees
	var tree_color_dark := GameTheme.darken(GameTheme.COLOR_FOREST, 0.3)
	var tree_color_light := GameTheme.darken(GameTheme.COLOR_FOREST, 0.15)

	for i in range(25):
		var tree := ColorRect.new()
		var tree_w := randi_range(20, 40)
		var tree_h := randi_range(40, 80)
		tree.size = Vector2(tree_w, tree_h)
		tree.position = Vector2(randf() * 1200 + 40, randf() * 500 + 100)
		tree.color = tree_color_dark if i % 2 == 0 else tree_color_light
		tree.mouse_filter = Control.MOUSE_FILTER_IGNORE
		trees.add_child(tree)

	# Title section
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
	title.text = "🌲 DARKWOOD FOREST"
	title.add_theme_font_size_override("font_size", GameTheme.FONT_LARGE)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_container.add_child(title)

	var desc := Label.new()
	desc.name = "LocationDesc"
	desc.text = "A mysterious forest filled with creatures"
	desc.add_theme_font_size_override("font_size", GameTheme.FONT_BODY)
	desc.modulate = GameTheme.COLOR_TEXT_SECONDARY
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_container.add_child(desc)

	# Danger warning label
	var warning := Label.new()
	warning.name = "WarningLabel"
	warning.text = "⚠️ Hostile Territory — Prepare for battle!"
	warning.add_theme_font_size_override("font_size", GameTheme.FONT_SUBTITLE)
	warning.modulate = GameTheme.COLOR_WARNING
	warning.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	warning.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	warning.offset_top = -120
	warning.offset_bottom = -80
	warning.offset_left = -250
	warning.offset_right = 250
	add_child(warning)

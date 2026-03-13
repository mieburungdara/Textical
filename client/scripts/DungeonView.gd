extends Control

## Dungeon location view — displays grid-based dungeon floor

# Grid constants
const DUNGEON_COLS := 12
const DUNGEON_ROWS := 8
const CELL_SIZE := 50

var _floor_label: Label = null

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	# Background
	var bg := ColorRect.new()
	bg.name = "Background"
	bg.color = GameTheme.COLOR_DUNGEON
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	# Darker corners for atmosphere
	var vignette := ColorRect.new()
	vignette.name = "Vignette"
	vignette.color = Color(0, 0, 0, 0.3)
	vignette.set_anchors_preset(Control.PRESET_FULL_RECT)
	vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(vignette)

	# Floor indicator (top center)
	var floor_container := PanelContainer.new()
	floor_container.name = "FloorContainer"
	floor_container.set_anchors_preset(Control.PRESET_CENTER_TOP)
	floor_container.offset_top = 60
	floor_container.offset_left = -100
	floor_container.offset_right = 100
	floor_container.offset_bottom = 100

	var floor_style := GameTheme.create_bordered_panel(
		GameTheme.COLOR_SURFACE,
		GameTheme.COLOR_DANGER,
		GameTheme.RADIUS_MEDIUM,
		GameTheme.BORDER_MEDIUM
	)
	floor_style.content_margin_left = GameTheme.SPACING_MEDIUM
	floor_style.content_margin_right = GameTheme.SPACING_MEDIUM
	floor_style.content_margin_top = GameTheme.SPACING_SMALL
	floor_style.content_margin_bottom = GameTheme.SPACING_SMALL
	floor_container.add_theme_stylebox_override("panel", floor_style)
	add_child(floor_container)

	_floor_label = Label.new()
	_floor_label.name = "FloorIndicator"
	_floor_label.text = "⚔️ FLOOR 1"
	_floor_label.add_theme_font_size_override("font_size", GameTheme.FONT_HEADER)
	_floor_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	floor_container.add_child(_floor_label)

	# Dungeon grid (centered)
	var grid_width := DUNGEON_COLS * CELL_SIZE
	var grid_height := DUNGEON_ROWS * CELL_SIZE

	var grid := Control.new()
	grid.name = "Grid"
	grid.set_anchors_preset(Control.PRESET_CENTER)
	grid.offset_left = -grid_width / 2.0
	grid.offset_right = grid_width / 2.0
	grid.offset_top = -grid_height / 2.0 + 30
	grid.offset_bottom = grid_height / 2.0 + 30
	grid.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(grid)

	var color_a := GameTheme.COLOR_SURFACE
	var color_b := GameTheme.darken(GameTheme.COLOR_SURFACE, 0.15)

	for y in range(DUNGEON_ROWS):
		for x in range(DUNGEON_COLS):
			var cell := ColorRect.new()
			cell.size = Vector2(CELL_SIZE - 2, CELL_SIZE - 2)
			cell.position = Vector2(x * CELL_SIZE + 1, y * CELL_SIZE + 1)
			cell.color = color_a if (x + y) % 2 == 0 else color_b
			cell.mouse_filter = Control.MOUSE_FILTER_IGNORE
			grid.add_child(cell)

## Updates the floor display label
## @param floor_num int the current floor number
func update_floor(floor_num: int) -> void:
	if _floor_label:
		_floor_label.text = "⚔️ FLOOR %d" % floor_num

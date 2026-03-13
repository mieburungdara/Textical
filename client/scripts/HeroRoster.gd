extends Panel
class_name HeroRoster

## Hero Roster Panel - Grid formation display (0,0 center)
## All heroes must be played - no bench/reserve
## Supports drag & drop to swap positions

# UI Elements
@onready var title_label: Label = $TitleLabel if has_node("TitleLabel") else null
@onready var grid_container: GridContainer = $GridContainer if has_node("GridContainer") else null
@onready var close_button: Button = $CloseButton if has_node("CloseButton") else null
@onready var hero_count_label: Label = $HeroCountLabel if has_node("HeroCountLabel") else null

# Detail Panel
@onready var detail_panel: Panel = $DetailPanel if has_node("DetailPanel") else null
@onready var detail_content: VBoxContainer = $DetailPanel/DetailContent if has_node("DetailPanel/DetailContent") else null
@onready var view_button: Button = $DetailPanel/ViewButton if has_node("DetailPanel/ViewButton") else null
@onready var select_hint: Label = $DetailPanel/SelectHint if has_node("DetailPanel/SelectHint") else null

# Data
var game_manager: Node = null
var is_visible: bool = false
var selected_hero_index: int = -1
var selected_hero: Dictionary = {}

# Drag & Drop
var _drag_source_index: int = -1
var _drag_hover_index: int = -1

# Constants
const MAX_HEROES: int = 50
const GRID_COLS: int = 10

# Colors - use Theme constants
const COLOR_PLAYER := Theme.COLOR_PRIMARY
const COLOR_SELECTED := Theme.COLOR_ACCENT
const COLOR_HOVER := Theme.COLOR_SUCCESS
const COLOR_EMPTY := Theme.COLOR_SURFACE_LIGHT

func _ready() -> void:
	game_manager = Theme.get_game_manager()
	visible = false
	
	if close_button:
		close_button.pressed.connect(_on_close_pressed)
	
	if view_button:
		view_button.pressed.connect(_on_view_pressed)
		view_button.disabled = true
	
	if game_manager:
		if not game_manager.hero_count_changed.is_connected(_on_hero_changed):
			game_manager.hero_count_changed.connect(_on_hero_changed)
	
	# Show hint initially
	_show_select_hint(true)

func _on_hero_changed(_old: int, _new: int) -> void:
	refresh_heroes()

func toggle() -> void:
	is_visible = !is_visible
	visible = is_visible
	if is_visible:
		refresh_heroes()

func show_roster() -> void:
	# Close other panels first
	_close_other_panels()
	is_visible = true
	visible = true
	refresh_heroes()

func hide_roster() -> void:
	is_visible = false
	visible = false

func _close_other_panels() -> void:
	# Close other UI panels to prevent overlap
	var game_scene = get_tree().root.get_node_or_null("GameScene")
	if game_scene:
		# Close InventoryUI
		var inventory_ui = game_scene.get_node_or_null("InventoryUI")
		if inventory_ui and inventory_ui.has_method("hide_inventory"):
			inventory_ui.hide_inventory()
		
		# Close QuestBoardUI
		var quest_board = game_scene.get_node_or_null("QuestBoardUI")
		if quest_board and quest_board.has_method("hide_quest_board"):
			quest_board.hide_quest_board()

func refresh_heroes() -> void:
	if grid_container == null or game_manager == null:
		return
	
	# Clear existing items
	for child in grid_container.get_children():
		child.queue_free()
	
	# Update count label
	if hero_count_label:
		hero_count_label.text = "HEROES: %d/%d (Drag to move/swap)" % [game_manager.hero_count, MAX_HEROES]
	
	# Set grid columns
	grid_container.columns = GRID_COLS
	
	# Get heroes
	var heroes = game_manager.heroes
	
	# Create grid positions
	var positions = _get_grid_positions(MAX_HEROES)
	
	# Create cells with index stored
	for i in range(MAX_HEROES):
		var pos = positions[i]
		var cell = _create_grid_cell(i, pos, heroes)
		cell.set_meta("grid_index", i)
		grid_container.add_child(cell)

func _get_grid_positions(count: int) -> Array[Vector2i]:
	var positions: Array[Vector2i] = []
	positions.resize(count)
	
	var x: int = 0
	var y: int = 0
	var dx: int = 1
	var dy: int = 0
	var steps_in_direction: int = 1
	var steps_since_turn: int = 0
	var turn_count: int = 0
	
	for i in range(count):
		positions[i] = Vector2i(x, y)
		
		steps_since_turn += 1
		if steps_since_turn >= steps_in_direction:
			steps_since_turn = 0
			var temp = dx
			dx = -dy
			dy = temp
			turn_count += 1
			if turn_count % 2 == 0:
				steps_in_direction += 1
		
		x += dx
		y += dy
	
	return positions

func _create_grid_cell(index: int, pos: Vector2i, heroes: Array) -> Control:
	var container = VBoxContainer.new()
	container.custom_minimum_size = Vector2(Theme.SIZE_GRID_MEDIUM, Theme.SIZE_GRID_MEDIUM - 10)
	container.set_meta("grid_index", index)
	container.set_meta("grid_pos", pos)
	
	# Position label (x, y)
	var pos_label = Label.new()
	pos_label.name = "PosLabel"
	pos_label.text = "(%d,%d)" % [pos.x, pos.y]
	pos_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pos_label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	container.add_child(pos_label)
	
	# Hero or empty
	if index < heroes.size():
		var hero = heroes[index]
		var hero_panel = _create_hero_panel(hero, index)
		container.add_child(hero_panel)
	else:
		var empty_panel = PanelContainer.new()
		empty_panel.name = "EmptyPanel"
		empty_panel.custom_minimum_size = Vector2(Theme.SIZE_ICON_MEDIUM, Theme.SIZE_ICON_MEDIUM + 5)
		var empty_style = StyleBoxFlat.new()
		empty_style.bg_color = COLOR_EMPTY
		empty_style.set_corner_radius_all(Theme.RADIUS_SMALL)
		empty_panel.add_theme_stylebox_override("panel", empty_style)
		
		var empty_label = Label.new()
		empty_label.name = "EmptyLabel"
		empty_label.text = "[EMPTY]"
		empty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_label.modulate = Theme.COLOR_TEXT_DISABLED
		empty_label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
		empty_panel.add_child(empty_label)
		
		container.add_child(empty_panel)
	
	# Make draggable if has hero
	if index < heroes.size():
		container.draggable = 1
	
	# Connect signals (all cells need mouse detection)
	container.gui_input.connect(_on_cell_gui_input.bind(index, container))
	container.mouse_entered.connect(_on_cell_mouse_entered.bind(index, container))
	container.mouse_exited.connect(_on_cell_mouse_exited.bind(index, container))
	container.mouse_filter = Control.MOUSE_FILTER_STOP
	
	return container

func _create_hero_panel(hero: Dictionary, index: int) -> UICard:
	var hero_class = hero.get("class", "Novice")
	var level = hero.get("level", 1)
	var hero_name = hero.get("name", "Hero")
	
	# Create card with hero data
	var card = UICard.new()
	card.custom_minimum_size = Vector2(Theme.SIZE_ICON_MEDIUM, Theme.SIZE_ICON_MEDIUM + 5)
	card.setup({
		"title": hero_name,
		"subtitle": hero_class,
		"content": "Lv.%d" % level,
		"color": COLOR_PLAYER
	})
	card.set_meta("hero_index", index)
	
	return card

func _on_cell_gui_input(event: InputEvent, index: int, container: VBoxContainer) -> void:
	if event is InputEventMouseButton:
		var mouse_event = event as InputEventMouseButton
		if mouse_event.button_index == MOUSE_BUTTON_LEFT:
			if mouse_event.pressed:
				# Start drag
				_drag_source_index = index
			elif _drag_source_index >= 0:
				# Drop - move or swap
				if _drag_source_index != index:
					_move_or_swap_heroes(_drag_source_index, index)
				_drag_source_index = -1
		
		# Click to select (single click without drag)
		if mouse_event.button_index == MOUSE_BUTTON_LEFT and mouse_event.pressed:
			# Check if this is a click (not drag)
			if index < (game_manager.heroes.size() if game_manager else 0):
				_select_hero(index)

func _on_cell_mouse_entered(index: int, container: VBoxContainer) -> void:
	if _drag_source_index >= 0 and index != _drag_source_index:
		_drag_hover_index = index
		_highlight_cell(container, true, _is_target_empty(index))

func _on_cell_mouse_exited(index: int, container: VBoxContainer) -> void:
	if _drag_hover_index == index:
		_drag_hover_index = -1
		_highlight_cell(container, false, false)

func _is_target_empty(index: int) -> bool:
	if game_manager == null:
		return false
	var heroes = game_manager.heroes
	return index >= heroes.size()

func _highlight_cell(container: VBoxContainer, highlight: bool, is_empty: bool) -> void:
	# Find UICard child
	var card: UICard = null
	for child in container.get_children():
		if child is UICard:
			card = child
			break
	
	if card:
		var style = card.get_theme_stylebox("panel") as StyleBoxFlat
		if style:
			if highlight:
				if is_empty:
					# Green for move to empty
					style.border_color = Theme.COLOR_SUCCESS
				else:
					# Yellow for swap
					style.border_color = COLOR_HOVER
				style.set_border_width_all(Theme.BORDER_MEDIUM)
			else:
				style.set_border_width_all(Theme.BORDER_NONE)

func _move_or_swap_heroes(from_index: int, to_index: int) -> void:
	if game_manager == null:
		return
	
	var heroes = game_manager.heroes
	var hero_count = heroes.size()
	
	# Validate indices
	if from_index >= hero_count:
		return
	
	# Check if target is empty or has hero
	if to_index >= hero_count:
		# MOVE: Target is empty - just move hero to new position
		var moving_hero = heroes[from_index]
		
		# Shift heroes between from and to
		if from_index < to_index:
			# Move right: shift left
			for i in range(from_index, to_index):
				heroes[i] = heroes[i + 1]
		else:
			# Move left: shift right
			for i in range(from_index, to_index, -1):
				heroes[i] = heroes[i - 1]
		
		heroes[to_index] = moving_hero
		
		refresh_heroes()
		print("[HeroRoster] Moved: %s to position %d" % [moving_hero.get("name", "Unknown"), to_index])
	
	else:
		# SWAP: Target has hero - swap positions
		var temp = heroes[from_index]
		heroes[from_index] = heroes[to_index]
		heroes[to_index] = temp
		
		refresh_heroes()
		var from_name = heroes[to_index].get("name", "Unknown")
		var to_name = heroes[from_index].get("name", "Unknown")
		print("[HeroRoster] Swapped: %s <-> %s" % [from_name, to_name])

func _on_close_pressed() -> void:
	hide_roster()

# =============================================================================
# Hero Selection & Detail View
# =============================================================================

func _select_hero(index: int) -> void:
	if game_manager == null:
		return
	
	var heroes = game_manager.heroes
	if index >= heroes.size():
		return
	
	selected_hero_index = index
	selected_hero = heroes[index]
	
	# Show hero details
	_show_hero_details(selected_hero)
	
	# Enable view button
	if view_button:
		view_button.disabled = false

func _show_hero_details(hero: Dictionary) -> void:
	if detail_content == null:
		return
	
	# Clear existing content
	for child in detail_content.get_children():
		child.queue_free()
	
	# Hide hint, show content
	_show_select_hint(false)
	
	# Hero Name (large)
	var name_label = Label.new()
	name_label.text = hero.get("name", "Unknown")
	name_label.add_theme_font_size_override("font_size", Theme.FONT_SUBTITLE)
	name_label.modulate = Theme.COLOR_ACCENT
	detail_content.add_child(name_label)
	
	# Hero Class
	var class_label = Label.new()
	class_label.text = "Class: " + hero.get("class", "Novice")
	class_label.add_theme_font_size_override("font_size", Theme.FONT_BODY)
	detail_content.add_child(class_label)
	
	# Hero Level
	var level_label = Label.new()
	level_label.text = "Level: %d" % hero.get("level", 1)
	level_label.add_theme_font_size_override("font_size", Theme.FONT_BODY)
	detail_content.add_child(level_label)
	
	# Status
	var status_label = Label.new()
	status_label.text = "Status: " + hero.get("status", "active").to_upper()
	status_label.add_theme_font_size_override("font_size", Theme.FONT_BODY)
	var status = hero.get("status", "active")
	match status:
		"active":
			status_label.modulate = Theme.COLOR_SUCCESS
		"resting":
			status_label.modulate = Theme.COLOR_WARNING
		"dead":
			status_label.modulate = Theme.COLOR_DANGER
	detail_content.add_child(status_label)
	
	# Hero ID
	var id_label = Label.new()
	id_label.text = "ID: " + hero.get("id", "unknown")
	id_label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	id_label.modulate = Theme.COLOR_TEXT_SECONDARY
	detail_content.add_child(id_label)

func _show_select_hint(show: bool) -> void:
	if select_hint:
		select_hint.visible = show
	if detail_content:
		detail_content.visible = !show

func _on_view_pressed() -> void:
	if selected_hero.is_empty():
		return
	
	# Find and show HeroDetail
	var game_scene = get_tree().root.get_node_or_null("GameScene")
	if game_scene:
		var hero_detail = game_scene.get_node_or_null("HeroDetail")
		if hero_detail and hero_detail.has_method("show_hero"):
			hero_detail.show_hero(selected_hero)
	
	print("[HeroRoster] View hero: %s (full details)" % selected_hero.get("name", "Unknown"))

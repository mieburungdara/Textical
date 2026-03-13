extends Node2D
class_name GameScene

## Main game scene that manages location views
## UI (HUD) stays persistent, only GameView changes

# Grid constants
const DUNGEON_COLS := 12
const DUNGEON_ROWS := 8
const CELL_SIZE := 50

@onready var game_view: Node2D = $GameView

var location_manager: Node = null
var _current_view_type: int = -1

func _ready() -> void:
	location_manager = get_tree().root.get_node_or_null("LocationManager")
	if location_manager == null:
		push_error("[GameScene] LocationManager not found!")
		return
	
	if not location_manager.location_changed.is_connected(_on_location_changed):
		location_manager.location_changed.connect(_on_location_changed)
	if not location_manager.floor_changed.is_connected(_on_floor_changed):
		location_manager.floor_changed.connect(_on_floor_changed)
	
	_update_view()

func _on_location_changed(_from: int, _to: int) -> void:
	_update_view()

func _on_floor_changed(_from: int, _to: int) -> void:
	_refresh_hud()

func _update_view() -> void:
	if location_manager == null:
		return
	
	var location = location_manager.current_location
	
	if location == _current_view_type:
		_refresh_hud()
		return
	
	_current_view_type = location
	
	for child in game_view.get_children():
		child.queue_free()
	
	# Reset building panel reference since children were freed
	_building_panel = null
	
	match location:
		location_manager.LocationType.VILLAGE:
			_create_village_view()
		location_manager.LocationType.FOREST:
			_create_forest_view()
		location_manager.LocationType.DUNGEON:
			_create_dungeon_view()
		location_manager.LocationType.CITADEL:
			_create_citadel_view()
	
	# Refresh HUD
	_refresh_hud()

func _create_village_view() -> void:
	# Create background
	var bg = ColorRect.new()
	bg.name = "Background"
	bg.color = Theme.COLOR_VILLAGE
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	game_view.add_child(bg)
	
	# Create buildings container
	var buildings = Node2D.new()
	buildings.name = "Buildings"
	game_view.add_child(buildings)
	
	# Add building placeholders
	var building_positions = [
		{"name": "TownHall", "pos": Vector2(100, 100), "color": Theme.COLOR_ACCENT, "label": "🏛️ Town Hall"},
		{"name": "Shop", "pos": Vector2(250, 100), "color": Theme.COLOR_PRIMARY, "label": "🏪 Shop"},
		{"name": "QuestBoard", "pos": Vector2(400, 100), "color": Theme.COLOR_WARNING, "label": "📜 Quest Board"},
		{"name": "Blacksmith", "pos": Vector2(550, 100), "color": Theme.COLOR_SECONDARY, "label": "⚒️ Blacksmith"}
	]
	
	for b in building_positions:
		var rect = ColorRect.new()
		rect.name = b["name"]
		rect.size = Vector2(Theme.SPACING_LARGE * 4, Theme.SPACING_LARGE * 3 + Theme.SPACING_MEDIUM)
		rect.position = b["pos"]
		rect.color = b["color"]
		rect.gui_input.connect(_on_building_input.bind(b["name"]))
		rect.mouse_filter = Control.MOUSE_FILTER_STOP
		buildings.add_child(rect)
		
		# Add label
		var lbl = Label.new()
		lbl.text = b["label"]
		lbl.position = b["pos"] + Vector2(5, -20)
		buildings.add_child(lbl)
	
	# Add center label
	var title = Label.new()
	title.name = "LocationTitle"
	title.text = "SOLARA VILLAGE"
	title.add_theme_font_size_override("font_size", Theme.FONT_LARGE)
	title.set_anchors_preset(Control.PRESET_CENTER)
	title.position = Vector2(-150, -50)
	game_view.add_child(title)
	
	var desc = Label.new()
	desc.name = "LocationDesc"
	desc.text = "A peaceful village in the Solara Plains"
	desc.set_anchors_preset(Control.PRESET_CENTER)
	desc.position = Vector2(-150, 0)
	game_view.add_child(desc)
	
	# Create building panel (hidden by default) - only if not already created
	if _building_panel == null or not is_instance_valid(_building_panel):
		_create_building_panel()

func _create_forest_view() -> void:
	# Create background
	var bg = ColorRect.new()
	bg.name = "Background"
	bg.color = Theme.COLOR_FOREST
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	game_view.add_child(bg)
	
	# Add trees
	var trees = Node2D.new()
	trees.name = "Trees"
	game_view.add_child(trees)
	
	# Random trees
	for i in range(20):
		var tree = ColorRect.new()
		tree.size = Vector2(30, 50)
		tree.position = Vector2(randf() * 800, randf() * 400)
		tree.color = Theme.darken(Theme.COLOR_FOREST, 0.3)
		trees.add_child(tree)
	
	# Add center label
	var title = Label.new()
	title.name = "LocationTitle"
	title.text = "DARKWOOD FOREST"
	title.add_theme_font_size_override("font_size", Theme.FONT_LARGE)
	title.set_anchors_preset(Control.PRESET_CENTER)
	title.position = Vector2(-150, -50)
	game_view.add_child(title)
	
	var desc = Label.new()
	desc.name = "LocationDesc"
	desc.text = "A mysterious forest filled with creatures"
	desc.set_anchors_preset(Control.PRESET_CENTER)
	desc.position = Vector2(-150, 0)
	game_view.add_child(desc)

func _create_dungeon_view() -> void:
	# Create background
	var bg = ColorRect.new()
	bg.name = "Background"
	bg.color = Theme.COLOR_DUNGEON
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	game_view.add_child(bg)
	
	# Add grid (optimized - use constants)
	var grid = Node2D.new()
	grid.name = "Grid"
	game_view.add_child(grid)
	
	var cell_size = CELL_SIZE
	var cols = DUNGEON_COLS
	var rows = DUNGEON_ROWS
	
	# Pre-calculate colors using Theme
	var color_a := Theme.COLOR_SURFACE
	var color_b := Theme.darken(Theme.COLOR_SURFACE, 0.1)
	
	for y in range(rows):
		for x in range(cols):
			var cell = ColorRect.new()
			cell.size = Vector2(cell_size - 2, cell_size - 2)
			cell.position = Vector2(x * cell_size + 1, y * cell_size + 1)
			cell.color = color_a if (x + y) % 2 == 0 else color_b
			grid.add_child(cell)
	
	# Add floor indicator
	var floor_label = Label.new()
	floor_label.name = "FloorIndicator"
	floor_label.text = "FLOOR %d" % location_manager.current_floor
	floor_label.add_theme_font_size_override("font_size", Theme.FONT_HEADER)
	floor_label.set_anchors_preset(Control.PRESET_CENTER)
	floor_label.position = Vector2(-50, -100)
	game_view.add_child(floor_label)

func _create_citadel_view() -> void:
	# Create background
	var bg = ColorRect.new()
	bg.name = "Background"
	bg.color = Theme.COLOR_CITADEL
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	game_view.add_child(bg)
	
	# Add castle walls
	var walls = Node2D.new()
	walls.name = "CastleWalls"
	game_view.add_child(walls)
	
	# Top and bottom walls
	var top_wall = ColorRect.new()
	top_wall.size = Vector2(800, 30)
	top_wall.position = Vector2(0, 0)
	top_wall.color = Theme.darken(Theme.COLOR_CITADEL, 0.2)
	walls.add_child(top_wall)
	
	var bottom_wall = ColorRect.new()
	bottom_wall.size = Vector2(800, 30)
	bottom_wall.position = Vector2(0, 430)
	bottom_wall.color = Theme.darken(Theme.COLOR_CITADEL, 0.2)
	walls.add_child(bottom_wall)
	
	# Add towers
	for i in range(3):
		var tower = ColorRect.new()
		tower.size = Vector2(40, 80)
		tower.position = Vector2(100 + i * 250, 50)
		tower.color = Theme.darken(Theme.COLOR_CITADEL, 0.1)
		walls.add_child(tower)
	
	# Add center label
	var title = Label.new()
	title.name = "LocationTitle"
	title.text = "SOLARA CITADEL"
	title.add_theme_font_size_override("font_size", Theme.FONT_LARGE)
	title.set_anchors_preset(Control.PRESET_CENTER)
	title.position = Vector2(-150, -50)
	game_view.add_child(title)
	
	var desc = Label.new()
	desc.name = "LocationDesc"
	desc.text = "The royal castle of the kingdom"
	desc.set_anchors_preset(Control.PRESET_CENTER)
	desc.position = Vector2(-150, 0)
	game_view.add_child(desc)

func _refresh_hud() -> void:
	var hud = get_node_or_null("GlobalHUD")
	if hud and hud.has_method("refresh"):
		hud.refresh()

# =============================================================================
# Building Interaction
# =============================================================================

var _building_panel: Panel = null
var _building_panel_desc: Label = null

func _create_building_panel() -> void:
	_building_panel = Panel.new()
	_building_panel.name = "BuildingPanel"
	_building_panel.custom_minimum_size = Vector2(Theme.SIZE_PANEL_WIDTH, Theme.SPACING_LARGE * 5 + Theme.SPACING_MEDIUM * 2)
	_building_panel.set_anchors_preset(Control.PRESET_CENTER)
	_building_panel.visible = false
	
	# Background style
	var style = Theme.create_bordered_panel(Theme.COLOR_SURFACE, Theme.COLOR_SECONDARY, Theme.RADIUS_MEDIUM, Theme.BORDER_MEDIUM)
	_building_panel.add_theme_stylebox_override("panel", style)
	
	var vbox = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	_building_panel.add_child(vbox)
	
	# Header
	var header = HBoxContainer.new()
	vbox.add_child(header)
	
	var title_lbl = Label.new()
	title_lbl.name = "BuildingTitle"
	title_lbl.text = "Building"
	title_lbl.add_theme_font_size_override("font_size", Theme.FONT_SUBTITLE)
	header.add_child(title_lbl)
	
	header.add_child(Control.new()) # Spacer
	
	var close_btn = UIButton.new()
	close_btn.setup_primary("X")
	close_btn.pressed.connect(_close_building_panel)
	header.add_child(close_btn)
	
	# Description
	_building_panel_desc = Label.new()
	_building_panel_desc.name = "BuildingDesc"
	_building_panel_desc.text = "Click to interact"
	_building_panel_desc.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	_building_panel_desc.modulate = Theme.COLOR_TEXT_SECONDARY
	_building_panel_desc.text_overrun_behavior = TextServer.OVERRUN_WORD_WRAP
	vbox.add_child(_building_panel_desc)
	
	# Action buttons container
	var actions = VBoxContainer.new()
	actions.name = "BuildingActions"
	vbox.add_child(actions)
	
	game_view.add_child(_building_panel)

func _on_building_input(event: InputEvent, building_name: String) -> void:
	if event is InputEventMouseButton:
		var mouse = event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			_open_building_panel(building_name)

func _open_building_panel(building_name: String) -> void:
	if _building_panel == null:
		_create_building_panel()
	
	# Set building info
	var title = _building_panel.get_node_or_null("BuildingTitle")
	if title:
		title.text = building_name
	
	if _building_panel_desc:
		match building_name:
			"TownHall":
				_building_panel_desc.text = "Manage your heroes and view kingdom status"
			"Shop":
				_building_panel_desc.text = "Buy and sell items"
			"QuestBoard":
				_building_panel_desc.text = "Accept new quests"
			"Blacksmith":
				_building_panel_desc.text = "Upgrade and repair equipment"
	
	# Update action buttons
	var actions = _building_panel.get_node_or_null("BuildingActions")
	if actions:
		for child in actions.get_children():
			child.queue_free()
		
		# Add action buttons based on building
		match building_name:
			"Shop":
				_add_building_action(actions, "🛒 Browse Shop", _on_shop_browse)
				_building_panel_desc.text = "Welcome! Browse our wares."
			"QuestBoard":
				_add_building_action(actions, "📜 View Quests", _on_quest_board)
				_building_panel_desc.text = "Available quests in the region."
			"Blacksmith":
				_add_building_action(actions, "⚒️ Upgrade Equipment", _on_blacksmith_upgrade)
				_building_panel_desc.text = "Upgrade your equipment."
			"TownHall":
				_add_building_action(actions, "👥 Manage Heroes", _on_town_hall)
				_building_panel_desc.text = "Your headquarters in Solara Village."
	
	_building_panel.visible = true

func _add_building_action(parent: Control, text: String, callback: Callable) -> void:
	var btn = UIButton.new()
	btn.setup_primary(text)
	btn.custom_minimum_size = Vector2(Theme.SIZE_LARGE_WIDTH, Theme.SIZE_BUTTON_MEDIUM)
	parent.add_child(btn)
	btn.pressed.connect(callback)

func _close_building_panel() -> void:
	if _building_panel:
		_building_panel.visible = false

# Building action handlers
func _on_shop_browse() -> void:
	print("[GameScene] Opening shop...")
	_close_building_panel()
	# Open Shop UI
	var shop_ui = get_node_or_null("ShopUI")
	if shop_ui and shop_ui.has_method("show_shop"):
		shop_ui.show_shop()
	else:
		push_warning("[GameScene] ShopUI not found!")

func _on_quest_board() -> void:
	print("[GameScene] Viewing quest board...")
	_close_building_panel()
	# Open QuestBoard UI
	var quest_board = get_node_or_null("QuestBoardUI")
	if quest_board and quest_board.has_method("show_quest_board"):
		quest_board.show_quest_board()
	else:
		push_warning("[GameScene] QuestBoardUI not found!")

func _on_blacksmith_upgrade() -> void:
	print("[GameScene] Opening blacksmith...")
	_close_building_panel()
	# Open Blacksmith UI
	var blacksmith_ui = get_node_or_null("BlacksmithUI")
	if blacksmith_ui and blacksmith_ui.has_method("show_blacksmith"):
		blacksmith_ui.show_blacksmith()
	else:
		push_warning("[GameScene] BlacksmithUI not found!")

func _on_town_hall() -> void:
	print("[GameScene] Opening town hall...")
	_close_building_panel()
	# Open TownHall UI
	var townhall_ui = get_node_or_null("TownHallUI")
	if townhall_ui and townhall_ui.has_method("show_town_hall"):
		townhall_ui.show_town_hall()
	else:
		push_warning("[GameScene] TownHallUI not found!")

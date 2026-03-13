extends Control

## Main game scene that manages location views and UI overlays
## This is an orchestrator - delegates specific concerns to specialized services

# Location view scene paths
const VIEW_SCENES := {
	0: "res://scenes/VillageView.tscn",  # VILLAGE
	1: "res://scenes/ForestView.tscn",   # FOREST
	2: "res://scenes/DungeonView.tscn",  # DUNGEON
	3: "res://scenes/CitadelView.tscn",  # CITADEL
}

@onready var game_view: Control = $GameView
@onready var dim_overlay: Panel = $UILayer/DimOverlay
@onready var overlay_container: Control = $UILayer/OverlayContainer
@onready var building_panel: BuildingPanel = $BuildingPanel

var location_manager: Node = null
var _current_view_type = null
var _current_view_node: Control = null

func _ready() -> void:
	_init_location_manager()
	_init_dim_overlay()
	_init_building_panel()
	_update_view()


## Initialize location manager connection
func _init_location_manager() -> void:
	location_manager = get_tree().root.get_node_or_null("LocationManager")
	if location_manager == null:
		push_error("[GameScene] LocationManager not found!")
		return

	if not location_manager.location_changed.is_connected(_on_location_changed):
		location_manager.location_changed.connect(_on_location_changed)
	if not location_manager.floor_changed.is_connected(_on_floor_changed):
		location_manager.floor_changed.connect(_on_floor_changed)


## Initialize dim overlay for closing panels
func _init_dim_overlay() -> void:
	dim_overlay.gui_input.connect(_on_dim_overlay_input)
	dim_overlay.mouse_filter = Control.MOUSE_FILTER_STOP


## Initialize building panel connections
func _init_building_panel() -> void:
	if building_panel:
		if not building_panel.action_triggered.is_connected(_on_building_action_triggered):
			building_panel.action_triggered.connect(_on_building_action_triggered)


# =============================================================================
# Location View Management (delegated to LocationManager)
# =============================================================================

func _on_location_changed(_from: int, _to: int) -> void:
	_update_view()


func _on_floor_changed(_from: int, _to: int) -> void:
	_update_floor_display()
	_refresh_hud()


## Loads the appropriate view scene for the current location
func _update_view() -> void:
	if location_manager == null:
		return

	var location = location_manager.current_location

	if location == _current_view_type:
		_refresh_hud()
		return

	_current_view_type = location

	# Remove previous view
	if _current_view_node and is_instance_valid(_current_view_node):
		_disconnect_building_signal()
		_current_view_node.queue_free()
		_current_view_node = null

	# Load new view scene
	var scene_path: String = VIEW_SCENES.get(location, "")
	if scene_path == "":
		push_error("[GameScene] No scene for location: %s" % location)
		return

	var scene: PackedScene = load(scene_path)
	if scene == null:
		push_error("[GameScene] Failed to load scene: %s" % scene_path)
		return

	_current_view_node = scene.instantiate() as Control
	game_view.add_child(_current_view_node)

	# Connect building_clicked signal from view
	_connect_building_signal()

	# Update floor display for dungeon
	if location == location_manager.LocationType.DUNGEON:
		_update_floor_display()

	# Refresh HUD
	_refresh_hud()


## Connect building_clicked signal from current view
func _connect_building_signal() -> void:
	if _current_view_node and _current_view_node.has_signal("building_clicked"):
		_current_view_node.building_clicked.connect(_on_building_clicked)


## Disconnect building_clicked signal from previous view
func _disconnect_building_signal() -> void:
	if _current_view_node and _current_view_node.has_signal("building_clicked"):
		if _current_view_node.building_clicked.is_connected(_on_building_clicked):
			_current_view_node.building_clicked.disconnect(_on_building_clicked)


func _update_floor_display() -> void:
	if _current_view_node and _current_view_node.has_method("update_floor"):
		_current_view_node.update_floor(location_manager.current_floor)


func _refresh_hud() -> void:
	var hud = get_node_or_null("GlobalHUD")
	if hud and hud.has_method("refresh"):
		hud.refresh()


# =============================================================================
# DimOverlay Management
# =============================================================================

## Shows dim overlay behind UI panels
func _show_dim_overlay() -> void:
	if dim_overlay:
		dim_overlay.visible = true


## Hides dim overlay
func _hide_dim_overlay() -> void:
	if dim_overlay:
		dim_overlay.visible = false


## Closes all overlay panels when dim background is clicked
func _on_dim_overlay_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mouse := event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			_close_all_panels()


func _close_all_panels() -> void:
	# Close building panel
	if building_panel:
		building_panel.close()
	
	_hide_dim_overlay()

	# Close all overlay UI panels
	for child in overlay_container.get_children():
		if child.visible:
			child.visible = false


# =============================================================================
# Building Interaction (delegated to BuildingPanel)
# =============================================================================

## Handles building click from views (VillageView, CitadelView)
func _on_building_clicked(building_name: String) -> void:
	if building_panel:
		building_panel.show_building(building_name)
		_show_dim_overlay()


## Handle building panel action triggers
func _on_building_action_triggered(action_name: String) -> void:
	_hide_dim_overlay()
	
	match action_name:
		"shop":
			_open_ui("ShopUI", "show_shop")
		"quest_board":
			_open_ui("QuestBoardUI", "show_quest_board")
		"blacksmith":
			_open_ui("BlacksmithUI", "show_blacksmith")


## Open a UI panel by name
## @param ui_name String name of the UI node
## @param method_name String method to call on the UI
func _open_ui(ui_name: String, method_name: String) -> void:
	var ui_node = overlay_container.get_node_or_null(ui_name)
	if ui_node and ui_node.has_method(method_name):
		_show_dim_overlay()
		ui_node.call(method_name)
	else:
		push_warning("[GameScene] %s not found!" % ui_name)

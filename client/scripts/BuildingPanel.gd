class_name BuildingPanel
extends Control

## BuildingPanel - Handles building interaction UI
## Responsible for creating, showing, and managing building action panels
## This is a dedicated service for building UI - SRP compliant

signal action_triggered(action_name: String)

var _panel: Panel = null
var _title_label: Label = null
var _description_label: Label = null
var _actions_container: VBoxContainer = null
var _overlay: Control = null
var _is_visible: bool = false

# Building configurations
const BUILDING_CONFIG := {
	"Shop": {
		"description": "Welcome! Browse our wares.",
		"actions": [{"label": "🛒 Browse Shop", "callback": "_on_shop_browse"}]
	},
	"QuestBoard": {
		"description": "Available quests in the region.",
		"actions": [{"label": "📜 View Quests", "callback": "_on_quest_board"}]
	},
	"Blacksmith": {
		"description": "Upgrade your equipment.",
		"actions": [{"label": "⚒️ Upgrade Equipment", "callback": "_on_blacksmith_upgrade"}]
	}
}

func _ready() -> void:
	_create_ui()


## Initialize the building panel UI
func _create_ui() -> void:
	# Create panel
	_panel = Panel.new()
	_panel.name = "BuildingPanel"
	_panel.custom_minimum_size = Vector2(GameTheme.SIZE_PANEL_WIDTH, GameTheme.SPACING_LARGE * 5 + GameTheme.SPACING_MEDIUM * 2)
	_panel.set_anchors_preset(Control.PRESET_CENTER)
	_panel.offset_left = -150
	_panel.offset_right = 150
	_panel.offset_top = -100
	_panel.offset_bottom = 100
	_panel.visible = false

	# Background style
	var style := GameTheme.create_bordered_panel(
		GameTheme.COLOR_SURFACE, 
		GameTheme.COLOR_SECONDARY, 
		GameTheme.RADIUS_MEDIUM, 
		GameTheme.BORDER_MEDIUM
	)
	style.content_margin_left = GameTheme.SPACING_MEDIUM
	style.content_margin_right = GameTheme.SPACING_MEDIUM
	style.content_margin_top = GameTheme.SPACING_MEDIUM
	style.content_margin_bottom = GameTheme.SPACING_MEDIUM
	_panel.add_theme_stylebox_override("panel", style)

	# VBox container
	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", GameTheme.SPACING_MEDIUM)
	_panel.add_child(vbox)

	# Header
	var header := HBoxContainer.new()
	vbox.add_child(header)

	_title_label = Label.new()
	_title_label.name = "BuildingTitle"
	_title_label.text = "Building"
	_title_label.add_theme_font_size_override("font_size", GameTheme.FONT_SUBTITLE)
	_title_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(_title_label)

	var close_btn := Button.new()
	close_btn.text = "✕"
	close_btn.pressed.connect(close_panel)
	header.add_child(close_btn)

	# Description
	_description_label = Label.new()
	_description_label.name = "BuildingDesc"
	_description_label.text = "Click to interact"
	_description_label.add_theme_font_size_override("font_size", GameTheme.FONT_CAPTION)
	_description_label.modulate = GameTheme.COLOR_TEXT_SECONDARY
	vbox.add_child(_description_label)

	# Action buttons container
	_actions_container = VBoxContainer.new()
	_actions_container.name = "BuildingActions"
	vbox.add_child(_actions_container)

	add_child(_panel)


## Show the building panel for a specific building
## @param building_name String name of the building
func show_building(building_name: String) -> void:
	if _panel == null:
		push_error("[BuildingPanel] Panel not initialized!")
		return

	# Update title
	_title_label.text = building_name

	# Update description from config
	var config = BUILDING_CONFIG.get(building_name, {})
	_description_label.text = config.get("description", "Click to interact")

	# Update action buttons
	_clear_actions()
	var actions = config.get("actions", [])
	for action in actions:
		_add_action_button(action.get("label", ""), action.get("callback", ""))

	open_panel()
	_is_visible = true


## Clear all action buttons
func _clear_actions() -> void:
	for child in _actions_container.get_children():
		child.queue_free()


## Add an action button
## @param label String button label
## @param callback_name String name of callback method
func _add_action_button(label: String, callback_name: String) -> void:
	if label.is_empty():
		return
	
	var btn := Button.new()
	btn.text = label
	btn.custom_minimum_size = Vector2(GameTheme.SIZE_LARGE_WIDTH, GameTheme.SIZE_BUTTON_MEDIUM)
	_actions_container.add_child(btn)
	
	# Connect to this object's method
	if has_method(callback_name):
		btn.pressed.connect(Callable(self, callback_name))


## Show the panel
func open_panel() -> void:
	if _panel:
		_panel.visible = true
		_is_visible = true


## Hide the panel
func close_panel() -> void:
	if _panel:
		_panel.visible = false
		_is_visible = false


## Check if panel is visible
func is_open() -> bool:
	return _is_visible


## Close the panel
func close() -> void:
	close_panel()


# =============================================================================
# Building Action Handlers
# These methods emit signals to let GameScene handle the actual UI opening
# =============================================================================

func _on_shop_browse() -> void:
	hide()
	action_triggered.emit("shop")

func _on_quest_board() -> void:
	hide()
	action_triggered.emit("quest_board")

func _on_blacksmith_upgrade() -> void:
	hide()
	action_triggered.emit("blacksmith")

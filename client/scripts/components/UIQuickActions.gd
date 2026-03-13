extends HBoxContainer
class_name UIQuickActions

## Quick Actions Widget
## Shortcut buttons for common actions

# Data
var _actions: Array = []

# Default actions
const DEFAULT_ACTIONS := [
	{"id": "inventory", "icon": "📦", "label": "Inventory", "color": GameTheme.COLOR_PRIMARY},
	{"id": "heroes", "icon": "👥", "label": "Heroes", "color": GameTheme.COLOR_PRIMARY},
	{"id": "quests", "icon": "📜", "label": "Quests", "color": GameTheme.COLOR_WARNING},
	{"id": "shop", "icon": "🏪", "label": "Shop", "color": GameTheme.COLOR_SUCCESS},
	{"id": "blacksmith", "icon": "⚒️", "label": "Blacksmith", "color": GameTheme.COLOR_SECONDARY}
]

signal action_triggered(action_id: String)

const BUTTON_WIDTH := 80
const BUTTON_HEIGHT := 45

func _ready() -> void:
	_setup_widget()

func _setup_widget() -> void:
	add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
	
	# Load default actions
	load_actions(DEFAULT_ACTIONS)

func load_actions(actions: Array) -> void:
	_actions = actions
	_clear_buttons()
	
	for action in actions:
		var button = _create_action_button(action)
		add_child(button)

func _clear_buttons() -> void:
	for child in get_children():
		child.queue_free()

func _create_action_button(action: Dictionary) -> Control:
	var btn = UIButton.new()
	btn.custom_minimum_size = Vector2(BUTTON_WIDTH, BUTTON_HEIGHT)
	
	var icon = action.get("icon", "⚡")
	var label = action.get("label", "Action")
	var color = action.get("color", GameTheme.COLOR_PRIMARY)
	var action_id = action.get("id", "")
	
	btn.setup(label, icon, color)
	btn.set_meta("action_id", action_id)  # Store for lookup
	btn.pressed.connect(_on_action_pressed.bind(action_id))
	
	return btn

func _on_action_pressed(action_id: String) -> void:
	action_triggered.emit(action_id)
	print("[UIQuickActions] Action triggered: %s" % action_id)

## Add custom action
func add_action(action_id: String, icon: String, label: String, color: Color = GameTheme.COLOR_PRIMARY) -> void:
	var action = {
		"id": action_id,
		"icon": icon,
		"label": label,
		"color": color
	}
	_actions.append(action)
	load_actions(_actions)

## Remove action
func remove_action(action_id: String) -> void:
	_actions = _actions.filter(func(a): return a.get("id", "") != action_id)
	load_actions(_actions)

## Enable/Disable action
func set_action_enabled(action_id: String, enabled: bool) -> void:
	# Find button by metadata and set disabled
	for child in get_children():
		if child is UIButton:
			if child.get_meta("action_id", "") == action_id:
				child.disabled = not enabled
				return

## Get action button
func get_action_button(action_id: String) -> Control:
	for child in get_children():
		if child is UIButton:
			if child.get_meta("action_id", "") == action_id:
				return child
	return null

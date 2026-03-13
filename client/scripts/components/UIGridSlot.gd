extends PanelContainer
class_name UIGridSlot

## Base Grid Slot Component
## Versatile slot for inventory, hero roster, equipment, etc.

# UI Elements
var vbox: VBoxContainer
var icon_component: Control
var label_component: Label
var highlight_border: StyleBoxFlat

# Properties
var slot_index: int = -1
var slot_data: Dictionary = {}
var is_empty_slot: bool = true
var is_highlighted: bool = false
var highlight_color: Color = Color.GREEN  # Default, will be set from Theme in _ready

# Size - will be set from Theme in _ready
var _slot_size: int = 60  # Default, will be set from Theme in _ready

# Signals
signal slot_clicked(index, data)
signal slot_hovered(index, data)
signal slot_drag_started(index, data)
signal slot_dropped(index, target_index, data)

func _ready() -> void:
	# Initialize Theme constants in _ready to avoid class-level dependency
	_slot_size = Theme.SIZE_GRID_MEDIUM
	highlight_color = Theme.COLOR_SUCCESS
	_build_default_slot()

func _build_default_slot() -> void:
	custom_minimum_size = Vector2(_slot_size, _slot_size)
	mouse_filter = Control.MOUSE_FILTER_STOP
	
	# Default styling (empty)
	_apply_style(Theme.COLOR_SURFACE_LIGHT, false)
	
	# VBox for content
	vbox = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 0)
	add_child(vbox)
	
	# Label for empty slot
	label_component = Label.new()
	label_component.text = ""
	label_component.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label_component.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label_component.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	vbox.add_child(label_component)
	
	# Connect signals
	gui_input.connect(_on_gui_input)
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

func _apply_style(bg_color: Color, has_content: bool) -> void:
	var style = StyleBoxFlat.new()
	style.bg_color = bg_color
	style.set_corner_radius_all(Theme.RADIUS_SMALL)
	
	if is_highlighted:
		style.border_color = highlight_color
		style.set_border_width_all(Theme.BORDER_MEDIUM)
	else:
		style.border_color = Theme.COLOR_SURFACE_LIGHT
		style.set_border_width_all(Theme.BORDER_THIN)
	
	add_theme_stylebox_override("panel", style)

## Setup as empty slot
func setup_empty(index: int, label_text: String = "[EMPTY]") -> void:
	slot_index = index
	is_empty_slot = true
	slot_data = {}
	
	if label_component:
		label_component.text = label_text
		label_component.visible = true
	
	# Remove icon if exists
	if icon_component:
		icon_component.queue_free()
		icon_component = null
	
	_apply_style(Theme.COLOR_SURFACE_LIGHT, false)

## Setup with data (item, hero, etc.)
func setup_with_data(index: int, data: Dictionary) -> void:
	slot_index = index
	is_empty_slot = false
	slot_data = data
	
	if label_component:
		label_component.visible = false
	
	# Create icon component
	_create_icon_from_data(data)
	
	_apply_style(Theme.COLOR_SURFACE, true)

func _create_icon_from_data(data: Dictionary) -> void:
	# Remove existing icon
	if icon_component:
		icon_component.queue_free()
	
	# Determine icon based on data type
	var emoji = _get_data_emoji(data)
	var color = _get_data_color(data)
	
	# Create simple icon using Label
	icon_component = Label.new()
	icon_component.text = emoji
	icon_component.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	icon_component.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	icon_component.add_theme_font_size_override("font_size", _slot_size * 0.5)
	icon_component.set_anchors_preset(Control.PRESET_FULL_RECT)
	
	# Set background
	var bg = ColorRect.new()
	bg.color = color
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	icon_component.add_child(bg)
	
	# Move label to front
	icon_component.move_to_front()
	
	vbox.add_child(icon_component)

## Get data emoji (delegate to Theme)
func _get_data_emoji(data: Dictionary) -> String:
	# Try different data fields first
	if data.has("icon"):
		return data["icon"]
	if data.has("emoji"):
		return data["emoji"]
	if data.has("class"):
		return "🧑"
	if data.has("type"):
		return Theme.get_item_emoji(data["type"])
	
	return Theme.get_item_emoji("material")

func _get_data_color(data: Dictionary) -> Color:
	if data.has("rarity"):
		return Theme.get_rarity_color(data["rarity"])
	if data.has("color"):
		return data["color"]
	return Theme.COLOR_SURFACE

## Highlight slot (for drag-drop feedback)
func set_highlight(highlight: bool, color: Color = Theme.COLOR_SUCCESS) -> void:
	is_highlighted = highlight
	highlight_color = color
	
	var style = get_theme_stylebox("panel") as StyleBoxFlat
	if style:
		if highlight:
			style.border_color = color
			style.set_border_width_all(Theme.BORDER_MEDIUM)
		else:
			style.border_color = Theme.COLOR_SURFACE_LIGHT
			style.set_border_width_all(Theme.BORDER_THIN)

## Event handlers
func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mouse = event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			slot_clicked.emit(slot_index, slot_data)

func _on_mouse_entered() -> void:
	slot_hovered.emit(slot_index, slot_data)

func _on_mouse_exited() -> void:
	pass

## Get slot info
func get_index() -> int:
	return slot_index

func get_data() -> Dictionary:
	return slot_data

func is_empty() -> bool:
	return is_empty_slot

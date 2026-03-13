extends Control
class_name UIIcon

## Base Icon Component
## Versatile icon with emoji, background color, and optional label

# UI Elements
var bg_rect: ColorRect
var icon_label: Label
var count_label: Label

# Properties - initialized with defaults, will be set properly in _ready
var _icon_emoji: String = ""
var _bg_color: Color = Color.GRAY  # Default, will be set from Theme in _ready
var _icon_size: int = 40  # Default, will be set from Theme in _ready

# Ready flag - declared early to avoid usage before declaration
var _ready_called: bool = false

# Signals
signal icon_clicked(data)
signal icon_hover_started(data)
signal icon_hover_ended(data)

# Data
var icon_data: Dictionary = {}

func _ready() -> void:
	# Initialize Theme constants in _ready to avoid class-level dependency
	_icon_size = Theme.SIZE_ICON_MEDIUM
	_bg_color = Theme.COLOR_SURFACE
	_ready_called = true
	_build_icon()

func _build_icon() -> void:
	custom_minimum_size = Vector2(_icon_size, _icon_size)
	mouse_filter = Control.MOUSE_FILTER_STOP
	
	# Background
	bg_rect = ColorRect.new()
	bg_rect.color = _bg_color
	bg_rect.size = Vector2(_icon_size, _icon_size)
	bg_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg_rect)
	
	# Icon
	icon_label = Label.new()
	icon_label.text = _icon_emoji
	icon_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	icon_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	icon_label.add_theme_font_size_override("font_size", _icon_size * 0.5)
	icon_label.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(icon_label)
	
	# Count label (for stacks)
	count_label = Label.new()
	count_label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	count_label.position = Vector2(_icon_size * 0.6, _icon_size * 0.6)
	count_label.visible = false
	add_child(count_label)
	
	# Connect signals
	gui_input.connect(_on_gui_input)
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

## Setup icon with emoji and color
func setup(emoji: String, color: Color = Theme.COLOR_SURFACE, size: int = Theme.SIZE_ICON_MEDIUM) -> void:
	_icon_emoji = emoji
	_bg_color = color
	_icon_size = size
	
	# Rebuild if already ready
	if bg_rect:
		_queue_rebuild()
	else:
		_ready_called = false
		call_deferred("_ready")

func _queue_rebuild() -> void:
	# Clear and rebuild
	for child in get_children():
		child.queue_free()
	_ready_called = false
	call_deferred("_build_icon")

## Setup with item data
func setup_item(item: Dictionary) -> void:
	icon_data = item
	
	var emoji = _get_item_emoji(item.get("type", "material"))
	var color = Theme.get_rarity_color(item.get("rarity", "common"))
	
	setup(emoji, color)
	
	# Show quantity if > 1
	if item.get("quantity", 1) > 1:
		show_count(item.get("quantity", 1))

## Setup with rarity only (for empty slots)
func setup_empty(color: Color = Theme.COLOR_SURFACE_LIGHT) -> void:
	setup("", color)

## Show count label
func show_count(count: int) -> void:
	count_label.text = str(count)
	count_label.visible = true

func hide_count() -> void:
	count_label.visible = false

## Set background color
func set_bg_color(color: Color) -> void:
	_bg_color = color
	if bg_rect:
		bg_rect.color = color

## Set icon emoji
func set_icon(emoji: String) -> void:
	_icon_emoji = emoji
	if icon_label:
		icon_label.text = emoji

## Get item emoji by type (delegate to Theme)
func _get_item_emoji(item_type: String) -> String:
	return Theme.get_item_emoji(item_type)

## Event handlers
func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mouse = event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			icon_clicked.emit(icon_data)

func _on_mouse_entered() -> void:
	icon_hover_started.emit(icon_data)

func _on_mouse_exited() -> void:
	icon_hover_ended.emit(icon_data)

## Quick factory methods
static func create_weapon() -> UIIcon:
	var icon = UIIcon.new()
	icon.setup("⚔️", Theme.get_rarity_color("common"))
	return icon

static func create_armor() -> UIIcon:
	var icon = UIIcon.new()
	icon.setup("🛡️", Theme.get_rarity_color("common"))
	return icon

static func create_empty() -> UIIcon:
	var icon = UIIcon.new()
	icon.setup_empty()
	return icon

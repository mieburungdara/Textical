extends Panel
class_name UIPanel

## Base Panel Component
## Provides consistent panel styling with optional header and close button

# UI Elements
var header: HBoxContainer
var title_label: Label
var close_button: Button
var content_container: VBoxContainer

# Properties
var _show_close: bool = true
var _panel_title: String = ""

# Signals
signal closed

func _ready() -> void:
	_setup_default_style()

func _setup_default_style() -> void:
	# Apply default styling
	var style = Theme.create_bordered_panel(
		Theme.COLOR_SURFACE, 
		Theme.COLOR_SECONDARY, 
		Theme.RADIUS_MEDIUM, 
		Theme.BORDER_MEDIUM
	)
	add_theme_stylebox_override("panel", style)

## Setup panel with title and optional close button
func setup(title: String, show_close: bool = true) -> void:
	_panel_title = title
	_show_close = show_close
	
	_build_header()
	_build_content()

func _build_header() -> void:
	# Create header container
	header = HBoxContainer.new()
	header.set_anchors_preset(Control.PRESET_FULL_RECT)
	header.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	
	# Title
	title_label = Label.new()
	title_label.text = _panel_title
	title_label.add_theme_font_size_override("font_size", Theme.FONT_SUBTITLE)
	title_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(title_label)
	
	# Close button
	if _show_close:
		close_button = Button.new()
		close_button.text = "X"
		close_button.pressed.connect(_on_close_pressed)
		header.add_child(close_button)
	
	add_child(header)

func _build_content() -> void:
	content_container = VBoxContainer.new()
	content_container.set_anchors_preset(Control.PRESET_FULL_RECT)
	content_container.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	
	# Offset for header
	content_container.position = Vector2(0, Theme.SPACING_LARGE * 2)
	content_container.size = size - Vector2(0, Theme.SPACING_LARGE * 2)
	
	add_child(content_container)

func _on_close_pressed() -> void:
	visible = false
	closed.emit()

## Get content container for adding children
func get_content() -> VBoxContainer:
	return content_container

## Set panel title
func set_title(new_title: String) -> void:
	_panel_title = new_title
	if title_label:
		title_label.text = new_title

## Show/Hide panel
func show_panel() -> void:
	visible = true

func hide_panel() -> void:
	visible = false
	closed.emit()

func toggle_panel() -> void:
	visible = !visible

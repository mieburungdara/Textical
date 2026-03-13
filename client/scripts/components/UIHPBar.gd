extends Control
class_name UIHPBar

## Health/Mana Bar Component
## Displays a horizontal progress bar with label

# UI Elements
var background: ColorRect
var fill: ColorRect
var label: Label

# Properties - initialized with defaults, will be set properly in _ready
var _current: int = 100
var _max: int = 100
var _bar_color: Color = Color.GREEN  # Default, will be set from Theme in _ready
var _label_text: String = ""
var _show_percentage: bool = true

# Size - will be set from Theme in _ready
var _bar_height: int = 20  # Default, will be set from Theme in _ready

# Signals
signal bar_clicked

func _ready() -> void:
	# Initialize Theme constants in _ready to avoid class-level dependency
	_bar_height = Theme.SIZE_ICON_TINY
	_bar_color = Theme.COLOR_SUCCESS
	_build_bar()

func _build_bar() -> void:
	custom_minimum_size = Vector2(0, _bar_height + Theme.SPACING_SMALL)
	
	# Background
	background = ColorRect.new()
	background.color = Theme.COLOR_SURFACE_LIGHT
	background.set_anchors_preset(Control.PRESET_FULL_RECT)
	background.position = Vector2(0, Theme.SPACING_SMALL)
	background.size = Vector2(custom_minimum_size.x, _bar_height)
	add_child(background)
	
	# Fill
	fill = ColorRect.new()
	fill.color = _bar_color
	fill.position = Vector2(0, Theme.SPACING_SMALL)
	fill.size = Vector2(custom_minimum_size.x, _bar_height)
	add_child(fill)
	
	# Label
	label = Label.new()
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	label.set_anchors_preset(Control.PRESET_FULL_RECT)
	label.position = Vector2(0, Theme.SPACING_SMALL)
	label.size = Vector2(custom_minimum_size.x, _bar_height)
	add_child(label)
	
	# Connect click
	gui_input.connect(_on_gui_input)
	mouse_filter = Control.MOUSE_FILTER_STOP
	
	_update_display()

func setup(current: int, max_value: int, bar_color: Color = Theme.COLOR_SUCCESS, label_text: String = "") -> void:
	_current = current
	_max = max_value
	_bar_color = bar_color
	_label_text = label_text
	
	if fill:
		fill.color = _bar_color
	
	_update_display()

func set_progress(current: int, max_value: int) -> void:
	_current = current
	_max = max_value
	_update_display()

func set_color(color: Color) -> void:
	_bar_color = color
	if fill:
		fill.color = _bar_color

func set_label(text: String) -> void:
	_label_text = text
	_update_display()

func _update_display() -> void:
	if fill == null or background == null or label == null:
		return
	
	# Calculate percentage
	var percentage := 0.0
	if _max > 0:
		percentage = float(_current) / float(_max)
	
	# Clamp
	percentage = clamp(percentage, 0.0, 1.0)
	
	# Update fill width
	var fill_width = custom_minimum_size.x * percentage
	fill.size = Vector2(fill_width, _bar_height)
	
	# Update label
	if _show_percentage:
		label.text = "%s %d/%d (%.0f%%)" % [_label_text, _current, _max, percentage * 100]
	elif _label_text != "":
		label.text = "%s %d/%d" % [_label_text, _current, _max]
	else:
		label.text = "%d/%d" % [_current, _max]

func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mouse = event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			bar_clicked.emit()

## Quick factory methods

static func create_hp(current: int, max_value: int) -> UIHPBar:
	var bar = UIHPBar.new()
	bar.setup(current, max_value, Theme.COLOR_SUCCESS, "HP")
	return bar

static func create_mp(current: int, max_value: int) -> UIHPBar:
	var bar = UIHPBar.new()
	bar.setup(current, max_value, Theme.COLOR_PRIMARY, "MP")
	return bar

static func create_exp(current: int, max_value: int) -> UIHPBar:
	var bar = UIHPBar.new()
	bar.setup(current, max_value, Theme.COLOR_ACCENT, "EXP")
	return bar

extends Control
class_name StatDisplay

## StatDisplay - UI component untuk menampilkan individual stats
## Features: Display stat values, formatting, tooltips, comparison, capped indicators

# === EXPORT VARIABLES ===
@export var stat_name: String = "attack"
@export var stat_icon: Texture2D = null
@export var show_icon: bool = true
@export var show_tooltip: bool = true
@export var show_comparison: bool = true
@export var show_capped_indicator: bool = true
@export var decimal_places: int = 0
@export var use_comma_separator: bool = true
@export var value_color: Color = Color.WHITE
@export var capped_color: Color = Color(0.2, 0.8, 0.2, 1.0)  # Green untuk capped
@export var increased_color: Color = Color(0.2, 0.8, 0.2, 1.0)  # Green untuk increased
@export var decreased_color: Color = Color(0.8, 0.2, 0.2, 1.0)  # Red untuk decreased

# === NODE REFERENCES ===
@onready var container: HBoxContainer = $HBoxContainer
@onready var icon_node: TextureRect = $HBoxContainer/Icon
@onready var name_label: Label = $HBoxContainer/NameLabel
@onready var value_label: Label = $HBoxContainer/ValueLabel
@onready var diff_label: Label = $HBoxContainer/DiffLabel
@onready var capped_indicator: TextureRect = $HBoxContainer/CappedIndicator
@onready var tooltip_panel: PanelContainer = $TooltipPanel
@onready var tooltip_content: VBoxContainer = $TooltipPanel/VBoxContainer
@onready var tooltip_description: Label = $TooltipPanel/VBoxContainer/Description
@onready var tooltip_details: RichTextLabel = $TooltipPanel/VBoxContainer/Details

# === PRIVATE VARIABLES ===
var _base_value: float = 0.0
var _current_value: float = 0.0
var _cap_value: float = 0.0
var _is_capped: bool = false
var _stat_data: Dictionary = {}
var _tooltip_timer: Timer
var _is_hovered: bool = false

# === STAT METADATA ===
const STAT_METADATA: Dictionary = {
	"hp": {"display_name": "Health Points", "icon": "❤️", "description": "Jumlah HP maksimum. Meningkat saat level up atau equipment."},
	"mp": {"display_name": "Mana Points", "icon": "💙", "description": "Jumlah MP maksimum. Digunakan untuk skill magic."},
	"ap": {"display_name": "Action Points", "icon": "⚡", "description": "Action Points untuk aksi battle. Regenerasi per turn."},
	"attack": {"display_name": "Attack Power", "icon": "⚔️", "description": "Damage fisik yang diberikan ke enemy."},
	"defense": {"display_name": "Defense", "icon": "🛡️", "description": "Mengurangi damage yang diterima dari enemy."},
	"magic_attack": {"display_name": "Magic Attack", "icon": "🔮", "description": "Damage magic yang diberikan ke enemy."},
	"magic_defense": {"display_name": "Magic Defense", "icon": "✨", "description": "Mengurangi damage magic yang diterima."},
	"speed": {"display_name": "Speed", "icon": "💨", "description": "Menentukan urutan turn dalam battle."},
	"critical_rate": {"display_name": "Critical Rate", "icon": "🎯", "description": "Probabilitas critical hit (%). Maks 100%."},
	"critical_damage": {"display_name": "Critical Damage", "icon": "💥", "description": "Multiplier untuk critical hit (%). Default 150%."},
	"accuracy": {"display_name": "Accuracy", "icon": "👁️", "description": "Probabilitas hit (%). Maks 100%."},
	"evasion": {"display_name": "Evasion", "icon": "💭", "description": "Probabilitas menghindari attack (%). Maks 100%."},
	"elemental_fire": {"display_name": "Fire Affinity", "icon": "🔥", "description": "Affinity terhadap element fire."},
	"elemental_water": {"display_name": "Water Affinity", "icon": "💧", "description": "Affinity terhadap element water."},
	"elemental_earth": {"display_name": "Earth Affinity", "icon": "🌍", "description": "Affinity terhadap element earth."},
	"elemental_wind": {"display_name": "Wind Affinity", "icon": "🌪️", "description": "Affinity terhadap element wind."},
	"elemental_light": {"display_name": "Light Affinity", "icon": "☀️", "description": "Affinity terhadap element light."},
	"elemental_dark": {"display_name": "Dark Affinity", "icon": "🌙", "description": "Affinity terhadap element dark."},
}

func _ready():
	_setup_ui()
	_setup_tooltip()
	_connect_signals()
	_update_display()

func _setup_ui():
	# Setup icon visibility
	if icon_node:
		icon_node.visible = show_icon and stat_icon != null
	
	# Setup name label
	if name_label:
		var metadata = STAT_METADATA.get(stat_name, {})
		name_label.text = metadata.get("display_name", stat_name.capitalize())
	
	# Setup capped indicator
	if capped_indicator:
		capped_indicator.visible = false

func _setup_tooltip():
	tooltip_panel.visible = false
	tooltip_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	_tooltip_timer = Timer.new()
	_tooltip_timer.wait_time = 0.3
	_tooltip_timer.one_shot = true
	_tooltip_timer.timeout.connect(_show_tooltip)
	add_child(_tooltip_timer)

func _connect_signals():
	# Mouse signals untuk tooltip
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

# === PUBLIC METHODS ===

## Set stat value
func set_value(value: float, is_base: bool = false):
	if is_base:
		_base_value = value
	else:
		_current_value = value
		_check_capped()
	_update_display()

## Set stat cap
func set_cap(value: float):
	_cap_value = value
	_check_capped()
	_update_display()

## Set stat data with metadata
func set_stat_data(data: Dictionary):
	_stat_data = data
	_base_value = data.get("base", 0.0)
	_current_value = data.get("current", _base_value)
	_cap_value = data.get("cap", 0.0)
	_check_capped()
	_update_display()

## Set comparison (current vs base)
func set_comparison(current: float, base: float):
	_base_value = base
	_current_value = current
	_check_capped()
	_update_display()
	_update_diff_label()

## Update display tanpa mengubah value
func refresh():
	_update_display()

# === PRIVATE METHODS ===

func _check_capped():
	if _cap_value > 0:
		_is_capped = _current_value >= _cap_value
	else:
		_is_capped = false

func _format_value(value: float) -> String:
	var formatted: String
	
	if decimal_places > 0:
		formatted = "%.%df" % [decimal_places, value]
	else:
		formatted = str(int(value))
	
	if use_comma_separator:
		formatted = _add_comma_separator(formatted)
	
	return formatted

func _add_comma_separator(text: String) -> String:
	# Add comma separator untuk ribuan
	var parts = text.split(".")
	var result = ""
	var count = 0
	
	for i in range(parts[0].length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			result = "," + result
		result = parts[0][i] + result
		count += 1
	
	if parts.size() > 1:
		result += "." + parts[1]
	
	return result

func _update_display():
	# Update value label
	if value_label:
		value_label.text = _format_value(_current_value)
		
		# Apply colors
		if _is_capped and show_capped_indicator:
			value_label.modulate = capped_color
		else:
			value_label.modulate = value_color
	
	# Update capped indicator
	if capped_indicator:
		capped_indicator.visible = _is_capped and show_capped_indicator
	
	# Update diff label
	_update_diff_label()

func _update_diff_label():
	if not show_comparison or not diff_label:
		return
	
	var diff = _current_value - _base_value
	
	if abs(diff) < 0.01:
		diff_label.text = ""
		diff_label.modulate = Color.WHITE
	elif diff > 0:
		diff_label.text = "+%.1f" % diff
		diff_label.modulate = increased_color
	else:
		diff_label.text = "%.1f" % diff
		diff_label.modulate = decreased_color

# === TOOLTIP METHODS ===

func _on_mouse_entered():
	_tooltip_timer.start()

func _on_mouse_exited():
	_tooltip_timer.stop()
	_hide_tooltip()

func _show_tooltip():
	if not show_tooltip:
		return
	
	_update_tooltip_content()
	tooltip_panel.visible = true
	_is_hovered = true

func _hide_tooltip():
	tooltip_panel.visible = false
	_is_hovered = false

func _update_tooltip_content():
	var metadata = STAT_METADATA.get(stat_name, {})
	
	# Update description
	if tooltip_description:
		tooltip_description.text = metadata.get("description", "")
	
	# Update details
	if tooltip_details:
		var details_text = ""
		
		# Base value
		details_text += "[b]Base:[/b] %s\n" % _format_value(_base_value)
		
		# Current value
		details_text += "[b]Current:[/b] %s" % _format_value(_current_value)
		
		# Difference
		var diff = _current_value - _base_value
		if abs(diff) > 0.01:
			var sign = "+" if diff > 0 else ""
			details_text += " (%s%s)" % [sign, _format_value(diff)]
		
		details_text += "\n"
		
		# Cap
		if _cap_value > 0:
			details_text += "[b]Cap:[/b] %s\n" % _format_value(_cap_value)
			details_text += "[b]Progress:[/b] %d%%\n" % [int((_current_value / _cap_value) * 100)]
		
		# Stat data extras
		if _stat_data.has("growth"):
			details_text += "\n[b]Growth Curve:[/b] %s" % _stat_data.growth
		
		if _stat_data.has("bonus"):
			details_text += "\n[b]Bonus:[/b] %s" % _format_value(_stat_data.bonus)
		
		tooltip_details.text = details_text

# === MOUSE INPUT ===

func _process(_delta):
	if _is_hovered:
		_follow_mouse_tooltip()

func _follow_mouse_tooltip():
	var mouse_pos = get_global_mouse_position()
	tooltip_panel.position = mouse_pos + Vector2(10, 10)
	
	# Clamp to screen
	var viewport_size = get_viewport_rect().size
	var panel_size = tooltip_panel.size
	var clamped_pos = mouse_pos
	
	if mouse_pos.x + panel_size.x > viewport_size.x:
		clamped_pos.x = mouse_pos.x - panel_size.x - 10
	if mouse_pos.y + panel_size.y > viewport_size.y:
		clamped_pos.y = mouse_pos.y - panel_size.y - 10
	
	tooltip_panel.position = clamped_pos

# === STATIC UTILITIES ===

## Create stat display dari config
static func create_from_config(parent: Node, config: Dictionary) -> StatDisplay:
	var display = StatDisplay.new()
	
	display.stat_name = config.get("name", "attack")
	display.show_icon = config.get("show_icon", true)
	display.show_tooltip = config.get("show_tooltip", true)
	display.show_comparison = config.get("show_comparison", true)
	display.decimal_places = config.get("decimal_places", 0)
	display.use_comma_separator = config.get("use_comma_separator", true)
	
	parent.add_child(display)
	
	return display

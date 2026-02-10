extends Control
class_name StatComparison

## StatComparison - UI component untuk membandingkan stats (base vs current)
## Features: Compare stats, show differences, highlight changes, equipment preview

# === EXPORT VARIABLES ===
@export var show_percent_diff: bool = true
@export var show_gain_loss: bool = true
@export var highlight_changed: bool = true
@export var enable_equipment_preview: bool = true
@export var gain_color: Color = Color(0.2, 0.9, 0.3, 1.0)  # Green
@export var loss_color: Color = Color(0.9, 0.2, 0.2, 1.0)  # Red
@export var unchanged_color: Color = Color(0.7, 0.7, 0.7, 0.8)  # Gray
@export var header_color: Color = Color(1.0, 0.9, 0.6, 1.0)  # Gold

# === NODE REFERENCES ===
@onready var main_container: VBoxContainer = $MainContainer
@onready var header_container: HBoxContainer = $MainContainer/Header
@onready var base_header: Label = $MainContainer/Header/BaseHeader
@onready var current_header: Label = $MainContainer/Header/CurrentHeader
@onready var diff_header: Label = $MainContainer/Header/DiffHeader
@onready var stats_container: VBoxContainer = $MainContainer/StatsContainer
@onready var equipment_preview_container: VBoxContainer = $MainContainer/EquipmentPreview
@onready var total_diff_label: Label = $MainContainer/TotalDiffLabel

# === PRIVATE VARIABLES ===
var _base_stats: Dictionary = {}
var _current_stats: Dictionary = {}
var _equipment_preview: Array = []
var _is_preview_mode: bool = false
var _stat_comparisons: Dictionary = {}  # stat_name -> {base, current, diff, percent}

# === CONSTANTS ===
const MAIN_STATS: Array = ["hp", "mp", "initiative", "attack", "defense", "magic_attack", "magic_defense", "speed"]
const DERIVED_STATS: Array = ["critical_rate", "critical_damage", "accuracy", "evasion"]
const ELEMENTAL_STATS: Array = ["elemental_fire", "elemental_water", "elemental_earth", "elemental_wind", "elemental_light", "elemental_dark"]

func _ready():
	_setup_ui()
	_connect_signals()

func _setup_ui():
	# Setup header labels
	if base_header:
		base_header.text = "Base"
		base_header.modulate = header_color
	
	if current_header:
		current_header.text = "Current"
		current_header.modulate = header_color
	
	if diff_header:
		diff_header.text = "Change"
		diff_header.modulate = header_color
	
	# Hide equipment preview initially
	if equipment_preview_container:
		equipment_preview_container.visible = false

func _connect_signals():
	pass

# === PUBLIC METHODS ===

## Set stats untuk comparison
func set_comparison(base_stats: Dictionary, current_stats: Dictionary):
	_base_stats = base_stats
	_current_stats = current_stats
	_is_preview_mode = false
	_calculate_differences()
	_update_display()

## Set equipment preview
func set_equipment_preview(base_stats: Dictionary, equipment: Array, preview_stats: Dictionary):
	_base_stats = base_stats
	_equipment_preview = equipment
	_current_stats = preview_stats
	_is_preview_mode = true
	_calculate_differences()
	_update_display()

## Clear comparison
func clear():
	_base_stats.clear()
	_current_stats.clear()
	_equipment_preview.clear()
	_stat_comparisons.clear()
	
	# Clear UI
	for child in stats_container.get_children():
		child.queue_free()
	
	if total_diff_label:
		total_diff_label.text = ""
	
	if equipment_preview_container:
		equipment_preview_container.visible = false

# === PRIVATE METHODS ===

func _calculate_differences():
	_stat_comparisons.clear()
	
	var all_stats = _get_all_stat_keys()
	
	for stat in all_stats:
		var base = _base_stats.get(stat, 0.0)
		var current = _current_stats.get(stat, 0.0)
		var diff = current - base
		var percent = 0.0
		
		if base != 0:
			percent = (diff / base) * 100.0
		elif current != 0:
			percent = 100.0  # New stat
		
		_stat_comparisons[stat] = {
			"base": base,
			"current": current,
			"diff": diff,
			"percent": percent,
			"changed": abs(diff) > 0.01
		}

func _get_all_stat_keys() -> Array:
	var keys = []
	keys.append_array(MAIN_STATS)
	keys.append_array(DERIVED_STATS)
	keys.append_array(ELEMENTAL_STATS)
	
	# Add any additional stats from data
	for key in _base_stats.keys():
		if key not in keys:
			keys.append(key)
	
	for key in _current_stats.keys():
		if key not in keys:
			keys.append(key)
	
	return keys

func _update_display():
	# Clear existing stat rows
	for child in stats_container.get_children():
		child.queue_free()
	
	# Create stat rows
	var all_stats = _get_all_stat_keys()
	
	# Main stats section
	_add_section_header("Main Stats")
	for stat in MAIN_STATS:
		if stat in _stat_comparisons:
			_add_stat_row(stat, _stat_comparisons[stat])
	
	# Derived stats section
	_add_section_header("Derived Stats")
	for stat in DERIVED_STATS:
		if stat in _stat_comparisons:
			_add_stat_row(stat, _stat_comparisons[stat])
	
	# Elemental stats section
	_add_section_header("Elemental Affinities")
	for stat in ELEMENTAL_STATS:
		if stat in _stat_comparisons:
			_add_stat_row(stat, _stat_comparisons[stat])
	
	# Show equipment preview if in preview mode
	if _is_preview_mode and enable_equipment_preview:
		_update_equipment_preview()
	
	# Update total diff
	_update_total_diff()

func _add_section_header(text: String):
	var header = Label.new()
	header.text = text
	header.add_theme_font_size_override("font_size", 14)
	header.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8, 0.8))
	stats_container.add_child(header)

func _add_stat_row(stat_name: String, data: Dictionary):
	var row = HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	
	# Stat name
	var name_label = Label.new()
	name_label.custom_minimum_size = Vector2(120, 0)
	name_label.text = _get_stat_display_name(stat_name)
	row.add_child(name_label)
	
	# Base value
	var base_label = Label.new()
	base_label.custom_minimum_size = Vector2(80, 0)
	base_label.text = _format_value(data.base)
	base_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(base_label)
	
	# Separator
	var separator = Label.new()
	separator.text = "→"
	separator.modulate = Color(0.5, 0.5, 0.5, 0.8)
	row.add_child(separator)
	
	# Current value
	var current_label = Label.new()
	current_label.custom_minimum_size = Vector2(80, 0)
	current_label.text = _format_value(data.current)
	current_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	
	# Color based on change
	if data.changed and highlight_changed:
		if data.diff > 0:
			current_label.modulate = gain_color
		elif data.diff < 0:
			current_label.modulate = loss_color
	else:
		current_label.modulate = unchanged_color
	
	row.add_child(current_label)
	
	# Difference
	var diff_label = Label.new()
	diff_label.custom_minimum_size = Vector2(100, 0)
	diff_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	
	if data.changed:
		var sign = "+" if data.diff > 0 else ""
		diff_label.text = "%s%s" % [sign, _format_value(data.diff)]
		
		if show_percent_diff:
			var percent_sign = "+" if data.percent > 0 else ""
			diff_label.text += " (%s%.1f%%)" % [percent_sign, data.percent]
		
		# Color
		if data.diff > 0:
			diff_label.modulate = gain_color
		elif data.diff < 0:
			diff_label.modulate = loss_color
	else:
		diff_label.text = "—"
		diff_label.modulate = unchanged_color
	
	row.add_child(diff_label)
	
	# Indicator for significant changes
	if data.changed and highlight_changed:
		var indicator = Label.new()
		var arrow = "↑" if data.diff > 0 else "↓" if data.diff < 0 else "•"
		indicator.text = arrow
		indicator.modulate = gain_color if data.diff > 0 else loss_color
		row.add_child(indicator)
	
	stats_container.add_child(row)

func _update_equipment_preview():
	if not equipment_preview_container:
		return
	
	equipment_preview_container.visible = true
	
	# Clear existing preview items
	for child in equipment_preview_container.get_children():
		child.queue_free()
	
	# Add preview header
	var preview_header = Label.new()
	preview_header.text = "Equipment Preview"
	preview_header.modulate = header_color
	equipment_preview_container.add_child(preview_header)
	
	# Add equipment list
	if _equipment_preview.size() > 0:
		for item in _equipment_preview:
			var item_label = Label.new()
			var item_name = item.get("name", "Unknown Item")
			var stat_bonus = item.get("statBonus", {})
			var bonus_text = ""
			
			for stat in stat_bonus:
				bonus_text += " %s+%s" % [stat, stat_bonus[stat]]
			
			item_label.text = "• %s%s" % [item_name, bonus_text]
			equipment_preview_container.add_child(item_label)
	else:
		var no_items = Label.new()
		no_items.text = "No equipment changes"
		no_items.modulate = unchanged_color
		equipment_preview_container.add_child(no_items)

func _update_total_diff():
	if not total_diff_label:
		return
	
	var total_gain = 0.0
	var total_loss = 0.0
	
	for stat in _stat_comparisons:
		var data = _stat_comparisons[stat]
		if data.changed:
			if data.diff > 0:
				total_gain += data.diff
			else:
				total_loss += abs(data.diff)
	
	if total_gain > 0 or total_loss > 0:
		var gain_text = "+%.0f" % total_gain if total_gain > 0 else ""
		var loss_text = "-%.0f" % total_loss if total_loss > 0 else ""
		
		if gain_text != "" and loss_text != "":
			total_diff_label.text = "Net: %s / %s" % [gain_text, loss_text]
		elif gain_text != "":
			total_diff_label.text = "Net: %s" % gain_text
		else:
			total_diff_label.text = "Net: %s" % loss_text
		
		total_diff_label.modulate = gain_color if total_gain > total_loss else loss_color
	else:
		total_diff_label.text = "No changes"
		total_diff_label.modulate = unchanged_color

func _get_stat_display_name(stat: String) -> String:
	var display_names = {
		"hp": "HP",
		"mp": "MP",
		"initiative": "INIT",
		"attack": "Attack",
		"defense": "Defense",
		"magic_attack": "Magic Attack",
		"magic_defense": "Magic Defense",
		"speed": "Speed",
		"critical_rate": "Crit Rate",
		"critical_damage": "Crit Dmg",
		"accuracy": "Accuracy",
		"evasion": "Evasion",
		"elemental_fire": "Fire",
		"elemental_water": "Water",
		"elemental_earth": "Earth",
		"elemental_wind": "Wind",
		"elemental_light": "Light",
		"elemental_dark": "Dark"
	}
	
	return display_names.get(stat, stat.capitalize())

func _format_value(value: float) -> String:
	if value == int(value):
		return str(int(value))
	else:
		return "%.1f" % value

# === STATIC UTILITIES ===

## Create comparison panel dari stats
static func create_comparison_panel(parent: Node, base_stats: Dictionary, current_stats: Dictionary) -> StatComparison:
	var comparison = StatComparison.new()
	parent.add_child(comparison)
	comparison.set_comparison(base_stats, current_stats)
	return comparison

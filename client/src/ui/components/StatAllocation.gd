extends Control
class_name StatAllocation

## StatAllocation - UI component untuk mengalokasikan stat points
## Features: Show available points, +/- buttons, preview changes, growth curves

# === EXPORT VARIABLES ===
@export var max_allocation_per_stat: int = 10
@export var show_growth_curve: bool = true
@export var show_preview: bool = true
@export var require_confirmation: bool = true
@export var auto_preview: bool = true
@export var confirm_button_text: String = "Confirm Allocation"
@export var reset_button_text: String = "Reset"
@export var available_points_color: Color = Color(1.0, 0.9, 0.3, 1.0)  # Gold
@export var preview_color: Color = Color(0.3, 0.7, 1.0, 1.0)  # Blue
@export var gain_color: Color = Color(0.2, 0.9, 0.3, 1.0)  # Green

# === NODE REFERENCES ===
@onready var main_container: VBoxContainer = $MainContainer
@onready var points_header: HBoxContainer = $MainContainer/PointsHeader
@onready var available_points_label: Label = $MainContainer/PointsHeader/AvailablePoints
@onready var used_points_label: Label = $MainContainer/PointsHeader/UsedPoints
@onready var stats_container: VBoxContainer = $MainContainer/StatsContainer
@onready var preview_container: VBoxContainer = $MainContainer/PreviewContainer
@onready var preview_label: Label = $MainContainer/PreviewContainer/PreviewLabel
@onready var preview_stats: RichTextLabel = $MainContainer/PreviewContainer/PreviewStats
@onready var buttons_container: HBoxContainer = $MainContainer/ButtonsContainer
@onready var confirm_btn: Button = $MainContainer/ButtonsContainer/ConfirmButton
@onready var reset_btn: Button = $MainContainer/ButtonsContainer/ResetButton
@onready var growth_container: VBoxContainer = $MainContainer/GrowthContainer

# === SIGNALS ===
signal allocation_confirmed(allocations: Dictionary)
signal allocation_changed(allocations: Dictionary, preview_stats: Dictionary)
signal allocation_cancelled()

# === PRIVATE VARIABLES ===
var _available_points: int = 0
var _base_stats: Dictionary = {}
var _stat_caps: Dictionary = {}
var _growth_curves: Dictionary = {}
var _pending_allocations: Dictionary = {}  # stat_name -> points allocated
var _preview_stats: Dictionary = {}
var _is_preview_shown: bool = false
var _is_allocating: bool = false

# === ALLOCATABLE STATS ===
const ALLOCATABLE_STATS: Array = ["hp", "mp", "ap", "attack", "defense", "magic_attack", "magic_defense", "speed"]

func _ready():
	_setup_ui()
	_connect_signals()
	_reset_allocations()

func _setup_ui():
	# Setup labels
	if available_points_label:
		available_points_label.text = "Available: 0"
		available_points_label.modulate = available_points_color
	
	if used_points_label:
		used_points_label.text = "Used: 0"
	
	if preview_label:
		preview_label.text = "Preview Changes"
		preview_label.visible = false
	
	if preview_stats:
		preview_stats.visible = false
	
	# Setup buttons
	if confirm_btn:
		confirm_btn.text = confirm_button_text
		confirm_btn.disabled = true
	
	if reset_btn:
		reset_btn.text = reset_button_text
	
	# Hide growth container initially
	if growth_container:
		growth_container.visible = false

func _connect_signals():
	if confirm_btn:
		confirm_btn.pressed.connect(_on_confirm_pressed)
	
	if reset_btn:
		reset_btn.pressed.connect(_on_reset_pressed)

# === PUBLIC METHODS ===

## Initialize allocation UI
func initialize(available_points: int, base_stats: Dictionary, stat_caps: Dictionary = {}, growth_curves: Dictionary = {}):
	_available_points = available_points
	_base_stats = base_stats
	_stat_caps = stat_caps
	_growth_curves = growth_curves
	_reset_allocations()
	_update_display()
	_create_stat_rows()

## Set available points
func set_available_points(points: int):
	_available_points = points
	_update_points_display()

## Get current allocations
func get_allocations() -> Dictionary:
	return _pending_allocations.duplicate()

## Get preview stats
func get_preview_stats() -> Dictionary:
	return _preview_stats

## Check if can allocate
func can_allocate(stat_name: String, amount: int = 1) -> bool:
	var current = _pending_allocations.get(stat_name, 0)
	var total_used = _get_total_used() + amount
	
	if total_used > _available_points:
		return false
	
	if current + amount > max_allocation_per_stat:
		return false
	
	# Check stat cap
	var cap = _stat_caps.get(stat_name, 0)
	if cap > 0:
		var new_value = _base_stats.get(stat_name, 0) + _get_stat_growth(stat_name, current + amount)
		if new_value >= cap:
			return false
	
	return true

# === PRIVATE METHODS ===

func _reset_allocations():
	_pending_allocations.clear()
	_preview_stats.clear()
	
	for stat in ALLOCATABLE_STATS:
		_pending_allocations[stat] = 0
	
	_preview_stats = _base_stats.duplicate()

func _create_stat_rows():
	# Clear existing rows
	for child in stats_container.get_children():
		child.queue_free()
	
	# Create row for each allocatable stat
	for stat in ALLOCATABLE_STATS:
		_add_stat_allocation_row(stat)

func _add_stat_allocation_row(stat_name: String):
	var row = HBoxContainer.new()
	row.add_theme_constant_override("separation", 5)
	row.custom_minimum_size = Vector2(300, 40)
	
	# Stat name label
	var name_label = Label.new()
	name_label.custom_minimum_size = Vector2(100, 0)
	name_label.text = _get_stat_display_name(stat_name)
	name_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	row.add_child(name_label)
	
	# Minus button
	var minus_btn = Button.new()
	minus_btn.text = "−"
	minus_btn.custom_minimum_size = Vector2(30, 30)
	minus_btn.pressed.connect(_on_allocation_changed.bind(stat_name, -1))
	row.add_child(minus_btn)
	
	# Current allocation label
	var alloc_label = Label.new()
	alloc_label.name = "AllocLabel"
	alloc_label.custom_minimum_size = Vector2(60, 0)
	alloc_label.text = "0"
	alloc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	alloc_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	row.add_child(alloc_label)
	
	# Plus button
	var plus_btn = Button.new()
	plus_btn.text = "+"
	plus_btn.custom_minimum_size = Vector2(30, 30)
	plus_btn.pressed.connect(_on_allocation_changed.bind(stat_name, 1))
	row.add_child(plus_btn)
	
	# Preview value label
	var preview_label = Label.new()
	preview_label.name = "PreviewLabel"
	preview_label.custom_minimum_size = Vector2(80, 0)
	preview_label.text = _format_value(_base_stats.get(stat_name, 0))
	preview_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	preview_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	preview_label.modulate = preview_color
	row.add_child(preview_label)
	
	stats_container.add_child(row)

func _on_allocation_changed(stat_name: String, delta: int):
	var current = _pending_allocations.get(stat_name, 0)
	var new_alloc = current + delta
	
	# Validate
	if new_alloc < 0:
		new_alloc = 0
	
	var total_used = _get_total_used() - current + new_alloc
	if total_used > _available_points:
		return
	
	if new_alloc > max_allocation_per_stat:
		return
	
	# Check stat cap
	var cap = _stat_caps.get(stat_name, 0)
	if cap > 0:
		var new_value = _base_stats.get(stat_name, 0) + _get_stat_growth(stat_name, new_alloc)
		if new_value >= cap:
			return
	
	# Update allocation
	_pending_allocations[stat_name] = new_alloc
	
	# Update preview
	_update_preview_stats()
	
	# Update UI
	_update_stat_row(stat_name)
	_update_points_display()
	
	# Emit signal
	if show_preview:
		allocation_changed.emit(_pending_allocations.duplicate(), _preview_stats.duplicate())

func _update_stat_row(stat_name: String):
	var row_idx = ALLOCATABLE_STATS.find(stat_name)
	if row_idx == -1:
		return
	
	var row = stats_container.get_child(row_idx)
	if row and row.has_node("AllocLabel") and row.has_node("PreviewLabel"):
		var alloc_label = row.get_node("AllocLabel")
		var preview_label = row.get_node("PreviewLabel")
		
		alloc_label.text = str(_pending_allocations[stat_name])
		
		var new_value = _preview_stats.get(stat_name, _base_stats.get(stat_name, 0))
		preview_label.text = _format_value(new_value)

func _get_stat_growth(stat_name: String, points: int) -> float:
	# Check growth curve
	if _growth_curves.has(stat_name):
		var curve = _growth_curves[stat_name]
		# Simple linear growth - can be enhanced dengan actual curve data
		return points * curve.get("points_per_allocation", 10.0)
	
	# Default growth per point
	var default_growth = {
		"hp": 10.0,
		"mp": 5.0,
		"ap": 1.0,
		"attack": 2.0,
		"defense": 2.0,
		"magic_attack": 2.0,
		"magic_defense": 2.0,
		"speed": 1.0
	}
	
	return points * default_growth.get(stat_name, 5.0)

func _update_preview_stats():
	_preview_stats.clear()
	
	for stat in ALLOCATABLE_STATS:
		var base = _base_stats.get(stat, 0)
		var growth = _get_stat_growth(stat, _pending_allocations.get(stat, 0))
		_preview_stats[stat] = base + growth

func _get_total_used() -> int:
	var total = 0
	for stat in _pending_allocations:
		total += _pending_allocations[stat]
	return total

func _update_points_display():
	var used = _get_total_used()
	var remaining = _available_points - used
	
	if available_points_label:
		available_points_label.text = "Available: %d" % remaining
		available_points_label.modulate = available_points_color if remaining > 0 else Color(0.8, 0.3, 0.3, 1.0)
	
	if used_points_label:
		used_points_label.text = "Used: %d" % used
	
	# Update confirm button
	if confirm_btn:
		confirm_btn.disabled = remaining == 0 or (require_confirmation and not _is_preview_shown)

func _update_display():
	_update_points_display()
	
	# Update preview section
	if show_preview:
		_update_preview_section()

func _update_preview_section():
	if not preview_container:
		return
	
	var has_changes = _get_total_used() > 0
	
	if preview_label:
		preview_label.visible = has_changes
	
	if preview_stats:
		preview_stats.visible = has_changes
	
	if has_changes:
		_is_preview_shown = true
		
		var preview_text = "[b]After Allocation:[/b]\n"
		
		var total_gain = 0
		var changes_shown = 0
		
		for stat in ALLOCATABLE_STATS:
			var alloc = _pending_allocations.get(stat, 0)
			if alloc > 0:
				var base = _base_stats.get(stat, 0)
				var new_val = _preview_stats.get(stat, base)
				var gain = new_val - base
				
				preview_text += "• %s: %s → %s (+%s)\n" % [
					_get_stat_display_name(stat),
					_format_value(base),
					_format_value(new_val),
					_format_value(gain)
				]
				
				total_gain += gain
				changes_shown += 1
		
		if changes_shown > 0:
			preview_text += "\n[b]Total Gain:[/b] +%s" % _format_value(total_gain)
		
		preview_stats.text = preview_text
	else:
		_is_preview_shown = false

func _on_confirm_pressed():
	if _get_total_used() == 0:
		return
	
	if require_confirmation:
		# Show confirmation dialog (bisa di-enhance dengan actual dialog)
		pass
	
	allocation_confirmed.emit(_pending_allocations.duplicate())
	
	# Reset after confirm
	_reset_allocations()
	_update_display()
	_create_stat_rows()

func _on_reset_pressed():
	_reset_allocations()
	_update_display()
	_create_stat_rows()
	allocation_cancelled.emit()

func _get_stat_display_name(stat: String) -> String:
	var display_names = {
		"hp": "HP",
		"mp": "MP",
		"ap": "AP",
		"attack": "Attack",
		"defense": "Defense",
		"magic_attack": "Magic Atk",
		"magic_defense": "Magic Def",
		"speed": "Speed"
	}
	
	return display_names.get(stat, stat.capitalize())

func _format_value(value: float) -> String:
	if value == int(value):
		return str(int(value))
	else:
		return "%.1f" % value

# === GROWTH VISUALIZATION ===

func _show_growth_curve_internal(stat_name: String):
	if not show_growth_curve:
		return
	
	if not growth_container:
		return
	
	growth_container.visible = true
	
	# Clear existing
	for child in growth_container.get_children():
		child.queue_free()
	
	# Add growth info
	var curve_info = Label.new()
	curve_info.text = "Growth Curve: %s" % _get_growth_description(stat_name)
	growth_container.add_child(curve_info)

func _get_growth_description(stat_name: String) -> String:
	if _growth_curves.has(stat_name):
		var curve = _growth_curves[stat_name]
		var type = curve.get("type", "linear")
		var per_point = curve.get("points_per_allocation", 10.0)
		return "%s (+%s per point)" % [type, _format_value(per_point)]
	
	# Default
	return "Linear (+%s per point)" % _format_value(_get_stat_growth(stat_name, 1))

# === STATIC UTILITIES ===

## Create allocation panel
static func create_allocation_panel(parent: Node, available_points: int, base_stats: Dictionary) -> StatAllocation:
	var allocation = StatAllocation.new()
	parent.add_child(allocation)
	allocation.initialize(available_points, base_stats)
	return allocation

extends Control
class_name HeroProfileScreen

## HeroProfileScreen - Layar profile hero dengan integrasi sistem stat
## Features: Stat display, comparison, elemental affinities, set bonuses, allocation

# === NODE REFERENCES ===
@onready var name_label = $MarginContainer/VBoxContainer/HeroName
@onready var stats_container = $MarginContainer/VBoxContainer/StatsContainer
@onready var traits_list = $MarginContainer/VBoxContainer/TraitsList
@onready var elemental_container = $MarginContainer/VBoxContainer/ElementalContainer
@onready var set_bonuses_container = $MarginContainer/VBoxContainer/SetBonusesContainer
@onready var comparison_panel = $MarginContainer/VBoxContainer/ComparisonPanel
@onready var allocation_panel = $MarginContainer/VBoxContainer/AllocationPanel

# === PRIVATE VARIABLES ===
var _current_profile: Dictionary = {}
var _stat_comparison: StatComparison = null
var _stat_allocation: StatAllocation = null
var _stat_displays: Dictionary = {}  # stat_name -> StatDisplay

# === CONSTANTS ===
const MAIN_STATS_ORDER = ["hp", "mp", "ap", "attack", "defense", "magic_attack", "magic_defense", "speed"]
const ELEMENTAL_ORDER = ["fire", "water", "earth", "wind", "light", "dark"]
const ELEMENTAL_ICONS = {
	"fire": "🔥", "water": "💧", "earth": "🌍", "wind": "🌪️",
	"light": "☀️", "dark": "🌙"
}

func _ready():
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.stats_updated.connect(_on_stats_updated)
	ServerConnector.elemental_affinity_updated.connect(_on_elemental_updated)
	ServerConnector.set_bonus_updated.connect(_on_set_bonus_updated)
	
	if GameState.selected_hero_id != -1:
		_load_hero_data(GameState.selected_hero_id)

func _load_hero_data(hero_id: int):
	ServerConnector.fetch_hero_profile(hero_id)
	ServerConnector.fetch_unit_stats(hero_id)
	ServerConnector.fetch_elemental_affinities(hero_id)
	ServerConnector.fetch_set_bonuses(hero_id)
	ServerConnector.fetch_available_stat_points(hero_id)

func _on_request_completed(endpoint, data):
	if "hero/" in endpoint and endpoint.contains("/profile"):
		_current_profile = data
		_display_profile(data)
		_create_stat_displays(data.get("totalStats", {}))
		_create_elemental_affinities(data.get("elementalAffinities", []))
		_create_set_bonuses(data.get("setBonuses", []))
	
	elif "/stat/" in endpoint:
		_handle_stat_response(endpoint, data)

func _on_stats_updated(unit_id, stats_data):
	if unit_id == GameState.selected_hero_id:
		_update_stat_displays(stats_data)
		_create_comparison_view(stats_data)

func _on_elemental_updated(unit_id, affinities):
	if unit_id == GameState.selected_hero_id:
		_create_elemental_affinities(affinities)

func _on_set_bonus_updated(unit_id, bonuses):
	if unit_id == GameState.selected_hero_id:
		_create_set_bonuses(bonuses)

func _handle_stat_response(endpoint: String, data):
	if "/available-points" in endpoint:
		_create_allocation_panel(data)

func _display_profile(profile):
	name_label.text = profile.name
	_display_traits(profile.get("activeTraits", []))
	_create_comparison_view(profile.get("totalStats", {}))
	_create_allocation_panel(profile.get("availableStatPoints", 0))

func _display_traits(traits: Array):
	for child in traits_list.get_children():
		child.queue_free()
	
	for t in traits:
		var l = Label.new()
		l.text = "• %s" % (t.name if t is Dictionary else t)
		traits_list.add_child(l)

func _create_stat_displays(total_stats: Dictionary):
	# Clear existing displays
	for child in stats_container.get_children():
		child.queue_free()
	
	_stat_displays.clear()
	
	# Create stat display rows
	for stat_name in MAIN_STATS_ORDER:
		if total_stats.has(stat_name):
			var display = StatDisplay.new()
			display.stat_name = stat_name
			display.show_comparison = true
			display.show_tooltip = true
			display.show_capped_indicator = true
			
			stats_container.add_child(display)
			_stat_displays[stat_name] = display
			
			# Set initial value
			var base_value = total_stats.get("base" + stat_name.capitalize(), 0)
			var current_value = total_stats.get(stat_name, 0)
			display.set_comparison(current_value, base_value)

func _update_stat_displays(stats_data: Dictionary):
	for stat_name in _stat_displays:
		if stats_data.has(stat_name):
			var display = _stat_displays[stat_name]
			var base_value = stats_data.get("baseStats", {}).get(stat_name, 0)
			var current_value = stats_data.get(stat_name, 0)
			display.set_comparison(current_value, base_value)
			
			# Check for cap
			if stats_data.has("caps") and stats_data.caps.has(stat_name):
				display.set_cap(stats_data.caps[stat_name])

func _create_comparison_view(total_stats: Dictionary):
	if not comparison_panel:
		return
	
	# Clear existing
	for child in comparison_panel.get_children():
		child.queue_free()
	
	# Create comparison if we have base and current stats
	var base_stats = _current_profile.get("baseStats", {})
	if base_stats.is_empty():
		return
	
	_stat_comparison = StatComparison.new()
	_stat_comparison.show_percent_diff = true
	_stat_comparison.show_gain_loss = true
	_stat_comparison.highlight_changed = true
	
	comparison_panel.add_child(_stat_comparison)
	_stat_comparison.set_comparison(base_stats, total_stats)

func _create_elemental_affinities(affinities: Array):
	if not elemental_container:
		return
	
	# Clear existing
	for child in elemental_container.get_children():
		child.queue_free()
	
	# Add header
	var header = Label.new()
	header.text = "Elemental Affinities"
	header.add_theme_font_size_override("font_size", 14)
	header.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8, 1.0))
	elemental_container.add_child(header)
	
	# Create affinity display
	var affinities_data = affinities if affinities is Array else []
	
	for element in ELEMENTAL_ORDER:
		var value = 0
		
		# Extract value from affinities array
		if affinities_data.size() > 0:
			if affinities_data[0] is Dictionary:
				value = affinities_data[0].get(element, 0)
			else:
				var idx = ELEMENTAL_ORDER.find(element)
				if idx < affinities_data.size():
					value = affinities_data[idx]
		
		var row = HBoxContainer.new()
		
		var icon = Label.new()
		icon.text = ELEMENTAL_ICONS.get(element, "•")
		row.add_child(icon)
		
		var name = Label.new()
		name.text = element.capitalize() + ":"
		name.custom_minimum_size.x = 80
		row.add_child(name)
		
		var value_label = Label.new()
		var sign = "+" if value >= 0 else ""
		value_label.text = "%s%d%%" % [sign, value]
		value_label.modulate = Color(0.3, 0.9, 0.4, 1.0) if value >= 0 else Color(0.9, 0.3, 0.3, 1.0)
		row.add_child(value_label)
		
		elemental_container.add_child(row)

func _create_set_bonuses(bonuses: Array):
	if not set_bonuses_container:
		return
	
	# Clear existing
	for child in set_bonuses_container.get_children():
		child.queue_free()
	
	# Add header
	var header = Label.new()
	header.text = "Set Bonuses"
	header.add_theme_font_size_override("font_size", 14)
	header.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8, 1.0))
	set_bonuses_container.add_child(header)
	
	var bonuses_data = bonuses if bonuses is Array else []
	
	if bonuses_data.is_empty():
		var no_bonus = Label.new()
		no_bonus.text = "No set bonuses active"
		no_bonus.modulate = Color(0.5, 0.5, 0.5, 0.8)
		set_bonuses_container.add_child(no_bonus)
		return
	
	# Display each set bonus
	for bonus in bonuses_data:
		var set_name = bonus.get("setName", "Unknown Set") if bonus is Dictionary else "Unknown Set"
		var bonus_name = bonus.get("bonusName", "") if bonus is Dictionary else ""
		var active_pieces = bonus.get("activePieces", 0) if bonus is Dictionary else 0
		var required_pieces = bonus.get("requiredPieces", 0) if bonus is Dictionary else 0
		
		var row = VBoxContainer.new()
		
		var name_label = Label.new()
		name_label.text = "• %s (%d/%d)" % [set_name, active_pieces, required_pieces]
		name_label.modulate = Color(0.9, 0.8, 0.4, 1.0)
		row.add_child(name_label)
		
		if bonus_name != "":
			var desc_label = Label.new()
			desc_label.text = "  %s" % bonus_name
			desc_label.modulate = Color(0.7, 0.7, 0.7, 0.9)
			row.add_child(desc_label)
		
		set_bonuses_container.add_child(row)

func _create_allocation_panel(available_points_data):
	if not allocation_panel:
		return
	
	# Clear existing
	for child in allocation_panel.get_children():
		child.queue_free()
	
	var available_points = 0
	var base_stats = {}
	
	if available_points_data is Dictionary:
		available_points = available_points_data.get("available", 0)
		base_stats = available_points_data.get("baseStats", {})
	elif available_points_data is int:
		available_points = available_points_data
		if _current_profile.has("baseStats"):
			base_stats = _current_profile.baseStats
	
	if available_points <= 0:
		var no_points = Label.new()
		no_points.text = "No stat points available"
		no_points.modulate = Color(0.5, 0.5, 0.5, 0.8)
		allocation_panel.add_child(no_points)
		return
	
	# Create allocation panel
	_stat_allocation = StatAllocation.new()
	_stat_allocation.max_allocation_per_stat = 5
	_stat_allocation.show_growth_curve = true
	_stat_allocation.show_preview = true
	_stat_allocation.require_confirmation = true
	
	allocation_panel.add_child(_stat_allocation)
	
	# Connect signals
	_stat_allocation.allocation_confirmed.connect(_on_allocation_confirmed)
	_stat_allocation.allocation_changed.connect(_on_allocation_changed)
	
	# Initialize with available data
	_stat_allocation.initialize(available_points, base_stats)

func _on_allocation_confirmed(allocations: Dictionary):
	print("[HERO_PROFILE] Allocation confirmed: ", allocations)
	
	# Send to server
	if GameState.selected_hero_id != -1:
		ServerConnector.request_stat_allocation(GameState.selected_hero_id, allocations)

func _on_allocation_changed(allocations: Dictionary, preview_stats: Dictionary):
	# Preview updated - could show visual feedback
	pass

extends Control
class_name HeroProfileScreen

## RESPONSIBILITY: Main coordinator for the Hero Profile Screen
## SINGLE RESPONSIBILITY: Orchestrates layout and selection sub-modules

# === EXPORT PROPERTIES ===
@export_group("Layout", "layout_")
@export var layout_overlay_animation_duration: float = 0.3

# === NODE REFERENCES ===
@onready var margin_container = $MarginContainer
@onready var hero_grid_container = $MarginContainer/HeroGridContainer
@onready var profile_overlay = $ProfileOverlay
@onready var hero_profile_panel = $ProfileOverlay/ProfileContent/ScrollContainer/HeroProfilePanel

# === MODULES ===
var layout = HeroLayoutManager.new()
var selection = HeroSelectionManager.new()

func _ready():
	_setup_modules()
	_connect_signals()

func _setup_modules():
	add_child(layout)
	add_child(selection)
	
	# Link Layout references
	layout.margin_container = margin_container
	layout.profile_overlay = profile_overlay
	layout.top_hud = get_node_or_null("TopHUD")
	layout.side_hud = get_node_or_null("SideHUD")
	layout.task_list_hud = get_node_or_null("TaskListHUD")
	layout.animation_duration = layout_overlay_animation_duration
	
	# Link Selection references
	selection.hero_grid = hero_grid_container
	selection.profile_panel = hero_profile_panel

func _connect_signals():
	# Grid -> Selection
	if hero_grid_container and hero_grid_container.has_signal("hero_selected"):
		hero_grid_container.hero_selected.connect(_on_hero_selected_in_grid)
	
	# Overlay -> Selection/Coordinator
	if profile_overlay:
		if profile_overlay.has_signal("overlay_closed"):
			profile_overlay.overlay_closed.connect(_on_overlay_closed)
		if profile_overlay.has_signal("hero_selected"):
			profile_overlay.hero_selected.connect(_on_hero_selected_in_overlay)

## Setup as overlay logic (External API)
func setup_as_overlay(_data: Dictionary = {}):
	layout.setup_as_overlay()

# === SIGNAL ROUTING ===

func _on_hero_selected_in_grid(hero_data: Dictionary):
	selection.handle_selection(hero_data)
	layout.show_overlay()

func _on_hero_selected_in_overlay(hero_data: Dictionary):
	# Update state but don't re-trigger show animation
	GameState.selected_hero_id = hero_data.get("id", -1)

func _on_overlay_closed():
	layout.set_overlay_state(false)
	selection.clear_selection()

# === PUBLIC API (Redirection to specialized managers) ===

func refresh_heroes():
	selection.refresh_list()

func select_hero(hero_id: int):
	selection.select_hero_by_id(hero_id)

func clear_selection():
	selection.clear_selection()
	layout.hide_overlay()

func toggle_overlay():
	layout.toggle_overlay()

# Forwarding stats updates
func _on_stats_updated(unit_id, stats_data):
	selection.update_hero_stats(unit_id, stats_data)
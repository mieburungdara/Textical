extends Control
class_name HeroProfileScreen

## HeroProfileScreen - Layar profile hero dengan split panel layout
## Features: Hero grid di kiri, profile detail di kanan

# === NODE REFERENCES ===
@onready var hero_grid_container = $MarginContainer/HSplitContainer/LeftPanel/HeroGridContainer
@onready var hero_profile_panel = $MarginContainer/HSplitContainer/RightPanel/HeroProfilePanel

func _ready():
	_connect_signals()
	
	# Auto-load heroes on startup
	if hero_grid_container:
		hero_grid_container.refresh_heroes()

func _connect_signals():
	# Connect hero selection from grid to profile panel
	if hero_grid_container and hero_grid_container.has_signal("hero_selected"):
		hero_grid_container.hero_selected.connect(_on_hero_selected)

func _on_hero_selected(hero_data: Dictionary):
	# Update profile panel with selected hero
	if hero_profile_panel:
		hero_profile_panel.display_hero(hero_data)
	
	# Update GameState
	GameState.selected_hero_id = hero_data.get("id", -1)

# === PUBLIC METHODS ===

func refresh_heroes():
	# Refresh the hero grid
	if hero_grid_container:
		hero_grid_container.refresh_heroes()

func select_hero(hero_id: int):
	# Select a specific hero
	if hero_grid_container:
		hero_grid_container.select_hero(hero_id)
	
	# Load hero data
	GameState.selected_hero_id = hero_id

func clear_selection():
	# Clear current selection
	if hero_grid_container:
		hero_grid_container.clear_selection()
	
	if hero_profile_panel:
		hero_profile_panel.clear_display()
	
	GameState.selected_hero_id = -1

# === SIGNAL HANDLERS ===

func _on_stats_updated(unit_id, stats_data):
	# Forward to profile panel
	if hero_profile_panel:
		hero_profile_panel._on_stats_updated(unit_id, stats_data)

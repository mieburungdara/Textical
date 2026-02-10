class_name HeroSelectionManager
extends Node

## RESPONSIBILITY: Handles hero selection and data flow
## SINGLE RESPONSIBILITY: Logic for selecting heroes and updating GameState

signal hero_data_requested(hero_data: Dictionary)
signal selection_cleared()

# Node references
var hero_grid: Control = null
var profile_panel: Control = null

## Handle hero selection from the grid
func handle_selection(hero_data: Dictionary) -> void:
	if hero_data.is_empty():
		return
	
	# Update GameState
	var hero_id = hero_data.get("id", -1)
	GameState.selected_hero_id = hero_id
	
	# Update display
	if profile_panel and profile_panel.has_method("display_hero"):
		profile_panel.display_hero(hero_data)
	
	hero_data_requested.emit(hero_data)

## Manually select a hero by ID
func select_hero_by_id(hero_id: int) -> void:
	if hero_grid and hero_grid.has_method("select_hero"):
		hero_grid.select_hero(hero_id)
	
	GameState.selected_hero_id = hero_id

## Clear current selection
func clear_selection() -> void:
	if hero_grid and hero_grid.has_method("clear_selection"):
		hero_grid.clear_selection()
	
	if profile_panel and profile_panel.has_method("clear_display"):
		profile_panel.clear_display()
	
	GameState.selected_hero_id = -1
	selection_cleared.emit()

## Refresh the heroes list
func refresh_list() -> void:
	if hero_grid and hero_grid.has_method("refresh_heroes"):
		hero_grid.refresh_heroes()

## Forward stats updates to the profile panel
func update_hero_stats(unit_id: int, stats_data: Dictionary) -> void:
	if profile_panel and profile_panel.has_method("_on_stats_updated"):
		profile_panel._on_stats_updated(unit_id, stats_data)

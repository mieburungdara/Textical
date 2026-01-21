class_name PartyManagerUI
extends Control

## Main UI for managing party formation. All owned heroes are on the grid.

@onready var formation_grid: FormationGridComponent = $FormationGridComponent
@onready var hero_details: HeroDetailsComponent = $HeroDetailsComponent

@warning_ignore("unused_signal")
signal formation_changed 

func _ready():
	# 1. Setup Components
	for child in get_children():
		if child is BasePartyComponent:
			child.setup(self)
	
	# 2. Sync Owned Heroes to Party Positions if they aren't assigned
	_ensure_owned_heroes_are_on_grid()
	
	# 3. Setup Visual Grid
	formation_grid.setup_grid(GlobalGameManager.player_party)

func _ensure_owned_heroes_are_on_grid():
	# Get list of hero objects currently assigned to a position
	var assigned_heroes = GlobalGameManager.player_party.values()
	
	# Check each owned hero
	for hero in GlobalGameManager.owned_heroes:
		if not hero in assigned_heroes:
			# Find first available empty spot in the 5x10 grid (x: 1..5, y: 0..9)
			var found_spot = false
			for y in range(10):
				for x in range(1, 6):
					var pos = Vector2i(x, y)
					if not GlobalGameManager.player_party.has(pos):
						GlobalGameManager.player_party[pos] = hero
						found_spot = true
						break
				if found_spot: break

func show_hero_details(data: HeroData):
	hero_details.display(data)

func _on_save_pressed():
	GlobalGameManager.player_party = formation_grid.get_formation_data()
	SaveManager.save_game()
	print("Formation Saved!")

func _on_back_pressed():
	get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")
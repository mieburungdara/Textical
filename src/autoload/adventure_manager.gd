extends Node

## Singleton that manages the exploration state and resource management.

signal adventure_step(distance_left: int)
signal battle_triggered(monsters: Array[MonsterData])
signal potions_empty
signal returned_to_safe_zone(region_name: String)

# Current State
var current_region: RegionData
var current_distance: int = 0
var current_floor: int = 1
var potion_count: int = 5 # Should be moved to an InventoryManager later
var is_exploring: bool = false

# Player Party Stats (Reference from GlobalGameManager)
var party_hp_ratio: float = 1.0

func start_exploration(region: RegionData):
	current_region = region
	current_distance = region.total_distance
	is_exploring = true
	print("Starting exploration in: ", region.name)

func process_step():
	if not is_exploring: return
	if current_region.is_safe_zone: return
	
	current_distance -= 1
	adventure_step.emit(current_distance)
	
	# 1. Roll for Battle
	if randf() < current_region.battle_chance:
		_trigger_battle()
		return
		
	# 2. Check for End of Region
	if current_distance <= 0:
		_on_region_cleared()

func _trigger_battle():
	is_exploring = false
	var enemy_count = randi_range(1, 5) # Scale this with region level later
	var encounter: Array[MonsterData] = []
	for i in range(enemy_count):
		encounter.append(current_region.possible_monsters.pick_random())
	
	battle_triggered.emit(encounter)

func _on_region_cleared():
	is_exploring = false
	if current_region.is_dungeon:
		if current_floor < current_region.total_floors:
			# Next Floor logic...
			pass
	print("Region Cleared!")

## Call this after battle ends
func finish_battle(party_low_hp: bool):
	if party_low_hp:
		if potion_count > 0:
			_use_potion()
		else:
			_auto_return()
			return
			
	is_exploring = true

func _use_potion():
	potion_count -= 1
	party_hp_ratio = 1.0 # Fully heal or 50%? Let's say Full for now.
	print("Used potion. Remaining: ", potion_count)

func _auto_return():
	is_exploring = false
	# Logic to find nearest safe zone
	print("Potions empty! Returning to safe zone...")
	potions_empty.emit()
	# Transition scene back to town

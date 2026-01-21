extends Node

const SAVE_PATH = "user://textical_save.json"

func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)

func save_game():
	var region_path = "res://data/regions/StartingVillage.tres"
	if AdventureManager.current_region:
		region_path = AdventureManager.current_region.resource_path
		
	var save_data = {
		"current_region_path": region_path,
		"player_party": {},
		"owned_heroes": []
	}
	
	# Save party data (positions and resource paths)
	for pos in GlobalGameManager.player_party:
		var unit = GlobalGameManager.player_party[pos]
		if unit:
			save_data["player_party"][var_to_str(pos)] = unit.resource_path
	
	# Save owned heroes collection
	for hero in GlobalGameManager.owned_heroes:
		if hero:
			save_data["owned_heroes"].append(hero.resource_path)
		
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	file.store_string(JSON.stringify(save_data))
	print("Game Auto-Saved to: ", SAVE_PATH)

func load_game() -> bool:
	if not has_save(): return false
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	var json = JSON.parse_string(file.get_as_text())
	
	if not json: return false
	
	# 1. Restore Party
	GlobalGameManager.player_party.clear()
	for pos_str in json["player_party"]:
		var pos = str_to_var(pos_str)
		var res_path = json["player_party"][pos_str]
		var unit_data = load(res_path)
		if unit_data:
			GlobalGameManager.player_party[pos] = unit_data
	
	# 2. Restore Owned Heroes
	GlobalGameManager.owned_heroes.clear()
	if json.has("owned_heroes"):
		for res_path in json["owned_heroes"]:
			var hero_data = load(res_path)
			if hero_data:
				GlobalGameManager.owned_heroes.append(hero_data)
			
	# 3. Restore Region
	var region_path = json.get("current_region_path", "res://data/regions/StartingVillage.tres")
	var region_data = load(region_path)
	if region_data:
		AdventureManager.current_region = region_data
		
	return true
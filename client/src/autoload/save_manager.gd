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
		"gold": GlobalGameManager.gold,
		"player_party_data": [],
		"inventory_items": []
	}
	
	# 1. Save Party & Loadouts
	for pos in GlobalGameManager.player_party:
		var hero = GlobalGameManager.player_party[pos] as HeroData
		if hero:
			var hero_save = {
				"pos": var_to_str(pos),
				"res_path": hero.resource_path,
				"equipment": {}
			}
			for slot_type in hero.equipment:
				var inst = hero.equipment[slot_type] as ItemInstance
				if inst:
					hero_save["equipment"][str(slot_type)] = {
						"uid": inst.uid,
						"res_path": inst.data.resource_path
					}
			save_data["player_party_data"].append(hero_save)
	
	# 2. Save Bag Items
	for inst in InventoryManager.items:
		if inst:
			save_data["inventory_items"].append({
				"uid": inst.uid,
				"res_path": inst.data.resource_path
			})
		
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	file.store_string(JSON.stringify(save_data))
	print("Authoritative Save Success.")

func load_game() -> bool:
	if not has_save(): return false
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	var json = JSON.parse_string(file.get_as_text())
	if not json: return false
	
	GlobalGameManager.gold = json.get("gold", 500)
	
	# 1. Restore Party & Equipment Instances
	GlobalGameManager.player_party.clear()
	for h_data in json.get("player_party_data", []):
		var pos = str_to_var(h_data["pos"])
		var hero = load(h_data["res_path"]).duplicate()
		
		var equip_data = h_data.get("equipment", {})
		for slot_str in equip_data:
			var slot_int = int(slot_str)
			var item_info = equip_data[slot_str]
			var item_data = load(item_info["res_path"])
			if item_data:
				var inst = ItemInstance.new(item_data)
				inst.uid = item_info["uid"] # Restore original UID
				hero.equipment[slot_int] = inst
				
		GlobalGameManager.player_party[pos] = hero
			
	# 2. Restore Inventory Instances
	InventoryManager.items.clear()
	for item_info in json.get("inventory_items", []):
		var item_data = load(item_info["res_path"])
		if item_data:
			var inst = ItemInstance.new(item_data)
			inst.uid = item_info["uid"]
			InventoryManager.items.append(inst)
			
	InventoryManager.inventory_changed.emit()

	# 3. Restore Region
	var r_path = json.get("current_region_path", "res://data/regions/StartingVillage.tres")
	AdventureManager.current_region = load(r_path)
		
	return true

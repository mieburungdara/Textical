extends BaseNetworkHandler
class_name InventoryHandler

func fetch_inventory(user_id: int):
	_request("/user/" + str(user_id) + "/inventory", HTTPClient.METHOD_GET)

func fetch_heroes(user_id: int):
	_request("/user/" + str(user_id) + "/heroes", HTTPClient.METHOD_GET)

func fetch_recipes(user_id: int):
	_request("/user/" + str(user_id) + "/recipes", HTTPClient.METHOD_GET)

func fetch_formation(user_id: int):
	_request("/user/" + str(user_id) + "/formation", HTTPClient.METHOD_GET)

func fetch_hero_profile(hero_id: int):
	_request("/hero/" + str(hero_id) + "/profile", HTTPClient.METHOD_GET)

func _handle_success(endpoint: String, json):
	print("[InventoryHandler] _handle_success called")
	print("[InventoryHandler] endpoint:", endpoint)
	print("[InventoryHandler] json type:", typeof(json))
	
	if endpoint.contains("/inventory"):
		# Handle both direct dict and {"success": true, "data": {...}} format
		var inventory_data = json
		if json is Dictionary and json.has("data"):
			inventory_data = json.get("data")
			print("[InventoryHandler] Extracted inventory from 'data' key")
		
		if inventory_data is Dictionary and inventory_data.has("items"):
			GameState.set_inventory(inventory_data)
			print("[InventoryHandler] Inventory loaded with", inventory_data.items.size(), "items")
		else:
			print("[InventoryHandler] WARNING: Inventory data missing 'items'")
	
	elif endpoint.contains("/heroes"):
		# Handle both Array and {"success": true, "data": [...]} format
		var heroes_data = null
		if json is Array:
			heroes_data = json
			print("[InventoryHandler] Heroes is Array with", heroes_data.size(), "items")
		elif json is Dictionary:
			if json.has("data"):
				heroes_data = json.get("data")
				print("[InventoryHandler] Extracted heroes from 'data' key")
			elif json.has("heroes"):
				heroes_data = json.get("heroes")
				print("[InventoryHandler] Extracted heroes from 'heroes' key")
		
		if heroes_data is Array:
			GameState.set_heroes(heroes_data)
			GameState._on_heroes_received(endpoint, heroes_data)
		else:
			print("[InventoryHandler] ERROR: Heroes data is not Array, setting empty")
			GameState.set_heroes([])
	
	elif endpoint.contains("/formation"):
		# GameState could store active formation here if needed
		pass

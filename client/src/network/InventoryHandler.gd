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
	if endpoint.contains("/inventory") and json is Dictionary and json.has("items"):
		GameState.set_inventory(json)
	elif endpoint.contains("/heroes") and json is Array:
		GameState.set_heroes(json)
	elif endpoint.contains("/formation"):
		# GameState could store active formation here if needed
		pass

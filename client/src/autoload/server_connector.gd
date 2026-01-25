extends Node

signal login_success(user)
signal login_failed(error)
signal request_completed(endpoint, data)
signal error_occurred(message)

var base_url = "http://localhost:3000/api"
var _http_request: HTTPRequest

func _ready():
	_http_request = HTTPRequest.new()
	add_child(_http_request)
	_http_request.request_completed.connect(_on_request_completed)

# --- GENERIC REQUESTER ---
func _send_post(endpoint: String, body: Dictionary):
	var headers = ["Content-Type: application/json"]
	var json = JSON.stringify(body)
	var url = base_url + endpoint
	print("[NET] POST ", url, " Body: ", json)
	var error = _http_request.request(url, headers, HTTPClient.METHOD_POST, json)
	if error != OK:
		emit_signal("error_occurred", "Connection Error")

func _send_get(endpoint: String):
	var url = base_url + endpoint
	print("[NET] GET ", url)
	var error = _http_request.request(url)
	if error != OK:
		emit_signal("error_occurred", "Connection Error")

# --- AUTH ---
func login(username: String):
	_send_post("/auth/login", {"username": username})

# --- USER DATA ---
func fetch_profile(user_id: int):
	_send_get("/user/" + str(user_id))

func fetch_inventory(user_id: int):
	_send_get("/user/" + str(user_id) + "/inventory")

func fetch_heroes(user_id: int):
	_send_get("/user/" + str(user_id) + "/heroes")

func fetch_recipes(user_id: int):
	_send_get("/user/" + str(user_id) + "/recipes")

func fetch_hero_profile(hero_id: int):
	_send_get("/hero/" + str(hero_id) + "/profile")

func fetch_formation(user_id: int):
	_send_get("/user/" + str(user_id) + "/formation")

func update_formation(user_id: int, preset_id: int, slots: Array):
	_send_post("/action/formation/update", {
		"userId": user_id,
		"presetId": preset_id,
		"slots": slots
	})

# --- ACTIONS ---
func enter_tavern(user_id: int):
	_send_post("/tavern/enter", {"userId": user_id})

func exit_tavern(user_id: int):
	_send_post("/tavern/exit", {"userId": user_id})

func get_mercenaries(user_id: int):
	_send_get("/tavern/mercenaries?userId=" + str(user_id))

func start_battle(user_id: int, monster_id: int):
	_send_post("/battle/start", {"userId": user_id, "monsterId": monster_id})

func travel(user_id: int, target_region_id: int):
	_send_post("/action/travel", {"userId": user_id, "targetRegionId": target_region_id})

func gather(user_id: int, hero_id: int, resource_id: int):
	_send_post("/action/gather", {"userId": user_id, "heroId": hero_id, "resourceId": resource_id})

func get_region_details(region_id: int):
	_send_get("/region/" + str(region_id))

func fetch_all_regions():
	_send_get("/regions")

func fetch_quests(user_id: int):
	_send_get("/quests/" + str(user_id))

func complete_quest(user_id: int, user_quest_id: int):
	_send_post("/quests/complete", {"userId": user_id, "userQuestId": user_quest_id})

# --- MARKET ---
func fetch_market_listings(user_id: int):
	_send_get("/market/listings?userId=" + str(user_id))

func list_item(user_id: int, item_id: int, price: int):
	_send_post("/market/list", {"userId": user_id, "itemId": item_id, "price": price})

func buy_item(user_id: int, listing_id: int):
	_send_post("/market/buy", {"userId": user_id, "listingId": listing_id})

func sell_to_npc(user_id: int, item_id: int):
	_send_post("/market/sell-npc", {"userId": user_id, "itemId": item_id})

# --- RESPONSE HANDLER ---
func _on_request_completed(result, response_code, headers, body):
	if response_code == 0:
		emit_signal("error_occurred", "Server Unreachable")
		return

	var response_text = body.get_string_from_utf8()
	var json = JSON.parse_string(response_text)
	
	if response_code >= 400:
		var err_msg = "Unknown Error"
		if json and json is Dictionary:
			err_msg = json.get("error", "Unknown Error")
		print("[NET] ERROR: ", err_msg)
		emit_signal("error_occurred", err_msg)
		if "User not found" in err_msg:
			emit_signal("login_failed", err_msg)
		return

	# Success Routing
	if json is Dictionary:
		if json.has("username") and json.has("gold"):
			emit_signal("login_success", json)
		elif json.has("items") and json.has("status"):
			GameState.set_inventory(json)
		elif json.has("type") and json.has("status") and json.get("status") == "RUNNING":
			GameState.set_active_task(json)
	
	if endpoint_contains(headers, "/heroes"):
		GameState.set_heroes(json)
	
	emit_signal("request_completed", _get_last_requested_url(), json)

func endpoint_contains(headers: PackedStringArray, text: String) -> bool:
	# HTTPRequest doesn't easily expose the URL in request_completed in Godot 4.0
	# We'd usually track the last URL or use a custom node.
	# For simplicity, we'll assume the endpoint is known or matched by data structure.
	return true # Placeholder

func _get_last_requested_url() -> String:
	return "" # Placeholder
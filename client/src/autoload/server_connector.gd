extends Node

signal login_success(user)
signal login_failed(error)
signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

var base_url = "http://localhost:3000/api"

# --- CORE PARALLEL REQUESTER ---
func _request(endpoint: String, method: HTTPClient.Method, body: Dictionary = {}):
	var http = HTTPRequest.new()
	add_child(http)
	
	http.request_completed.connect(func(result, response_code, headers, response_body): 
		_on_request_completed(http, endpoint, result, response_code, headers, response_body)
	)
	
	var url = base_url + endpoint
	var headers = ["Content-Type: application/json"]
	var json_str = JSON.stringify(body) if not body.is_empty() else ""
	
	var error = http.request(url, headers, method, json_str)
	if error != OK:
		emit_signal("error_occurred", endpoint, "Initial Connection Error")
		http.queue_free()

func _send_post(endpoint: String, body: Dictionary):
	_request(endpoint, HTTPClient.METHOD_POST, body)

func _send_get(endpoint: String):
	_request(endpoint, HTTPClient.METHOD_GET)

# --- API METHODS ---
func login(username: String): _send_post("/auth/login", {"username": username})
func login_with_password(username: String, password: String): 
	_send_post("/auth/login", {"username": username, "password": password})
func fetch_profile(id: int): _send_get("/user/" + str(id))
func fetch_inventory(id: int): _send_get("/user/" + str(id) + "/inventory")
func fetch_heroes(id: int): _send_get("/user/" + str(id) + "/heroes")
func fetch_hero_profile(id: int): _send_get("/hero/" + str(id) + "/profile")
func fetch_all_regions(): _send_get("/regions")
func fetch_quests(user_id: int): _send_get("/quests/" + str(user_id))
func fetch_formation(user_id: int): _send_get("/user/" + str(user_id) + "/formation")
func enter_tavern(id: int): _send_post("/tavern/enter", {"userId": id})
func exit_tavern(id: int): _send_post("/tavern/exit", {"userId": id})
func start_battle(u_id: int, m_id: int): _send_post("/battle/start", {"userId": u_id, "monsterId": m_id})
func travel(u_id: int, r_id: int): _send_post("/action/travel", {"userId": u_id, "targetRegionId": r_id})
func gather(u_id: int, h_id: int, r_id: int): _send_post("/action/gather", {"userId": u_id, "heroId": h_id, "resourceId": r_id})
func craft(u_id: int, r_id: int): _send_post("/action/craft", {"userId": u_id, "recipeId": r_id})
func update_formation(u_id: int, p_id: int, slots: Array):
	_send_post("/action/formation/update", {"userId": u_id, "presetId": p_id, "slots": slots})

# --- RESPONSE HANDLER ---
func _on_request_completed(http_node: HTTPRequest, endpoint: String, _result, response_code, _headers, body):
	var response_text = body.get_string_from_utf8()
	var json = JSON.parse_string(response_text)
	
	if response_code >= 400:
		var msg = json.get("error", "Server Error") if json is Dictionary else "Unknown Error"
		emit_signal("error_occurred", endpoint, msg)
		if "User not found" in msg or "password" in msg:
			emit_signal("login_failed", msg)
	else:
		# Auto-Update State
		if json is Dictionary:
			if json.has("username"): 
				GameState.set_user(json)
				emit_signal("login_success", json)
			elif json.has("items"): 
				GameState.set_inventory(json)
			elif json.has("type") and json.get("status") == "RUNNING":
				GameState.set_active_task(json)
		
		if endpoint.contains("/heroes"):
			GameState.set_heroes(json)
			
		emit_signal("request_completed", endpoint, json)
	
	# Bersihkan node setelah selesai
	http_node.queue_free()
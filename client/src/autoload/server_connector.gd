extends Node

signal login_success(user)
signal login_failed(error)
signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

var base_url = "http://localhost:3000/api"
var _http_request: HTTPRequest

func _ready():
	_http_request = HTTPRequest.new()
	add_child(_http_request)
	_http_request.request_completed.connect(_on_request_completed)

func _send_post(endpoint: String, body: Dictionary):
	var headers = ["Content-Type: application/json"]
	var json = JSON.stringify(body)
	var url = base_url + endpoint
	var error = _http_request.request(url, headers, HTTPClient.METHOD_POST, json)
	if error != OK: emit_signal("error_occurred", endpoint, "Connection Error")

func _send_get(endpoint: String):
	var url = base_url + endpoint
	var error = _http_request.request(url)
	if error != OK: emit_signal("error_occurred", endpoint, "Connection Error")

# --- API METHODS ---
func login(username: String): _send_post("/auth/login", {"username": username})
func login_with_password(username: String, password: String): 
	_send_post("/auth/login", {"username": username, "password": password})
func fetch_profile(id: int): _send_get("/user/" + str(id))
func fetch_inventory(id: int): _send_get("/user/" + str(id) + "/inventory")
func fetch_heroes(id: int): _send_get("/user/" + str(id) + "/heroes")
func fetch_all_regions(): _send_get("/regions")
func enter_tavern(id: int): _send_post("/tavern/enter", {"userId": id})
func exit_tavern(id: int): _send_post("/tavern/exit", {"userId": id})
func start_battle(u_id: int, m_id: int): _send_post("/battle/start", {"userId": u_id, "monsterId": m_id})
func travel(u_id: int, r_id: int): _send_post("/action/travel", {"userId": u_id, "targetRegionId": r_id})

func _on_request_completed(_result, response_code, _headers, body):
	var response_text = body.get_string_from_utf8()
	var json = JSON.parse_string(response_text)
	
	# Extract endpoint from internal tracking (Godot 4 usually needs a custom node per request, 
	# but for this debug tool we'll rely on the data structure)
	var endpoint = "unknown"
	if json is Dictionary:
		if json.has("username"): endpoint = "/auth/login"
		elif json.has("items"): endpoint = "/inventory"
		elif json.has("battleLog"): endpoint = "/battle/start"
		elif json.has("type"): endpoint = "/action"

	if response_code >= 400:
		var msg = json.get("error", "Error") if json is Dictionary else "Server Error"
		emit_signal("error_occurred", endpoint, msg)
		return

	if endpoint == "/auth/login": emit_signal("login_success", json)
	emit_signal("request_completed", endpoint, json)

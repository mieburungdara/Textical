extends BaseNetworkHandler
class_name AuthHandler

signal login_success(user)
signal login_failed(error)

func login(username: String, password: String):
	_request("/auth/login", HTTPClient.METHOD_POST, {"username": username, "password": password})

func fetch_profile(id: int):
	_request("/user/" + str(id), HTTPClient.METHOD_GET)

func _handle_success(endpoint: String, json):
	if endpoint.contains("/auth/login") or endpoint.contains("/user/"):
		GameState.set_user(json)
		emit_signal("login_success", json)

func _handle_error(endpoint: String, message: String):
	if endpoint.contains("/auth/login"):
		emit_signal("login_failed", message)

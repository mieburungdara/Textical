extends BaseNetworkHandler
class_name AuthHandler

signal login_success(user, session)
signal login_failed(error, extra)

var device_info: String = "Unknown Device"

func _ready():
    super._ready()
    _detect_device_info()

func _detect_device_info():
    var os_name = OS.get_name()
    var model = "Desktop"
    
    # Detect device type
    if OS.has_feature("mobile"):
        model = "Mobile"
    elif OS.has_feature("web"):
        model = "Web"
    
    device_info = "%s (%s)" % [os_name, model]

func login(username: String, password: String):
    var body = {
        "username": username,
        "password": password,
        "deviceInfo": device_info
    }
    _request("/auth/login", HTTPClient.METHOD_POST, body)

func logout(all_devices: bool = false):
    if game_state and game_state.session_token.is_empty():
        return
    
    var headers = ["Content-Type: application/json", "X-Session-Token: %s" % game_state.session_token]
    var body = JSON.stringify({"all": all_devices})
    
    var http = HTTPRequest.new()
    add_child(http)
    
    var url = base_url + "/auth/logout"
    var error = http.request(url, headers, HTTPClient.METHOD_POST, body)
    if error != OK:
        http.queue_free()
        return
    
    http.request_completed.connect(func(_result, _response_code, _headers, _body):
        if game_state: game_state.clear_session()
        http.queue_free()
    )

func login_with_token():
    if not game_state or game_state.session_token.is_empty() or not game_state.current_user:
        emit_signal("login_failed", "No valid session found", {})
        return
    
    print("[AuthHandler] Attempting auto-login with token for user: ", game_state.current_user.id)
    _request("/user/" + str(game_state.current_user.id), HTTPClient.METHOD_GET)

func _handle_success(endpoint: String, json):
    if endpoint.contains("/auth/login"):
        var data_payload = json.get("data", json)
        var user_data = data_payload.get("user", {})
        var session_data = data_payload.get("session", {})
        
        var user_id = user_data.get("id")
        print("[AuthHandler] Login Success, ID: ", user_id)
        
        # Store session in game_state
        if game_state: 
            game_state.set_user(json)
            game_state.save_session_to_disk()
        
        emit_signal("login_success", user_data, session_data)
    elif endpoint.contains("/user/"):
        print("[AuthHandler] Profile fetch success (Token Login)")
        if game_state: 
            game_state.set_user(json)
            game_state.save_session_to_disk()
            
        # Extract user data from 'data' field if present (BaseController format)
        var user_data = json.get("data", json)
        if user_data is Dictionary and user_data.has("user"):
            user_data = user_data.get("user")
            
        emit_signal("login_success", user_data, {})

func _handle_error(endpoint: String, error_code: String, message: String):
    if endpoint.contains("/auth/login"):
        emit_signal("login_failed", message, {"error_code": error_code})
    elif endpoint.contains("/user/"):
        print("[AuthHandler] Profile fetch error (Token Login): ", message)
        if game_state: game_state.clear_session()
        emit_signal("login_failed", message, {"error_code": error_code})

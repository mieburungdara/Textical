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
    if GameState.session_token.is_empty():
        return
    
    var headers = ["Content-Type: application/json", "X-Session-Token: %s" % GameState.session_token]
    var body = JSON.stringify({"all": all_devices})
    
    var http = HTTPRequest.new()
    add_child(http)
    
    var url = base_url + "/auth/logout"
    var error = http.request(url, headers, HTTPClient.METHOD_POST, body)
    if error != OK:
        http.queue_free()
        return
    
    http.request_completed.connect(func(_result, _response_code, _headers, _body):
        GameState.clear_session()
        http.queue_free()
    )

func fetch_profile(id: int):
    _request("/user/" + str(id), HTTPClient.METHOD_GET)

func _handle_success(endpoint: String, json):
    if endpoint.contains("/auth/login"):
        # Server now returns { "user": {...}, "session": {...} } or { "data": {...} }
        var user_data = json.get("user")
        if user_data == null:
            user_data = json.get("data", json)
            
        var session_data = json.get("session", {})
        
        print("[AuthHandler] Extracted user_data, ID: ", user_data.get("id") if user_data else "null")
        
        # Store session in GameState
        GameState.set_user(json)
        
        emit_signal("login_success", user_data, session_data)
    elif endpoint.contains("/user/"):
        GameState.set_user(json)

func _handle_error(endpoint: String, message: String, extra: Dictionary = {}):
    if endpoint.contains("/auth/login"):
        emit_signal("login_failed", message, extra)

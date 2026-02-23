extends BaseNetworkHandler


## SocketHandler - Menghandle Item Socketing (HTTP) dan Real-time Events (Signals)

# --- SIGNALS (Real-time / WebSocket) ---
signal task_completed(data)
signal task_started(data)
signal task_failed(data)

signal stat_updated(unit_id, stats)
signal stat_changed(unit_id, stat_name, old_value, new_value)
signal stat_cap_reached(unit_id, stat_name, current_value, cap_value)
signal elemental_affinity_updated(unit_id, affinities)
signal set_bonus_updated(unit_id, bonuses)

signal badge_updated(badge_data)
signal item_socketed(equipment_id, gem_id)

# --- SIGNALS (Guild / WebSocket) ---
signal connected()
signal guild_created(data)
signal guild_left()
signal guild_disbanded()
signal guild_info_received(data)
signal guild_my_info_received(data)
signal guild_search_results(data)
signal member_kicked(data)
signal member_promoted(data)
signal member_demoted(data)
signal member_left(data)
signal treasury_updated(data)
signal facility_built(data)
signal facility_upgraded(data)
signal invite_created(data)
signal invite_accepted(data)
signal invite_cancelled(data)
signal settings_updated(data)
signal leadership_transferred(data)
signal guild_error(message)
signal authenticated()
signal auth_failed(message)
signal auth_completed(success, error_msg)

# --- WEB SOCKET ---
var socket: WebSocketPeer = WebSocketPeer.new()
var is_socket_connected: bool = false
var is_authenticated: bool = false
var sid: String = ""
var ping_interval: int = 25000
var ping_timeout: int = 5000
var last_ping_time: int = 0
var _callbacks: Dictionary = {}

# --- API METHODS (HTTP - Item Socketing) ---

func fetch_equipment_sockets():
    _request("/socket/equipment", HTTPClient.METHOD_GET)

func fetch_user_gems():
    _request("/socket/gems", HTTPClient.METHOD_GET)

func fetch_socket_info(item_instance_id: int):
    _request("/socket/" + str(item_instance_id), HTTPClient.METHOD_GET)

func insert_gem(equipment_item_id: int, gem_item_id: int):
    _request("/socket/insert", HTTPClient.METHOD_POST, {
        "equipmentItemId": equipment_item_id,
        "gemItemId": gem_item_id
    })

func insert_gem_to_item(equipment_item_id: int, gem_item_id: int):
    insert_gem(equipment_item_id, gem_item_id)

func remove_gem(equipment_item_id: int):
    _request("/socket/remove", HTTPClient.METHOD_POST, {
        "equipmentItemId": equipment_item_id
    })

func fetch_gem_bonuses(item_instance_id: int):
    _request("/socket/bonuses/" + str(item_instance_id), HTTPClient.METHOD_GET)

# --- HANDLER OVERRIDES ---

func _handle_success(endpoint: String, json):
    print("[SocketHandler] Success on: ", endpoint)
    
    if endpoint.contains("/socket/equipment"):
        var data = json.get("data", json) if json is Dictionary else json
        if data is Array:
            print("[SocketHandler] Equipment sockets loaded: ", data.size())
    
    elif endpoint.contains("/socket/gems"):
        var data = json.get("data", json) if json is Dictionary else json
        if data is Array:
            print("[SocketHandler] User gems loaded: ", data.size())
    
    elif endpoint.contains("/socket/insert"):
        var data = json.get("data", json) if json is Dictionary else json
        if data is Dictionary and data.get("success") == true:
            _notify_success(data.get("message", "Gem inserted!"))
            fetch_equipment_sockets()
            fetch_user_gems()
            item_socketed.emit(data.get("equipmentItemId"), data.get("gemItemId"))
        else:
            _notify_error(data.get("error", "Failed to insert gem"))
    
    elif endpoint.contains("/socket/remove"):
        var data = json.get("data", json) if json is Dictionary else json
        if data is Dictionary and data.get("success") == true:
            _notify_success(data.get("message", "Gem removed!"))
            fetch_equipment_sockets()
            fetch_user_gems()
        else:
            _notify_error(data.get("error", "Failed to remove gem"))

func _handle_error(endpoint: String, error_code: String, message: String):
    print("[SocketHandler] Error on %s: [%s] %s" % [endpoint, error_code, message])
    _notify_error("Socket error: " + message)

# --- REAL-TIME METHODS ---

func _process(_delta):
    if socket == null: return
    
    socket.poll()
    var state = socket.get_ready_state()
    
    if state == WebSocketPeer.STATE_OPEN or state == WebSocketPeer.STATE_CLOSED:
        # Guarantee we read all pending packets before declaring it dead
        while socket.get_available_packet_count() > 0:
            var packet = socket.get_packet().get_string_from_utf8()
            _handle_packet(packet)
            
    if state == WebSocketPeer.STATE_OPEN:
        _handle_heartbeat()
        
    elif state == WebSocketPeer.STATE_CLOSED:
        if is_socket_connected:
            var code = socket.get_close_code()
            var reason = socket.get_close_reason()
            print("[SocketHandler] WebSocket closed (Code: %d, Reason: %s)" % [code, reason])
            _handle_disconnect()
            # Optional: handle auto-reconnect here
    elif state == WebSocketPeer.STATE_CONNECTING:
        pass

func connect_to_server():
    var url = _get_socket_url()
    print("[SocketHandler] Connecting to: ", url)
    
    var err = socket.connect_to_url(url)
    if err != OK:
        print("[SocketHandler] Connection failed to initiate: ", err)
        return

func authenticate(user_id: int, token: String = ""):
    # In Socket.IO v4, we send a CONNECT packet (40) with auth data
    if socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
        print("[SocketHandler] Cannot authenticate, socket not open")
        return
        
    var final_token = token
    if final_token == "" and GameState:
        final_token = GameState.session_token
        
    var auth_data = {
        "token": final_token,
        "userId": user_id
    }
    
    var payload = "40" + JSON.stringify(auth_data)
    print("[SocketHandler] Sending SIO Connect payload: ", payload)
    var err = socket.send_text(payload)
    if err != OK:
        print("[SocketHandler] Error sending connect payload: ", err)

func send_event(event: String, data: Dictionary = {}):
    if socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
        return
    if not is_authenticated:
        print("[SocketHandler] Cannot send event '%s', not authenticated yet" % event)
        return
    
    # Socket.IO Event Packet: 42 + ["event", data]
    var payload = "42" + JSON.stringify([event, data])
    socket.send_text(payload)

# --- INTERNAL SOCKET LOGIC ---

func _get_socket_url() -> String:
    var url = base_url
    url = url.replace("http://", "ws://").replace("https://", "wss://")
    url = url.replace("/api", "") # Remove API suffix if present
    return url + "/socket.io/?EIO=4&transport=websocket"

func _handle_heartbeat():
    var now = Time.get_ticks_msec()
    if now - last_ping_time > ping_interval:
        socket.send_text("2") # Engine.IO PING
        last_ping_time = now

func _handle_packet(packet: String):
    if packet.is_empty(): return
    
    var eio_type = packet[0]
    var data = packet.substr(1)
    
    match eio_type:
        "0": # Engine.IO OPEN
            var json_parser = JSON.new()
            var parse_error = json_parser.parse(data)
            if parse_error == OK:
                var json = json_parser.get_data()
                if json:
                    sid = json.get("sid", "")
                    ping_interval = json.get("pingInterval", 25000)
                    ping_timeout = json.get("pingTimeout", 5000)
                    is_socket_connected = true
                    last_ping_time = Time.get_ticks_msec()
                    print("[SocketHandler] Engine.IO Connection Established: ", sid)
                    connected.emit()
        "1": # Engine.IO CLOSE
            is_socket_connected = false
            is_authenticated = false
        "3": # Engine.IO PONG
            # print("[SocketHandler] Pong received")
            pass
        "4": # Engine.IO MESSAGE (Socket.IO Layer)
            _handle_socket_packet(data)

func _handle_socket_packet(data: String):
    if data.is_empty(): return
    
    var sio_type = data[0]
    var payload = data.substr(1)
    
    match sio_type:
        "0": # Socket.IO CONNECT
            print("[SocketHandler] Socket.IO Session Authenticated")
            is_authenticated = true
            authenticated.emit()
            auth_completed.emit(true, "")
        "4": # Socket.IO CONNECT_ERROR
            var json_parser = JSON.new()
            var parse_error = json_parser.parse(payload)
            var error_data = null
            if parse_error == OK:
                error_data = json_parser.get_data()
            var msg = error_data.get("message", "Unknown error") if error_data is Dictionary else payload
            print("[SocketHandler] Socket.IO Auth Failed: ", msg)
            is_authenticated = false
            auth_failed.emit(msg)
            auth_completed.emit(false, msg)
        "2": # Socket.IO EVENT
            _handle_sio_event(payload)

func _handle_sio_event(payload: String):
    # Defensive: Check for empty payload
    if payload.is_empty():
        print("[SocketHandler] Empty payload received, skipping")
        return
    
    # Defensive: Pre-validate main JSON to prevent C++ error logging
    var json = null
    if _is_valid_json_string(payload):
        # Use JSON class with proper error handling
        var json_parser = JSON.new()
        var parse_error = json_parser.parse(payload)
        if parse_error == OK:
            json = json_parser.get_data()
    
    if json == null:
        print("[SocketHandler] Failed to parse JSON payload: ", payload)
        return
    
    if json is Array and json.size() >= 1:
        var event_name = json[0]
        var event_data = {}
        if json.size() > 1:
            var raw_data = json[1]
            # Ensure event_data is always a Dictionary
            if raw_data is Dictionary:
                event_data = raw_data
            elif raw_data is String:
                # Use JSON class with proper error handling to avoid C++ error logging
                var json_parser = JSON.new()
                var parse_error = json_parser.parse(raw_data)
                if parse_error == OK:
                    var parse_result = json_parser.get_data()
                    if parse_result != null:
                        if parse_result is Dictionary:
                            event_data = parse_result
                        else:
                            event_data = {"value": raw_data}
                    else:
                        event_data = {"value": raw_data}
                else:
                    # Parse failed - wrap as value instead of crashing
                    event_data = {"value": raw_data}
            elif raw_data is Array:
                event_data = {"items": raw_data}
            elif raw_data is int or raw_data is float:
                event_data = {"value": raw_data}
            elif raw_data is bool:
                event_data = {"value": raw_data}
            else:
                event_data = {}
        _route_event_signals(event_name, event_data)

## Helper to check if string starts like valid JSON (simple check without parsing)
func _is_valid_json_string(s: String) -> bool:
    if s.is_empty(): return false
    var trimmed = s.strip_edges()
    if trimmed.is_empty(): return false
    var first_char = trimmed[0]
    # Must start with valid JSON start character
    return first_char == "{" or first_char == "[" or first_char == '"' or first_char == "t" or first_char == "f" or first_char == "n" or first_char == "-" or (first_char >= "0" and first_char <= "9")

# --- EVENT SUBSCRIPTION ---

func on(event: String, callback: Callable):
    if not _callbacks.has(event):
        _callbacks[event] = []
    _callbacks[event].append(callback)

func _route_event_signals(event: String, data: Dictionary):
    # Internal mappings
    match event:
        "task_started": task_started.emit(data)
        "task_completed": task_completed.emit(data)
        "task_failed": task_failed.emit(data)
        "stat_updated": 
            if data.has("unit_id") and data.has("stats"):
                stat_updated.emit(data.unit_id, data.stats)
        "guild_update": guild_info_received.emit(data)
        "error": 
            var msg = data.get("message", "Internal server error")
            guild_error.emit(msg)
    
    # Generic callbacks for .on() pattern
    if _callbacks.has(event):
        for callback in _callbacks[event]:
            callback.call(data)

func _handle_disconnect():
    is_socket_connected = false
    is_authenticated = false
    print("[SocketHandler] Disconnected")
    auth_failed.emit("Socket disconnected")
    auth_completed.emit(false, "Socket disconnected")

# --- PRIVATE HELPERS ---

func _notify_success(msg: String):
    if has_node("/root/UIManager"):
        var ui = get_node("/root/UIManager")
        if ui.has_method("show_notification"):
            ui.show_notification(msg)

func _notify_error(msg: String):
    if has_node("/root/UIManager"):
        var ui = get_node("/root/UIManager")
        if ui.has_method("show_notification"):
            ui.show_notification(msg, 1) # 1 = Error type

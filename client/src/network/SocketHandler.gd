extends Node
class_name SocketHandler

signal task_completed(data)
signal task_started(data)
signal task_failed(data)
signal connected
signal authenticated
signal disconnected

var socket: WebSocketPeer = WebSocketPeer.new()
var is_socket_connected = false
var is_authenticated = false
var _pending_user_id = -1

func _ready():
    set_process(true)

func connect_to_server():
    var state = socket.get_ready_state()
    if state != WebSocketPeer.STATE_CLOSED: return
    
    # Construct WS URL from API URL
    var ws_url = get_parent().base_url.replace("http://", "ws://").replace("https://", "wss://").replace("/api", "")
    ws_url += "/socket.io/?EIO=4&transport=websocket"
    
    print("[SOCKET] Connecting to: ", ws_url)
    socket.connect_to_url(ws_url)

func _process(_delta):
    socket.poll()
    var state = socket.get_ready_state()
    
    if state == WebSocketPeer.STATE_OPEN:
        if !is_socket_connected:
            is_socket_connected = true
            socket.send_text("40") 
            print("[SOCKET] Pipe open. Requested Namespace (40).")
            
        while socket.get_available_packet_count() > 0:
            _on_data(socket.get_packet().get_string_from_utf8())
            
    elif state == WebSocketPeer.STATE_CLOSED:
        if is_socket_connected:
            is_socket_connected = false
            is_authenticated = false
            disconnected.emit()
            print("[SOCKET] Connection Lost.")

func _on_data(raw_data: String):
    if raw_data.begins_with("0"): 
        print("[SOCKET] Engine.io Open.")
        connected.emit()
    
    elif raw_data.begins_with("40"): 
        print("[SOCKET] Namespace Ready. Processing pending auth...")
        if _pending_user_id != -1:
            _send_auth(_pending_user_id)
        
    elif raw_data.begins_with("42"): 
        var payload = raw_data.substr(2)
        var json = JSON.parse_string(payload)
        if json is Array and json.size() >= 2:
            var event = json[0]
            var data = json[1]
            match event:
                "task_completed": task_completed.emit(data)
                "task_started": task_started.emit(data)
                "task_failed": task_failed.emit(data)
                "authenticated": 
                    is_authenticated = true
                    authenticated.emit()
                    print("[SOCKET] Auth Confirmed.")
    
    elif raw_data.begins_with("2"): # PING
        socket.send_text("3") # PONG
        print("[SOCKET] Pong sent.")

func authenticate(user_id: int):
    _pending_user_id = user_id
    if is_socket_connected:
        _send_auth(user_id)

func _send_auth(user_id: int):
    var msg = '42["authenticate", %d]' % user_id
    socket.send_text(msg)
    _pending_user_id = -1
    print("[SOCKET] Auth Request Sent for User: ", user_id)

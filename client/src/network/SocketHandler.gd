extends Node
class_name SocketHandler

signal task_completed(data)
signal task_started(data)
signal connected
signal disconnected

var socket: WebSocketPeer = WebSocketPeer.new()
var is_connected = false
var is_authenticated = false
var base_url = "ws://localhost:3000/socket.io/?EIO=4&transport=websocket"

func _ready():
	set_process(true)

func connect_to_server():
	var state = socket.get_ready_state()
	if state != WebSocketPeer.STATE_CLOSED:
		print("[SOCKET] Already connected or connecting. State: ", state)
		if state == WebSocketPeer.STATE_OPEN:
			connected.emit() # Signal readiness if already open
		return
		
	print("[SOCKET] Connecting to: ", base_url)
	socket.connect_to_url(base_url)

func _process(_delta):
	socket.poll()
	var state = socket.get_ready_state()
	
	if state == WebSocketPeer.STATE_OPEN:
		if !is_connected:
			is_connected = true
			print("[SOCKET] Connected to pipe. Awaiting protocol handshake...")
			
		while socket.get_available_packet_count() > 0:
			_on_data(socket.get_packet().get_string_from_utf8())
			
	elif state == WebSocketPeer.STATE_CLOSED:
		if is_connected:
			is_connected = false
			is_authenticated = false
			disconnected.emit()
			print("[SOCKET] Disconnected.")

func _on_data(raw_data: String):
	# Socket.io Protocol Handlers
	if raw_data.begins_with("0"): # 0 = OPEN packet
		print("[SOCKET] Handshake Complete (0).")
		connected.emit()
	
	elif raw_data.begins_with("40"): # 40 = CONNECTED to namespace
		print("[SOCKET] Namespace Connected (40).")
		
	elif raw_data.begins_with("42"): # 42 = MESSAGE event
		var payload = raw_data.substr(2)
		var json = JSON.parse_string(payload)
		if json is Array and json.size() >= 2:
			var event = json[0]
			var data = json[1]
			match event:
				"task_completed": task_completed.emit(data)
				"task_started": task_started.emit(data)

func authenticate(user_id: int):
	if !is_connected: return
	# Socket.io Format: 42["event", data]
	var msg = '42["authenticate", %d]' % user_id
	socket.send_text(msg)
	is_authenticated = true
	print("[SOCKET] Sent Auth for User: ", user_id)
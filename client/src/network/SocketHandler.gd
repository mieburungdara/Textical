extends Node
class_name SocketHandler

signal task_completed(data)
signal task_started(data)
signal connected
signal disconnected

var socket: WebSocketPeer = WebSocketPeer.new()
var is_connected = false
var base_url = "ws://localhost:3000/socket.io/?EIO=4&transport=websocket"

func _ready():
	set_process(true)

func connect_to_server():
	print("[SOCKET] Connecting to real-time engine...")
	socket.connect_to_url(base_url)

func _process(_delta):
	socket.poll()
	var state = socket.get_ready_state()
	
	if state == WebSocketPeer.STATE_OPEN:
		if !is_connected:
			is_connected = true
			connected.emit()
			# Simple Socket.io handshake (Handled by protocol but just for logging)
			print("[SOCKET] Connected.")
			
		while socket.get_available_packet_count() > 0:
			_on_data(socket.get_packet().get_string_from_utf8())
			
	elif state == WebSocketPeer.STATE_CLOSED:
		if is_connected:
			is_connected = false
			disconnected.emit()
			print("[SOCKET] Disconnected.")

func _on_data(raw_data: String):
	# Note: Socket.io uses a specific string format (e.g. 42["event", data])
	# This is a simplified parser for demonstration
	if raw_data.begins_with("42"):
		var payload = raw_data.substr(2)
		var json = JSON.parse_string(payload)
		if json is Array and json.size() >= 2:
			var event = json[0]
			var data = json[1]
			
			match event:
				"task_completed":
					task_completed.emit(data)
				"task_started":
					task_started.emit(data)

func authenticate(user_id: int):
	# Socket.io format: 42["event", payload]
	var msg = '42["authenticate", %d]' % user_id
	socket.send_text(msg)

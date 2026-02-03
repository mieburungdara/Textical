extends Node
class_name SocketHandler

signal task_completed(data)
signal task_started(data)
signal task_failed(data)
signal connected
signal authenticated
signal disconnected
signal chat_message(data)
signal chat_typing(data)
signal chat_error(data)

# === STAT SIGNALS ===
signal stat_updated(unit_id, stats_data)
signal stat_changed(unit_id, stat_name, old_value, new_value)
signal stat_cap_reached(unit_id, stat_name, current_value, cap_value)
signal elemental_affinity_updated(unit_id, affinities)
signal set_bonus_updated(unit_id, bonuses)

var socket: WebSocketPeer = WebSocketPeer.new()
var is_socket_connected = false
var is_authenticated = false
var _pending_user_id = -1

# Reference to StatHandler for routing events
var _stat_handler = null

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
				"chat:message": chat_message.emit(data)
				"chat:typing": chat_typing.emit(data)
				"chat:error": chat_error.emit(data)
				"authenticated": 
					is_authenticated = true
					authenticated.emit()
					print("[SOCKET] Auth Confirmed.")
				# === STAT EVENTS ===
				"stat:updated": _on_stat_updated(data)
				"stat:changed": _on_stat_changed(data)
				"stat:cap_reached": _on_stat_cap_reached(data)
				"stat:elemental_update": _on_elemental_update(data)
				"stat:set_bonus_update": _on_set_bonus_update(data)
	
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

func chat_send(data: Dictionary):
	var msg = '42["chat:send", %s]' % JSON.stringify(data)
	socket.send_text(msg)

func chat_join_guild(guild_id: int):
	var msg = '42["chat:join_guild", %d]' % guild_id
	socket.send_text(msg)

# === STAT EVENT HANDLERS ===

func _on_stat_updated(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var stats = data.get("stats", {})
	if unit_id != -1:
		stat_updated.emit(unit_id, stats)
	print("[SOCKET] Stat updated for unit %d" % unit_id)

func _on_stat_changed(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var stat_name = data.get("statName", "")
	var old_value = data.get("oldValue", 0)
	var new_value = data.get("newValue", 0)
	if unit_id != -1 and stat_name != "":
		stat_changed.emit(unit_id, stat_name, old_value, new_value)
	print("[SOCKET] Stat changed: %s: %s → %s" % [stat_name, str(old_value), str(new_value)])

func _on_stat_cap_reached(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var stat_name = data.get("statName", "")
	var current_value = data.get("currentValue", 0)
	var cap_value = data.get("capValue", 0)
	if unit_id != -1 and stat_name != "":
		stat_cap_reached.emit(unit_id, stat_name, current_value, cap_value)
	print("[SOCKET] Stat cap reached: %s = %s/%s" % [stat_name, str(current_value), str(cap_value)])

func _on_elemental_update(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var affinities = data.get("affinities", [])
	if unit_id != -1:
		elemental_affinity_updated.emit(unit_id, affinities)
	print("[SOCKET] Elemental affinities updated for unit %d" % unit_id)

func _on_set_bonus_update(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var bonuses = data.get("bonuses", [])
	if unit_id != -1:
		set_bonus_updated.emit(unit_id, bonuses)
	print("[SOCKET] Set bonuses updated for unit %d" % unit_id)

# === STAT SOCKET METHODS ===

func send_stat_change_request(unit_id: int, stat_name: String, change_amount: float):
	var msg = '42["stat:change_request", %s]' % JSON.stringify({
		"unitId": unit_id,
		"statName": stat_name,
		"changeAmount": change_amount
	})
	socket.send_text(msg)

func send_stat_allocation_request(unit_id: int, allocations: Dictionary):
	var msg = '42["stat:allocation_request", %s]' % JSON.stringify({
		"unitId": unit_id,
		"allocations": allocations
	})
	socket.send_text(msg)

func subscribe_to_unit_stats(unit_id: int):
	var msg = '42["stat:subscribe", %d]' % unit_id
	socket.send_text(msg)

func unsubscribe_from_unit_stats(unit_id: int):
	var msg = '42["stat:unsubscribe", %d]' % unit_id
	socket.send_text(msg)

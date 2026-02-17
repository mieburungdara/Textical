extends Node

signal task_completed(data)
signal task_started(data)
signal task_failed(data)
signal connected
signal authenticated
signal disconnected
signal chat_message(data)
signal chat_typing(data)
signal chat_error(data)

# === SESSION SIGNALS ===
signal session_disconnecting(reason: String, message: String)
signal force_logout(reason: String)
signal session_expired(reason: String)

# === GUILD SIGNALS ===
signal guild_created(guild_data)
signal guild_left()
signal guild_disbanded()
signal guild_info_received(guild_data)
signal guild_my_info_received(guild_data)
signal guild_search_results(guilds)
signal guild_updated(guild_data)

signal member_kicked(user_id)
signal member_promoted(user_id, new_role)
signal member_demoted(user_id, new_role)
signal member_left(user_id)

signal treasury_updated(gold, silver)
signal facility_built(facility_data)
signal facility_upgraded(facility_id, new_level)

signal invite_created(invite_code, expires_at)
signal invite_accepted(guild_data)
signal invite_cancelled(invite_id)

signal settings_updated(settings)
signal leadership_transferred(new_master_id)
signal guild_error(message)

# === BADGE SIGNALS
signal badge_updated(badge_name, count)

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
var _heartbeat_timer: Timer = null
var _disconnect_countdown_timer: Timer = null
var _disconnect_countdown_label: Label = null

func _ready():
    set_process(true)
    _setup_heartbeat_timer()

func _setup_heartbeat_timer():
    _heartbeat_timer = Timer.new()
    _heartbeat_timer.name = "HeartbeatTimer"
    _heartbeat_timer.wait_time = 25.0  # Send heartbeat every 25 seconds
    _heartbeat_timer.timeout.connect(_send_heartbeat)
    add_child(_heartbeat_timer)

func connect_to_server():
    var state = socket.get_ready_state()
    if state != WebSocketPeer.STATE_CLOSED: return
    
    # Construct WS URL from API URL
    var ws_url = ServerConnector.base_url.replace("http://", "ws://").replace("https://", "wss://").replace("/api", "")
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
            _cleanup_connection()

func _cleanup_connection():
    is_socket_connected = false
    is_authenticated = false
    
    # Stop heartbeat
    if _heartbeat_timer and is_instance_valid(_heartbeat_timer): 
        _heartbeat_timer.stop()
    
    # Stop countdown if running
    _stop_disconnect_countdown()
    
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
                    # Start heartbeat after successful auth
                    if _heartbeat_timer and is_instance_valid(_heartbeat_timer):
                        _heartbeat_timer.start()
                    authenticated.emit()
                    print("[SOCKET] Auth Confirmed.")
                # === SESSION EVENTS ===
                "session_disconnecting": _on_session_disconnecting(data)
                "force_logout": _on_force_logout(data)
                "session_expired": _on_session_expired(data)
                # === GUILD EVENTS ===
                "guild:created": guild_created.emit(data)
                "guild:joined": guild_created.emit(data)
                "guild:left": guild_left.emit()
                "guild:disbanded": guild_disbanded.emit()
                "guild:info": guild_info_received.emit(data)
                "guild:my_info": guild_my_info_received.emit(data)
                "guild:search_results": guild_search_results.emit(data)
                "guild:updated": guild_updated.emit(data)
                "guild:member_kicked": member_kicked.emit(data)
                "guild:member_promoted": member_promoted.emit(data)
                "guild:member_demoted": member_demoted.emit(data)
                "guild:member_left": member_left.emit(data)
                "guild:treasury_updated": treasury_updated.emit(data.get("gold", 0), data.get("silver", 0))
                "guild:facility_built": facility_built.emit(data)
                "guild:facility_upgraded": facility_upgraded.emit(data)
                "guild:invite_created": invite_created.emit(data)
                "guild:invite_accepted": invite_accepted.emit(data)
                "guild:invite_cancelled": invite_cancelled.emit(data)
                "guild:settings_updated": settings_updated.emit(data)
                "guild:leadership_transferred": leadership_transferred.emit(data.get("newMasterId", -1))
                "guild:error": guild_error.emit(data.get("message", "Unknown error"))
                # === STAT EVENTS ===
                "stat:updated": _on_stat_updated(data)
                "stat:changed": _on_stat_changed(data)
                "stat:cap_reached": _on_stat_cap_reached(data)
                "stat:elemental_update": _on_elemental_update(data)
                "stat:set_bonus_update": _on_set_bonus_update(data)
                # === BADGE EVENTS ===
                "badge:update": _on_badge_update(data)
    
    elif raw_data.begins_with("2"): # PING
        socket.send_text("3") # PONG
        print("[SOCKET] Pong sent.")

# === SESSION EVENT HANDLERS ===

func _on_session_disconnecting(data: Dictionary):
    var reason = data.get("reason", "unknown")
    var message = data.get("message", "New login detected on another device")
    
    print("[SOCKET] Session disconnecting: ", reason)
    session_disconnecting.emit(reason, message)
    
    # Start countdown display
    _start_disconnect_countdown(5)

func _on_force_logout(data: Dictionary):
    var reason = data.get("reason", "unknown")
    
    print("[SOCKET] Force logout: ", reason)
    
    # Stop heartbeat
    if _heartbeat_timer and is_instance_valid(_heartbeat_timer):
        _heartbeat_timer.stop()
    
    # Stop countdown if running
    _stop_disconnect_countdown()
    
    # Emit to GameState
    GameState.emit_force_logout(reason)
    
    # Emit signal
    force_logout.emit(reason)
    
    # Disconnect socket
    socket.close()

func _on_session_expired(data: Dictionary):
    var reason = data.get("reason", "timeout")
    
    print("[SOCKET] Session expired: ", reason)
    
    # Stop heartbeat
    if _heartbeat_timer and is_instance_valid(_heartbeat_timer):
        _heartbeat_timer.stop()
    
    # Emit to GameState
    GameState.emit_session_expired(reason)
    
    # Emit signal
    session_expired.emit(reason)

func _start_disconnect_countdown(seconds: int):
    _stop_disconnect_countdown()
    
    # Create countdown label
    _disconnect_countdown_label = Label.new()
    _disconnect_countdown_label.text = str(seconds)
    _disconnect_countdown_label.set_anchors_preset(Control.PRESET_CENTER)
    
    # Style the label
    var font = _disconnect_countdown_label.get_theme_default_font()
    if font:
        _disconnect_countdown_label.add_theme_font_size_override("font_size", 48)
    _disconnect_countdown_label.add_theme_color_override("font_color", Color.RED)
    
    # Add to root to ensure visibility
    var root = get_tree().root
    if root:
        root.add_child(_disconnect_countdown_label)
    else:
        add_child(_disconnect_countdown_label)
    
    # Create countdown timer
    _disconnect_countdown_timer = Timer.new()
    _disconnect_countdown_timer.wait_time = 1.0
    _disconnect_countdown_timer.timeout.connect(func():
        seconds -= 1
        if seconds > 0:
            if _disconnect_countdown_label and is_instance_valid(_disconnect_countdown_label):
                _disconnect_countdown_label.text = str(seconds)
        else:
            _stop_disconnect_countdown()
    )
    add_child(_disconnect_countdown_timer)
    _disconnect_countdown_timer.start()

func _stop_disconnect_countdown():
    if _disconnect_countdown_timer:
        _disconnect_countdown_timer.stop()
        _disconnect_countdown_timer.queue_free()
        _disconnect_countdown_timer = null
    
    if _disconnect_countdown_label:
        _disconnect_countdown_label.queue_free()
        _disconnect_countdown_label = null

func _send_heartbeat():
    if GameState.session_token and is_socket_connected:
        var msg = '42["heartbeat", {"token": "%s"}]' % GameState.session_token
        socket.send_text(msg)
        print("[SOCKET] Heartbeat sent")

# === AUTHENTICATION ===

func authenticate(user_id: int):
    _pending_user_id = user_id
    if is_socket_connected:
        _send_auth(user_id)

func _send_auth(user_id: int):
    var token = GameState.session_token if GameState else ""
    
    var msg
    if token and not token.is_empty():
        # New format with session token
        var auth_data = {
            "userId": user_id,
            "sessionToken": token
        }
        msg = '42["authenticate", %s]' % JSON.stringify(auth_data)
    else:
        # Legacy format without token
        msg = '42["authenticate", %d]' % user_id
    
    socket.send_text(msg)
    _pending_user_id = -1
    print("[SOCKET] Auth Request Sent for User: ", user_id)

func chat_send(data: Dictionary):
    var msg = '42["chat:send", %s]' % JSON.stringify(data)
    socket.send_text(msg)

func chat_join_guild(guild_id: int):
    var msg = '42["chat:join_guild", %d]' % guild_id
    socket.send_text(msg)

# === GUILD SOCKET METHODS ===

func guild_create(template_id: int, guild_name: String, description: String):
    var msg = '42["guild:create", %s]' % JSON.stringify({
        "templateId": template_id,
        "name": guild_name,
        "description": description
    })
    socket.send_text(msg)

func guild_join(guild_id: int):
    var msg = '42["guild:join", %s]' % JSON.stringify({
        "guildId": guild_id
    })
    socket.send_text(msg)

func guild_leave():
    var msg = '42["guild:leave", {}]'
    socket.send_text(msg)

func guild_kick(target_user_id: int):
    var msg = '42["guild:kick", %s]' % JSON.stringify({
        "targetUserId": target_user_id
    })
    socket.send_text(msg)

func guild_promote(target_user_id: int, new_role: String):
    var msg = '42["guild:promote", %s]' % JSON.stringify({
        "targetUserId": target_user_id,
        "newRole": new_role
    })
    socket.send_text(msg)

func guild_demote(target_user_id: int):
    var msg = '42["guild:demote", %s]' % JSON.stringify({
        "targetUserId": target_user_id
    })
    socket.send_text(msg)

func guild_transfer_leadership(target_user_id: int):
    var msg = '42["guild:transfer_leadership", %s]' % JSON.stringify({
        "targetUserId": target_user_id
    })
    socket.send_text(msg)

func guild_update_settings(settings: Dictionary):
    var msg = '42["guild:update_settings", %s]' % JSON.stringify({
        "settings": settings
    })
    socket.send_text(msg)

func guild_deposit_treasury(amount: int):
    var msg = '42["guild:deposit_treasury", %s]' % JSON.stringify({
        "amount": amount
    })
    socket.send_text(msg)

func guild_withdraw_treasury(amount: int):
    var msg = '42["guild:withdraw_treasury", %s]' % JSON.stringify({
        "amount": amount
    })
    socket.send_text(msg)

func guild_build_facility(template_id: int):
    var msg = '42["guild:build_facility", %s]' % JSON.stringify({
        "templateId": template_id
    })
    socket.send_text(msg)

func guild_upgrade_facility(facility_id: int):
    var msg = '42["guild:upgrade_facility", %s]' % JSON.stringify({
        "facilityId": facility_id
    })
    socket.send_text(msg)

func guild_create_invite():
    var msg = '42["guild:create_invite", {}]'
    socket.send_text(msg)

func guild_accept_invite(invite_code: String):
    var msg = '42["guild:accept_invite", %s]' % JSON.stringify({
        "inviteCode": invite_code
    })
    socket.send_text(msg)

func guild_cancel_invite(invite_id: int):
    var msg = '42["guild:cancel_invite", %s]' % JSON.stringify({
        "inviteId": invite_id
    })
    socket.send_text(msg)

func guild_get_info(guild_id: int):
    var msg = '42["guild:get_info", %s]' % JSON.stringify({
        "guildId": guild_id
    })
    socket.send_text(msg)

func guild_get_my_info():
    var msg = '42["guild:get_my_info", {}]'
    socket.send_text(msg)

func guild_search(query: String, page: int = 1, limit: int = 10):
    var msg = '42["guild:search", %s]' % JSON.stringify({
        "query": query,
        "page": page,
        "limit": limit
    })
    socket.send_text(msg)

func guild_disband():
    var msg = '42["guild:disband", {}]'
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

# === BADGE EVENT HANDLERS ===

func _on_badge_update(data: Dictionary):
    var badge_name = data.get("badge", "")
    var count = data.get("count", 0)
    print("[SOCKET] Badge update: %s = %d" % [badge_name, count])
    badge_updated.emit(badge_name, count)

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

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
signal member_joined(user_data)
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
                # === GUILD EVENTS ===
                "guild:created": guild_created.emit(data)
                "guild:joined": guild_created.emit(data)  # Reuse created signal for join
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

# === GUILD SOCKET METHODS ===

func guild_create(template_id: int, name: String, description: String):
    var msg = '42["guild:create", %s]' % JSON.stringify({
        "templateId": template_id,
        "name": name,
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

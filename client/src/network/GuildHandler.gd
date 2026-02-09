extends Node

# === GUILD SIGNALS ===
signal guild_created(guild_data)
signal guild_left()
signal guild_disbanded()
signal guild_info_received(guild_data)
signal guild_my_info_received(guild_data)
signal guild_search_results(guilds)

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

var _socket_handler = null
var _is_connected = false

func _ready():
    # Get reference to SocketHandler
    _socket_handler = get_node_or_null("/root/SocketHandler")
    if _socket_handler:
        _connect_to_socket()

func _connect_to_socket():
    if _socket_handler and not _is_connected:
        _is_connected = true
        
        # Connect to socket handler signals
        _socket_handler.connected.connect(_on_connected)
        
        # Connect to guild-specific signals from SocketHandler
        _socket_handler.guild_created.connect(_on_guild_created_data)
        _socket_handler.guild_left.connect(_on_guild_left_data)
        _socket_handler.guild_disbanded.connect(_on_guild_disbanded_data)
        _socket_handler.guild_info_received.connect(_on_guild_info_received_data)
        _socket_handler.guild_my_info_received.connect(_on_guild_my_info_received_data)
        _socket_handler.guild_search_results.connect(_on_guild_search_results_data)
        _socket_handler.member_kicked.connect(_on_member_kicked_data)
        _socket_handler.member_promoted.connect(_on_member_promoted_data)
        _socket_handler.member_demoted.connect(_on_member_demoted_data)
        _socket_handler.member_left.connect(_on_member_left_data)
        _socket_handler.treasury_updated.connect(_on_treasury_updated_data)
        _socket_handler.facility_built.connect(_on_facility_built_data)
        _socket_handler.facility_upgraded.connect(_on_facility_upgraded_data)
        _socket_handler.invite_created.connect(_on_invite_created_data)
        _socket_handler.invite_accepted.connect(_on_invite_accepted_data)
        _socket_handler.invite_cancelled.connect(_on_invite_cancelled_data)
        _socket_handler.settings_updated.connect(_on_settings_updated_data)
        _socket_handler.leadership_transferred.connect(_on_leadership_transferred_data)
        _socket_handler.guild_error.connect(_on_guild_error_data)

func _on_connected():
    # Request guild info when connected
    request_my_guild()

# === DATA HANDLERS (called from SocketHandler signals) ===

func _on_guild_created_data(data: Dictionary):
    guild_created.emit(data)
    print("[GUILD] Created: ", data.get("name", ""))

func _on_guild_left_data():
    guild_left.emit()
    print("[GUILD] Left guild")

func _on_guild_disbanded_data():
    guild_disbanded.emit()
    print("[GUILD] Guild disbanded")

func _on_guild_info_received_data(data: Dictionary):
    guild_info_received.emit(data)
    print("[GUILD] Info received for: ", data.get("name", ""))

func _on_guild_my_info_received_data(data: Dictionary):
    guild_my_info_received.emit(data)
    print("[GUILD] My info received")

func _on_guild_search_results_data(data: Dictionary):
    guild_search_results.emit(data)
    var guilds = data.get("guilds", [])
    print("[GUILD] Search results: ", guilds.size(), " guilds found")

func _on_member_kicked_data(data: Dictionary):
    var user_id = data.get("targetUserId", -1)
    member_kicked.emit(user_id)
    print("[GUILD] Member kicked: ", user_id)

func _on_member_promoted_data(data: Dictionary):
    var user_id = data.get("userId", -1)
    var new_role = data.get("newRole", "")
    member_promoted.emit(user_id, new_role)
    print("[GUILD] Member promoted: ", user_id, " to ", new_role)

func _on_member_demoted_data(data: Dictionary):
    var user_id = data.get("userId", -1)
    var new_role = data.get("newRole", "")
    member_demoted.emit(user_id, new_role)
    print("[GUILD] Member demoted: ", user_id, " to ", new_role)

func _on_member_left_data(data: Dictionary):
    var user_id = data.get("userId", -1)
    member_left.emit(user_id)
    print("[GUILD] Member left: ", user_id)

func _on_treasury_updated_data(data: Dictionary):
    var gold = data.get("gold", 0)
    var silver = data.get("silver", 0)
    treasury_updated.emit(gold, silver)
    print("[GUILD] Treasury updated: ", gold, " gold, ", silver, " silver")

func _on_facility_built_data(data: Dictionary):
    facility_built.emit(data)
    print("[GUILD] Facility built: ", data.get("name", ""))

func _on_facility_upgraded_data(data: Dictionary):
    var facility_id = data.get("facilityId", -1)
    var new_level = data.get("newLevel", 1)
    facility_upgraded.emit(facility_id, new_level)
    print("[GUILD] Facility upgraded to level ", new_level)

func _on_invite_created_data(data: Dictionary):
    var invite_code = data.get("inviteCode", "")
    var expires_at = data.get("expiresAt", "")
    invite_created.emit(invite_code, expires_at)
    print("[GUILD] Invite created: ", invite_code)

func _on_invite_accepted_data(data: Dictionary):
    invite_accepted.emit(data)
    print("[GUILD] Invite accepted, joined guild")

func _on_invite_cancelled_data(data: Dictionary):
    var invite_id = data.get("inviteId", -1)
    invite_cancelled.emit(invite_id)
    print("[GUILD] Invite cancelled: ", invite_id)

func _on_settings_updated_data(data: Dictionary):
    settings_updated.emit(data)
    print("[GUILD] Settings updated")

func _on_leadership_transferred_data(data: Dictionary):
    var new_master_id = data.get("newMasterId", -1)
    leadership_transferred.emit(new_master_id)
    print("[GUILD] Leadership transferred to: ", new_master_id)

func _on_guild_error_data(message: String):
    guild_error.emit(message)
    print("[GUILD] Error: ", message)

# === GUILD SOCKET METHODS ===

func create_guild(template_id: int, guild_name: String, description: String):
    if _socket_handler:
        var msg = '42["guild:create", %s]' % JSON.stringify({
            "templateId": template_id,
            "name": guild_name,
            "description": description
        })
        _socket_handler.socket.send_text(msg)

func join_guild(guild_id: int):
    if _socket_handler:
        var msg = '42["guild:join", %s]' % JSON.stringify({
            "guildId": guild_id
        })
        _socket_handler.socket.send_text(msg)

func leave_guild():
    if _socket_handler:
        var msg = '42["guild:leave", {}]'
        _socket_handler.socket.send_text(msg)

func kick_member(target_user_id: int):
    if _socket_handler:
        var msg = '42["guild:kick", %s]' % JSON.stringify({
            "targetUserId": target_user_id
        })
        _socket_handler.socket.send_text(msg)

func promote_member(target_user_id: int, new_role: String):
    if _socket_handler:
        var msg = '42["guild:promote", %s]' % JSON.stringify({
            "targetUserId": target_user_id,
            "newRole": new_role
        })
        _socket_handler.socket.send_text(msg)

func demote_member(target_user_id: int):
    if _socket_handler:
        var msg = '42["guild:demote", %s]' % JSON.stringify({
            "targetUserId": target_user_id
        })
        _socket_handler.socket.send_text(msg)

func transfer_leadership(target_user_id: int):
    if _socket_handler:
        var msg = '42["guild:transfer_leadership", %s]' % JSON.stringify({
            "targetUserId": target_user_id
        })
        _socket_handler.socket.send_text(msg)

func update_guild_settings(settings: Dictionary):
    if _socket_handler:
        var msg = '42["guild:update_settings", %s]' % JSON.stringify({
            "settings": settings
        })
        _socket_handler.socket.send_text(msg)

func deposit_treasury(amount: int):
    if _socket_handler:
        var msg = '42["guild:deposit_treasury", %s]' % JSON.stringify({
            "amount": amount
        })
        _socket_handler.socket.send_text(msg)

func withdraw_treasury(amount: int):
    if _socket_handler:
        var msg = '42["guild:withdraw_treasury", %s]' % JSON.stringify({
            "amount": amount
        })
        _socket_handler.socket.send_text(msg)

func build_facility(template_id: int):
    if _socket_handler:
        var msg = '42["guild:build_facility", %s]' % JSON.stringify({
            "templateId": template_id
        })
        _socket_handler.socket.send_text(msg)

func upgrade_facility(facility_id: int):
    if _socket_handler:
        var msg = '42["guild:upgrade_facility", %s]' % JSON.stringify({
            "facilityId": facility_id
        })
        _socket_handler.socket.send_text(msg)

func create_invite():
    if _socket_handler:
        var msg = '42["guild:create_invite", {}]'
        _socket_handler.socket.send_text(msg)

func accept_invite(invite_code: String):
    if _socket_handler:
        var msg = '42["guild:accept_invite", %s]' % JSON.stringify({
            "inviteCode": invite_code
        })
        _socket_handler.socket.send_text(msg)

func cancel_invite(invite_id: int):
    if _socket_handler:
        var msg = '42["guild:cancel_invite", %s]' % JSON.stringify({
            "inviteId": invite_id
        })
        _socket_handler.socket.send_text(msg)

func request_guild_info(guild_id: int):
    if _socket_handler:
        var msg = '42["guild:get_info", %s]' % JSON.stringify({
            "guildId": guild_id
        })
        _socket_handler.socket.send_text(msg)

func request_my_guild():
    if _socket_handler:
        var msg = '42["guild:get_my_info", {}]'
        _socket_handler.socket.send_text(msg)

func search_guilds(query: String, page: int = 1, limit: int = 10):
    if _socket_handler:
        var msg = '42["guild:search", %s]' % JSON.stringify({
            "query": query,
            "page": page,
            "limit": limit
        })
        _socket_handler.socket.send_text(msg)

func disband_guild():
    if _socket_handler:
        var msg = '42["guild:disband", {}]'
        _socket_handler.socket.send_text(msg)

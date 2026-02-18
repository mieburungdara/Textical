extends BaseNetworkHandler
# class_name SocketHandler

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

# --- WEB SOCKET ---
var socket: WebSocketPeer = null
var is_socket_connected: bool = false

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

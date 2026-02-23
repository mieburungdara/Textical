extends BaseNetworkHandler
class_name TreasureMapHandler

## Treasure Map Handler
## Handles all treasure map related socket events and operations

signal maps_updated(maps)
signal map_used(map_data)
signal dig_started(finishes_at)
signal treasure_claimed(loot, rewards)

# Socket reference
var _socket: Node = null

# Current state
var unused_maps: Array = []
var active_maps: Array = []
var is_digging: bool = false
var dig_finishes_at: int = 0

func _ready():
    # Get socket reference from GameState or ServerConnector
    _socket = get_socket()
    if _socket:
        _connect_signals()

func get_socket() -> Node:
    # Try to get socket from various sources
    if has_node("/root/SocketIOClient"):
        return get_node("/root/SocketIOClient")
    if has_node("/root/ServerConnector"):
        var connector = get_node("/root/ServerConnector")
        if connector.has_method("get_socket"):
            return connector.get_socket()
    return null

func _connect_signals():
    if not _socket:
        return
    
    # Connect to socket events
    _socket.on("treasure:map_updated", _on_map_updated)
    _socket.on("treasure:dig_started", _on_dig_started)
    _socket.on("treasure:claimed", _on_treasure_claimed)

# ====================
# API Methods
# ====================

## Get all treasure maps for current user
func get_maps():
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:get_maps", {})

## Get unused treasure maps (for inventory display)
func get_unused_maps():
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:get_unused_maps", {})

## Get active (used but not claimed) treasure maps
func get_active_maps():
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:get_active_maps", {})

## Use a treasure map to reveal location
func use_map(map_id: int):
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:use_map", {"mapId": map_id})

## Check if player can dig at current location
func check_dig(map_id: int):
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:check_dig", {"mapId": map_id})

## Start digging for treasure
func start_dig(map_id: int):
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    if is_digging:
        error_occurred.emit("Already digging!")
        return
    
    _socket.send_event("treasure:start_dig", {"mapId": map_id})

## Complete digging and claim treasure
func complete_dig(map_id: int, task_id: int):
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:complete_dig", {"mapId": map_id, "taskId": task_id})

## Debug: Create a treasure map (for testing)
func debug_create_map(rarity: String):
    if not _socket:
        error_occurred.emit("Not connected to server")
        return
    
    _socket.send_event("treasure:debug_create", {"rarity": rarity})

# ====================
# Response Handlers
# ====================

func _on_get_maps_response(data):
    print("[TreasureMapHandler] get_maps response: ", data)
    if data.has("success") and data.success:
        maps_updated.emit(data.get("data", []))

func _on_get_unused_maps_response(data):
    print("[TreasureMapHandler] get_unused_maps response: ", data)
    if data.has("success") and data.success:
        unused_maps = data.get("data", [])
        maps_updated.emit(unused_maps)
    else:
        error_occurred.emit(data.get("error", "Failed to get maps"))

func _on_get_active_maps_response(data):
    print("[TreasureMapHandler] get_active_maps response: ", data)
    if data.has("success") and data.success:
        active_maps = data.get("data", [])
        maps_updated.emit(active_maps)
    else:
        error_occurred.emit(data.get("error", "Failed to get active maps"))

func _on_use_map_response(data):
    print("[TreasureMapHandler] use_map response: ", data)
    if data.has("success") and data.success:
        map_used.emit(data.get("data", {}))
        # Refresh active maps
        get_active_maps()
    else:
        error_occurred.emit(data.get("error", "Failed to use map"))

func _on_check_dig_response(data):
    print("[TreasureMapHandler] check_dig response: ", data)
    if data.has("success") and data.success:
        var result = data.get("data", {})
        if result.has("eligible") and result.eligible:
            # Player can dig - show dig button
            pass
        else:
            error_occurred.emit(result.get("reason", "Cannot dig here"))

func _on_start_dig_response(data):
    print("[TreasureMapHandler] start_dig response: ", data)
    if data.has("success") and data.success:
        var result = data.get("data", {})
        is_digging = true
        dig_finishes_at = result.get("finishesAt", 0)
        dig_started.emit(dig_finishes_at)
    else:
        error_occurred.emit(data.get("error", "Failed to start digging"))

func _on_complete_dig_response(data):
    print("[TreasureMapHandler] complete_dig response: ", data)
    is_digging = false
    dig_finishes_at = 0
    
    if data.has("success") and data.success:
        var result = data.get("data", {})
        var loot = result.get("loot", {})
        var rewards = result.get("rewards", {})
        treasure_claimed.emit(loot, rewards)
        # Refresh maps
        get_unused_maps()
        get_active_maps()
    else:
        error_occurred.emit(data.get("error", "Failed to claim treasure"))

func _on_debug_create_response(data):
    print("[TreasureMapHandler] debug_create response: ", data)
    if data.has("success") and data.success:
        get_unused_maps()
    else:
        error_occurred.emit(data.get("error", "Failed to create map"))

# ====================
# Socket Event Handlers
# ====================

func _on_map_updated(map_data):
    print("[TreasureMapHandler] Map updated: ", map_data)
    map_used.emit(map_data)

func _on_dig_started(data):
    print("[TreasureMapHandler] Dig started: ", data)
    is_digging = true
    dig_finishes_at = data.get("finishesAt", 0)
    dig_started.emit(dig_finishes_at)

func _on_treasure_claimed(data):
    print("[TreasureMapHandler] Treasure claimed: ", data)
    is_digging = false
    dig_finishes_at = 0
    var loot = data.get("loot", {})
    var rewards = data.get("rewards", {})
    treasure_claimed.emit(loot, rewards)

# ====================
# Helper Methods
# ====================

## Check if there's an active dig in progress
func has_active_dig() -> bool:
    return is_digging

## Get remaining dig time in seconds
func get_dig_remaining_time() -> int:
    if not is_digging:
        return 0
    var now = Time.get_unix_time_from_system()
    return max(0, dig_finishes_at / 1000.0 - now)

## Get rarity color for UI
static func get_rarity_color(rarity: String) -> Color:
    match rarity:
        "COMMON":
            return Color(0.7, 0.7, 0.7) # Gray
        "UNCOMMON":
            return Color(0.2, 0.8, 0.2) # Green
        "RARE":
            return Color(0.2, 0.5, 0.9) # Blue
        "LEGENDARY":
            return Color(1.0, 0.6, 0.0) # Gold
        _:
            return Color.WHITE

## Get rarity display name
static func get_rarity_display_name(rarity: String) -> String:
    match rarity:
        "COMMON":
            return "Common"
        "UNCOMMON":
            return "Uncommon"
        "RARE":
            return "Rare"
        "LEGENDARY":
            return "Legendary"
        _:
            return rarity

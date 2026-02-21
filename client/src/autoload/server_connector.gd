extends Node

# Preload handler classes
const AuthHandlerClass = preload("res://src/network/AuthHandler.gd")
const WorldHandlerClass = preload("res://src/network/WorldHandler.gd")
const TavernHandlerClass = preload("res://src/network/TavernHandler.gd")
const MarketHandlerClass = preload("res://src/network/MarketHandler.gd")
const QuestHandlerClass = preload("res://src/network/QuestHandler.gd")
const InventoryHandlerClass = preload("res://src/network/InventoryHandler.gd")
const BattleHandlerClass = preload("res://src/network/BattleHandler.gd")
const StatHandlerClass = preload("res://src/network/StatHandler.gd")
const AssetHandlerClass = preload("res://src/network/AssetHandler.gd")
const PrivateIslandHandlerClass = preload("res://src/network/PrivateIslandHandler.gd")
const AchievementHandlerClass = preload("res://src/network/AchievementHandler.gd")

signal login_success(user)
signal login_failed(error)
signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

# REAL-TIME SIGNALS
signal task_completed(data)
signal task_started(data)
signal task_failed(data)

# === STAT SIGNALS ===
signal stats_updated(unit_id, stats_data)
signal stat_changed(unit_id, stat_name, old_value, new_value)
signal stat_cap_reached(unit_id, stat_name, current_value, cap_value)
signal elemental_affinity_updated(unit_id, affinities)
signal set_bonus_updated(unit_id, bonuses)

var base_url = "http://127.0.0.1:5000/api"
var _is_server_reachable: bool = false
var _connection_tested: bool = false

var auth
var world
var tavern
var market
var quest
var inventory
var battle
var stat
var asset
var socket
var island
var achievement

func _ready():
    auth = AuthHandlerClass.new()
    world = WorldHandlerClass.new()
    tavern = TavernHandlerClass.new()
    market = MarketHandlerClass.new()
    quest = QuestHandlerClass.new()
    inventory = InventoryHandlerClass.new()
    battle = BattleHandlerClass.new()
    stat = StatHandlerClass.new()
    asset = AssetHandlerClass.new()
    island = PrivateIslandHandlerClass.new()
    achievement = AchievementHandlerClass.new()
    # SocketHandler is autoload, use it directly
    socket = SocketHandler
    
    var handlers = [auth, world, tavern, market, quest, inventory, battle, stat, asset, island, achievement]
    for h in handlers:
        add_child(h)
        if h.has_signal("request_completed"): h.request_completed.connect(_on_handler_request_completed)
        if h.has_signal("error_occurred"): 
            h.error_occurred.connect(func(endpoint, error_code, message): 
                print("[ServerConnector] Error from handler: ", endpoint, " | ", error_code, ": ", message)
                emit_signal("error_occurred", endpoint, message)
            )

    
    # Stat Handler Signal Routing
    stat.stats_updated.connect(func(u, s): stats_updated.emit(u, s))
    stat.stat_changed.connect(func(u, n, o, v): stat_changed.emit(u, n, o, v))
    if stat.has_signal("stat_comparison_received"):
        stat.stat_comparison_received.connect(func(_u, d): emit_signal("request_completed", "/stats/compare", d))
    stat.stat_cap_reached.connect(func(u, n, c, cap): stat_cap_reached.emit(u, n, c, cap))
    stat.elemental_affinity_updated.connect(func(u, a): elemental_affinity_updated.emit(u, a))
    stat.set_bonus_updated.connect(func(u, b): set_bonus_updated.emit(u, b))
    
    # Socket Routing
    socket.task_completed.connect(func(d): task_completed.emit(d))
    socket.task_started.connect(func(d): task_started.emit(d))
    socket.task_failed.connect(func(d): task_failed.emit(d))
    
    # Socket Stat Routing
    socket.stat_updated.connect(func(u, s): stats_updated.emit(u, s))
    socket.stat_changed.connect(func(u, n, o, v): stat_changed.emit(u, n, o, v))
    socket.stat_cap_reached.connect(func(u, n, c, cap): stat_cap_reached.emit(u, n, c, cap))
    socket.elemental_affinity_updated.connect(func(u, a): elemental_affinity_updated.emit(u, a))
    socket.set_bonus_updated.connect(func(u, b): set_bonus_updated.emit(u, b))
    
    # Socket Badge Routing
    socket.badge_updated.connect(_on_badge_updated)
    
    auth.login_success.connect(_on_login_success)
    auth.login_failed.connect(func(message, extra): 
        print("[ServerConnector] Login failed: ", message, " Extra: ", extra)
        emit_signal("login_failed", message)
    )


func _on_handler_request_completed(endpoint: String, data):
    emit_signal("request_completed", endpoint, data)

func _on_login_success(user, _session):
    print("[CONNECTOR] Login success received. User object type: ", typeof(user))
    
    # Extract actual user data - AuthHandler already extracts 'user' or 'data'
    var user_data = user
    if user_data.has("user"):
        user_data = user_data.get("user")
    elif user_data.has("data"):
        user_data = user_data.get("data")
    
    # Get user ID from nested data (defensive check for different possible keys)
    var user_id = user_data.get("id")
    if user_id == null: user_id = user_data.get("_id")
    if user_id == null: user_id = user_data.get("userId")
    if user_id == null: user_id = user_data.get("uid")
    
    print("[CONNECTOR] Resolved user_id: ", user_id)
    
    # 1. Start Connection
    socket.connect_to_server()
    
    # 2. Wait for the 'connected' signal from SocketHandler if not already open
    if !socket.is_socket_connected:
        await socket.connected
    
    # 3. Authenticate only if not already authenticated for this session
    if !socket.is_authenticated and user_id:
        socket.authenticate(int(user_id))
        await socket.authenticated # Wait for confirmation
    
    # 4. Now allow the UI to transition
    emit_signal("login_success", user)

# --- FACADE METHODS ---
func login_with_password(u, p): auth.login(u, p)
func fetch_profile(id): auth.fetch_profile(id)
func fetch_inventory(id): inventory.fetch_inventory(id)
func fetch_heroes(id): inventory.fetch_heroes(id)
func fetch_recipes(id): inventory.fetch_recipes(id)
func fetch_formation(id): inventory.fetch_formation(id)
func fetch_hero_profile(id): inventory.fetch_hero_profile(id)
func fetch_friends(id): world.fetch_friends(id)
func fetch_achievements(id): world.fetch_achievements(id)
func fetch_world_state(): world.fetch_world_state()
func fetch_templates(category): asset.fetch_templates(category)
func update_settings(u, s): world.update_settings(u, s)
func discard_item(u, i, q): inventory.discard_item(u, i, q)
func use_item(u, i, h = 0): inventory.use_item(u, i, h)
func equip_item(u, h, i, s): inventory.equip_item(u, h, i, s)
func unequip_item(u, h, s): inventory.unequip_item(u, h, s)
func fetch_all_regions(): world.fetch_all_regions()
func get_region_details(id): world.get_region_details(id)
func travel(u, r): world.travel(u, r)
func gather(u, h, r): world.gather(u, h, r)
func craft(u, r): world.craft(u, r)
func update_formation(u, p, s): world.update_formation(u, p, s)
func move_unit_position(u, p, h, x, y): world.move_unit_position(u, p, h, x, y)
func swap_units_position(u, p, ha, hb): world.swap_units_position(u, p, ha, hb)
func start_battle(u, m): battle.start_battle(u, m)
func enter_tavern(id): tavern.enter(id)
func exit_tavern(id): tavern.exit(id)
func get_mercenaries(id): tavern.get_mercenaries(id)
func recruit(u, m): tavern.recruit(u, m)
func fetch_market_listings(id): market.fetch_listings(id)
func list_item(u, i, p): market.list_item(u, i, p)
func buy_item(u, l): market.buy_item(u, l)
func sell_to_npc(u, i): market.sell_to_npc(u, i)
# --- QUESTS (QUEST HANDLER) ---
func fetch_quests(id): quest.fetch_quests(id)
func complete_quest(u, q): quest.complete_quest(u, q)

# --- STAT (STAT HANDLER) ---
func fetch_unit_stats(unit_id: int): stat.fetch_unit_stats(unit_id)
func fetch_stat(unit_id: int, stat_name: String): stat.fetch_stat(unit_id, stat_name)
func request_stat_comparison(unit_id: int, equipment_preview: Array = []): stat.request_stat_comparison(unit_id, equipment_preview)
func fetch_elemental_affinities(unit_id: int): stat.fetch_elemental_affinities(unit_id)
func fetch_set_bonuses(unit_id: int): stat.fetch_set_bonuses(unit_id)
func fetch_stat_caps(unit_id: int): stat.fetch_stat_caps(unit_id)
func fetch_growth_curve(unit_id: int, stat_name: String): stat.fetch_growth_curve(unit_id, stat_name)
func fetch_available_stat_points(unit_id: int): stat.fetch_available_stat_points(unit_id)
func get_cached_stats(unit_id: int) -> Dictionary: return stat.get_cached_stats(unit_id)
func subscribe_to_stat_updates(unit_id: int): stat.subscribe_to_stat_updates(unit_id)
func unsubscribe_from_stat_updates(unit_id: int): stat.unsubscribe_from_stat_updates(unit_id)
func start_stat_sync(): stat.start_stat_sync()
func stop_stat_sync(): stat.stop_stat_sync()

# --- SOCKET STAT METHODS ---
func socket_send_stat_change(unit_id: int, stat_name: String, change_amount: float):
    socket.send_stat_change_request(unit_id, stat_name, change_amount)

func socket_subscribe_unit_stats(unit_id: int):
    socket.subscribe_to_unit_stats(unit_id)

func socket_unsubscribe_unit_stats(unit_id: int):
    socket.unsubscribe_from_unit_stats(unit_id)

# --- BADGE METHODS ---
func _on_badge_updated(badge_name: String, count: int):
    # Route to SideHUD if available
    var side_hud = get_tree().get_first_node_in_group("SideHUD")
    if side_hud and side_hud.has_method("update_badge_count"):
        side_hud.update_badge_count(badge_name, count)
    else:
        # Try to find SideHUD by path
        var hud_node = get_node_or_null("/root/SideHUD")
        if hud_node and hud_node.has_method("update_badge_count"):
            hud_node.update_badge_count(badge_name, count)
    print("[CONNECTOR] Badge updated: %s = %d" % [badge_name, count])

# --- UTILITY (For Sync System) ---
func _send_get(path): world._request(path, HTTPClient.METHOD_GET)

func _send_get_raw(path) -> Dictionary:
    return await world._request_async(path, HTTPClient.METHOD_GET)

func is_socket_connected() -> bool:
    return socket.is_socket_connected if socket else false

func get_last_ping() -> int:
    # Mock ping calculation or return from socket if available
    return randi_range(30, 60) if is_socket_connected() else 0

## Test server connectivity with timeout
func test_connection(timeout_sec: float = 10.0) -> bool:
    print("[ServerConnector] Testing connection to: " + base_url)
    
    var http = HTTPRequest.new()
    add_child(http)
    
    var test_url = base_url.replace("/api", "") + "/health"
    print("[ServerConnector] Health check URL: " + test_url)
    
    # Connect signal using a callable for better safety
    var status = {
        "finished": false,
        "result": -1,
        "code": -1
    }
    
    var on_completed = func(res, code, _headers, _body):
        status.result = res
        status.code = code
        status.finished = true
        print("[ServerConnector] request_completed signal fired! Result=%d, Code=%d" % [res, code])
    
    http.request_completed.connect(on_completed)
    
    print("[ServerConnector] Starting HTTP request...")
    var err = http.request(test_url)
    if (err != OK):
        print("[ServerConnector] Failed to start request: " + str(err))
        http.queue_free()
        _is_server_reachable = false
        return false
    
    # Wait for either completion or timeout
    var start_time = Time.get_ticks_msec()
    var success = false
    
    # Manual wait loop with safety break
    while not status.finished:
        if (Time.get_ticks_msec() - start_time) > (timeout_sec * 1000):
            print("[ServerConnector] Connection test TIMED OUT after " + str(timeout_sec) + "s")
            break
        
        # Yield to engine
        await get_tree().process_frame
        
        # Extra safety: check if HTTPRequest is still in tree
        if not is_instance_valid(http):
            print("[ServerConnector] HTTPRequest became invalid during wait")
            break
    
    if status.finished:
        success = (status.result == OK and status.code == 200)
        print("[ServerConnector] Response received: Result=%d (OK=0), HTTP=%d" % [status.result, status.code])
    else:
        print("[ServerConnector] Connection timed out or was interrupted. Waited %d ms" % (Time.get_ticks_msec() - start_time))
    
    print("[ServerConnector] Final connection result: " + ("SUCCESS" if success else "FAILED"))
    
    # Cleanup
    if is_instance_valid(http):
        http.queue_free()
        
    _is_server_reachable = success
    _connection_tested = true
    return success

## Check if server is reachable (must call test_connection first)
func is_server_reachable() -> bool:
    return _is_server_reachable

# --- PRIVATE ISLAND ---
func get_private_island(user_id: int): island.get_island(user_id)
func get_private_island_status(user_id: int): island.get_island_status(user_id)
func unlock_private_island(user_id: int): island.unlock_island(user_id)
func plant_seed(user_id: int, plot_index: int, seed_template_id: int): island.plant_seed(user_id, plot_index, seed_template_id)
func harvest_crop(user_id: int, plot_index: int): island.harvest_crop(user_id, plot_index)
func add_to_storage(user_id: int, item_template_id: int, quantity: int): island.add_to_storage(user_id, item_template_id, quantity)
func remove_from_storage(user_id: int, slot_index: int, quantity: int): island.remove_from_storage(user_id, slot_index, quantity)
func upgrade_island_plots(user_id: int): island.upgrade_plots(user_id)
func upgrade_island_storage(user_id: int): island.upgrade_storage(user_id)
func get_crop_templates(): island.get_crop_templates()

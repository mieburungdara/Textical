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

var base_url = "http://localhost:3000/api"

var auth
var world
var tavern
var market
var quest
var inventory
var battle
var stat
var socket

func _ready():
    auth = AuthHandlerClass.new()
    world = WorldHandlerClass.new()
    tavern = TavernHandlerClass.new()
    market = MarketHandlerClass.new()
    quest = QuestHandlerClass.new()
    inventory = InventoryHandlerClass.new()
    battle = BattleHandlerClass.new()
    stat = StatHandlerClass.new()
    # SocketHandler is autoload, use it directly
    socket = SocketHandler
    
    var handlers = [auth, world, tavern, market, quest, inventory, battle, stat]
    for h in handlers:
        add_child(h)
        if h.has_signal("request_completed"): h.request_completed.connect(_on_handler_request_completed)
        if h.has_signal("error_occurred"): h.error_occurred.connect(func(e, m): emit_signal("error_occurred", e, m))
    
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
    
    auth.login_success.connect(_on_login_success)
    auth.login_failed.connect(func(e): emit_signal("login_failed", e))

func _on_handler_request_completed(endpoint: String, data):
    emit_signal("request_completed", endpoint, data)

func _on_login_success(user):
    # Extract actual user data from nested "data" key
    var user_data = user.get("data", user)
    
    # Get user ID from nested data (defensive check for different possible keys)
    var user_id = user_data.get("id")
    if user_id == null: user_id = user_data.get("_id")
    if user_id == null: user_id = user_data.get("userId")
    if user_id == null: user_id = user_data.get("uid")
    
    print("[CONNECTOR] user_id from nested data: ", user_id)
    
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
func request_stat_allocation(unit_id: int, stat_points: Dictionary): stat.request_stat_allocation(unit_id, stat_points)
func preview_stat_allocation(unit_id: int, stat_points: Dictionary): stat.preview_stat_allocation(unit_id, stat_points)
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

func socket_send_stat_allocation(unit_id: int, allocations: Dictionary):
    socket.send_stat_allocation_request(unit_id, allocations)

func socket_subscribe_unit_stats(unit_id: int):
    socket.subscribe_to_unit_stats(unit_id)

func socket_unsubscribe_unit_stats(unit_id: int):
    socket.unsubscribe_from_unit_stats(unit_id)

# --- UTILITY (For Sync System) ---
func _send_get(path): world._request(path, HTTPClient.METHOD_GET)

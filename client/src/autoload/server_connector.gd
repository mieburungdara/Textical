extends Node

signal login_success(user)
signal login_failed(error)
signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

# REAL-TIME SIGNALS
signal task_completed(data)
signal task_started(data)
signal task_failed(data)

var base_url = "http://localhost:3000/api"

var auth: AuthHandler
var world: WorldHandler
var tavern: TavernHandler
var market: MarketHandler
var quest: QuestHandler
var inventory: InventoryHandler
var battle: BattleHandler
var socket: SocketHandler

func _ready():
    auth = AuthHandler.new()
    world = WorldHandler.new()
    tavern = TavernHandler.new()
    market = MarketHandler.new()
    quest = QuestHandler.new()
    inventory = InventoryHandler.new()
    battle = BattleHandler.new()
    socket = SocketHandler.new()
    
    var handlers = [auth, world, tavern, market, quest, inventory, battle, socket]
    for h in handlers:
        add_child(h)
        if h.has_signal("request_completed"): h.request_completed.connect(_on_handler_request_completed)
        if h.has_signal("error_occurred"): h.error_occurred.connect(func(e, m): emit_signal("error_occurred", e, m))
    
    # Socket Routing
    socket.task_completed.connect(func(d): task_completed.emit(d))
    socket.task_started.connect(func(d): task_started.emit(d))
    socket.task_failed.connect(func(d): task_failed.emit(d))
    
    auth.login_success.connect(_on_login_success)
    auth.login_failed.connect(func(e): emit_signal("login_failed", e))

func _on_handler_request_completed(endpoint: String, data):
    emit_signal("request_completed", endpoint, data)

func _on_login_success(user):
    # 1. Start Connection
    socket.connect_to_server()
    
    # 2. Wait for the 'connected' signal from SocketHandler if not already open
    if socket.socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
        await socket.connected
    
    # 3. Authenticate only if not already authenticated for this session
    if !socket.is_authenticated:
        socket.authenticate(user.id)
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

# --- UTILITY (For Sync System) ---
func _send_get(path): world._request(path, HTTPClient.METHOD_GET)

extends Node

# Signal Forwarding (Keeps UI compatibility)
signal login_success(user)
signal login_failed(error)
signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

var auth: AuthHandler
var world: WorldHandler
var tavern: TavernHandler
var market: MarketHandler
var quest: QuestHandler
var inventory: InventoryHandler
var battle: BattleHandler

func _ready():
    # Instantiate Components
    auth = AuthHandler.new()
    world = WorldHandler.new()
    tavern = TavernHandler.new()
    market = MarketHandler.new()
    quest = QuestHandler.new()
    inventory = InventoryHandler.new()
    battle = BattleHandler.new()
    
    var handlers = [auth, world, tavern, market, quest, inventory, battle]
    for h in handlers:
        add_child(h)
        h.request_completed.connect(func(e, d): emit_signal("request_completed", e, d))
        h.error_occurred.connect(func(e, m): emit_signal("error_occurred", e, m))
    
    # Specialized Signal Connections
    auth.login_success.connect(func(u): emit_signal("login_success", u))
    auth.login_failed.connect(func(e): emit_signal("login_failed", e))

# --- AUTH & USER ---
func login_with_password(u, p): auth.login(u, p)
func fetch_profile(id): auth.fetch_profile(id)

# --- COLLECTION (INVENTORY HANDLER) ---
func fetch_inventory(id): inventory.fetch_inventory(id)
func fetch_heroes(id): inventory.fetch_heroes(id)
func fetch_recipes(id): inventory.fetch_recipes(id)
func fetch_formation(id): inventory.fetch_formation(id)
func fetch_hero_profile(id): inventory.fetch_hero_profile(id)

# --- WORLD & ACTIONS (WORLD HANDLER) ---
func fetch_all_regions(): world.fetch_all_regions()
func get_region_details(id): world.get_region_details(id)
func travel(u, r): world.travel(u, r)
func gather(u, h, r): world.gather(u, h, r)
func craft(u, r): world.craft(u, r)
func update_formation(u, p, s): world.update_formation(u, p, s)

# --- BATTLE (BATTLE HANDLER) ---
func start_battle(u, m): battle.start_battle(u, m)

# --- TAVERN (TAVERN HANDLER) ---
func enter_tavern(id): tavern.enter(id)
func exit_tavern(id): tavern.exit(id)
func get_mercenaries(id): tavern.get_mercenaries(id)
func recruit(u, m): tavern.recruit(u, m)

# --- MARKET (MARKET HANDLER) ---
func fetch_market_listings(id): market.fetch_listings(id)
func list_item(u, i, p): market.list_item(u, i, p)
func buy_item(u, l): market.buy_item(u, l)
func sell_to_npc(u, i): market.sell_to_npc(u, i)

# --- QUESTS (QUEST HANDLER) ---
func fetch_quests(id): quest.fetch_quests(id)
func complete_quest(u, q): quest.complete_quest(u, q)

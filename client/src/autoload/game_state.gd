extends Node

signal task_updated(task)
signal region_changed(new_data)
signal quest_updated()
signal mail_received()
signal achievement_unlocked(achievement)
signal friends_updated(friends)
signal world_state_updated(state)

signal heroes_loaded(count: int)
signal heroes_loading_failed(error: String)

signal session_expired(reason: String)
signal force_logout(reason: String)

var current_user = null
var session_token: String = ""
var session_expires_at: int = 0
var current_heroes = []
var _heroes_loading = false
var _heroes_loaded_from_server = false
var inventory = []
var inventory_status = {"used": 0, "max": 20}
var inventory_is_dirty = true
var active_task = null
var current_region_type = "TOWN" 
var current_region_data = null:
    set(val):
        print("[STATE] Region Data Setting: ", "null" if not val else val.get("name", "Unknown"))
        current_region_data = val
        region_changed.emit(val)

# SYNCED DATA
var online_friends = []
var game_achievements = []
var world_state = {"currentHour": 12, "weatherType": "CLEAR"}
var user_settings = {}

# PERSISTENCE
var selected_hero_id: int = -1
var last_selected_item_id: int = -1
var target_monster_id: int = -1
var last_visited_hub: String = "res://src/ui/TownScreen.tscn"

# GEOGRAPHIC ATLAS (5000x5000 World Grid)
const REGION_POSITIONS = {
    1: Vector2(2500, 2500), # Oakhaven Hub (CENTER)
    2: Vector2(1200, 1800), # Iron Mine (West)
    3: Vector2(800, 800),   # Crystal Depths (North West)
    4: Vector2(3800, 1800), # Elm Forest (East)
    5: Vector2(4200, 800)   # Forbidden Grove (North East)
}

const FLAVOR_LANDMARKS = [
    {"name": "Lake of Whispers", "pos": Vector2(2500, 1500)},
    {"name": "The Shattered Peaks", "pos": Vector2(500, 500)},
    {"name": "Ancient Sentinel Pillar", "pos": Vector2(4500, 4500)},
    {"name": "Siren's Whisp Falls", "pos": Vector2(1500, 1000)},
    {"name": "The Weeping Sands", "pos": Vector2(3500, 3500)},
    {"name": "Dead Man's Pass", "pos": Vector2(2500, 3200)},
    {"name": "Sun-King Observatory", "pos": Vector2(1000, 4000)}
]

func _ready():
    if ServerConnector:
        if ServerConnector.has_signal("task_completed"):
            ServerConnector.task_completed.connect(_on_global_task_completed)
        ServerConnector.request_completed.connect(_on_request_completed)
    
    _setup_time_timer()
    print("[STATE] GameState ready.")

func _setup_time_timer():
    var timer = Timer.new()
    timer.name = "TimeTickTimer"
    timer.wait_time = 60.0 # Sync with server every minute
    timer.timeout.connect(func(): if current_user: ServerConnector.fetch_world_state())
    add_child(timer)
    timer.start()

func _on_request_completed(endpoint: String, response):
    var data = response.get("data", response) if response is Dictionary else response
    
    if endpoint.contains("/friends"):
        online_friends = data if data is Array else []
        friends_updated.emit(online_friends)
    
    elif endpoint.contains("/world/state"):
        if data is Dictionary:
            world_state = data
            world_state_updated.emit(world_state)
    
    elif endpoint.contains("/achievements"):
        game_achievements = data if data is Array else []
        # Potential signal for achievement update if needed
    
    elif endpoint.contains("/user/settings"):
        if data is Dictionary and data.has("settings"):
            user_settings = data.settings
            _apply_settings(user_settings)

func _apply_settings(settings: Dictionary):
    # Apply Audio settings
    if settings.has("audio"):
        var audio = settings.audio
        if audio.has("master_volume"):
            AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Master"), linear_to_db(audio.master_volume / 100.0))
    
    # Apply Display settings
    if settings.has("display"):
        var display = settings.display
        if display.has("fullscreen"):
            DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN if display.fullscreen else DisplayServer.WINDOW_MODE_WINDOWED)

func fetch_heroes_from_server(user_id: int):
    if _heroes_loading: return
    _heroes_loading = true
    current_heroes.clear()
    ServerConnector.fetch_heroes(user_id)

func _on_heroes_received(_endpoint: String, data):
    _heroes_loading = false
    var heroes_data = data.get("data", data) if data is Dictionary else data
    if heroes_data is Array:
        current_heroes = heroes_data
        _heroes_loaded_from_server = true
        heroes_loaded.emit(current_heroes.size())

func set_user(data):
    if not data is Dictionary: return
    
    # Extract user object from "data" wrapper if present
    var user_data = data.get("data", data)
    current_user = user_data
    
    # Handle session data if present (new login flow)
    if data.has("session"):
        var session_data = data.session
        session_token = session_data.get("token", "")
        # Parse expiresAt timestamp
        var expires_at_str = session_data.get("expiresAt", "")
        if expires_at_str and expires_at_str is String:
            # Parse ISO8601 date string
            session_expires_at = Time.get_unix_time_from_datetime_string(expires_at_str)
    
    # Load settings if present
    if user_data.has("settings"):
        var settings_str = user_data.settings
        if settings_str is String and !settings_str.is_empty():
            user_settings = JSON.parse_string(settings_str)
            if user_settings == null: user_settings = {}
            _apply_settings(user_settings)
    
    # Fetch initial synced data
    var user_id = int(user_data.get("id", -1))
    if user_id != -1:
        ServerConnector.fetch_friends(user_id)
        ServerConnector.fetch_world_state()
        ServerConnector.fetch_achievements(user_id)
    
    set_active_task(user_data.get("activeTask"))

func clear_session():
    session_token = ""
    session_expires_at = 0
    
func is_session_valid() -> bool:
    if session_token.is_empty(): return false
    if session_expires_at == 0: return true
    return Time.get_unix_time_from_system() < session_expires_at

func emit_session_expired(reason: String):
    session_expired.emit(reason)
    clear_session()

func emit_force_logout(reason: String):
    force_logout.emit(reason)
    clear_session()

func _on_global_task_completed(data):
    if data.type == "TRAVEL":
        if data.has("targetRegion"):
            current_region_data = data.targetRegion
        elif data.has("targetRegionId"):
            # If DataManager is available, use it, otherwise keep current state
            if has_node("/root/DataManager"):
                current_region_data = get_node("/root/DataManager").get_region(int(data.targetRegionId))
        
        if current_user:
            current_user.currentRegion = int(data.get("targetRegionId", current_user.currentRegion))
        
        # Emit signal to notify UI components (SideHUD, etc.) that region has changed
        region_changed.emit(current_region_data)

func set_active_task(task_data):
    active_task = task_data
    task_updated.emit(active_task)

func get_online_friends():
    return online_friends

func get_game_time():
    return {
        "hour": world_state.get("currentHour", 12),
        "minute": 0, # Simplified for now
        "day": 1
    }

func get_current_weather():
    return world_state.get("weatherType", "CLEAR").to_lower()

func get_unread_achievements():
    return game_achievements.filter(func(a): return a.get("unlocked", false))

# Helper to format numbers with commas
func format_number(n: int) -> String:
    var s = str(n)
    var out = ""
    for i in range(s.length()):
        if i > 0 and (s.length() - i) % 3 == 0:
            out += ","
        out += s[i]
    return out

# --- UI VISIBILITY HELPERS ---
func get_region_scene(r_type: String) -> String:
    match r_type.to_upper():
        "TOWN": return "res://src/ui/TownScreen.tscn"
        "FOREST": return "res://src/ui/regions/ForestScreen.tscn"
        "MINE": return "res://src/ui/regions/MineScreen.tscn"
        "DUNGEON": return "res://src/ui/regions/DungeonScreen.tscn"
        "RUINS": return "res://src/ui/regions/RuinsScreen.tscn"
        "VOLCANO": return "res://src/ui/regions/VolcanoScreen.tscn"
        "DESERT": return "res://src/ui/regions/DesertScreen.tscn"
        "SNOW": return "res://src/ui/regions/SnowScreen.tscn"
        "SWAMP": return "res://src/ui/regions/SwampScreen.tscn"
        "GRAVEYARD": return "res://src/ui/regions/GraveyardScreen.tscn"
        "OCEAN": return "res://src/ui/regions/OceanScreen.tscn"
        "HELL": return "res://src/ui/regions/HellScreen.tscn"
        "GARDEN": return "res://src/ui/regions/GardenScreen.tscn"
        "WASTELAND": return "res://src/ui/regions/WastelandScreen.tscn"
        "STORM": return "res://src/ui/regions/StormScreen.tscn"
        "AUTUMN": return "res://src/ui/regions/AutumnScreen.tscn"
        "CORAL": return "res://src/ui/regions/CoralScreen.tscn"
        "ICE": return "res://src/ui/regions/GlacierScreen.tscn"
        "LAVA": return "res://src/ui/regions/LavaScreen.tscn"
        "FAIRY": return "res://src/ui/regions/FairyScreen.tscn"
        "ARENA": return "res://src/ui/regions/ArenaScreen.tscn"
        "CASTLE": return "res://src/ui/regions/CastleScreen.tscn"
        "SHIP": return "res://src/ui/regions/ShipScreen.tscn"
        "PRISON": return "res://src/ui/regions/PrisonScreen.tscn"
        "GIANT": return "res://src/ui/regions/GiantScreen.tscn"
        _: return "res://src/ui/regions/ForestScreen.tscn"

func set_inventory(data):
    if not data is Dictionary: return
    if data.has("items"): inventory = data.items
    if data.has("status"): inventory_status = data.status
    inventory_is_dirty = false

func set_heroes(data):
    if data is Array:
        current_heroes = data
        _heroes_loaded_from_server = true

func update_vitality(new_vitality):
    if current_user:
        current_user.vitality = new_vitality

func is_in_town():
    return current_user and current_user.get("currentRegion", 0) == 1

func get_title_rarity(_title): return "common"
func get_current_faction(): return {"id": 1, "name": "Neutral", "reputation": 1000}
func is_in_combat(): return false

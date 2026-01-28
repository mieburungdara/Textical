extends Node

signal task_updated(task)
signal region_changed(new_data)

var current_user = null
var current_heroes = []
var inventory = []
var inventory_status = {"used": 0, "max": 20}
var inventory_is_dirty = true
var active_task = null
var current_region_type = "TOWN" 
var current_region_data = null:
    set(val):
        current_region_data = val
        region_changed.emit(val)

# PERSISTENCE
var selected_hero_id: int = -1
var last_selected_item_id: int = -1
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
    ServerConnector.task_completed.connect(_on_global_task_completed)

func _on_global_task_completed(data):
    if data.type == "TRAVEL":
        if data.has("targetRegion"):
            current_region_data = data.targetRegion
        elif data.has("targetRegionId"):
            current_region_data = DataManager.get_region(int(data.targetRegionId))
        
        if current_user:
            current_user.currentRegion = int(data.get("targetRegionId", current_user.currentRegion))

func set_active_task(task_data):
    active_task = task_data
    task_updated.emit(active_task)
    if active_task:
        print("[STATE] Task Active: ", active_task.type)
    else:
        print("[STATE] Task Cleared (IDLE)")

func set_user(user_data):
    if not user_data is Dictionary: return
    current_user = user_data
    
    var new_task = null
    if user_data.has("activeTask"):
        new_task = user_data.activeTask
    elif user_data.has("taskQueue"):
        var queue = user_data.get("taskQueue", [])
        new_task = queue[0] if queue.size() > 0 else null
    
    set_active_task(new_task)
    print("[STATE] User Synced. Region: ", current_user.get("currentRegion"))

func set_inventory(data):
    if not data is Dictionary: return
    if data.has("items"): inventory = data.items
    if data.has("status"): inventory_status = data.status
    inventory_is_dirty = false

func set_heroes(data):
    current_heroes = data

func update_vitality(new_vitality):
    if current_user:
        current_user.vitality = new_vitality

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
		_: return "res://src/ui/regions/ForestScreen.tscn" # Fallback

func is_in_town():
    return current_user and current_user.currentRegion == 1

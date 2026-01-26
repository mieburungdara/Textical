extends Node

signal task_updated(task)

var current_user = null
var current_heroes = []
var inventory = []
var inventory_status = {"used": 0, "max": 20}
var active_task = null
var current_region_type = "TOWN" 
var current_region_data = null

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

# NAVIGATION MEMORY
var selected_hero_id: int = -1
var last_visited_hub: String = "res://src/ui/TownScreen.tscn"

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

func set_heroes(data):
    current_heroes = data

func update_vitality(new_vitality):
    if current_user:
        current_user.vitality = new_vitality

func is_in_town():
    return current_user and current_user.currentRegion == 1

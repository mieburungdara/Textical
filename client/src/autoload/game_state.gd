extends Node

signal task_updated(task)

var current_user = null
var current_heroes = []
var inventory = []
var inventory_status = {"used": 0, "max": 20}
var active_task = null
var current_region_type = "TOWN" # Default

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
    
    # Sync Active Task from Server
    if user_data.has("activeTask"):
        active_task = user_data.activeTask
    elif user_data.has("taskQueue"):
        var queue = user_data.get("taskQueue", [])
        active_task = queue[0] if queue.size() > 0 else null
    else:
        active_task = null
        
    print("[STATE] User & Task Synced. Region: ", current_user.get("currentRegion"))

func set_inventory(data):
    if not data is Dictionary: return
    
    if data.has("items"):
        inventory = data.items
    
    if data.has("status"):
        inventory_status = data.status
        print("[STATE] Inventory updated: ", inventory_status.used, "/", inventory_status.max)

func set_heroes(data):
    current_heroes = data
    print("[STATE] Heroes updated: ", current_heroes.size())

func set_active_task(task):
    active_task = task
    if active_task:
        print("[STATE] New task started: ", active_task.type)
    else:
        print("[STATE] Task cleared (Idle)")

func update_vitality(new_vitality):
    if current_user:
        current_user.vitality = new_vitality

func is_in_town():
    return current_user and current_user.currentRegion == 1

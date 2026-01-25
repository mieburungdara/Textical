extends Node

var current_user = null
var current_heroes = []
var inventory = []
var inventory_status = {"used": 0, "max": 20}
var active_task = null
var current_region_type = "TOWN" # Default

func set_user(user_data):
    current_user = user_data
    # Note: In a full implementation, we'd fetch region details 
    # to determine if it's a TOWN or WILDERNESS
    print("[STATE] User set: ", current_user.username, " (Region: ", current_user.currentRegion, ")")
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

extends Node
class_name LocationManager

## Manages scene transitions between game locations
## Singleton pattern - accessible from anywhere

# Location types
enum LocationType {
    VILLAGE,
    FOREST,
    DUNGEON,
    CITADEL,
}

# Current location
var current_location: LocationType = LocationType.VILLAGE
var current_floor: int = 1
const MAX_FLOOR: int = 100

# Location metadata (optimized - use const where possible)
const LOCATION_DATA: Dictionary = {
    LocationType.VILLAGE: {
        "name": "Solara Village",
        "description": "A peaceful village in the Solara Plains",
        "is_safe": true,
        "can_rest": true,
        "can_shop": true,
        "can_quest": true,
        "exits": [LocationType.FOREST, LocationType.CITADEL]
    },
    LocationType.FOREST: {
        "name": "Darkwood Forest",
        "description": "A mysterious forest filled with creatures",
        "is_safe": false,
        "exits": [LocationType.VILLAGE, LocationType.DUNGEON]
    },
    LocationType.DUNGEON: {
        "name": "Iron Depths",
        "description": "Floor %d - Ancient mines beneath the mountains",
        "is_safe": false,
        "exits": [LocationType.FOREST]
    },
    LocationType.CITADEL: {
        "name": "Solara Citadel",
        "description": "The royal castle of the kingdom",
        "is_safe": true,
        "can_quest": true,
        "exits": [LocationType.VILLAGE]
    }
}

signal location_changed(from_location: LocationType, to_location: LocationType)
signal floor_changed(from_floor: int, to_floor: int)

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS

func get_current_location_data() -> Dictionary:
    var data = LOCATION_DATA.get(current_location, {}).duplicate(true)
    if current_location == LocationType.DUNGEON:
        data["description"] = data["description"] % current_floor
    return data

func get_location_name(location: LocationType) -> String:
    var data = LOCATION_DATA.get(location, {})
    var name = data.get("name", "Unknown")
    if location == LocationType.DUNGEON:
        name = name + " F%d" % current_floor
    return name

func is_safe_zone() -> bool:
    return LOCATION_DATA.get(current_location, {}).get("is_safe", false)

func can_travel_to(location: LocationType) -> bool:
    var exits = get_exits()
    return location in exits

func travel_to(location: LocationType) -> bool:
    if not can_travel_to(location):
        push_warning("[LocationManager] Cannot travel from %s to %s" % [current_location, location])
        return false
    
    var from_location = current_location
    current_location = location
    
    # Reset floor when entering dungeon from outside
    if location == LocationType.DUNGEON:
        current_floor = 1
    
    # Emit signal - GameScene will handle view switching
    location_changed.emit(from_location, location)
    return true

func exit_dungeon() -> bool:
    if current_location != LocationType.DUNGEON:
        return false
    return travel_to(LocationType.FOREST)

func go_up_floor() -> bool:
    if current_location != LocationType.DUNGEON:
        return false
    if current_floor >= MAX_FLOOR:
        push_warning("[LocationManager] Already at max floor: %d" % MAX_FLOOR)
        return false
    
    var from_floor = current_floor
    current_floor += 1
    floor_changed.emit(from_floor, current_floor)
    return true

func go_down_floor() -> bool:
    if current_location != LocationType.DUNGEON:
        return false
    if current_floor <= 1:
        return exit_dungeon()
    
    var from_floor = current_floor
    current_floor -= 1
    floor_changed.emit(from_floor, current_floor)
    return true

func get_exits() -> Array:
    return LOCATION_DATA.get(current_location, {}).get("exits", [])

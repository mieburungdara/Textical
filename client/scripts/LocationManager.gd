extends Node
# class_name LocationManager  # Autoload - no class_name needed

## Manages scene transitions between game locations
## Uses LocationStateMachine for state management
## Singleton pattern - accessible from anywhere

# Reference to state machine
var _state_machine: LocationStateMachine = null

# Current location - returns LocationType enum for backward compatibility
var current_location: LocationType:
	get: return _state_machine.get_current_state() as LocationType

var current_floor: int:
	get: return _state_machine.get_current_floor()

const MAX_FLOOR: int = 100

# Legacy LocationType enum for compatibility
enum LocationType {
	VILLAGE,
	FOREST,
	DUNGEON,
	CITADEL,
}

# Signals (forwarded from state machine)
signal location_changed(from_location: LocationType, to_location: LocationType)
signal floor_changed(from_floor: int, to_floor: int)


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Initialize state machine
	_state_machine = LocationStateMachine.new()
	_state_machine.name = "StateMachine"
	add_child(_state_machine)
	
	# Connect state machine signals to our signals
	_state_machine.state_changed.connect(_on_state_changed)
	_state_machine.floor_changed.connect(_on_floor_changed)
	
	print("[LocationManager] Initialized with LocationStateMachine")


# =============================================================================
# Forwarded Methods (for backward compatibility)
# =============================================================================

func get_current_location_data() -> Dictionary:
	return _state_machine.get_current_state_config()


func get_location_name(location: LocationType) -> String:
	var config = _state_machine.get_state_config(location as LocationStateMachine.State)
	var name = config.get("name", "Unknown")
	if location == LocationType.DUNGEON:
		name = name + " F%d" % current_floor
	return name


func is_safe_zone() -> bool:
	return _state_machine.is_safe_zone()


func can_travel_to(location: LocationType) -> bool:
	return _state_machine.can_transition_to(location as LocationStateMachine.State)


func travel_to(location: LocationType) -> bool:
	return _state_machine.transition_to(location as LocationStateMachine.State)


func exit_dungeon() -> bool:
	return _state_machine.exit_dungeon()


func go_up_floor() -> bool:
	return _state_machine.go_up_floor()


func go_down_floor() -> bool:
	return _state_machine.go_down_floor()


func get_exits() -> Array:
	# Convert State array to LocationType array for backward compatibility
	var state_exits = _state_machine.get_allowed_exits()
	var result: Array[LocationType] = []
	for state in state_exits:
		result.append(state as LocationType)
	return result


# =============================================================================
# Signal Handlers
# =============================================================================

func _on_state_changed(from_state: LocationStateMachine.State, to_state: LocationStateMachine.State) -> void:
	location_changed.emit(from_state as LocationType, to_state as LocationType)


func _on_floor_changed(from_floor: int, to_floor: int) -> void:
	floor_changed.emit(from_floor, to_floor)


# =============================================================================
# Debug
# =============================================================================

func debug_print() -> void:
	_state_machine.debug_print()

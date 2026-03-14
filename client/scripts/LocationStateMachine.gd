class_name LocationStateMachine
extends Node

## LocationStateMachine - Manages location state transitions
## Follows State Machine pattern with enter/exit hooks
## Responsibilities:
## - Validate state transitions
## - Execute enter/exit callbacks
## - Track state history
## - Emit state change signals

# State enumeration
enum State {
    VILLAGE,
    FOREST,
    DUNGEON,
    CITADEL,
}

# State metadata configuration
const STATE_CONFIG := {
    State.VILLAGE: {
        "name": "Solara Village",
        "description": "A peaceful village in the Solara Plains",
        "emoji": "🏘️",
        "is_safe": true,
        "can_rest": true,
        "can_shop": true,
        "can_quest": true,
        "color": Color(0.2, 0.5, 0.3),
        "exits": [State.FOREST, State.CITADEL]
    },
    State.FOREST: {
        "name": "Darkwood Forest",
        "description": "A mysterious forest filled with creatures",
        "emoji": "🌲",
        "is_safe": false,
        "can_rest": false,
        "can_shop": false,
        "can_quest": false,
        "color": Color(0.1, 0.3, 0.15),
        "exits": [State.VILLAGE, State.DUNGEON]
    },
    State.DUNGEON: {
        "name": "Iron Depths",
        "description": "Ancient mines beneath the mountains",
        "emoji": "⚔️",
        "is_safe": false,
        "can_rest": false,
        "can_shop": false,
        "can_quest": false,
        "color": Color(0.2, 0.15, 0.25),
        "exits": [State.FOREST]
    },
    State.CITADEL: {
        "name": "Solara Citadel",
        "description": "The royal castle of the kingdom",
        "emoji": "🏰",
        "is_safe": true,
        "can_rest": false,
        "can_shop": true,
        "can_quest": true,
        "color": Color(0.4, 0.35, 0.25),
        "exits": [State.VILLAGE]
    }
}

# Current state
var _current_state: State = State.VILLAGE
var _previous_state: State = State.VILLAGE

# Floor tracking (only for DUNGEON)
var _current_floor: int = 1
const MAX_FLOOR: int = 100
const MIN_FLOOR: int = 1

# History for debugging
var _state_history: Array[State] = []

# Signals
signal state_changed(from_state: State, to_state: State)
signal floor_changed(from_floor: int, to_floor: int)
signal state_entered(state: State)
signal state_exited(state: State)


# =============================================================================
# State Management
# =============================================================================

## Get current state
func get_current_state() -> State:
    return _current_state


## Get previous state
func get_previous_state() -> State:
    return _previous_state


## Check if in specific state
func is_in_state(state: State) -> bool:
    return _current_state == state


## Get state name as string
func get_state_name(state: State) -> String:
    return State.keys()[state]


## Get current state name
func get_current_state_name() -> String:
    return get_state_name(_current_state)


# =============================================================================
# State Transitions
# =============================================================================

## Transition to a new state
## @param new_state State the state to transition to
## @return bool true if transition was successful
func transition_to(new_state: State) -> bool:
    # Validate transition
    if not can_transition_to(new_state):
        push_warning("[LocationStateMachine] Invalid transition: %s -> %s" % [
            get_state_name(_current_state), 
            get_state_name(new_state)
        ])
        return false
    
    # Don't transition to same state
    if new_state == _current_state:
        return true
    
    # Store previous state
    _previous_state = _current_state
    
    # Exit current state
    _execute_exit(_current_state)
    
    # Update state
    _current_state = new_state
    
    # Reset floor when entering DUNGEON from outside
    if _current_state == State.DUNGEON and _previous_state != State.DUNGEON:
        _current_floor = 1
    
    # Add to history
    _state_history.append(_current_state)
    if _state_history.size() > 20:
        _state_history.pop_front()
    
    # Enter new state
    _execute_enter(_current_state)
    
    # Emit signals
    state_changed.emit(_previous_state, _current_state)
    
    return true


## Check if can transition to given state
## @param new_state State the state to check
## @return bool true if transition is valid
func can_transition_to(new_state: State) -> bool:
    # Same state is always valid (no-op)
    if new_state == _current_state:
        return true
    
    # Check if new_state is in allowed exits
    var config = STATE_CONFIG.get(_current_state, {})
    var exits = config.get("exits", [])
    return new_state in exits


## Get allowed exits from current state
## @return Array[State] list of valid next states
func get_allowed_exits() -> Array[State]:
    var config = STATE_CONFIG.get(_current_state, {})
    var exits = config.get("exits", [])
    var result: Array[State] = []
    for e in exits:
        result.append(e as State)
    return result


## Force set state (bypass validation - use carefully)
## @param new_state State the state to set
func force_set_state(new_state: State) -> void:
    if new_state == _current_state:
        return
    
    _previous_state = _current_state
    _current_state = new_state
    
    _state_history.append(_current_state)
    
    _execute_exit(_previous_state)
    _execute_enter(_current_state)
    
    state_changed.emit(_previous_state, _current_state)


# =============================================================================
# Floor Management (DUNGEON only)
# =============================================================================

## Get current floor
func get_current_floor() -> int:
    return _current_floor


## Go up one floor (DUNGEON only)
## @return bool true if successful
func go_up_floor() -> bool:
    if _current_state != State.DUNGEON:
        push_warning("[LocationStateMachine] Can only go up floors in DUNGEON")
        return false
    
    if _current_floor >= MAX_FLOOR:
        push_warning("[LocationStateMachine] Already at max floor: %d" % MAX_FLOOR)
        return false
    
    var from_floor = _current_floor
    _current_floor += 1
    floor_changed.emit(from_floor, _current_floor)
    return true


## Go down one floor (DUNGEON only)
## @return bool true if successful, false if already at floor 1
func go_down_floor() -> bool:
    if _current_state != State.DUNGEON:
        push_warning("[LocationStateMachine] Can only go down floors in DUNGEON")
        return false
    
    if _current_floor <= MIN_FLOOR:
        # Exit dungeon when at floor 1
        return transition_to(State.FOREST)
    
    var from_floor = _current_floor
    _current_floor -= 1
    floor_changed.emit(from_floor, _current_floor)
    return true


## Exit dungeon to FOREST
## @return bool true if successful
func exit_dungeon() -> bool:
    if _current_state != State.DUNGEON:
        return false
    return transition_to(State.FOREST)


# =============================================================================
# State Callbacks (override in subclasses or connect externally)
# =============================================================================

## Called when entering a state
## @param state State the state being entered
func _on_enter_state(_state: State) -> void:
    # Override in subclass or connect to state_entered signal
    pass


## Called when exiting a state
## @param state State the state being exited
func _on_exit_state(_state: State) -> void:
    # Override in subclass or connect to state_exited signal
    pass


## Execute enter callback
func _execute_enter(state: State) -> void:
    _on_enter_state(state)
    state_entered.emit(state)


## Execute exit callback
func _execute_exit(state: State) -> void:
    _on_exit_state(state)
    state_exited.emit(state)


# =============================================================================
# State Info Helpers
# =============================================================================

## Get state configuration
## @param state State the state to get config for
## @return Dictionary configuration data
func get_state_config(state: State) -> Dictionary:
    return STATE_CONFIG.get(state, {})


## Get current state configuration
## @return Dictionary current state config
func get_current_state_config() -> Dictionary:
    var config = get_state_config(_current_state).duplicate(true)
    
    # Add floor to description if in DUNGEON
    if _current_state == State.DUNGEON:
        config["description"] = config.get("description", "") + " (Floor %d)" % _current_floor
    
    return config


## Check if current state is safe zone
func is_safe_zone() -> bool:
    var config = get_state_config(_current_state)
    return config.get("is_safe", false)


## Check if current state allows shopping
func can_shop() -> bool:
    var config = get_state_config(_current_state)
    return config.get("can_shop", false)


## Check if current state allows questing
func can_quest() -> bool:
    var config = get_state_config(_current_state)
    return config.get("can_quest", false)


## Check if current state allows resting
func can_rest() -> bool:
    var config = get_state_config(_current_state)
    return config.get("can_rest", false)


## Get display name for current state
func get_display_name() -> String:
    var config = get_state_config(_current_state)
    var state_name = config.get("name", "Unknown")
    
    if _current_state == State.DUNGEON:
        state_name = state_name + " F%d" % _current_floor
    
    return config.get("emoji", "") + " " + state_name


## Get state color
func get_state_color() -> Color:
    var config = get_state_config(_current_state)
    return config.get("color", Color.WHITE)


## Get state history (for debugging)
func get_history() -> Array[State]:
    return _state_history.duplicate(true)


## Clear state history
func clear_history() -> void:
    _state_history.clear()


# =============================================================================
# Debug
# =============================================================================

## Print state machine status
func debug_print() -> void:
    print("=== LocationStateMachine Debug ===")
    print("Current: %s (%s)" % [get_state_name(_current_state), get_display_name()])
    print("Previous: %s" % get_state_name(_previous_state))
    print("Safe: %s" % is_safe_zone())
    print("Exits: %s" % get_allowed_exits())
    print("History: %s" % _state_history)
    print("=================================")

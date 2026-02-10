class_name TipManager
extends Node

## RESPONSIBILITY: Tip display and rotation
## SINGLE RESPONSIBILITY: Only handles tip text management
## Godot 4.5 Compatible

signal tip_changed(new_tip: String)

# Configuration
const TIPS: Array[String] = [
    "TIP: Units in the frontline take more damage but protect the back.",
    "TIP: Gathering resources in high-danger zones yields rarer materials.",
    "TIP: Visit the Tavern daily to recruit specialized mercenaries.",
    "TIP: Check the Market often for bargain equipment from other players.",
    "TIP: Crafting higher-tier items requires a stable workbench in town.",
	"TIP: A tired hero recovers faster within the warmth of a town tavern."
]

const ROTATION_INTERVAL: float = 4.0

# Node references - will be set by LoadingScreen
var tip_label: Label = null

# State tracking
var _timer: SceneTreeTimer = null
var _current_tip: String = ""

func _ready() -> void:
    _setup_timer()
    _show_random_tip()

## Setup rotation timer
func _setup_timer() -> void:
    _timer = get_tree().create_timer(ROTATION_INTERVAL)
    _timer.timeout.connect(_on_tip_rotation)

## Show random tip
func _show_random_tip() -> void:
    _current_tip = TIPS.pick_random()
    if tip_label:
        tip_label.text = _current_tip
    tip_changed.emit(_current_tip)

## Timer callback for rotation
func _on_tip_rotation() -> void:
    _show_random_tip()
    _timer = get_tree().create_timer(ROTATION_INTERVAL)
    _timer.timeout.connect(_on_tip_rotation)

## Get current tip
func get_current_tip() -> String:
    return _current_tip

## Set specific tip
func set_tip(tip_text: String) -> void:
    _current_tip = tip_text
    if tip_label:
        tip_label.text = _current_tip
    tip_changed.emit(_current_tip)

## Check if timer is valid
func is_timer_valid() -> bool:
    return _timer != null and is_instance_valid(_timer)

## Cleanup on exit
func _exit_tree() -> void:
    if _timer:
        _timer.timeout.disconnect(_on_tip_rotation)
        _timer = null

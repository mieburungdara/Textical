class_name LogManager
extends Node

## RESPONSIBILITY: Chronicle logs management
## SINGLE RESPONSIBILITY: Only handles fantasy log display
## Godot 4.5 Compatible

signal log_added(entry: String)

# Configuration
const FANTASY_LOGS: Array[String] = [
    "UNROLLING ANCIENT MAPS...",
    "BREWING VITALITY POTIONS...",
    "SUMMONING THE VANGUARD...",
    "CONSULTING THE ELDER ORACLE...",
    "SHARPENING RUSTY BLADES...",
    "LIGHTING THE TAVERN HEARTH...",
    "MAPPING FORBIDDEN REALMS...",
	"DECIPHERING OLD SCROLLS..."
]

const MAX_LOG_LINES: int = 50
const MIN_INTERVAL: float = 0.5
const MAX_INTERVAL: float = 1.5

# Node references - will be set by LoadingScreen
var chronicle_logs: RichTextLabel = null

# State tracking
var _timer: SceneTreeTimer = null
var _log_buffer: Array[String] = []

func _ready() -> void:
    _setup_timer()
    _add_log_entry()

## Setup timer
func _setup_timer() -> void:
    _timer = get_tree().create_timer(randf_range(MIN_INTERVAL, MAX_INTERVAL))
    _timer.timeout.connect(_on_log_timer)

## Add log entry
func _add_log_entry() -> void:
    var entry = FANTASY_LOGS.pick_random()
    _log_buffer.append(entry)
    
    _trim_buffer()
    
    if chronicle_logs:
        chronicle_logs.text = _format_for_display()
    
    log_added.emit(entry)

## Trim buffer to max lines
func _trim_buffer() -> void:
    if _log_buffer.size() > MAX_LOG_LINES:
        _log_buffer = _log_buffer.slice(_log_buffer.size() - MAX_LOG_LINES)

## Format for display
func _format_for_display() -> String:
    var result = ""
    for entry in _log_buffer:
        result += "\n[i]> " + entry + "[/i]"
    return result

## Timer callback
func _on_log_timer() -> void:
    _add_log_entry()
    _timer = get_tree().create_timer(randf_range(MIN_INTERVAL, MAX_INTERVAL))
    _timer.timeout.connect(_on_log_timer)

## Get log count
func get_log_count() -> int:
    return _log_buffer.size()

## Clear all logs
func clear_logs() -> void:
    _log_buffer.clear()
    if chronicle_logs:
        chronicle_logs.text = ""

## Add custom log entry
func add_custom_entry(entry: String) -> void:
    _log_buffer.append(entry)
    _trim_buffer()
    
    if chronicle_logs:
        chronicle_logs.text = _format_for_display()
    
    log_added.emit(entry)

## Cleanup on exit
func _exit_tree() -> void:
    if _timer:
        _timer.timeout.disconnect(_on_log_timer)
        _timer = null

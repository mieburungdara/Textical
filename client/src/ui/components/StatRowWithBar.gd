extends PanelContainer
class_name StatRowWithBar

## StatRowWithBar - Reusable component untuk menampilkan stat dengan progress bar
## Features: Icon, name, value, progress bar dengan color change based on percentage

signal stat_clicked

# === NODE REFERENCES ===
@onready var row_content: VBoxContainer = $RowContent
@onready var stat_icon: Label = $RowContent/TopRow/StatIcon
@onready var stat_name: Label = $RowContent/TopRow/StatName
@onready var stat_value: Label = $RowContent/TopRow/StatValue
@onready var stat_bar: ProgressBar = $RowContent/StatBar

# === PRIVATE VARIABLES ===
var _stat_name: String = ""
var _stat_key: String = ""
var _max_value: int = 100
var _current_value: int = 0

# === PUBLIC METHODS ===

## Setup stat row dengan parameter
func setup_stat(p_name: String, p_icon: String, p_key: String = "", p_current: int = 0, p_max: int = 100):
    _stat_name = p_name
    _stat_key = p_key
    _current_value = p_current
    _max_value = max(p_max, 1)  # Avoid division by zero
    
    # Update UI
    if stat_name: stat_name.text = p_name
    if stat_icon: stat_icon.text = p_icon
    _update_value_text()
    
    if stat_bar:
        stat_bar.max_value = _max_value
        stat_bar.value = clamp(p_current, 0, _max_value)
        _update_bar_color()

## Update stat value
func update_value(current: int, max_val: int = 0):
    _current_value = current
    
    if max_val > 0:
        _max_value = max_val
    
    _update_value_text()
    
    if stat_bar:
        stat_bar.max_value = _max_value
        stat_bar.value = clamp(current, 0, _max_value)
        _update_bar_color()

func _update_value_text():
    if stat_value:
        stat_value.text = "%d / %d" % [_current_value, _max_value]

## Get stat key
func get_stat_key() -> String:
    return _stat_key

## Get current value
func get_value() -> int:
    return _current_value

## Get max value
func get_max_value() -> int:
    return _max_value

# === PRIVATE METHODS ===

func _update_bar_color():
    if not stat_bar:
        return
    
    var percentage = float(_current_value) / float(_max_value)
    
    # Color based on stat type
    match _stat_key.to_lower():
        "hp":
            if percentage > 0.6:
                stat_bar.modulate = Color(0.3, 0.8, 0.3) # Healthy Green
            elif percentage > 0.25:
                stat_bar.modulate = Color(0.9, 0.7, 0.2) # Wounded Yellow
            else:
                stat_bar.modulate = Color(0.9, 0.3, 0.3) # Critical Red
        "mp":
            stat_bar.modulate = Color(0.2, 0.5, 0.9) # Mana Blue
        "ap":
            stat_bar.modulate = Color(0.9, 0.8, 0.1) # Action Gold
        _:
            stat_bar.modulate = Color(0.8, 0.8, 0.8) # Default Gray

func _ready():
    # Connect hover signals untuk visual feedback
    mouse_entered.connect(_on_mouse_entered)
    mouse_exited.connect(_on_mouse_exited)

func _on_mouse_entered():
    # Highlight effect on hover
    modulate = Color(1.1, 1.1, 1.1, 1.0)

func _on_mouse_exited():
    # Reset to normal
    modulate = Color(1.0, 1.0, 1.0, 1.0)

func _gui_input(event):
    if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        stat_clicked.emit()

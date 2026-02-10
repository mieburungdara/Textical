extends PanelContainer
class_name StatRow

## StatRow - Reusable component untuk menampilkan stat (tanpa progress bar)
## Features: Icon, name, value, bonus dengan hover effect

signal stat_clicked

# === NODE REFERENCES ===
@onready var row_content: HBoxContainer = $HBox
@onready var stat_icon: Label = $HBox/StatIcon
@onready var stat_name: Label = $HBox/VBox/StatName
@onready var stat_value: Label = $HBox/VBox/StatValue
@onready var stat_bonus: Label = $HBox/StatBonus
@onready var accent_bar: Panel = $HBox/Accent

# === PRIVATE VARIABLES ===
var _stat_name: String = ""
var _stat_key: String = ""
var _current_value: int = 0
var _bonus_value: int = 0

# === PUBLIC METHODS ===

func setup_stat(p_name: String, p_icon: String, p_key: String = "", p_current: int = 0, _p_unused: int = 0):
    _stat_name = p_name
    _stat_key = p_key
    _current_value = p_current
    
    _update_accent_color()
    
    if stat_icon: stat_icon.text = p_icon
    if stat_name: stat_name.text = p_name.to_upper()
    
    if stat_value:
        if _stat_key.to_lower() in ["fire", "water", "earth", "wind", "light", "dark"]:
            var sign_str = "+" if p_current > 0 else ""
            stat_value.text = "%s%d%%" % [sign_str, p_current]
        else:
            stat_value.text = str(p_current)
            
    if stat_bonus: stat_bonus.text = ""

func _update_accent_color():
    if not accent_bar: return
    
    match _stat_key.to_lower():
        "hp", "health", "health_max": accent_bar.modulate = Color(0.3, 0.8, 0.4) # Green
        "mp", "mana", "mana_max": accent_bar.modulate = Color(0.2, 0.5, 0.9) # Blue
        "attack", "atk", "attack_damage": accent_bar.modulate = Color(0.9, 0.3, 0.2) # Red
        "defense", "def": accent_bar.modulate = Color(0.2, 0.6, 0.9) # Blue
        "magic_attack", "mag_atk", "magic_damage": accent_bar.modulate = Color(0.7, 0.3, 0.9) # Purple
        "magic_defense", "mag_def": accent_bar.modulate = Color(0.2, 0.8, 0.7) # Cyan
        "speed", "spd", "movement_speed": accent_bar.modulate = Color(0.4, 0.9, 0.3) # Green
        "initiative", "init": accent_bar.modulate = Color(0.9, 0.8, 0.1) # Gold
        "range", "attack_range": accent_bar.modulate = Color(0.8, 0.5, 0.2) # Orange/Brown
        "fire": accent_bar.modulate = Color(1.0, 0.3, 0.1)
        "water": accent_bar.modulate = Color(0.1, 0.6, 1.0)
        "earth": accent_bar.modulate = Color(0.7, 0.5, 0.2)
        "wind": accent_bar.modulate = Color(0.2, 1.0, 0.5)
        "light": accent_bar.modulate = Color(1.0, 0.9, 0.3)
        "dark": accent_bar.modulate = Color(0.7, 0.2, 1.0)
        _: accent_bar.modulate = Color(0.4, 0.35, 0.3)

## Update stat value
func update_value(p_value: int, _p_unused: int = 0):
    _current_value = p_value
    if stat_value: stat_value.text = str(p_value)
    if stat_bonus: stat_bonus.text = ""

## Get stat key
func get_stat_key() -> String:
    return _stat_key

## Get current value
func get_value() -> int:
    return _current_value

# === PRIVATE METHODS ===

func _update_bonus_display():
    if stat_bonus:
        if _bonus_value > 0:
            stat_bonus.text = "+%d" % _bonus_value
            stat_bonus.modulate = Color(0.4, 0.85, 0.4)  # Green
        elif _bonus_value < 0:
            stat_bonus.text = str(_bonus_value)
            stat_bonus.modulate = Color(0.9, 0.35, 0.35)  # Red
        else:
            stat_bonus.text = ""

## Set large mode for vital stats
func set_large_mode(is_large: bool):
    if is_large:
        if stat_icon: stat_icon.add_theme_font_size_override("font_size", 20)
        if stat_name: stat_name.add_theme_font_size_override("font_size", 13)
        if stat_value: stat_value.add_theme_font_size_override("font_size", 22)
        if accent_bar: accent_bar.custom_minimum_size.x = 5
    else:
        if stat_icon: stat_icon.remove_theme_font_size_override("font_size")
        if stat_name: stat_name.remove_theme_font_size_override("font_size")
        if stat_value: stat_value.remove_theme_font_size_override("font_size")
        if accent_bar: accent_bar.custom_minimum_size.x = 3

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

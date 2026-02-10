extends PanelContainer
class_name StatDetailPanel

## StatDetailPanel - Popup untuk menampilkan detail statistik
## Features: Show stat name, icon, description, current value, base value, bonus

# === NODE REFERENCES ===
@onready var header: HBoxContainer = $Content/Header
@onready var icon: Label = $Content/Header/Icon
@onready var title: Label = $Content/Header/Title
@onready var description: Label = $Content/Description
@onready var value_label: Label = $Content/ValueDisplay/Value
@onready var close_button: Button = $Content/CloseButton

# === SIGNAL ===
signal closed()

# === PRIVATE VARIABLES ===
var _stat_data: Dictionary = {}

# === STAT CONFIG ===
const STAT_INFO = {
    "hp": {"icon": "❤️", "name": "Health Points", "desc": "Hit points determine how much damage a unit can take before being defeated."},
    "mp": {"icon": "💧", "name": "Mana Points", "desc": "Mana is required to cast spells and use special abilities."},
    "initiative": {"icon": "⚡", "name": "Initiative", "desc": "Initiative determines starting position on the combat timeline and turn priority."},
    "attack": {"icon": "⚔️", "name": "Attack", "desc": "Attack power determines physical damage dealt to enemies."},
    "defense": {"icon": "🛡️", "name": "Defense", "desc": "Defense reduces incoming physical damage from enemies."},
    "magic_attack": {"icon": "🔮", "name": "Magic Attack", "desc": "Magic attack power determines magical damage dealt to enemies."},
    "magic_defense": {"icon": "✨", "name": "Magic Defense", "desc": "Magic defense reduces incoming magical damage from enemies."},
    "speed": {"icon": "💨", "name": "Speed", "desc": "Speed determines turn order and dodge chance."}
}

const ELEMENTAL_INFO = {
    "fire": {"icon": "🔥", "name": "Fire Affinity", "desc": "Resistance to fire damage. Positive values provide resistance, negative values indicate weakness."},
    "water": {"icon": "💧", "name": "Water Affinity", "desc": "Resistance to water damage. Positive values provide resistance, negative values indicate weakness."},
    "earth": {"icon": "🌍", "name": "Earth Affinity", "desc": "Resistance to earth damage. Positive values provide resistance, negative values indicate weakness."},
    "wind": {"icon": "🌪️", "name": "Wind Affinity", "desc": "Resistance to wind damage. Positive values provide resistance, negative values indicate weakness."},
    "light": {"icon": "☀️", "name": "Light Affinity", "desc": "Resistance to light damage. Positive values provide resistance, negative values indicate weakness."},
    "dark": {"icon": "🌙", "name": "Dark Affinity", "desc": "Resistance to dark damage. Positive values provide resistance, negative values indicate weakness."}
}

# === PUBLIC METHODS ===

## Show detail untuk battle stat
func show_stat_detail(stat_name: String, value: int, _base: int = 0):
    _stat_data = {"type": "stat", "name": stat_name, "value": value}
    
    var info = STAT_INFO.get(stat_name, {"icon": "❓", "name": stat_name.capitalize(), "desc": "No description available."})
    
    icon.text = info["icon"]
    title.text = info["name"]
    description.text = info["desc"]
    
    if value_label:
        value_label.text = str(value)
        value_label.modulate = Color(1, 1, 1) # Reset color
    
    visible = true

## Show detail untuk elemental affinity
func show_elemental_detail(element: String, value: int):
    _stat_data = {"type": "element", "name": element, "value": value}
    
    var info = ELEMENTAL_INFO.get(element, {"icon": "❓", "name": info_name(element), "desc": "No description available."})
    
    icon.text = info["icon"]
    title.text = info["name"]
    description.text = info["desc"]
    
    # For elemental, current value is the affinity value
    var sign_str = "+" if value >= 0 else ""
    if value_label:
        value_label.text = "%s%d%%" % [sign_str, value]
        
        if value > 0:
            value_label.modulate = Color(0.3, 0.85, 0.35)
        elif value < 0:
            value_label.modulate = Color(0.9, 0.3, 0.3)
        else:
            value_label.modulate = Color(0.6, 0.6, 0.6)
    
    visible = true

## Hide panel
func close_panel():
    visible = false
    closed.emit()

# === PRIVATE METHODS ===

func _ready():
    close_button.pressed.connect(_on_close_pressed)
    visible = false

func _on_close_pressed():
    close_panel()

func info_name(element: String) -> String:
    return element.capitalize() + " Affinity"

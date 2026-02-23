extends Control
class_name TopHUD

## TopHUD - Heads-up display dengan stat summary, resource bars, dan elemental affinity
## Features: HP/MP bars, stat summary, buff/debuff indicators, elemental icon

# === EXPORT VARIABLES ===
@export var show_resource_bars: bool = true
@export var show_stat_summary: bool = true
@export var show_buff_debuff: bool = true
@export var show_elemental_affinity: bool = true
@export var bar_colors: Dictionary = {
    "hp": Color(0.8, 0.2, 0.2, 1.0),
    "mp": Color(0.2, 0.4, 0.9, 1.0)
}

# === NODE REFERENCES ===
@onready var main_container = $MarginContainer/HBoxContainer if has_node("MarginContainer/HBoxContainer") else null
@onready var gold_label = $MarginContainer/HBoxContainer/GoldGroup/Label if has_node("MarginContainer/HBoxContainer/GoldGroup/Label") else null
@onready var energy_bar = $MarginContainer/HBoxContainer/EnergyGroup/ProgressBar if has_node("MarginContainer/HBoxContainer/EnergyGroup/ProgressBar") else null
@onready var energy_label = $MarginContainer/HBoxContainer/EnergyGroup/Label if has_node("MarginContainer/HBoxContainer/EnergyGroup/Label") else null
@onready var resource_bars_container = $MarginContainer/HBoxContainer/ResourceBars if has_node("MarginContainer/HBoxContainer/ResourceBars") else null
@onready var stat_summary_container = $MarginContainer/HBoxContainer/StatSummary if has_node("MarginContainer/HBoxContainer/StatSummary") else null
@onready var buffs_container = $MarginContainer/HBoxContainer/BuffsContainer if has_node("MarginContainer/HBoxContainer/BuffsContainer") else null
@onready var elemental_icon = $MarginContainer/HBoxContainer/ElementalIcon if has_node("MarginContainer/HBoxContainer/ElementalIcon") else null

# === PRIVATE VARIABLES ===
var _current_stats: Dictionary = {}
var _active_buffers: Array = []
var _elemental_affinity: Dictionary = {}

# === BUFF/DEBUFF METADATA ===
const BUFF_METADATA: Dictionary = {
    "shield": {"icon": "🛡️", "color": Color(0.3, 0.6, 0.9, 1.0), "tooltip": "Shield: Damage reduction active"},
    "haste": {"icon": "⚡", "color": Color(0.9, 0.9, 0.3, 1.0), "tooltip": "Haste: Speed increased"},
    "regeneration": {"icon": "💚", "color": Color(0.3, 0.9, 0.3, 1.0), "tooltip": "Regen: HP recovery over time"},
    "barrier": {"icon": "🔮", "color": Color(0.7, 0.3, 0.9, 1.0), "tooltip": "Barrier: Magic shield active"}
}

const DEBUFF_METADATA: Dictionary = {
    "burn": {"icon": "🔥", "color": Color(0.9, 0.3, 0.2, 1.0), "tooltip": "Burn: Damage over time"},
    "stun": {"icon": "💫", "color": Color(0.7, 0.7, 0.3, 1.0), "tooltip": "Stun: Cannot act"},
    "slow": {"icon": "🐌", "color": Color(0.5, 0.5, 0.7, 1.0), "tooltip": "Slow: Speed reduced"},
    "wet": {"icon": "💧", "color": Color(0.3, 0.5, 0.9, 1.0), "tooltip": "Wet: Water debuff"}
}

func _ready():
    _setup_connections()
    _setup_ui()
    refresh()
    
    # Register with UIManager to allow auto-hide on overlays
    if UIManager:
        UIManager.register_world_hud(self)

func _setup_connections():
    ServerConnector.login_success.connect(_on_data_updated)
    ServerConnector.request_completed.connect(_on_request_completed)
    ServerConnector.task_completed.connect(_on_task_completed)
    
    # Stat-related connections
    ServerConnector.stats_updated.connect(_on_stats_updated)
    ServerConnector.stat_changed.connect(_on_stat_changed)
    
    # Elemental affinity
    ServerConnector.elemental_affinity_updated.connect(_on_elemental_updated)

func _setup_ui():
    # Initialize empty containers
    pass

func refresh():
    if GameState.current_user:
        _on_data_updated(GameState.current_user)
    
    # Also refresh stats if we have a selected hero
    if GameState.selected_hero_id != -1:
        ServerConnector.fetch_unit_stats(GameState.selected_hero_id)
        ServerConnector.fetch_elemental_affinities(GameState.selected_hero_id)

func _on_data_updated(user):
    if not user: return
    
    # Update gold
    if gold_label:
        gold_label.text = str(user.get("gold", 0))
    
    # Update energy bar
    if energy_bar and energy_label:
        energy_bar.max_value = user.get("maxEnergy", 100)
        energy_bar.value = user.get("energy", 100)
        energy_label.text = "%d / %d" % [user.get("energy", 100), user.get("maxEnergy", 100)]

func _on_request_completed(endpoint, data):
    if "/stat/" in endpoint:
        _handle_stat_response(endpoint, data)

func _on_task_completed(_data):
    if GameState.current_user:
        ServerConnector.fetch_profile(GameState.current_user.id)

func _on_stats_updated(unit_id, stats_data):
    if unit_id == GameState.selected_hero_id:
        _current_stats = stats_data
        _update_resource_bars(stats_data)
        _update_stat_summary(stats_data)

func _on_stat_changed(unit_id, stat_name, _old_value, new_value):
    if unit_id == GameState.selected_hero_id:
        _current_stats[stat_name] = new_value
        _update_resource_bars(_current_stats)

func _on_elemental_updated(unit_id, affinities):
    if unit_id == GameState.selected_hero_id:
        _elemental_affinity = affinities if affinities is Dictionary else {}
        _update_elemental_icon()

func _handle_stat_response(endpoint: String, data):
    if endpoint.contains("/elemental"):
        _on_elemental_updated(GameState.selected_hero_id, data)

# === RESOURCE BARS ===

func _update_resource_bars(stats: Dictionary):
    if not show_resource_bars or not resource_bars_container:
        return
    
    # HP Bar
    var hp_current = stats.get("hp", 100)
    var hp_max = stats.get("maxHp", stats.get("hp", 100))
    _update_bar(resource_bars_container.get_node_or_null("HPBar"), hp_current, hp_max, bar_colors.hp)
    
    # MP Bar
    var mp_current = stats.get("mp", 50)
    var mp_max = stats.get("maxMp", stats.get("mp", 50))
    _update_bar(resource_bars_container.get_node_or_null("MPBar"), mp_current, mp_max, bar_colors.mp)

func _update_bar(bar: ProgressBar, current: float, max_val: float, color: Color):
    if not bar: return
    
    bar.max_value = max_val
    bar.value = current
    
    # Update color (optional - can use stylebox instead)
    if bar.has_theme_stylebox_override("fill"):
        var style = bar.get_theme_stylebox("fill").duplicate()
        style.bg_color = color
        bar.add_theme_stylebox_override("fill", style)

# === STAT SUMMARY ===

func _update_stat_summary(stats: Dictionary):
    if not show_stat_summary or not stat_summary_container:
        return
    
    # Clear existing labels
    for child in stat_summary_container.get_children():
        child.queue_free()
    
    # Add main stat labels
    var main_stats = ["hp", "mp", "attack", "defense"]
    
    for stat_name in main_stats:
        if stats.has(stat_name):
            var value = stats[stat_name]
            var label = Label.new()
            
            var icon = _get_stat_icon(stat_name)
            label.text = "%s %s" % [icon, str(int(value))]
            
            # Color based on stat type
            match stat_name:
                "hp": label.modulate = bar_colors.hp
                "mp": label.modulate = bar_colors.mp
            
            stat_summary_container.add_child(label)

func _get_stat_icon(stat_name: String) -> String:
    var icons = {
        "hp": "❤️", "mp": "💙",
        "attack": "⚔️", "defense": "🛡️",
        "magic_attack": "🔮", "magic_defense": "✨",
        "speed": "💨"
    }
    return icons.get(stat_name, "•")

# === BUFF/DEBUFF ===

func update_buffs_debuffs(statuses: Array):
    if not show_buff_debuff or not buffs_container:
        return
    
    # Clear existing
    for child in buffs_container.get_children():
        child.queue_free()
    
    _active_buffers = statuses
    
    # Create icon for each active status
    for status in statuses:
        var status_name = status.get("name", "") if status is Dictionary else ""
        var duration = status.get("duration", 0) if status is Dictionary else 0
        
        var metadata = BUFF_METADATA.get(status_name, {})
        if metadata.is_empty():
            metadata = DEBUFF_METADATA.get(status_name, {"icon": "❓", "color": Color.WHITE, "tooltip": status_name})
        
        var icon = _create_buff_icon(status_name, metadata, duration)
        buffs_container.add_child(icon)

func _create_buff_icon(status_name: String, metadata: Dictionary, duration: int) -> Control:
    var container = VBoxContainer.new()
    
    var icon_label = Label.new()
    icon_label.text = metadata.get("icon", "•")
    icon_label.modulate = metadata.get("color", Color.WHITE)
    container.add_child(icon_label)
    
    # Duration badge
    if duration > 0:
        var duration_label = Label.new()
        duration_label.text = str(duration)
        duration_label.add_theme_font_size_override("font_size", 10)
        container.add_child(duration_label)
    
    # Store metadata for tooltip
    container.set_meta("tooltip", metadata.get("tooltip", status_name))
    container.set_meta("is_debuff", DEBUFF_METADATA.has(status_name))
    
    # Mouse signals for tooltip
    var mouse_area = Control.new()
    mouse_area.mouse_entered.connect(_on_buff_hovered.bind(container))
    mouse_area.mouse_exited.connect(_on_buff_unhovered)
    container.add_child(mouse_area)
    
    return container

func _on_buff_hovered(icon_container: Control):
    var tooltip = icon_container.get_meta("tooltip", "")
    var is_debuff = icon_container.get_meta("is_debuff", false)
    # Show tooltip - implementasi detail tooltip bisa ditambahkan di sini
    print("[HUD] %s buff: %s" % ["Debuff" if is_debuff else "Buff", tooltip])

func _on_buff_unhovered():
    # Hide tooltip
    pass

# === ELEMENTAL AFFINITY ===

func _update_elemental_icon():
    if not show_elemental_affinity or not elemental_icon:
        return
    
    # Find dominant affinity
    var dominant = _get_dominant_affinity()
    
    if dominant != "":
        var icons = {
            "fire": "🔥", "water": "💧", "earth": "🌍", "wind": "🌪️",
            "light": "☀️", "dark": "🌙"
        }
        elemental_icon.text = icons.get(dominant, "•")
        elemental_icon.visible = true
        
        # Set tooltip
        var value = _elemental_affinity.get(dominant, 0)
        elemental_icon.set_meta("tooltip", "%s: %d%%" % [dominant.capitalize(), value])
    else:
        elemental_icon.visible = false

func _get_dominant_affinity() -> String:
    var max_value = 0
    var dominant = ""
    
    for element in _elemental_affinity:
        var value = _elemental_affinity[element]
        if value > max_value:
            max_value = value
            dominant = element
    
    return dominant

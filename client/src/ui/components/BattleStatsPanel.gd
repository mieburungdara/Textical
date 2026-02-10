extends PanelContainer
class_name BattleStatsPanel

## BattleStatsPanel - Component untuk menampilkan statistik unit dalam grid terpadu
## Layout: 2 (Vitals), 3 (Combat), 3 (Elemental)

# === NODE REFERENCES ===
@onready var battle_stats_content: VBoxContainer = $BattleStatsContent
@onready var vital_grid: GridContainer = $BattleStatsContent/VitalGrid
@onready var combat_grid: GridContainer = $BattleStatsContent/CombatGrid
@onready var elemental_grid: GridContainer = $BattleStatsContent/ElementSection/ElementalGrid

# === PRIVATE VARIABLES ===
var _total_stats: Dictionary = {}
var _elemental_affinities: Dictionary = {}
var _parent_stats_tab: VBoxContainer = null

# Stat Row Node Cache
var _stat_rows: Dictionary = {}

# Map node names to display names, icons, and keys
const STAT_CONFIG = {
    "HPStatRow": {"name": "HP", "icon": "❤️", "key": "hp", "is_vital": true},
    "MPStatRow": {"name": "MP", "icon": "💧", "key": "mp", "is_vital": true},
    "ATKStatRow": {"name": "ATK", "icon": "⚔️", "key": "attack"},
    "DEFStatRow": {"name": "DEF", "icon": "🛡️", "key": "defense"},
    "MAGATKStatRow": {"name": "MAG ATK", "icon": "🔮", "key": "magic_attack"},
    "MAGDEFStatRow": {"name": "MAG DEF", "icon": "✨", "key": "magic_defense"},
    "SPDStatRow": {"name": "SPD", "icon": "💨", "key": "speed"},
    "INITStatRow": {"name": "INIT", "icon": "⚡", "key": "initiative"},
    "ACCStatRow": {"name": "ACC", "icon": "🎯", "key": "accuracy"},
    "CRITStatRow": {"name": "CRIT", "icon": "💥", "key": "crit_chance"},
    "HPREGENStatRow": {"name": "REGEN", "icon": "🍏", "key": "hp_regen"},
    "VITALITYStatRow": {"name": "VIT", "icon": "🌱", "key": "vitality"},
    "TENACITYStatRow": {"name": "TEN", "icon": "💎", "key": "tenacity"},
    "SVAMPStatRow": {"name": "VAMP", "icon": "🍷", "key": "spell_vamp"},
    "ASPDStatRow": {"name": "ASPD", "icon": "🏹", "key": "attack_speed"},
    "FireElement": {"name": "FIRE", "icon": "🔥", "key": "fire", "is_element": true},
    "WaterElement": {"name": "WATER", "icon": "💧", "key": "water", "is_element": true},
    "EarthElement": {"name": "EARTH", "icon": "🌍", "key": "earth", "is_element": true},
    "WindElement": {"name": "WIND", "icon": "🌪️", "key": "wind", "is_element": true},
    "LightElement": {"name": "LIGHT", "icon": "☀️", "key": "light", "is_element": true},
    "DarkElement": {"name": "DARK", "icon": "🌙", "key": "dark", "is_element": true}
}

# === Lifecycle Methods ===

func _ready():
    _get_stat_row_references()
    _setup_click_handlers()

# === PUBLIC METHODS ===

## Set reference ke StatsTab parent
func set_parent_stats_tab(tab: VBoxContainer):
    _parent_stats_tab = tab

## Update battle stats
func update_stats(total: Dictionary = {}, _max_vals: Dictionary = {}):
    if not total.is_empty():
        _total_stats = total
    
    # Refresh references if needed
    if _stat_rows.is_empty():
        _get_stat_row_references()
    
    # Map raw server keys to standardized keys
    var mapped_stats = {
        "hp": _total_stats.get("health_max", _total_stats.get("hp", 100)),
        "mp": _total_stats.get("mana_max", _total_stats.get("mp", 50)),
        "initiative": _total_stats.get("initiative", 10),
        "attack": _total_stats.get("attack_damage", _total_stats.get("attack", 0)),
        "defense": _total_stats.get("defense", 0),
        "magic_attack": _total_stats.get("skill_power", _total_stats.get("magic_attack", 0)),
        "magic_defense": _total_stats.get("tenacity", _total_stats.get("magic_defense", 0)),
        "speed": _total_stats.get("speed", _total_stats.get("movement_speed", 0)),
        "accuracy": _total_stats.get("accuracy", 100),
        "crit_chance": int(_total_stats.get("crit_chance", 0) * 100), # Show as percentage
        "hp_regen": _total_stats.get("hp_regen", 0),
        "vitality": _total_stats.get("vitality_max", 100),
        "tenacity": int(_total_stats.get("tenacity", 0) * 100),
        "spell_vamp": int(_total_stats.get("spell_vamp", 0) * 100),
        "attack_speed": _total_stats.get("attack_speed", 1.0)
    }
    
    # Update combat stats
    for node_name in STAT_CONFIG:
        var config = STAT_CONFIG[node_name]
        if config.get("is_element"): continue
        
        var row = _stat_rows.get(node_name)
        if row and row.has_method("setup_stat"):
            var val = mapped_stats.get(config.key, 0)
            row.setup_stat(config.name, config.icon, config.key, int(val))
            
            if config.get("is_vital") and row.has_method("set_large_mode"):
                row.set_large_mode(true)

## Update elemental affinities
func update_affinities(affinities: Dictionary = {}):
    if not affinities.is_empty():
        _elemental_affinities = affinities
    
    for node_name in STAT_CONFIG:
        var config = STAT_CONFIG[node_name]
        if not config.get("is_element"): continue
        
        var row = _stat_rows.get(node_name)
        if row and row.has_method("setup_stat"):
            var val = _elemental_affinities.get(config.key, 0)
            row.setup_stat(config.name, config.icon, config.key, int(val))

## Reset semua stats ke default
func reset_stats():
    for node_name in _stat_rows:
        var row = _stat_rows[node_name]
        if row and row.has_method("update_value"):
            row.update_value(0)
    _total_stats = {}
    _elemental_affinities = {}

# === PRIVATE METHODS ===

func _get_stat_row_references():
    _stat_rows.clear()
    
    # Search in all grids
    var containers = [vital_grid, combat_grid, elemental_grid]
    for container in containers:
        if not container: continue
        for child in container.get_children():
            _stat_rows[child.name] = child

func _setup_click_handlers():
    for node_name in _stat_rows:
        var row = _stat_rows[node_name]
        var config = STAT_CONFIG.get(node_name, {})
        var stat_key = config.get("key", node_name.to_lower())
        
        if row and row.has_signal("stat_clicked"):
            if not row.stat_clicked.is_connected(_on_stat_row_clicked):
                row.stat_clicked.connect(_on_stat_row_clicked.bind(stat_key))

func _on_stat_row_clicked(stat_key: String):
    if _parent_stats_tab and _parent_stats_tab.has_method("show_stat_detail"):
        # For detail panel, we still send dictionaries for context if needed
        # but the simplified detail panel only needs the current value
        var is_element = ["fire", "water", "earth", "wind", "light", "dark"].has(stat_key)
        
        if is_element:
            var val = _elemental_affinities.get(stat_key, 0)
            _parent_stats_tab.show_elemental_detail(stat_key, int(val))
        else:
            # Map stat key to current value
            var val = 0
            match stat_key:
                "hp": val = _total_stats.get("health_max", 100)
                "mp": val = _total_stats.get("mana_max", 50)
                "attack": val = _total_stats.get("attack_damage", 0)
                "defense": val = _total_stats.get("defense", 0)
                "magic_attack": val = _total_stats.get("skill_power", 0)
                "magic_defense": val = _total_stats.get("tenacity", 0)
                "speed": val = _total_stats.get("speed", 0)
                "initiative": val = _total_stats.get("initiative", 10)
                "accuracy": val = _total_stats.get("accuracy", 100)
                "crit_chance": val = int(_total_stats.get("crit_chance", 0) * 100)
                "hp_regen": val = _total_stats.get("hp_regen", 0)
                "vitality": val = _total_stats.get("vitality_max", 100)
                "tenacity": val = int(_total_stats.get("tenacity", 0) * 100)
                "spell_vamp": val = int(_total_stats.get("spell_vamp", 0) * 100)
                "attack_speed": val = _total_stats.get("attack_speed", 1.0)
            
            _parent_stats_tab.show_stat_detail(stat_key, int(val), int(val))

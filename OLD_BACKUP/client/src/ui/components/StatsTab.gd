extends VBoxContainer
class_name StatsTab

## StatsTab - Component untuk menampilkan tab statistics hero
## Features: Delegate ke BattleStatsPanel terpadu

# === NODE REFERENCES ===
@onready var battle_stats_panel = $BattleStatsPanel
@onready var stat_detail_panel: StatDetailPanel = $StatDetailPanel

# === PRIVATE VARIABLES ===
var _current_hero: Dictionary = {}
var _total_stats: Dictionary = {}
var _max_stats: Dictionary = {}

# === PUBLIC METHODS ===

## Update stats tab dengan data hero
func update_stats(hero_data: Dictionary):
    print("[StatsTab] update_stats called, hero: ", hero_data.get("name", "Unknown"))
    
    _current_hero = hero_data
    _total_stats = hero_data.get("totalStats", {})
    _max_stats = hero_data.get("maxStats", {})
    
    # Update all stats melalui BattleStatsPanel terpadu
    if battle_stats_panel:
        if battle_stats_panel.has_method("update_stats"):
            battle_stats_panel.update_stats(_total_stats, _max_stats)
        
        var elemental_affinities = _current_hero.get("elementalAffinities", {})
        if battle_stats_panel.has_method("update_affinities"):
            battle_stats_panel.update_affinities(elemental_affinities)
    else:
        print("[StatsTab] ERROR: battle_stats_panel is null")

## Clear semua content
func clear_content():
    _total_stats = {}
    _max_stats = {}
    if battle_stats_panel:
        if battle_stats_panel.has_method("reset_stats"):
            battle_stats_panel.reset_stats()
            
    if stat_detail_panel and stat_detail_panel.has_method("close_panel"):
        stat_detail_panel.close_panel()
    _current_hero = {}

# === PRIVATE METHODS ===

func _ready():
    # Verify child nodes exist
    if not battle_stats_panel:
        push_error("BattleStatsPanel not found as child of StatsTab")
    
    if not stat_detail_panel:
        push_error("StatDetailPanel not found in StatsTab")
    
    # Connect detail panel closed signal
    if stat_detail_panel and stat_detail_panel.has_signal("closed"):
        stat_detail_panel.closed.connect(_on_detail_panel_closed)
    
    # Pass parent reference to child panels
    if battle_stats_panel:
        if battle_stats_panel.has_method("set_parent_stats_tab"):
            battle_stats_panel.set_parent_stats_tab(self)

func _on_detail_panel_closed():
    if stat_detail_panel:
        stat_detail_panel.visible = false

## Get stat detail panel reference
func get_stat_detail_panel():
    return stat_detail_panel

## Get total stats
func get_total_stats():
    return _total_stats

## Get max stats
func get_max_stats():
    return _max_stats

## Show stat detail panel
func show_stat_detail(stat_name: String, value: int, _base: int = 0):
    if stat_detail_panel:
        stat_detail_panel.show_stat_detail(stat_name, int(value), int(value))

## Show elemental detail panel
func show_elemental_detail(element_key: String, value: int):
    if stat_detail_panel:
        stat_detail_panel.show_elemental_detail(element_key, int(value))

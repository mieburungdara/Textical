extends PanelContainer
class_name HeroProfilePanel

## HeroProfilePanel - Panel untuk menampilkan detail hero
## Features: Hero info, tabs for stats/equipment/skills, stat display

# === NODE REFERENCES ===
@onready var main_container: HBoxContainer = $MainContainer
@onready var header_section = $MainContainer/LeftSection/HeaderSection
@onready var tabs_container = $MainContainer/RightSection/TabsContainer
@onready var loading_label: Label = $MainContainer/LoadingLabel

# === PRIVATE VARIABLES ===
var _current_hero: Dictionary = {}

func _ready():
    _setup_ui()
    _connect_signals()
    _show_loading()

func _setup_ui():
    # Setup tab names melalui tabs_container
    if tabs_container and tabs_container.has_method("set_tab_title"):
        tabs_container.set_tab_title(0, "Stats")
        tabs_container.set_tab_title(1, "Equipment")
        tabs_container.set_tab_title(2, "Skills")
    
    # Hide initially
    if main_container: main_container.visible = false

func _connect_signals():
    # Connect to server signals for real-time updates
    if ServerConnector:
        if ServerConnector.has_signal("stats_updated"):
            ServerConnector.stats_updated.connect(_on_stats_updated)
        if ServerConnector.has_signal("equipment_updated"):
            ServerConnector.equipment_updated.connect(_on_equipment_updated)

# === PUBLIC METHODS ===

func display_hero(hero_data: Dictionary):
    print("[HeroProfilePanel] display_hero called with: ", hero_data)
    
    # Validate input
    if hero_data.is_empty():
        print("[HeroProfilePanel] ERROR: hero_data is empty!")
        _show_loading()
        return
    
    _current_hero = hero_data
    print("[HeroProfilePanel] Hero name: ", hero_data.get("name", "Unknown"))
    _update_display()

func clear_display():
    _current_hero.clear()
    _show_loading()

# === PRIVATE METHODS ===

func _show_loading():
    if loading_label: loading_label.visible = true
    if main_container: main_container.visible = false

func _update_display():
    if _current_hero.is_empty():
        print("[HeroProfilePanel] _current_hero is empty, showing loading")
        _show_loading()
        return
    
    print("[HeroProfilePanel] _update_display: ", _current_hero.get("name", "Unknown"))
    
    if loading_label: loading_label.visible = false
    if main_container: main_container.visible = true
    
    # Extract hero data
    var hero_name = _current_hero.get("name", "Unknown")
    var level = int(_current_hero.get("level", 1))
    var rarity = _current_hero.get("rarity", "COMMON")
    
    var combat_class = _current_hero.get("combatClass", {})
    var hero_class_name = ""
    if combat_class is Dictionary:
        hero_class_name = combat_class.get("name", "Unit")
    elif combat_class is String:
        hero_class_name = combat_class
    else:
        hero_class_name = "Unit"
    
    var stats = _current_hero.get("totalStats", {})
    
    # Update header menggunakan HeaderSection component
    if header_section and header_section.has_method("update_header"):
        header_section.update_header(hero_name, level, rarity, hero_class_name, stats)
    
    # Update tabs menggunakan TabsContainer component
    if tabs_container and tabs_container.has_method("update_tabs"):
        tabs_container.update_tabs(_current_hero)
    
    # Fetch fresh data from server
    _fetch_hero_data()

func _fetch_hero_data():
    var hero_id = _current_hero.get("id", -1)
    if hero_id == -1:
        return
    
    if ServerConnector:
        ServerConnector.fetch_unit_stats(hero_id)
        ServerConnector.fetch_elemental_affinities(hero_id)
        ServerConnector.fetch_set_bonuses(hero_id)

func _on_stats_updated(unit_id, stats_data):
    var hero_id = _current_hero.get("id", -1)
    if unit_id == hero_id:
        _current_hero["totalStats"] = stats_data
        
        # Update header stats
        if header_section and header_section.has_method("update_stats"):
            header_section.update_stats(stats_data)
        
        # Update tabs
        if tabs_container and tabs_container.has_method("update_tabs"):
            tabs_container.update_tabs(_current_hero)

func _on_equipment_updated(hero_id, equipment_data):
    if hero_id == _current_hero.get("id", -1):
        _current_hero["equipment"] = equipment_data
        
        # Update tabs
        if tabs_container and tabs_container.has_method("update_tabs"):
            tabs_container.update_tabs(_current_hero)

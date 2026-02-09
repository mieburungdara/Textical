extends Control

## SideHUD - Integrated Sidebar Navigation & Resource Dashboard
## Manages global user stats (Vitality, Gold, Silver) and menu routing.

# === RESOURCE NODES ===
@onready var vit_label = %VitalityLabel
@onready var vit_bar = %VitBar
@onready var hp_label = %HPLabel
@onready var hp_bar = %HPBar
@onready var mp_label = %MPLabel
@onready var mp_bar = %MPBar
@onready var silver_label = %SilverLabel
@onready var gold_label = %GoldLabel

# === NAV BUTTON NODES ===
@onready var nav_buttons = {
    "Hero": %HeroBtn,
    "Bag": %BagBtn,
    "Town": %TownBtn,
    "Party": %PartyBtn,
    "Quests": %QuestBtn,
    "World": %WorldBtn,
    "Guild": %GuildBtn
}

func _ready():
    _connect_nav_signals()
    _listen_for_state_changes()
    _update_resources()
    _update_combat_stats()
    _highlight_active_menu()
    _check_visibility()

func _connect_nav_signals():
    for key in nav_buttons:
        var btn = nav_buttons[key]
        if btn:
            btn.pressed.connect(_on_nav_pressed.bind(key))

func _listen_for_state_changes():
    # Sync resources when user data changes
    GameState.region_changed.connect(func(_d): _update_resources(); _highlight_active_menu())
    
    # Combat Stats Sync
    ServerConnector.stats_updated.connect(func(_id, _stats): _update_combat_stats())
    
    # Listen for UI Manager overlays to highlight buttons
    UIManager.overlay_opened.connect(func(_overlay_nm): _highlight_active_menu())
    UIManager.overlay_closed.connect(func(_overlay_nm): _highlight_active_menu())
    
    # Auto hide/show on scene changes
    get_tree().node_added.connect(func(_n): _check_visibility())

func _check_visibility():
    if not is_inside_tree(): return
    # Use call_deferred to wait until scene is fully changed
    _do_check_visibility.call_deferred()

func _do_check_visibility():
    if not is_inside_tree(): return
    var tree = get_tree()
    if not tree: return
    
    var current_scene = tree.current_scene
    if not current_scene: return
    
    var path = current_scene.scene_file_path
    # Daftar screen dimana sidebar harus sembunyi
    var hidden_screens = ["LoadingScreen", "LoginScreen", "AuthScreen"]
    
    var should_hide = false
    for screen in hidden_screens:
        if screen in path:
            should_hide = true
            break
            
    visible = !should_hide

func _on_nav_pressed(key: String):
    var btn = nav_buttons[key]
    if not btn: return
    
    var tree = get_tree()
    if not tree: return
    
    var current_scene = tree.current_scene
    if not current_scene: return
    
    var path = btn.target_scene
    
    # PREVENT NAVIGATION DURING COMBAT (Except for overlays like Bag)
    if current_scene.scene_file_path.contains("CombatScreen") and not ("is_overlay" in btn and btn.is_overlay):
        print("[HUD] Cannot leave combat area!")
        return
    
    if "is_overlay" in btn and btn.is_overlay:
        if UIManager.is_overlay_open(btn.overlay_name):
            UIManager.close_overlay(btn.overlay_name)
        else:
            UIManager.close_all_overlays()
            UIManager.open_overlay(btn.overlay_name, path)
        _highlight_active_menu()
    else:
        # DYNAMIC HUB NAVIGATION: Always return to current region screen
        if key == "Town":
            _route_to_current_region()
            return
            
        if not is_inside_tree(): return
        if get_tree().current_scene.scene_file_path == path: return
        UIManager.close_all_overlays()
        get_tree().change_scene_to_file(path)

func _route_to_current_region():
    # ALWAYS close overlays when trying to return to the active region
    UIManager.close_all_overlays()
    
    var region_data = GameState.current_region_data
    if not region_data:
        # Fallback to Town 1
        if get_tree().current_scene.scene_file_path != "res://src/ui/TownScreen.tscn":
            get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
        return
        
    var r_type = region_data.get("visualType", region_data.get("type", "TOWN"))
    var target_path = GameState.get_region_scene(r_type)
    
    # Only trigger scene change if we are actually in a different scene
    if get_tree().current_scene.scene_file_path != target_path:
        get_tree().change_scene_to_file(target_path)
    
    # Update highlights since we didn't change scenes but closed overlays
    _highlight_active_menu()

func _update_resources():
    if not is_inside_tree(): return
    var user = GameState.current_user
    if not user: return
    
    # Update Vitality
    var vit = user.get("vitality", 0)
    var max_vit = user.get("maxVitality", 100)
    if vit_label: vit_label.text = "%d / %d" % [vit, max_vit]
    if vit_bar:
        vit_bar.max_value = max_vit
        vit_bar.value = vit
    
    # Update Currencies
    if silver_label: silver_label.text = _format_number(user.get("silver", 0))
    if gold_label: gold_label.text = _format_number(user.get("gold", 0))
    
    # DYNAMIC CONTEXTUAL LABELS
    _update_contextual_nav()

func _update_combat_stats():
    if not is_inside_tree(): return
    
    if GameState.current_heroes.size() == 0:
        return
        
    var hero = GameState.current_heroes[0]
    var hid = int(hero.id)
    var stats = ServerConnector.get_cached_stats(hid)
    
    if not stats or stats.is_empty():
        ServerConnector.fetch_unit_stats(hid)
        return
        
    if hp_label: hp_label.text = "%d / %d" % [int(stats.get("hp", 0)), int(stats.get("maxHp", 100))]
    if hp_bar:
        hp_bar.max_value = int(stats.get("maxHp", 100))
        hp_bar.value = int(stats.get("hp", 0))
        
    if mp_label: mp_label.text = "%d / %d" % [int(stats.get("mp", 0)), int(stats.get("maxMp", 100))]
    if mp_bar:
        mp_bar.max_value = int(stats.get("maxMp", 100))
        mp_bar.value = int(stats.get("mp", 0))

func _update_contextual_nav():
    var current_region = GameState.current_region_data
    var town_btn = nav_buttons.get("Town")
    if not town_btn: return
    
    if not current_region or GameState.is_in_town():
        if town_btn.has_method("set_menu_label"): town_btn.set_menu_label("TOWN")
        if town_btn.has_method("set_icon_text"): town_btn.set_icon_text("🏰")
    else:
        # We are in the wilderness
        var r_type = current_region.get("visualType", current_region.get("type", "FIELD")).to_upper()
        var r_name = current_region.get("name", "Unknown").to_upper()
        
        var display_label = r_type
        if r_name.length() <= 8: display_label = r_name
        
        if town_btn.has_method("set_menu_label"): town_btn.set_menu_label(display_label)
        if town_btn.has_method("set_icon_text"): town_btn.set_icon_text(_get_region_type_icon(r_type))

func _get_region_type_icon(type: String) -> String:
    match type:
        "FOREST": return "🌲"
        "MINE": return "⛏️"
        "CAVE": return "💎"
        "DUNGEON": return "💀"
        "RUINS": return "🏛️"
        "SWAMP": return "🐊"
        "DESERT": return "🏜️"
        "VOLCANO", "LAVA": return "🌋"
        "SNOW", "ICE": return "❄️"
        "OCEAN": return "🌊"
        "GARDEN": return "🌿"
        _: return "🚩"

func _highlight_active_menu():
    if not is_inside_tree(): return
    var tree = get_tree()
    if not tree: return
    
    var current_scene = tree.current_scene
    if not current_scene: return
    
    var current_scene_path = current_scene.scene_file_path
    
    for key in nav_buttons:
        var btn = nav_buttons[key]
        if not btn: continue
        
        var is_active = false
        
        if "is_overlay" in btn and btn.is_overlay:
            is_active = UIManager.is_overlay_open(btn.overlay_name)
        else:
            if "target_scene" in btn:
                is_active = (current_scene_path == btn.target_scene)
            
            # Contextual Town/Wilderness button highlight
            if key == "Town":
                var region_data = GameState.current_region_data
                if region_data:
                    var r_type = region_data.get("visualType", region_data.get("type", "TOWN"))
                    var region_scene = GameState.get_region_scene(r_type)
                    is_active = (current_scene_path == region_scene)
            
            if key == "World":
                is_active = current_scene_path.contains("WorldAtlas")
        
        # Visual feedback for active button
        btn.modulate = Color(1.5, 1.3, 0.8) if is_active else Color(1, 1, 1)

func _format_number(n: int) -> String:
    var s = str(n)
    var out = ""
    for i in range(s.length()):
        if i > 0 and (s.length() - i) % 3 == 0:
            out += ","
        out += s[i]
    return out

func refresh_stats():
    if GameState.selected_hero_id != -1:
        ServerConnector.fetch_unit_stats(GameState.selected_hero_id)

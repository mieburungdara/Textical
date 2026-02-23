extends Control

## SideHUD - Integrated Sidebar Navigation & Resource Dashboard
## Manages global user stats (Vitality, Gold, Silver) and menu routing.

# === RESOURCE NODES ===
@onready var vit_label = %VitalityLabel
@onready var vit_bar = %VitBar
@onready var silver_label = %SilverLabel
@onready var gold_label = %GoldLabel

# === NAV BUTTON NODES ===
@onready var nav_buttons = {
    "Character": %CharacterBtn,
    "Bag": %BagBtn,
    "Town": %TownBtn,
    "Quests": %QuestBtn,
    "World": %WorldBtn,
    "Guild": %GuildBtn,
    "Settings": %SettingsBtn
}

# === P0 NEW NODES ===
@onready var status_icon = %StatusIcon
@onready var ping_label = %PingLabel
@onready var region_icon = %RegionIcon
@onready var region_name = %RegionName
@onready var coord_label = %CoordLabel

# === P1 NEW NODES ===
@onready var day_night_icon = %DayNightIcon
@onready var time_label = %TimeLabel
@onready var date_label = %DateLabel
@onready var buff_container = %BuffContainer
@onready var friends_list = %FriendsList
@onready var vip_badge = %VIPBadge

# === P2 NEW NODES ===
@onready var title_label = %TitleLabel
@onready var faction_label = %FactionLabel

# === P3 NEW NODES ===
@onready var weather_icon = %WeatherIcon
@onready var weather_label = %WeatherLabel
@onready var combat_indicator = %CombatIndicator
@onready var settings_btn = %SettingsBtn
@onready var fps_label = %FPSLabel
@onready var perf_ping_label = %PerfPingLabel

# === BADGE NODES ===
@onready var badges = {
    "Quests": %QuestBadge,
    "Bag": %BagBadge,
    "Guild": %GuildBadge,
    "Character": %CharacterBadge,
    "Chat": %ChatBadge if has_node("%ChatBadge") else null,
    "Mail": %MailBadge if has_node("%MailBadge") else null,
    "FriendRequest": %FriendBadge if has_node("%FriendBadge") else null
}

var _ping_timer: Timer
var _ui_update_timer: Timer

func _ready():
    _setup_ping_timer()
    _setup_ui_update_timer()
    _connect_nav_signals()
    _setup_badge_inputs()
    _listen_for_state_changes()
    _update_resources()
    _update_combat_stats()
    _highlight_active_menu()
    _check_visibility()
    
    # Initial updates
    _update_connection_status(ServerConnector.is_socket_connected() if ServerConnector.has_method("is_socket_connected") else true)
    _update_region_display()
    _update_time_display()
    _update_vip_display()
    _update_friends_display()
    _update_title_display()
    _update_faction_display()
    _update_achievement_badge()
    _update_weather_display()
    _update_combat_state()
    _update_perf_display()

func _setup_ui_update_timer():
    _ui_update_timer = Timer.new()
    _ui_update_timer.wait_time = 1.0 # Update every second for time, buffs, perf
    _ui_update_timer.timeout.connect(_on_ui_update_timeout)
    add_child(_ui_update_timer)
    _ui_update_timer.start()

func _on_ui_update_timeout():
    _update_time_display()
    _update_buffs_display()
    _update_perf_display()
    _update_combat_state()

func _setup_badge_inputs():
    for key in badges:
        var badge = badges[key]
        badge.mouse_filter = Control.MOUSE_FILTER_STOP
        badge.gui_input.connect(func(event):
            if event is InputEventMouseButton and event.pressed:
                update_badge_count(key, 0)
        )

func _setup_ping_timer():
    _ping_timer = Timer.new()
    _ping_timer.wait_time = 5.0
    _ping_timer.timeout.connect(_on_ping_timeout)
    add_child(_ping_timer)
    _ping_timer.start()

func _on_ping_timeout():
    if ServerConnector and ServerConnector.has_method("get_last_ping"):
        var ping = ServerConnector.get_last_ping()
        ping_label.text = str(ping) + "ms" if ping > 0 else "--ms"

func _connect_nav_signals():
    for key in nav_buttons:
        var btn = nav_buttons[key]
        if btn:
            if btn.pressed.is_connected(_on_nav_pressed):
                btn.pressed.disconnect(_on_nav_pressed)
            btn.pressed.connect(_on_nav_pressed.bind(key))

func _on_settings_pressed():
    if UIManager.is_overlay_open("Settings"):
        UIManager.close_overlay("Settings")
    else:
        UIManager.close_all_overlays()
        UIManager.open_overlay("Settings", "res://src/ui/SettingsScreen.tscn")
    _highlight_active_menu()

func _listen_for_state_changes():
    GameState.region_changed.connect(func(_d): 
        _update_resources()
        _highlight_active_menu()
        _update_region_display()
        _update_weather_display()
    )
    
    ServerConnector.stats_updated.connect(func(_id, _stats): _update_combat_stats())
    
    if ServerConnector.has_signal("socket_connected"):
        ServerConnector.socket_connected.connect(func(): _update_connection_status(true))
    if ServerConnector.has_signal("socket_disconnected"):
        ServerConnector.socket_disconnected.connect(func(): _update_connection_status(false))
    
    GameState.quest_updated.connect(func(): update_badge_count("Quests", 1))
    GameState.mail_received.connect(func(): update_badge_count("Bag", 1))
    GameState.achievement_unlocked.connect(func(_a): _update_achievement_badge())
    
    UIManager.overlay_opened.connect(func(_overlay_nm): _highlight_active_menu())
    UIManager.overlay_closed.connect(func(_overlay_nm): _highlight_active_menu())
    
    get_tree().node_added.connect(func(_n): _check_visibility())

func update_badge_count(btn_key: String, count: int):
    if badges.has(btn_key):
        var badge = badges[btn_key]
        badge.visible = count > 0
        badge.text = str(count)
        print("[HUD] Badge updated: %s = %d" % [btn_key, count])

func _update_connection_status(connected: bool):
    status_icon.text = "🟢" if connected else "🔴"
    status_icon.modulate = Color(1, 1, 1) if connected else Color(1, 0.3, 0.3)
    if not connected:
        ping_label.text = "--ms"

func _update_region_display():
    var region = GameState.current_region_data
    if not region:
        region_icon.text = "🏰"
        region_name.text = "UNKNOWN"
        coord_label.text = "X:0 Y:0"
        return
    
    var r_type = region.get("visualType", region.get("type", "TOWN"))
    region_icon.text = _get_region_type_icon(r_type)
    region_name.text = region.get("name", "Unknown").to_upper()
    
    var x = region.get("x")
    var y = region.get("y")
    
    if x == null or y == null:
        var rid = int(region.get("id", 0))
        if GameState.REGION_POSITIONS.has(rid):
            var pos = GameState.REGION_POSITIONS[rid]
            x = pos.x
            y = pos.y
    
    coord_label.text = "X:%d Y:%d" % [int(x) if x != null else 0, int(y) if y != null else 0]

func _update_time_display():
    var time = GameState.get_game_time()
    time_label.text = "%02d:%02d" % [time.hour, time.minute]
    date_label.text = "Day %d" % time.day
    day_night_icon.text = "☀️" if time.hour >= 6 and time.hour < 18 else "🌙"

func _update_buffs_display():
    for child in buff_container.get_children():
        child.queue_free()
    
    if GameState.current_heroes.size() == 0:
        return
        
    var hero = GameState.current_heroes[0]
    var buffs = hero.get("activeBuffs", [])
    
    if buffs.is_empty() and OS.is_debug_build():
        buffs = [{"icon": "🛡️", "name": "Shield"}, {"icon": "⚡", "name": "Haste"}]
    
    for buff in buffs:
        var lbl = Label.new()
        lbl.text = buff.get("icon", "✨")
        lbl.tooltip_text = buff.get("name", "Unknown Buff")
        buff_container.add_child(lbl)

func _update_vip_display():
    var user = GameState.current_user
    var is_vip = user.get("isVip", false) if user else false
    vip_badge.visible = is_vip
    if is_vip:
        _animate_vip_badge()

func _animate_vip_badge():
    var tw = create_tween().set_loops()
    tw.tween_property(vip_badge, "modulate:a", 0.5, 1.0)
    tw.tween_property(vip_badge, "modulate:a", 1.0, 1.0)

func _update_friends_display():
    for child in friends_list.get_children():
        child.queue_free()
        
    var friends = GameState.get_online_friends()
    for friend in friends:
        var hbox = HBoxContainer.new()
        var status_dot = Label.new()
        status_dot.text = "•"
        status_dot.modulate = Color.GREEN if friend.status == "online" else Color.YELLOW
        hbox.add_child(status_dot)
        
        var name_lbl = Label.new()
        name_lbl.text = friend.name
        name_lbl.add_theme_font_size_override("font_size", 9)
        hbox.add_child(name_lbl)
        friends_list.add_child(hbox)

func _update_achievement_badge():
    var unread = GameState.get_unread_achievements().size()
    update_badge_count("Character", unread)

func _update_title_display():
    var user = GameState.current_user
    var title = user.get("title", "NOVICE") if user else "NOVICE"
    title_label.text = title.to_upper()
    title_label.modulate = _get_title_color(title)

func _get_title_color(title: String) -> Color:
    var rarity = GameState.get_title_rarity(title)
    match rarity:
        "common": return Color(0.8, 0.8, 0.8)
        "rare": return Color(0.3, 0.6, 0.9)
        "epic": return Color(0.6, 0.3, 0.8)
        "legendary": return Color(1, 0.6, 0.1)
        _: return Color.WHITE

func _update_faction_display():
    var faction = GameState.get_current_faction()
    var rep = faction.get("reputation", 0)
    faction_label.text = _get_reputation_tier(rep).to_upper()

func _get_reputation_tier(rep: int) -> String:
    if rep >= 10000: return "Revered"
    elif rep >= 6000: return "Honored"
    elif rep >= 3000: return "Friendly"
    elif rep >= 1000: return "Neutral"
    else: return "Stranger"

func _update_weather_display():
    var weather = GameState.get_current_weather() if GameState.has_method("get_current_weather") else "sunny"
    weather_label.text = weather.to_upper()
    match weather:
        "sunny", "clear": weather_icon.text = "☀️"
        "rainy": weather_icon.text = "🌧️"
        "stormy": weather_icon.text = "⛈️"
        "snowy": weather_icon.text = "❄️"
        "cloudy": weather_icon.text = "☁️"
        _: weather_icon.text = "🌈"

func _update_combat_state():
    var in_combat = GameState.is_in_combat()
    combat_indicator.visible = in_combat
    if in_combat:
        _animate_combat()

func _animate_combat():
    var tw = create_tween().set_loops()
    tw.tween_property(combat_indicator, "modulate:a", 0.4, 0.5)
    tw.tween_property(combat_indicator, "modulate:a", 1.0, 0.5)

func _update_perf_display():
    fps_label.text = "%d FPS" % Engine.get_frames_per_second()
    var ping = ServerConnector.get_last_ping()
    perf_ping_label.text = str(ping) + "ms" if ping > 0 else "--ms"
    
    if Engine.get_frames_per_second() < 30:
        fps_label.modulate = Color(1, 0.3, 0.3)
    else:
        fps_label.modulate = Color(0.5, 0.5, 0.5)

func _check_visibility():
    if not is_inside_tree(): return
    _do_check_visibility.call_deferred()

func _do_check_visibility():
    if not is_inside_tree(): return
    var tree = get_tree()
    if not tree: return
    var current_scene = tree.current_scene
    if not current_scene: return
    var path = current_scene.scene_file_path
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
        if key == "Town":
            _route_to_current_region()
            return
        if not is_inside_tree(): return
        if get_tree().current_scene.scene_file_path == path: return
        UIManager.close_all_overlays()
        get_tree().change_scene_to_file(path)

func _route_to_current_region():
    UIManager.close_all_overlays()
    var region_data = GameState.current_region_data
    if not region_data:
        if get_tree().current_scene.scene_file_path != "res://src/ui/TownScreen.tscn":
            get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
        return
    var r_type = region_data.get("visualType", region_data.get("type", "TOWN"))
    var target_path = GameState.get_region_scene(r_type)
    if get_tree().current_scene.scene_file_path != target_path:
        get_tree().change_scene_to_file(target_path)
    _highlight_active_menu()

func _update_resources():
    if not is_inside_tree(): return
    var user = GameState.current_user
    if not user: return
    var energy = user.get("energy", 0)
    var max_energy = user.get("maxEnergy", 100)
    if vit_label: vit_label.text = "%d / %d" % [energy, max_energy]
    if vit_bar:
        vit_bar.max_value = max_energy
        vit_bar.value = energy
    if silver_label: silver_label.text = _format_number(user.get("silver", 0))
    if gold_label: gold_label.text = _format_number(user.get("gold", 0))
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

func _update_contextual_nav():
    var current_region = GameState.current_region_data
    var town_btn = nav_buttons.get("Town")
    if not town_btn: return
    if not current_region or GameState.is_in_town():
        if town_btn.has_method("set_menu_label"): town_btn.set_menu_label("TOWN")
        if town_btn.has_method("set_icon_text"): town_btn.set_icon_text("🏰")
    else:
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
            if key == "Town":
                var region_data = GameState.current_region_data
                if region_data:
                    var r_type = region_data.get("visualType", region_data.get("type", "TOWN"))
                    var region_scene = GameState.get_region_scene(r_type)
                    is_active = (current_scene_path == region_scene)
            if key == "World":
                is_active = current_scene_path.contains("MapScreen")
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

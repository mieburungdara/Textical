extends Control

## SideHUD_Navigation - SRP Component
## Manages sidebar navigation routing and badges.

# === NAV BUTTON NODES ===
@onready var nav_buttons = {
    "Character": %CharacterBtn,
    "Bag": %BagBtn,
    "Town": %TownBtn,
    "Quests": %QuestBtn,
    "World": %WorldBtn,
    "Guild": %GuildBtn,
    "Codex": %CodexBtn
}

# === BADGE NODES ===
@onready var badges = {
    "Quests": %QuestBadge,
    "Bag": %BagBadge,
    "Guild": %GuildBadge,
    "Character": %CharacterBadge,
    "Codex": %CodexBadge,
    "Chat": %ChatBadge if has_node("%ChatBadge") else null,
    "Mail": %MailBadge if has_node("%MailBadge") else null,
    "FriendRequest": %FriendBadge if has_node("%FriendBadge") else null
}

func _ready():
    _connect_nav_signals()
    _setup_badge_inputs()
    _listen_for_changes()
    _update_achievement_badge()
    _highlight_active_menu()

func _connect_nav_signals():
    for key in nav_buttons:
        var btn = nav_buttons[key]
        if btn:
            if btn.pressed.is_connected(_on_nav_pressed):
                btn.pressed.disconnect(_on_nav_pressed)
            btn.pressed.connect(_on_nav_pressed.bind(key))

func _setup_badge_inputs():
    for key in badges:
        var badge = badges[key]
        if badge:
            badge.mouse_filter = Control.MOUSE_FILTER_STOP
            badge.gui_input.connect(func(event):
                if event is InputEventMouseButton and event.pressed:
                    update_badge_count(key, 0)
            )

func _listen_for_changes():
    GameState.quest_updated.connect(func(): update_badge_count("Quests", 1))
    GameState.mail_received.connect(func(): update_badge_count("Bag", 1))
    GameState.achievement_unlocked.connect(func(_a): _update_achievement_badge())
    
    UIManager.overlay_opened.connect(func(_overlay_nm): _highlight_active_menu())
    UIManager.overlay_closed.connect(func(_overlay_nm): _highlight_active_menu())

func update_badge_count(btn_key: String, count: int):
    if badges.has(btn_key):
        var badge = badges[btn_key]
        badge.visible = count > 0
        badge.text = str(count)
        print("[HUD] Badge updated: %s = %d" % [btn_key, count])

func _update_achievement_badge():
    var unread = GameState.get_unread_achievements().size()
    # Achievement notifications now show on the Codex button
    update_badge_count("Codex", unread)

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
                is_active = current_scene_path.contains("WorldAtlas")
        btn.modulate = Color(1.5, 1.3, 0.8) if is_active else Color(1, 1, 1)

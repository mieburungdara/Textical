extends Control
class_name WildernessBase

@onready var title_label = $HeaderContainer/Title
@onready var subtitle_label = $HeaderContainer/Subtitle
@onready var resource_container = find_child("ResourceGrid", true, false)

const GATHER_VFX = preload("res://assets/vfx/GatherEffect.tscn")

var current_region_data = null
var _last_clicked_button: Button = null

func _ready():
    # BUG FIX: Auto-redirect if a task is already running
    if GameState.active_task:
        if GameState.active_task.get("type") == "TRAVEL":
            get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn")
            return

    ServerConnector.request_completed.connect(_on_request_completed)
    ServerConnector.task_completed.connect(_on_task_completed)
    
    if scene_file_path != "":
        GameState.last_visited_hub = scene_file_path
    
    if GameState.current_user:
        _fetch_data()

func _fetch_data():
    var rid = GameState.current_user.get("currentRegion", 1)
    ServerConnector.get_region_details(int(rid))

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if "region/" in endpoint:
        # Handle server response format: { "success": true, "data": {...} }
        if data is Dictionary and data.has("data"):
            current_region_data = data.get("data")
        else:
            current_region_data = data
        
        if current_region_data is Dictionary:
            _update_ui()
        else:
            push_error("[WildernessBase] Invalid region data format")
    elif "action/travel" in endpoint:
        get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn")

func _on_task_completed(data):
    if not data is Dictionary: return
    
    if data.get("type") == "GATHERING":
        if is_instance_valid(subtitle_label):
            subtitle_label.text = "Gathering Success!"
            subtitle_label.add_theme_color_override("font_color", Color.GREEN)
        
        var vfx_pos = get_viewport_rect().size / 2
        if is_instance_valid(_last_clicked_button):
            vfx_pos = _last_clicked_button.global_position + (_last_clicked_button.size / 2)
        _play_vfx(GATHER_VFX, vfx_pos)
        
        GameState.inventory_is_dirty = true
        if GameState.current_user:
            var uid = GameState.current_user.get("id")
            if uid:
                ServerConnector.fetch_inventory(int(uid))
                ServerConnector.fetch_profile(int(uid))

func _play_vfx(vfx_scene: PackedScene, pos: Vector2):
    var effect = vfx_scene.instantiate()
    add_child(effect)
    effect.global_position = pos

func _update_ui():
    if not current_region_data: return
    title_label.text = current_region_data.get("name", "Unknown").to_upper()
    var danger_level = current_region_data.get("dangerLevel", 1)
    subtitle_label.text = current_region_data.get("description", "Danger Level: %d" % danger_level)
    subtitle_label.remove_theme_color_override("font_color") # Reset to default
    
    for child in resource_container.get_children(): child.queue_free()
    
    # Optimize grid for landscape
    if resource_container is GridContainer:
        resource_container.columns = 4
        resource_container.add_theme_constant_override("h_separation", 25)
        resource_container.add_theme_constant_override("v_separation", 25)
    
    # 1. Add Resources
    var resources = current_region_data.get("resources", [])
    if resources is Array:
        for res in resources:
            if res is Dictionary and res.has("item"):
                var item = res.get("item")
                if item is Dictionary:
                    var i_name = item.get("name", "Unknown")
                    var res_id = res.get("id", 0)
                    var emoji = _get_emoji_for_item(i_name)
                    var card = _create_action_card(i_name, emoji, "Gather Resource", func(btn): _on_gather_pressed(int(res_id), btn))
                    resource_container.add_child(card)

    # 2. Add Hunting Card
    var hunt_card = _create_action_card("Battle Slime", "⚔️", "Hunt Monsters", func(_b): _on_hunt_pressed())
    resource_container.add_child(hunt_card)
    
    _play_entry_animation()

func _create_action_card(title: String, icon: String, sub: String, callback: Callable) -> Button:
    var btn = Button.new()
    btn.custom_minimum_size = Vector2(180, 140)
    btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    btn.focus_mode = Control.FOCUS_NONE
    
    # Style
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0.05, 0.15, 0.1, 0.8)
    style.border_width_left = 1
    style.border_width_top = 1
    style.border_width_right = 1
    style.border_width_bottom = 1
    style.border_color = Color(0.4, 0.8, 0.6, 0.4)
    style.corner_radius_top_left = 12
    style.corner_radius_top_right = 12
    style.corner_radius_bottom_right = 12
    style.corner_radius_bottom_left = 12
    btn.add_theme_stylebox_override("normal", style)
    
    var hover = style.duplicate()
    hover.bg_color = Color(0.1, 0.25, 0.15, 0.9)
    hover.border_color = Color(0.6, 1.0, 0.8, 0.8)
    btn.add_theme_stylebox_override("hover", hover)

    # Layout
    var vbox = VBoxContainer.new()
    vbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    vbox.alignment = BoxContainer.ALIGNMENT_CENTER
    vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
    btn.add_child(vbox)
    
    var icon_lbl = Label.new()
    icon_lbl.text = icon
    icon_lbl.add_theme_font_size_override("font_size", 48)
    icon_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(icon_lbl)
    
    var title_lbl = Label.new()
    title_lbl.text = title
    title_lbl.add_theme_font_size_override("font_size", 18)
    title_lbl.add_theme_color_override("font_color", Color(0.8, 1, 0.9))
    title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(title_lbl)
    
    var sub_lbl = Label.new()
    sub_lbl.text = sub
    sub_lbl.add_theme_font_size_override("font_size", 12)
    sub_lbl.add_theme_color_override("font_color", Color(0.5, 0.7, 0.6))
    sub_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(sub_lbl)
    
    btn.pressed.connect(func(): callback.call(btn))
    return btn

func _get_emoji_for_item(item_name: String) -> String:
    item_name = item_name.to_lower()
    if "wood" in item_name or "log" in item_name: return "🪵"
    if "stone" in item_name or "ore" in item_name: return "🪨"
    if "herb" in item_name or "leaf" in item_name: return "🌿"
    if "water" in item_name: return "💧"
    return "📦"

func _play_entry_animation():
    var delay = 0.0
    for child in resource_container.get_children():
        child.modulate.a = 0
        child.scale = Vector2(0.8, 0.8)
        child.pivot_offset = Vector2(80, 80)
        
        var tw = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
        tw.tween_interval(delay)
        tw.tween_property(child, "modulate:a", 1.0, 0.4)
        tw.parallel().tween_property(child, "scale", Vector2(1, 1), 0.4)
        delay += 0.05

func _on_hunt_pressed():
    var monster_id = 6001 # Fallback
    if current_region_data and current_region_data.has("monsters"):
        var monsters = current_region_data.get("monsters", [])
        if monsters is Array and monsters.size() > 0:
            monster_id = int(monsters[0].get("id", 6001))
    
    GameState.target_monster_id = monster_id
    get_tree().change_scene_to_file("res://src/ui/CombatScreen.tscn")

func _on_gather_pressed(resource_id: int, btn: Button):
    _last_clicked_button = btn
    if GameState.current_user and GameState.current_heroes.size() > 0:
        var uid = GameState.current_user.get("id")
        var hid = GameState.current_heroes[0].get("id")
        if uid and hid:
            ServerConnector.gather(int(uid), int(hid), resource_id)
            if is_instance_valid(subtitle_label):
                subtitle_label.text = "Extracting..."
                subtitle_label.add_theme_color_override("font_color", Color.CYAN)
    else:
        if is_instance_valid(subtitle_label):
            subtitle_label.text = "Fetching heroes..."
        if GameState.current_user:
            var uid = GameState.current_user.get("id")
            if uid: ServerConnector.fetch_heroes(int(uid))

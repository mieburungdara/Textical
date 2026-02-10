extends Control

## Codex_Achievements - SRP Component
## Display unlocked achievements as a tab in the Codex from server data.

@onready var achievement_list = %AchievementList

func setup_as_overlay(_data: Dictionary = {}):
    var parent = get_parent()
    if parent is TabContainer:
        if has_node("Background"): $Background.visible = false
        if has_node("MarginContainer/VBoxContainer/Header"): 
            $MarginContainer/VBoxContainer/Header.visible = false
        if has_node("MarginContainer"):
            $MarginContainer.offset_left = 0
            $MarginContainer.offset_right = 0
            $MarginContainer.offset_top = 0
            $MarginContainer.offset_bottom = 0
    else:
        if has_node("MarginContainer"):
            $MarginContainer.offset_left = 160
            $MarginContainer.offset_right = -40
            $MarginContainer.offset_top = 40
            $MarginContainer.offset_bottom = -40

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    _populate_achievements(GameState.get_unread_achievements())

func refresh():
    if GameState.current_user:
        ServerConnector.fetch_achievements(GameState.current_user.id)

func _on_request_completed(endpoint: String, response):
    if endpoint.contains("/achievements"):
        var data = response.get("data", response) if response is Dictionary else response
        if data is Array:
            _populate_achievements(data)

func _populate_achievements(achievements: Array):
    if not achievement_list: return
    for child in achievement_list.get_children(): child.queue_free()
    
    if achievements.is_empty():
        var lbl = Label.new()
        lbl.text = "No achievements recorded yet."
        lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        achievement_list.add_child(lbl)
        return
    
    for ach in achievements:
        var card = _create_achievement_card(ach)
        achievement_list.add_child(card)

func _create_achievement_card(ach: Dictionary) -> Control:
    var panel = PanelContainer.new()
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0.12, 0.1, 0.08, 0.9)
    style.border_width_left = 4
    style.border_color = Color(0.8, 0.7, 0.2) if ach.get("unlocked", false) else Color(0.3, 0.3, 0.3)
    style.content_margin_left = 15
    style.content_margin_right = 15
    style.content_margin_top = 10
    style.content_margin_bottom = 10
    style.corner_radius_top_right = 6
    style.corner_radius_bottom_right = 6
    panel.add_theme_stylebox_override("panel", style)
    
    var hbox = HBoxContainer.new()
    hbox.add_theme_constant_override("separation", 15)
    
    var icon_lbl = Label.new()
    icon_lbl.text = ach.get("icon", "🏆")
    icon_lbl.add_theme_font_size_override("font_size", 24)
    
    var vbox = VBoxContainer.new()
    vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    
    var name_lbl = Label.new()
    name_lbl.text = ach.get("name", "Unknown Achievement").to_upper()
    name_lbl.add_theme_font_size_override("font_size", 16)
    name_lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.8))
    
    var desc_lbl = Label.new()
    desc_lbl.text = ach.get("description", "No details.")
    desc_lbl.add_theme_font_size_override("font_size", 12)
    desc_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
    
    vbox.add_child(name_lbl)
    vbox.add_child(desc_lbl)
    
    hbox.add_child(icon_lbl)
    hbox.add_child(vbox)
    
    if ach.get("unlocked", false):
        var status_lbl = Label.new()
        status_lbl.text = "UNLOCKED"
        status_lbl.add_theme_font_size_override("font_size", 10)
        status_lbl.add_theme_color_override("font_color", Color(0.4, 0.8, 0.4))
        hbox.add_child(status_lbl)
    
    panel.add_child(hbox)
    return panel

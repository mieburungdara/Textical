extends Control

@onready var merc_list = $MarginContainer/MainBoard/VBoxContainer/ScrollContainer/MercList
@onready var status_label = $MarginContainer/MainBoard/VBoxContainer/StatusArea/StatusLabel

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    refresh()
func refresh():
    if GameState.current_user:
        ServerConnector.get_mercenaries(GameState.current_user.id)

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if "tavern/mercenaries" in endpoint:        _populate_mercs(data)
    elif "tavern/recruit" in endpoint:
        status_label.text = "Recruitment Successful!"
        status_label.add_theme_color_override("font_color", Color.GREEN)
        refresh()
        if GameState.current_user:
            ServerConnector.fetch_profile(GameState.current_user.id)
    elif "tavern/exit" in endpoint:
        get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")

func _populate_mercs(mercs):
    for child in merc_list.get_children():
        child.queue_free()
    
    if mercs.size() == 0:
        var l = Label.new()
        l.text = "Empty tavern... Check back later."
        l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        l.modulate = Color(0.6, 0.6, 0.6)
        merc_list.add_child(l)
        return

    for merc in mercs:
        # 1. Card Container (Kertas Perkamen)
        var card = PanelContainer.new()
        var style = StyleBoxFlat.new()
        style.bg_color = Color(0.85, 0.8, 0.7) # Cream Parchment
        style.corner_radius_top_left = 5
        style.corner_radius_top_right = 5
        style.corner_radius_bottom_left = 5
        style.corner_radius_bottom_right = 5
        style.border_width_left = 8
        style.border_color = Color(0.4, 0.3, 0.2) # Wood accent border
        style.shadow_color = Color(0, 0, 0, 0.3)
        style.shadow_size = 6
        style.shadow_offset = Vector2(0, 4)
        style.content_margin_left = 12
        style.content_margin_right = 15
        style.content_margin_top = 10
        style.content_margin_bottom = 10
        card.add_theme_stylebox_override("panel", style)
        
        var hbox = HBoxContainer.new()
        hbox.add_theme_constant_override("separation", 15)
        
        # 2. Avatar Placeholder (Lingkaran Class)
        var avatar_bg = PanelContainer.new()
        avatar_bg.custom_minimum_size = Vector2(85, 85)
        var av_style = StyleBoxFlat.new()
        av_style.bg_color = Color(0.2, 0.15, 0.1)
        av_style.corner_radius_top_left = 42
        av_style.corner_radius_top_right = 42
        av_style.corner_radius_bottom_left = 42
        av_style.corner_radius_bottom_right = 42
        av_style.border_width_left = 3
        av_style.border_width_top = 3
        av_style.border_width_right = 3
        av_style.border_width_bottom = 3
        av_style.border_color = Color(0.6, 0.5, 0.3)
        avatar_bg.add_theme_stylebox_override("panel", av_style)
        
        var av_text = Label.new()
        av_text.text = merc.hero.combatClass.name[0].to_upper()
        av_text.add_theme_font_size_override("font_size", 32)
        av_text.add_theme_color_override("font_color", Color(1, 0.8, 0.4))
        av_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        av_text.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
        avatar_bg.add_child(av_text)
        
        # 3. Info Side (Teks Gelap di Kertas Terang)
        var info_vbox = VBoxContainer.new()
        info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        info_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
        
        var name_label = Label.new()
        name_label.text = merc.hero.name
        name_label.add_theme_color_override("font_color", Color(0.2, 0.1, 0)) # Dark Brown
        name_label.add_theme_font_size_override("font_size", 26)
        
        var class_label = Label.new()
        var hero_class = merc.hero.combatClass.name
        class_label.text = "Lv.%d %s" % [merc.hero.level, hero_class]
        class_label.add_theme_color_override("font_color", Color(0.4, 0.3, 0.2))
        class_label.add_theme_font_size_override("font_size", 18)
        
        info_vbox.add_child(name_label)
        info_vbox.add_child(class_label)
        
        # 4. Action Side (Hire)
        var action_vbox = VBoxContainer.new()
        action_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
        
        var price_hbox = HBoxContainer.new()
        price_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
        price_hbox.add_theme_constant_override("separation", 5)
        
        var price_label = Label.new()
        price_label.text = str(merc.recruitmentCost)
        price_label.add_theme_color_override("font_color", Color(0.1, 0.4, 0.1)) # Dark Green for cost on paper
        price_label.add_theme_font_size_override("font_size", 22)
        
        var g_label = Label.new()
        g_label.text = "G"
        g_label.add_theme_color_override("font_color", Color(0.4, 0.3, 0))
        g_label.add_theme_font_size_override("font_size", 16)
        
        price_hbox.add_child(price_label)
        price_hbox.add_child(g_label)
        
        var btn = Button.new()
        btn.text = "HIRE"
        btn.custom_minimum_size = Vector2(130, 65)
        
        var btn_style = StyleBoxFlat.new()
        btn_style.bg_color = Color(0.15, 0.3, 0.15)
        btn_style.corner_radius_top_left = 10
        btn_style.corner_radius_top_right = 10
        btn_style.corner_radius_bottom_left = 10
        btn_style.corner_radius_bottom_right = 10
        btn_style.border_width_bottom = 4
        btn_style.border_color = Color(0.05, 0.15, 0.05)
        
        var btn_press = btn_style.duplicate()
        btn_press.border_width_bottom = 0
        btn_press.bg_color = Color(0.2, 0.4, 0.2)
        
        btn.add_theme_stylebox_override("normal", btn_style)
        btn.add_theme_stylebox_override("pressed", btn_press)
        btn.add_theme_stylebox_override("hover", btn_style)
        
        btn.pressed.connect(func(): _on_recruit_pressed(merc.id))
        
        action_vbox.add_child(price_hbox)
        action_vbox.add_child(btn)
        
        hbox.add_child(avatar_bg)
        hbox.add_child(info_vbox)
        hbox.add_child(action_vbox)
        card.add_child(hbox)
        merc_list.add_child(card)

func _on_recruit_pressed(merc_id):
    status_label.text = "Processing recruitment..."
    status_label.add_theme_color_override("font_color", Color.WHITE)
    if GameState.current_user:
        ServerConnector.recruit(GameState.current_user.id, merc_id)

func _on_exit_pressed():
    if GameState.current_user:
        ServerConnector.exit_tavern(GameState.current_user.id)

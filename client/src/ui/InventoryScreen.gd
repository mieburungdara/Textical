extends Control

@onready var grid = $Main/GridFrame/Margin/Grid
@onready var capacity_label = $Main/Header/Weight/Label
@onready var progress_bar = $Main/Header/Weight/Bar
@onready var item_name = $Main/Details/VBox/ItemName
@onready var item_desc = $Main/Details/VBox/ItemDesc
@onready var stats_label = $Main/Details/VBox/Stats

var _inventory_data = []
var _current_max_slots = 20 # Default base (5x4)

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    refresh()

func refresh():
    if GameState.current_user:
        ServerConnector.fetch_inventory(GameState.current_user.id)

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if "inventory" in endpoint:
        if data is Dictionary:
            _inventory_data = data.get("items", [])
            _update_capacity(data.get("status", {}))
            # Sync slot count with what the server tells us
            _current_max_slots = data.get("status", {}).get("max", 20)
            _populate_grid()

func _update_capacity(status):
    var used = status.get("used", 0)
    var max_slots = status.get("max", 20)
    capacity_label.text = "%d / %d" % [used, max_slots]
    progress_bar.max_value = max_slots
    var tw = create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    tw.tween_property(progress_bar, "value", float(used), 0.4)

func _populate_grid():
    for child in grid.get_children(): child.queue_free()
    
    # DYNAMIC SLOT GENERATION:
    # Will render 20 slots (5x4) for standard, or 25 slots (5x5) for premium
    for i in range(_current_max_slots):
        var slot_node = _create_ghost_slot()
        grid.add_child(slot_node)
        
        if i < _inventory_data.size():
            _fill_slot(slot_node, _inventory_data[i])
        
        _animate_slot_appearance(slot_node, i * 0.015)

func _create_ghost_slot() -> Control:
    var slot = PanelContainer.new()
    slot.custom_minimum_size = Vector2(110, 110) # Slightly smaller to fit 5 wide
    
    var style = StyleBoxFlat.new()
    style.bg_color = Color(1, 1, 1, 0.03)
    style.border_width_left = 1
    style.border_width_top = 1
    style.border_width_right = 1
    style.border_width_bottom = 1
    style.border_color = Color(1, 1, 1, 0.05)
    style.corner_radius_top_left = 12
    style.corner_radius_top_right = 12
    style.corner_radius_bottom_right = 12
    style.corner_radius_bottom_left = 12
    slot.add_theme_stylebox_override("panel", style)
    
    return slot

func _fill_slot(slot: Control, item):
    var btn = Button.new()
    btn.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    btn.flat = true
    btn.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
    slot.add_child(btn)
    
    var icon = Label.new()
    icon.text = _get_item_emoji(item.template.name)
    icon.add_theme_font_size_override("font_size", 44)
    icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    icon.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    icon.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    btn.add_child(icon)
    
    var rarity = item.template.get("rarity", "COMMON")
    var rarity_color = _get_rarity_color(rarity)
    if rarity != "COMMON":
        var glow = ColorRect.new()
        glow.custom_minimum_size = Vector2(30, 30)
        glow.color = rarity_color
        glow.color.a = 0.15
        glow.position = Vector2(40, 40)
        btn.add_child(glow)
        btn.move_child(glow, 0)
    
    if item.quantity > 1:
        var q_lbl = Label.new()
        q_lbl.text = str(item.quantity)
        q_lbl.add_theme_font_size_override("font_size", 14)
        q_lbl.add_theme_color_override("font_color", Color.GOLD)
        q_lbl.position = Vector2(80, 80)
        btn.add_child(q_lbl)
    
    btn.pressed.connect(func(): _show_details(item, btn))
    btn.mouse_entered.connect(func(): _animate_hover(btn, true, rarity_color))
    btn.mouse_exited.connect(func(): _animate_hover(btn, false, rarity_color))

func _animate_hover(node, is_hover, color):
    var tw = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
    if is_hover:
        tw.tween_property(node, "scale", Vector2(1.1, 1.1), 0.15)
        tw.parallel().tween_property(node, "modulate", color.lerp(Color.WHITE, 0.5), 0.15)
    else:
        tw.tween_property(node, "scale", Vector2(1.0, 1.0), 0.15)
        tw.parallel().tween_property(node, "modulate", Color.WHITE, 0.15)

func _show_details(item, btn):
    item_name.text = item.template.name.to_upper()
    item_desc.text = item.template.description
    
    var stats = ""
    if item.template.has("stats") and item.template.stats.size() > 0:
        for s in item.template.stats:
            stats += "%s: +%d  " % [s.statKey.to_upper(), int(s.statValue)]
    else:
        stats = "A valuable item found in the wilds."
    stats_label.text = stats
    
    var tw = create_tween()
    tw.tween_property(btn, "scale", Vector2(0.9, 0.9), 0.05)
    tw.tween_property(btn, "scale", Vector2(1.1, 1.1), 0.1)

func _animate_slot_appearance(slot, delay):
    slot.modulate.a = 0
    var tw = create_tween()
    tw.tween_interval(delay)
    tw.tween_property(slot, "modulate:a", 1.0, 0.2)

func _get_rarity_color(rarity) -> Color:
    match rarity:
        "RARE": return Color(1.0, 0.8, 0.2)
        "EPIC": return Color(0.8, 0.4, 1.0)
        "LEGENDARY": return Color(1.0, 0.4, 0.2)
        _: return Color(0.4, 0.6, 0.8)

func _get_item_emoji(item_name: String) -> String:
    item_name = item_name.to_lower()
    if "sword" in item_name: return "⚔️"
    if "bow" in item_name: return "🏹"
    if "potion" in item_name: return "🧪"
    if "wood" in item_name: return "🪵"
    if "ore" in item_name or "stone" in item_name: return "🪨"
    if "crystal" in item_name: return "💎"
    if "herb" in item_name or "leaf" in item_name: return "🌿"
    return "📦"

extends Control

@onready var grid = $MarginContainer/MainFrame/VBoxContainer/ScrollContainer/GridContainer
@onready var status_label = $MarginContainer/MainFrame/VBoxContainer/CapacityArea/StatusLabel
@onready var progress_bar = $MarginContainer/MainFrame/VBoxContainer/CapacityArea/ProgressBar

# Details Panel Nodes
@onready var detail_name = $MarginContainer/MainFrame/VBoxContainer/DetailsPanel/VBox/ItemName
@onready var detail_desc = $MarginContainer/MainFrame/VBoxContainer/DetailsPanel/VBox/ItemDescription
@onready var detail_stats = $MarginContainer/MainFrame/VBoxContainer/DetailsPanel/VBox/StatsLabel

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    refresh()

func refresh():
    if GameState.inventory.size() > 0 and not GameState.inventory_is_dirty:
        _populate_grid()
        return
        
    if GameState.current_user:
        ServerConnector.fetch_inventory(GameState.current_user.id)
func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if "inventory" in endpoint and data is Dictionary and data.has("items"):
        GameState.set_inventory(data)
        _populate_grid()

func _populate_grid():
    for child in grid.get_children(): child.queue_free()
    
    var used = GameState.inventory_status.used
    var max_slots = GameState.inventory_status.max
    
    status_label.text = "Capacity: %d / %d" % [used, max_slots]
    progress_bar.max_value = max_slots
    progress_bar.value = used
    
    var last_selected_data = null
    
    # 1. Fill Actual Items
    for item in GameState.inventory:
        var slot = _create_item_slot(item)
        grid.add_child(slot)
        if item.id == GameState.last_selected_item_id:
            last_selected_data = item
    
    # 2. Fill Empty Placeholder Slots
    var remaining = max_slots - used
    for i in range(remaining):
        var empty_slot = _create_empty_slot()
        grid.add_child(empty_slot)
        
    # Restore selection
    if last_selected_data:
        _show_details(last_selected_data)

func _create_item_slot(item):
    var btn = Button.new()
    btn.custom_minimum_size = Vector2(120, 120)
    
    var template = item.get("template", {})
    var rarity = template.get("rarity", "COMMON")
    var color = _get_rarity_color(rarity)
    
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0.1, 0.1, 0.2, 0.8)
    style.border_width_left = 3
    style.border_width_top = 3
    style.border_width_right = 3
    style.border_width_bottom = 3
    style.border_color = color
    style.corner_radius_top_left = 10
    style.corner_radius_top_right = 10
    style.corner_radius_bottom_left = 10
    style.corner_radius_bottom_right = 10
    
    btn.add_theme_stylebox_override("normal", style)
    
    # PRESS FEEDBACK
    var pressed_style = style.duplicate()
    pressed_style.border_color = Color.WHITE # Glow effect
    btn.add_theme_stylebox_override("pressed", pressed_style)
    
    # Label Qty
    var qty_lbl = Label.new()
    qty_lbl.text = "x%d" % item.get("quantity", 1)
    qty_lbl.add_theme_font_size_override("font_size", 18)
    qty_lbl.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT, Control.PRESET_MODE_MINSIZE, 10)
    btn.add_child(qty_lbl)
    
    # Class Initial (Visual shortcut)
    var initial_lbl = Label.new()
    initial_lbl.text = template.get("name", "?")[0].to_upper()
    initial_lbl.add_theme_font_size_override("font_size", 32)
    initial_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    initial_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    initial_lbl.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    initial_lbl.modulate = Color(1, 1, 1, 0.3)
    btn.add_child(initial_lbl)
    
    # CONNECT CLICK
    btn.pressed.connect(func(): _show_details(item))
    
    return btn

func _show_details(item):
    GameState.last_selected_item_id = item.id
    var template = item.get("template", {})
    var rarity = template.get("rarity", "COMMON")
    var color_hex = _get_rarity_color(rarity).to_html(false)
    
    detail_name.text = "[center][b][color=#%s]%s[/color][/b][/center]" % [color_hex, template.get("name", "Unknown")]
    detail_desc.text = template.get("description", "No lore available for this item.")
    
    # Build Stats Text
    var stats = template.get("stats", [])
    if stats.size() > 0:
        var stat_txt = "Stats: "
        for s in stats:
            stat_txt += "%s +%d  " % [s.statKey.to_upper(), s.statValue]
        detail_stats.text = stat_txt
    else:
        detail_stats.text = "Stats: None"

func _get_rarity_color(rarity):
    match rarity:
        "RARE": return Color(1.0, 0.8, 0.2) # Gold
        "EPIC": return Color(0.8, 0.4, 1.0) # Purple
        "LEGENDARY": return Color(1.0, 0.4, 0.2) # Orange
        _: return Color(0.4, 0.6, 0.8) # Common (Blue-ish)

func _create_empty_slot():
    var panel = Panel.new()
    panel.custom_minimum_size = Vector2(120, 120)
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0, 0, 0, 0.2)
    style.border_width_left = 2
    style.border_width_top = 2
    style.border_width_right = 2
    style.border_width_bottom = 2
    style.border_color = Color(1, 1, 1, 0.05)
    style.corner_radius_top_left = 10
    style.corner_radius_top_right = 10
    style.corner_radius_bottom_left = 10
    style.corner_radius_bottom_right = 10
    panel.add_theme_stylebox_override("panel", style)
    return panel

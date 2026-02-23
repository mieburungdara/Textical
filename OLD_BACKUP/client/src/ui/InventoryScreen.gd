extends Control

## InventoryScreen - "The Grand Archive" Redesign
## Optimized for 1300x600 resolution with category filtering, sorting, search, and enhanced visual detail.

# === NODE REFERENCES ===
@onready var grid = %Grid
@onready var capacity_label = %Capacity
@onready var progress_bar = %Bar
@onready var category_header = %CategoryHeader

@onready var main_vbox = %MainVBox
@onready var empty_state = %EmptyState
@onready var item_icon = %ItemIcon
@onready var rarity_badge = %RarityBadge
@onready var item_name = %ItemName
@onready var item_desc = %DescLabel
@onready var stats_label = %StatsLabel
@onready var equip_btn = %EquipBtn
@onready var use_btn = %UseBtn
@onready var drop_btn = %DropBtn
@onready var actions_container = %Actions
@onready var right_panel = %RightPanel

# Search and Sort UI (dynamically created)
var _search_input: LineEdit
var _sort_dropdown: OptionButton
var _search_panel: HBoxContainer

# Treasure Map data
var _treasure_maps: Array = []
var _treasure_handler: Node = null

# === PRIVATE VARIABLES ===
var _inventory_data = []
var _filtered_data = []
var _current_max_slots = 20
var _selected_item = null
var _selected_slot = null
var _current_category = "All"
var _current_sort = "name_asc"
var _search_text = ""

var _style_tab_normal: StyleBoxFlat
var _style_tab_active: StyleBoxFlat

# Rarity sort order
var _rarity_order = {
    "COMMON": 0,
    "UNCOMMON": 1,
    "RARE": 2,
    "EPIC": 3,
    "LEGENDARY": 4,
    "MYTHIC": 5
}

# === Lifecycle Methods ===

func _ready():
    _setup_styles()
    _setup_search_sort_ui()
    _setup_treasure_handler()
    _add_maps_category_button()
    _connect_signals()
    _show_initial_state()
    refresh()

func _setup_treasure_handler():
    # Get or create treasure map handler
    if has_node("/root/TreasureMapHandler"):
        _treasure_handler = get_node("/root/TreasureMapHandler")
    else:
        # Create handler if not exists
        _treasure_handler = preload("res://src/network/TreasureMapHandler.gd").new()
        _treasure_handler.name = "TreasureMapHandler"
        get_tree().root.add_child(_treasure_handler)
    
    # Connect treasure handler signals
    if _treasure_handler and _treasure_handler.has_signal("maps_updated"):
        _treasure_handler.maps_updated.connect(_on_treasure_maps_updated)
        _treasure_handler.map_used.connect(_on_treasure_map_used)
        _treasure_handler.error_occurred.connect(_on_treasure_error)

func _add_maps_category_button():
    # Add MAPS button to category header
    var maps_btn = Button.new()
    maps_btn.name = "Maps"
    maps_btn.text = "MAPS"
    maps_btn.focus_mode = 0
    maps_btn.add_theme_stylebox_override("normal", _style_tab_normal)
    maps_btn.pressed.connect(_on_category_pressed.bind("Maps"))
    category_header.add_child(maps_btn)

func _setup_styles():
    _style_tab_normal = StyleBoxFlat.new()
    _style_tab_normal.bg_color = Color(1, 1, 1, 0.03)
    _style_tab_normal.corner_radius_top_left = 8
    _style_tab_normal.corner_radius_top_right = 8
    _style_tab_normal.content_margin_left = 12
    _style_tab_normal.content_margin_top = 6
    _style_tab_normal.content_margin_right = 12
    _style_tab_normal.content_margin_bottom = 6
        
    _style_tab_active = StyleBoxFlat.new()
    _style_tab_active.bg_color = Color(0.85, 0.65, 0.3, 0.15)
    _style_tab_active.border_width_left = 1
    _style_tab_active.border_width_top = 1
    _style_tab_active.border_width_right = 1
    _style_tab_active.border_width_bottom = 1
    _style_tab_active.border_color = Color(0.85, 0.65, 0.3, 0.6)
    _style_tab_active.corner_radius_top_left = 8
    _style_tab_active.corner_radius_top_right = 8
    _style_tab_active.content_margin_left = 12
    _style_tab_active.content_margin_top = 6
    _style_tab_active.content_margin_right = 12
    _style_tab_active.content_margin_bottom = 6

func _setup_search_sort_ui():
    # Create search and sort panel
    _search_panel = HBoxContainer.new()
    _search_panel.add_theme_constant_override("separation", 10)
    
    # Search input
    _search_input = LineEdit.new()
    _search_input.placeholder_text = "Search items..."
    _search_input.custom_minimum_size = Vector2(200, 32)
    _search_input.text_changed.connect(_on_search_text_changed)
    
    var search_style = StyleBoxFlat.new()
    search_style.bg_color = Color(0.1, 0.08, 0.06, 0.8)
    search_style.border_width_left = 1
    search_style.border_width_top = 1
    search_style.border_width_right = 1
    search_style.border_width_bottom = 1
    search_style.border_color = Color(0.5, 0.4, 0.3, 0.3)
    search_style.corner_radius_top_left = 6
    search_style.corner_radius_top_right = 6
    search_style.corner_radius_bottom_right = 6
    search_style.corner_radius_bottom_left = 6
    _search_input.add_theme_stylebox_override("normal", search_style)
    _search_input.add_theme_color_override("font_color", Color(0.9, 0.85, 0.75))
    _search_input.add_theme_color_override("font_placeholder_color", Color(0.5, 0.45, 0.4))
    
    # Sort dropdown
    _sort_dropdown = OptionButton.new()
    _sort_dropdown.custom_minimum_size = Vector2(150, 32)
    _sort_dropdown.item_selected.connect(_on_sort_changed)
    
    var sort_style = StyleBoxFlat.new()
    sort_style.bg_color = Color(0.1, 0.08, 0.06, 0.8)
    sort_style.border_width_left = 1
    sort_style.border_width_top = 1
    sort_style.border_width_right = 1
    sort_style.border_width_bottom = 1
    sort_style.border_color = Color(0.5, 0.4, 0.3, 0.3)
    sort_style.corner_radius_top_left = 6
    sort_style.corner_radius_top_right = 6
    sort_style.corner_radius_bottom_right = 6
    sort_style.corner_radius_bottom_left = 6
    _sort_dropdown.add_theme_stylebox_override("normal", sort_style)
    _sort_dropdown.add_theme_color_override("font_color", Color(0.9, 0.85, 0.75))
    
    # Add sort options
    _sort_dropdown.add_item("Name (A-Z)", 0)
    _sort_dropdown.add_item("Name (Z-A)", 1)
    _sort_dropdown.add_item("Rarity (High)", 2)
    _sort_dropdown.add_item("Rarity (Low)", 3)
    _sort_dropdown.add_item("Quality (High)", 4)
    _sort_dropdown.add_item("Quality (Low)", 5)
    _sort_dropdown.add_item("Type", 6)
    _sort_dropdown.select(0)
    
    # Add spacer
    var spacer = Control.new()
    spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    
    _search_panel.add_child(_search_input)
    _search_panel.add_child(spacer)
    _search_panel.add_child(_sort_dropdown)
    
    # Add to CategoryHeader (after the category buttons)
    if category_header and category_header.get_parent():
        var parent = category_header.get_parent()
        parent.add_child(_search_panel)
        # Move to after category_header
        var header_idx = parent.get_child_count() - 1
        if header_idx > 0:
            parent.move_child(_search_panel, header_idx)

func _on_search_text_changed(text: String):
    _search_text = text.to_lower()
    _apply_filter()

func _on_sort_changed(index: int):
    match index:
        0: _current_sort = "name_asc"
        1: _current_sort = "name_desc"
        2: _current_sort = "rarity_desc"
        3: _current_sort = "rarity_asc"
        4: _current_sort = "quality_desc"
        5: _current_sort = "quality_asc"
        6: _current_sort = "type"
    _apply_filter()

func _connect_signals():
    ServerConnector.request_completed.connect(_on_request_completed)
    
    # Action buttons
    equip_btn.pressed.connect(_on_equip_pressed)
    use_btn.pressed.connect(_on_use_pressed)
    drop_btn.pressed.connect(_on_drop_pressed)
    
    # Detail panel close
    if has_node("%DetailCloseBtn"):
        %DetailCloseBtn.pressed.connect(_on_close_details_pressed)
    
    # Category buttons - check if already connected before connecting
    for btn in category_header.get_children():
        if btn is Button:
            if not btn.pressed.is_connected(_on_category_pressed):
                btn.pressed.connect(_on_category_pressed.bind(btn.name))

# === PUBLIC METHODS ===

func setup_as_overlay(_data: Dictionary = {}):
    # Beri margin agar tidak menabrak SideHUD di kiri
    if has_node("MainContainer"):
        $MainContainer.offset_left = 160
        $MainContainer.offset_right = -40
        $MainContainer.offset_top = 40
        $MainContainer.offset_bottom = -40

func refresh():
    if GameState.current_user:
        var uid = GameState.current_user.get("id")
        if uid: 
            ServerConnector.fetch_inventory(int(uid))

# === PRIVATE LOGIC ===

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    
    var is_inv_action = "inventory/discard" in endpoint or "inventory/use" in endpoint or "action/equip" in endpoint or "action/unequip" in endpoint
    
    if is_inv_action:
        print("[INVENTORY] Action successful: %s, refreshing..." % endpoint)
        
        # Reset button states
        drop_btn.disabled = false
        drop_btn.text = "DISCARD"
        use_btn.disabled = false
        use_btn.text = "USE ITEM"
        equip_btn.disabled = false
        equip_btn.text = "EQUIP RELIC"
        
        # Hide details since item state has changed
        _on_close_details_pressed()
        refresh() # Full refresh from server
        return

    if "inventory" in endpoint:
        var inv_payload = data
        if data is Dictionary and data.has("data"):
            inv_payload = data.get("data")
            
        if inv_payload is Dictionary and inv_payload.has("items"):
            _inventory_data = inv_payload.get("items", [])
            var status = inv_payload.get("status", {})
            _current_max_slots = status.get("max", 20)
            _update_capacity(status)
            _apply_filter()
        else:
            _inventory_data = GameState.inventory
            _current_max_slots = GameState.inventory_status.get("max", 20)
            _update_capacity(GameState.inventory_status)
            _apply_filter()

func _update_capacity(status):
    var used = status.get("used", 0)
    var max_slots = status.get("max", 20)
    capacity_label.text = "PACK CAPACITY: %d / %d" % [used, max_slots]
    progress_bar.max_value = max_slots
    var tw = create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    tw.tween_property(progress_bar, "value", float(used), 0.4)

func _on_category_pressed(category: String):
    _current_category = category
    
    for btn in category_header.get_children():
        if btn is Button:
            if btn.name == category:
                btn.add_theme_stylebox_override("normal", _style_tab_active)
                btn.add_theme_color_override("font_color", Color(1, 0.9, 0.6))
            else:
                btn.add_theme_stylebox_override("normal", _style_tab_normal)
                btn.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
    
    _apply_filter()

func _apply_filter():
    # First filter by category
    if _current_category == "All":
        _filtered_data = _inventory_data.duplicate()
    elif _current_category == "Maps":
        # Show treasure maps from server
        _fetch_treasure_maps()
        return # Don't populate grid yet, wait for data
    else:
        _filtered_data = []
        for item in _inventory_data:
            var template = item.get("template", {})
            var type = template.get("category", "MISC").to_upper()
            var target = _current_category.to_upper()
            
            if target == "CONSUMABLE" and type == "CONSUMABLE": _filtered_data.append(item)
            elif target == "EQUIPMENT" and type in ["WEAPON", "ARMOR", "HELMET", "ACCESSORY"]: _filtered_data.append(item)
            elif target == "MATERIAL" and type == "MATERIAL": _filtered_data.append(item)
            elif target == type: _filtered_data.append(item)
    
    # Apply search filter
    if _search_text != "":
        var search_results = []
        for item in _filtered_data:
            var template = item.get("template", {})
            var name = template.get("name", "").to_lower()
            if _search_text in name:
                search_results.append(item)
        _filtered_data = search_results
    
    # Apply sorting
    _filtered_data = _sort_items(_filtered_data)
    
    _populate_grid()

func _sort_items(items: Array) -> Array:
    if items.is_empty():
        return items
    
    var sorted_items = items.duplicate()
    
    match _current_sort:
        "name_asc":
            sorted_items.sort_custom(func(a, b):
                var name_a = a.get("template", {}).get("name", "").to_lower()
                var name_b = b.get("template", {}).get("name", "").to_lower()
                return name_a < name_b
            )
        "name_desc":
            sorted_items.sort_custom(func(a, b):
                var name_a = a.get("template", {}).get("name", "").to_lower()
                var name_b = b.get("template", {}).get("name", "").to_lower()
                return name_a > name_b
            )
        "rarity_desc":
            sorted_items.sort_custom(func(a, b):
                var rarity_a = _rarity_order.get(a.get("template", {}).get("rarity", "COMMON"), 0)
                var rarity_b = _rarity_order.get(b.get("template", {}).get("rarity", "COMMON"), 0)
                return rarity_a > rarity_b
            )
        "rarity_asc":
            sorted_items.sort_custom(func(a, b):
                var rarity_a = _rarity_order.get(a.get("template", {}).get("rarity", "COMMON"), 0)
                var rarity_b = _rarity_order.get(b.get("template", {}).get("rarity", "COMMON"), 0)
                return rarity_a < rarity_b
            )
        "quality_desc":
            sorted_items.sort_custom(func(a, b):
                var quality_a = a.get("quality", 100)
                var quality_b = b.get("quality", 100)
                return quality_a > quality_b
            )
        "quality_asc":
            sorted_items.sort_custom(func(a, b):
                var quality_a = a.get("quality", 100)
                var quality_b = b.get("quality", 100)
                return quality_a < quality_b
            )
        "type":
            sorted_items.sort_custom(func(a, b):
                var type_a = a.get("template", {}).get("category", "MISC").to_lower()
                var type_b = b.get("template", {}).get("category", "MISC").to_lower()
                if type_a == type_b:
                    var name_a = a.get("template", {}).get("name", "").to_lower()
                    var name_b = b.get("template", {}).get("name", "").to_lower()
                    return name_a < name_b
                return type_a < type_b
            )
    
    return sorted_items

func _populate_grid():
    for child in grid.get_children(): child.queue_free()
    
    for i in range(_filtered_data.size()):
        var slot = _create_slot_node()
        grid.add_child(slot)
        _fill_slot(slot, _filtered_data[i])
        _animate_slot_appearance(slot, i * 0.01)
    
    var empty_to_add = _current_max_slots - _filtered_data.size()
    if empty_to_add > 0:
        for i in range(empty_to_add):
            grid.add_child(_create_slot_node())

func _create_slot_node() -> Control:
    var slot = PanelContainer.new()
    slot.custom_minimum_size = Vector2(80, 80)
    
    var style = StyleBoxFlat.new()
    style.bg_color = Color(1, 1, 1, 0.02)
    style.border_width_left = 1
    style.border_width_top = 1
    style.border_width_right = 1
    style.border_width_bottom = 1
    style.border_color = Color(1, 1, 1, 0.04)
    style.corner_radius_top_left = 10
    style.corner_radius_top_right = 10
    style.corner_radius_bottom_right = 10
    style.corner_radius_bottom_left = 10
    slot.add_theme_stylebox_override("panel", style)
    
    return slot

func _fill_slot(slot: Control, item):
    var btn = Button.new()
    btn.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    btn.flat = true
    btn.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
    slot.add_child(btn)
    
    var template = item.get("template", {})
    var map_data = item.get("treasure_map_data", {})
    
    # Use treasure map emoji if it's a treasure map
    var icon_text = ""
    if map_data.size() > 0:
        icon_text = "🗺️"
    else:
        icon_text = _get_item_emoji(template.get("name", "Unknown"))
    
    var icon = Label.new()
    icon.text = icon_text
    icon.add_theme_font_size_override("font_size", 34)
    icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    icon.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    icon.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    btn.add_child(icon)
    
    var rarity = template.get("rarity", "COMMON")
    # Use treasure map rarity if available
    if map_data.size() > 0:
        rarity = map_data.get("rarity", "COMMON")
    var rarity_color = _get_rarity_color(rarity)
    
    if rarity != "COMMON":
        var glow = Panel.new()
        var glow_style = StyleBoxFlat.new()
        glow_style.bg_color = rarity_color
        glow_style.bg_color.a = 0.08
        glow_style.corner_radius_top_left = 10
        glow_style.corner_radius_top_right = 10
        glow_style.corner_radius_bottom_right = 10
        glow_style.corner_radius_bottom_left = 10
        glow_style.shadow_color = rarity_color
        glow_style.shadow_color.a = 0.15
        glow_style.shadow_size = 6
        glow.add_theme_stylebox_override("panel", glow_style)
        glow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
        glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
        btn.add_child(glow)
        btn.move_child(glow, 0)
    
    var qty = item.get("quantity", 1)
    if qty > 1:
        var q_lbl = Label.new()
        q_lbl.text = str(qty)
        q_lbl.add_theme_font_size_override("font_size", 11)
        q_lbl.add_theme_color_override("font_color", Color.WHITE)
        q_lbl.add_theme_constant_override("outline_size", 3)
        q_lbl.add_theme_color_override("outline_color", Color.BLACK)
        q_lbl.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
        q_lbl.offset_left = -25
        q_lbl.offset_top = -20
        btn.add_child(q_lbl)
    
    # Quality indicator (shown as small badge in top-left)
    var quality = item.get("quality", 100)
    if quality > 100:
        var quality_lbl = Label.new()
        quality_lbl.text = "+" + str(quality - 100)
        quality_lbl.add_theme_font_size_override("font_size", 10)
        quality_lbl.add_theme_color_override("font_color", Color(1, 0.8, 0.2))
        quality_lbl.add_theme_constant_override("outline_size", 2)
        quality_lbl.add_theme_color_override("outline_color", Color(0.2, 0.15, 0.05))
        quality_lbl.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
        quality_lbl.offset_left = 4
        quality_lbl.offset_top = 4
        btn.add_child(quality_lbl)
    
    btn.pressed.connect(func(): _show_details(item, btn))
    btn.mouse_entered.connect(func(): _animate_hover(btn, true, rarity_color))
    btn.mouse_exited.connect(func(): _animate_hover(btn, false, rarity_color))

func _animate_hover(node, is_hover, color):
    var tw = create_tween().set_parallel(true).set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
    if is_hover:
        tw.tween_property(node, "scale", Vector2(1.06, 1.06), 0.1)
        tw.tween_property(node, "modulate", color.lerp(Color.WHITE, 0.7), 0.1)
    else:
        tw.tween_property(node, "scale", Vector2(1.0, 1.0), 0.1)
        tw.tween_property(node, "modulate", Color.WHITE, 0.1)

func _show_details(item, btn):
    _selected_item = item
    _selected_slot = btn
    
    # Make sure the detail panel is visible
    if right_panel:
        right_panel.visible = true
        # Reduce columns to fit the detail panel
        if grid: grid.columns = 8
    
    empty_state.visible = false
    main_vbox.visible = true
    
    var template = item.get("template", {})
    var map_data = item.get("treasure_map_data", {})
    var rarity = template.get("rarity", "COMMON")
    
    # Use treasure map rarity if available
    if map_data.size() > 0:
        rarity = map_data.get("rarity", "COMMON")
    
    var rarity_color = _get_rarity_color(rarity)
    
    item_name.text = template.get("name", "Unknown").to_upper()
    item_name.modulate = rarity_color
    rarity_badge.text = rarity.to_upper() + " ARTIFACT"
    rarity_badge.modulate = rarity_color.lerp(Color.WHITE, 0.3)
    item_desc.text = template.get("description", "No description available.")
    
    # Update icon for treasure maps
    if map_data.size() > 0 and item_icon:
        item_icon.texture = null  # Clear texture
        # We'll show emoji in ItemName instead
    
    var stats = ""
    var item_stats = template.get("stats", [])
    if item_stats is Array and item_stats.size() > 0:
        for s in item_stats:
            var key = s.get("statKey", "").replace("_", " ").to_upper()
            var val = int(s.get("statValue", 0))
            var sign_str = "+" if val >= 0 else ""
            stats += "[color=#99ee88]%s%d[/color] %s\n" % [sign_str, val, key]
    else:
        stats = "NO MAGICAL PROPERTIES IDENTIFIED"
    stats_label.text = stats
    
    # Add quality and durability info to the detail panel
    _add_item_details_to_panel(item)
    
    # Selection animation
    var tw = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
    tw.tween_property(btn, "scale", Vector2(0.9, 0.9), 0.05)
    tw.tween_property(btn, "scale", Vector2(1.1, 1.1), 0.15)
    
    _update_action_buttons(item)

func _on_close_details_pressed():
    if right_panel:
        right_panel.visible = false
        # Expand columns when detail panel is hidden
        if grid: grid.columns = 12
    _selected_item = null
    _selected_slot = null
    
    # Clear ItemDetails label when closing
    if main_vbox and main_vbox.has_node("Scroll/Content"):
        var content = main_vbox.get_node("Scroll/Content")
        if content.has_node("ItemDetails"):
            content.get_node("ItemDetails").queue_free()

func _update_action_buttons(item: Dictionary):
    var template = item.get("template", {})
    var cat = template.get("category", "MISC").to_upper()
    var map_data = item.get("treasure_map_data", {})
    
    # Check if this is a treasure map
    var is_treasure_map = cat == "MAPS" or map_data.size() > 0
    
    # Determine visibility
    var can_equip = cat in ["WEAPON", "ARMOR", "HELMET", "ACCESSORY"]
    var can_use = cat == "CONSUMABLE" or is_treasure_map
    var can_drop = template.get("isQuestItem", false) == false and not is_treasure_map
    
    equip_btn.visible = can_equip
    use_btn.visible = can_use
    drop_btn.visible = can_drop
    
    # Hide entire container if no actions possible
    actions_container.visible = can_equip or can_use or can_drop
    
    if can_equip:
        equip_btn.text = "EQUIP RELIC"
    elif cat == "ACCESSORY":
        equip_btn.text = "WEAR ACCESSORY"
    
    # Update use button text for treasure maps
    if is_treasure_map:
        var is_used = map_data.get("isUsed", false)
        if is_used:
            use_btn.text = "VIEW ON MAP"
        else:
            use_btn.text = "USE MAP"

func _animate_slot_appearance(slot, delay):
    slot.modulate.a = 0
    var tw = create_tween()
    tw.tween_interval(delay)
    tw.tween_property(slot, "modulate:a", 1.0, 0.15)

func _show_initial_state():
    if right_panel: 
        right_panel.visible = false
        if grid: grid.columns = 12
    main_vbox.visible = false
    empty_state.visible = true

func _get_rarity_color(rarity) -> Color:
    match rarity:
        "RARE": return Color(0.2, 0.6, 1.0)
        "EPIC": return Color(0.7, 0.3, 1.0)
        "LEGENDARY": return Color(1.0, 0.6, 0.1)
        _: return Color(0.7, 0.7, 0.7)

func _add_item_details_to_panel(item):
    # Add quality and durability info as a label below stats
    var template = item.get("template", {})
    var cat = template.get("category", "MISC").to_upper()
    
    # Only show for equipment items
    if cat in ["WEAPON", "ARMOR", "HELMET", "ACCESSORY"]:
        var quality = item.get("quality", 100)
        var durability = item.get("durability", -1)
        var max_durability = item.get("maxDurability", -1)
        
        var details_text = ""
        
        # Quality display
        if quality > 100:
            details_text += "[color=#ffcc00]★ +%d QUALITY[/color]\n" % (quality - 100)
        elif quality < 100:
            details_text += "[color=#888888]★ %d QUALITY[/color]\n" % quality
        
        # Durability display
        if durability >= 0 and max_durability > 0:
            var durability_pct = (float(durability) / float(max_durability)) * 100.0
            var dur_color = "#44ff44" if durability_pct > 50 else "#ffaa00" if durability_pct > 25 else "#ff4444"
            details_text += "[color=%s] durability: %d / %d[/color]" % [dur_color, durability, max_durability]
        
        if details_text != "":
            # Add to the content VBox if there's a place for extra details
            if main_vbox and main_vbox.has_node("Scroll/Content"):
                var content = main_vbox.get_node("Scroll/Content")
                # Check if we've already added details
                if not content.has_node("ItemDetails"):
                    var details_label = Label.new()
                    details_label.name = "ItemDetails"
                    details_label.text = details_text
                    details_label.add_theme_font_size_override("font_size", 12)
                    details_label.modulate = Color(0.8, 0.8, 0.7)
                    content.add_child(details_label)

func _get_item_emoji(p_item_name: String) -> String:
    var name_lower = p_item_name.to_lower()
    if "sword" in name_lower: return "⚔️"
    if "bow" in name_lower: return "🏹"
    if "potion" in name_lower: return "🧪"
    if "wood" in name_lower: return "🪵"
    if "ore" in name_lower or "stone" in name_lower: return "🪨"
    if "crystal" in name_lower: return "💎"
    if "herb" in name_lower or "leaf" in name_lower: return "🌿"
    if "helmet" in name_lower or "armor" in name_lower: return "🛡️"
    if "ring" in name_lower: return "💍"
    return "📦"

# === TREASURE MAP FUNCTIONS ===

func _fetch_treasure_maps():
    if _treasure_handler:
        _treasure_handler.get_unused_maps()

func _on_treasure_maps_updated(maps: Array):
    _treasure_maps = maps
    # Convert maps to display format
    _filtered_data = []
    for map_data in maps:
        var display_item = {
            "template": {
                "name": _get_treasure_map_name(map_data),
                "description": _get_treasure_map_desc(map_data),
                "category": "MAPS",
                "rarity": map_data.get("rarity", "COMMON"),
                "icon": "🗺️"
            },
            "treasure_map_data": map_data,
            "id": map_data.get("id", 0),
            "quantity": 1
        }
        _filtered_data.append(display_item)
    _populate_grid()

func _get_treasure_map_name(map_data: Dictionary) -> String:
    var rarity = map_data.get("rarity", "COMMON")
    match rarity:
        "LEGENDARY": return "Ancient Treasure Map"
        "RARE": return "Rare Treasure Map"
        "UNCOMMON": return "Uncommon Treasure Map"
        _: return "Treasure Map"

func _get_treasure_map_desc(map_data: Dictionary) -> String:
    var rarity = map_data.get("rarity", "COMMON")
    var is_used = map_data.get("isUsed", false)
    
    if is_used:
        var region = map_data.get("regionId", 0)
        var coords = map_data.get("coordinatesX", 0)
        var coords_y = map_data.get("coordinatesY", 0)
        var hints = map_data.get("hints", "")
        
        match rarity:
            "LEGENDARY": return "A vague hint points to a legendary treasure..."
            "RARE": return "A general area has been marked: Region %d" % region
            "UNCOMMON": return "The map shows Region %d, Coordinates (%d, %d)" % [region, coords, coords_y]
            _: return "The map reveals exact coordinates: (%d, %d)" % [coords, coords_y]
    else:
        match rarity:
            "LEGENDARY": return "An ancient map promising legendary riches. Use to reveal location."
            "RARE": return "A detailed map to hidden treasures. Use to reveal location."
            "UNCOMMON": return "A map marking a hidden cache. Use to reveal location."
            _: return "A simple treasure map. Use to reveal location."

func _on_treasure_map_used(map_data: Dictionary):
    print("[Inventory] Treasure map used: ", map_data)
    # Refresh the maps display
    _fetch_treasure_maps()

func _on_treasure_error(error_msg: String):
    print("[Inventory] Treasure error: ", error_msg)
    # Could show a notification here

func _handle_treasure_map_action(item: Dictionary):
    var map_data = item.get("treasure_map_data", {})
    var map_id = map_data.get("id", 0)
    var is_used = map_data.get("isUsed", false)
    
    if map_id == 0:
        print("[Inventory] Invalid treasure map ID")
        return
    
    if is_used:
        # Map already used - show location info
        # Player should go to world map to dig
        print("[Inventory] Map already used - show dig option on world map")
    else:
        # Use the map to reveal location
        if _treasure_handler:
            _treasure_handler.use_map(map_id)
            use_btn.disabled = true
            use_btn.text = "REVEALING..."

# --- ACTION HANDLERS ---
func _on_equip_pressed():
    if not _selected_item: return
    
    var item_instance_id = _selected_item.get("id")
    var uid = GameState.current_user.get("id")
    var hero_id = GameState.selected_hero_id if GameState.selected_hero_id != -1 else 0
    
    # Try to find main hero if none selected
    if hero_id == 0:
        for hero in GameState.current_heroes:
            if hero.get("isMain", false):
                hero_id = hero.get("id")
                break
    
    if hero_id == 0 and not GameState.current_heroes.is_empty():
        hero_id = GameState.current_heroes[0].get("id")

    var template = _selected_item.get("template", {})
    var equip_slots = template.get("equipSlots", [])
    
    if equip_slots.is_empty():
        print("[INVENTORY] Item has no valid equip slots!")
        return
        
    var slot_key = equip_slots[0].get("slotKey", "")
    
    if uid and item_instance_id and hero_id != 0 and slot_key != "":
        print("[INVENTORY] Equipping item ID: %d to hero: %d in slot: %s" % [item_instance_id, hero_id, slot_key])
        ServerConnector.equip_item(int(uid), int(hero_id), int(item_instance_id), slot_key)
        
        equip_btn.disabled = true
        equip_btn.text = "EQUIPPING..."

func _on_use_pressed():
    if not _selected_item: return
    
    # Check if this is a treasure map
    var map_data = _selected_item.get("treasure_map_data", {})
    if map_data.size() > 0:
        # Handle treasure map action
        _handle_treasure_map_action(_selected_item)
        return
    
    var item_instance_id = _selected_item.get("id")
    var uid = GameState.current_user.get("id")
    
    if uid and item_instance_id:
        print("[INVENTORY] Using item ID: %d" % [item_instance_id])
        # Use selected hero ID if any, otherwise server defaults to main hero
        var hero_id = GameState.selected_hero_id if GameState.selected_hero_id != -1 else 0
        ServerConnector.use_item(int(uid), int(item_instance_id), int(hero_id))
        
        use_btn.disabled = true
        use_btn.text = "USING..."

func _on_drop_pressed():
    if not _selected_item: return
    
    var quantity = _selected_item.get("quantity", 1)
    if quantity > 1:
        _show_bulk_discard_dialog(quantity)
    else:
        _confirm_discard(1)

func _show_bulk_discard_dialog(max_qty: int):
    var dialog = ConfirmationDialog.new()
    dialog.title = "Discard Item"
    dialog.get_ok_button().text = "Discard"
    
    var vbox = VBoxContainer.new()
    vbox.add_theme_constant_override("separation", 15)
    
    var label = Label.new()
    label.text = "Choose quantity to discard:"
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(label)
    
    # Custom Quantity Selector (Large Buttons)
    var hbox = HBoxContainer.new()
    hbox.alignment = BoxContainer.ALIGNMENT_CENTER
    hbox.add_theme_constant_override("separation", 20)
    
    var btn_minus = Button.new()
    btn_minus.text = "-"
    btn_minus.custom_minimum_size = Vector2(60, 60)
    btn_minus.add_theme_font_size_override("font_size", 24)
    
    var qty_label = Label.new()
    qty_label.text = "1"
    qty_label.custom_minimum_size = Vector2(80, 0)
    qty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    qty_label.add_theme_font_size_override("font_size", 28)
    qty_label.add_theme_color_override("font_color", Color(1, 0.9, 0.5))
    
    var btn_plus = Button.new()
    btn_plus.text = "+"
    btn_plus.custom_minimum_size = Vector2(60, 60)
    btn_plus.add_theme_font_size_override("font_size", 24)
    
    hbox.add_child(btn_minus)
    hbox.add_child(qty_label)
    hbox.add_child(btn_plus)
    vbox.add_child(hbox)
    
    # Slider for quick large adjustments
    var slider = HSlider.new()
    slider.min_value = 1
    slider.max_value = max_qty
    slider.value = 1
    slider.step = 1
    vbox.add_child(slider)
    
    dialog.add_child(vbox)
    add_child(dialog)
    
    # Logic connections
    var update_qty = func(val):
        val = clamp(val, 1, max_qty)
        qty_label.text = str(val)
        slider.value = val
        
    btn_minus.pressed.connect(func(): update_qty.call(int(qty_label.text) - 1))
    btn_plus.pressed.connect(func(): update_qty.call(int(qty_label.text) + 1))
    slider.value_changed.connect(func(v): qty_label.text = str(int(v)))
    
    dialog.confirmed.connect(func(): 
        _confirm_discard(int(qty_label.text))
        dialog.queue_free()
    )
    dialog.canceled.connect(func(): dialog.queue_free())
    
    dialog.popup_centered(Vector2(350, 250))

func _confirm_discard(qty: int):
    if not _selected_item: return
    
    var item_instance_id = _selected_item.get("id")
    var uid = GameState.current_user.get("id")
    
    if uid and item_instance_id:
        print("[INVENTORY] Discarding %d of item ID: %d" % [qty, item_instance_id])
        ServerConnector.discard_item(int(uid), int(item_instance_id), qty)
        
        drop_btn.disabled = true
        drop_btn.text = "DISCARDING..."

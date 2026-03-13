extends Panel
class_name InventoryUI

## Inventory UI - Item management and equipment slots
## Shows: Inventory grid, Equipment slots, Item details

# UI Elements
@onready var title_label: Label = $MainContainer/Header/TitleLabel if has_node("MainContainer/Header/TitleLabel") else null
@onready var close_button: Button = $MainContainer/Header/CloseButton if has_node("MainContainer/Header/CloseButton") else null
@onready var gold_label: Label = $MainContainer/Header/GoldLabel if has_node("MainContainer/Header/GoldLabel") else null

# Equipment Panel
@onready var equipment_container: VBoxContainer = $MainContainer/Content/EquipmentPanel/EquipmentContainer if has_node("MainContainer/Content/EquipmentPanel/EquipmentContainer") else null

# Inventory Panel
@onready var inventory_grid: GridContainer = $MainContainer/Content/InventoryPanel/InventoryGrid if has_node("MainContainer/Content/InventoryPanel/InventoryGrid") else null
@onready var inventory_label: Label = $MainContainer/Content/InventoryPanel/InventoryLabel if has_node("MainContainer/Content/InventoryPanel/InventoryLabel") else null

# Item Detail Panel
@onready var detail_panel: Panel = $MainContainer/Content/DetailPanel if has_node("MainContainer/Content/DetailPanel") else null
@onready var detail_content: VBoxContainer = $MainContainer/Content/DetailPanel/DetailContent if has_node("MainContainer/Content/DetailPanel/DetailContent") else null
@onready var use_button: Button = $MainContainer/Content/DetailPanel/UseButton if has_node("MainContainer/Content/DetailPanel/UseButton") else null
@onready var equip_button: Button = $MainContainer/Content/DetailPanel/EquipButton if has_node("MainContainer/Content/DetailPanel/EquipButton") else null
@onready var unequip_button: Button = $MainContainer/Content/DetailPanel/UnequipButton if has_node("MainContainer/Content/DetailPanel/UnequipButton") else null
@onready var select_hint: Label = $MainContainer/Content/DetailPanel/SelectHint if has_node("MainContainer/Content/DetailPanel/SelectHint") else null

# Data
var game_manager: Node = null
var is_visible: bool = false
var selected_item_index: int = -1
var selected_item: Dictionary = {}

# Constants
const INVENTORY_SLOTS: int = 30
const GRID_COLS: int = 6

# Equipment Slots
enum EquipSlot { WEAPON, ARMOR, HELMET, BOOTS, ACCESSORY }

# Colors
const COLOR_EQUIP_SLOT: Color = Color(0.2, 0.2, 0.25, 0.9)
const COLOR_SELECTED: Color = Color(0.3, 0.5, 0.8, 1.0)
const COLOR_ITEM_BG: Color = Color(0.25, 0.25, 0.3, 0.8)

func _ready() -> void:
    game_manager = get_tree().root.get_node("GameManager")
    if game_manager == null:
        push_warning("[InventoryUI] GameManager not found - inventory may not work properly")
    visible = false
    
    if close_button:
        close_button.pressed.connect(_on_close_pressed)
    
    if use_button:
        use_button.pressed.connect(_on_use_pressed)
        use_button.disabled = true
    
    if equip_button:
        equip_button.pressed.connect(_on_equip_pressed)
        equip_button.disabled = true
    
    if unequip_button:
        unequip_button.pressed.connect(_on_unequip_pressed)
        unequip_button.disabled = true

func show_inventory() -> void:
    # Close other panels first
    _close_other_panels()
    visible = true
    is_visible = true
    _refresh_display()

func hide_inventory() -> void:
    visible = false
    is_visible = false

func toggle() -> void:
    if is_visible:
        hide_inventory()
    else:
        show_inventory()

func _close_other_panels() -> void:
    # Close other UI panels to prevent overlap
    var game_scene = get_tree().root.get_node("GameScene")
    if game_scene:
        # Close HeroRoster
        var hero_roster = game_scene.get_node_or_null("HeroRoster")
        if hero_roster and hero_roster.has_method("hide_roster"):
            hero_roster.hide_roster()
        
        # Close QuestBoardUI
        var quest_board = game_scene.get_node_or_null("QuestBoardUI")
        if quest_board and quest_board.has_method("hide_quest_board"):
            quest_board.hide_quest_board()

func _refresh_display() -> void:
    _update_gold()
    _refresh_equipment_slots()
    _refresh_inventory_grid()
    _clear_item_detail()

func _update_gold() -> void:
    if gold_label and game_manager:
        gold_label.text = "💰 %,d" % game_manager.gold

func _refresh_equipment_slots() -> void:
    if equipment_container == null:
        return
    
    # Clear existing
    for child in equipment_container.get_children():
        child.queue_free()
    
    var inventory = game_manager.inventory if game_manager else []
    var equipment = game_manager.equipment if game_manager else {}
    
    # Equipment slots
    _add_equip_slot(equipment_container, "⚔️ WEAPON", EquipSlot.WEAPON, equipment.get("weapon", null))
    _add_equip_slot(equipment_container, "🛡️ ARMOR", EquipSlot.ARMOR, equipment.get("armor", null))
    _add_equip_slot(equipment_container, "⛑️ HELMET", EquipSlot.HELMET, equipment.get("helmet", null))
    _add_equip_slot(equipment_container, "👢 BOOTS", EquipSlot.BOOTS, equipment.get("boots", null))
    _add_equip_slot(equipment_container, "💍 ACCESSORY", EquipSlot.ACCESSORY, equipment.get("accessory", null))

func _add_equip_slot(container: VBoxContainer, slot_name: String, slot_type: EquipSlot, item: Dictionary) -> void:
    var slot_container = HBoxContainer.new()
    slot_container.custom_minimum_size = Vector2(0, 60)
    
    # Slot name
    var name_label = Label.new()
    name_label.text = slot_name
    name_label.custom_minimum_size = Vector2(100, 0)
    name_label.modulate = Color(0.8, 0.8, 0.9)
    slot_container.add_child(name_label)
    
    # Item or empty
    if item.is_empty():
        var empty_label = Label.new()
        empty_label.text = "[Empty]"
        empty_label.modulate = Color(0.4, 0.4, 0.4)
        empty_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        slot_container.add_child(empty_label)
    else:
        var item_panel = _create_item_panel(item)
        item_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        slot_container.add_child(item_panel)
    
    container.add_child(slot_container)

func _refresh_inventory_grid() -> void:
    if inventory_grid == null:
        return
    
    # Clear existing
    for child in inventory_grid.get_children():
        child.queue_free()
    
    inventory_grid.columns = GRID_COLS
    
    var inventory = game_manager.inventory if game_manager else []
    
    # Create slots
    for i in range(INVENTORY_SLOTS):
        var slot = _create_inventory_slot(i, inventory)
        inventory_grid.add_child(slot)
    
    # Update label
    if inventory_label:
        inventory_label.text = "INVENTORY: %d/%d" % [inventory.size(), INVENTORY_SLOTS]

func _create_inventory_slot(index: int, inventory: Array) -> Control:
    var container = PanelContainer.new()
    container.custom_minimum_size = Vector2(50, 50)
    container.set_meta("slot_index", index)
    container.mouse_filter = Control.MOUSE_FILTER_STOP
    
    # Background
    var style = StyleBoxFlat.new()
    style.bg_color = COLOR_ITEM_BG
    style.corner_radius_top_left = 4
    style.corner_radius_top_right = 4
    style.corner_radius_bottom_left = 4
    style.corner_radius_bottom_right = 4
    container.add_theme_stylebox_override("panel", style)
    
    # Connect input
    container.gui_input.connect(_on_slot_input.bind(index))
    container.mouse_entered.connect(_on_slot_hover.bind(index, container))
    
    # Item or empty
    if index < inventory.size():
        var item = inventory[index]
        var item_display = _create_item_icon(item)
        container.add_child(item_display)
    
    return container

func _create_item_panel(item: Dictionary) -> Control:
    var panel = PanelContainer.new()
    panel.custom_minimum_size = Vector2(100, 45)
    
    # Background with item rarity color
    var rarity_color = _get_rarity_color(item.get("rarity", "common"))
    var style = StyleBoxFlat.new()
    style.bg_color = rarity_color
    style.corner_radius_top_left = 4
    style.corner_radius_top_right = 4
    style.corner_radius_bottom_left = 4
    style.corner_radius_bottom_right = 4
    panel.add_theme_stylebox_override("panel", style)
    
    var vbox = VBoxContainer.new()
    panel.add_child(vbox)
    
    # Item name
    var name_label = Label.new()
    name_label.text = item.get("name", "Unknown")
    name_label.add_theme_font_size_override("font_size", 11)
    name_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_CHAR
    vbox.add_child(name_label)
    
    # Item type
    var type_label = Label.new()
    type_label.text = item.get("type", "item")
    type_label.add_theme_font_size_override("font_size", 9)
    type_label.modulate = Color(0.7, 0.7, 0.7)
    vbox.add_child(type_label)
    
    return panel

func _create_item_icon(item: Dictionary) -> Control:
    var container = Control.new()
    container.custom_minimum_size = Vector2(40, 40)
    
    # Icon background
    var bg = ColorRect.new()
    bg.color = _get_rarity_color(item.get("rarity", "common"))
    bg.size = Vector2(40, 40)
    container.add_child(bg)
    
    # Item icon (emoji for now)
    var icon = Label.new()
    icon.text = _get_item_icon(item.get("type", "item"))
    icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    icon.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    icon.add_theme_font_size_override("font_size", 20)
    container.add_child(icon)
    
    # Stack count if > 1
    var quantity = item.get("quantity", 1)
    if quantity > 1:
        var count = Label.new()
        count.text = str(quantity)
        count.add_theme_font_size_override("font_size", 10)
        count.position = Vector2(28, 28)
        container.add_child(count)
    
    return container

func _get_rarity_color(rarity: String) -> Color:
    match rarity:
        "common": return Color(0.4, 0.4, 0.4)
        "uncommon": return Color(0.2, 0.7, 0.2)
        "rare": return Color(0.2, 0.5, 0.8)
        "epic": return Color(0.5, 0.2, 0.7)
        "legendary": return Color(0.8, 0.6, 0.1)
        _: return Color(0.4, 0.4, 0.4)

func _get_item_icon(item_type: String) -> String:
    match item_type:
        "weapon": return "⚔️"
        "armor": return "🛡️"
        "helmet": return "⛑️"
        "boots": return "👢"
        "accessory": return "💍"
        "consumable": return "🧪"
        "material": return "📦"
        "quest": return "📜"
        _: return "📦"

# =============================================================================
# Item Selection & Detail
# =============================================================================

func _on_slot_input(event: InputEvent, index: int) -> void:
    if event is InputEventMouseButton:
        var mouse = event as InputEventMouseButton
        if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
            _select_item(index)

func _on_slot_hover(index: int, container: PanelContainer) -> void:
    # Could show tooltip here
    pass

func _select_item(index: int) -> void:
    if game_manager == null:
        return
    
    var inventory = game_manager.inventory
    if index >= inventory.size():
        _clear_item_detail()
        return
    
    selected_item_index = index
    selected_item = inventory[index]
    _show_item_detail(selected_item)

func _show_item_detail(item: Dictionary) -> void:
    if detail_content == null:
        return
    
    # Clear existing
    for child in detail_content.get_children():
        child.queue_free()
    
    # Hide hint
    if select_hint:
        select_hint.visible = false
    detail_content.visible = true
    
    # Item name
    var name_label = Label.new()
    name_label.text = item.get("name", "Unknown Item")
    name_label.add_theme_font_size_override("font_size", 18)
    name_label.modulate = _get_rarity_color(item.get("rarity", "common"))
    detail_content.add_child(name_label)
    
    # Type & Rarity
    var type_label = Label.new()
    type_label.text = "%s • %s" % [item.get("type", "item").to_upper(), item.get("rarity", "common").to_upper()]
    type_label.add_theme_font_size_override("font_size", 12)
    detail_content.add_child(type_label)
    
    # Description
    if item.has("description"):
        var desc = Label.new()
        desc.text = item.get("description", "")
        desc.modulate = Color(0.7, 0.7, 0.7)
        desc.add_theme_font_size_override("font_size", 11)
        detail_content.add_child(desc)
    
    # Stats
    if item.has("stats"):
        _add_section_title(detail_content, "📊 STATS")
        var stats = item.get("stats", {})
        for stat in stats.keys():
            var stat_row = Label.new()
            stat_row.text = "%s: +%d" % [stat.to_upper(), stats[stat]]
            detail_content.add_child(stat_row)
    
    # Quantity
    if item.has("quantity"):
        var qty = Label.new()
        qty.text = "Quantity: %d" % item.get("quantity", 1)
        detail_content.add_child(qty)
    
    # Value
    if item.has("value"):
        var value = Label.new()
        value.text = "Value: %d gold" % item.get("value", 0)
        detail_content.add_child(value)
    
    # Enable buttons
    var item_type = item.get("type", "")
    if use_button:
        use_button.disabled = (item_type != "consumable")
    if equip_button:
        equip_button.disabled = (item_type not in ["weapon", "armor", "helmet", "boots", "accessory"])
    if unequip_button:
        unequip_button.disabled = true

func _clear_item_detail() -> void:
    selected_item_index = -1
    selected_item = {}
    
    if detail_content:
        for child in detail_content.get_children():
            child.queue_free()
        detail_content.visible = false
    
    if select_hint:
        select_hint.visible = true
    
    if use_button:
        use_button.disabled = true
    if equip_button:
        equip_button.disabled = true
    if unequip_button:
        unequip_button.disabled = true

func _add_section_title(container: VBoxContainer, title: String) -> void:
    var label = Label.new()
    label.text = title
    label.add_theme_font_size_override("font_size", 12)
    label.modulate = Color(0.8, 0.8, 0.3)
    container.add_child(label)

# =============================================================================
# Button Actions
# =============================================================================

func _on_use_pressed() -> void:
    if selected_item.is_empty() or game_manager == null:
        return
    
    var item_type = selected_item.get("type", "")
    if item_type == "consumable":
        # Use item (heal, buff, etc)
        print("[Inventory] Using item: %s" % selected_item.get("name", ""))
        # TODO: Implement use logic
        
        # Remove from inventory
        var inventory = game_manager.inventory
        inventory.remove_at(selected_item_index)
        game_manager.inventory = inventory
        
        _refresh_display()

func _on_equip_pressed() -> void:
    if selected_item.is_empty() or game_manager == null:
        return
    
    var item_type = selected_item.get("type", "")
    var equipment = game_manager.equipment.duplicate()
    
    # Equip to matching slot
    match item_type:
        "weapon": equipment["weapon"] = selected_item
        "armor": equipment["armor"] = selected_item
        "helmet": equipment["helmet"] = selected_item
        "boots": equipment["boots"] = selected_item
        "accessory": equipment["accessory"] = selected_item
    
    # Remove from inventory
    var inventory = game_manager.inventory
    inventory.remove_at(selected_item_index)
    game_manager.inventory = inventory
    game_manager.equipment = equipment
    
    _refresh_display()
    print("[Inventory] Equipped: %s" % selected_item.get("name", ""))

func _on_unequip_pressed() -> void:
    # TODO: Implement unequip from equipment slot
    pass

func _on_close_pressed() -> void:
    hide_inventory()

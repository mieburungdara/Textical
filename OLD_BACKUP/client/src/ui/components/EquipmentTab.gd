extends HBoxContainer
class_name EquipmentTab

## EquipmentTab - Component untuk menampilkan tab equipment hero
## Features: Equipment slots (Paper Doll style) dan detailed item info

# === NODE REFERENCES ===
@onready var head_slot = $PaperDollPanel/VBox/DollArea/LeftSlots/HeadSlot
@onready var body_slot = $PaperDollPanel/VBox/DollArea/LeftSlots/BodySlot
@onready var accessory_slot = $PaperDollPanel/VBox/DollArea/LeftSlots/AccessorySlot
@onready var weapon_slot = $PaperDollPanel/VBox/DollArea/RightSlots/WeaponSlot
@onready var offhand_slot = $PaperDollPanel/VBox/DollArea/RightSlots/OffhandSlot
@onready var trinket_slot = $PaperDollPanel/VBox/DollArea/RightSlots/TrinketSlot
@onready var doll_title_label = $PaperDollPanel/VBox/Title

@onready var main_vbox = $ItemDetailsPanel/MainVBox
@onready var item_info_section = $ItemDetailsPanel/MainVBox/ItemInfoSection
@onready var inventory_section = $ItemDetailsPanel/MainVBox/InventorySection
@onready var inventory_list = $ItemDetailsPanel/MainVBox/InventorySection/Scroll/List
@onready var empty_state = $ItemDetailsPanel/EmptyState

@onready var item_name_label = $ItemDetailsPanel/MainVBox/ItemInfoSection/ItemHeader/ItemName
@onready var item_type_label = $ItemDetailsPanel/MainVBox/ItemInfoSection/ItemHeader/ItemType
@onready var item_desc_label = $ItemDetailsPanel/MainVBox/ItemInfoSection/Description
@onready var item_stats_label = $ItemDetailsPanel/MainVBox/ItemInfoSection/StatsSection/ItemStats
@onready var equip_button: Button = $ItemDetailsPanel/MainVBox/ActionButtons/EquipButton
@onready var unequip_button: Button = $ItemDetailsPanel/MainVBox/ActionButtons/UnequipButton

var ItemRowClass = load("res://src/ui/components/ItemSelectionRow.tscn")

# === PRIVATE VARIABLES ===
var _current_hero: Dictionary = {}
var _selected_slot: String = ""
var _slots: Dictionary = {}

# === Lifecycle Methods ===

func _ready():
    _setup_slots()
    _show_initial_state()

# === PUBLIC METHODS ===

## Update equipment tab dengan data hero
func update_equipment(hero_data: Dictionary):
    _current_hero = hero_data
    _update_ui()

## Clear semua content
func clear_content():
    _current_hero = {}
    _selected_slot = ""
    _update_ui()
    _show_initial_state()

# === PRIVATE METHODS ===

func _setup_slots():
    _slots = {
        "HEAD": {"node": head_slot, "name": "Head", "icon": "🪖"},
        "BODY": {"node": body_slot, "name": "Armor", "icon": "👕"},
        "ACCESSORY": {"node": accessory_slot, "name": "Accessory", "icon": "💍"},
        "MAIN_HAND": {"node": weapon_slot, "name": "Weapon", "icon": "⚔️"},
        "OFF_HAND": {"node": offhand_slot, "name": "Shield", "icon": "🛡️"},
        "TRINKET": {"node": trinket_slot, "name": "Trinket", "icon": "📿"}
    }
    
    for slot_key in _slots:
        var slot_data = _slots[slot_key]
        var node = slot_data["node"]
        if node and node.has_method("setup"):
            node.setup(slot_key, slot_data["name"], slot_data["icon"])
            if not node.slot_clicked.is_connected(_on_slot_clicked):
                node.slot_clicked.connect(_on_slot_clicked)

func _update_ui():
    if _current_hero.is_empty():
        if doll_title_label: doll_title_label.text = "UNIT LOADOUT"
        for slot_key in _slots:
            _slots[slot_key]["node"].set_empty()
        return

    # Update title with class name
    var hero_class = _current_hero.get("combatClass", {})
    var class_name_str = "UNIT"
    if hero_class is Dictionary:
        class_name_str = hero_class.get("name", "UNIT").to_upper()
    elif hero_class is String:
        class_name_str = hero_class.to_upper()
    
    if doll_title_label:
        doll_title_label.text = class_name_str + " LOADOUT"

    var equipment = _current_hero.get("equipment", [])
    
    # Reset all slots to empty first
    for slot_key in _slots:
        _slots[slot_key]["node"].set_empty()
    
    # Map equipment to slots
    if equipment is Array:
        for eq in equipment:
            var slot_key = eq.get("slotKey", eq.get("slot", "")).to_upper()
            var item_instance = eq.get("itemInstance", {})
            
            if _slots.has(slot_key):
                var item_data = item_instance.get("template", {})
                var ui_data = item_data.duplicate()
                ui_data["rarity"] = item_instance.get("quality", item_data.get("rarity", "COMMON"))
                ui_data["instance_id"] = item_instance.get("id")
                ui_data["stats"] = item_instance.get("template", {}).get("stats", [])
                
                _slots[slot_key]["node"].set_item(ui_data)
    
    # Update details if a slot is selected
    if _selected_slot != "" and _slots.has(_selected_slot):
        _on_slot_clicked(_selected_slot)

func _on_slot_clicked(slot_key: String):
    _selected_slot = slot_key
    var slot_node = _slots[slot_key]["node"]
    
    empty_state.visible = false
    main_vbox.visible = true
    
    if slot_node.is_empty:
        item_info_section.visible = false
        unequip_button.visible = false
        equip_button.visible = false
    else:
        _show_item_details(slot_node.item_data)
        unequip_button.visible = true
        equip_button.visible = false
    
    _populate_inventory_list(slot_key)

func _populate_inventory_list(slot_key: String):
    # Clear previous list
    for child in inventory_list.get_children():
        child.queue_free()
    
    var user_inventory = GameState.inventory
    var compatible_items = []
    
    if user_inventory is Array:
        for item in user_inventory:
            var template = item.get("template", {})
            var equip_slots = template.get("equipSlots", [])
            
            var is_compatible = false
            for s in equip_slots:
                if s.get("slotKey", "").to_upper() == slot_key:
                    is_compatible = true
                    break
            
            if is_compatible:
                var ui_data = template.duplicate()
                ui_data["rarity"] = item.get("quality", template.get("rarity", "COMMON"))
                ui_data["instance_id"] = item.get("id")
                ui_data["stats"] = template.get("stats", [])
                compatible_items.append(ui_data)
    
    if compatible_items.size() > 0:
        inventory_section.visible = true
        for item_data in compatible_items:
            var row = ItemRowClass.instantiate()
            inventory_list.add_child(row)
            row.setup(item_data)
            row.item_selected.connect(_on_inventory_item_selected)
    else:
        inventory_section.visible = false

func _on_inventory_item_selected(item_data: Dictionary):
    _show_item_details(item_data)
    equip_button.visible = true
    unequip_button.visible = false

func _show_item_details(item: Dictionary):
    item_info_section.visible = true
    
    item_name_label.text = item.get("name", "Unknown Item")
    
    var rarity = item.get("rarity", "COMMON").to_upper()
    var category = item.get("category", "EQUIPMENT").to_upper()
    item_type_label.text = "%s • %s" % [category, rarity]
    
    var rarity_colors = {
        "COMMON": Color(0.8, 0.8, 0.8),
        "RARE": Color(0.2, 0.6, 1.0),
        "EPIC": Color(0.7, 0.3, 1.0),
        "LEGENDARY": Color(1.0, 0.6, 0.1)
    }
    item_name_label.modulate = rarity_colors.get(rarity, Color.WHITE)
    
    item_desc_label.text = item.get("description", "No description available.")
    
    var stats_text = ""
    var stats = item.get("stats", [])
    if stats is Array:
        for stat in stats:
            var key = stat.get("statKey", "").replace("_", " ").capitalize()
            var val = stat.get("statValue", 0)
            var sign_str = "+" if val >= 0 else ""
            stats_text += "%s %s: %d\n" % [sign_str, key, val]
    
    if stats_text == "":
        stats_text = "No attribute bonuses"
    
    item_stats_label.text = stats_text

func _show_initial_state():
    main_vbox.visible = false
    empty_state.visible = true
    empty_state.get_child(0).text = "CHOOSE A SLOT TO VIEW RELIC DATA"

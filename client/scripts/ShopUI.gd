extends Panel
class_name ShopUI

## Shop UI - Buy and sell items

# UI Elements
@onready var title_label: Label = $MainContainer/Header/TitleLabel if has_node("MainContainer/Header/TitleLabel") else null
@onready var close_button: Button = $MainContainer/Header/CloseButton if has_node("MainContainer/Header/CloseButton") else null
@onready var gold_label: Label = $MainContainer/Header/GoldLabel if has_node("MainContainer/Header/GoldLabel") else null

@onready var weapons_btn: Button = $MainContainer/CategoryBar/WeaponsBtn if has_node("MainContainer/CategoryBar/WeaponsBtn") else null
@onready var armor_btn: Button = $MainContainer/CategoryBar/ArmorBtn if has_node("MainContainer/CategoryBar/ArmorBtn") else null
@onready var consumables_btn: Button = $MainContainer/CategoryBar/ConsumablesBtn if has_node("MainContainer/CategoryBar/ConsumablesBtn") else null
@onready var materials_btn: Button = $MainContainer/CategoryBar/MaterialsBtn if has_node("MainContainer/CategoryBar/MaterialsBtn") else null

@onready var item_grid: GridContainer = $MainContainer/Content/ItemGrid/ItemGridContainer if has_node("MainContainer/Content/ItemGrid/ItemGridContainer") else null
@onready var detail_content: VBoxContainer = $MainContainer/Content/ItemDetailPanel/DetailContent if has_node("MainContainer/Content/ItemDetailPanel/DetailContent") else null
@onready var item_name_label: Label = $MainContainer/Content/ItemDetailPanel/DetailContent/ItemName if has_node("MainContainer/Content/ItemDetailPanel/DetailContent/ItemName") else null
@onready var item_type_label: Label = $MainContainer/Content/ItemDetailPanel/DetailContent/ItemType if has_node("MainContainer/Content/ItemDetailPanel/DetailContent/ItemType") else null
@onready var item_stats_vbox: VBoxContainer = $MainContainer/Content/ItemDetailPanel/DetailContent/ItemStats if has_node("MainContainer/Content/ItemDetailPanel/DetailContent/ItemStats") else null
@onready var price_label: Label = $MainContainer/Content/ItemDetailPanel/DetailContent/PriceLabel if has_node("MainContainer/Content/ItemDetailPanel/DetailContent/PriceLabel") else null
@onready var buy_button: Button = $MainContainer/Content/ItemDetailPanel/DetailContent/BuyButton if has_node("MainContainer/Content/ItemDetailPanel/DetailContent/BuyButton") else null
@onready var sell_button: Button = $MainContainer/Content/ItemDetailPanel/DetailContent/SellButton if has_node("MainContainer/Content/ItemDetailPanel/DetailContent/SellButton") else null
@onready var message_label: Label = $MainContainer/MessageLabel if has_node("MainContainer/MessageLabel") else null

# Data
var game_manager: Node = null
var is_visible: bool = false
var selected_item: Dictionary = {}
var selected_item_index: int = -1
var current_category: String = "weapons"

# Detail panel reference (for clearing detail view)
var detail_label: Label = null

# Shop inventory (items available for purchase)
var _shop_items: Array = []

# Layout
const GRID_COLS: int = 5

func _ready() -> void:
    game_manager = get_tree().root.get_node("GameManager")
    visible = false
    
    # Connect signals
    if close_button:
        close_button.pressed.connect(_on_close_pressed)
    
    if weapons_btn:
        weapons_btn.pressed.connect(_on_category_selected.bind("weapons"))
    if armor_btn:
        armor_btn.pressed.connect(_on_category_selected.bind("armor"))
    if consumables_btn:
        consumables_btn.pressed.connect(_on_category_selected.bind("consumables"))
    if materials_btn:
        materials_btn.pressed.connect(_on_category_selected.bind("materials"))
    
    if buy_button:
        buy_button.pressed.connect(_on_buy_pressed)
        buy_button.disabled = true
    
    if sell_button:
        sell_button.pressed.connect(_on_sell_pressed)
        sell_button.disabled = true
    
    # Initialize shop items
    _init_shop_items()

func _init_shop_items() -> void:
    # Weapons
    _shop_items = [
        {"id": "iron_sword", "name": "Iron Sword", "type": "weapon", "rarity": "common", "value": 100, "stats": {"attack": 10}},
        {"id": "steel_sword", "name": "Steel Sword", "type": "weapon", "rarity": "uncommon", "value": 250, "stats": {"attack": 20}},
        {"id": "mithril_sword", "name": "Mithril Sword", "type": "weapon", "rarity": "rare", "value": 500, "stats": {"attack": 35}},
        {"id": "dragon_slayer", "name": "Dragon Slayer", "type": "weapon", "rarity": "epic", "value": 1500, "stats": {"attack": 60, "critical": 10}},
        {"id": "legendary_blade", "name": "Legendary Blade", "type": "weapon", "rarity": "legendary", "value": 5000, "stats": {"attack": 100, "critical": 20}},
        
        {"id": "iron_axe", "name": "Iron Axe", "type": "weapon", "rarity": "common", "value": 120, "stats": {"attack": 12}},
        {"id": "battle_axe", "name": "Battle Axe", "type": "weapon", "rarity": "uncommon", "value": 300, "stats": {"attack": 25}},
        
        # Armor
        {"id": "leather_armor", "name": "Leather Armor", "type": "armor", "rarity": "common", "value": 80, "stats": {"defense": 5}},
        {"id": "chainmail", "name": "Chainmail", "type": "armor", "rarity": "common", "value": 150, "stats": {"defense": 10}},
        {"id": "plate_armor", "name": "Plate Armor", "type": "armor", "rarity": "uncommon", "value": 400, "stats": {"defense": 20}},
        {"id": "dragon_scale", "name": "Dragon Scale Armor", "type": "armor", "rarity": "epic", "value": 2000, "stats": {"defense": 50, "fire_resist": 30}},
        
        # Helmets
        {"id": "iron_helmet", "name": "Iron Helmet", "type": "helmet", "rarity": "common", "value": 60, "stats": {"defense": 3}},
        {"id": "knights_helm", "name": "Knight's Helm", "type": "helmet", "rarity": "uncommon", "value": 200, "stats": {"defense": 8}},
        
        # Boots
        {"id": "leather_boots", "name": "Leather Boots", "type": "boots", "rarity": "common", "value": 40, "stats": {"defense": 2}},
        {"id": "iron_greaves", "name": "Iron Greaves", "type": "boots", "rarity": "uncommon", "value": 150, "stats": {"defense": 6}},
        
        # Accessories
        {"id": "ring_strength", "name": "Ring of Strength", "type": "accessory", "rarity": "uncommon", "value": 300, "stats": {"attack": 10}},
        {"id": "ring_vitality", "name": "Ring of Vitality", "type": "accessory", "rarity": "uncommon", "value": 300, "stats": {"hp": 50}},
        {"id": "amulet_luck", "name": "Amulet of Luck", "type": "accessory", "rarity": "rare", "value": 800, "stats": {"critical": 15}},
        
        # Consumables
        {"id": "health_potion", "name": "Health Potion", "type": "consumable", "rarity": "common", "value": 25, "stats": {"heal": 50}},
        {"id": "mana_potion", "name": "Mana Potion", "type": "consumable", "rarity": "common", "value": 30, "stats": {"restore_mp": 30}},
        {"id": "antidote", "name": "Antidote", "type": "consumable", "rarity": "common", "value": 20, "stats": {"cure_poison": 1}},
        {"id": "speed_scroll", "name": "Scroll of Speed", "type": "consumable", "rarity": "uncommon", "value": 100, "stats": {"speed_buff": 30}},
        {"id": "power_scroll", "name": "Scroll of Power", "type": "consumable", "rarity": "rare", "value": 250, "stats": {"attack_buff": 25}},
        {"id": "teleport_scroll", "name": "Teleport Scroll", "type": "consumable", "rarity": "uncommon", "value": 150, "effect": "teleport"},
        
        # Materials
        {"id": "iron_ore", "name": "Iron Ore", "type": "material", "rarity": "common", "value": 10},
        {"id": "mithril_ingot", "name": "Mithril Ingot", "type": "material", "rarity": "rare", "value": 200},
        {"id": "dragon_scale_m", "name": "Dragon Scale", "type": "material", "rarity": "epic", "value": 500},
        {"id": "herb", "name": "Healing Herb", "type": "material", "rarity": "common", "value": 5},
        {"id": "magic_crystal", "name": "Magic Crystal", "type": "material", "rarity": "uncommon", "value": 75},
    ]

func show_shop() -> void:
    _close_other_panels()
    visible = true
    is_visible = true
    _update_gold()
    _refresh_item_grid()
    _clear_detail()
    _set_message("Welcome to the shop! Browse our wares.")

func hide_shop() -> void:
    visible = false
    is_visible = false

func toggle() -> void:
    if is_visible:
        hide_shop()
    else:
        show_shop()

func _close_other_panels() -> void:
    var game_scene = get_tree().root.get_node_or_null("GameScene")
    if game_scene:
        var hero_roster = game_scene.get_node_or_null("UILayer/OverlayContainer/HeroRoster")
        if hero_roster and hero_roster.has_method("hide_roster"):
            hero_roster.hide_roster()
        
        var quest_board = game_scene.get_node_or_null("UILayer/OverlayContainer/QuestBoardUI")
        if quest_board and quest_board.has_method("hide_quest_board"):
            quest_board.hide_quest_board()
        
        var inventory_ui = game_scene.get_node_or_null("UILayer/OverlayContainer/InventoryUI")
        if inventory_ui and inventory_ui.has_method("hide_inventory"):
            inventory_ui.hide_inventory()

func _update_gold() -> void:
    if gold_label and game_manager:
        gold_label.text = "💰 %,d" % game_manager.gold

func _on_category_selected(category: String) -> void:
    current_category = category
    _refresh_item_grid()
    _clear_detail()
    _set_message("Browsing: %s" % category.capitalize())

func _refresh_item_grid() -> void:
    if item_grid == null:
        return
    
    # Clear existing
    for child in item_grid.get_children():
        child.queue_free()
    
    item_grid.columns = GRID_COLS
    
    # Filter items by category
    var filtered_items: Array = []
    for item in _shop_items:
        var item_type = item.get("type", "")
        match current_category:
            "weapons":
                if item_type == "weapon":
                    filtered_items.append(item)
            "armor":
                if item_type in ["armor", "helmet", "boots"]:
                    filtered_items.append(item)
            "consumables":
                if item_type == "consumable":
                    filtered_items.append(item)
            "materials":
                if item_type == "material":
                    filtered_items.append(item)
    
    # Create slots
    for i in range(filtered_items.size()):
        var item = filtered_items[i]
        var slot = _create_item_slot(i, item)
        item_grid.add_child(slot)

func _create_item_slot(index: int, item: Dictionary) -> Control:
    var container = PanelContainer.new()
    container.custom_minimum_size = Vector2(GameTheme.SIZE_ICON_LARGE, GameTheme.SIZE_ICON_LARGE)
    container.set_meta("item_data", item)
    container.mouse_filter = Control.MOUSE_FILTER_STOP
    
    # Background based on rarity using UIGridSlot style
    var rarity_color = GameTheme.get_rarity_color(item.get("rarity", "common"))
    var style = StyleBoxFlat.new()
    style.bg_color = GameTheme.darken(rarity_color, 0.5)
    style.set_corner_radius_all(GameTheme.RADIUS_SMALL)
    style.border_color = rarity_color
    style.set_border_width_all(GameTheme.BORDER_THIN)
    container.add_theme_stylebox_override("panel", style)
    
    # Item icon using UIIcon component
    var icon = UIIcon.new()
    icon.setup_item(item)
    container.add_child(icon)
    
    return container

# =============================================================================
# Signal Handlers
# =============================================================================

func _on_close_pressed() -> void:
    hide_shop()

func _on_buy_pressed() -> void:
    if selected_item_index < 0:
        return
    var item = _shop_items[selected_item_index]
    var cost = item.get("value", 0)
    if game_manager and game_manager.gold >= cost:
        game_manager.spend_gold(cost)
        _set_message("Purchased: " + item.get("name", ""))
        _update_gold()
    else:
        _set_message("Not enough gold!")

func _on_sell_pressed() -> void:
    _set_message("Selling not implemented yet.")

# =============================================================================
# UI Helpers
# =============================================================================

func _clear_detail() -> void:
    if detail_label:
        detail_label.text = ""

func _set_message(msg: String) -> void:
    if message_label:
        message_label.text = msg

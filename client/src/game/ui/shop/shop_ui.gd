class_name ShopUI
extends Control

## UI for buying items and equipment from a local region shop.

@onready var item_list: VBoxContainer = $Panel/HBox/Left/Scroll/List
@onready var detail_name: Label = $Panel/HBox/Right/VBox/Name
@onready var detail_desc: Label = $Panel/HBox/Right/VBox/Description
@onready var detail_stats: Label = $Panel/HBox/Right/VBox/Stats
@onready var gold_label: Label = $Panel/GoldLabel
@onready var buy_button: Button = $Panel/HBox/Right/BuyButton

var selected_item: ItemData = null

func _ready():
    _update_gold()
    _populate_shop()

func _update_gold():
    gold_label.text = "Gold: %d" % GlobalGameManager.gold

func _populate_shop():
    # Use items from current region
    var region = AdventureManager.current_region
    if not region or region.shop_items.is_empty():
        _add_fallback_items()
        return
    
    for item in region.shop_items:
        _add_item_entry(item)

func _add_fallback_items():
    # If no items in region, show basic stuff for demo
    var p = load("res://data/items/Potion_Small.tres")
    if p: _add_item_entry(p)

func _add_item_entry(item: ItemData):
    var btn = Button.new()
    btn.text = "%s (%d G)" % [item.name, item.price]
    btn.custom_minimum_size = Vector2(0, 50)
    btn.pressed.connect(_on_item_selected.bind(item))
    item_list.add_child(btn)

func _on_item_selected(item: ItemData):
    selected_item = item
    detail_name.text = item.name
    detail_desc.text = item.description
    
    # Show stats if it's equipment
    if item is EquipmentData:
        var atk = item.stat_bonuses.get("attack_damage", 0)
        var def = item.stat_bonuses.get("defense", 0)
        var hp = item.stat_bonuses.get("health_max", 0)
        var spd = item.stat_bonuses.get("speed", 0)
        detail_stats.text = "ATK: +%d | DEF: +%d\nHP: +%d | SPD: +%d" % [atk, def, hp, spd]
    elif item is ConsumableData:
        detail_stats.text = "Restores: %d HP / %d Mana" % [item.hp_restore, item.mana_restore]
    else:
        detail_stats.text = ""
        
    buy_button.disabled = false

func _on_buy_pressed():
    if selected_item and GlobalGameManager.gold >= selected_item.price:
        GlobalGameManager.gold -= selected_item.price
        
        # INTEGRATION: Add to the unified Inventory Manager
        InventoryManager.add_item(selected_item)
        
        _update_gold()
        SaveManager.save_game()
        print("Bought: ", selected_item.name)
    else:
        print("Insufficient Gold!")

func _on_back_pressed():
    get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

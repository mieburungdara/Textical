class_name PartyManagerUI
extends Control

## Refined UI for managing all 50 units directly on a 5x10 grid.

@onready var formation_grid: FormationGridComponent = $FormationGridComponent
@onready var hero_details: HeroDetailsComponent = $HeroDetailsComponent
@onready var inventory_selector: InventorySelector = $InventorySelector

@warning_ignore("unused_signal")
signal formation_changed 

var last_selected_slot: EquipmentData.Slot

func _ready():
    for child in get_children():
        if child is BasePartyComponent:
            child.setup(self)
    
    formation_grid.setup_grid(GlobalGameManager.player_party)
    inventory_selector.item_selected.connect(_on_item_equipped)

func show_hero_details(data: HeroData):
    hero_details.display(data)

func _on_slot_clicked(slot_type: EquipmentData.Slot):
    if not hero_details.current_hero: return
    last_selected_slot = slot_type
    inventory_selector.open(slot_type)

func _on_item_equipped(item: ItemInstance):
    var hero = hero_details.current_hero
    if not hero: return
    
    # 1. Take off current item if exists and put back to bag
    var old_item = hero.equipment.get(last_selected_slot)
    if old_item:
        InventoryManager.unequip_item(old_item)
    
    # 2. Put on new item and remove from bag
    if item == null:
        hero.equipment.erase(last_selected_slot)
    else:
        hero.equipment[last_selected_slot] = item
        InventoryManager.equip_item(item)
    
    # Refresh UI
    hero_details.display(hero)
    SaveManager.save_game()

func _on_save_pressed():
    GlobalGameManager.player_party = formation_grid.get_formation_data()
    SaveManager.save_game()
    print("Formation & Party Saved!")

func _on_back_pressed():
    get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

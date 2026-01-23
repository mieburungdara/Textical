class_name AdventureHub
extends Control

## Main UI for exploring regions and selecting monster targets with scouting and quests.

@export var current_region: RegionData

@onready var monster_list: VBoxContainer = $UI/Main/MonsterPanel/Scroll/VBox
@onready var npc_list: VBoxContainer = $UI/Main/NPCPanel/Scroll/VBox
@onready var region_name_label: Label = $UI/Header/RegionName
@onready var info_label: Label = $UI/Main/InfoPanel/Description
@onready var npc_popup: NPCPanel = $UI/NPCInteractionPanel

# Preview Battle UI scene reference
var preview_scene = preload("res://src/game/ui/formation/BattlePreviewPopup.tscn")

func _ready():
    # 1. Restore region from manager (set during Load Game)
    if AdventureManager.current_region:
        current_region = AdventureManager.current_region
    
    # 2. Fallback to default if null (e.g. New Game)
    if not current_region:
        current_region = load("res://data/regions/StartingVillage.tres")
        AdventureManager.current_region = current_region
    
    if current_region:
        setup_region(current_region)
        
    # Connect signals
    if not npc_popup.quest_accepted.is_connected(_on_quest_accepted):
        npc_popup.quest_accepted.connect(_on_quest_accepted)

func setup_region(region: RegionData):
    current_region = region
    region_name_label.text = region.name
    info_label.text = region.description
    
    # Show monster list in wild, NPC list in safe zones
    $UI/Main/MonsterPanel.visible = !region.is_safe_zone
    $UI/Main/NPCPanel.visible = region.is_safe_zone
    
    _refresh_monster_list()
    _refresh_npc_list()

func _refresh_monster_list():
    for child in monster_list.get_children():
        child.queue_free()
    
    if current_region.is_safe_zone: return

    var scouting_power = _calculate_party_scouting_power()
    # More scouting skill means more visible targets
    var num_encounters = 3 + (scouting_power / 10)
    
    for i in range(num_encounters):
        var monster = current_region.encounter_pool.pick_random()
        if monster:
            _add_monster_entry(monster, scouting_power)

func _refresh_npc_list():
    for child in npc_list.get_children():
        child.queue_free()
        
    if not current_region.is_safe_zone: return
    
    # Add Tavern Button
    var tavern_btn = Button.new()
    tavern_btn.custom_minimum_size = Vector2(0, 50)
    tavern_btn.text = "Visit Tavern"
    tavern_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://src/game/ui/town/TavernUI.tscn"))
    npc_list.add_child(tavern_btn)
    
    # Add Shop Button
    var shop_btn = Button.new()
    shop_btn.custom_minimum_size = Vector2(0, 50)
    shop_btn.text = "Open Shop"
    shop_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://src/game/ui/shop/ShopUI.tscn"))
    npc_list.add_child(shop_btn)    
    for npc in current_region.npcs:
        if npc:
            var btn = Button.new()
            btn.custom_minimum_size = Vector2(0, 50)
            btn.text = "Talk to " + npc.name
            btn.pressed.connect(_on_npc_clicked.bind(npc))
            npc_list.add_child(btn)

func _add_monster_entry(data: MonsterData, _scout_power: int):
    var btn = Button.new()
    var level = randi_range(current_region.min_level, current_region.max_level)
    
    # Rarity Roll
    var rarity_text = ""
    var roll = randf()
    var actual_rarity = MonsterData.Rarity.COMMON
    
    if roll < 0.05: 
        actual_rarity = MonsterData.Rarity.RARE
        rarity_text = "[RARE] "
    elif roll < 0.2: 
        actual_rarity = MonsterData.Rarity.UNCOMMON
        rarity_text = "[UC] "
    
    btn.text = "%s%s (Lv. %d)" % [rarity_text, data.name, level]
    btn.alignment = HorizontalAlignment.HORIZONTAL_ALIGNMENT_LEFT
    
    match actual_rarity:
        MonsterData.Rarity.RARE: btn.add_theme_color_override("font_color", Color.GOLD)
        MonsterData.Rarity.UNCOMMON: btn.add_theme_color_override("font_color", Color.CYAN)
    
    btn.pressed.connect(_on_monster_selected.bind(data, level, actual_rarity))
    monster_list.add_child(btn)

func _on_monster_selected(data: MonsterData, level: int, rarity: int):
    # Determine enemy party size based on rarity
    var enemy_count = randi_range(1, 3)
    if rarity == MonsterData.Rarity.RARE: 
        enemy_count += 2
    
    var enemy_party: Array[MonsterData] = []
    for i in range(enemy_count):
        enemy_party.append(data)
    
    _show_battle_preview(enemy_party, level)

func _show_battle_preview(party: Array[MonsterData], level: int):
    var popup = preview_scene.instantiate() as BattlePreviewPopup
    add_child(popup)
    var scout_power = _calculate_party_scouting_power()
    popup.setup(party, scout_power)
    popup.attack_confirmed.connect(func(_p): _start_battle(party, level))

func _start_battle(enemies: Array[MonsterData], level: int):
    # Store battle data in Global Manager before switching scenes
    GlobalGameManager.enemy_party_to_load = enemies
    GlobalGameManager.enemy_level = level
    get_tree().change_scene_to_file("res://src/game/battle/BattleScene.tscn")

func _on_npc_clicked(npc: NPCData):
    npc_popup.setup(npc)

func _on_quest_accepted(quest: QuestData):
    if not GlobalGameManager.active_quests.has(quest):
        GlobalGameManager.active_quests.append(quest)

func _add_hero_to_party(hero_data: HeroData) -> bool:
    # Find first empty slot in 5x10 grid (x: 1..5, y: 0..9)
    for y in range(10):
        for x in range(1, 6): # Player area columns
            var pos = Vector2i(x, y) 
            if not GlobalGameManager.player_party.has(pos):
                GlobalGameManager.player_party[pos] = hero_data
                SaveManager.save_game()
                return true
    return false

func _calculate_party_scouting_power() -> int:
    var total = 10 # Base visibility
    for pos in GlobalGameManager.player_party:
        var hero = GlobalGameManager.player_party[pos]
        if hero is HeroData:
            # Check for scout-capable jobs (Archer/Rogue)
            if hero.current_job:
                var job_id = hero.current_job.id.to_lower()
                if "archer" in job_id or "rogue" in job_id or "ranger" in job_id:
                    total += 15
    return total

func _on_formation_pressed():
    get_tree().change_scene_to_file("res://src/game/ui/party/PartyManager.tscn")

func _on_inventory_pressed():
    get_tree().change_scene_to_file("res://src/game/ui/inventory/InventoryUI.tscn")

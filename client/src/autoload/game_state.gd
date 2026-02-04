extends Node

signal task_updated(task)
signal region_changed(new_data)

var current_user = null
var current_heroes = []
var inventory = []
var inventory_status = {"used": 0, "max": 20}
var inventory_is_dirty = true
var active_task = null
var current_region_type = "TOWN" 
var current_region_data = null:
    set(val):
        current_region_data = val
        region_changed.emit(val)

# PERSISTENCE
var selected_hero_id: int = -1
var last_selected_item_id: int = -1
var target_monster_id: int = -1
var last_visited_hub: String = "res://src/ui/TownScreen.tscn"

# GEOGRAPHIC ATLAS (5000x5000 World Grid)
const REGION_POSITIONS = {
    1: Vector2(2500, 2500), # Oakhaven Hub (CENTER)
    2: Vector2(1200, 1800), # Iron Mine (West)
    3: Vector2(800, 800),   # Crystal Depths (North West)
    4: Vector2(3800, 1800), # Elm Forest (East)
    5: Vector2(4200, 800)   # Forbidden Grove (North East)
}

const FLAVOR_LANDMARKS = [
    {"name": "Lake of Whispers", "pos": Vector2(2500, 1500)},
    {"name": "The Shattered Peaks", "pos": Vector2(500, 500)},
    {"name": "Ancient Sentinel Pillar", "pos": Vector2(4500, 4500)},
    {"name": "Siren's Whisp Falls", "pos": Vector2(1500, 1000)},
    {"name": "The Weeping Sands", "pos": Vector2(3500, 3500)},
    {"name": "Dead Man's Pass", "pos": Vector2(2500, 3200)},
    {"name": "Sun-King Observatory", "pos": Vector2(1000, 4000)}
]

func _ready():
    if ServerConnector and ServerConnector.has_signal("task_completed"):
        ServerConnector.task_completed.connect(_on_global_task_completed)
    
    # Add sample heroes for testing HeroProfileScreen
    _setup_sample_heroes()

func _setup_sample_heroes():
    var sample_heroes = [
        {
            "id": 1,
            "name": "Aldric the Brave",
            "level": 15,
            "rarity": "LEGENDARY",
            "combatClass": {"name": "Paladin"},
            "totalStats": {
                "hp": 2500,
                "mp": 450,
                "ap": 120,
                "attack": 380,
                "defense": 520,
                "magic_attack": 180,
                "magic_defense": 350,
                "speed": 85
            },
            "elementalAffinities": [{"fire": 10, "water": -5, "earth": 15, "wind": 0, "light": 25, "dark": -10}],
            "equipment": {
                "head": {"name": "Helm of Valor", "rarity": "RARE"},
                "body": {"name": "Divine Plate", "rarity": "EPIC"},
                "weapon": {"name": "Excalibur", "rarity": "LEGENDARY"},
                "offhand": {"name": "Shield of Faith", "rarity": "RARE"},
                "accessory": {"name": "Ring of Protection", "rarity": "RARE"}
            },
            "skills": ["Holy Strike", "Divine Shield", "Judgment"],
            "passives": ["Bash", "Armored"],
            "setBonuses": [{"name": "Divine Grace", "bonus": "+20% Defense"}]
        },
        {
            "id": 2,
            "name": "Lyra Moonwhisper",
            "level": 12,
            "rarity": "EPIC",
            "combatClass": {"name": "Mage"},
            "totalStats": {
                "hp": 1200,
                "mp": 980,
                "ap": 80,
                "attack": 150,
                "defense": 180,
                "magic_attack": 650,
                "magic_defense": 480,
                "speed": 120
            },
            "elementalAffinities": [{"fire": -10, "water": 30, "earth": 5, "wind": 20, "light": 15, "dark": -5}],
            "equipment": {
                "head": {"name": "Mystic Hood", "rarity": "RARE"},
                "body": {"name": "Arcane Robes", "rarity": "EPIC"},
                "weapon": {"name": "Staff of Wisdom", "rarity": "EPIC"},
                "offhand": {"name": "Spell Tome", "rarity": "RARE"},
                "accessory": {"name": "Amulet of Mana", "rarity": "RARE"}
            },
            "skills": ["Fireball", "Ice Spike", "Thunder"],
            "passives": ["Mana Boost", "Focus"],
            "setBonuses": [{"name": "Arcane Mastery", "bonus": "+15% Magic Attack"}]
        },
        {
            "id": 3,
            "name": "Garret Shadowstep",
            "level": 18,
            "rarity": "RARE",
            "combatClass": {"name": "Rogue"},
            "totalStats": {
                "hp": 1800,
                "mp": 380,
                "ap": 150,
                "attack": 420,
                "defense": 280,
                "magic_attack": 120,
                "magic_defense": 200,
                "speed": 200
            },
            "elementalAffinities": [{"fire": 5, "water": 0, "earth": -5, "wind": 15, "light": -15, "dark": 30}],
            "equipment": {
                "head": {"name": "Shadow Hood", "rarity": "RARE"},
                "body": {"name": "Leather Armor", "rarity": "COMMON"},
                "weapon": {"name": "Dagger of Venom", "rarity": "RARE"},
                "offhand": {"name": "Poison Vial", "rarity": "COMMON"},
                "accessory": {"name": "Cloak of Shadows", "rarity": "RARE"}
            },
            "skills": ["Backstab", "Shadow Walk", "Assassinate"],
            "passives": ["Critical Strike", "Evasion"],
            "setBonuses": []
        },
        {
            "id": 4,
            "name": "Thorin Ironforge",
            "level": 10,
            "rarity": "COMMON",
            "combatClass": {"name": "Warrior"},
            "totalStats": {
                "hp": 2200,
                "mp": 200,
                "ap": 100,
                "attack": 350,
                "defense": 400,
                "magic_attack": 50,
                "magic_defense": 150,
                "speed": 70
            },
            "elementalAffinities": [{"fire": 10, "water": -5, "earth": 20, "wind": 0, "light": 5, "dark": -5}],
            "equipment": {
                "head": {"name": "Iron Helm", "rarity": "COMMON"},
                "body": {"name": "Chainmail", "rarity": "COMMON"},
                "weapon": {"name": "Iron Sword", "rarity": "COMMON"},
                "offhand": {"name": "Wooden Shield", "rarity": "COMMON"},
                "accessory": {"name": "Basic Badge", "rarity": "COMMON"}
            },
            "skills": ["Slash", "Block", "Charge"],
            "passives": ["Endurance", "Toughness"],
            "setBonuses": []
        },
        {
            "id": 5,
            "name": "Seraphina Lightbringer",
            "level": 20,
            "rarity": "MYTHIC",
            "combatClass": {"name": "Cleric"},
            "totalStats": {
                "hp": 2800,
                "mp": 800,
                "ap": 140,
                "attack": 280,
                "defense": 450,
                "magic_attack": 550,
                "magic_defense": 600,
                "speed": 95
            },
            "elementalAffinities": [{"fire": 5, "water": 10, "earth": 5, "wind": 5, "light": 50, "dark": -30}],
            "equipment": {
                "head": {"name": "Divine Crown", "rarity": "MYTHIC"},
                "body": {"name": "Celestial Robes", "rarity": "MYTHIC"},
                "weapon": {"name": "Scepter of Dawn", "rarity": "MYTHIC"},
                "offhand": {"name": "Holy Grail", "rarity": "LEGENDARY"},
                "accessory": {"name": "Angel Wings", "rarity": "MYTHIC"}
            },
            "skills": ["Divine Light", "Healing Grace", "Resurrection", "Smite"],
            "passives": ["Divine Blessing", "Spirit Ward", "Miracle Worker"],
            "setBonuses": [{"name": "Divine Trinity", "bonus": "+30% All Stats"}, {"name": "Celestial Fury", "bonus": "+25% Light Damage"}]
        }
    ]
    
    current_heroes = sample_heroes
    print("[STATE] Sample heroes loaded: ", current_heroes.size(), " heroes")

func _on_global_task_completed(data):
    if data.type == "TRAVEL":
        if data.has("targetRegion"):
            current_region_data = data.targetRegion
        elif data.has("targetRegionId"):
            current_region_data = DataManager.get_region(int(data.targetRegionId))
        
        if current_user:
            current_user.currentRegion = int(data.get("targetRegionId", current_user.currentRegion))

func set_active_task(task_data):
    active_task = task_data
    task_updated.emit(active_task)
    if active_task:
        print("[STATE] Task Active: ", active_task.type)
    else:
        print("[STATE] Task Cleared (IDLE)")

func set_user(user_data):
    if not user_data is Dictionary: return
    current_user = user_data
    
    var new_task = null
    if user_data.has("activeTask"):
        new_task = user_data.activeTask
    elif user_data.has("taskQueue"):
        var queue = user_data.get("taskQueue", [])
        new_task = queue[0] if queue.size() > 0 else null
    
    set_active_task(new_task)
    print("[STATE] User Synced. Region: ", current_user.get("currentRegion"))

func set_inventory(data):
    if not data is Dictionary: return
    if data.has("items"): inventory = data.items
    if data.has("status"): inventory_status = data.status
    inventory_is_dirty = false

func set_heroes(data):
    current_heroes = data

func update_vitality(new_vitality):
    if current_user:
        current_user.vitality = new_vitality

func get_region_scene(r_type: String) -> String:
    match r_type.to_upper():
        "TOWN": return "res://src/ui/TownScreen.tscn"
        "FOREST": return "res://src/ui/regions/ForestScreen.tscn"
        "MINE": return "res://src/ui/regions/MineScreen.tscn"
        "DUNGEON": return "res://src/ui/regions/DungeonScreen.tscn"
        "RUINS": return "res://src/ui/regions/RuinsScreen.tscn"
        "VOLCANO": return "res://src/ui/regions/VolcanoScreen.tscn"
        "DESERT": return "res://src/ui/regions/DesertScreen.tscn"
        "SNOW": return "res://src/ui/regions/SnowScreen.tscn"
        "SWAMP": return "res://src/ui/regions/SwampScreen.tscn"
        "GRAVEYARD": return "res://src/ui/regions/GraveyardScreen.tscn"
        "OCEAN": return "res://src/ui/regions/OceanScreen.tscn"
        "HELL": return "res://src/ui/regions/HellScreen.tscn"
        "GARDEN": return "res://src/ui/regions/GardenScreen.tscn"
        "WASTELAND": return "res://src/ui/regions/WastelandScreen.tscn"
        "STORM": return "res://src/ui/regions/StormScreen.tscn"
        "AUTUMN": return "res://src/ui/regions/AutumnScreen.tscn"
        "CORAL": return "res://src/ui/regions/CoralScreen.tscn"
        "ICE": return "res://src/ui/regions/GlacierScreen.tscn"
        "LAVA": return "res://src/ui/regions/LavaScreen.tscn"
        "FAIRY": return "res://src/ui/regions/FairyScreen.tscn"
        "ARENA": return "res://src/ui/regions/ArenaScreen.tscn"
        "CASTLE": return "res://src/ui/regions/CastleScreen.tscn"
        "SHIP": return "res://src/ui/regions/ShipScreen.tscn"
        "PRISON": return "res://src/ui/regions/PrisonScreen.tscn"
        "GIANT": return "res://src/ui/regions/GiantScreen.tscn"
        _: return "res://src/ui/regions/ForestScreen.tscn" # Fallback

func is_in_town():
    return current_user and current_user.currentRegion == 1

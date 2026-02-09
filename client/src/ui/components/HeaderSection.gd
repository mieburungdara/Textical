extends VBoxContainer
class_name HeaderSection

## HeaderSection - Component untuk menampilkan header hero
## Features: Avatar, name, level, class, rarity, dan stats summary

# === NODE REFERENCES ===
@onready var avatar_frame: PanelContainer = $AvatarFrame
@onready var avatar_initial: Label = $AvatarFrame/AvatarInitial
@onready var rarity_frame: ColorRect = $AvatarFrame/RarityFrame
@onready var name_label: Label = $InfoSection/NameLabel
@onready var level_label: Label = $InfoSection/ClassLevelRow/LevelLabel
@onready var rarity_label: Label = $InfoSection/RarityLabel
@onready var class_label: Label = $InfoSection/ClassLevelRow/ClassLabel
@onready var stats_summary: StatsSummary = $InfoSection/StatsSummary

# === PUBLIC METHODS ===

## Update semua informasi header hero
## @param name: Nama hero
## @param level: Level hero
## @param rarity: Rarity hero (COMMON, RARE, EPIC, LEGENDARY, MYTHIC)
## @param combat_class: Class hero
## @param stats: Dictionary berisi stat hero
func update_header(hero_name: String, level: int, rarity: String, combat_class: String, stats: Dictionary):
    # Update name
    if name_label:
        name_label.text = hero_name
    
    # Update level
    if level_label:
        level_label.text = "Level %d" % level
    
    # Update rarity
    if rarity_label:
        rarity_label.text = rarity
        _rarity_color(rarity)
    
    # Update class
    if class_label:
        class_label.text = combat_class
    
    # Update avatar initial
    if avatar_initial:
        avatar_initial.text = hero_name.substr(0, 1).to_upper()
    
    # Update stats
    if stats_summary:
        stats_summary.update_stats_from_dict(stats)


## Update hanya nama hero
func update_name(_name: String):
    if name_label:
        name_label.text = _name


## Update hanya level
func update_level(level: int):
    if level_label:
        level_label.text = "Level %d" % level


## Update rarity dan warna
func update_rarity(rarity: String):
    if rarity_label:
        rarity_label.text = rarity
        _rarity_color(rarity)


## Update class
func update_class(combat_class: String):
    if class_label:
        class_label.text = combat_class


## Update avatar initial
func update_avatar_initial(initial: String):
    if avatar_initial:
        avatar_initial.text = initial


## Update stats summary
func update_stats(stats: Dictionary):
    if stats_summary:
        stats_summary.update_stats_from_dict(stats)


## Reset semua display ke default
func reset_display():
    if name_label:
        name_label.text = "Hero Name"
    if level_label:
        level_label.text = "Level 1"
    if rarity_label:
        rarity_label.text = "COMMON"
    if class_label:
        class_label.text = "Warrior"
    if avatar_initial:
        avatar_initial.text = "H"
    if stats_summary:
        stats_summary.reset_stats()


# === PRIVATE METHODS ===

func _rarity_color(rarity: String):
    if not rarity_label: return
    
    var color_map = {
        "COMMON": Color(0.8, 0.8, 0.8),
        "RARE": Color(1.0, 0.8, 0.0),
        "EPIC": Color(0.6, 0.4, 1.0),
        "LEGENDARY": Color(1.0, 0.4, 0.0),
        "MYTHIC": Color(1.0, 0.2, 0.2)
    }
    var color = color_map.get(rarity, color_map["COMMON"])
    rarity_label.add_theme_color_override("font_color", color)

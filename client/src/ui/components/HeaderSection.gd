extends VBoxContainer
class_name HeaderSection

## HeaderSection - Component untuk menampilkan header hero
## Features: Avatar, name, level, class, rarity, stats summary, dan reputation

# === NODE REFERENCES ===
@onready var avatar_frame: PanelContainer = $AvatarFrame
@onready var avatar_initial: Label = $AvatarFrame/AvatarInitial
@onready var rarity_frame: ColorRect = $AvatarFrame/RarityFrame
@onready var name_label: Label = $InfoSection/NameLabel
@onready var level_label: Label = $InfoSection/ClassLevelRow/LevelLabel
@onready var rarity_label: Label = $InfoSection/RarityLabel
@onready var class_label: Label = $InfoSection/ClassLevelRow/ClassLabel
@onready var stats_summary: StatsSummary = $InfoSection/StatsSummary
@onready var reputation_label: Label = $InfoSection/ReputationLabel

# === PRIVATE VARIABLES ===
var _reputation_handler = null

func _ready():
	_reputation_handler = get_node_or_null("/root/ReputationHandler")
	if reputation_label:
		reputation_label.visible = false

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


## Update reputation display
func update_reputation(user_id: int):
	if _reputation_handler and user_id > 0:
		_reputation_handler.get_user_reputation(user_id)
		if not _reputation_handler.reputation_received.is_connected(_on_reputation_received):
			_reputation_handler.reputation_received.connect(_on_reputation_received)

func _on_reputation_received(stats: Dictionary):
	if reputation_label:
		var likes = stats.get("totalLikes", 0)
		var dislikes = stats.get("totalDislikes", 0)
		var tier = stats.get("likeTier", "NEWCOMER")
		var badge_info = ReputationHandler.get_badge_info(tier)
		var icon = badge_info.get("icon", "⚪")
		var special = ReputationHandler.get_special_badge(likes, dislikes)
		if not special.is_empty():
			icon = special.get("icon", icon)
		reputation_label.text = "%s ❤️%d 💔%d" % [icon, likes, dislikes]
		reputation_label.visible = true


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
    if reputation_label:
        reputation_label.visible = false


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

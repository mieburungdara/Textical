extends PanelContainer
class_name SkillListItem

# === NODE REFERENCES ===
@onready var icon_rect: ColorRect = $HBox/IconContainer/IconRect
@onready var type_label: Label = $HBox/IconContainer/TypeLabel
@onready var name_label: Label = $HBox/DetailContainer/Header/NameLabel
@onready var mp_label: Label = $HBox/DetailContainer/Header/CostContainer/MPLabel
@onready var cd_label: Label = $HBox/DetailContainer/Header/CostContainer/CDLabel
@onready var desc_label: Label = $HBox/DetailContainer/DescLabel
@onready var mastery_label: Label = $HBox/DetailContainer/MasteryLabel  # Mastery/Tier display
@onready var style_box: StyleBoxFlat = get_theme_stylebox("panel").duplicate()

# === CONSTANTS ===
const ELEMENT_COLORS = {
	"FIRE": Color(0.8, 0.3, 0.2),
	"WATER": Color(0.2, 0.4, 0.8),
	"EARTH": Color(0.4, 0.6, 0.2),
	"WIND": Color(0.4, 0.8, 0.6),
	"LIGHT": Color(0.9, 0.9, 0.7),
	"DARK": Color(0.3, 0.2, 0.4),
	"PHYSICAL": Color(0.6, 0.6, 0.6),
	"POISON": Color(0.5, 0.8, 0.2),
	"THUNDER": Color(0.9, 0.8, 0.2),
	"ICE": Color(0.4, 0.8, 0.9)
}

# Mastery level colors (Active Skills)
const MASTERY_COLORS = {
	"NOVICE": Color(0.5, 0.5, 0.5),
	"APPRENTICE": Color(0.2, 0.8, 0.2),
	"EXPERT": Color(0.2, 0.6, 0.9),
	"MASTER": Color(0.6, 0.3, 0.9),
	"GRANDMASTER": Color(0.9, 0.7, 0.2)
}

# Trait Tier Badge Colors (Passive Traits) — Premium Visual
const TIER_COLORS = {
	1: Color(0.72, 0.53, 0.30),   # Bronze — warm copper
	2: Color(0.75, 0.78, 0.82),   # Silver — cool platinum
	3: Color(0.95, 0.80, 0.20)    # Gold — rich aureate
}

const TIER_GLOW_COLORS = {
	1: Color(0.72, 0.53, 0.30, 0.25),
	2: Color(0.75, 0.78, 0.82, 0.30),
	3: Color(0.95, 0.80, 0.20, 0.35)
}

const TIER_ROMAN = {1: "I", 2: "II", 3: "III"}

# Trait Category Colors (border accent)
const CATEGORY_COLORS = {
	"OFFENSIVE": Color(0.85, 0.25, 0.25),
	"DEFENSIVE": Color(0.25, 0.55, 0.85),
	"MAGIC": Color(0.55, 0.25, 0.85),
	"UTILITY": Color(0.25, 0.75, 0.55),
	"HIDDEN": Color(0.45, 0.45, 0.45),
	"GENERAL": Color(0.60, 0.60, 0.60),
	"TRAIT": Color(0.50, 0.50, 0.50)
}

func _ready():
	add_theme_stylebox_override("panel", style_box)

## Setup data skill/trait ke UI
func setup(skill_data: Dictionary, is_passive: bool = false):
	# 1. Basic Info
	var skill_name = skill_data.get("name", "Unknown Skill")
	name_label.text = skill_name
	
	var desc = skill_data.get("description", "No description available.")
	desc_label.text = desc
	
	# 2. Element & Type Styling
	var element = str(skill_data.get("element", "PHYSICAL")).to_upper()
	var category = str(skill_data.get("category", "SKILL")).to_upper()
	
	if is_passive:
		category = str(skill_data.get("category", "TRAIT")).to_upper()
	
	type_label.text = category
	
	# Warnai border dan icon berdasarkan elemen/kategori
	var theme_color: Color
	if is_passive:
		theme_color = CATEGORY_COLORS.get(category, Color(0.5, 0.5, 0.5))
	else:
		theme_color = ELEMENT_COLORS.get(element, Color(0.5, 0.5, 0.5))
	
	style_box.border_color = theme_color
	icon_rect.color = theme_color

	# 3. Tier Badge System (Passive Traits - Premium Visual)
	if is_passive:
		var trait_level: int = int(skill_data.get("level", 1))
		_render_tier_badge(trait_level)
	else:
		# Active Skill: Mastery Display
		var mastery_level = skill_data.get("mastery_level", "NOVICE")
		var mastery_use_count = skill_data.get("mastery_use_count", 0)
		var mastery_bonus = skill_data.get("mastery_bonus", "")
		
		if mastery_level != "NOVICE" and mastery_level != "":
			var next_threshold = _get_next_threshold(mastery_level)
			var progress_text = " (%d/%d uses)" % [mastery_use_count, next_threshold]
			mastery_label.text = "[%s]%s" % [mastery_level, progress_text]
			mastery_label.modulate = MASTERY_COLORS.get(mastery_level, Color(0.5, 0.5, 0.5))
			mastery_label.visible = true
		else:
			mastery_label.visible = false

	# 4. Stats (Active Only)
	if not is_passive:
		var mana_cost = skill_data.get("manaCost", 0)
		var cooldown = skill_data.get("cooldown", 0)
		
		if mana_cost > 0:
			mp_label.text = "%d MP" % mana_cost
			mp_label.visible = true
			mp_label.modulate = Color(0.4, 0.7, 1.0)
		else:
			mp_label.visible = false
			
		if cooldown > 0:
			cd_label.text = "%ds CD" % cooldown
			cd_label.visible = true
			cd_label.modulate = Color(1.0, 0.8, 0.4)
		else:
			cd_label.visible = false
	else:
		# Hide cost labels for passives
		mp_label.visible = false
		cd_label.visible = false

## Render premium tier badge for passive traits
func _render_tier_badge(level: int):
	var tier_color: Color = TIER_COLORS.get(level, TIER_COLORS[1])
	var glow_color: Color = TIER_GLOW_COLORS.get(level, TIER_GLOW_COLORS[1])
	var roman: String = TIER_ROMAN.get(level, "I")
	
	# Build badge text with tier roman numeral
	mastery_label.text = "⬥ Tier %s" % roman
	mastery_label.modulate = tier_color
	mastery_label.visible = true
	
	# Apply subtle glow effect via border enhancement
	style_box.border_width_left = 3
	style_box.border_color = tier_color
	
	# Gold tier gets extra visual flair
	if level >= 3:
		style_box.shadow_color = glow_color
		style_box.shadow_size = 4
		# Append sparkle to name for legendary emphasis
		name_label.text = "✦ " + name_label.text

## Get next threshold for mastery progress display
func _get_next_threshold(current_level: String) -> int:
	match current_level:
		"NOVICE": return 100
		"APPRENTICE": return 250
		"EXPERT": return 500
		"MASTER": return 1000
		_: return 1000

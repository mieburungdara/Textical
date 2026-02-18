extends PanelContainer
class_name SkillListItem

# === NODE REFERENCES ===
@onready var icon_rect: ColorRect = $HBox/IconContainer/IconRect
@onready var type_label: Label = $HBox/IconContainer/TypeLabel
@onready var name_label: Label = $HBox/DetailContainer/Header/NameLabel
@onready var mp_label: Label = $HBox/DetailContainer/Header/CostContainer/MPLabel
@onready var cd_label: Label = $HBox/DetailContainer/Header/CostContainer/CDLabel
@onready var desc_label: Label = $HBox/DetailContainer/DescLabel
@onready var mastery_label: Label = $HBox/DetailContainer/MasteryLabel  # NEW: Mastery display
@onready var style_box: StyleBoxFlat = get_theme_stylebox("panel").duplicate()

# === CONSTANTS ===
const ELEMENT_COLORS = {
	"FIRE": Color(0.8, 0.3, 0.2), # Merah Kemerahan
	"WATER": Color(0.2, 0.4, 0.8), # Biru Laut
	"EARTH": Color(0.4, 0.6, 0.2), # Hijau Tanah
	"WIND": Color(0.4, 0.8, 0.6), # Hijau Angin/Teal
	"LIGHT": Color(0.9, 0.9, 0.7), # Putih Kekuningan
	"DARK": Color(0.3, 0.2, 0.4), # Ungu Gelap
	"PHYSICAL": Color(0.6, 0.6, 0.6), # Abu-abu
	"POISON": Color(0.5, 0.8, 0.2), # Hijau Racun
	"THUNDER": Color(0.9, 0.8, 0.2), # Kuning Petir
	"ICE": Color(0.4, 0.8, 0.9) # Biru Es - Cyan
}

# Mastery level colors
const MASTERY_COLORS = {
	"NOVICE": Color(0.5, 0.5, 0.5),      # Gray
	"APPRENTICE": Color(0.2, 0.8, 0.2),  # Green
	"EXPERT": Color(0.2, 0.6, 0.9),      # Blue
	"MASTER": Color(0.6, 0.3, 0.9),      # Purple
	"GRANDMASTER": Color(0.9, 0.7, 0.2)   # Gold
}

func _ready():
	# Gunakan stylebox unik agar perubahan warna border tidak mempengaruhi instance lain
	add_theme_stylebox_override("panel", style_box)

## Setup data skill ke UI
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
		category = "PASSIVE"
	
	type_label.text = category
	
	# Warnai border dan icon berdasarkan elemen
	var theme_color = ELEMENT_COLORS.get(element, Color(0.5, 0.5, 0.5))
	style_box.border_color = theme_color
	icon_rect.color = theme_color # Placeholder icon visual
	
	# Jika ada icon path di masa depan, load di sini
	# if skill_data.has("icon_path"): ...
	
	# 3. Mastery Display (NEW)
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
			mp_label.modulate = Color(0.4, 0.7, 1.0) # Light Blue manually ensured
		else:
			mp_label.visible = false
			
		if cooldown > 0:
			cd_label.text = "%ds CD" % cooldown
			cd_label.visible = true
			cd_label.modulate = Color(1.0, 0.8, 0.4) # Gold manually ensured
		else:
			cd_label.visible = false
	else:
		# Hide cost labels for passives
		mp_label.visible = false
		cd_label.visible = false

## Get next threshold for progress display
func _get_next_threshold(current_level: String) -> int:
	match current_level:
		"NOVICE": return 100
		"APPRENTICE": return 250
		"EXPERT": return 500
		"MASTER": return 1000
		_: return 1000  # Grandmaster max

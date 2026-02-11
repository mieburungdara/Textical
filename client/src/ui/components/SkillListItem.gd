extends PanelContainer
class_name SkillListItem

# === NODE REFERENCES ===
@onready var icon_rect: ColorRect = $HBox/IconContainer/IconRect
@onready var type_label: Label = $HBox/IconContainer/TypeLabel
@onready var name_label: Label = $HBox/DetailContainer/Header/NameLabel
@onready var mp_label: Label = $HBox/DetailContainer/Header/CostContainer/MPLabel
@onready var cd_label: Label = $HBox/DetailContainer/Header/CostContainer/CDLabel
@onready var desc_label: Label = $HBox/DetailContainer/DescLabel
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
	
	# 3. Stats (Active Only)
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

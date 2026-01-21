class_name HeroCard
extends Control

## Visual representation of a unit in a card style (Yu-Gi-Oh inspired).

@onready var name_label: Label = $CardFrame/VBox/Header/Name
@onready var art_rect: TextureRect = $CardFrame/VBox/ArtFrame/Art
@onready var class_label: Label = $CardFrame/VBox/SubHeader/Class
@onready var level_label: Label = $CardFrame/VBox/SubHeader/Level
@onready var hp_val: Label = $CardFrame/VBox/Stats/HP/Value
@onready var atk_val: Label = $CardFrame/VBox/Stats/ATK/Value
@onready var def_val: Label = $CardFrame/VBox/Stats/DEF/Value
@onready var desc_label: RichTextLabel = $CardFrame/VBox/Description/Text

func setup(data: UnitData):
	name_label.text = data.name.to_upper()
	art_rect.texture = data.icon if data.icon else PlaceholderTexture2D.new()
	art_rect.modulate = data.model_color
	
	# Class & Level (using HeroData specifics if available)
	if data is HeroData:
		class_label.text = data.current_job.display_name if data.current_job else "NO CLASS"
		level_label.text = "Lv. %d" % data.level
	else:
		class_label.text = "MONSTER"
		level_label.text = "Lv. ?"
		
	# Stats
	hp_val.text = str(data.hp_base)
	atk_val.text = str(data.damage_base)
	def_val.text = str(data.defense_base)
	
	# Description
	desc_label.text = data.description if data.description != "" else "A mysterious warrior from distant lands."
	
	# Optional: Change card border color based on rarity/class
	var style = $CardFrame.get_theme_stylebox("panel").duplicate()
	style.border_color = data.model_color.lerp(Color.BLACK, 0.3)
	$CardFrame.add_theme_stylebox_override("panel", style)

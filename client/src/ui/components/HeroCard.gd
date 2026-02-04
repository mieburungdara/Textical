extends Button
class_name HeroCard

## HeroCard - UI component untuk menampilkan hero dalam grid
## Features: Rarity color border, hover effects, selection state

signal hero_selected(hero_data: Dictionary)

# === EXPORT VARIABLES ===
@export var hero_data: Dictionary = {}

# === NODE REFERENCES ===
@onready var border_frame: ColorRect = $BorderFrame
@onready var background: TextureRect = $Background
@onready var avatar_initial: Label = $Background/AvatarInitial
@onready var info_container: VBoxContainer = $InfoContainer
@onready var name_label: Label = $InfoContainer/NameLabel
@onready var level_class_label: Label = $InfoContainer/LevelClassLabel
@onready var rarity_label: Label = $InfoContainer/RarityLabel
@onready var selection_indicator: ColorRect = $SelectionIndicator
@onready var glow_rect: ColorRect = $GlowRect

# === PRIVATE VARIABLES ===
var _rarity_colors: Dictionary = {
	"COMMON": Color(0.8, 0.8, 0.8, 1.0),
	"RARE": Color(1.0, 0.8, 0.0, 1.0),
	"EPIC": Color(0.6, 0.4, 1.0, 1.0),
	"LEGENDARY": Color(1.0, 0.4, 0.0, 1.0),
	"MYTHIC": Color(1.0, 0.2, 0.2, 1.0)
}

var _is_selected: bool = false
var _hover_tween: Tween

func _ready():
	_setup_ui()
	_connect_signals()
	_update_display()

func _setup_ui():
	# Set custom styles
	custom_minimum_size = Vector2(120, 160)
	size_flags_vertical = Control.SIZE_SHRINK_CENTER
	
	# Setup selection indicator
	selection_indicator.visible = false
	
	# Setup glow for high rarity
	glow_rect.visible = false

func _connect_signals():
	pressed.connect(_on_pressed)
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

# === PUBLIC METHODS ===

func set_hero_data(data: Dictionary):
	hero_data = data
	_update_display()

func set_selected(selected: bool):
	_is_selected = selected
	selection_indicator.visible = selected
	_modulate_effects()

# === PRIVATE METHODS ===

func _update_display():
	if hero_data.is_empty():
		return
	
	# Name
	name_label.text = hero_data.get("name", "Unknown")
	
	# Level and Class
	var level = int(hero_data.get("level", 1))
	var combat_class = hero_data.get("combatClass", {})
	var hero_class_name = ""
	if combat_class is Dictionary:
		hero_class_name = combat_class.get("name", "Unit")
	elif combat_class is String:
		hero_class_name = combat_class
	else:
		hero_class_name = "Unit"
	
	level_class_label.text = "Lv.%d %s" % [level, hero_class_name]
	
	# Rarity
	var rarity = hero_data.get("rarity", "COMMON")
	rarity_label.text = rarity
	_rarity_label_color(rarity)
	
	# Avatar initial
	var name = hero_data.get("name", "U")
	avatar_initial.text = name.substr(0, 1).to_upper()
	
	# Set border color based on rarity
	_set_rarity_border(rarity)
	
	# Avatar image (placeholder for now - would load actual texture)
	# TODO: Load hero image from assets

func _set_rarity_border(rarity: String):
	var color = _rarity_colors.get(rarity, _rarity_colors["COMMON"])
	border_frame.color = color
	
	# Show glow for high rarity
	if rarity in ["EPIC", "LEGENDARY", "MYTHIC"]:
		glow_rect.visible = true
		glow_rect.color = color
		glow_rect.color.a = 0.3
		_start_glow_animation()

func _rarity_label_color(rarity: String):
	var color = _rarity_colors.get(rarity, _rarity_colors["COMMON"])
	rarity_label.add_theme_color_override("font_color", color)

func _on_pressed():
	hero_selected.emit(hero_data)

func _on_mouse_entered():
	if _hover_tween:
		_hover_tween.kill()
	
	_hover_tween = create_tween()
	_hover_tween.set_parallel(true)
	_hover_tween.tween_property(self, "scale", Vector2(1.05, 1.05), 0.15).set_trans(Tween.TRANS_CUBIC)
	
	# Brighten border
	var border_tween = create_tween()
	border_tween.tween_property(border_frame, "color:a", 1.0, 0.1)

func _on_mouse_exited():
	if _hover_tween:
		_hover_tween.kill()
	
	_hover_tween = create_tween()
	_hover_tween.set_parallel(true)
	_hover_tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.15).set_trans(Tween.TRANS_CUBIC)
	
	# Restore border alpha
	var border_tween = create_tween()
	border_tween.tween_property(border_frame, "color:a", 0.8, 0.1)

func _modulate_effects():
	if _is_selected:
		modulate = Color(1.0, 1.0, 1.0, 1.0)
		border_frame.color.a = 1.0
	else:
		modulate = Color(1.0, 1.0, 1.0, 0.9)

func _start_glow_animation():
	if not glow_rect.visible:
		return
	
	if _hover_tween:
		_hover_tween.kill()
	
	_hover_tween = create_tween()
	_hover_tween.set_loops()
	_hover_tween.tween_property(glow_rect, "color:a", 0.5, 0.8).set_trans(Tween.TRANS_SINE)
	_hover_tween.tween_property(glow_rect, "color:a", 0.2, 0.8).set_trans(Tween.TRANS_SINE)

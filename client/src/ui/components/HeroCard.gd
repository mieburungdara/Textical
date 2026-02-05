extends Button
class_name HeroCard

## HeroCard - UI component untuk menampilkan hero dalam grid
## Features: Hero image support, rarity color border, hover effects, selection state

signal hero_selected(hero_data: Dictionary)

# === EXPORT VARIABLES ===
@export var hero_data: Dictionary = {}
@export var show_stats_bar: bool = true

# === NODE REFERENCES ===
@onready var border_frame: ColorRect = $BorderFrame
@onready var portrait_container: Control = $PortraitContainer
@onready var hero_texture: TextureRect = $PortraitContainer/HeroTexture
@onready var avatar_initial: Label = $PortraitContainer/AvatarInitial
@onready var rarity_badge: PanelContainer = $PortraitContainer/RarityBadge
@onready var rarity_label: Label = $PortraitContainer/RarityBadge/RarityLabel
@onready var glow_frame: ColorRect = $GlowFrame
@onready var selection_highlight: ColorRect = $SelectionHighlight
@onready var info_container: VBoxContainer = $InfoContainer
@onready var name_label: Label = $InfoContainer/NameLabel
@onready var level_class_label: Label = $InfoContainer/LevelClassLabel
@onready var stats_bar: ProgressBar = $InfoContainer/StatsBar
@onready var selection_indicator: ColorRect = $SelectionIndicator

# === RARITY COLORS ===
var _rarity_colors: Dictionary = {
    "COMMON": {"border": Color(0.7, 0.7, 0.7, 0.6), "glow": Color(0.7, 0.7, 0.7, 0.0), "badge": Color(0.6, 0.6, 0.6)},
    "RARE": {"border": Color(1.0, 0.75, 0.0, 0.7), "glow": Color(1.0, 0.75, 0.0, 0.0), "badge": Color(1.0, 0.8, 0.0)},
    "EPIC": {"border": Color(0.6, 0.4, 1.0, 0.8), "glow": Color(0.6, 0.4, 1.0, 0.0), "badge": Color(0.7, 0.5, 1.0)},
    "LEGENDARY": {"border": Color(1.0, 0.45, 0.0, 0.9), "glow": Color(1.0, 0.5, 0.0, 0.0), "badge": Color(1.0, 0.5, 0.0)},
    "MYTHIC": {"border": Color(1.0, 0.2, 0.3, 1.0), "glow": Color(1.0, 0.2, 0.3, 0.0), "badge": Color(1.0, 0.3, 0.4)}
}

var _rarity_stars: Dictionary = {
    "COMMON": "★",
    "RARE": "★★",
    "EPIC": "★★★",
    "LEGENDARY": "★★★★",
    "MYTHIC": "★★★★★"
}

# === PRIVATE VARIABLES ===
var _is_selected: bool = false
var _hover_tween: Tween
var _glow_tween: Tween
var _default_scale: Vector2 = Vector2(1.0, 1.0)

func _ready():
    _setup_ui()
    _connect_signals()
    _update_display()

func _setup_ui():
    # Set card size for portrait mode
    custom_minimum_size = Vector2(100, 140)
    size_flags_vertical = Control.SIZE_SHRINK_CENTER
    
    # Setup selection indicator
    selection_indicator.visible = false
    
    # Setup glow frame
    glow_frame.visible = false
    
    # Setup stats bar
    if stats_bar:
        stats_bar.show_percentage = false
        stats_bar.custom_minimum_size = Vector2(0, 4)
    
    # Setup avatar initial visibility (hidden when texture is set)
    avatar_initial.visible = true

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
    
    if selection_indicator:
        selection_indicator.visible = selected
    
    if selection_highlight:
        selection_highlight.visible = selected
    
    _modulate_effects()

# === PRIVATE METHODS ===

func _update_display():
    if hero_data.is_empty():
        return
    
    # Name
    if name_label:
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
    
    if level_class_label:
        level_class_label.text = "Lv.%d %s" % [level, hero_class_name]
    
    # Rarity
    var rarity = hero_data.get("rarity", "COMMON")
    if rarity_label:
        rarity_label.text = _rarity_stars.get(rarity, "★")
    
    _set_rarity_visuals(rarity)
    
    # Avatar initial
    var name = hero_data.get("name", "U")
    if avatar_initial:
        avatar_initial.text = name.substr(0, 1).to_upper()
    
    # Load hero image (placeholder - would load actual texture)
    _load_hero_image()
    
    # Update stats bar
    _update_stats_bar()

func _load_hero_image():
    # Try to load hero image from assets
    var hero_id = hero_data.get("id", 0)
    var image_path = "res://assets/heroes/hero_%d.png" % hero_id
    
    if ResourceLoader.exists(image_path):
        var texture = ResourceLoader.load(image_path)
        if texture and hero_texture:
            hero_texture.texture = texture
            hero_texture.visible = true
            avatar_initial.visible = false
    else:
        # Keep avatar initial visible
        if hero_texture:
            hero_texture.visible = false
        if avatar_initial:
            avatar_initial.visible = true

func _set_rarity_visuals(rarity: String):
    var colors = _rarity_colors.get(rarity, _rarity_colors["COMMON"])
    
    # Set border color
    if border_frame:
        border_frame.color = colors["border"]
    
    # Set rarity badge color
    if rarity_badge:
        var badge_style = rarity_badge.get_theme_stylebox("panel")
        if badge_style:
            badge_style.border_color = colors["badge"]
    
    # Show glow for high rarity
    if rarity in ["EPIC", "LEGENDARY", "MYTHIC"] and glow_frame:
        glow_frame.visible = true
        glow_frame.color = colors["glow"]
        _start_glow_animation()
    elif glow_frame:
        glow_frame.visible = false

func _update_stats_bar():
    if not stats_bar or not show_stats_bar:
        return
    
    # Calculate power level based on stats
    var total_stats = hero_data.get("totalStats", {})
    var power = 0
    
    if total_stats.has("attack"):
        power += int(total_stats["attack"])
    if total_stats.has("defense"):
        power += int(total_stats["defense"]) / 2
    if total_stats.has("hp"):
        power += int(total_stats["hp"]) / 10
    
    # Normalize to 0-100
    var max_power = 1000  # Approximate max power
    var percentage = min(100, (power * 100) / max_power)
    
    stats_bar.value = percentage
    
    # Color based on power
    var bar_color = Color(0.3, 0.8, 0.3)  # Green
    if percentage < 30:
        bar_color = Color(0.8, 0.3, 0.3)  # Red
    elif percentage < 60:
        bar_color = Color(0.8, 0.6, 0.2)  # Yellow
    
    stats_bar.modulate = bar_color

func _on_pressed():
    hero_selected.emit(hero_data)

func _on_mouse_entered():
    if _hover_tween:
        _hover_tween.kill()
    
    _hover_tween = create_tween()
    _hover_tween.set_parallel(true)
    _hover_tween.tween_property(self, "scale", Vector2(1.05, 1.05), 0.12).set_trans(Tween.TRANS_CUBIC)
    
    # Brighten border
    if border_frame:
        var border_tween = create_tween()
        border_tween.tween_property(border_frame, "color:a", 1.0, 0.08)
    
    # Show selection highlight
    if selection_highlight:
        selection_highlight.visible = true

func _on_mouse_exited():
    if _hover_tween:
        _hover_tween.kill()
    
    _hover_tween = create_tween()
    _hover_tween.set_parallel(true)
    _hover_tween.tween_property(self, "scale", _default_scale, 0.15).set_trans(Tween.TRANS_CUBIC)
    
    # Restore border alpha
    if border_frame:
        var border_tween = create_tween()
        border_tween.tween_property(border_frame, "color:a", 0.7, 0.1)
    
    # Hide selection highlight if not selected
    if selection_highlight and not _is_selected:
        selection_highlight.visible = false

func _modulate_effects():
    if _is_selected:
        modulate = Color(1.0, 1.0, 1.0, 1.0)
        if border_frame:
            border_frame.color.a = 1.0
    else:
        modulate = Color(1.0, 1.0, 1.0, 0.95)
        if border_frame:
            border_frame.color.a = 0.7

func _start_glow_animation():
    if not glow_frame or not glow_frame.visible:
        return
    
    if _glow_tween:
        _glow_tween.kill()
    
    _glow_tween = create_tween()
    _glow_tween.set_loops()
    
    var colors = _rarity_colors.get(hero_data.get("rarity", "COMMON"), _rarity_colors["COMMON"])
    
    _glow_tween.tween_property(glow_frame, "color:a", 0.4, 0.8).set_trans(Tween.TRANS_SINE)
    _glow_tween.tween_property(glow_frame, "color:a", 0.15, 0.8).set_trans(Tween.TRANS_SINE)

# === STATIC METHODS ===

static func get_rarity_color(rarity: String) -> Color:
    var colors = {
        "COMMON": Color(0.7, 0.7, 0.7),
        "RARE": Color(1.0, 0.75, 0.0),
        "EPIC": Color(0.6, 0.4, 1.0),
        "LEGENDARY": Color(1.0, 0.45, 0.0),
        "MYTHIC": Color(1.0, 0.2, 0.3)
    }
    return colors.get(rarity, colors["COMMON"])

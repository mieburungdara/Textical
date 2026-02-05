extends Control
class_name HeroProfileScreen

## HeroProfileScreen - Layar profile hero dengan split panel layout
## Features: Hero grid di layer utama, profile panel slide dari bawah

# === EXPORT PROPERTIES ===
@export_group("Layout", "layout_")
@export var layout_separation: int = 20
@export var layout_margin: float = 15.0
@export var layout_overlay_animation_duration: float = 0.3

# === NODE REFERENCES ===
@onready var hero_grid_container = $MarginContainer/HeroGridContainer
@onready var profile_overlay = $ProfileOverlay
@onready var profile_content = $ProfileOverlay/ProfileContent
@onready var close_button = $ProfileOverlay/ProfileContent/HeaderRow/CloseButton
@onready var hero_profile_panel = $ProfileOverlay/ProfileContent/ScrollContainer/HeroProfilePanel

# === PRIVATE VARIABLES ===
var _slide_tween: Tween
var _is_overlay_visible: bool = false

func _ready():
    print("[HeroProfileScreen] _ready called")
    
    if not _validate_node_references():
        push_error("[HeroProfileScreen] Critical: Node references validation failed!")
        return
    
    _apply_export_settings()
    _connect_signals()
    
    # Setup overlay position (hidden below screen)
    _setup_overlay_position()

func _validate_node_references() -> bool:
    var is_valid = true
    
    if not hero_grid_container:
        push_error("[HeroProfileScreen] HeroGridContainer node not found!")
        is_valid = false
    elif not hero_grid_container.has_method("refresh_heroes"):
        push_error("[HeroProfileScreen] HeroGridContainer missing refresh_heroes method!")
        is_valid = false
    
    if not hero_profile_panel:
        push_error("[HeroProfileScreen] HeroProfilePanel node not found!")
        is_valid = false
    elif not hero_profile_panel.has_method("display_hero"):
        push_error("[HeroProfileScreen] HeroProfilePanel missing display_hero method!")
        is_valid = false
    
    return is_valid

func _setup_overlay_position():
    # Initially hide overlay below screen
    if profile_overlay:
        profile_overlay.anchor_top = 1.0
        profile_overlay.anchor_bottom = 1.0
        profile_overlay.offset_top = 0
        profile_overlay.offset_bottom = 0
        profile_overlay.visible = false

func _apply_export_settings():
    print("[HeroProfileScreen] Layout settings applied")

func _connect_signals():
    # Connect hero selection from grid to profile panel safely
    if hero_grid_container and hero_grid_container.has_method("refresh_heroes"):
        if hero_grid_container.has_signal("hero_selected"):
            hero_grid_container.hero_selected.connect(_on_hero_selected)
        else:
            push_warning("[HeroProfileScreen] hero_selected signal not found")
    else:
        push_warning("[HeroProfileScreen] HeroGridContainer not found or invalid")
    
    # Connect close button
    if close_button:
        close_button.pressed.connect(_on_close_button_pressed)

func _on_hero_selected(hero_data: Dictionary):
    print("[HeroProfileScreen] _on_hero_selected called with: ", hero_data)
    
    if hero_data.is_empty():
        print("[HeroProfileScreen] ERROR: hero_data is empty!")
        return
    
    # Update profile panel with selected hero
    if hero_profile_panel:
        if hero_profile_panel.has_method("display_hero"):
            print("[HeroProfileScreen] Calling display_hero on panel")
            hero_profile_panel.display_hero(hero_data)
        else:
            push_warning("[HeroProfileScreen] display_hero method not found on panel")
    else:
        print("[HeroProfileScreen] ERROR: hero_profile_panel is null!")
    
    # Update GameState
    var hero_id = hero_data.get("id", -1)
    GameState.selected_hero_id = hero_id
    print("[HeroProfileScreen] Selected hero ID: ", hero_id)
    
    # Show overlay with slide-up animation
    _show_overlay()

func _show_overlay():
    if _is_overlay_visible:
        return
    
    _is_overlay_visible = true
    
    # Make overlay visible
    profile_overlay.visible = true
    
    # Kill existing tween
    if _slide_tween:
        _slide_tween.kill()
    
    _slide_tween = create_tween()
    _slide_tween.set_parallel(false)
    
    # Animate from below to full screen
    _slide_tween.tween_property(profile_overlay, "anchor_top", 0.0, layout_overlay_animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
    _slide_tween.tween_property(profile_overlay, "anchor_bottom", 1.0, layout_overlay_animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
    
    # Update offset for smooth animation
    profile_overlay.offset_top = 0
    profile_overlay.offset_bottom = 0

func _hide_overlay():
    if not _is_overlay_visible:
        return
    
    _is_overlay_visible = false
    
    # Kill existing tween
    if _slide_tween:
        _slide_tween.kill()
    
    _slide_tween = create_tween()
    _slide_tween.set_parallel(false)
    
    # Animate below screen
    _slide_tween.tween_property(profile_overlay, "anchor_top", 1.0, layout_overlay_animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
    _slide_tween.tween_property(profile_overlay, "anchor_bottom", 1.0, layout_overlay_animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
    
    # Hide when animation completes
    _slide_tween.tween_callback(func(): profile_overlay.visible = false)

func _on_close_button_pressed():
    print("[HeroProfileScreen] Close button pressed")
    _hide_overlay()
    
    # Clear selection in grid
    if hero_grid_container and hero_grid_container.has_method("clear_selection"):
        hero_grid_container.clear_selection()

# === PUBLIC METHODS ===

func refresh_heroes():
    # Refresh the hero grid safely
    if hero_grid_container and hero_grid_container.has_method("refresh_heroes"):
        hero_grid_container.refresh_heroes()

func select_hero(hero_id: int):
    # Select a specific hero
    if hero_grid_container and hero_grid_container.has_method("select_hero"):
        hero_grid_container.select_hero(hero_id)
    
    # Load hero data
    GameState.selected_hero_id = hero_id

func clear_selection():
    # Clear current selection
    if hero_grid_container and hero_grid_container.has_method("clear_selection"):
        hero_grid_container.clear_selection()
    
    if hero_profile_panel and hero_profile_panel.has_method("clear_display"):
        hero_profile_panel.clear_display()
    
    GameState.selected_hero_id = -1

func toggle_overlay():
    if _is_overlay_visible:
        _hide_overlay()
    else:
        _show_overlay()

# === SIGNAL HANDLERS ===

func _on_stats_updated(unit_id, stats_data):
    # Forward to profile panel safely
    if hero_profile_panel and hero_profile_panel.has_method("_on_stats_updated"):
        hero_profile_panel._on_stats_updated(unit_id, stats_data)

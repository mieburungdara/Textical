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
@onready var hero_profile_panel = $ProfileOverlay/ProfileContent/ScrollContainer/HeroProfilePanel

# === PRIVATE VARIABLES ===
var _is_overlay_visible: bool = false

## Setup as overlay logic
func setup_as_overlay(_data: Dictionary = {}):
    # Sembunyikan HUD internal karena overlay akan numpang di HUD scene di bawahnya
    if has_node("TopHUD"): $TopHUD.visible = false
    if has_node("SideHUD"): $SideHUD.visible = false
    if has_node("TaskListHUD"): $TaskListHUD.visible = false
    
    # Beri padding agar tidak menabrak HUD asli di bawah/atas/kiri (sidebar)
    if has_node("MarginContainer"):
        $MarginContainer.offset_top = 40
        $MarginContainer.offset_bottom = -40
        $MarginContainer.offset_left = 200 # Ruang untuk SideHUD (140px + margin)

func _ready():
    print("[HeroProfileScreen] _ready called")
    
    if not _validate_node_references():
        push_error("[HeroProfileScreen] Critical: Node references validation failed!")
        return
    
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
    
    if not profile_overlay:
        push_error("[HeroProfileScreen] ProfileOverlay node not found!")
        is_valid = false
    
    if not hero_profile_panel:
        push_error("[HeroProfileScreen] HeroProfilePanel node not found!")
        is_valid = false
    elif not hero_profile_panel.has_method("display_hero"):
        push_error("[HeroProfileScreen] HeroProfilePanel missing display_hero method!")
        is_valid = false
    
    return is_valid

func _setup_overlay_position():
    # Use ProfileOverlay's built-in positioning
    if profile_overlay and profile_overlay.has_method("show_overlay"):
        profile_overlay.animation_duration = layout_overlay_animation_duration

func _connect_signals():
    # Connect hero selection from grid to profile panel safely
    if hero_grid_container and hero_grid_container.has_method("refresh_heroes"):
        if hero_grid_container.has_signal("hero_selected"):
            hero_grid_container.hero_selected.connect(_on_hero_selected)
        else:
            push_warning("[HeroProfileScreen] hero_selected signal not found")
    else:
        push_warning("[HeroProfileScreen] HeroGridContainer not found or invalid")
    
    # Connect overlay signals
    if profile_overlay and profile_overlay.has_signal("overlay_closed"):
        profile_overlay.overlay_closed.connect(_on_overlay_closed)
    
    if profile_overlay and profile_overlay.has_signal("hero_selected"):
        profile_overlay.hero_selected.connect(_on_hero_selected_from_overlay)

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

func _on_hero_selected_from_overlay(hero_data: Dictionary):
    # Forward to GameState
    var hero_id = hero_data.get("id", -1)
    GameState.selected_hero_id = hero_id

func _show_overlay():
    if profile_overlay and profile_overlay.has_method("show_overlay"):
        profile_overlay.show_overlay()
        _is_overlay_visible = true

func _hide_overlay():
    if profile_overlay and profile_overlay.has_method("hide_overlay"):
        profile_overlay.hide_overlay()
        _is_overlay_visible = false

func _on_overlay_closed():
    _is_overlay_visible = false
    # Clear selection in grid
    if hero_grid_container and hero_grid_container.has_method("clear_selection"):
        hero_grid_container.clear_selection()

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
    
    if profile_overlay and profile_overlay.has_method("clear_display"):
        profile_overlay.clear_display()
    
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

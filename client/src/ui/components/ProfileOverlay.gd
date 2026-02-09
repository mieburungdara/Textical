extends PanelContainer
class_name ProfileOverlay

## ProfileOverlay - Panel overlay untuk menampilkan hero profile
## Features: Slide-up animation, close button, hero profile panel

# === EXPORT PROPERTIES ===
@export var animation_duration: float = 0.3

# === NODE REFERENCES ===
@onready var profile_content: VBoxContainer = $ProfileContent
@onready var header_row: HBoxContainer = $ProfileContent/HeaderRow
@onready var close_button: Button = $ProfileContent/HeaderRow/CloseButton
@onready var title_label: Label = $ProfileContent/HeaderRow/TitleLabel
@onready var scroll_container: ScrollContainer = $ProfileContent/ScrollContainer
@onready var hero_profile_panel: HeroProfilePanel = $ProfileContent/ScrollContainer/HeroProfilePanel

# === PRIVATE VARIABLES ===
var _slide_tween: Tween
var _is_visible: bool = false

# === SIGNALS ===
signal overlay_closed()
signal hero_selected(hero_data: Dictionary)

func _ready():
    _setup_ui()
    _connect_signals()
    
    # Initially hide below screen
    _hide_below_screen()

func _setup_ui():
    # Ensure proper layout
    if profile_content:
        profile_content.size_flags_vertical = Control.SIZE_EXPAND_FILL
    
    if scroll_container:
        scroll_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
    
    if hero_profile_panel:
        hero_profile_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL

func _connect_signals():
    if close_button:
        close_button.pressed.connect(_on_close_button_pressed)

func _hide_below_screen():
    # Position overlay below screen initially
    anchor_top = 1.0
    anchor_bottom = 1.0
    offset_top = 0
    offset_bottom = 0
    visible = false
    _is_visible = false

# === PUBLIC METHODS ===

func show_overlay():
    if _is_visible:
        return
    
    _is_visible = true
    visible = true
    
    # Kill existing tween
    if _slide_tween:
        _slide_tween.kill()
    
    _slide_tween = create_tween()
    _slide_tween.set_parallel(false)
    
    # Animate from below to full screen
    _slide_tween.tween_property(self, "anchor_top", 0.0, animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
    _slide_tween.tween_property(self, "anchor_bottom", 1.0, animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
    
    # Update offset for smooth animation
    offset_top = 0
    offset_bottom = 0

func hide_overlay():
    if not _is_visible:
        return
    
    _is_visible = false
    
    # Kill existing tween
    if _slide_tween:
        _slide_tween.kill()
    
    _slide_tween = create_tween()
    _slide_tween.set_parallel(false)
    
    # Animate below screen
    _slide_tween.tween_property(self, "anchor_top", 1.1, animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
    _slide_tween.tween_property(self, "anchor_bottom", 1.1, animation_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
    
    # Hide when animation completes
    _slide_tween.tween_callback(func(): 
        visible = false
        emit_signal("overlay_closed")
    )

func is_overlay_visible() -> bool:
    return _is_visible

func display_hero(hero_data: Dictionary):
    if hero_profile_panel:
        hero_profile_panel.display_hero(hero_data)
        emit_signal("hero_selected", hero_data)

func clear_display():
    if hero_profile_panel:
        hero_profile_panel.clear_display()

# === PRIVATE METHODS ===

func _on_close_button_pressed():
    print("[ProfileOverlay] Close button pressed")
    hide_overlay()

extends Button
class_name UIButton

## Base Button Component
## Provides consistent styling and common functionality

# Properties - initialized with defaults, will be set properly in _ready
var _custom_icon: String = ""
var _custom_color: Color = Color.BLUE  # Default, will be set from Theme in _ready

# Signals
signal clicked_with_data(data)

func _ready() -> void:
    # Initialize Theme constants in _ready to avoid class-level dependency
    _custom_color = GameTheme.COLOR_PRIMARY
    _apply_default_style()
    pressed.connect(_on_pressed)

func _apply_default_style() -> void:
    # Set default styling
    custom_minimum_size = Vector2(GameTheme.SIZE_LARGE_WIDTH, GameTheme.SIZE_BUTTON_MEDIUM)
    add_theme_font_size_override("font_size", GameTheme.FONT_BODY)

## Setup button with text and optional icon
func setup(text: String, icon: String = "", color: Color = GameTheme.COLOR_PRIMARY) -> void:
    self.text = text
    _custom_icon = icon
    _custom_color = color
    
    if icon != "":
        self.text = icon + " " + text
    
    _apply_style(color)

## Setup with theme color by type
func setup_primary(text: String, icon: String = "") -> void:
    setup(text, icon, GameTheme.COLOR_PRIMARY)

func setup_success(text: String, icon: String = "") -> void:
    setup(text, icon, GameTheme.COLOR_SUCCESS)

func setup_danger(text: String, icon: String = "") -> void:
    setup(text, icon, GameTheme.COLOR_DANGER)

func setup_warning(text: String, icon: String = "") -> void:
    setup(text, icon, GameTheme.COLOR_WARNING)

func setup_secondary(text: String, icon: String = "") -> void:
    setup(text, icon, GameTheme.COLOR_SECONDARY)

func _apply_style(color: Color) -> void:
    var style_normal = StyleBoxFlat.new()
    style_normal.bg_color = color
    style_normal.set_corner_radius_all(GameTheme.RADIUS_MEDIUM)
    style_normal.content_margin_top = GameTheme.SPACING_SMALL
    style_normal.content_margin_bottom = GameTheme.SPACING_SMALL
    style_normal.content_margin_left = GameTheme.SPACING_MEDIUM
    style_normal.content_margin_right = GameTheme.SPACING_MEDIUM
    
    var style_hover = StyleBoxFlat.new()
    style_hover.bg_color = GameTheme.lighten(color, 0.1)
    style_hover.set_corner_radius_all(GameTheme.RADIUS_MEDIUM)
    style_hover.content_margin_top = GameTheme.SPACING_SMALL
    style_hover.content_margin_bottom = GameTheme.SPACING_SMALL
    style_hover.content_margin_left = GameTheme.SPACING_MEDIUM
    style_hover.content_margin_right = GameTheme.SPACING_MEDIUM
    
    var style_pressed = StyleBoxFlat.new()
    style_pressed.bg_color = GameTheme.darken(color, 0.15)
    style_pressed.set_corner_radius_all(GameTheme.RADIUS_MEDIUM)
    style_pressed.content_margin_top = GameTheme.SPACING_SMALL
    style_pressed.content_margin_bottom = GameTheme.SPACING_SMALL
    style_pressed.content_margin_left = GameTheme.SPACING_MEDIUM
    style_pressed.content_margin_right = GameTheme.SPACING_MEDIUM
    
    var style_disabled = StyleBoxFlat.new()
    style_disabled.bg_color = GameTheme.COLOR_TEXT_DISABLED
    style_disabled.set_corner_radius_all(GameTheme.RADIUS_MEDIUM)
    style_disabled.content_margin_top = GameTheme.SPACING_SMALL
    style_disabled.content_margin_bottom = GameTheme.SPACING_SMALL
    style_disabled.content_margin_left = GameTheme.SPACING_MEDIUM
    style_disabled.content_margin_right = GameTheme.SPACING_MEDIUM
    
    add_theme_stylebox_override("normal", style_normal)
    add_theme_stylebox_override("hover", style_hover)
    add_theme_stylebox_override("pressed", style_pressed)
    add_theme_stylebox_override("disabled", style_disabled)

func _on_pressed() -> void:
    # Can be overridden or used for additional logic
    pass

## Emit clicked signal with optional data
func emit_clicked(data = null) -> void:
    clicked_with_data.emit(data)

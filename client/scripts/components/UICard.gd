extends PanelContainer
class_name UICard

## Base Card Component
## Versatile card for items, quests, heroes, etc.

# UI Elements
var vbox: VBoxContainer
var header: HBoxContainer
var title_lbl: Label
var subtitle_lbl: Label
var content_lbl: Label
var footer: HBoxContainer
var action_button: Button

# Properties
var _card_data: Dictionary = {}

# Signals
signal card_clicked(data)
signal action_pressed(data)

func _ready() -> void:
    _build_default_card()

func _build_default_card() -> void:
    # Default styling
    var style = StyleBoxFlat.new()
    style.bg_color = GameTheme.COLOR_SURFACE
    style.set_corner_radius_all(GameTheme.RADIUS_MEDIUM)
    style.border_color = GameTheme.COLOR_SURFACE_LIGHT
    style.set_border_width_all(GameTheme.BORDER_THIN)
    add_theme_stylebox_override("panel", style)
    
    # Default size
    custom_minimum_size = Vector2(GameTheme.SIZE_MEDIUM_WIDTH, GameTheme.SIZE_ICON_LARGE * 2)
    
    # VBox container
    vbox = VBoxContainer.new()
    vbox.add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
    add_child(vbox)
    
    # Build header
    header = HBoxContainer.new()
    vbox.add_child(header)
    
    # Title
    title_lbl = Label.new()
    title_lbl.add_theme_font_size_override("font_size", GameTheme.FONT_BODY)
    header.add_child(title_lbl)
    
    header.add_child(Control.new()) # Spacer
    
    # Subtitle
    subtitle_lbl = Label.new()
    subtitle_lbl.add_theme_font_size_override("font_size", GameTheme.FONT_CAPTION)
    subtitle_lbl.modulate = GameTheme.COLOR_TEXT_SECONDARY
    vbox.add_child(subtitle_lbl)
    
    # Content
    content_lbl = Label.new()
    content_lbl.add_theme_font_size_override("font_size", GameTheme.FONT_CAPTION)
    content_lbl.modulate = GameTheme.COLOR_TEXT_SECONDARY
    content_lbl.text_overrun_behavior = TextServer.OVERRUN_TRIM_CHAR
    vbox.add_child(content_lbl)
    
    # Footer
    footer = HBoxContainer.new()
    vbox.add_child(footer)
    
    # Connect click
    gui_input.connect(_on_gui_input)

## Setup card with data
func setup(data: Dictionary) -> void:
    _card_data = data
    
    # Title
    if data.has("title") and title_lbl != null:
        title_lbl.text = data["title"]
        title_lbl.modulate = _get_color_from_data(data)
    
    # Subtitle
    if data.has("subtitle") and subtitle_lbl != null:
        subtitle_lbl.text = data["subtitle"]
        subtitle_lbl.visible = true
    else:
        if subtitle_lbl:
            subtitle_lbl.visible = false
    
    # Content
    if data.has("content") and content_lbl != null:
        content_lbl.text = data["content"]
        content_lbl.visible = true
    else:
        if content_lbl:
            content_lbl.visible = false
    
    # Rarity color for border/bg
    if data.has("rarity"):
        _apply_rarity_style(data["rarity"])
    
    # Action button
    if data.has("action_text"):
        _add_action_button(data["action_text"])

func _get_color_from_data(data: Dictionary) -> Color:
    if data.has("rarity"):
        return GameTheme.get_rarity_color(data["rarity"])
    if data.has("color"):
        return data["color"]
    return GameTheme.COLOR_TEXT_PRIMARY

func _apply_rarity_style(rarity: String) -> void:
    var rarity_color = GameTheme.get_rarity_color(rarity)
    var style = get_theme_stylebox("panel") as StyleBoxFlat
    if style:
        style.bg_color = GameTheme.darken(rarity_color, 0.7)
        style.border_color = rarity_color

func _add_action_button(button_text: String) -> void:
    action_button = Button.new()
    action_button.text = button_text
    action_button.pressed.connect(_on_action_pressed)
    footer.add_child(action_button)

func _on_gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        var mouse = event as InputEventMouseButton
        if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
            card_clicked.emit(_card_data)

func _on_action_pressed() -> void:
    action_pressed.emit(_card_data)

## Quick setup helpers
func setup_item(title: String, subtitle: String, rarity: String = "common") -> void:
    setup({
        "title": title,
        "subtitle": subtitle,
        "rarity": rarity
    })

func setup_quest(title: String, difficulty: String, location: String, reward: int) -> void:
    setup({
        "title": title,
        "subtitle": "[%s] 📍 %s" % [difficulty.to_upper(), location],
        "content": "💰 %d" % reward,
        "rarity": _difficulty_to_rarity(difficulty)
    })

func _difficulty_to_rarity(difficulty: String) -> String:
    match difficulty.to_lower():
        "easy": return "common"
        "medium": return "uncommon"
        "hard": return "rare"
        _: return "common"

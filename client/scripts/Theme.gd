extends Node
class_name GameTheme

## Theme Design Tokens for Textical UI
## Provides consistent colors, spacing, typography across all UI components

# =============================================================================
# COLOR TOKENS
# =============================================================================

# Primary Colors
const COLOR_PRIMARY := Color("#4A90D9")      # Main actions, buttons
const COLOR_SECONDARY := Color("#6B7280")    # Secondary elements
const COLOR_ACCENT := Color("#F59E0B")       # Highlights, special

# Semantic Colors
const COLOR_SUCCESS := Color("#10B981")      # Victory, heal, success
const COLOR_DANGER := Color("#EF4444")        # Damage, error, delete
const COLOR_WARNING := Color("#F97316")       # Warning, caution

# Background Colors
const COLOR_BACKGROUND := Color("#1F2937")   # Main background (dark)
const COLOR_SURFACE := Color("#374151")      # Card/panel background
const COLOR_SURFACE_LIGHT := Color("#4B5563") # Elevated surfaces

# Text Colors
const COLOR_TEXT_PRIMARY := Color("#F9FAFB")    # Main text
const COLOR_TEXT_SECONDARY := Color("#9CA3AF") # Muted text
const COLOR_TEXT_DISABLED := Color("#6B7280") # Disabled text

# Rarity Colors (for items)
const COLOR_RARITY_COMMON := Color("#9CA3AF")
const COLOR_RARITY_UNCOMMON := Color("#10B981")
const COLOR_RARITY_RARE := Color("#3B82F6")
const COLOR_RARITY_EPIC := Color("#8B5CF6")
const COLOR_RARITY_LEGENDARY := Color("#F59E0B")

# Location Colors
const COLOR_VILLAGE := Color("#22C55E")       # Green
const COLOR_FOREST := Color("#15803D")        # Dark green
const COLOR_DUNGEON := Color("#6B7280")       # Gray
const COLOR_CITADEL := Color("#3B82F6")        # Blue

# =============================================================================
# SPACING TOKENS
# =============================================================================

const SPACING_TINY := 4
const SPACING_SMALL := 8
const SPACING_MEDIUM := 16
const SPACING_LARGE := 24
const SPACING_XLARGE := 32

# =============================================================================
# SIZE TOKENS
# =============================================================================

# Icon sizes
const SIZE_ICON_TINY := 20
const SIZE_ICON_SMALL := 24
const SIZE_ICON_MEDIUM := 40
const SIZE_ICON_LARGE := 50
const SIZE_ICON_XLARGE := 60

# Button heights
const SIZE_BUTTON_SMALL := 24
const SIZE_BUTTON_MEDIUM := 35
const SIZE_BUTTON_LARGE := 45

# Panel/Card sizes
const SIZE_MINI_WIDTH := 80
const SIZE_SMALL_WIDTH := 100
const SIZE_MEDIUM_WIDTH := 150
const SIZE_LARGE_WIDTH := 200
const SIZE_PANEL_WIDTH := 300

# Grid cells
const SIZE_GRID_TINY := 40
const SIZE_GRID_SMALL := 50
const SIZE_GRID_MEDIUM := 60
const SIZE_GRID_LARGE := 70

# =============================================================================
# BORDER RADIUS TOKENS
# =============================================================================

const RADIUS_SMALL := 4
const RADIUS_MEDIUM := 8
const RADIUS_LARGE := 12
const RADIUS_FULL := 9999  # Pills/circular

# =============================================================================
# BORDER WIDTH TOKENS
# =============================================================================

const BORDER_NONE := 0
const BORDER_THIN := 1    # 1px - subtle borders
const BORDER_MEDIUM := 2  # 2px - standard borders
const BORDER_THICK := 3    # 3px - emphasis borders

# =============================================================================
# FONT SIZE TOKENS
# =============================================================================

const FONT_CAPTION := 12
const FONT_BODY := 14
const FONT_SUBTITLE := 16
const FONT_TITLE := 20
const FONT_HEADER := 24
const FONT_LARGE := 32

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

## Get rarity color by name
static func get_rarity_color(rarity: String) -> Color:
    match rarity.to_lower():
        "common": return COLOR_RARITY_COMMON
        "uncommon": return COLOR_RARITY_UNCOMMON
        "rare": return COLOR_RARITY_RARE
        "epic": return COLOR_RARITY_EPIC
        "legendary": return COLOR_RARITY_LEGENDARY
        _: return COLOR_RARITY_COMMON

## Get location color by type
static func get_location_color(location_type: int) -> Color:
    match location_type:
        0: return COLOR_VILLAGE      # VILLAGE
        1: return COLOR_FOREST       # FOREST
        2: return COLOR_DUNGEON      # DUNGEON
        3: return COLOR_CITADEL      # CITADEL
        _: return COLOR_PRIMARY

## Create a styled flat panel
static func create_panel_style(bg_color: Color, radius: int = RADIUS_MEDIUM, border_color: Color = Color.TRANSPARENT, border_width: int = 0) -> StyleBoxFlat:
    var style = StyleBoxFlat.new()
    style.bg_color = bg_color
    style.set_corner_radius_all(radius)
    
    if border_color != Color.TRANSPARENT and border_width > 0:
        style.border_color = border_color
        style.set_border_width_all(border_width)
    
    return style

## Create a button style
static func create_button_style(normal_color: Color, hover_color: Color, pressed_color: Color, radius: int = RADIUS_MEDIUM) -> StyleBoxFlat:
    var style = StyleBoxFlat.new()
    style.bg_color = normal_color
    style.set_corner_radius_all(radius)
    style.content_margin_top = SPACING_SMALL
    style.content_margin_bottom = SPACING_SMALL
    style.content_padding_left = SPACING_MEDIUM
    style.content_padding_right = SPACING_MEDIUM
    return style

## Create a bordered panel style
static func create_bordered_panel(bg_color: Color, border_color: Color, radius: int = RADIUS_MEDIUM, border_width: int = 2) -> StyleBoxFlat:
    var style = StyleBoxFlat.new()
    style.bg_color = bg_color
    style.border_color = border_color
    style.set_border_width_all(border_width)
    style.set_corner_radius_all(radius)
    return style

## Darken a color by percentage (0.0 - 1.0)
static func darken(color: Color, amount: float) -> Color:
    return color.darkened(amount)

## Lighten a color by percentage (0.0 - 1.0)
static func lighten(color: Color, amount: float) -> Color:
    return color.lightened(amount)

# =============================================================================
# COMPONENT FACTORY FUNCTIONS
# =============================================================================

## Create a UIButton with default styling
static func create_button(text: String = "", icon: String = "", color: Color = COLOR_PRIMARY) -> Control:
    var btn = Button.new()
    btn.text = text if icon == "" else (icon + " " + text)
    btn.custom_minimum_size = Vector2(SIZE_LARGE_WIDTH, SIZE_BUTTON_MEDIUM)
    btn.add_theme_font_size_override("font_size", FONT_BODY)
    
    # Apply styles
    var style_normal = StyleBoxFlat.new()
    style_normal.bg_color = color
    style_normal.set_corner_radius_all(RADIUS_MEDIUM)
    style_normal.content_margin_top = SPACING_SMALL
    style_normal.content_margin_bottom = SPACING_SMALL
    style_normal.content_padding_left = SPACING_MEDIUM
    style_normal.content_padding_right = SPACING_MEDIUM
    
    var style_hover = StyleBoxFlat.new()
    style_hover.bg_color = lighten(color, 0.1)
    style_hover.set_corner_radius_all(RADIUS_MEDIUM)
    style_hover.content_margin_top = SPACING_SMALL
    style_hover.content_margin_bottom = SPACING_SMALL
    style_hover.content_padding_left = SPACING_MEDIUM
    style_hover.content_padding_right = SPACING_MEDIUM
    
    var style_pressed = StyleBoxFlat.new()
    style_pressed.bg_color = darken(color, 0.15)
    style_pressed.set_corner_radius_all(RADIUS_MEDIUM)
    style_pressed.content_margin_top = SPACING_SMALL
    style_pressed.content_margin_bottom = SPACING_SMALL
    style_pressed.content_padding_left = SPACING_MEDIUM
    style_pressed.content_padding_right = SPACING_MEDIUM
    
    btn.add_theme_stylebox_override("normal", style_normal)
    btn.add_theme_stylebox_override("hover", style_hover)
    btn.add_theme_stylebox_override("pressed", style_pressed)
    
    return btn

## Create a primary action button
static func create_primary_button(text: String, icon: String = "") -> Control:
    return create_button(text, icon, COLOR_PRIMARY)

## Create a success button
static func create_success_button(text: String, icon: String = "") -> Control:
    return create_button(text, icon, COLOR_SUCCESS)

## Create a danger button
static func create_danger_button(text: String, icon: String = "") -> Control:
    return create_button(text, icon, COLOR_DANGER)

## Create a secondary button
static func create_secondary_button(text: String, icon: String = "") -> Control:
    return create_button(text, icon, COLOR_SECONDARY)

## Create an icon (emoji with background)
static func create_icon(emoji: String, bg_color: Color = COLOR_SURFACE, size: int = SIZE_ICON_MEDIUM) -> Control:
    var container = Control.new()
    container.custom_minimum_size = Vector2(size, size)
    
    var bg = ColorRect.new()
    bg.color = bg_color
    bg.size = Vector2(size, size)
    bg.set_anchors_preset(Control.PRESET_FULL_RECT)
    container.add_child(bg)
    
    var icon = Label.new()
    icon.text = emoji
    icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    icon.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    icon.add_theme_font_size_override("font_size", size * 0.5)
    icon.set_anchors_preset(Control.PRESET_FULL_RECT)
    container.add_child(icon)
    
    return container

## Create a labeled icon (icon + label below)
static func create_labeled_icon(emoji: String, label_text: String, bg_color: Color = COLOR_SURFACE, icon_size: int = SIZE_ICON_MEDIUM) -> Control:
    var vbox = VBoxContainer.new()
    vbox.add_theme_constant_override("separation", SPACING_TINY)
    
    var icon = create_icon(emoji, bg_color, icon_size)
    icon.custom_minimum_size = Vector2(icon_size, icon_size)
    vbox.add_child(icon)
    
    var label = Label.new()
    label.text = label_text
    label.add_theme_font_size_override("font_size", FONT_CAPTION)
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(label)
    
    return vbox

## Create a grid slot (clickable panel)
static func create_grid_slot(index: int, item_data: Dictionary = {}, size: int = SIZE_GRID_MEDIUM) -> Control:
    var container = PanelContainer.new()
    container.custom_minimum_size = Vector2(size, size)
    container.set_meta("slot_index", index)
    container.set_meta("item_data", item_data)
    container.mouse_filter = Control.MOUSE_FILTER_STOP
    
    var style = StyleBoxFlat.new()
    if item_data.is_empty():
        style.bg_color = COLOR_SURFACE_LIGHT
    else:
        style.bg_color = COLOR_SURFACE
        if item_data.has("rarity"):
            style.border_color = get_rarity_color(item_data["rarity"])
            style.set_border_width_all(BORDER_THIN)
    
    style.set_corner_radius_all(RADIUS_SMALL)
    container.add_theme_stylebox_override("panel", style)
    
    return container

## Create a section title
static func create_section_title(title_text: String) -> Control:
    var container = VBoxContainer.new()
    
    var label = Label.new()
    label.text = title_text
    label.add_theme_font_size_override("font_size", FONT_BODY)
    label.modulate = COLOR_ACCENT
    container.add_child(label)
    
    var sep = HSeparator.new()
    sep.modulate = COLOR_SURFACE_LIGHT
    container.add_child(sep)
    
    return container

## Create a stat row (label: value)
static func create_stat_row(label_text: String, value_text: String, label_width: int = 80) -> Control:
    var row = HBoxContainer.new()
    row.custom_minimum_size = Vector2(0, SPACING_LARGE)
    
    var label = Label.new()
    label.text = label_text + ":"
    label.custom_minimum_size = Vector2(label_width, 0)
    label.modulate = COLOR_TEXT_PRIMARY
    row.add_child(label)
    
    var value = Label.new()
    value.text = value_text
    value.modulate = COLOR_ACCENT
    value.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    value.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
    row.add_child(value)
    
    return row

## Create a spacer
static func create_spacer(height: int = SPACING_MEDIUM) -> Control:
    var spacer = Control.new()
    spacer.custom_minimum_size = Vector2(0, height)
    spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
    return spacer

## Get item emoji by type (for displaying item icons)
static func get_item_emoji(item_type: String) -> String:
    match item_type:
        "weapon": return "⚔️"
        "armor": return "🛡️"
        "helmet": return "⛑️"
        "boots": return "👢"
        "accessory": return "💍"
        "consumable": return "🧪"
        "material": return "📦"
        "quest": return "📜"
        _: return "📦"

## Safely get GameManager node with null safety
## Returns: Node (GameManager) or null if not found
static func get_game_manager() -> Node:
    var tree = Engine.get_main_loop() as SceneTree
    if tree == null:
        push_warning("[Theme] Could not get main loop")
        return null
    
    var gm = tree.root.get_node_or_null("GameManager")
    if gm == null:
        push_warning("[Theme] GameManager not found in scene tree")
    return gm

## ============================================================================
## DASHBOARD FACTORY METHODS
## ============================================================================

## Create a stats widget
static func create_stats_widget() -> UIStatsWidget:
    return UIStatsWidget.new()

## Create a party widget
static func create_party_widget() -> UIPartyWidget:
    return UIPartyWidget.new()

## Create a quest tracker
static func create_quest_tracker() -> UIQuestTracker:
    return UIQuestTracker.new()

## Create a notification feed
static func create_notification_feed() -> UINotificationFeed:
    return UINotificationFeed.new()

## Create quick actions widget
static func create_quick_actions() -> UIQuickActions:
    return UIQuickActions.new()

## Create a health bar
static func create_hp_bar(current: int, max_value: int, bar_color: Color = COLOR_SUCCESS) -> UIHPBar:
    var bar = UIHPBar.new()
    bar.setup(current, max_value, bar_color, "HP")
    return bar

## Create a mana bar
static func create_mp_bar(current: int, max_value: int) -> UIHPBar:
    var bar = UIHPBar.new()
    bar.setup(current, max_value, COLOR_PRIMARY, "MP")
    return bar

## Create an EXP bar
static func create_exp_bar(current: int, max_value: int) -> UIHPBar:
    var bar = UIHPBar.new()
    bar.setup(current, max_value, COLOR_ACCENT, "EXP")
    return bar

## Create dashboard container
static func create_dashboard() -> Dashboard:
    return Dashboard.new()

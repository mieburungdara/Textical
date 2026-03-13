extends VBoxContainer
class_name UINotificationFeed

## Notification Feed Widget
## Shows recent game events in a scrollable feed

# UI Elements
var scroll_container: ScrollContainer
var notifications_container: VBoxContainer

# Data
var _notifications: Array = []
var _notification_items: Array = []

# Timer for auto-dismiss
var _dismiss_timer: Timer

const MAX_NOTIFICATIONS := 10
const NOTIFICATION_LIFETIME := 5.0  # seconds
const NOTIFICATION_HEIGHT := 40

signal notification_clicked(index: int)
signal notification_dismissed(index: int)

func _ready() -> void:
    _setup_widget()
    # Use Timer for auto-dismiss (NOT _process)
    _dismiss_timer = Timer.new()
    _dismiss_timer.wait_time = 1.0  # Check every second
    _dismiss_timer.timeout.connect(_on_dismiss_timer)
    add_child(_dismiss_timer)
    _dismiss_timer.start()

func _on_dismiss_timer() -> void:
    # Remove old notifications
    var current_time = Time.get_ticks_msec() / 1000.0
    
    var to_remove: Array = []
    for i in range(_notifications.size()):
        var notif = _notifications[i]
        var age = current_time - notif.get("time", 0.0)
        if age > NOTIFICATION_LIFETIME:
            to_remove.append(i)
    
    # Remove in reverse order
    to_remove.reverse()
    for i in to_remove:
        _notifications.remove_at(i)
    
    if not to_remove.is_empty():
        _refresh_notifications()

func _setup_widget() -> void:
    add_theme_constant_override("separation", GameTheme.SPACING_TINY)
    
    # Scroll container
    scroll_container = ScrollContainer.new()
    scroll_container.custom_minimum_size = Vector2(250, NOTIFICATION_HEIGHT * 5)
    scroll_container.mouse_filter = Control.MOUSE_FILTER_STOP
    add_child(scroll_container)
    
    # Notifications container
    notifications_container = VBoxContainer.new()
    notifications_container.add_theme_constant_override("separation", GameTheme.SPACING_TINY)
    scroll_container.add_child(notifications_container)
    
    # Set scroll container properties
    scroll_container.follow_end_horizontal = true
    scroll_container.follow_end_vertical = true

## Add notification
func add_notification(icon: String, message: String, notification_type: String = "info") -> void:
    var notification = {
        "icon": icon,
        "message": message,
        "type": notification_type,
        "time": Time.get_ticks_msec() / 1000.0
    }
    
    _notifications.append(notification)
    
    # Keep only MAX_NOTIFICATIONS
    while _notifications.size() > MAX_NOTIFICATIONS:
        _notifications.pop_front()
    
    _refresh_notifications()

func _refresh_notifications() -> void:
    # Clear existing
    for item in _notification_items:
        item.queue_free()
    _notification_items.clear()
    
    for child in notifications_container.get_children():
        child.queue_free()
    
    # Create notification items
    for i in range(_notifications.size()):
        var notif = _notifications[i]
        var item = _create_notification_item(notif, i)
        notifications_container.add_child(item)
        _notification_items.append(item)

func _create_notification_item(notif: Dictionary, index: int) -> Control:
    var container = PanelContainer.new()
    container.custom_minimum_size = Vector2(0, NOTIFICATION_HEIGHT)
    container.mouse_filter = Control.MOUSE_FILTER_STOP
    
    # Style based on type
    var notif_type = notif.get("type", "info")
    var bg_color = _get_type_color(notif_type)
    
    var style = StyleBoxFlat.new()
    style.bg_color = GameTheme.darken(bg_color, 0.5)
    style.set_corner_radius_all(GameTheme.RADIUS_SMALL)
    style.border_color = bg_color
    style.set_border_width_all(GameTheme.BORDER_THIN)
    container.add_theme_stylebox_override("panel", style)
    
    # Content
    var hbox = HBoxContainer.new()
    hbox.add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
    container.add_child(hbox)
    
    # Icon
    var icon = Label.new()
    icon.text = notif.get("icon", "ℹ️")
    icon.add_theme_font_size_override("font_size", GameTheme.FONT_BODY)
    hbox.add_child(icon)
    
    # Message
    var message = Label.new()
    message.text = notif.get("message", "")
    message.add_theme_font_size_override("font_size", GameTheme.FONT_CAPTION)
    message.modulate = GameTheme.COLOR_TEXT_PRIMARY
    message.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    message.text_overrun_behavior = TextServer.OVERRUN_TRIM_CHAR
    hbox.add_child(message)
    
    # Connect click
    container.gui_input.connect(_on_notification_input.bind(index))
    
    return container

func _get_type_color(notif_type: String) -> Color:
    match notif_type:
        "success": return GameTheme.COLOR_SUCCESS
        "warning": return GameTheme.COLOR_WARNING
        "error": return GameTheme.COLOR_DANGER
        "quest": return GameTheme.COLOR_ACCENT
        "combat": return GameTheme.COLOR_PRIMARY
        _: return GameTheme.COLOR_SECONDARY

func _on_notification_input(event: InputEvent, index: int) -> void:
    if event is InputEventMouseButton:
        var mouse = event as InputEventMouseButton
        if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
            notification_clicked.emit(index)

## Quick helper methods
func notify_success(message: String) -> void:
    add_notification("✅", message, "success")

func notify_warning(message: String) -> void:
    add_notification("⚠️", message, "warning")

func notify_error(message: String) -> void:
    add_notification("❌", message, "error")

func notify_quest(message: String) -> void:
    add_notification("📜", message, "quest")

func notify_combat(message: String) -> void:
    add_notification("⚔️", message, "combat")

func notify_info(message: String) -> void:
    add_notification("ℹ️", message, "info")

## Clear all notifications
func clear_notifications() -> void:
    _notifications.clear()
    _refresh_notifications()

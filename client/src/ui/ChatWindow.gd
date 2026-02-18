extends Control

@onready var message_input = $VBox/InputArea/HBox/LineEdit
@onready var chat_display = $VBox/TabContainer/Global/Scroll/MessageList # Simplified structure
@onready var tab_container = $VBox/TabContainer

var current_channel = "GLOBAL"
var current_channel_id = 0

# Cache for reputation data
var _reputation_cache = {}
var _reputation_handler = null

func _ready():
    # Connect to Socket Signals via Global Network Manager or direct
    # For now, we assume a singleton pattern or accessible node
    var socket = get_node("/root/NetworkManager/SocketHandler")
    if socket:
        socket.chat_message.connect(_on_chat_message)
        socket.chat_typing.connect(_on_chat_typing)
        socket.chat_error.connect(_on_chat_error)
    
    _reputation_handler = get_node_or_null("/root/ReputationHandler")

func _on_send_pressed():
    var text = message_input.text.strip_edges()
    if text == "": return
    
    var socket = get_node("/root/NetworkManager/SocketHandler")
    if socket:
        socket.chat_send({
            "channelType": current_channel,
            "channelId": current_channel_id,
            "message": text
        })
        message_input.text = ""

func _on_chat_message(data):
    # data: { id, userId, user: { username }, message, channelType, channelId, timestamp }
    _add_message_to_ui(data)

func _add_message_to_ui(data):
    var label = Label.new()
    var username = data.user.username
    var user_id = data.user.id
    
    # Get reputation badge
    var rep_badge = _get_reputation_badge(user_id)
    
    label.text = "[%s] %s %s: %s" % [
        data.channelType,
        rep_badge,
        username,
        data.message
    ]
    chat_display.add_child(label)
    # Auto-scroll logic here...

func _get_reputation_badge(user_id: int) -> String:
    # Check cache first
    if _reputation_cache.has(user_id):
        return _reputation_cache[user_id]
    
    # Fetch reputation
    if _reputation_handler:
        _reputation_handler.get_user_reputation(user_id)
        if not _reputation_handler.reputation_received.is_connected(_on_chat_reputation_received):
            _reputation_handler.reputation_received.connect(_on_chat_reputation_received)
    
    return "⚪"  # Default badge

func _on_chat_reputation_received(stats: Dictionary):
    var user_id = stats.get("userId", -1)
    if user_id > 0:
        var likes = stats.get("totalLikes", 0)
        var tier = stats.get("likeTier", "NEWCOMER")
        var badge_info = ReputationHandler.get_badge_info(tier)
        var icon = badge_info.get("icon", "⚪")
        var special = ReputationHandler.get_special_badge(likes, 0)
        if not special.is_empty():
            icon = special.get("icon", icon)
        _reputation_cache[user_id] = icon

func _on_chat_typing(data):
    # Update typing indicator UI
    pass

func _on_chat_error(data):
    print("[CHAT_ERROR] ", data.message)

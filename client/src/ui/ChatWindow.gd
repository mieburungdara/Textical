extends Control

@onready var message_input = $VBox/InputArea/HBox/LineEdit
@onready var chat_display = $VBox/TabContainer/Global/Scroll/MessageList # Simplified structure
@onready var tab_container = $VBox/TabContainer

var current_channel = "GLOBAL"
var current_channel_id = 0

func _ready():
    # Connect to Socket Signals via Global Network Manager or direct
    # For now, we assume a singleton pattern or accessible node
    var socket = get_node("/root/NetworkManager/SocketHandler")
    if socket:
        socket.chat_message.connect(_on_chat_message)
        socket.chat_typing.connect(_on_chat_typing)
        socket.chat_error.connect(_on_chat_error)

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
    label.text = "[%s] %s: %s" % [
        data.channelType,
        data.user.username,
        data.message
    ]
    chat_display.add_child(label)
    # Auto-scroll logic here...

func _on_chat_typing(data):
    # Update typing indicator UI
    pass

func _on_chat_error(data):
    print("[CHAT_ERROR] ", data.message)

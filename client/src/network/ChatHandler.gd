extends BaseNetworkHandler
class_name ChatHandler

# --- CHAT SIGNALS ---
signal message_received(message_data)
signal typing_received(typing_data)
signal history_loaded(channel_type, messages)

func send_message(channel_type: String, channel_id: int, message: String, other_user_id: int = 0):
    var body = {
        "channelType": channel_type,
        "message": message
    }
    if channel_id > 0: body["channelId"] = channel_id
    if other_user_id > 0: body["otherUserId"] = other_user_id
    
    # Send via REST for persistence, Socket.io will handle the real-time broadcast
    _request("/chat/send", HTTPClient.METHOD_POST, body)

func load_history(channel_type: String, channel_id: int = 0, limit: int = 50):
    var endpoint = "/chat/history?channelType=" + channel_type
    if channel_id > 0:
        endpoint += "&channelId=" + str(channel_id)
    endpoint += "&limit=" + str(limit)
    
    _request(endpoint, HTTPClient.METHOD_GET)

func notify_typing(channel_type: String, channel_id: int, is_typing: Boolean, other_user_id: int = 0):
    # Typing is usually purely real-time via Socket
    var data = {
        "channelType": channel_type,
        "channelId": channel_id,
        "otherUserId": other_user_id,
        "isTyping": is_typing
    }
    # This will be handled by SocketHandler in a real integration
    # For now, we define the structure
    pass

func _handle_success(endpoint: String, json):
    if endpoint.contains("/chat/history"):
        emit_signal("history_loaded", "", json) # type can be parsed from json if added
    elif endpoint.contains("/chat/send"):
        # Message was successfully sent and saved to DB
        pass

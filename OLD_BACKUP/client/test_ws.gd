extends SceneTree

var socket = WebSocketPeer.new()

func _init():
    var url = "ws://127.0.0.1:5000/socket.io/?EIO=4&transport=websocket"
    print("Connecting to ", url)
    var err = socket.connect_to_url(url)
    if err != OK:
        print("Connect return:", err)
        quit(1)

func _process(delta):
    socket.poll()
    var state = socket.get_ready_state()
    
    if state == WebSocketPeer.STATE_OPEN:
        while socket.get_available_packet_count() > 0:
            var packet = socket.get_packet().get_string_from_utf8()
            print("Received:", packet)
            
            if packet.begins_with("0"):
                var auth_data = {"token":null, "userId":1.0}
                var payload = "40" + JSON.stringify(auth_data)
                print("Sending Auth Payload:", payload)
                var err2 = socket.send_text(payload)
                print("Send Error Code:", err2)
                
            elif packet.begins_with("40"):
                print("Success! Authenticated.")
                quit(0)
            elif packet.begins_with("44"):
                print("Failed! Auth error.")
                quit(1)
                
    elif state == WebSocketPeer.STATE_CLOSED:
        print("Closed. Code:", socket.get_close_code(), " Reason:", socket.get_close_reason())
        quit(1)

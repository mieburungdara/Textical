extends SceneTree

var socket = WebSocketPeer.new()
var token = "6c3813a7-be87-4945-bb65-7377c7d2ba30"
var user_id = 1

func _init():
    var url = "ws://127.0.0.1:5000/socket.io/?EIO=4&transport=websocket"
    print("[SOCKET] Connecting to: ", url)
    var err = socket.connect_to_url(url)
    if err != OK:
        print("[SOCKET] Connect err: ", err)
        quit(1)

func _process(delta):
    socket.poll()
    var state = socket.get_ready_state()
    if state == WebSocketPeer.STATE_OPEN or state == WebSocketPeer.STATE_CLOSED:
        while socket.get_available_packet_count() > 0:
            var pkt = socket.get_packet().get_string_from_utf8()
            print("[SERVER -> CLIENT]", pkt)
            if pkt.begins_with("0"):
                var auth_payload = '40{"token":"' + token + '","userId":' + str(user_id) + '}'
                print("[CLIENT -> SERVER]", auth_payload)
                socket.send_text(auth_payload)
            elif pkt.begins_with("40"):
                print("[SUCCESS] Authenticated!")
                quit(0)
            elif pkt.begins_with("44"):
                print("[FAILED] Auth Error!")
                quit(1)
                
    if state == WebSocketPeer.STATE_CLOSED:
        print("[CLOSED] Code:", socket.get_close_code(), "Reason:", socket.get_close_reason())
        quit(1)
        
    return false # Continue running


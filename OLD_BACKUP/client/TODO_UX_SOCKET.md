# TODO: Client Real-time & UX Improvements

- [x] Implement proper Socket.io 4.x client logic in `SocketHandler.gd`
- [x] Handle Engine.IO/Socket.IO handshakes and packets
- [x] Support heartbeat (PING/PONG)
- [x] Support event routing and dynamic callbacks (`on()`)
- [x] Implement "Remember Me" toggle in `LoginScreen`
- [x] Persist `remember_me` preference in `auth.cfg`
- [x] Conditionally save session in `session.dat` based on preference
- [ ] Implement auto-reconnect logic for WebSocket
- [ ] Add loading spinner for manual login
- [ ] Unit tests for Socket.IO packet parsing

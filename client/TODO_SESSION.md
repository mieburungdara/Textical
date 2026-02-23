# TODO: Client Session Persistence

- [x] Implement `GameState.save_session_to_disk()`
- [x] Implement `GameState.load_session_from_disk()`
- [x] Update `BaseNetworkHandler` to include `X-Session-Token`
- [x] Add token-based login to `AuthHandler.gd`
- [x] Fix login response extraction for profile fetch
- [x] Update `ServerConnector` to support token login facade
- [x] Add auto-login logic to `LoginAuthManager.gd`
- [x] Integrated auto-login into `LoginScreen.gd`
- [x] Prevent login hang by stubbing missing `SocketHandler` methods
- [ ] Test persistence with expired/invalid tokens
- [ ] Add "Remember Me" toggle in `LoginScreen` (persistence is currently always-on)
- [ ] Proper `SocketIO` implementation for Godot (current is stub)

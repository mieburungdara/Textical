# Fix Backend Connection Timeout

## Feature summary (high-level, 5–10 lines)
- Goal: Fix the connection timeout issue between the Godot client and the backend server.
- User-facing behavior: The game should be able to connect to the server and sync data instead of entering offline mode.
- Scope (in): `client/src/autoload/server_connector.gd`.
- Scope (out): Server-side changes (unless necessary).
- Assumptions: The server is running and accessible via `127.0.0.1:3000`.
- Risks / edge cases: Firewall blocking Godot, or IPv6/IPv4 conflict.

## Checklist (TDD-first, actionable)

- [x] Update base_url to use 127.0.0.1 instead of localhost
  - Files: `client/src/autoload/server_connector.gd`
  - TEST: Run the Godot project and check if the connection test passes.
  - IMPLEMENT: Change `var base_url = "http://localhost:3000/api"` to `var base_url = "http://127.0.0.1:3000/api"`.
  - VERIFY: Check logs for `[ServerConnector] Final connection result: SUCCESS`.

- [x] Add retry logic or more detailed error reporting in test_connection
  - Files: `client/src/autoload/server_connector.gd`
  - TEST: N/A
  - IMPLEMENT: Add more debug prints to `test_connection` to see result/code if it finishes but fails.
  - VERIFY: Observe logs during connection test.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: `node server/notify.js "..."`

- [ ] Remove Offline Mode and Implement Retries in DataManager
  - Files: `client/src/autoload/data_manager.gd`
  - TEST: Run project with server OFF, check if it retries. Turn server ON, check if it proceeds.
  - IMPLEMENT: Wrap connection test and version fetch in a retry loop.
  - VERIFY: Logs show multiple attempts and final success when server is up.

- [ ] Update LoadingScreen to block progression on failure
  - Files: `client/src/ui/loading/LoadingScreen.gd`
  - TEST: Ensure it doesn't transition to login if sync/version check fails.
  - IMPLEMENT: Modify `_on_version_check_failed` and `_on_sync_error` to show retry status instead of bypassing.
  - VERIFY: UI stays on LoadingScreen until success.

## Progress log (append-only)
- 2026-02-12T19:24:00 - Plan created.
- 2026-02-12T19:26:00 - Updated base_url and added detailed logging.
- 2026-02-12T19:30:00 - Fixed closure capture issue in test_connection using a Dictionary.
- 2026-02-12T19:35:00 - Added _request_async to BaseNetworkHandler and fixed ServerConnector._send_get_raw to support await properly.
- 2026-02-12T19:40:00 - Verified full system connectivity and data sync.
- 2026-02-12T19:45:00 - Started implementing mandatory retries (removing offline mode).

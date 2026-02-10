# Database Sync & Source of Truth Overhaul

## Feature summary
- Goal: Replace all hardcoded mock data and static configurations with real-time server-driven data from the database.
- User-facing behavior: Players will see their actual friends, real game time/weather, dynamic monster/recipe data in the Codex, and have their settings persisted across sessions.
- Scope (in): GameState.gd refactoring, Server-side API expansion (Prisma), Social system integration, Codex data binding, World State (Time/Weather) synchronization, User Settings persistence.
- Scope (out): Combat logic rewrite, detailed art assets for monsters.
- Assumptions: Server is running with Prisma and an accessible database.
- Risks / edge cases: Network latency for time-sync, data inconsistency between client/server if socket drops.

## Checklist (TDD-first, actionable)

- [ ] **Infrastructure: Server-side API & Schema Audit**
  - Files: `server/prisma/schema.prisma`, `server/src/api/`
  - TEST: Verify all required tables (UserFriend, WorldState, MonsterTemplate, RecipeTemplate, AchievementTemplate) exist and are accessible via Prisma Studio.
  - IMPLEMENT: Update schema if necessary; Create/Update endpoints for `get_world_state`, `get_friends`, `get_codex_data`, and `update_user_settings`.
  - VERIFY: Run `npx prisma studio` and test API endpoints via `curl` or `api_test.js`.

- [ ] **Social System: Sync Friends List**
  - Files: `client/src/autoload/game_state.gd`, `client/src/autoload/server_connector.gd`, `client/src/ui/side_hud/components/SideHUD_Social.gd`
  - TEST: Mock a server response with 2 friends; Assert `GameState.online_friends` matches.
  - IMPLEMENT: Replace `_mock_friends` with a call to `ServerConnector.fetch_friends()`. Update `SideHUD_Social` to react to a new `friends_updated` signal.
  - VERIFY: Run client and check if the SideHUD Social section populates from the DB.

- [ ] **World State: Global Time & Weather Sync**
  - Files: `client/src/autoload/game_state.gd`, `client/src/ui/side_hud/components/SideHUD_Status.gd`
  - TEST: Assert `GameState.get_game_time()` returns data from server instead of hardcoded 14:30.
  - IMPLEMENT: Connect `WorldState` tick from server to `GameState`. Replace local `_time_tick_timer` logic with server-sent timestamps.
  - VERIFY: Open two clients and verify they show the exact same time and weather.

- [ ] **Codex Data: Dynamic Bestiary & Recipes**
  - Files: `client/src/ui/codex/components/Codex_Bestiary.gd`, `client/src/ui/codex/components/Codex_Recipes.gd`
  - TEST: Populate DB with 1 monster; Verify `Codex_Bestiary` renders 1 card.
  - IMPLEMENT: Fetch `MonsterTemplate` and `RecipeTemplate` from server. Map JSON data to UI cards in the Codex components.
  - VERIFY: Add a monster in Admin Panel; Refresh Codex in-game to see the new entry.

- [ ] **User Persistence: Server-side Settings**
  - Files: `client/src/ui/SettingsScreen.gd`, `server/src/api/user.js`
  - TEST: Change volume setting; Close and reopen client; Verify volume remains at the new value.
  - IMPLEMENT: Update `SettingsScreen` to send changes to `ServerConnector.update_settings()`. Server saves this to `User.settings` JSON column.
  - VERIFY: Change settings on one PC; Login on another; Verify settings are applied.

- [ ] **Notify Completion via Telegram**
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: `node server/notify.js "✦ 🏆 <b>Database Sync & Source of Truth: FULLY OPERATIONAL</b>

💬 <b>Permintaan/Pertanyaan:</b>
Identifikasi data hardcoded dan migrasi ke database server sebagai Source of Truth.

🛠️ <b>Jawaban/Implementasi:</b>
Seluruh sistem mock (Teman, Waktu, Cuaca, Codex, dan Settings) telah digantikan dengan sinkronisasi real-time via Server/Prisma. GameState kini murni sebagai bridge data dari database.

📜 <b>World Lore:</b>
Jaringan kristal transmisi di seluruh kerajaan telah diaktifkan, memastikan setiap petualang menerima data waktu dan pengetahuan yang sama dari Perpustakaan Besar.

🌟 <b>Milestones Reached:</b>
- Migrasi Friends List ke DB Prisma
- Sinkronisasi Waktu & Cuaca Global via Server Tick
- Implementasi Dynamic Codex (Bestiary & Recipes) dari Database
- Persistensi Settings User di sisi Server

📊 <b>Technical Details:</b>
- <b>Files:</b> 5 New API Scripts, 8 Modified UI/Autoload Scripts
- <b>Registry:</b> WorldState ID range 100-200

🔗 <b>System Impact:</b>
Mungkinkan fitur multiplayer yang lebih kohesif dan manajemen konten game tanpa update client."`

## Progress log (append-only)
- 2026-02-10T18:15:00 - Initial plan created for Database Sync Overhaul.
- 2026-02-10T18:45:00 - Server Infrastructure Audit: Updated Prisma schema with UserFriend, UserAchievement, and settings. Applied migrations and seeded database. Added API routes for social, world state, codex templates, and user settings.
- 2026-02-10T19:15:00 - Client-Side Overhaul: Implemented AssetHandler, updated ServerConnector and GameState to synchronize all data from server database. Refactored SideHUD, Codex, and Settings UI to be dynamic and server-driven. Verified SRP compliance across all new modules.

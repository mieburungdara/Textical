# SideHUD Enhancement - Checkpoint Plan

## Feature summary
- Goal: Menambahkan 16 fitur baru ke SideHUD untuk meningkatkan informasi real-time dan keterlibatan pengguna.
- User-facing behavior: Sidebar akan menampilkan indikator koneksi, badge notifikasi, mini display lokasi, streak login, buff/debuff, waktu in-game, teman online, status VIP, dan notifikasi achievement.
- Scope (in): Modifikasi `SideHUD.tscn` dan `SideHUD.gd`.
- Scope (out): Modifikasi screen lain atau sistem backend utama.
- Assumptions: Menggunakan mock data untuk fitur yang sistem backend-nya belum siap sepenuhnya; `ServerConnector` dan `GameState` sudah ada.
- Risks / edge cases: Penanganan badge count 0, pemutusan koneksi server secara tiba-tiba, tooltip positioning, penanganan null data dari state.

## Checklist (TDD-first, actionable)

### Phase 1: Critical Features (P0)

- [x] Feature 1: Quick Notifications Badge System
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi badge muncul di pojok button nav saat count > 0, tersembunyi saat count == 0.
  - IMPLEMENT: Tambahkan `BadgePanel` dan `BadgeLabel` ke node button nav di TSCN. Implementasikan `update_badge_count()` di GDScript. Hubungkan sinyal dari `GameState`.
  - VERIFY: Jalankan scene, panggil `update_badge_count("QuestBtn", 5)` via console/debugger, pastikan badge muncul dengan angka 5.

- [x] Feature 2: Server/Connection Status Indicator
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi indikator berubah dari 🟢 ke 🔴 saat terputus dari server.
  - IMPLEMENT: Tambahkan `ConnectionStatus` HBox (icon + ping label). Hubungkan sinyal `socket_connected`/`socket_disconnected` from `ServerConnector`. Implementasikan update ping periodik.
  - VERIFY: Simulasikan disconnect, pastikan icon menjadi merah dan ping menunjukkan "--ms".

- [x] Feature 3: Region/Location Mini-Display
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi nama region dan koordinat terupdate saat pindah lokasi.
  - IMPLEMENT: Tambahkan `RegionInfo` VBox. Hubungkan ke `GameState.region_changed`. Tambahkan pemetaan ikon berdasarkan tipe region.
  - VERIFY: Pindah region (misal ke "Iron Mine"), pastikan display menunjukkan "⛏️ IRON MINE" dan koordinat yang sesuai.

- [x] Feature 4: Daily Login Streak Display
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi streak count menampilkan data dari `current_user`.
  - IMPLEMENT: Tambahkan `LoginStreak` HBox. Implementasikan `_update_streak_display()` and `_animate_streak_change()`. Tambahkan indikator bonus 🎁 jika streak >= 7.
  - VERIFY: Set `loginStreak` ke 7 di mock data, pastikan icon bonus muncul.

### Phase 2: Important Features (P1)

- [x] Feature 5: Buff/Debuff Status Display
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi ikon buff muncul saat hero memiliki buff aktif.
  - IMPLEMENT: Tambahkan `BuffContainer` HBox. Implementasikan logika polling/update buff dari stats hero. Tambahkan tooltip hover.
  - VERIFY: Tambahkan buff mock ke hero, pastikan ikon muncul di sidebar dengan countdown durasi.

- [x] Feature 6: Time Display (In-Game Clock)
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi jam update setiap menit in-game.
  - IMPLEMENT: Tambahkan `TimeDisplay` (jam + icon siang/malam). Implementasikan `_update_time_display()`.
  - VERIFY: Pastikan jam berdetak dan ikon berubah dari ☀️ ke 🌙 saat jam > 18:00.

- [x] Feature 7: Online Friends/Party Members
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi avatar teman online muncul di sidebar.
  - IMPLEMENT: Tambahkan `FriendsSection` dan `FriendsList`. Hubungkan ke `GameState.get_online_friends()`.
  - VERIFY: Pastikan avatar muncul dengan dot status (hijau/kuning).

- [x] Feature 8: VIP/Premium Badge
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Verifikasi badge VIP hanya muncul jika user memiliki status VIP.
  - IMPLEMENT: Tambahkan `VIPBadge` node. Implementasikan pengecekan status VIP dan animasi pulsing gold.
  - VERIFY: Set user `isVip` ke true, pastikan badge 👑 muncul dan berkilau.

### Phase 3: Optional Features (P2)

- [x] Feature 9: Achievement Notification Badge
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Badge muncul saat achievement baru didapat.
  - IMPLEMENT: Tambahkan badge ke `AchievementBtn`. Hubungkan sinyal achievement.
  - VERIFY: Trigger achievement mock, pastikan badge angka muncul.

- [x] Feature 10: Title/Rank Display
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Menampilkan title user saat ini.
  - IMPLEMENT: Tambahkan `TitleDisplay`. Implementasikan update warna berdasarkan rarity title.
  - VERIFY: Ubah title user, pastikan teks di sidebar berubah sesuai title baru.

- [x] Feature 11: Bag Slots Indicator
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Menampilkan occupancy tas (misal 5/50).
  - IMPLEMENT: Tambahkan `BagIndicator`. Hubungkan ke data inventory. Tambahkan warning color saat tas hampir penuh.
  - VERIFY: Tambahkan item ke tas, pastikan angka bertambah dan berubah merah jika > 95%.

- [x] Feature 12: Faction Reputation Display
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Menampilkan reputasi faksi aktif.
  - IMPLEMENT: Tambahkan `FactionDisplay`. Implementasikan pemetaan tier reputasi.
  - VERIFY: Ubah reputasi faksi, pastikan tier (misal "Friendly") terupdate.

### Phase 4: Enhancement Features (P3)

- [x] Feature 13: Weather Indicator
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Menampilkan ikon cuaca region saat ini.
  - IMPLEMENT: Tambahkan `WeatherDisplay`. Hubungkan ke data region.
  - VERIFY: Ubah cuaca region ke "Rainy", pastikan ikon berubah menjadi 🌧️.

- [x] Feature 14: Settings Quick Access
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Tombol settings membuka overlay settings.
  - IMPLEMENT: Tambahkan `SettingsBtn` di bagian bawah sidebar.
  - VERIFY: Klik tombol ⚙️, pastikan `SettingsScreen` terbuka.

- [x] Feature 15: Combat Mode Indicator
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Menampilkan indikator "COMBAT" saat bertarung.
  - IMPLEMENT: Tambahkan `CombatIndicator`. Hubungkan ke state combat. Tambahkan animasi pulsing merah.
  - VERIFY: Masuk ke Combat mode, pastikan teks "⚔️ COMBAT" muncul dan berkedip.

- [x] Feature 16: Battery/Performance Indicator
  - Files: `client/src/ui/SideHUD.tscn`, `client/src/ui/SideHUD.gd`
  - TEST: Menampilkan FPS dan ping real-time.
  - IMPLEMENT: Tambahkan `PerfIndicator`. Implementasikan polling FPS dan penarikan ping terakhir.
  - VERIFY: Pastikan angka FPS terupdate setiap detik.

- [x] Notify Completion via Telegram
  - Files: `notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: `node notify.js "✦ 🏆 <b>SideHUD Enhancements: FULLY OPERATIONAL</b>\n\n🛠️ <b>Jawaban/Implementasi:</b>\n16 fitur HUD baru diimplementasikan termasuk badge notifikasi, status koneksi, info region, streak login, buff display, dan performa indikator.\n\n📜 <b>World Lore:</b>\nPara petualang kini dibekali dengan prototipe kompas magis yang terhubung langsung ke pusat informasi kerajaan, memberikan data real-time tentang dunia di sekitar mereka.\n\n📊 <b>Technical Details:</b>\n- <b>Files:</b> Modified SideHUD.tscn, SideHUD.gd\n- <b>System Impact:</b> Meningkatkan UX dengan memberikan feedback visual langsung tanpa harus membuka menu utama."`

## Progress log (append-only)
- 2026-02-10T14:30:00 - Initialized checkpoint plan based on SideHUD Enhancement Plan.
- 2026-02-10T14:45:00 - Completed Phase 1 (P0 features): Notification Badges, Connection Status, Region Info, and Login Streak. Added missing signals to GameState and utility methods to ServerConnector.
- 2026-02-10T15:15:00 - Completed Phase 2 (P1 features): Buff Display, Time Display, Online Friends, and VIP Badge. Implemented game time system in GameState.
- 2026-02-10T15:45:00 - Completed Phase 3 (P2 features): Achievement Badge, Title Display, Bag Slots Indicator, and Faction Reputation Display. Added AchievementBtn and enhanced ResourceSection.
- 2026-02-10T16:15:00 - Completed Phase 4 (P3 features): Weather Indicator, Settings Quick Access, Combat Mode Indicator, and Performance Indicator. All 16 features are now operational.
- 2026-02-10T16:30:00 - Fixed multiple bugs: indentation errors in SideHUD.gd, missing Achievements in nav_buttons, missing scene placeholders, and fixed Godot 4 font size override syntax. Verified all 16 features are functional in-game.
- 2026-02-10T16:45:00 - Simplified UI: Removed HP, MP, Login Streak, and Bag Indicator from SideHUD as per user request. Cleaned up associated code and node references.
- 2026-02-10T16:50:00 - Increased SideHUD width: Expanded sidebar panel to 160px and updated navigation buttons to a 150px/160px scale for better visibility.
- 2026-02-10T17:00:00 - Created Achievement and Settings screens: Implemented AchievementScreen.tscn/gd and SettingsScreen.tscn/gd to replace previous placeholders. Linked them to SideHUD buttons.
- 2026-02-10T17:15:00 - Implemented Character Hub: Grouped Hero List, Party/Formation, and Achievements into a single "Character Hub" overlay with tabs. Cleaned up SideHUD by replacing multiple buttons with a single 🤴 Character button. Made child screens adaptive for tabbed display.
- 2026-02-10T17:30:00 - SRP Refactor & Restructuring: Applied Single Responsibility Principle by breaking down SideHUD into modular components (Resources, Status, Navigation, Social, System). Moved all related files to a dedicated `res://src/ui/side_hud/` folder for better maintainability and updated all project references.
- 2026-02-10T17:45:00 - Implemented Codex Hub: Created `CodexHub.tscn/gd` to store universal knowledge. Moved **Achievements** to the Codex and added placeholders for **Bestiary** and **Recipes**. Added a dedicated **📜 CODEX** button to the SideHUD and redirected achievement notifications to it.
- 2026-02-10T18:00:00 - Codex SRP Refactor & Structuring: Applied Single Responsibility Principle to the Codex Hub. Broken down into modular components (`Codex_Bestiary`, `Codex_Recipes`, `Codex_Achievements`) and organized into a dedicated `res://src/ui/codex/` folder. Verified all links and resolved file loading errors.
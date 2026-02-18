# 📱 Client-Side Data Storage Documentation

Dokumentasi ini menjelaskan **semua data yang disimpan pada sisi client** (browser/game client) dalam Textical RPG. Data ini mencakup state volatile (memory), cached data, dan persistent storage.

---

## 📁 File Utama Penyimpanan Data Client

| File | Lokasi | Fungsi Utama |
|------|--------|--------------|
| `game_state.gd` | `client/src/autoload/game_state.gd` | Main game state, session, user data |
| `data_manager.gd` | `client/src/autoload/data_manager.gd` | Asset cache, template data |
| `server_connector.gd` | `client/src/autoload/server_connector.gd` | Network handlers, API communication |
| SocketHandler | `client/src/network/SocketHandler.gd` | Real-time socket connection |
| LocalizationManager | `client/src/autoload/LocalizationManager.gd` | Translation system |

---

## 🗂️ Kategori Data Client-Side

### 1. Session & Authentication Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `current_user` | Object | null | User object dari server |
| `session_token` | String | "" | Session token untuk autentikasi |
| `session_expires_at` | int | 0 | Timestamp kapan session expire |

**Sumber:** [`game_state.gd:17-19`](client/src/autoload/game_state.gd:17)

---

### 2. Player Location & Region Data ✅ OPTIMIZED

| Variabel | Tipe | Default | Deskripsi | Ref |
|----------|------|---------|-----------|-----|
| `current_region_data` | Object | null | Detail lengkap region dari server | g_state.gd:28 |
| `currentRegion` | Int | 1 | Region ID (di dalam current_user) | user.currentRegion |
| `get_region_type()` | Function | - | Getter untuk region type | g_state.gd:34 |

> **✅ IMPLEMENTED OPTIMIZATION:**
> - Variabel `current_region_type` sudah DIHAPUS (redundant)
> - Menggunakan getter function [`get_region_type()`](client/src/autoload/game_state.gd:34)
> - Ada fallback ke "TOWN" **TIDAK** - jika region data unavailable, return "" dan log error
> - Mencegah exploit/bug where player bisa tersesat ke TOWN tanpa sadar

```gdscript
// Implementation di game_state.gd:34-51
func get_region_type() -> String:
    if current_region_data:
        return current_region_data.get("visualType", current_region_data.get("type", ""))
    
    if current_user and current_user.has("currentRegion"):
        var rid = int(current_user.get("currentRegion", 1))
        if has_node("/root/DataManager"):
            var region = get_node("/root/DataManager").get_region(rid)
            if region and not region.is_empty():
                return region.get("visualType", region.get("type", ""))
    
    # CRITICAL: No fallback to "TOWN" - would cause exploits/bugs
    printerr("[GameState.get_region_type] ERROR: Region data unavailable!")
    return ""
```

**Kenapa tidak ada fallback ke "TOWN"?**
- Jika region data tidak tersedia, berarti ada bug atau exploit potential
- Player harusnya tidak bisa bermain sampai region data tersedia
- Dengan return "", UI bisa menampilkan error screen daripada biarkan player masuk ke region yang salah

#### Region Positions (World Atlas)

| Region ID | Nama | Posisi (Vector2) |
|-----------|------|------------------|
| 1 | Oakhaven Hub (CENTER) | (2500, 2500) |
| 2 | Iron Mine (West) | (1200, 1800) |
| 3 | Crystal Depths (North West) | (800, 800) |
| 4 | Elm Forest (East) | (3800, 1800) |
| 5 | Forbidden Grove (North East) | (4200, 800) |

**Sumber:** [`game_state.gd:74-82`](client/src/autoload/game_state.gd:74)

---

### 3. Hero & Party Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `current_heroes` | Array | [] | List hero player |
| `selected_hero_id` | int | -1 | Hero yang sedang dipilih |
| `_heroes_loaded_from_server` | bool | false | Flag apakah heroes sudah di-load dari server |
| `_heroes_loading` | bool | false | Flag apakah heroes sedang di-load |

**Sumber:** [`game_state.gd:20-22`](client/src/autoload/game_state.gd:20)

---

### 4. Inventory Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `inventory` | Array | [] | Item dalam inventory |
| `inventory_status` | Dictionary | {"used": 0, "max": 20} | Status kapasitas inventory |
| `inventory_is_dirty` | bool | true | Flag perlu sync dengan server |

**Sumber:** [`game_state.gd:23-25`](client/src/autoload/game_state.gd:23)

---

### 5. Quest & Task Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `active_quests` | Array | [] | Quest aktif player |
| `active_task` | Object | null | Task sedang berjalan (TRAVEL/CRAFTING/dll) |

**Sumber:** [`game_state.gd:26-27`](client/src/autoload/game_state.gd:26)

#### Task Types (Dari Socket)

| Type | Deskripsi |
|------|-----------|
| `TRAVEL` | Player sedang dalam perjalanan antar region |
| `CRAFTING` | Player sedang craft item |
| `GATHERING` | Player sedang gathering resource |
| `QUEST` | Player sedang menyelesaikan quest |

---

### 6. World State Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `world_state` | Dictionary | {"currentHour": 12, "weatherType": "CLEAR"} | State dunia global |
| `online_friends` | Array | [] | Friends yang sedang online |
| `game_achievements` | Array | [] | Achievements player |

**Sumber:** [`game_state.gd:36-38`](client/src/autoload/game_state.gd:36)

#### World State Fields

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `currentHour` | int | Jam dunia (0-23) |
| `weatherType` | String | Tipe cuaca (CLEAR/RAIN/STORM, dll) |

---

### 7. User Settings & Preferences

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `user_settings` | Dictionary | {} | Settings yang di-parse dari JSON string server |

**Sumber:** [`game_state.gd:39`](client/src/autoload/game_state.gd:39)

#### Settings Structure

```json
{
  "audio": {
    "master_volume": 100
  },
  "display": {
    "fullscreen": false
  }
}
```

---

### 8. Client-Only Persistence Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `selected_hero_id` | int | -1 | Hero yang dipilih (tidak dikirim ke server) |
| `last_selected_item_id` | int | -1 | Item terakhir yang dipilih |
| `target_monster_id` | int | -1 | Monster target untuk battle |
| `last_visited_hub` | String | "res://src/ui/TownScreen.tscn" | Scene terakhir dikunjungi |

**Sumber:** [`game_state.gd:42-45`](client/src/autoload/game_state.gd:42)

---

### 9. Geographic & World Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `FLAVOR_LANDMARKS` | Array | [...] | Array landmark dunia untuk atmospheric flavor |

**Flavor Landmarks:**
- Lake of Whispers (2500, 1500)
- The Shattered Peaks (500, 500)
- Ancient Sentinel Pillar (4500, 4500)
- Siren's Whisp Falls (1500, 1000)
- The Weeping Sands (3500, 3500)
- Dead Man's Pass (2500, 3200)
- Sun-King Observatory (1000, 4000)

**Sumber:** [`game_state.gd:74-82`](client/src/autoload/game_state.gd:74)

---

## 📌 GameState Helper Functions

| Function | Return Type | Deskripsi |
|----------|-------------|-----------|
| `get_game_time()` | Dictionary | Returns `{hour, minute, day}` |
| `get_current_weather()` | String | Returns weather type (CLEAR, RAIN, dll) |
| `get_unread_achievements()` | Array | Returns unlocked achievements |
| `is_in_town()` | bool | Returns true jika player di region 1 (Oakhaven) |
| `is_in_combat()` | bool | Returns combat state |
| `get_title_rarity(title)` | String | Returns title rarity (common, rare, dll) |
| `get_current_faction()` | Dictionary | Returns current faction data |
| `get_region_type()` | String | Returns region visual type (TOWN, FOREST, dll) |
| `format_number(n)` | String | Formats number with commas |
| `get_region_scene(r_type)` | String | Returns scene path untuk region type |

**Sumber:** [`game_state.gd`](client/src/autoload/game_state.gd)

---

## 📡 GameState Signals

| Signal | Parameter | Deskripsi |
|--------|-----------|-----------|
| `task_updated` | (task) | Emit ketika task berubah |
| `region_changed` | (new_data) | Emit ketika region berubah |
| `quest_updated` | - | Emit ketika quest diperbarui |
| `mail_received` | - | Emit ketika mail diterima |
| `achievement_unlocked` | (achievement) | Emit ketika achievement terbuka |
| `friends_updated` | (friends) | Emit ketika friends diperbarui |
| `world_state_updated` | (state) | Emit ketika world state berubah |
| `heroes_loaded` | (count: int) | Emit ketika heroes selesai di-load |
| `heroes_loading_failed` | (error: String) | Emit ketika hero loading gagal |
| `session_expired` | (reason: String) | Emit ketika session expired |
| `force_logout` | (reason: String) | Emit ketika force logout |

**Sumber:** [`game_state.gd:3-15`](client/src/autoload/game_state.gd:3)

---

## 💾 Data Manager (Asset Cache)

### Cached Asset Categories

| Category | Deskripsi | Contoh Data |
|----------|-----------|-------------|
| `regions` | Data region/wilayah | Oakhaven, Iron Mine, dll |
| `items` | Template item | Weapons, armor, consumables |
| `monsters` | Template monster | Slime, Goblin, Dragon |
| `npcs` | Data NPC | Merchants, quest givers |
| `skills` | Skill definitions | Fireball, Heal, Slash |
| `classes` | Class definitions | Warrior, Mage, Rogue |
| `recipes` | Crafting recipes | Iron Sword, Health Potion |
| `quests` | Quest templates | Main quests, side quests |
| `achievements` | Achievement definitions | Kill 100 monsters, Reach level 10 |
| `factions` | Faction data | Kingdom, Bandits, Merchants |
| `world_events` | Event definitions | Seasonal events |
| `dialogues` | NPC dialogue trees | Conversation scripts |

**Sumber:** [`data_manager.gd:41`](client/src/autoload/data_manager.gd:41)

### Caching Strategy

```
1. Memory Cache (_data_cache)
   └── Priority pertama, tercepat akses

2. Local File Storage (user://data/)
   └── persistence lintas sesi

3. Fallback Data (res://assets/data/)
   └── Default data jika server unavailable
```

### DataManager Sync State

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `_local_versions` | Dictionary | {} | Local version cache |
| `_server_versions` | Dictionary | {} | Server version cache |
| `_fallback_data` | Dictionary | {} | Offline fallback data |
| `_data_cache` | Dictionary | {} | In-memory cache |
| `_sync_queue` | Array | [] | Sync queue |
| `_total_to_sync` | int | 0 | Total items to sync |

**Sumber:** [`data_manager.gd:18-24`](client/src/autoload/data_manager.gd:18)

### DataManager Signals

| Signal | Parameter | Deskripsi |
|--------|-----------|-----------|
| `sync_started` | - | Sync dimulai |
| `sync_progress` | (current, total) | Progress sync |
| `sync_finished` | - | Sync selesai |
| `sync_error` | (message) | Sync error |
| `version_check_started` | - | Version check dimulai |
| `version_check_completed` | (needs_update) | Version check selesai |
| `version_check_failed` | (error) | Version check gagal |

**Sumber:** [`data_manager.gd:6-13`](client/src/autoload/data_manager.gd:6)

---

## 🔌 ServerConnector State

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `base_url` | String | "http://127.0.0.1:5000/api" | API base URL |
| `_is_server_reachable` | bool | false | Connection state |
| `_connection_tested` | bool | false | Flag connection test |

### Handler Instances

| Handler | Type | Fungsi |
|---------|------|--------|
| `auth` | AuthHandler | Authentication |
| `world` | WorldHandler | World/Region data |
| `tavern` | TavernHandler | Tavern/Mercenaries |
| `market` | MarketHandler | Marketplace |
| `quest` | QuestHandler | Quest management |
| `inventory` | InventoryHandler | Inventory operations |
| `battle` | BattleHandler | Battle system |
| `stat` | StatHandler | Stats management |
| `asset` | AssetHandler | Asset templates |

### ServerConnector Signals

| Signal | Parameter | Deskripsi |
|--------|-----------|-----------|
| `stats_updated` | (unit_id, stats) | Stats berubah |
| `stat_changed` | (unit_id, name, old, new) | Stat spesifik berubah |
| `stat_cap_reached` | (unit_id, name, current, cap) | Stat cap reached |
| `elemental_affinity_updated` | (unit_id, affinities) | Affinity berubah |
| `set_bonus_updated` | (unit_id, bonuses) | Set bonus berubah |

**Sumber:** [`server_connector.gd`](client/src/autoload/server_connector.gd)

---

## 🌌 LocalizationManager

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `translations` | Dictionary | Translation strings |
| `current_locale` | String | Current locale (en, dll) |

**Sumber:** [`client/src/autoload/LocalizationManager.gd`](client/src/autoload/LocalizationManager.gd)

---

## 📡 Network Handlers Overview

| Handler | File | Fungsi |
|---------|------|--------|
| AuthHandler | [`client/src/network/AuthHandler.gd`](client/src/network/AuthHandler.gd) | Login, profile |
| WorldHandler | [`client/src/network/WorldHandler.gd`](client/src/network/WorldHandler.gd) | Regions, friends |
| TavernHandler | [`client/src/network/TavernHandler.gd`](client/src/network/TavernHandler.gd) | Mercenaries |
| MarketHandler | [`client/src/network/MarketHandler.gd`](client/src/network/MarketHandler.gd) | Marketplace |
| QuestHandler | [`client/src/network/QuestHandler.gd`](client/src/network/QuestHandler.gd) | Quests |
| InventoryHandler | [`client/src/network/InventoryHandler.gd`](client/src/network/InventoryHandler.gd) | Inventory |
| BattleHandler | [`client/src/network/BattleHandler.gd`](client/src/network/BattleHandler.gd) | Battle |
| StatHandler | [`client/src/network/StatHandler.gd`](client/src/network/StatHandler.gd) | Stats |
| AssetHandler | [`client/src/network/AssetHandler.gd`](client/src/network/AssetHandler.gd) | Assets |
| ChatHandler | [`client/src/network/ChatHandler.gd`](client/src/network/ChatHandler.gd) | Chat |
| GuildHandler | [`client/src/network/GuildHandler.gd`](client/src/network/GuildHandler.gd) | Guild |

---

## 🔄 Real-Time Data (Socket)

### Socket Signals

| Signal | Deskripsi | Data |
|--------|-----------|------|
| `task_completed` | Task selesai | Task result data |
| `task_started` | Task dimulai | Task details |
| `task_failed` | Task gagal | Error details |
| `stats_updated` | Stats berubah | Unit stats |
| `stat_changed` | Stat spesifik berubah | (unit_id, stat_name, old, new) |
| `badge_updated` | Badge berubah | Badge data |

**Sumber:** [`server_connector.gd:20-29`](client/src/autoload/server_connector.gd:20)

---

## 📊 UI Component State

### TopHUD State

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `_current_stats` | Dictionary | Stats hero yang sedang ditampilkan |
| `_active_buffers` | Array | Buff/debuff aktif |
| `_elemental_affinity` | Dictionary | Elemental affinity hero |

**Sumber:** [`client/src/ui/TopHUD.gd:28-30`](client/src/ui/TopHUD.gd:28)

### SideHUD State

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `_ping_timer` | Timer | Timer untuk ping server |
| `_ui_update_timer` | Timer | Timer untuk update UI |

**Sumber:** [`client/src/ui/SideHUD.gd:59-60`](client/src/ui/SideHUD.gd:59)

### Market Screen State

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `_pending_list_item_id` | int | Item yang akan di-list |
| `_raw_listings` | Array | Listing market dari server |
| `_raw_inventory` | Array | Inventory player |

**Sumber:** [`client/src/ui/MarketScreen.gd:18-20`](client/src/ui/MarketScreen.gd:18)

### Map Travel System State

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `is_traveling` | bool | Apakah sedang dalam perjalanan |
| `_target_id` | int | Region ID tujuan |
| `_target_type` | String | Tipe region tujuan |
| `_progress` | float | Progress perjalanan (0.0-1.0) |
| `_duration` | float | Durasi perjalanan dalam detik |

**Sumber:** [`client/src/ui/MapTravelSystem.gd:10-14`](client/src/ui/MapTravelSystem.gd:10)

---

## 🎮 Additional UI Screens State

### Guild Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `guild_data` | Dictionary | Data guild |
| `member_list` | Array | Lista member |

**Sumber:** [`client/src/ui/GuildScreen.gd`](client/src/ui/GuildScreen.gd)

### Combat Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `battle_state` | String | State battle |
| `enemy_team` | Array | Team enemy |

**Sumber:** [`client/src/ui/CombatScreen.tscn`](client/src/ui/CombatScreen.tscn)

### Crafting Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `current_recipe` | Dictionary | Recipe dipilih |
| `materials` | Array | Material tersedia |

**Sumber:** [`client/src/ui/CraftingScreen.gd`](client/src/ui/CraftingScreen.gd)

### Formation Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `current_formation` | Array | Posisi hero |
| `selected_unit` | int | Hero dipilih |

**Sumber:** [`client/src/ui/FormationScreen.gd`](client/src/ui/FormationScreen.gd)

### Chat Window

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `messages` | Array | Chat messages |
| `channel` | String | Channel aktif |

**Sumber:** [`client/src/ui/ChatWindow.gd`](client/src/ui/ChatWindow.gd)

### Quest Tracker HUD

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `quest_container` | Node | Container untuk quest items |

**Sumber:** [`client/src/ui/QuestTrackerHUD.gd`](client/src/ui/QuestTrackerHUD.gd)

### Quest Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `quest_list` | Node | Lista quest |
| `title_label` | Label | Judul screen |

**Sumber:** [`client/src/ui/QuestScreen.gd`](client/src/ui/QuestScreen.gd)

### Tavern Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `merc_list` | Node | Lista mercenaries |
| `status_label` | Label | Status tavern |
| `_time_acc` | float | Akumulator waktu untuk animasi |

**Sumber:** [`client/src/ui/TavernScreen.gd`](client/src/ui/TavernScreen.gd)

---

## 🆕 Loading Screen (NEW)

### Preloaded Assets (Saat Game Start)

| Resource | Tipe | Deskripsi |
|----------|------|-----------|
| `LoadingUtils` | class | Static utilities, konstanta |
| `RUNES` | Array | Array rune characters untuk efek |
| `TIPS` | Array | Tips untuk player |
| `FANTASY_LOGS` | Array | Log messages untuk atmosphere |

**Sumber:** [`client/src/ui/loading/LoadingUtils.gd`](client/src/ui/loading/LoadingUtils.gd)

### Real-Time Data (Selama Loading)

| Komponen | Tipe | Deskripsi |
|----------|------|-----------|
| `sync` | SyncManager | Download/update asset templates |
| `log_manager` | LogManager | Tampilkan chronicle logs |
| `tip_manager` | TipManager | Rotasi tips |
| `particles` | ParticleManager | Spawn rune particles |
| `ripples` | RippleManager | Efek ripple air |

**Loading Flow:**
1. **Preload** - Load LoadingUtils, konstanta (RUNES, TIPS, FANTASY_LOGS)
2. **Version Check** - Cek apakah ada update dari server (`DataManager.check_server_versions()`)
3. **Sync** - Download asset templates jika perlu update (`DataManager.download_all_templates()`)
4. **Transition** - Fade ke LoginScreen

### Player Data Sync (Setelah Loading - di LoginScreen)

**TIDAK** sinkronisasi player data saat Loading Screen. Player data di-sync setelah login berhasil, di **LoginScreen** melalui **LoginPreloader**:

| Data | Method | Keterangan |
|------|--------|-------------|
| Heroes | `ServerConnector.fetch_heroes(user_id)` | Sync hero list |
| Inventory | `ServerConnector.fetch_inventory(user_id)` | Sync inventory |
| Friends | `ServerConnector.fetch_friends(user_id)` | Sync friends list |
| World State | `ServerConnector.fetch_world_state()` | Sync waktu/cuaca |
| Achievements | `ServerConnector.fetch_achievements(user_id)` | Sync achievements |

**Timing:**
- Loading Screen → Asset templates saja
- Login Screen (setelah auth) → Player data (heroes, inventory, dll)

**Sumber:** [`client/src/ui/login/managers/LoginPreloader.gd`](client/src/ui/login/managers/LoginPreloader.gd)

---

## 🆕 Optimasi Loading (NEW)

### Version-Based Caching Strategy

Sistem menggunakan **version checking** untuk menghindari download yang tidak diperlukan:

```
1. Load local versions dari user://data/versions.json
2. Fetch server versions dari /api/assets/versions
3. Bandingkan: jika server > local → download/update
4. Simpan ke memory cache + local storage
5. Fallback ke res://assets/data/ jika offline
```

### 3-Tier Caching

| Tier | Lokasi | Priority | Use Case |
|------|--------|----------|----------|
| **Tier 1** | `_data_cache` (memory) | Tertinggi | Akses cepat |
| **Tier 2** | `user://data/` (file) | Medium | Persistence lintas sesi |
| **Tier 3** | `res://assets/data/` (bundled) | Terendah | Offline fallback |

### get_asset() Flow

```gdscript
func get_asset(category, id):
    1. Cek memory cache (_data_cache)
    2. Jika tidak ada, cek local file (user://data/)
    3. Jika tidak ada, fallback ke res://assets/data/
    4. Return {} jika tidak ditemukan
```

### Version File Structure

**Lokasi:** `user://data/versions.json`

```json
{
  "items": 2,
  "monsters": 1,
  "regions": 3,
  "skills": 1
}
```

Hanya download jika `server_version > local_version`.

**Manfaat Optimasi:**
- Pemain tidak perlu download semua asset setiap kali
- Hanya download yang berubah
- Offline play possible dengan bundled fallback data
- Memory management via tiered cache

**Real-time States:**
| State | Tipe | Deskripsi |
|-------|------|-----------|
| `_is_exiting` | bool | Sedang transisi keluar |
| `_loading_cancelled` | bool | Loading dibatalkan |
| `_is_syncing` | bool | Sedang sync |
| `_sync_error_count` | int | Jumlah error |

**Sumber:** [`client/src/ui/loading/LoadingScreen.gd`](client/src/ui/loading/LoadingScreen.gd)

### World Atlas

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `travel_system` | Node | Sistem travel |
| `ui_panel` | Node | Panel info region |

**Sumber:** [`client/src/ui/WorldAtlas.gd`](client/src/ui/WorldAtlas.gd)

### Settings Screen

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| `_settings_dirty` | bool | Flag perlu simpan settings |

**Sumber:** [`client/src/ui/SettingsScreen.gd`](client/src/ui/SettingsScreen.gd)

---

## 🎮 Local Storage (Persistent)

### Credential Storage

**Lokasi:** `user://credentials.cfg`

| Field | Deskripsi |
|-------|-----------|
| `auth/username` | Username tersimpan |
| `auth/password` | Password tersimpan (encrypted) |

**Sumber:** [`client/src/ui/login/managers/LoginAuthManager.gd:40-49`](client/src/ui/login/managers/LoginAuthManager.gd:40)

### Version Cache

**Lokasi:** `user://data/versions.json`

Berisi version number untuk setiap category asset. Digunakan untuk menentukan apakah perlu download update dari server.

**Sumber:** [`data_manager.gd:16`](client/src/autoload/data_manager.gd:16)

---

## 🔐 Data Visibility Summary

### Data Dikirim ke Client (Server → Client)

| Kategori | Data |
|----------|------|
| User | current_user, session_token, energy, silver, gold |
| Location | currentRegion (ID saja - client lookup type dari DataManager) |
| Heroes | current_heroes, stats, buffs |
| Inventory | inventory, inventory_status |
| Quests | active_quests, active_task |
| World | world_state, online_friends |

### Data Client-Only (Tidak Dikirim ke Server)

| Kategori | Data |
|----------|------|
| UI State | selected_hero_id, last_visited_hub |
| Cache | _data_cache, _local_versions |
| Settings | user_settings (di-parse lokal) |

---

## 📁 Referensi File

| File | Line Reference |
|------|----------------|
| GameState Main | [`client/src/autoload/game_state.gd`](client/src/autoload/game_state.gd) |
| DataManager | [`client/src/autoload/data_manager.gd`](client/src/autoload/data_manager.gd) |
| ServerConnector | [`client/src/autoload/server_connector.gd`](client/src/autoload/server_connector.gd) |
| LocalizationManager | [`client/src/autoload/LocalizationManager.gd`](client/src/autoload/LocalizationManager.gd) |
| TopHUD | [`client/src/ui/TopHUD.gd`](client/src/ui/TopHUD.gd) |
| SideHUD | [`client/src/ui/SideHUD.gd`](client/src/ui/SideHUD.gd) |
| MarketScreen | [`client/src/ui/MarketScreen.gd`](client/src/ui/MarketScreen.gd) |
| MapTravelSystem | [`client/src/ui/MapTravelSystem.gd`](client/src/ui/MapTravelSystem.gd) |
| GuildScreen | [`client/src/ui/GuildScreen.gd`](client/src/ui/GuildScreen.gd) |
| CombatScreen | [`client/src/ui/CombatScreen.tscn`](client/src/ui/CombatScreen.tscn) |
| CraftingScreen | [`client/src/ui/CraftingScreen.gd`](client/src/ui/CraftingScreen.gd) |
| FormationScreen | [`client/src/ui/FormationScreen.gd`](client/src/ui/FormationScreen.gd) |
| QuestScreen | [`client/src/ui/QuestScreen.gd`](client/src/ui/QuestScreen.gd) |
| TavernScreen | [`client/src/ui/TavernScreen.gd`](client/src/ui/TavernScreen.gd) |
| WorldAtlas | [`client/src/ui/WorldAtlas.gd`](client/src/ui/WorldAtlas.gd) |
| ChatWindow | [`client/src/ui/ChatWindow.gd`](client/src/ui/ChatWindow.gd) |

---

*Document generated from code analysis*
*Last updated: 2026-02-17*

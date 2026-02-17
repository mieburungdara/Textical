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
> - ada fallback ke "TOWN"** **TIDAK - jika region data unavailable, return "" dan log error
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

**Sumber:** [`game_state.gd:48-54`](client/src/autoload/game_state.gd:48)

---

### 3. Hero & Party Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `current_heroes` | Array | [] | List hero player |
| `selected_hero_id` | int | -1 | Hero yang sedang dipilih |
| `_heroes_loaded_from_server` | bool | false | Flag apakah heroes sudah di-load dari server |

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
| TopHUD | [`client/src/ui/TopHUD.gd`](client/src/ui/TopHUD.gd) |
| SideHUD | [`client/src/ui/SideHUD.gd`](client/src/ui/SideHUD.gd) |
| MarketScreen | [`client/src/ui/MarketScreen.gd`](client/src/ui/MarketScreen.gd) |
| MapTravelSystem | [`client/src/ui/MapTravelSystem.gd`](client/src/ui/MapTravelSystem.gd) |

---

*Document generated from code analysis*
*Last updated: 2026-02-17*

Dokumentasi ini menjelaskan **semua data yang disimpan pada sisi client** (browser/game client) dalam Textical RPG. Data ini mencakup state volatile (memory), cached data, dan persistent storage.

---

## 📁 File Utama Penyimpanan Data Client

| File | Lokasi | Fungsi Utama |
|------|--------|--------------|
| `game_state.gd` | `client/src/autoload/game_state.gd` | Main game state, session, user data |
| `data_manager.gd` | `client/src/autoload/data_manager.gd` | Asset cache, template data |
| `server_connector.gd` | `client/src/autoload/server_connector.gd` | Network handlers, API communication |
| SocketHandler | `client/src/network/SocketHandler.gd` | Real-time socket connection |

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
> - ada fallback ke "TOWN"** **TIDAK - jika region data unavailable, return "" dan log error
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

**Sumber:** [`game_state.gd:48-54`](client/src/autoload/game_state.gd:48)

---

### 3. Hero & Party Data

| Variabel | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `current_heroes` | Array | [] | List hero player |
| `selected_hero_id` | int | -1 | Hero yang sedang dipilih |
| `_heroes_loaded_from_server` | bool | false | Flag apakah heroes sudah di-load dari server |

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
| TopHUD | [`client/src/ui/TopHUD.gd`](client/src/ui/TopHUD.gd) |
| SideHUD | [`client/src/ui/SideHUD.gd`](client/src/ui/SideHUD.gd) |
| MarketScreen | [`client/src/ui/MarketScreen.gd`](client/src/ui/MarketScreen.gd) |
| MapTravelSystem | [`client/src/ui/MapTravelSystem.gd`](client/src/ui/MapTravelSystem.gd) |

---

*Document generated from code analysis*
*Last updated: 2026-02-17*


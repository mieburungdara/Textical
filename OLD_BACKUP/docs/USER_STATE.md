# 📊 USER STATE di Textical RPG

Berdasarkan analisis database schema dan client-side code, berikut adalah **semua USER STATE** yang ada di game ini:

> **Catatan:**
> - 🟢 = Dikirim ke Client (visible)
> - 🔴 = Server Only (tidak dikirim ke client)
> - 🟡 = Partial (terkadang dikirim, kadang tidak)

---

## 🔴 CORE VITAL STATE (Status Kehidupan Utama)

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `energy` | Int | 100 | 🟢 | Energy saat ini untuk action |
| `maxEnergy` | Int | 100 | 🟢 | Maximum energy cap |
| `lastEnergyUpdate` | DateTime | now() | 🔴 | Timestamp update energy terakhir (server only) |
| `isKnockedOut` | Boolean | false | 🟢 | Apakah player sedang KO/unconscious |
| `knockedOutUntil` | DateTime? | null | 🟢 | Sampai kapan player KO |
| `recoveryUntil` | DateTime? | null | 🟢 | Waktu recovery selesai |
| `moral` | Int | **0** | 🟢 | Moral/kehormatan player (-100 to +100 range) |

---

## 💰 CURRENCY & ECONOMY STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `silver` | Int | 0 | 🟢 | Silver currency (currency tier 1) |
| `gold` | Int | 0 | 🟢 | Gold currency (currency tier 2) |
| `maxInventorySlots` | Int | 20 | 🟢 | Kapasitas maksimum inventory |
| `infamyScore` | Int | 0 | 🟢 | Infamy score (reputation negatif) |

---

## 🗺️ LOCATION & REGION STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `currentRegion` | Int | 1 | 🟢 | Region ID saat ini |
| `lastVisitedCityId` | Int? | null | 🟢 | Kota terakhir dikunjungi |
| `bindPointId` | Int? | null | 🟢 | Bind point/respawn point region ID |

---

## ⚔️ PVP & COMBAT STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `isPvpFlagged` | Boolean | false | 🟢 | Apakah PvP flag aktif |
| `pvpFlagged` | Boolean | false | 🔴 | *(Duplicate - potential bug, server only)* |
| `lastPvpAction` | DateTime? | null | 🔴 | Timestamp action PvP terakhir (server only) |

---

## 🍺 TAVERN & REST STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `isInTavern` | Boolean | false | 🟢 | Apakah player di dalam Tavern |
| `tavernEntryAt` | DateTime? | null | 🟡 | Kapan masuk Tavern (partial) |
| `tavernTimeSecondsToday` | Int | 0 | 🟡 | Waktu di tavern hari ini (detik, partial) |
| `lastTavernResetAt` | DateTime | now() | 🔴 | Reset waktu tavern (server only) |

---

## 🎫 QUEST & TASK STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `lastQuestResetAt` | DateTime | now() | 🔴 | Reset quest terakhir (server only) |
| `restingXpPool` | Int | 0 | 🟢 | XP yang di-rest (tidak diklaim) |
| `activeQuests` | Array | [] | 🟢 | Quest aktif (client-side) |
| `activeTask` | Object | null | 🟢 | Task aktif (client-side) |

---

## 👥 SOCIAL & FACTION STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `guildId` | Int? | null | 🟢 | Guild ID |
| `guildRole` | String? | null | 🟢 | Role dalam guild |
| `factionId` | Int? | null | 🟢 | Faction ID |
| `informantReputation` | Float | 0.0 | 🟢 | Reputation dengan informant |
| `banditReputation` | Float | 0.0 | 🟢 | Reputation dengan bandit |
| `online_friends` | Array | [] | 🟢 | Friend yang online (client-side) |

---

## 💎 PREMIUM & SPECIAL STATE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `premiumTierId` | Int | 0 | 🟢 | Premium tier (VIP status) |
| `activeSpiritId` | Int? | null | 🟢 | Active spirit companion ID |
| `activeSpiritExpiresAt` | DateTime? | null | 🟢 | Kapan spirit expired |
| `escortGridsRemaining` | Int | 0 | 🟢 | Sisa escort grids |
| `activeEscortName` | String? | null | 🟢 | Nama escort aktif |

---

## ⚙️ SETTINGS & USER PREFERENCE

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `settings` | String | "{}" | 🔴 | JSON settings string (server only, di-parse dulu) |
| `user_settings` | Dictionary | {} | 🟢 | Parsed settings (client-side) |

---

## 🎮 SESSION & AUTH STATE (Client-Side)

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `current_user` | Object | null | 🟢 | User object dari server (received) |
| `session_token` | String | "" | 🟢 | Session token (received) |
| `session_expires_at` | int | 0 | 🟢 | Session expiration timestamp (received) |

---

## 🎒 INVENTORY STATE (Client-Side)

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `inventory` | Array | [] | 🟢 | Item dalam inventory (received from server) |
| `inventory_status` | Dictionary | {"used": 0, "max": 20} | 🟢 | Status inventory (received) |
| `inventory_is_dirty` | Boolean | true | 🔴 | Perlu sync dengan server (client only) |

---

## 🦸 HERO STATE (Related to User)

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `current_heroes` | Array | [] | 🟢 | List hero player (received from server) |
| `selected_hero_id` | int | -1 | 🔴 | Hero yang dipilih (client only) |

---

## 🌍 WORLD STATE (Global - affects User)

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `world_state` | Dictionary | {"currentHour": 12, "weatherType": "CLEAR"} | 🟢 | Global world state (received) |
| `current_region_data` | Object | null | 🟢 | Data region saat ini (received) |
| `current_region_type` | String | "TOWN" | 🟢 | Tipe region (TOWN/FOREST/etc) (derived) |

---

## 📊 USER SESSION TABLE (Server-Side Auth - Server Only!)

> ⚠️ **IMPORTANT**: Session data TIDAK dikirim ke client. Ini dikelola sepenuhnya di server.

| State | Tipe | Default | Visibility | Deskripsi |
|-------|------|---------|------------|-----------|
| `id` | String | UUID | 🔴 | Session ID (server only) |
| `userId` | Int | - | 🔴 | User ID (server only) |
| `deviceId` | String | - | 🔴 | Device ID (server only) |
| `deviceInfo` | String | - | 🔴 | Device info (server only) |
| `deviceType` | String | "DESKTOP" | 🔴 | Tipe device (server only) |
| `ipAddress` | String | - | 🔴 | IP address (server only) |
| `token` | String | unique | 🔴 | Session token (server only) |
| `isActive` | Boolean | true | 🔴 | Session aktif? (server only) |
| `lastHeartbeat` | DateTime | now() | 🔴 | Last heartbeat (server only) |
| `expiresAt` | DateTime | - | 🔴 | Expired at (server only) |

---

## 🔄 STATE TRANSITION RULES

### Moral System (NEW!)
- Range: **-100 hingga +100**
- Default: **0** (neutral)
- +100: Saint/Paragon (fully good)
- -100: Criminal/Villain (fully evil)
- Mechanics: Untuk ditentukan (PvP kills, crimes, quests, etc.)

### Energy Regeneration
- Normal: +1 energy per tick
- Di Tavern: +3 energy per tick (3x multiplier)
- Premium: Berdasarkan `premiumTierId` dengan `energyRegenMult`

### Knockout System
- Trigger: HP reaches 0 dalam combat
- Duration: Berdasarkan `knockedOutUntil`
- Recovery: Auto-recovery setelah `recoveryUntil`
- Blocked actions: Travel, Combat, Trading

### PvP Flag
- Manual toggle: `isPvpFlagged`
- Required for: Attacking other players di open PvP zones
- Cooldown: `lastPvpAction` tracks timing

### Tavern System
- Enter: Ketika masuk building Tavern
- Benefits: Enhanced energy regen, can recruit heroes
- Exit: Manual exit atau travel

---

## 📈 RINGKASAN VISIBILITY

| Kategori | 🟢 Client | 🔴 Server Only | 🟡 Partial |
|----------|-----------|-----------------|------------|
| Core Vital | 5 | 1 | 0 |
| Currency | 4 | 0 | 0 |
| Location | 3 | 0 | 0 |
| PvP | 1 | 1 | 0 |
| Tavern | 1 | 1 | 2 |
| Quest | 2 | 1 | 0 |
| Social | 6 | 0 | 0 |
| Premium | 5 | 0 | 0 |
| Settings | 1 | 1 | 0 |
| Session | 3 | 0 | 0 |
| Inventory | 2 | 1 | 0 |
| Hero | 1 | 1 | 0 |
| World | 3 | 0 | 0 |
| **TOTAL** | **~37** | **~6** | **~2** |

---

## ⚠️ POTENTIAL ISSUES

1. ~~**Moral Default**:~~ ✅ **FIXED** - Default berubah dari 100 ke 0 sesuai classic moral system (-100 to +100)
2. **Duplicate PvP Flag**: Ada `isPvpFlagged` DAN `pvpFlagged` - perlu di-audit
3. **Naming Inconsistency**: `isPvpFlagged` menggunakan camelCase, `pvpFlagged` menggunakan lowercase

---

## 📁 FILES REFERENCE

- Database Schema: `server/prisma/schema.prisma` (line 10-98)
- Client State: `client/src/autoload/game_state.gd`
- Session Service: `server/src/services/sessionService.js`
- Vitality/Energy: `server/src/services/vitalityService.js`
- KO Manager: `server/src/services/vitality/KOManager.js`

---

*Document generated from code analysis*
*Last updated: 2026-02-17*

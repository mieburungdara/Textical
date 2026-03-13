# Plan Later - Textical RPG Client

## 📋 Overview
Dokumen ini berisi rencana pengembangan yang ditunda. Disimpan sebagai pengingat untuk implementasi di masa depan.

---

# BAGIAN 1: FITUR YANG SUDAH SELESAI

## 1.1 UI Scenes
- ✅ GameScene.tscn - Main scene dengan location views
- ✅ GlobalHUD.tscn - Top bar, navigation buttons
- ✅ HeroRoster.tscn - Hero grid dengan drag/drop
- ✅ HeroDetail.tscn - Stats, equipment (clickable slots)
- ✅ InventoryUI.tscn - Inventory + equipment management
- ✅ QuestBoardUI.tscn - Quest selection
- ✅ ShopUI.tscn - Shop untuk membeli item
- ✅ BlacksmithUI.tscn - Blacksmith untuk upgrade equipment
- ✅ TownHallUI.tscn - Town Hall untuk manage heroes dan combat
- ❌ InnUI.tscn - DIHAPUS (tidak perlu - tidak ada sistem HP/stamina)

## 1.2 Scripts
- ✅ GameScene.gd - Location management, building interactions
- ✅ GlobalHUD.gd - HUD display
- ✅ GameManager.gd - Player state (gold, heroes, inventory)
- ✅ LocationManager.gd - Location transitions
- ✅ HeroRoster.gd - Hero grid, selection, drag/drop
- ✅ HeroDetail.gd - Hero stats dengan clickable equipment
- ✅ InventoryUI.gd - Inventory dengan filter + callback ke HeroDetail
- ✅ QuestBoardUI.gd - Quest list
- ✅ ShopUI.gd - Shop dengan buy functionality
- ✅ BlacksmithUI.gd - Equipment upgrade
- ✅ TownHallUI.gd - Combat entry
- ❌ InnUI.gd - DIHAPUS (tidak perlu)

## 1.3 Bug Fixes
- ✅ HeroDetail → Inventory callback after equip - FIXED

---

# BAGIAN 2: FITUR YANG BELUM SELESAI (TODO)

---

## 2.1 Server Database Integration (PRIORITAS: HIGH)

### Apa yang perlu dibuat:

#### Backend API (server/):
1. **GET /api/players/:id** - Player profile
2. **GET /api/players/:id/heroes** - All heroes
3. **GET /api/heroes/:id** - Single hero
4. **PUT /api/heroes/:id** - Update hero (equipment)
5. **GET /api/players/:id/inventory** - Inventory
6. **POST /api/players/:id/gold** - Add/spend gold

#### Socket.IO Events:
- Client→Server: 'player:connect', 'hero:equip', 'inventory:use_item', 'quest:accept'
- Server→Client: 'hero:updated', 'gold:updated', 'inventory:updated'

#### File baru: client/scripts/ServerClient.gd
- Singleton untuk koneksi server
- Functions: connect_to_server(), fetch_heroes(), equip_item(), use_item()
- Signals: connected, disconnected, hero_updated, gold_updated, error_occurred
- Offline mode support

#### Modifikasi: client/scripts/GameManager.gd
- Tambahkan: server_client reference, is_offline_mode
- Tambahkan: sync functions (sync_hero_to_server, sync_inventory)
- Modifikasi: add_hero(), remove_hero(), equip_item() untuk server sync

---

## 2.2 Interactive Buildings (PRIORITAS: MEDIUM) - ✅ COMPLETED

### 2.2.1 ShopUI.tscn + ShopUI.gd ✅
- Panel utama dengan category buttons (Weapons, Armor, Accessories, Consumables)
- Item grid dengan filter
- Item detail + price display
- Buy button - deduct gold, add to inventory
- Sell button - add gold (50% price)
- Price formula: Buy = value, Sell = value * 0.5

### 2.2.2 InnUI.tscn + InnUI.gd ❌ DIHAPUS
- TIDAK ADA HP/STAMINA SISTEM - Setiap battle dimulai dengan full health

### 2.2.3 BlacksmithUI.tscn + BlacksmithUI.gd ✅
- Hero selector dropdown
- Upgrade equipment - cost: item.value * (level + 1), effect: +10%/level, max level: 10
- Repair equipment - cost: (max_durability - current) * 5 gold

### 2.2.4 TownHallUI.tscn + TownHallUI.gd ✅
- Kingdom status display
- Main quest display
- Enter Combat button (navigates to location)

---

## 2.3 Dungeon Encounter System (PRIORITAS: MEDIUM)

### File baru: client/scripts/DungeonManager.gd

#### Data:
- current_floor: int (1-100)
- current_room: int
- rooms_per_floor: int (default 5)
- encounter_types: Array

#### Encounter Types:
1. EMPTY - No encounter
2. COMBAT - Random enemy
3. TREASURE - Chest with loot
4. TRAP - Damage/debuff
5. BOSS - Every 5 floors
6. STAIRS - Next floor
7. HEAL - Restore point

#### Enemy Scaling:
- HP = base_hp * (1 + floor * 0.1)
- Attack = base_atk * (1 + floor * 0.08)
- XP = base_xp * (1 + floor * 0.15)
- Gold = base_gold * (1 + floor * 0.12)

---

## 2.4 Combat Integration (PRIORITAS: MEDIUM)

### File baru/modifikasi: client/scripts/CombatManager.gd

#### Flow:
1. Player enters encounter
2. Client sends team composition to server
3. Server simulates (deterministic tick-based)
4. Client receives replay
5. Client plays replay
6. Apply rewards

#### Replay Format:
```json
{
  "combat_id": "uuid",
  "duration": 120,
  "teams": {"player": [...], "enemy": [...]},
  "events": [
    {"tick": 0, "type": "START", "data": {...}},
    {"tick": 5, "type": "ACTION", "actor": "hero_0", "action": "ATTACK", "target": "enemy_0", "damage": 25},
    {"tick": 120, "type": "END", "result": "WIN", "rewards": {...}}
  ]
}
```

---

## 2.5 Inventory System Lanjutan (PRIORITAS: MEDIUM)

### 2.5.1 Use Consumables
- Implement _on_use_pressed() dengan full logic
- Item types: health_potion, mana_potion, antidote, buff_scroll, teleport_scroll, revive_scroll
- Target selection untuk party items
- Reduce quantity after use

### 2.5.2 Item Stacking
- Same item_id dapat stack
- Max stack: 99
- Update UI untuk show quantity

---

## 2.6 Quest System (PRIORITAS: LOW)

### File baru: client/scripts/QuestManager.gd
- Quest Types: MAIN, SIDE, DAILY, EVENT
- Objective Types: KILL, COLLECT, VISIT, TALK, ESCORT, DEFEND, EXPLORE

### Functions:
- accept_quest(quest_id)
- update_progress(objective_type, target, amount)
- complete_quest(quest_id)
- abandon_quest(quest_id)

---

# BAGIAN 3: KNOWN ISSUES / BUGS

## Issue #1: HeroDetail → Inventory Callback
Status: ✅ FIXED (2026-03-13)
- Click pada equipment slot sudah works
- Filter inventory by slot type sudah works
- Callback dari InventoryUI ke HeroDetail setelah equip - NOW WORKS

## Issue #2: Consumables
Status: PARTIALLY IMPLEMENTED
- _on_use_pressed() has basic implementation
- Need to add effect application (heal, buff, etc.)

## Issue #3: Item Stacking
Status: NOT IMPLEMENTED
- Perlu update inventory logic

---

# BAGIAN 4: PRIORITAS IMPLEMENTASI

## Priority 1 (Segera):
1. ✅ Fix HeroDetail → Inventory callback - COMPLETED
2. Server Database Integration
3. Consumables use logic (full implementation)

## Priority 2 (Mendekati):
4. ✅ Interactive Buildings (Shop, Blacksmith) - COMPLETED
5. Dungeon Encounter System
6. Combat Integration

## Priority 3 (Nanti):
7. Quest System (tracking, progress)
8. (TIDAK ADA SAVE/LOAD - Game online-only, semua data di server)

---

# CATATAN PENTING

## Arsitektur Game
- **Online-only game** - semua data pemain ada di server (database)
- Client hanya menerima dan mengirim data via Socket.IO
- Tidak ada local storage untuk save game
- Saat player login: data di-fetch dari server
- Semua action langsung sync ke server (equip, use item, quest, dll)

---

*Last Updated: 2026-03-13*

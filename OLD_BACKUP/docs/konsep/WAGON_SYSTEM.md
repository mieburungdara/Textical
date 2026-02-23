# Fitur Wagon (Kereta Barangi) - Dokumentasi Konsep

> **Status**: Backend Implementation Done | UI Pending
> **Last Updated**: 2026-02-17

---

## 1. Gambaran Umum

Wagon adalah sistem logistik yang memungkinkan pemain mengangkut barang dalam jumlah besar antar kota/region. Fitur ini memberikan dimensi ekonomi dan strategi baru - pemain bisa menjadi pedagang antar-region dengan menanggung risiko pengangkutan.

---

## 2. User Stories

| ID | User Story | Prioritas |
|----|------------|-----------|
| US-01 | Sebagai pemain, saya ingin menyewa wagon agar bisa mengangkut banyak item | P0 |
| US-02 |Sebagai pemain, saya ingin memilih tier wagon sesuai budget dan kebutuhan | P0 |
| US-03 | Sebagai pemain, saya ingin memuat item dari inventory ke wagon | P0 |
| US-04 | Sebagai pemain, saya ingin mengangkut barang ke kota tujuan | P0 |
| US-05 | Sebagai pemain, saya ingin unload item dari wagon ke inventory | P1 |
| US-06 | Sebagai pemain, saya ingin wagon saya selamat dari ambush monster | P1 |
| US-07 | Sebagai pemain, saya ingin memutuskan antara membayar ransom atau bertarung saat encounter dengan bandit atau pemain lain | P0 |
| US-08 | Sebagai penyerang, saya ingin merampok wagon pemain lain | P1 |
| US-09 | Sebagai pemain, saya ingin mendapatkan reward dari erfolgreich hauling | P2 |

---

## 3. Mekanisme Utama

### 3.1 Penyewaan Wagon

**File**: [`HaulingService.js:24`](server/src/services/logistics/HaulingService.js:24)

**Syarat**:
- Pemain harus berada di kota asal (`user.currentRegion === originId`)
- Tidak boleh memiliki wagon aktif
- Cukup silver untuk membayar biaya

**Tier & Kapasitas**:

| Tier | Kapasitas | Biaya Dasar (per segmen) |
|------|-----------|--------------------------|
| SMALL | 5 slot | 50 silver |
| MEDIUM | 10 slot | 100 silver |
| LARGE | 15 slot | 200 silver |
| HEAVY | 20 slot | 500 silver |

**Formula Biaya**:
```
costSilver = baseRate × pathLength
```

### 3.2 Pemuatan Kargo (Loading)

**File**: [`HaulingService.js:67`](server/src/services/logistics/HaulingService.js:67)

- Status wagon harus `LOADING`
- Items dipindahkan dari inventory personal ke wagon
- Kapasitas berbasis slot (bukan stack)

### 3.3 Perjalanan Hauling

**Perbandingan Travel**:

| Tipe Travel | Durasi | Keterangan |
|-------------|--------|------------|
| NORMAL | 15 detik | Travel standar |
| HAULING_STAY | 60 detik | Mengangkut wagon |

**Mekanisme**:
1. Pemain travel dari origin → target
2. Tiap region memerlukan 60 detik "stay"
3. Setelah semua region selesai → auto-unload ke destination

### 3.4 Penurunan Kargo (Unloading)

**File**: [`HaulingService.js:99`](server/src/services/logistics/HaulingService.js:99)

- Items bisa dikembalikan ke inventory personal
- Syarat: inventory personal tidak penuh
- Bisa dilakukan kapan saja selama wagon aktif

### 3.5 Penyelesaian Haul

**File**: [`HaulingService.js:120`](server/src/services/logistics/HaulingService.js:120)

- Items "dikirim" ke bank kota tujuan
- Wagon dihancurkan
- ( Saat ini: items dihapus sebagai simulasi )

---

## 4. Fitur Keamanan & Risiko

### 4.1 Ambush Mechanic

**File**: [`HaulingService.js:142`](server/src/services/logistics/HaulingService.js:142)

| Zone Type | Risiko Ambush |
|-----------|---------------|
| GREEN | 0% (Aman) |
| RED | 5% - 50% per tick (berdasarkan dangerLevel) |

**Formula**:
```
ambushChance = region.dangerLevel × 0.05
```

### 4.2 Ransom vs Fight Mechanic (NEW)

Ketika pemain bertemu dengan player lain, monster, atau bandit yang menyerang wagon:
- Pemain diberikan **10 detik** untuk memutuskan
- **Catatan Penting**: 
  - **Monster**: **Tidak bisa** membayar ransom → otomatis harus FIGHT
  - **Bandit**: **Bisa** membayar ransom (karena butuh uang juga)
  - **Pemain lain**: **Bisa** memilih PAY_RANSOM atau FIGHT

**Mekanisme Timer**:
```
1. Trigger encounter (player/monster/bandit)
2. Cek tipe penyerang:
   - Jika MONSTER → langsung battle (tidak ada opsi ransom)
   - Jika BANDIT/PLAYER → kirim notifikasi ke client dengan timer 10 detik
3. Player pilih: PAY_RANSOM atau FIGHT
4. Jika timeout (10 detik) → default ke FIGHT
```

**Ransom Calculation**:
```
baseRansom = wagon.tier.baseRate × 2
modifier = currentCargoValue × 0.1
totalRansom = baseRansom + modifier
```

**Reward untuk Penyerang (jika player)**:
```
attackerReward = totalRansom × 0.5
killedWagon = true
cargoDestroyed = true
```

### 4.2 Loot Interruption

**File**: [`LootService.js`](server/src/services/logistics/LootService.js:11)

Jika pemain di-interrupt saat meng-ransack korban:
- Wagon korban dihancurkan
- Semua kargo hilang
- menambah dimensi strategis PvP

### 4.3 Battle di Zona Merah

**File**: [`RewardProcessor.js:137`](server/src/services/battle/RewardProcessor.js:137)

Jika kalah battle di zona merah:
- Wagon dihancurkan
- Semua kargo hilang

---

## 5. API Endpoints

### 5.1 Penyewaan

```
POST /api/wagon/rent
Body: { tier, originId, targetId, path }
```

### 5.2 Loading

```
POST /api/wagon/load
Body: { itemInstanceId, quantity }
```

### 5.3 Unloading

```
POST /api/wagon/unload
Body: { wagonItemId }
```

### 5.4 Completion

```
POST /api/wagon/complete
```

### 5.5 Status

```
GET /api/wagon/status
```

### 5.6 Ransom Encounter (NEW)

```
POST /api/wagon/encounter/respond
Body: { decision: "PAY_RANSOM" | "FIGHT" }
GET /api/wagon/encounter/:encounterId
```

**Catatan**: Endpoint ini hanya untuk encounter dengan **bandit atau pemain lain**. Untuk monster, tidak ada opsi ransom.

### 5.7 Initiate Attack (NEW)

```
POST /api/wagon/attack
Body: { targetUserId }
```

---

## 6. Database Schema

### 6.1 Wagon Table

```prisma
model Wagon {
  id              Int       @id @default(autoincrement())
  userId         Int
  tier           String    // "SMALL", "MEDIUM", "LARGE", "HEAVY"
  capacity       Int
  status         String    // "LOADING", "IN_TRANSIT", "COMPLETED"
  originRegionId Int
  targetRegionId Int
  selectedPath   String    // JSON array of region IDs
  currentPathIndex Int
  feePaid        Int
  createdAt      DateTime  @default(now())
  items          WagonItem[]
}
```

### 6.2 WagonItem Table

```prisma
model WagonItem {
  id          Int       @id @default(autoincrement())
  wagonId     Int
  templateId  Int
  quantity    Int
  wagon       Wagon     @relation(fields: [wagonId], references: [id])
}
```

---

## 7. Error Codes

| Kode | Message | Solusi |
|------|---------|--------|
| `WAGON_INVALID_TIER` | Invalid wagon tier | Pilih tier valid |
| `WAGON_ALREADY_ACTIVE` | Already have active wagon | Selesaikan haul |
| `WAGON_WRONG_LOCATION` | Must be at origin city | Travel ke origin |
| `WAGON_FULL` | Wagon at capacity | Upgrade atau kosongkan |
| `WAGON_NO_ACTIVE` | No active wagon | Sewa wagon dulu |
| `WAGON_ITEM_NOT_FOUND` | Cargo item not found | Verifikasi item |
| `WAGON_INVENTORY_FULL` | Personal inventory full | Kosongkan inventory |
| `WAGON_RANSOM_TIMEOUT` | Ransom decision timeout | Pilih cepat atau fight |
| `WAGON_RANSOM_INSUFFICIENT` | Insufficient silver for ransom | Pilih fight atau batalkan |
| `WAGON_RANSOM_NOT_ALLOWED` | Cannot pay ransom to monsters | Monsters don't need money, must fight |

---

## 8. Integrasi Sistem

### 8.1 Travel System
- Menggunakan travel type `HAULING_STAY` (60 detik per region)
- Auto-trigger completeHaul saat sampai destination

### 8.2 Inventory System
- [`inventoryService.hasSpace()`](server/src/services/inventoryService.js:15) mendeteksi wagon aktif
- Kapasitas dinamis: jika wagon aktif → gunakan kapasitas wagon

### 8.3 Battle System
- Wagon bisa dihancurkan saat kalah battle
- Loot session link ke wagonId

### 8.4 Quest System
- Tambahkan quest type "Hauling"
- Reward: silver, reputation, EXP

---

## 9. Pertimbangan Game Balance

### 9.1 Economic Balance

| Aspek | Nilai | Justifikasi |
|-------|-------|-------------|
| Biaya Minimal (SMALL, 2 region) | 100 silver | Affordable untuk early game |
| Biaya Maksimal (HEAVY, 10 region) | 5000 silver | High risk, high reward |
| Durasi Per Region | 60 detik | Memberikan waktu respons untuk ambush |

### 9.2 Risk/Reward

- **Green Zone**: Murah (tidak ada ambush), tapi risk rendah
- **Red Zone**: Mahal, risk tinggi, reward tinggi (barang langka)

### 9.3 Ransom Balance (NEW)

| Aspek | Nilai | Justifikasi |
|-------|-------|-------------|
| Decision Timer | 10 detik | Cukup waktu berpikir, tidak terlalu lama |
| Base Ransom | Tier baseRate × 2 | Kompensasi effort penyerang |
| Cargo Modifier | Cargo value × 10% | Lebih banyak cargo = lebih besar risiko |
| Attacker Reward | Ransom × 50% | Insentif untuk PvP wagon |
| Timeout Default | FIGHT | Pemain yang tidak responsif dianggap memilih fight |

### 9.4 Anti-Exploit

- Wagon tidak bisa digunakan untuk crafting/gathering
- Wagon hilang jika transport gagal
- Kapasitas berbasis slot (tidak bisa stacking)

---

## 10. Roadmap Pengembangan

### Phase 1: Backend (DONE ✓)
- [x] Database schema
- [x] HaulingService CRUD
- [x] Travel integration
- [x] Ambush mechanic
- [x] Ransom vs Fight mechanic (NEW)

### Phase 2: UI Implementation (PENDING)
- [ ] Wagon rental UI (Town screen)
- [ ] Wagon inventory UI
- [ ] Wagon status HUD
- [ ] Loading/Unloading interface
- [ ] Ransom encounter UI (NEW)
- [ ] Timer display for ransom decision

### Phase 3: Advanced Features (BACKLOG)
- [ ] Bank system (simpan item di kota tujuan)
- [ ] Wagon escort (hire NPC guards)
- [ ] Wagon upgrades (speed, capacity, defense)
- [ ] Guild wagon (shared logistics)
- [ ] Wagon theft PvP mechanic
- [ ] Ransom system (NEW) ✓

---

## 11. Referensi Kode

| File | Deskripsi |
|------|-----------|
| [`server/src/services/logistics/HaulingService.js`](server/src/services/logistics/HaulingService.js) | Core service |
| [`server/src/services/logistics/LootService.js`](server/src/services/logistics/LootService.js) | Loot & wagon destruction |
| [`server/src/services/inventoryService.js`](server/src/services/inventoryService.js) | Capacity check |
| [`server/src/services/battle/RewardProcessor.js`](server/src/services/battle/RewardProcessor.js) | Battle integration |
| [`docs/TRAVEL_SYSTEM.md`](docs/TRAVEL_SYSTEM.md) | Travel documentation |

---

## 12. Test Cases

### 12.1 Hauling Rental Test
```javascript
// server/src/scripts/hauling_rental_audit.js
const wagon = await haulingService.rentWagon(userId, "SMALL", originId, targetId, [1, 2]);
```

### 12.2 Capacity Test
```javascript
// server/src/scripts/inventory_wagon_capacity_audit.js
const statusFull = await inventoryService.getStatus(userId, wagon.id);
// IsFull: true when used === max
```

### 12.3 Loot Interruption Test
```javascript
// server/src/scripts/loot_interruption_master_audit.js
// Wagon harus dihancurkan saat looter di-interrupt
```

---

## 13. Catatan Developer

> **TODO**: 
> - Implementasi Bank system untuk menyimpan item di kota tujuan
> - UI visualization untuk wagon
> - Tambahkan quest type "Hauling Quest"
> - Ransom encounter UI (10 detik timer)
> -考虑 wagon sebagai mount/vehicle visual

> **KNOWN ISSUES**:
> - Items "hilang" saat completeHaul (belum ada bank)
> - UI belum ada (backend only)
> - Wagon defense stat belum diimplementasikan
> - Ransom system perlu diimplementasikan di backend

---

*Document generated from Textical codebase analysis - 2026-02-17*

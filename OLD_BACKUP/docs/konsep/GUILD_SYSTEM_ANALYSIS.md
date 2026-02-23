# Dokumentasi Sistem Guild Textical — Analisis Komprehensif

> **Status**: Analisis Lengkap | **Tanggal**: 2026-02-17
> **Versi**: 1.0

---

## 1. Pendahuluan

Dokumen ini menyajikan analisis menyeluruh terhadap sistem guild dalam game Textical, sebuah MMORPG berbasis idle yang dibangun dengan arsitektur server-authoritative menggunakan Node.js, Prisma (SQLite), dan client Godot 4.x. Analisis mencakup struktur data, fitur yang telah terimplementasi maupun yang masih kosong, alur kerja sistem, perbandingan dengan standar industri game RPG sejenis, serta rekomendasi pengembangan prioritas.

Sistem guild merupakan salah satu pilar utama dalam game RPG modern karena fungsinya sebagai penghela sosialisasi, kompetitif, dan ekonomi lintas-pemain. Dalam konteks Textical, guild memiliki peran strategis dalam控 wilayah (territory control), taxation, dan fasilitas kolektif yang berdampak langsung pada progression speed pemain.

---

## 2. Struktur Data dan Model Database

### 2.1 Model Guild Utama

Guild merupakan entitas sentral dalam sistem ini. Berikut adalah detail schema dari [`server/prisma/schema.prisma:1277-1297`](server/prisma/schema.prisma:1277):

```prisma
model Guild {
  id               Int              @id @default(autoincrement())
  name             String           @unique
  templateId       Int
  color            String           @default("#f59e0b")
  vaultGold        Int              @default(0)
  treasury         Int              @default(0)
  marketTaxRate    Float            @default(0.0)
  gatheringTaxRate Float            @default(0.0)
  factionId        Int?
  faction          Faction?         @relation(fields: [factionId], references: [id])
  template         GuildTemplate    @relation(fields: [templateId], references: [id])
  facilities       GuildFacility[]
  history          GuildHistory[]
  invites          GuildInvite[]
  perks            GuildPerk[]
  ownedRegions     RegionTemplate[] @relation("RegionOwnership")
  siegesAsAttacker Siege[]          @relation("AttackerRelation")
  territories      Territory[]
  members          User[]
}
```

Beberapa observasi penting mengenai model Guild:

- **Treasury dan Vault**: Guild memiliki dua sumber daya finansial terpisah, namely `treasury` (default 0) dan `vaultGold` (default 0). Ini mengindikasikan adanya rencana untuk memisahkan antara gold yang dapat ditarik (treasury) dan gold yang terkunci (vault).
- **Tax Rates**: Ada dua jenis pajak yang dapat dikonfigurasi, yaitu `marketTaxRate` dan `gatheringTaxRate`. Ini menunjukkan integrasi dengan sistem ekonomi regional.
- **Faction Alignment**: Guild dapat berafiliasi dengan faction tertentu melalui relasi `factionId`.
- **Territory Ownership**: Relasi `ownedRegions` memungkinkan guild memiliki dan mengontrol wilayah secara langsung.

### 2.2 Model Pendukung Guild

#### GuildInvite (Undangan Guild)

```prisma
model GuildInvite {
  id            Int      @id @default(autoincrement())
  guildId       Int
  invitedUserId Int?
  invitedBy     Int
  inviteCode    String   @unique
  status        String   @default("PENDING")
  expiresAt     DateTime
  createdAt     DateTime @default(now())
  inviter       User     @relation("InviterRelation", fields: [invitedBy], references: [id])
  invitedUser   User?    @relation("InvitedUserRelation", fields: [invitedUserId], references: [id])
  guild         Guild    @relation(fields: [guildId], references: [id])

  @@index([guildId])
  @@index([inviteCode])
}
```

Sistem undangan menggunakan kode unik (`inviteCode`) yang memiliki expiry time. Ini mirip dengan sistem invite code di game-game modern seperti Clash of Clans atau Genshin Impact.

#### GuildFacility (Fasilitas Guild)

```prisma
model GuildFacility {
  id         Int                   @id @default(autoincrement())
  guildId    Int
  templateId Int
  level      Int                   @default(1)
  template   GuildFacilityTemplate @relation(fields: [templateId], references: [id])
  guild      Guild                 @relation(fields: [guildId], references: [id])

  @@unique([guildId, templateId])
}
```

Setiap guild dapat membangun berbagai fasilitas dengan level yang berbeda. Keterbatasan `@@unique([guildId, templateId])` menunjukkan bahwa satu guild hanya bisa memiliki satu instance dari setiap tipe fasilitas (tidak bisa build Training Grounds dua kali).

#### GuildFacilityTemplate (Template Fasilitas)

```prisma
model GuildFacilityTemplate {
  id                Int             @id @default(autoincrement())
  name              String
  description       String
  type              String
  statKey           String?
  statValuePerLevel Float?
  costBase          Int             @default(1000)
  costMult          Float           @default(1.5)
  facilities        GuildFacility[]
}
```

Sistem template memungkinkan fleksibilitas dalam desain fasilitas dengan parameter `costBase` (biaya dasar) dan `costMult` (multiplier biaya per level) untuk scaling ekonomi.

#### Territory (Wilayah)

```prisma
model Territory {
  id                   Int            @id @default(autoincrement())
  regionId             Int            @unique
  guildId              Int
  fortification        Int            @default(1000)
  maxFortification     Int            @default(1000)
  siegeStatus          String         @default("PEACE")
  capturedAt           DateTime       @default(now())
  lastUpkeepAt         DateTime       @default(now())
  monthlyQuestProgress Int            @default(0)
  monthlyQuestQuota    Int            @default(10)
  maintenanceCost      Int            @default(1000)
  taxDistributionRate  Float          @default(0.5)
  nextMaintenanceAt    DateTime       @default(now())
  activeSieges         Siege[]
  guild                Guild          @relation(fields: [guildId], references: [id])
  region               RegionTemplate @relation(fields: [regionId], references: [id])
}
```

Territory adalah inti dari sistem siege. Fortification system dengan maintenance cost menciptakan ekonomi politik yang dinamis — guild harus mengeluarkan biaya upkeep untuk mempertahankan wilayah yang dikuasai.

#### Siege (Penyerbuan)

```prisma
model Siege {
  id              Int        @id @default(autoincrement())
  territoryId     Int
  attackerGuildId Int
  status          String     @default("ACTIVE")
  startedAt       DateTime   @default(now())
  endsAt          DateTime
  attackerGuild   Guild      @relation("AttackerRelation", fields: [attackerGuildId], references: [id])
  territory       Territory  @relation(fields: [territoryId], references: [id])
  logs            SiegeLog[]
}
```

#### GuildHistory (Riwayat Aktivitas)

```prisma
model GuildHistory {
  id           Int      @id @default(autoincrement())
  guildId      Int
  eventType    String
  userId       Int?
  targetUserId Int?
  description  String
  metadata     String   @default("{}")
  createdAt    DateTime @default(now())
  targetUser   User?    @relation("TargetUserRelation", fields: [targetUserId], references: [id])
  user         User?    @relation(fields: [userId], references: [id])
  guild        Guild    @relation(fields: [guildId], references: [id])
  metadataRel  GuildHistoryMeta[]

  @@index([guildId])
  @@index([createdAt])
}
```

Sistem log ini krusial untuk transparansi dan audit trail, terutama untuk operasi sensitif seperti treasury withdrawal.

### 2.3 Model Template

#### GuildTemplate

```prisma
model GuildTemplate {
  id           Int     @id @default(autoincrement())
  name         String
  description  String  @default("")
  creationReqs String  @default("{}")
  creationReqRel GuildCreationRequirement[]
  maxMembers   Int     @default(20)
  baseTreasury Int     @default(0)
  guilds       Guild[]
}
```

Template guild memungkinkan variasi dalam tipe guild dengan different creation requirements dan member caps.

### 2.4 Relasi dengan Model Lain

Guild di Textical terintegrasi dengan berbagai sistem lain:

- **User**: Setiap user memiliki `guildId` dan `guildRole` (di model User) untuk menunjukkan keanggotaan dan peran.
- **RegionTemplate**: Wilayah dapat dimiliki oleh guild melalui `guildOwnershipId`.
- **Faction**: Guild dapat berafiliasi dengan faction, membuka kemungkinan faction-based guild wars.
- **ChatMessage**: Channel type "GUILD" memungkinkan chat antar-anggota.

---

## 3. Fitur yang Telah Terimplementasi

### 3.1 Backend Service

File [`server/src/services/guildService.js`](server/src/services/guildService.js) telah mengimplementasikan berbagai fungsi inti:

| Metode | Deskripsi | Status |
|--------|-----------|--------|
| `createGuild` | Membuat guild baru dari template | ✅ |
| `addExp` | Menambahkan experience ke guild | ✅ |
| `joinGuild` | Pemain bergabung ke guild | ✅ |
| `leaveGuild` | Pemain keluar dari guild | ✅ |
| `kickMember` | Mengusir anggota | ✅ |
| `promoteMember` | Menaikkan rank anggota | ✅ |
| `demoteMember` | Menurunkan rank anggota | ✅ |
| `transferLeadership` | Mentransfer peran Master | ✅ |
| `updateGuildSettings` | Mengupdate pengaturan guild | ✅ |
| `depositTreasury` | Deposit ke treasury | ✅ |
| `withdrawTreasury` | Penarikan dari treasury | ✅ |
| `buildFacility` | Membangun fasilitas | ✅ |
| `upgradeFacility` | Mengupgrade fasilitas | ✅ |
| `createInvite` | Membuat kode undangan | ✅ |
| `acceptInvite` | Menerima undangan | ✅ |
| `cancelInvite` | Membatalkan undangan | ✅ |
| `getGuildInfo` | Mendapatkan info guild | ✅ |
| `getMyGuild` | Mendapatkan guild player | ✅ |
| `searchGuilds` | Mencari guild | ✅ |
| `disbandGuild` | Membubarkan guild | ✅ |

### 3.2 Client-Side Network Handler

[`client/src/network/GuildHandler.gd`](client/src/network/GuildHandler.gd) telah mengimplementasikan full socket communication layer dengan 25+ metode:

- Socket event handlers untuk semua state changes
- Request methods untuk semua operasi guild
- Signal-based communication dengan UI

### 3.3 Guild UI Components

Beberapa komponen UI telah dibuat:

| Komponen | File | Status |
|----------|------|--------|
| GuildScreen | [`client/src/ui/GuildScreen.gd`](client/src/ui/GuildScreen.gd) | ✅ Basic |
| GuildMemberPanel | [`client/src/ui/GuildMemberPanel.gd`](client/src/ui/GuildMemberPanel.gd) | ✅ |
| GuildFacilitiesPanel | [`client/src/ui/GuildFacilitiesPanel.gd`](client/src/ui/GuildFacilitiesPanel.gd) | ✅ |
| GuildTreasuryPanel | [`client/src/ui/GuildTreasuryPanel.gd`](client/src/ui/GuildTreasuryPanel.gd) | ✅ |

GuildScreen telah memiliki:
- Tampilan nama guild, level, jumlah anggota
- Treasury display (gold dan silver)
- Panel untuk members, facilities, dan treasury
- Overlay setup logic

### 3.4 Socket Events

Sistem socket telah mendefinisikan events untuk:

**Client → Server:**
- `guild:create`
- `guild:join`
- `guild:leave`
- `guild:kick`
- `guild:promote` / `guild:demote`
- `guild:transfer_leadership`
- `guild:update_settings`
- `guild:deposit_treasury` / `guild:withdraw_treasury`
- `guild:build_facility` / `guild:upgrade_facility`
- `guild:create_invite` / `guild:accept_invite` / `guild:cancel_invite`
- `guild:get_info` / `guild:get_my_info`
- `guild:search`
- `guild:disband`

**Server → Client:**
- `guild:created`
- `guild:left`
- `guild:member_kicked` / `guild:member_promoted`
- `guild:treasury_updated`
- `guild:facility_built` / `guild:facility_upgraded`
- `guild:invite_created`
- `guild:info`
- `guild:search_results`
- `guild:disbanded`

---

## 4. Fitur yang Belum Terimplementasi

### 4.1 Sistem Guild Vault (Penyimpanan Bersama)

Meskipun model `GuildVault` dan `GuildVaultItem` telah didefinisikan dalam rencana ([`plans/guild-system-plan.md:251-273`](plans/guild-system-plan.md:251)), keduanya **belum ada di schema.prisma aktual**. Ini merupakan fitur critical untuk shared item storage antar-anggota guild.

**Status**: ❌ Not Implemented

### 4.2 Guild Perk System

Sistem perks telah ada di schema (`GuildPerk` model) tetapi:

- Tidak ada predefined perk templates
- Tidak ada logic untuk aktivasi perks berdasarkan guild level
- Tidak ada integration dengan stat calculation

**Status**: ⚠️ Schema exists, logic incomplete

### 4.3 Guild Quest System

Guild-specific quests yang memberikan reward kolektif belum ada:

- Weekly guild quests
- Shared quest progress
- Guild-wide bonus rewards

**Status**: ❌ Not Implemented

### 4.4 Guild Chat Enhancements

Meskipun basic guild chat tersedia melalui ChatMessage dengan `channelType: "GUILD"`, beberapa fitur masih kosong:

- Chat history persistence yang spesifik untuk guild
- Typing indicators
- Message reactions
- Guild announcement system

**Status**: ⚠️ Basic exists, enhancements needed

### 4.5 Guild Territory UI

Backend untuk territory sudah ada dengan fortification system, tetapi:

- Tidak ada UI untuk melihat territory map
- Tidak ada visualization untuk territory ownership di WorldAtlas
- Tidak ada territory details panel

**Status**: ❌ UI Not Implemented

### 4.6 Guild Siege UI dan Mechanics

Siege service telah memiliki basic structure, tetapi:

- Siege declaration UI tidak ada
- Siege battle interface tidak ada
- Fortification repair mechanics tidak terhubung ke UI
- Siege contribution system (player dapat menyumbangkan gold) belum ada

**Status**: ⚠️ Backend exists, UI incomplete

### 4.7 Guild Level dan Experience System

Guild XP dari aktivitas anggota telah di-track, tetapi:

- Tidak ada guild level progression logic
- Tidak ada perks unlock based on level
- Tidak ada level-based facility unlock

**Status**: ⚠️ Basic tracking, progression incomplete

### 4.8 Guild Tag dan Emblem

 guild tag (short name) dan custom emblem/color tidak dapat diedit oleh players. Hanya `color` field yang sudah ada di schema tapi tidak ada UI untuk mengubahnya.

**Status**: ❌ Not Implemented

### 4.9 Guild Management Lanjutan

Beberapa fitur manajemen yang belum ada:

- Guild description editing UI
- Guild notice board
- Member notes/remarks
- Guild ranking berdasarkan berbagai metrik

**Status**: ❌ Not Implemented

---

## 5. Alur Kerja Sistem (Workflow)

### 5.1 Pembuatan Guild

```
Player (Level Req Met)
        │
        ▼
Buka Guild Screen → Create Guild
        │
        ▼
Pilih GuildTemplate
        │
        ▼
Masukkan Nama & Description
        │
        ▼
Bayar Creation Cost (gold dari GuildTemplate)
        │
        ▼
guild:create (socket event)
        │
        ▼
Server: validateRequirements() → createGuild() → createHistory()
        │
        ▼
Response: guild:created → Update UI
        │
        ▼
Player menjadi MASTER，自动加入
```

### 5.2 Proses Undangan

```
MASTER/OFFICER membuat invite
        │
        ▼
guild:create_invite
        │
        ▼
Server: generateUniqueCode() → GuildInvite.create()
        │
        ▼
Invite code ditampilkan ke inviter
        │
        ▼
Inviter share code ke target player
        │
        ▼
Target player input code di Guild Screen
        │
        ▼
guild:accept_invite { inviteCode }
        │
        ▼
Server: validateCode() → link user to guild
        │
        ▼
Response: guild:invite_accepted
        │
        ▼
Semua anggota dapat melihat new member di MemberPanel
```

### 5.3 Treasury Operations

**Deposit Flow:**

```
Player klik Deposit di TreasuryPanel
        │
        ▼
Input amount
        │
        ▼
guild:deposit_treasury { amount }
        │
        ▼
Server: validateBalance() → updateGuildTreasury() → createHistory()
        │
        ▼
Broadcast: guild:treasury_updated
```

**Withdraw Flow (Officer+):**

```
MASTER/OFFICER klik Withdraw
        │
        ▼
Input amount + reason
        │
        ▼
guild:withdraw_treasury { amount }
        │
        ▼
Server: checkPermission() → validateAmount() → updateGuildTreasury() → createHistory()
        │
        ▼
Broadcast: guild:treasury_updated
```

### 5.4 Siege Declaration (Plan)

```
Guild Master opens Territory Panel
        │
        ▼
Lihat list regions yang tersedia untuk siege
        │
        ▼
Klik "Declare Siege" pada target region
        │
        ▼
Tampilkan siege cost dan requirements
        │
        ▼
Confirm declaration
        │
        ▼
siege:declare { regionId }
        │
        ▼
Server: checkRequirements() → deductCost() → createSiege() → broadcast()
        │
        ▼
Siege countdown dimulai (24 jam preparation)
```

---

## 6. Perbandingan dengan Standar Industri

### 6.1 Game Rujukan

| Game | Genre | Guild Features Utama |
|------|-------|---------------------|
| **Clash of Clans** | Mobile Strategy | Clan Wars, Clan Games, Donations, Clan Capital |
| **Idle Heroes** | Idle RPG | Guild Boss, Guild Shop, Guild Tech |
| **AFK Arena** | Idle RPG | Guild Duel, Guild Tech, Shared Essence |
| **Game of Thrones: Winter is Coming** | MMO Strategy | Alliance Territory, Alliance Events |
| **Lord of the Rings: Heroes of Middle-earth** | RPG | Guild, Trading, Chat |

### 6.2 Perbandingan Fitur

| Fitur | Textical | Clash of Clans | Idle Heroes | AFK Arena |
|-------|----------|----------------|-------------|-----------|
| **Guild Creation** | ✅ | ✅ | ✅ | ✅ |
| **Member Management** | ✅ | ✅ | ✅ | ✅ |
| **Treasury** | ✅ | ✅ | ✅ | ✅ |
| **Facilities** | ✅ (Basic) | ✅ (Clan Capital) | ✅ (Guild Tech) | ✅ (Guild Tech) |
| **Territory/Siege** | ⚠️ (Plan) | ✅ | ❌ | ❌ |
| **Guild Chat** | ⚠️ (Basic) | ✅ | ✅ | ✅ |
| **Guild Quests** | ❌ | ✅ (Clan Games) | ✅ (Daily) | ❌ |
| **Shared Vault** | ❌ | ✅ (Donations) | ❌ | ❌ |
| **Guild vs Guild** | ❌ | ✅ (Clan Wars) | ✅ (Guild Duel) | ✅ (Guild Duel) |
| **Guild Leveling** | ⚠️ (XP tracked) | ✅ | ✅ | ✅ |
| **Rank Permissions** | ✅ | ✅ | ✅ | ✅ |
| **Invite Links** | ✅ | ✅ | ✅ | ✅ |

### 6.3 Analisis Gap

**Kekuatan Textical:**

1. **Fortification System**: Lebih sophisticated dari CoC (Clash of Clans) dengan maintenance cost dan progressive fortification decay.
2. **Dual Currency Treasury**: Memisahkan treasury dari vaultGold menunjukkan planned flexibility.
3. **Faction Integration**: Relasi dengan faction membuka dimensi politik yang tidak dimiliki kompetitor.
4. **Rich Database Schema**: Bahkan fitur yang belum diimplementasikan sudah ada di schema (GuildVault, dll).

**Kelemahan (Perlu Diperbaiki):**

1. **Guild Vault**: Kompetitor (terutama CoC) memiliki sistem donations yang sangat populer. Textical perlu mengimplementasikan ini.
2. **Guild Events/Quests**: Clan Games di CoC adalah events paling engaging. Textical perlu guild-wide quests.
3. **UI/UX**: Tidak ada territory visualization, siege interface, atau guild map.
4. **Communication**: Typing indicators, message reactions, dan guild announcements tidak ada.

### 6.4 Standar yang Belum Terpenuhi

Berdasarkan analisis kompetitor, fitur-fitur standar industri yang harus ada di guild system modern:

| Standar | Status di Textical | Priority |
|---------|-------------------|----------|
| Shared Storage (Vault/Donations) | ❌ Missing | HIGH |
| Guild Events/Weekly Quests | ❌ Missing | HIGH |
| Territory Visualization | ❌ Missing | HIGH |
| Guild Leaderboards | ❌ Missing | MEDIUM |
| Guild Chat Enhancements | ⚠️ Basic | MEDIUM |
| Guild Profile/Stats | ⚠️ Basic | MEDIUM |
| Announcement System | ❌ Missing | LOW |

---

## 7. Rekomendasi Pengembangan

### 7.1 Prioritas Tinggi (Fase 1)

#### 7.1.1 Guild Vault System

**Mengapa Penting:**

- Fitur sosial №1 di game kompetitif
- Menjadi gold sink yang signifikan
- Meningkatkan interaksi antar-anggota

**Rencana Implementasi:**

1. Tambahkan model `GuildVault` dan `GuildVaultItem` ke schema
2. Buat `vaultService.js` dengan operasi:
   - `depositItem(userId, itemInstanceId, quantity)`
   - `withdrawItem(userId, vaultItemId, quantity)`
   - `getVaultItems(guildId)`
3. Buat `VaultHandler.gd` di client
4. Buat `GuildVaultPanel.tscn` dengan grid UI

**Estimasi Effort**: 3-5 hari

#### 7.1.2 Guild Territory Visualization

**Mengapa Penting:**

- Territory adalah core feature dari guild endgame
- Tanpa UI, sistem siege tidak dapat digunakan
- Memberikan goals jangka panjang ke玩家

**Rencana Implementasi:**

1. Enhance [`WorldAtlas.gd`](client/src/ui/WorldAtlas.gd) untuk menampilkan territory ownership
2. Tambahkan color overlay pada region yang dimiliki guild
3. Buat `GuildTerritoryPanel.tscn` dengan:
   - List territories owned
   - Fortification status bars
   - Maintenance cost display
   - "Declare Siege" button untuk guild lain

**Estimasi Effort**: 2-3 hari

#### 7.1.3 Guild Quest System

**Mengapa Penting:**

- Menggerakkan engagement mingguan
- Memberikan incentive untuk bermain bersama
- Sumber revenue (participation rewards)

**Rencana Implementasi:**

1. Buat `GuildQuest` model di schema
2. Setiap minggu, generate quests otomatis:
   - Total damage to monsters
   - Items gathered
   - PvP wins
   - Gold contributed
3. Progress di-track per-anggota, rewards di-claim ke treasury atau personal

**Estimasi Effort**: 4-6 hari

### 7.2 Prioritas Sedang (Fase 2)

#### 7.2.1 Siege UI dan Mechanics

**Mengapa Penting:**

- Core PvP content untuk guild
- Menggunakan infrastruktur territory yang sudah ada

**Rencana Implementasi:**

1. Enhance SiegeService dengan:
   - Siege declaration logic
   - Contribution system
   - Battle result calculation
2. Buat `GuildSiegePanel.tscn`:
   - Siege countdown timer
   - Contribution buttons
   - Battle results display

#### 7.2.2 Guild Chat Enhancements

**Mengapa Penting:**

- Meningkatkan social engagement
- Standard expectation dari pemain modern

**Rencana Implementasi:**

1. Tambahkan typing indicators
2. Message reactions (emoji)
3. Guild announcements (MASTER only)
4. Message history untuk guild channel

#### 7.2.3 Guild Level Progression

**Mengapa Penting:**

- Memberikan sense of progression
- Unlocks new features pada level tertentu

**Rencana Implementasi:**

1. Implement guild level calculation dari accumulated XP
2. Tambah perks unlock table
3. Integration dengan facility unlock

### 7.3 Prioritas Rendah (Fase 3)

#### 7.3.1 Guild Leaderboards

- Guild rankings by: level, territory count, weekly activity
- Individual contribution tracking

#### 7.3.2 Guild Profile Page

- Guild statistics
- Achievement display
- War history

#### 7.3.3 Guild Customization

- Custom guild tag
- Guild banner/emblem editor
- Custom description dengan formatting

---

## 8. Kesimpulan

Sistem guild di Textical telah memiliki fondasi yang sangat solid dengan database schema yang komprehensif dan arsitektur yang well-planned. Perbandingan dengan standar industri menunjukkan bahwa Textical memiliki beberapa keunggulan, khususnya dalam fortification system dan faction integration, namun masih缺少 beberapa fitur kunci seperti Guild Vault, Guild Quests, dan Territory UI.

Dengan implementasi yang tepat pada fase-fase yang direkomendasikan di atas, Textical dapat memiliki sistem guild yang kompetitif dan engaging, setara atau bahkan melebihi standar industri yang ada saat ini.

---

## Lampiran: Checklist Implementasi

### Fase 1: Guild Vault & Territory UI

- [ ] Add GuildVault and GuildVaultItem models to schema
- [ ] Create vaultService.js with deposit/withdraw logic
- [ ] Create VaultHandler.gd in client
- [ ] Create GuildVaultPanel.tscn
- [ ] Enhance WorldAtlas.gd for territory display
- [ ] Create GuildTerritoryPanel.tscn
- [ ] Test vault deposit/withdraw flow
- [ ] Test territory visualization

### Fase 2: Guild Quests & Siege

- [ ] Create GuildQuest models
- [ ] Implement weekly quest generation
- [ ] Create quest tracking system
- [ ] Enhance SiegeService with full mechanics
- [ ] Create GuildSiegePanel.tscn
- [ ] Implement contribution system

### Fase 3: Enhancements

- [ ] Add typing indicators to guild chat
- [ ] Add message reactions
- [ ] Implement guild announcement system
- [ ] Create guild level progression logic
- [ ] Add perk unlock system
- [ ] Create guild leaderboards

---

*Dokumen ini dibuat berdasarkan analisis codebase Textical per 17 Februari 2026.*

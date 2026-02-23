# Game Design Document: Currency System

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-20 | AI Game Designer | Initial GDD creation |

---

## 1. Executive Summary

> **Referensi Item Categorization**: Untuk ringkasan kategori item termasuk CURRENCY, lihat [`ITEM_CATEGORIZATION_GDD.md`](./ITEM_CATEGORIZATION_GDD.md)

This document specifies the comprehensive currency system for Textical. Currently, the system only has basic `silver` and `gold` fields in the User model. This GDD expands it into a full multi-currency economy with wallets, exchange rates, sinks, and acquisition mechanics.

### 1.1 Current State Analysis

| Currency | Location | Current Use |
|----------|----------|-------------|
| Silver | User.silver | Basic trade currency |
| Gold | User.gold | Premium transactions |
| Energy | User.energy | Action points (not currency) |

### 1.2 Design Goals

| Goal | Description |
|------|-------------|
| **Multi-Currency** | Support 5+ different currency types |
| **Wallet System** | Organized currency storage with limits |
| **Exchange System** | Convert between currencies |
| **Economic Balance** | Controlled sinks and acquisition rates |

---

## 2. Currency Types

### 2.1 Currency Tier Classification

| Tier | Type | Description | Tradable | Premium |
|------|------|-------------|----------|---------|
| **TIER_1** | Silver | Basic copper/silver coins | Yes | No |
| **TIER_2** | Gold | Precious metal coins | Yes | No |
| **TIER_3** | Token | Event/faction specific | No | No |
| **TIER_4** | Point | Activity/reputation points | No | No |

### 2.2 Detailed Currency Definitions

#### 2.2.1 Silver (TIER_1)

| Property | Value |
|----------|-------|
| **Display Name** | Silver |
| **Symbol** | **S** |
| **Icon** | silver_coin.png |
| **Color** | **#C0C0C0** (Silver) |
| **Max Stack** | 999,999,999 |
| **Base Value** | 1 |
| **Acquisition** | Monster drops, quests, selling items |
| **Sinks** | Item purchases, repairs, teleportation, crafting |

#### 2.2.2 Gold (TIER_2)

| Property | Value |
|----------|-------|
| **Display Name** | Gold |
| **Symbol** | **G** |
| **Icon** | gold_coin.png |
| **Color** | **#FFD700** (Gold) |
| **Max Stack** | 99,999,999 |
| **Base Value** | 1,000,000 Silver |
| **Exchange Rate** | **1 Gold = 1,000,000 Silver** |
| **Acquisition** | Boss kills, high-value quests, treasure |
| **Sinks** | Premium items, auction house, guild fees |

#### 2.2.3 Guild Token (TIER_3)

| Property | Value |
|----------|-------|
| **Display Name** | Guild Token |
| **Symbol** | 🏛️ |
| **Icon** | guild_token.png |
| **Color** | #4A90D9 |
| **Max Stack** | 10,000 |
| **Acquisition** | Guild donations, guild missions, events |
| **Sinks** | Guild upgrades, guild shop |

#### 2.2.4 Arena Token (TIER_4)

| Property | Value |
|----------|-------|
| **Display Name** | Arena Token |
| **Symbol** | ⚔️ |
| **Icon** | arena_token.png |
| **Color** | #D94A4A |
| **Max Stack** | 5,000 |
| **Acquisition** | Arena matches, PvP battles |
| **Sinks** | Arena rewards, PvP equipment, titles |

#### 2.2.5 Honor Badge (TIER_5)

| Property | Value |
|----------|-------|
| **Display Name** | Honor Badge |
| **Symbol** | 🏅 |
| **Icon** | honor_badge.png |
| **Color** | #D4AF37 |
| **Max Stack** | 999 |
| **Acquisition** | PvP wins, reputation gains |
| **Sinks** | PvP titles, reputation rewards |

#### 2.2.6 Contribution Point (TIER_5)

| Property | Value |
|----------|-------|
| **Display Name** | Contribution |
| **Symbol** | ⭐ |
| **Icon** | contribution_star.png |
| **Color** | #9B59B6 |
| **Max Stack** | 999,999 |
| **Acquisition** | Daily login, crafting, gathering |
| **Sinks** | Monthly rewards, special unlocks |

---

## 3. Wallet System Architecture

### 3.1 Database Schema

The current User model has basic silver/gold. We recommend expanding to:

```prisma
model User {
  // Existing
  id        Int     @id
  silver    Int     @default(0)
  gold      Int     @default(0)
  
  // NEW: Extended currencies
  guildTokens         Int                 @default(0)
  arenaTokens         Int                 @default(0)
  honorBadges         Int                 @default(0)
  contributionPoints  Int                 @default(0)
  
  // Transaction history
  transactions        Transaction[]
}

model AccountBank {
  userId      Int       @unique
  silver      BigInt    @default(0)
  gold        BigInt    @default(0)
  
  // Rule: Auto-converts 1,000,000 Silver -> 1 Gold upon deposit
  updatedAt   DateTime  @updatedAt
}

model CurrencyWallet {
  id          Int       @id @default(autoincrement())
  userId      Int
  currencyType String    // SILVER, GOLD, GUILD_TOKEN, etc.
  balance     BigInt    @default(0)
  lifetimeEarned BigInt @default(0)  // Total earned (for achievements)
  lifetimeSpent BigInt  @default(0)   // Total spent (for achievements)
  
  updatedAt   DateTime  @updatedAt
  
  @@unique([userId, currencyType])
}

model CurrencyTransaction {
  id            Int       @id @default(autoincrement())
  userId        Int
  currencyType  String
  amount        BigInt    // Positive = earned, Negative = spent
  balanceAfter  BigInt
  transactionType String  // EARN, SPEND, EXCHANGE, ADMIN
  source        String    // MONSTER_DROP, QUEST_REWARD, SHOP_PURCHASE, etc.
  referenceId   Int?      // Optional reference (quest_id, monster_id, etc.)
  createdAt     DateTime  @default(now())
  
  @@index([userId, createdAt])
  @@index([currencyType, createdAt])
}

model ExchangeRate {
  id              Int       @id @default(autoincrement())
  fromCurrency    String    // SILVER
  toCurrency      String    // GOLD
  rate            Float     // 1,000,000 SILVER = 1 GOLD

  isActive        Boolean   @default(true)
  updatedAt       DateTime  @updatedAt
  
  @@unique([fromCurrency, toCurrency])
}
```

### 3.2 Currency Acquisition Sources

#### Hybrid Drop System

**Silver Sources**:
| Source | Silver Earned | Rate |
|--------|--------------|------|
| Goblin Kill | Silver | Base: monster_level × 1 |
| Bandit Kill | Silver | Level × 2 |
| Selling Materials | Silver | Material base value |
| Quest Rewards | Silver | Per quest |
| Gathering | Silver | Per gather |

**Gold Sources** (Rare):
| Source | Gold Earned | Rate | Notes |
|--------|-----------|------|-------|
| Humanoid Boss | Gold | 1-5 (very rare) | Sangat rare! |
| High-Level Quest | Gold | 1-10 (once per quest) | Per quest |
| PvP Arena Win | Gold | 1-10 | Per match win |
| Open World PvP | - | - | Tidak ada gold drops |
| Treasure Chest | Gold | 1-100 (rare) | Sangat rare! |

> **Open World PvP Mechanic**: Uang (Silver/Gold) TIDAK jatuh saat pemain dikalahkan. Yang hilang hanya equipment (durability atau chance drop). Ini mencegah harassment dan griefing.

**Material Sources** (Beast/Monster):
| Source | Materials Dropped | Notes |
|--------|------------------|-------|
| Beast (Wolf, Bear) | Leather, Flesh | Basic materials |
| Monster (Slime, Skeleton) | Bone, Essence | Undead/monster |
| Elemental | Crystal, Essence | Magic core |
| Dragon/Mythical | Scale, Core | Very rare |

> **Design Rationale**: Gold adalah mata uang PREMIUM yang sangat berharga. Silver mudah didapat dari humanoid biasa dan menjual material. Gold HANYA bisa didapat dari:
> 1. Boss/quest rare
> 2. PvP arena
> 3. Treasure/loot

### 3.3 Currency Sinks (Expenditure)

| Sink | Currencies Accepted | Cost |
|------|---------------------|------|
| Item Purchase | Silver, Gold | Item base value × multiplier |
| Equipment Repair | Silver | Durability lost × 0.5 |
| **Teleportation** | **Silver** | **Fixed cost per Citadel hop** |
| Crafting Fee | Silver | Material value × 0.1 |
| Auction House Listing | Silver | Listing fee: 5% of value |
| Guild Creation | Gold | 100 Gold |
| Guild Upgrade | Guild Token | Per upgrade level |
| Arena Entry | Arena Token | Per match: 5-20 |
| Inventory Expansion | Silver | Per slot: 100 Silver |

#### Teleportation System (Citadel-Based)

| Route | Cost | Notes |
|-------|------|-------|
| Any Citadel → Citadel | 500 Silver | Flat rate teleport |
| Any Location → Citadel | **Return Scroll** | Gunakan item, bukan silver |

#### Return Scroll Mechanic

| Item | Effect | Acquisition |
|------|--------|-------------|
| **Scroll of Return** | Sekali pakai - teleport ke bind point | Quest reward, Crafting |
| **Citadel Compass** | Unlimited use - bisa ulang berkali | Purchased dari special NPC |

> **Design**: Pemain tidak pakai silver untuk return, tapi pakai item. Ini membuat ekonomi lebih интересной (item demand).

> **Design**: Pemain harus berjalan dari Citadel ke wilderness, tapi bisa teleport antar Citadel dengan biaya tetap.

---

## 4. Exchange System

### 4.1 Exchange Rates (Market-Based)

Currency exchange should have dynamic rates based on market activity:

```javascript
const EXCHANGE_RATES = {
  // Buy (exchange TO this currency)
  GOLD: { silver: 1000000 },
  
  // Sell (exchange FROM this currency)
  SILVER: { gold: 1000000 }, // 1 Gold becomes 1 Million Silver
};
```

### 4.2 Exchange Formula

```
Effective Rate = Base Rate
Example 1: Exchange 1,000,000 Silver to Gold = 1 Gold
Example 2: Exchange 1 Gold to Silver = 1,000,000 Silver
```

---

### 4.3 Exchange Restrictions

| From | To | Allowed | Notes |
|------|-----|---------|-------|
| Silver | Gold | Yes | Via NPC only |
| Gold | Silver | Yes | Via NPC only |
| Token | Any | No | Non-transferable |
| Point | Any | No | Non-transferable |

---

## 6. Economic Balance

### 6.1 Currency Generation Rates

**Silver Generation**:
| Activity | Silver/Hour | Notes |
|----------|-------------|-------|
| Humanoid Grind (Level 1-10) | 3,000/hr | Goblins, bandits |
| Humanoid Grind (Level 11-20) | 10,000/hr | Elite humanoids |
| Humanoid Grind (Level 21-30) | 30,000/hr | Veterans |
| Humanoid Grind (Level 31-40) | 80,000/hr | Captains |
| Humanoid Grind (Level 41-50) | 150,000/hr | Boss humanoids |
| Selling Beast Materials | Varies | Monster hides, essence |
| Quest Rewards | 1,000-50,000 | Per quest |
| Gathering | 500-2,000 | Per gather |

**Gold Generation** (SANGAT RARE):
| Activity | Gold/Hour | Drop Rate | Notes |
|----------|-----------|-----------|-------|
| Humanoid Boss | 1-5 | 5% per boss | Sangat rare! |
| High-Level Quest | 1-10 | Once | Per quest completion |
| PvP Arena Win | 5-20 | 100% | Per match win |
| Open World PvP | 10-50 | 100% | Per player kill |
| Treasure Chest | 1-100 | 1% | Sangat rare! |

> **Peringatan**: Gold JANGAN diberikan dengan mudah. Emas adalah mata uang prestige.

### 6.1.1 Legacy Bank System (The 50 Hero Rule)

Pemain dapat memiliki hingga **50 unit Hero**. 
- **Global Account Balance**: Seluruh mata uang (Silver & Gold) terikat pada **Akun Pemain**, bukan hero secara individual. Hero tidak "membawa" uang di dalam petualangan mereka.
- **Death & Persistence**: Jika seorang Hero mati (Permadeath), pemain **TIDAK kehilangan uang**. Yang hilang hanyalah unit Hero tersebut dan seluruh Perlengkapan (Equipment) yang ia kenakan.
- **Shared Bank**: Citadel Bank berfungsi sebagai brankas penyimpanan global yang dapat diakses oleh semua pahlawan di bawah satu akun.
- **Auto-Conversion Rule**: Saat melakukan deposit ke bank, setiap **1.000.000 Silver** akan otomatis berubah menjadi **1 Gold**. 
  - *Contoh*: Simpan 1.500.000 Silver -> Saldo Bank bertambah 500.000 Silver dan 1 Gold.

### 6.5 Anti-Fraud & Economic Milestone Logging

Sistem akan melakukan audit otomatis pada setiap transaksi yang mencurigakan:
- **Spike Alert**: Jika saldo pemain (Silver) bertambah > 5.000.000 dalam < 10 detik tanpa sumber Quest/IAP.
- **Milestone Log**: Mencatat setiap kali pemain mencapai threshold kekayaan baru (10jt, 50jt, 100jt).
- **Admin Flagging**: Transaksi mencurigakan akan ditandai untuk review manual oleh GM/Admin.

### 6.2 Target Wealth per Level

| Level | Target Silver | Target Gold | Grind Time (Silver) | Cara Dapat Gold |
|-------|--------------|-------------|---------------------|-----------------|
| 1 | 100 | 0 | 2 menit | - |
| 5 | 1,000 | 0 | 20 menit | - |
| 10 | 10,000 | 0 | 3 jam | - |
| 15 | 50,000 | 0 | 8 jam | - |
| 20 | 200,000 | 0 | 20 jam | Quest rare |
| 25 | 500,000 | 0 | 40 jam | - |
| 30 | 2,000,000 | **1** | 130 jam | Quest + PvP |
| 35 | 5,000,000 | **3** | 330 jam | PvP Arena |
| 40 | 15,000,000 | **5** | 500 jam | PvP + Boss |
| 45 | 40,000,000 | **10** | - | PvP + Treasure |
| 50 | 100,000,000 | **25** | - | Endgame |

> **Catatan**: Target gold sangat kecil karena gold SANGAT SULIT didapat. Pemain fokus ke silver dulu, gold untuk prestige items.

### 6.3 Silver → Gold Conversion Time

| Level Range | Silver Grind | Hours to 1 Gold | realistic? |
|-------------|--------------|-----------------|------------|
| 1-10 | 3,000/hr | 333 jam | ❌ Tidak masuk akal |
| 20 | 10,000/hr | 100 jam | ❌ Terlalu lama |
| 30 | 30,000/hr | 33 jam | ❌ Tetap lama |

**Solusi**: Gold tidak seharusnya dikonversi dari silver grind. Pemain harus:
1. **PvP** - Cara utama dapat gold
2. **Quest rare** - Gold reward
3. **Treasure** - Chance dapat gold

### 6.4 Inflation Control

| Mechanism | Purpose |
|-----------|---------|
| Transaction Tax | 5% on marketplace sales |
| Repair Costs | Prevents infinite durability |
| Upgrade Failure | Sinks expensive materials |
| Auction House Fees | 10% listing + 5% sale |
| Crafting Fees | 10% of material value |
| Material Value Cap | Beast materials have max sell price |

---

## 7. Transaction System

### 7.1 Transaction Types

| Type | Description | Balance Change |
|------|-------------|----------------|
| EARN_DROP | Monster/item drop | + |
| EARN_QUEST | Quest completion | + |
| EARN_TRADE | Player trade received | + |
| EARN_CRAFT | Item crafted (selling) | + |
| EARN_EXCHANGE | Currency exchange | +/- |
| EARN_ADMIN | GM/compensation | + |
| SPEND_PURCHASE | Buy from NPC/shop | - |
| SPEND_REPAIR | Repair equipment | - |
| SPEND_CRAFT | Crafting fee | - |
| SPEND_EXCHANGE | Currency exchange | - |
| SPEND_TELEPORT | Travel cost | - |
| SPEND_TAX | Transaction tax | - |

### 7.2 Transaction Logging

All transactions should be logged for:
- Anti-cheat detection
- Economy analytics
- Player dispute resolution
- Achievement tracking

```javascript
// Example transaction log
{
  id: 12345,
  userId: 1001,
  currencyType: "SILVER",
  amount: -500,
  balanceAfter: 9500,
  transactionType: "SPEND",
  source: "EQUIPMENT_REPAIR",
  referenceId: 45678, // equipment instance ID
  createdAt: "2026-02-20T10:30:00Z"
}
```

---

## 8. Implementation Priority

### Phase 1: Foundation (Priority: High)
1. Add currency fields to User model
2. Create wallet system
3. Basic transaction logging
4. NPC shop integration

### Phase 2: Economy Features (Priority: Medium)
1. Exchange rate system
2. Auction house fees
3. Token systems (Guild, Arena)

### Phase 3: Advanced (Priority: Low)
1. Dynamic market rates
2. Achievement tracking (lifetime stats)
3. Currency gift system
4. Refund system

---

## 9. Appendix: Currency ID Reference

| Currency | ID | Symbol | Color |
|----------|-----|--------|-------|
| SILVER | 6001 | **S** | #C0C0C0 |
| GOLD | 6002 | **G** | #FFD700 |
| GUILD_TOKEN | 6003 | 🏛️ | #4A90D9 |
| ARENA_TOKEN | 6004 | ⚔️ | #D94A4A |
| HONOR_BADGE | 6005 | 🏅 | #D4AF37 |
| CONTRIBUTION | 6006 | ⭐ | #9B59B6 |

---

*End of Document*

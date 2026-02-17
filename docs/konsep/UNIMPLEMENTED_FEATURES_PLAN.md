# 📋 Unimplemented Features - Development Roadmap

**Document Version:** 1.0  
**Date:** 2026-02-17  
**Status:** Planning / Ready for Development

---

## Overview

Dokumen ini berisi semua fitur yang **belum terimplementasi** di Textical dan perlu direncanakan pengembangannya. Fitur-fitur diurutkan berdasarkan prioritas dan kategori.

---

## 🎯 Tier 1: Critical (High Impact)

Fitur-fitur ini sangat penting untuk game idle RPG dan punya dampak besar terhadap player retention.

### 1.1 Offline Combat System

**Deskripsi:** Sistem yang memungkinkan hero bertarung secara otomatis saat player sedang offline, menghasilkan XP dan resource.

**Mengapa Penting:**
- Core expectation untuk idle RPG genre
- Player tidak perlu selalu online untuk progress
- Meningkatkan daily engagement

**Status:** ❌ Not Started  
**Priority:** 🔴 HIGH  
**Difficulty:** ⭐⭐⭐⭐⭐ (5/5)

**Detail:**
- Server-side simulation saat player offline
- Max offline time: 8-24 jam
- Resource rewards based on hero power
- Catch-up mechanism untuk player yang lama tidak login

**Referensi:** Game contoh - Idle Heroes, AFK Arena

---

### 1.2 Guild Territory & Siege System

**Deskripsi:** Sistem dimana guild bisa menaklukkan dan memiliki region, dengan siege warfare antar guild.

**Mengapa Penting:**
- Major social engagement driver
- Long-term goal untuk guild
- Creates server-wide events

**Status:** ⚠️ Partial (UI exists, logic incomplete)  
**Priority:** 🔴 HIGH  
**Difficulty:** ⭐⭐⭐⭐ (4/5)

**Detail:**
- Guild bisa klaim territory (region tertentu)
- Territory menghasilkan passive income
- Guild lain bisa menyerang (siege)
- Siege: 5v5 battle between guild members
- Winner takes territory

**Sudah Ada:**
- GuildScreen.tscn
- GuildScreen.gd
- GuildMemberPanel.gd
- GuildFacilitiesPanel.gd
- GuildTreasuryPanel.gd
- Plan: plans/guild-system-plan.md

**Perlu Dibuat:**
- Territory management logic
- Siege battle system
- Territory income calculation

---

### 1.3 Leaderboards

**Deskripsi:** Ranking system untuk player dan guild berdasarkan berbagai metrics.

**Mengapa Penting:**
- Competitive motivation
- Creates meta awareness
- Content untuk streamer/competition

**Status:** ❌ Not Started  
**Priority:** 🔴 HIGH  
**Difficulty:** ⭐⭐ (2/5)

**Types:**
- Individual: Power, Level, PvP Wins
- Guild: Power, Territory Count, Member Count
- Regional: Best player per region

---

### 1.4 Equipment Enhancement System

**Deskripsi:** Sistem untuk meningkatkan power equipment melalui upgrade/enchant.

**Mengapa Penting:**
- Deepens progression loop
- Major gold sink
- Creates equipment goals

**Status:** ⚠️ Basic (quality tiers exist)  
**Priority:** 🔴 HIGH  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- Equipment Upgrade: Level 1-10,成功率
- Equipment Enchant: Add special bonuses
- Enhancement failure = downgrade (tidak destroy)
- Rank/Grade system (SSR, SR, R, N)

---

### 1.5 Daily Quest / Bounty Board

**Deskripsi:** Quest harian yang di-reset setiap hari dengan rewards.

**Mengapa Penting:**
- Retention hook utama
- Daily engagement goal
- Steady resource income

**Status:** ⚠️ Basic (quest system exists)  
**Priority:** 🔴 HIGH  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- 5 daily quests per hari
- Quest types: Kill, Gather, Craft, Trade
- Refresh button (premium option)
- Streak bonus untuk consecutive days

---

## 🎯 Tier 2: High Impact

### 2.1 Arena / Ranked PvP

**Deskripsi:** Competitive PvP dengan matchmaking dan ranking system.

**Status:** ⚠️ UI exists (ArenaScreen.tscn)  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐⭐ (4/5)

**Detail:**
- Auto-matchmaking berdasarkan power
- ELO/Ranking system
- Season rewards
- Arena currency untuk exclusive items

---

### 2.2 World Boss

**Deskripsi:** Boss monster besar yang bisa dilawan oleh seluruh server secara bersamaan.

**Status:** ❌ Not Started  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐⭐ (4/5)

**Detail:**
- Spawn setiap jam/jadwal tertentu
- Seluruh server bisa attack
- Damage ranking = reward tiers
- Unique loot drops

---

### 2.3 Hero Ascension System

**Deskripsi:** Sistem untuk "reset" hero ke level 1 tapi dengan bonus permanent.

**Status:** ❌ Not Started  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- Reset hero ke level 1
- Keep: gear, some stats, transcendence level
- Gain: Ascension bonus (+10% all stats per ascension)
- Max 5 ascensions

---

### 2.4 Auction House

**Deskripsi:** Marketplace terpusat untuk item langka.

**Status:** ❌ Not Started  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- Listing fee
- Buy now / Bid system
- Tax pada setiap transaksi
- Category filters

---

### 2.5 Guild Vault UI

**Deskripsi:** Shared storage untuk guild members.

**Status:** ⚠️ Schema exists (GuildVault, GuildVaultItem)  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐ (2/5)

**Detail:**
- Shared inventory untuk guild
- Role-based permissions
- Deposit/Withdraw logging
- Item suggestions

---

## 🎯 Tier 3: Medium Impact

### 3.1 Global Companion System

**Deskripsi:** Satu companion yang memberikan bonus ke seluruh roster hero.

**Status:** ❌ Not Started  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- 1 companion per player (tidak per hero)
- Combat, Economic, Travel variants
- Leveling + Evolution system
- Visual customization

**Referensi:** [`docs/konsep/GLOBAL_COMPANION_SYSTEM.md`](GLOBAL_COMPANION_SYSTEM.md)

---

### 3.2 Player Trading System

**Deskripsi:** Trading langsung antara dua player.

**Status:** ⚠️ Basic (market exists)  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- Direct trade requests
- Trade window dengan item slots
- Currency exchange
- Trade taxes
- Scam protection

---

### 3.3 Enhanced Mail System

**Deskripsi:** Sistem mail yang lebih lengkap untuk komunikasi dan trading.

**Status:** ⚠️ Basic  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐ (2/5)

**Detail:**
- Attach items/currency to mail
- Mail from NPCs (rewards)
- Mail from system (events)
- Read/Unread status

---

### 3.4 Dynamic Weather System

**Deskripsi:** Cuaca berubah-ubah yang mempengaruhi gameplay.

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐⭐ (3/5)

**Detail:**
- Weather types: Rain, Storm, Clear, Snow
- Affects: Movement speed, Combat stats, Resource yield
- Visual effects di region
- Forecast system

---

### 3.5 Tournament System

**Deskripsi:** Event kompetitif terjadwal dengan bracket.

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐⭐⭐ (4/5)

**Detail:**
- Weekly/Monthly tournaments
- Single elimination brackets
- Prizes: Currency, Exclusive items, Titles

---

## 🎯 Tier 4: Nice to Have

### 4.1 Hidden Quests

**Deskripsi:** Quest rahasia yang ditemukan melalui exploration.

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐ (2/5)

---

### 4.2 Seasonal Events

**Deskripsi:** Event terbatas waktu dengan tema khusus.

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐⭐ (3/5)

---

### 4.3 Chat Emotes/Stickers

**Deskripsi:** Ekspresi visual di chat.

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐ (2/5)

---

### 4.4 Mount System (Alternative to Companion)

**Deskripsi:** Mount untuk mempercepat travel.

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐ (2/5)

**Catatan:** Mungkin tidak cocok karena 50 hero per player. Global Companion lebih tepat.

---

### 4.5 Pet System (Traditional)

**Status:** ❌ Not Started  
**Priority:** 🟢 LOW  
**Difficulty:** ⭐⭐⭐ (3/5)

**Catatan:** **TIDAK DISARANKAN** karena masalah scalability dengan 50 hero. Gunakan Global Companion sebagai alternatif.

---

## 📊 Summary Table

| Feature | Status | Priority | Difficulty | Dependencies |
|---------|--------|----------|------------|--------------|
| Offline Combat | ❌ | 🔴 HIGH | ⭐⭐⭐⭐⭐ | None |
| Guild Territory | ⚠️ | 🔴 HIGH | ⭐⭐⭐⭐ | Guild System |
| Leaderboards | ❌ | 🔴 HIGH | ⭐⭐ | None |
| Equipment Enhancement | ⚠️ | 🔴 HIGH | ⭐⭐⭐ | Equipment System |
| Daily Quests | ⚠️ | 🔴 HIGH | ⭐⭐⭐ | Quest System |
| Arena PvP | ⚠️ | 🟡 MEDIUM | ⭐⭐⭐⭐ | None |
| World Boss | ❌ | 🟡 MEDIUM | ⭐⭐⭐⭐ | None |
| Hero Ascension | ❌ | 🟡 MEDIUM | ⭐⭐⭐ | Progression |
| Auction House | ❌ | 🟡 MEDIUM | ⭐⭐⭐ | Market |
| Guild Vault | ⚠️ | 🟡 MEDIUM | ⭐⭐ | Guild System |
| Global Companion | ❌ | 🟡 MEDIUM | ⭐⭐⭐ | None |
| Player Trading | ⚠️ | 🟡 MEDIUM | ⭐⭐⭐ | None |
| Mail System | ⚠️ | 🟡 MEDIUM | ⭐⭐ | None |
| Dynamic Weather | ❌ | 🟢 LOW | ⭐⭐⭐ | Region System |
| Tournament | ❌ | 🟢 LOW | ⭐⭐⭐⭐ | Arena |
| Hidden Quests | ❌ | 🟢 LOW | ⭐⭐ | Quest System |
| Seasonal Events | ❌ | 🟢 LOW | ⭐⭐⭐ | None |

---

## 🎯 Recommended Development Order

### Short Term (1-2 months)
1. Guild Territory & Siege
2. Leaderboards
3. Daily Quest System
4. Equipment Enhancement

### Medium Term (3-4 months)
5. Global Companion System
6. World Boss
7. Arena PvP Enhancement
8. Auction House

### Long Term (5-6 months)
9. Hero Ascension
10. Tournament System
11. Dynamic Weather
12. Seasonal Events

---

## 📝 Notes

- Semua fitur di atas harus mengikuti arsitektur yang sudah ada (Authoritative Server, 12-Layer Stats, dll)
- Prioritas bisa berubah berdasarkan feedback player
- Beberapa fitur bisa diimplementasi parallel jika tim cukup

---

*Document created for Textical development planning*

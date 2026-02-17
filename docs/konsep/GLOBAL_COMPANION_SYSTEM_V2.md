# Global Companion System - Implementation Guide

**Document Version:** 2.0  
**Date:** 2026-02-17  
**Status:** Ready for Development  
**Priority:** 🟡 MEDIUM  
**Difficulty:** ⭐⭐⭐ (3/5)

---

## Overview

Berbeda dari game RPG tradisional (1 hero = 1 pet), Global Companion di Textical adalah **satu companion yang melayani seluruh roster hero** (hingga 50 hero). Ini mengatasi scalability issue sambil tetap memberikan customization dan progression yang meaningful.

---

## 1. Game Design Specification

### 1.1 Core Concept

**Definition:**  
Global Companion adalah satu entitas yang mengikuti pemain (bukan individual hero) dan memberikan bonus ke **semua hero yang sedang digunakan dalam combat** atau **seluruh roster**.

**Visual Representation:**
- Satu mascot/companion yang selalu terlihat di UI (di wagon, town screen, atau side HUD)
- Companion memiliki visual dan personality yang unik
- Player bisa customisasi appearance companion

### 1.2 Companion Types

#### Combat Companions (Bonus Battle)

| ID | Type | Bonus Combat | Rarity | Base Chance |
|----|------|--------------|--------|-------------|
| C001 | War Wolf | +10% Attack ke semua hero | COMMON | 35% |
| C002 | Iron Bear | +15% Defense | COMMON | 35% |
| C003 | Battle Hawk | +15% Critical Damage | UNCOMMON | 15% |
| C004 | Shadow Cat | +10% Evasion | UNCOMMON | 15% |
| C005 | Arcane Owl | +10% Magic Damage | RARE | 5% |
| C006 | Holy Unicorn | +10% Healing Received | RARE | 5% |
| C007 | Phoenix | +10% Attack + Respawn buff | LEGENDARY | 2% |
| C008 | Dragon Whelp | +5% ke SEMUA STATS | LEGENDARY | 2% |

#### Economic Companions (Bonus Gathering)

| ID | Type | Bonus Resource | Rarity | Base Chance |
|----|------|----------------|--------|-------------|
| E001 | Treasure Mouse | +10% Gold drop | COMMON | 35% |
| E002 | Green Finger | +15% Herb yield | COMMON | 35% |
| E003 | Stone Golem | +20% Mining yield | UNCOMMON | 15% |
| E004 | Wood Spirit | +20% Wood yield | UNCOMMON | 15% |
| E005 | Lucky Rabbit | +5% ALL resource yield | RARE | 5% |
| E006 | Golden Dragon | +15% Gold + +5% resources | LEGENDARY | 2% |

#### Travel Companions (Bonus Movement)

| ID | Type | Bonus Travel | Rarity | Base Chance |
|----|------|-------------|--------|-------------|
| T001 | Swift Horse | -20% Travel time | COMMON | 40% |
| T002 | Sea Turtle | -30% Travel energy cost | UNCOMMON | 25% |
| T003 | Wind Spirit | 50% avoid bandit ambush | UNCOMMON | 25% |
| T004 | Star Griffon | -25% time + -15% energy | RARE | 10% |

#### Hybrid Companions (Multi-category)

| ID | Type | Bonus 1 | Bonus 2 | Rarity |
|----|------|---------|---------|--------|
| H001 | Phantom | +10% Attack | +10% Evasion | LEGENDARY |
| H002 | Ancient Turtle | +10% Defense | -20% Travel cost | LEGENDARY |
| H003 | Celestial Dragon | +5% all stats | +10% Gold | LEGENDARY |

### 1.3 Rarity System

| Rarity | Color Code | Stat Multiplier | Max Level | Evolution | Drop Rate |
|--------|------------|-----------------|-----------|-----------|-----------|
| COMMON | White/Grey | 1.0x | 3 | No | 35% |
| UNCOMMON | Green | 1.2x | 4 | No | 25% |
| RARE | Blue | 1.5x | 5 | Yes | 15% |
| EPIC | Purple | 1.8x | 5 | Yes | 8% |
| LEGENDARY | Orange/Gold | 2.0x | 5 | Yes | 2% |

---

## 2. Progression System

### 2.1 Leveling

```
Level 1 → 2: 1,000 XP
Level 2 → 3: 2,500 XP (Total: 3,500)
Level 3 → 4: 5,000 XP (Total: 8,500)
Level 4 → 5: 10,000 XP (Total: 18,500)

Max Level: 5
```

**XP Sources:**
- Combat participation: +10 XP per battle won
- Combat participation: +3 XP per battle lost
- Gathering resources: +5 XP per action
- Daily login bonus: +50 XP
- Quest completion: +100-500 XP (based on quest tier)

### 2.2 Evolution System

| Stage | Requirement | Stat Multiplier | Visual |
|-------|-------------|------------------|--------|
| Baby | Default (Level 1) | 1.0x | Small sprite, no effects |
| Adult | Level 3 + Evolution Stone | 1.5x | Medium sprite, glow effect |
| Elder | Level 5 + Evolution Stone x3 | 2.0x | Full sprite, particle effects, aura |

**Evolution Stones:**
- Drop dari: World Boss, Raid, Event
- Craftable: 100 fragment + 10000 gold
- Fragment drops: 5% dari elite monster

### 2.3 Stat Bonus Calculation

```
Final Bonus = (Base Bonus) × (Rarity Multiplier) × (Evolution Multiplier)

Example:
- Dragon Whelp (LEGENDARY) = 5% × 2.0 = 10% all stats
- At Elder Evolution = 10% × 2.0 = 20% all stats
```

---

## 3. Acquisition Methods

### 3.1 Daily Login System

| Day | Reward |
|-----|--------|
| Day 1 | 10 Companion Fragments |
| Day 2 | 15 Companion Fragments |
| Day 3 | 20 Companion Fragments |
| Day 4 | 25 Companion Fragments |
| Day 5 | 30 Companion Fragments |
| Day 6 | 40 Companion Fragments |
| Day 7 | 50 Companion Fragments + Random Companion Egg (Common) |
| Day 8+ | Reset to Day 1 |

### 3.2 Gacha / Summon System

**Normal Summon:**
- Cost: 100 Gems / 1000 Gold
- 1 Companion Egg per summon
- Pity: 50 summons = guaranteed RARE or better

**Premium Summon:**
- Cost: 300 Gems
- 1 Companion Egg per summon
- Guaranteed UNCOMMON or better
- Pity: 30 summons = guaranteed LEGENDARY

**Summon Probability:**
```
LEGENDARY: 2%
EPIC: 8%
RARE: 15%
UNCOMMON: 25%
COMMON: 50%
```

### 3.3 Quest Rewards
- Main Story: Guaranteed companion eggs (story progression)
- Side Quest: Random fragments
- Achievement: Type-specific companions

### 3.4 Crafting
```
Recipe: Companion Egg (Random)
- Iron Ore: 100
- Magic Dust: 50
- Gold: 5000
- Time: 1 hour
```

### 3.5 Guild Contribution
Guild bisa unlock **Guild Companion** melalui collective contribution:
- Semua guild member dapat benefit
- Tier berdasarkan guild level
- Tidak menggantikan personal companion

---

## 4. Technical Specification

### 4.1 Database Schema (Prisma)

```prisma
// Companion Template (static data)
model CompanionTemplate {
  id              String   @id // "C001", "E001", etc.
  name            String
  description     String
  category        String   // COMBAT, ECONOMY, TRAVEL, HYBRID
  rarity          String   // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
  baseBonusStat   String?  // attack_damage, defense, evasion, etc.
  baseBonusValue  Float    // e.g., 0.10 for 10%
  secondaryStat   String?
  secondaryValue Float?
  maxLevel        Int      @default(5)
  imagePath       String
  
  companions      GlobalCompanion[]
  companionDrops  CompanionDrop[]
}

// Player's Companion
model GlobalCompanion {
  id              Int       @id @default(autoincrement())
  userId          Int       @unique
  templateId      String
  rarity          String
  level           Int       @default(1)
  experience      Int       @default(0)
  stage           String    @default("BABY") // BABY, ADULT, ELDER
  appearance      String    @default("DEFAULT")
  acquiredAt      DateTime  @default(now())
  
  template        CompanionTemplate @relation(fields: [templateId], references: [id])
  user            User      @relation(fields: [userId], references: [id])
}

// Companion Fragments (currency)
model CompanionFragment {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  fragments   Int      @default(0)
  lastResetAt DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}

// Drop table for fragments
model CompanionDrop {
  id                Int      @id @default(autoincrement())
  monsterTemplateId Int
  companionId       String
  dropChance        Float    // 0.05 = 5%
  fragmentCount     Int      // 1-10
  
  companion         CompanionTemplate @relation(fields: [companionId], references: [id])
}
```

### 4.2 API Endpoints

```javascript
// Get player's companion
GET /api/companion

// Get companion info
GET /api/companion/info

// Summon companion
POST /api/companion/summon
Body: { type: "NORMAL" | "PREMIUM" }

// Upgrade companion level
POST /api/companion/upgrade

// Evolve companion
POST /api/companion/evolve

// Change appearance
POST /api/companion/appearance
Body: { appearanceId: string }

// Get fragments
GET /api/companion/fragments
```

### 4.3 Stat Calculation Integration

Companion bonuses dihitung di **Layer 9 (GUILD)** dari 12-layer stat system:

```javascript
// In server/src/services/statService.js - Layer 9

async function applyCompanionBonuses(stats, userId) {
  const companion = await prisma.globalCompanion.findUnique({
    where: { userId },
    include: { template: true }
  });
  
  if (!companion) return;
  
  // Get multipliers
  const rarityMult = getRarityMultiplier(companion.rarity);
  const evolutionMult = getEvolutionMultiplier(companion.stage);
  const levelMult = 1 + ((companion.level - 1) * 0.1); // +10% per level
  
  const totalMultiplier = rarityMult * evolutionMult * levelMult;
  
  // Apply bonuses based on category
  if (companion.template.category === 'COMBAT') {
    const bonusValue = companion.template.baseBonusValue * totalMultiplier;
    
    stats.attack_damage?.addModifier({
      value: bonusValue,
      type: StatModifierType.PERCENT_ADD,
      source: `Companion:${companion.templateId}`
    });
    
    // Apply secondary stat if exists
    if (companion.template.secondaryStat) {
      stats[companion.template.secondaryStat]?.addModifier({
        value: companion.template.secondaryValue * totalMultiplier,
        type: StatModifierType.PERCENT_ADD,
        source: `Companion:${companion.templateId}`
      });
    }
  }
  
  // Store companion data for combat display
  stats._companionData = {
    name: companion.template.name,
    stage: companion.stage,
    level: companion.level
  };
}
```

### 4.4 Client Integration

```gdscript
# In client/src/autoload/game_state.gd

var global_companion: Dictionary = {}

func _update_companion(data: Dictionary):
  global_companion = data
  companion_updated.emit(data)

# In client/src/ui/components/CompanionDisplay.gd

extends Control

@onready var sprite = $Sprite
@onready var name_label = $NameLabel
@onready var level_label = $LevelLabel
@onready var stage_label = $StageLabel

func _ready():
  GameState.companion_updated.connect(_on_companion_updated)

func _on_companion_updated(data: Dictionary):
  if data.is_empty():
    visible = false
    return
    
  visible = true
  sprite.texture = load("res://assets/companions/" + data.type + ".png")
  name_label.text = data.name
  level_label.text = "Lv." + str(data.level)
  stage_label.text = data.stage
  
  # Show glow for Elder stage
  if data.stage == "ELDER":
    glow_effect.play()
```

---

## 5. UI/UX Specification

### 5.1 Companion Screen Layout

```
┌─────────────────────────────────────────┐
│  🐉 MY COMPANION                        │
├─────────────────────────────────────────┤
│                                         │
│     [Companion Sprite - Large]          │
│                                         │
│     Dragon Whelp                        │
│     Level: 5 / Elder Stage             │
│     XP: 15,000 / 18,500                │
│     [████████████░░░░] 80%             │
│                                         │
├─────────────────────────────────────────┤
│  STAT BONUSES:                          │
│  +10% Attack Damage (Combat)           │
│  +10% Defense (Combat)                 │
│  +20% All Stats (Elder Bonus)          │
├─────────────────────────────────────────┤
│  [UPGRADE]  [EVOLVE]  [SKIN]  [INFO]  │
└─────────────────────────────────────────┘
```

### 5.2 Companion Summon Screen

```
┌─────────────────────────────────────────┐
│  COMPANION SUMMON                       │
├─────────────────────────────────────────┤
│                                         │
│     [Glowing Egg Animation]              │
│                                         │
│  Normal: 1000 Gold | Premium: 300 Gems │
│                                         │
│  [SUMMON x1]  [SUMMON x10]            │
│                                         │
│  Pity: 47/50 (Legendary in 3 summons) │
├─────────────────────────────────────────┤
│  PROBABILITY:                           │
│  LEGENDARY 2%  EPIC 8%  RARE 15%      │
│  UNCOMMON 25%  COMMON 50%              │
└─────────────────────────────────────────┘
```

### 5.3 Companion Display Locations

1. **SideHUD** - Small icon showing current companion
2. **Town Screen** - Companion mascot di corner
3. **Battle Screen** - Companion sprite di battlefield corner
4. **Wagon** - Companion travel dengan player

---

## 6. Economy Balance

### 6.1 Gold Sinks

| Action | Cost | Frequency |
|--------|------|------------|
| Level Up (1→2) | 1,000 gold | Once |
| Level Up (2→3) | 2,500 gold | Once |
| Level Up (3→4) | 5,000 gold | Once |
| Level Up (4→5) | 10,000 gold | Once |
| Evolution (Adult) | 25,000 gold + 5 Evolution Stones | Once |
| Evolution (Elder) | 50,000 gold + 10 Evolution Stones | Once |
| Appearance Change | 5,000 gold | Unlimited |

### 6.2 Rewards Balance

| Source | Fragments | Probability |
|--------|-----------|-------------|
| Elite Monster | 5-10 | 5% |
| Boss Monster | 20-30 | 10% |
| Daily Quest | 10-20 | 100% |
| Daily Login | 10-50 | 100% |
| Gacha Summon | N/A (gives egg) | - |

---

## 7. Implementation Phases

### Phase 1: MVP (2-3 minggu)

- [ ] Database schema
- [ ] Companion templates (16 basic companions)
- [ ] Basic summon system
- [ ] Leveling system
- [ ] Basic UI display
- [ ] Stat bonus integration

### Phase 2: Enhancement (1-2 minggu)

- [ ] Evolution system
- [ ] Visual customization
- [ ] More companion types
- [ ] Enhanced UI animations

### Phase 3: Polish (1 minggu)

- [ ] Guild companions
- [ ] Special events
- [ ] Achievement integration
- [ ] Sound effects

---

## 8. Dependencies

- None (can be developed independently)
- Optional integration: Guild System (for guild companions)
- Optional integration: Wagon System (for companion travel visualization)

---

## 9. Testing Checklist

- [ ] Summon probability matches design
- [ ] Level up costs apply correctly
- [ ] Evolution requires correct materials
- [ ] Stat bonuses apply to all combat heroes
- [ ] UI displays correct information
- [ ] Fragments accumulate correctly
- [ ] Pity system works correctly

---

## 10. Summary

Global Companion System adalah solusi yang tepat untuk Textical karena:

1. **Scalable**: Hanya 1 companion per player, tidak peduli punya 5 atau 50 hero
2. **Manageable**: UI simple, satu set progression
3. **Meaningful**: Setiap decision (pilih companion type) impact besar
4. **Balanceable**: Satu companion = mudah di-tune
5. **Engaging**: companion menjadi "mascot" player, membangun attachment emosional

**Conclusion:**
Ini lebih sesuai dengan scale game idle RPG dibanding traditional 1:1 pet system.

---

*Document ready for development team*

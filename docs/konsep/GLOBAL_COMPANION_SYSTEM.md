# Global Companion System - Design Document

## Overview

Berbeda dari game RPG tradisional (1 hero = 1 pet), Global Companion di Textical adalah **satu companion yang melayani seluruh roster hero** (hingga 50 hero). Ini mengatasi scalability issue sambil tetap memberikan customization dan progression yang meaningful.

---

## Core Concept

### Definition
Global Companion adalah satu entitas yang mengikuti pemain (bukan individual hero) dan memberikan bonus ke **semua hero yang sedang digunakan dalam combat** atau **seluruh roster**.

### Visual Representation
- Satu mascot/companion yang selalu terlihat di UI (misalnya di wagon, di town screen, atau di side HUD)
- Companion memiliki visual dan personality yang unik
- Player bisa customisasi appearance companion

---

## Companion Types

### 1. Combat Companions
Memberikan bonus combat ke active party:

| Type | Bonus | Rarity |
|------|-------|--------|
| **War Wolf** | +10% Attack ke semua hero | COMMON |
| **Battle Hawk** | +15% Critical Damage | UNCOMMON |
| **Shadow Cat** | +10% Evasion | RARE |
| **Arcane Owl** | +10% Magic Damage | RARE |
| **Holy Unicorn** | +10% Healing Received | EPIC |
| **Dragon Whelp** | +5% ke semua stats | LEGENDARY |

### 2. Economic Companions
Memberikan bonus gathering/crafting:

| Type | Bonus | Rarity |
|------|-------|--------|
| **Treasure Mouse** | +10% Gold drop | COMMON |
| **Green Finger** | +15% Herb yield | COMMON |
| **Stone Golem** | +20% Mining yield | UNCOMMON |
| **Wood Spirit** | +20% Wood yield | UNCOMMON |
| **Lucky Rabbit** | +5% all resource yield | RARE |

### 3. Travel Companions
Memberikan bonus movement/travel:

| Type | Bonus | Rarity |
|------|-------|--------|
| **Swift Horse** | -20% Travel time | COMMON |
| **Sea Turtle** | -30% Travel energy cost | UNCOMMON |
| **Wind Spirit** | Chance menghindari bandit ambush | RARE |

### 4. Hybrid Companions
Kombinasi dua tipe:

| Type | Bonus | Rarity |
|------|-------|--------|
| **Phoenix** | +10% Attack + Respawn buff | LEGENDARY |
| **Phantom** | +10% Attack + +10% Evasion | LEGENDARY |
| **Ancient Turtle** | +10% Defense + -20% Travel cost | LEGENDARY |

---

## Acquisition Methods

### 1. Daily Login Reward
- Setiap hari login mendapat fragment companion
- 7 hari连续 gives random companion egg

### 2. Quest Rewards
- Main story quests give companion eggs
- Regional side quests give type-specific fragments

### 3. Crafting
- Bahan khusus untuk craft companion eggs
- Recipe ditemukan dari exploration

### 4. Gacha/Treasure
- Premium summon untuk rare companions
- pity system (100 pulls = guaranteed legendary)

### 5. Guild Contribution
- Contribute ke guild untuk unlock guild companion
- Benefit ke semua guild members

---

## Progression System

### Leveling
```
Level 1 → 2: 1000 XP
Level 2 → 3: 2500 XP
Level 3 → 4: 5000 XP
Level 4 → 5: 10000 XP
Max Level: 5
```

XP Sources:
- Combat participation: +10 XP per battle
- Gathering: +5 XP per resource
- Daily login: +50 XP
- Quest completion: +100 XP

### Evolution
Setiap companion bisa evolve di level max:

| Stage | Requirement | Bonus Multiplier |
|-------|-------------|------------------|
| Baby | Default | 1.0x |
| Adult | Level 3 | 1.5x |
| Elder | Level 5 + Evolution item | 2.0x |

---

## Technical Implementation

### Database Schema (Prisma)

```prisma
model GlobalCompanion {
  id              Int       @id @default(autoincrement())
  userId          Int       @unique
  companionType   String    // WOLF, HAWK, OWL, etc.
  rarity          String    // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
  level           Int       @default(1)
  stage           String    @default("BABY") // BABY, ADULT, ELDER
  experience      Int       @default(0)
  appearance      String    @default("DEFAULT") // Visual variant
  acquiredAt      DateTime  @default(now())
  
  user            User      @relation(fields: [userId], references: [id])
}
```

### Stat Calculation Integration

Companion bonuses dihitung di **Layer 9 (GUILD)** dari 12-layer stat system:

```javascript
// In StatService - Layer 9: COMPANION
async function applyCompanionBonuses(stats, userId) {
  const companion = await db.globalCompanion.findUnique({ where: { userId } });
  
  if (!companion) return;
  
  const multiplier = getStageMultiplier(companion.stage); // 1.0, 1.5, 2.0
  const companionData = COMPANION_STATS[companion.companionType];
  
  // Apply bonuses based on companion type
  switch (companionData.category) {
    case 'COMBAT':
      stats.attack_damage.addModifier({
        value: companionData.attackBonus * multiplier,
        type: StatModifierType.PERCENT_ADD,
        source: `Companion:${companion.companionType}`
      });
      break;
      
    case 'ECONOMIC':
      // Applied in gathering service
      break;
      
    case 'TRAVEL':
      // Applied in travel service
      break;
  }
}
```

### UI Integration

```gdscript
# Global Companion Display
# In SideHUD or Town Screen

func _update_companion_display():
  var companion = GameState.global_companion
  if companion != null:
    companion_sprite.texture = load("res://assets/companions/" + companion.type + ".png")
    companion_level.text = "Lv." + str(companion.level)
    companion_name.text = COMPANION_NAMES[companion.type]
    
    # Show evolution stage
    if companion.stage == "ELDER":
      glow_effect.visible = true
```

---

## Combat Interaction

### How It Works

1. **Party Selection**: Player memilih 5 hero untuk combat
2. **Companion Attachment**: Global companion " JOIN" party secara otomatis
3. **Bonus Application**: Companion bonuses ditambahkan ke stats heroes di combat
4. **Visual Feedback**: Companion muncul di battlefield (small sprite di corner)

### Combat Example

```
Player: 5 Heroes selected
Global Companion: Dragon Whelp (Legendary, Elder)
Bonus Applied:
  - +5% ALL STATS × 2.0 (Elder) = +10% all stats
  
Hero 1 (Warrior): ATK 100 → 110
Hero 2 (Mage): MATK 120 → 132  
Hero 3 (Healer): HEAL 80 → 88
... (applied to all 5 heroes)
```

---

## Economy Balance

### Cost Considerations

| Aspect | Balance |
|--------|---------|
| **Fragment Drop Rate** | 5% dari monster kills |
| **Crafting Cost** | ~5000 gold per egg |
| **Evolution Cost** | ~50000 gold + rare materials |
| **Pity System** | 100 pulls = 1 legendary |

### Gold Sink

Global Companion progression menjadi **major gold sink**:
- Leveling costs gold
- Evolution costs gold + materials
- Appearance customization costs gold

---

## Feature Comparison

| Feature | Traditional Pet | Global Companion |
|---------|----------------|------------------|
| Max per player | 50+ | 1 |
| Management complexity | High | Low |
| UI clutter | Heavy | Minimal |
| Progression depth | Per-pet | Single focused |
| Balance difficulty | Hard | Moderate |
| Player attachment | Individual | Team-based |

---

## Implementation Priority

1. **Phase 1**: Combat companions only (MVP)
2. **Phase 2**: Economic companions
3. **Phase 3**: Travel companions + Evolution
4. **Phase 4**: Guild companions
5. **Phase 5**: Appearance customization

---

## Summary

Global Companion System adalah solusi yang tepat untuk Textical karena:

1. **Scalable**: Hanya 1 companion per player, tidak peduli punya 5 atau 50 hero
2. **Manageable**: UI simple, satu set progression
3. **Meaningful**: Setiap decision (pilih companion type) impact besar
4. **Balanceable**: Satu companion = mudah di-tune
5. **Engaging**: companion menjadi "mascot" player, membangun attachment emosional

Ini lebih sesuai dengan scale game idle RPG dibanding traditional 1:1 pet system.

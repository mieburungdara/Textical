# Accessories Data Reference - REVISED EDITION

> **Note**: Accessories use a **relational database design** with proper IDs, foreign keys, and enums. No arrays or JSON fields.

---

## 1. Accessory Database Schema Design

### Entity Relationship Overview

```
AccessoryRarity (1) ----< (N) AccessoryTemplate
AccessoryTier (1) ----< (N) AccessoryTemplate
AccessoryType (1) ----< (N) AccessoryTemplate (1) ----< (N) AccessoryTrait
AccessoryTemplate (1) ----< (N) AccessoryUniquePassive
```

### Prisma Schema (Relational, No JSON/Arrays)

```prisma
// ============================================
// ENUMS
// ============================================

enum AccessoryRarity {
  COMMON
  UNCOMMON
  REFINED
  SUPERIOR
  RARE
  HEROIC
  EPIC
  RELIC
  ANCIENT
  MYTHIC
}

enum AccessoryTierLevel {
  TIER_1
  TIER_2
  TIER_3
  TIER_4
  TIER_5
  TIER_6
  TIER_7
  TIER_8
  TIER_9
  TIER_10
}

enum AccessoryCategory {
  RING
  NECKLACE
  BELT
}

enum AccessorySlot {
  RING_1
  RING_2
  NECKLACE
  BELT
}

// ============================================
// ACCESSORY TAG ENUM
// ============================================

enum AccessoryTag {
  // Stat Focus Tags
  CRITICAL_FOCUS     // Critical rate/damage boost
  ATTACK_FOCUS       // Physical attack boost
  MAGIC_FOCUS        // Magic attack boost
  DEFENSE_FOCUS      // Physical defense boost
  WARD_FOCUS         // Magic defense boost
  SUSTAIN_FOCUS      // HP/MP regen, healing
  
  // Combat Role Tags
  DPS                // Damage dealer optimization
  TANK               // Tank/mitigation optimization
  SUPPORT            // Healer/buffer optimization
  HYBRID             // Balanced mix
  
  // Utility Tags
  PvP_FOCUS          // PvP-specific bonuses
  PvE_FOCUS          // PvE/dungeon optimization
  BOSS_KILLER        // Boss fight specialization
  MOB_CLEAR          // AoE/mob clearing
  
  // Elemental Tags
  FIRE_FOCUS         // Fire damage/resistance
  ICE_FOCUS          // Ice damage/resistance
  LIGHTNING_FOCUS    // Lightning damage/resistance
  DARK_FOCUS         // Dark damage/resistance
  DIVINE_FOCUS       // Holy/divine damage
  VOID_FOCUS         // Void/entropy damage
}
```

---

## 2. Accessory Type ID Reference

| Type ID | Name | Display Name | Slot | Primary Role | Secondary Role |
|---------|------|--------------|------|--------------|----------------|
| 1 | RING_BAND | Ring of Band | RING | Attack | Critical |
| 2 | RING_POWER | Ring of Power | RING | Attack Focus | Critical |
| 3 | RING_WISDOM | Ring of Wisdom | RING | Magic Focus | MP |
| 4 | RING_GUARDIAN | Ring of Guardian | RING | Defense | HP |
| 5 | RING_SWIFTNESS | Ring of Swiftness | RING | Agility | Attack Speed |
| 6 | RING_ELEMENTAL | Elemental Ring | RING | Elemental Damage | Resistance |
| 7 | RING_BLOOD | Blood Ring | RING | Lifesteal | Attack |
| 8 | RING_SOUL | Soul Ring | RING | Mana Steal | Magic |
| 9 | RING_FATE | Ring of Fate | RING | Critical | Dodge |
| 10 | RING_VOID | Void Ring | RING | Void Damage | Critical |
| 11 | AMULET_BASIC | Amulet | NECKLACE | HP | Defense |
| 12 | AMULET_PROTECTION | Amulet of Protection | NECKLACE | Ward | HP |
| 13 | AMULET_POWER | Amulet of Power | NECKLACE | Attack | Critical |
| 14 | AMULET_WISDOM | Amulet of Wisdom | NECKLACE | Magic | Mana |
| 15 | AMULET_REGEN | Amulet of Regen | NECKLACE | HP Regen | MP Regen |
| 16 | AMULET_ELEMENT | Elemental Amulet | NECKLACE | Elemental | Resistance |
| 17 | AMULET_DIVINE | Divine Amulet | NECKLACE | Divine | Ward |
| 18 | AMULET_VOID | Void Amulet | NECKLACE | Void | Lifesteal |
| 19 | AMULET_FATE | Amulet of Fate | NECKLACE | All Stats | Critical |
| 20 | BELT_STRENGTH | Belt of Strength | BELT | HP | Defense |
| 21 | BELT_AGILITY | Belt of Agility | BELT | Dodge | Attack Speed |
| 22 | BELT_WARDING | Warding Belt | BELT | Status Resist | Ward |
| 23 | BELT_ENDURANCE | Belt of Endurance | BELT | HP | Defense |
| 24 | BELT_ELEMENTAL | Elemental Belt | BELT | Resistance | HP |

---

## 3. UNIQUE IDENTITY MATRIX

### Ring Accessories - Distinct Identity

| Ring Type | Primary Stat | Secondary Stat | Unique Mechanic | Special Role |
|-----------|-------------|----------------|-----------------|--------------|
| **Band Ring** | ATK | Critical | Basic attack boost | Entry-level DPS |
| **Power Ring** | ATK | Critical Rate | High attack focus | Burst DPS |
| **Wisdom Ring** | MATK | MP | Magic focus | Caster support |
| **Guardian Ring** | DEF | HP | Defense boost | Tank utility |
| **Swiftness Ring** | AGI | Attack Speed | Speed focus | Assassin build |
| **Elemental Ring** | Elemental Dmg | Resistance | Dual elemental | Hybrid mage |
| **Blood Ring** | Lifesteal | ATK | Health steal | Sustain DPS |
| **Soul Ring** | Mana Steal | MATK | Mana steal | Caster sustain |
| **Fate Ring** | Crit Rate | Dodge | Lucky focus | Crit build |
| **Void Ring** | Void Dmg | Crit Damage | Void specialist | Dark mage |

### Necklace Accessories - Distinct Identity

| Necklace Type | Primary Stat | Secondary Stat | Unique Mechanic | Special Role |
|---------------|-------------|----------------|-----------------|--------------|
| **Basic Amulet** | HP | DEF | Balanced stats | Entry-level |
| **Protection Amulet** | MDEF | HP | Magic defense | Battle mage |
| **Power Amulet** | ATK | Crit | Attack focus | DPS necklace |
| **Wisdom Amulet** | MATK | MP | Magic focus | Caster necklace |
| **Regen Amulet** | HP Regen | MP Regen | Sustain focus | Support/healer |
| **Elemental Amulet** | Elemental | Resistance | Elemental boost | Elementalist |
| **Divine Amulet** | Holy Dmg | MDEF | Divine specialist | Paladin |
| **Void Amulet** | Void Dmg | Lifesteal | Void specialist | Dark knight |
| **Fate Amulet** | All Stats | Crit Rate | All-rounder | Balanced build |

### Belt Accessories - Distinct Identity

| Belt Type | Primary Stat | Secondary Stat | Unique Mechanic | Special Role |
|-----------|-------------|----------------|-----------------|--------------|
| **Strength Belt** | HP | DEF | Physical tank | Warrior belt |
| **Agility Belt** | Dodge | Atk Speed | Evasion focus | Rogue belt |
| **Warding Belt** | Status Resist | MDEF | CC immunity | Support belt |
| **Endurance Belt** | HP Max | DEF | HP focus | Survival belt |
| **Elemental Belt** | Resistance | HP | Elemental tank | Hybrid belt |

---

## 4. Accessory Tag Mapping

> **CRITICAL**: Each accessory type now has EXCLUSIVE tags to prevent overlap.

| Accessory Type | Tag 1 | Tag 2 | Rationale (Distinct Identity) |
|----------------|-------|-------|-------------------------------|
| **Band Ring** | ATTACK_FOCUS | CRITICAL_FOCUS | Basic DPS ring |
| **Power Ring** | DPS | CRITICAL_FOCUS | Burst damage dealer |
| **Wisdom Ring** | MAGIC_FOCUS | SUPPORT | Caster support |
| **Guardian Ring** | TANK | DEFENSE_FOCUS | Defense specialist |
| **Swiftness Ring** | DPS | HYBRID | Speed-based DPS |
| **Elemental Ring** | FIRE_FOCUS | ICE_FOCUS | Elemental damage |
| **Blood Ring** | DPS | SUSTAIN_FOCUS | Lifesteal sustain |
| **Soul Ring** | MAGIC_FOCUS | SUSTAIN_FOCUS | Mana sustain |
| **Fate Ring** | CRITICAL_FOCUS | HYBRID | Lucky crit build |
| **Void Ring** | VOID_FOCUS | DARK_FOCUS | Void specialist |
| **Basic Amulet** | TANK | DEFENSE_FOCUS | Balanced defense |
| **Protection Amulet** | WARD_FOCUS | TANK | Magic tank |
| **Power Amulet** | ATTACK_FOCUS | DPS | Attack necklace |
| **Wisdom Amulet** | MAGIC_FOCUS | SUPPORT | Caster necklace |
| **Regen Amulet** | SUSTAIN_FOCUS | SUPPORT | Healer support |
| **Elemental Amulet** | FIRE_FOCUS | ICE_FOCUS | Elementalist |
| **Divine Amulet** | DIVINE_FOCUS | WARD_FOCUS | Divine caster |
| **Void Amulet** | VOID_FOCUS | DARK_FOCUS | Void caster |
| **Fate Amulet** | HYBRID | CRITICAL_FOCUS | Balanced build |
| **Strength Belt** | TANK | DEFENSE_FOCUS | Warrior belt |
| **Agility Belt** | HYBRID | DPS | Rogue belt |
| **Warding Belt** | SUPPORT | WARD_FOCUS | Support belt |
| **Endurance Belt** | TANK | SUSTAIN_FOCUS | Survival belt |
| **Elemental Belt** | FIRE_FOCUS | ICE_FOCUS | Elemental tank |

---

## 5. Accessory Special Traits

> **REVISED**: Each legendary+ accessory now has thematic traits based on accessory identity, not random assignment.

### Trait Distribution by Accessory Identity

| Accessory Type | Common Traits | Legendary Traits |
|----------------|---------------|------------------|
| **Ring (Attack)** | SHARP_EDGE, ACCURACY | DRAGON_SLAYER, VOID_TOUCH |
| **Ring (Magic)** | MANA_FLOW, FOCUS | ELEMENTAL_MASTERY, PHANTOM_STRIKE |
| **Ring (Defense)** | IRON_WILL, FORTITUDE | DIVINE_BLESSING, GIANT_SLAYER |
| **Ring (Elemental)** | ELEMENTAL_FOCUS, RESISTANCE | ELEMENTAL_MASTERY, VOID_TOUCH |
| **Necklace (Attack)** | SHARP_EDGE, ACCURACY | DRAGON_SLAYER, BEAST_SLAYER |
| **Necklace (Magic)** | MANA_FLOW, FOCUS | ELEMENTAL_MASTERY, DIVINE_BLESSING |
| **Necklace (Defense)** | IRON_WILL, FORTITUDE | DIVINE_BLESSING, VOID_TOUCH |
| **Necklace (Regen)** | REGENERATION, VITALITY | DIVINE_BLESSING, TEMPEST_CALL |
| **Belt (Strength)** | IRON_WILL, ENDURANCE | GIANT_SLAYER, BEAST_SLAYER |
| **Belt (Agility)** | SWIFTNESS, AGILITY | PHANTOM_STRIKE, TEMPEST_CALL |
| **Belt (Warding)** | FORTITUDE, RESISTANCE | DIVINE_BLESSING, ELEMENTAL_MASTERY |

---

## 6. Accessory Unique Passives (REVISED)

Each accessory type has **2 unique passive abilities** that define its playstyle. These are INHERENT to the accessory type and scale with rarity.

### Ring Unique Passives

| Ring Type | Unique Passive 1 | Unique Passive 2 |
|----------|-----------------|-------------------|
| **Band Ring** | Precision: +5% Critical Rate | Strength: +8% Attack |
| **Power Ring** | Berserker's Fury: +15% Critical Damage when above 50% HP | Bloodlust: +10% Lifesteal |
| **Wisdom Ring** | Arcane Flow: +12% Mana Regeneration | Focus: +8% Magic Critical Rate |
| **Guardian Ring** | Iron Defense: +12% Defense when below 30% HP | Bulwark: +15% Block Chance |
| **Swiftness Ring** | Wind Walker: +10% Attack Speed | Fleet Footed: +8% Movement Speed |
| **Elemental Ring** | Elemental Mastery: +20% Elemental Damage | Elemental Shield: +15% Resistance |
| **Blood Ring** | Vampiric Touch: +8% Lifesteal | Blood Thirst: +20% Damage when above 70% HP |
| **Soul Ring** | Soul Drain: +6% Mana Steal | Arcane Siphon: +15% Skill Damage |
| **Fate Ring** | Lucky Star: +5% All Stats | Fortune: +10% Critical Rate |
| **Void Ring** | Void Consumption: +25% Void Damage | Entropy: +10% Damage vs Full HP |

### Necklace Unique Passives

| Necklace Type | Unique Passive 1 | Unique Passive 2 |
|---------------|-----------------|-------------------|
| **Basic Amulet** | Vitality: +10% Max HP | Protection: +8% Defense |
| **Protection Amulet** | Arcane Ward: +20% Magic Defense | Shield Bearer: +15% Shield Effectiveness |
| **Power Amulet** | Crushing Blow: +12% Critical Damage | Execution: +20% Damage vs Low HP |
| **Wisdom Amulet** | Mana Mastery: +25% Max Mana | Arcane Wisdom: +15% Magic Damage |
| **Regen Amulet** | Regeneration: +3 HP/tick | Rejuvenation: +2 MP/tick |
| **Elemental Amulet** | Elemental Affinity: +30% Elemental Damage | Elemental Resistance: +20% All Resistance |
| **Divine Amulet** | Holy Light: +25% Divine Damage | Divine Protection: +25% MDEF |
| **Void Amulet** | Void Touch: +25% Void Damage | Soul Harvester: +10% Lifesteal |
| **Fate Amulet** | Destiny: +5% All Stats | Fortune: +8% Critical Rate |

### Belt Unique Passives

| Belt Type | Unique Passive 1 | Unique Passive 2 |
|-----------|-----------------|-------------------|
| **Strength Belt** | Titan's Might: +15% Max HP | Unbreakable: +10% Defense |
| **Agility Belt** | Shadow Walker: +12% Dodge | Lightning Reflexes: +15% Evasion |
| **Warding Belt** | Status Immunity: +25% Status Resistance | Stone Skin: +15% Damage Reduction |
| **Endurance Belt** | Iron Stamina: +20% Max HP | Fortitude: +12% Defense |
| **Elemental Belt** | Elemental Barrier: +20% Resistance | Adaptive Defense: +10% DEF + MDEF |

---

## 7. Accessory Tables by Category (TIER 1-10)

### Rings - Distinct Identity Focus

#### Attack Rings - Critical/DPS Focus

| Name | Tier | Level | ATK | Critical | Crafting Materials | Special Trait |
|------|------|-------|-----|----------|--------------------|---------------|
| Copper Ring | 1 | 1 | 3 | 1 | 2 Copper Bar | - |
| Iron Ring | 1 | 10 | 8 | 2 | 5 Iron Bar | - |
| Steel Ring | 2 | 20 | 18 | 4 | 8 Steel Bar | - |
| Mithril Ring | 3 | 35 | 35 | 7 | 5 Mithril Bar | - |
| Adamantite Ring | 4 | 50 | 60 | 12 | 5 Adamantite Bar | - |
| Dragon Ring | 5 | 65 | 100 | 18 | 8 Adamantite Bar + 2 Ether-Bar | DRAGON_SLAYER |
| Void Ring | 6 | 80 | 180 | 25 | 12 Ether-Bar + 5 Void Essence | VOID_TOUCH |
| Chaos Ring | 7 | 85 | 260 | 32 | 15 Ether-Bar + 8 Void Essence + 10 Dark Essence | VOID_TOUCH |
| Omega Ring | 8 | 90 | 360 | 42 | 20 Ether-Bar + 10 Dark Essence + 12 Divine Essence | PHANTOM_STRIKE |
| Divine Ring | 9 | 95 | 480 | 55 | 25 Ether-Bar + 12 Divine Essence + 15 Void Essence | DIVINE_BLESSING |
| Primordial Ring | 10 | 99 | 650 | 70 | 30 Ether-Bar + 15 Divine Essence + 20 Void Essence | PHANTOM_STRIKE |

#### Magic Rings - Mana/Focus Rings

| Name | Tier | Level | MATK | MP | Crafting Materials | Special Trait |
|------|------|-------|------|----|--------------------|---------------|
| Quartz Ring | 1 | 5 | 5 | 15 | 3 Quartz Crystal | - |
| Mana Ring | 2 | 18 | 12 | 35 | 6 Quartz Crystal + 3 Steel Bar | - |
| Arcane Ring | 3 | 35 | 25 | 60 | 8 Arcane Essence + 5 Mithril Bar | - |
| Ethereal Ring | 4 | 52 | 45 | 100 | 8 Arcane Essence + 5 Adamantite Bar | ELEMENTAL_MASTERY |
| Celestial Ring | 5 | 68 | 75 | 150 | 10 Arcane Essence + 3 Ether-Bar | ELEMENTAL_MASTERY |
| Mystic Ring | 6 | 82 | 120 | 220 | 15 Arcane Essence + 8 Ether-Bar | ELEMENTAL_MASTERY |
| Void Sage Ring | 7 | 87 | 180 | 320 | 18 Arcane Essence + 12 Void Essence + 10 Dark Essence | VOID_TOUCH |
| Arcane Master Ring | 8 | 92 | 250 | 420 | 22 Arcane Essence + 15 Divine Essence + 14 Void Essence | ELEMENTAL_MASTERY |
| Omega Arcane Ring | 9 | 96 | 350 | 550 | 28 Arcane Essence + 18 Divine Essence + 18 Void Essence | ELEMENTAL_MASTERY |
| Primordial Ring | 10 | 99 | 480 | 750 | 35 Arcane Essence + 22 Divine Essence + 25 Void Essence | PHANTOM_STRIKE |

#### Defense Rings - Tank Focus

| Name | Tier | Level | DEF | HP | Crafting Materials | Special Trait |
|------|------|-------|-----|----|--------------------|---------------|
| Bronze Ring | 1 | 8 | 5 | 30 | 4 Bronze Bar | - |
| Iron Guard Ring | 2 | 20 | 12 | 60 | 8 Iron Bar + 4 Steel Bar | - |
| Steel Guard Ring | 3 | 38 | 22 | 100 | 10 Steel Bar + 6 Ironwood | - |
| Mithril Guard Ring | 4 | 55 | 38 | 160 | 8 Mithril Bar + 5 Spirit Wood | - |
| Adamantite Guard Ring | 5 | 70 | 60 | 250 | 8 Adamantite Bar + 3 Ether-Bar | DIVINE_BLESSING |
| Guardian Ring | 6 | 85 | 95 | 380 | 12 Ether-Bar + 8 Divine Essence | DIVINE_BLESSING |
| Divine Ring | 7 | 90 | 140 | 520 | 15 Ether-Bar + 12 Divine Essence + 10 Holy Essence | DIVINE_BLESSING |
| Omega Guard Ring | 8 | 94 | 200 | 700 | 20 Ether-Bar + 15 Divine Essence + 15 Void Essence | DIVINE_BLESSING |
| Titan Ring | 9 | 97 | 280 | 950 | 25 Ether-Bar + 20 Divine Essence + 20 Holy Essence | GIANT_SLAYER |
| Primordial Ward Ring | 10 | 99 | 380 | 1300 | 30 Ether-Bar + 25 Divine Essence + 25 Void Essence | DIVINE_BLESSING |

---

### Necklaces - Distinct Identity Focus

#### HP/Defense Necklaces - Tank Focus

| Name | Tier | Level | HP | DEF | Crafting Materials | Special Trait |
|------|------|-------|-----|-----|--------------------|---------------|
| Leather Necklace | 1 | 1 | 25 | 3 | 3 Leather | - |
| Chain Necklace | 1 | 12 | 50 | 6 | 8 Iron Bar | - |
| Steel Necklace | 2 | 25 | 90 | 12 | 12 Steel Bar | - |
| Mithril Necklace | 3 | 40 | 160 | 20 | 8 Mithril Bar | - |
| Adamantite Necklace | 4 | 55 | 270 | 32 | 8 Adamantite Bar | - |
| Dragonheart Necklace | 5 | 70 | 420 | 48 | 10 Adamantite Bar + 3 Ether-Bar | DRAGON_SLAYER |
| Guardian Necklace | 6 | 85 | 650 | 70 | 15 Ether-Bar + 8 Legendary Monster Parts | DIVINE_BLESSING |
| Divine Necklace | 7 | 90 | 920 | 95 | 20 Ether-Bar + 12 Divine Essence + 10 Holy Essence | DIVINE_BLESSING |
| Omega Necklace | 8 | 94 | 1250 | 125 | 25 Ether-Bar + 16 Divine Essence + 15 Void Essence | DIVINE_BLESSING |
| Titan Necklace | 9 | 97 | 1650 | 165 | 30 Ether-Bar + 22 Divine Essence + 20 Holy Essence | GIANT_SLAYER |
| Primordial Ward Necklace | 10 | 99 | 2200 | 220 | 35 Ether-Bar + 28 Divine Essence + 25 Void Essence | DIVINE_BLESSING |

#### Magic Necklaces - Caster Focus

| Name | Tier | Level | MATK | MP | MDEF | Crafting Materials | Special Trait |
|------|------|-------|------|----|------|--------------------|---------------|
| Silver Necklace | 1 | 8 | 8 | 25 | 4 | 5 Silver Bar | - |
| Enchanted Necklace | 2 | 22 | 18 | 50 | 8 | 8 Quartz Crystal + 5 Steel Bar | - |
| Arcane Necklace | 3 | 40 | 35 | 90 | 15 | 10 Arcane Essence + 6 Mithril Bar | - |
| Sorcerer Necklace | 4 | 55 | 60 | 150 | 25 | 12 Arcane Essence + 6 Adamantite Bar | ELEMENTAL_MASTERY |
| Archmage Necklace | 5 | 70 | 100 | 240 | 40 | 15 Arcane Essence + 4 Ether-Bar | ELEMENTAL_MASTERY |
| Sage Necklace | 6 | 85 | 160 | 380 | 60 | 20 Arcane Essence + 10 Ether-Bar | ELEMENTAL_MASTERY |
| Void Sage Necklace | 7 | 90 | 230 | 520 | 85 | 25 Arcane Essence + 12 Void Essence + 10 Dark Essence | VOID_TOUCH |
| Celestial Necklace | 8 | 94 | 320 | 700 | 115 | 30 Arcane Essence + 18 Divine Essence + 15 Void Essence | ELEMENTAL_MASTERY |
| Omega Necklace | 9 | 97 | 420 | 920 | 150 | 35 Arcane Essence + 22 Divine Essence + 20 Void Essence | ELEMENTAL_MASTERY |
| Primordial Arcane Necklace | 10 | 99 | 550 | 1200 | 200 | 40 Arcane Essence + 28 Divine Essence + 25 Void Essence | PHANTOM_STRIKE |

#### Regeneration Necklaces - Support Focus

| Name | Tier | Level | HP Regen | MP Regen | HP Bonus | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|-----------|--------------------|---------------|
| Healing Necklace | 1 | 15 | 1 | 0 | 30 | 5 Leather + 3 Herb | - |
| Mana Necklace | 2 | 28 | 0 | 2 | 40 | 6 Quartz Crystal + 4 Mana Essence | - |
| Vitality Necklace | 3 | 42 | 2 | 1 | 70 | 8 Mana Essence + 5 Mithril Bar | REGENERATION |
| Sage's Necklace | 4 | 58 | 3 | 2 | 110 | 10 Mana Essence + 6 Adamantite Bar | REGENERATION |
| Restoration Necklace | 5 | 72 | 4 | 3 | 170 | 12 Mana Essence + 3 Ether-Bar | REGENERATION |
| Divine Necklace | 6 | 86 | 6 | 4 | 250 | 15 Mana Essence + 8 Divine Essence | DIVINE_BLESSING |
| Celestial Necklace | 7 | 91 | 8 | 5 | 350 | 18 Divine Essence + 12 Holy Essence + 8 Mana Essence | DIVINE_BLESSING |
| Omega Regen Necklace | 8 | 95 | 10 | 7 | 480 | 22 Divine Essence + 15 Holy Essence + 12 Mana Essence | DIVINE_BLESSING |
| Titan Regen Necklace | 9 | 98 | 13 | 9 | 620 | 28 Divine Essence + 20 Holy Essence + 15 Mana Essence | DIVINE_BLESSING |
| Primordial Life Necklace | 10 | 99 | 15 | 12 | 850 | 35 Divine Essence + 25 Holy Essence + 20 Mana Essence | TEMPEST_CALL |

---

### Belts - Distinct Identity Focus

#### Strength Belts - Warrior Tank Focus

| Name | Tier | Level | HP | DEF | Crafting Materials | Special Trait |
|------|------|-------|-----|-----|--------------------|---------------|
| Cloth Belt | 1 | 1 | 15 | 2 | 3 Cloth | - |
| Leather Belt | 1 | 12 | 30 | 4 | 5 Leather | - |
| Studded Belt | 2 | 25 | 55 | 8 | 8 Leather + 4 Iron Bar | - |
| Chain Belt | 3 | 40 | 95 | 14 | 10 Steel Bar + 6 Ironwood | - |
| Mithril Belt | 4 | 55 | 160 | 22 | 8 Mithril Bar + 5 Spirit Wood | - |
| Adamantite Belt | 5 | 70 | 260 | 35 | 8 Adamantite Bar + 3 Ether-Bar | GIANT_SLAYER |
| Titan Belt | 6 | 85 | 400 | 52 | 12 Ether-Bar + 8 Legendary Monster Parts | GIANT_SLAYER |
| Divine Belt | 7 | 90 | 560 | 72 | 15 Ether-Bar + 10 Divine Essence + 8 Holy Essence | DIVINE_BLESSING |
| Omega Belt | 8 | 94 | 760 | 95 | 20 Ether-Bar + 14 Divine Essence + 12 Void Essence | GIANT_SLAYER |
| Primordial Belt | 9 | 98 | 1000 | 125 | 25 Ether-Bar + 18 Divine Essence + 15 Holy Essence | GIANT_SLAYER |
| Eternal Belt | 10 | 99 | 1350 | 165 | 30 Ether-Bar + 22 Divine Essence + 20 Void Essence | DIVINE_BLESSING |

#### Agility Belts - Rogue/Assassin Focus

| Name | Tier | Level | Dodge | Atk Speed | Crafting Materials | Special Trait |
|------|------|-------|-------|-----------|--------------------|---------------|
| Rope Belt | 1 | 8 | 3 | 2 | 3 Rope | - |
| Swift Belt | 2 | 22 | 6 | 5 | 6 Leather + 4 Yew Wood | - |
| Wind Belt | 3 | 38 | 10 | 8 | 8 Yew Wood + 5 Ironwood | - |
| Storm Belt | 4 | 54 | 16 | 12 | 8 Ironwood + 5 Spirit Wood | - |
| Lightning Belt | 5 | 70 | 24 | 18 | 8 Spirit Wood + 3 Ether-Bar + 5 Lightning Essence | TEMPEST_CALL |
| Tempest Belt | 6 | 85 | 35 | 25 | 12 Ether-Bar + 8 Lightning Essence + 5 Divine Essence | TEMPEST_CALL |
| Typhoon Belt | 7 | 90 | 48 | 32 | 15 Ether-Bar + 12 Lightning Essence + 8 Holy Essence | TEMPEST_CALL |
| Hurricane Belt | 8 | 94 | 62 | 42 | 20 Ether-Bar + 16 Lightning Essence + 12 Divine Essence | TEMPEST_CALL |
| Omega Swift Belt | 9 | 97 | 80 | 55 | 25 Ether-Bar + 20 Lightning Essence + 15 Holy Essence | TEMPEST_CALL |
| Primordial Wind Belt | 10 | 99 | 100 | 70 | 30 Ether-Bar + 25 Lightning Essence + 20 Divine Essence | PHANTOM_STRIKE |

---

## 8. UNIQUE IDENTITY SUMMARY

### Key Differentiators by Accessory Type

| Category | Accessory Type | Primary Identity | Stat Focus | Secondary |
|----------|---------------|-----------------|------------|-----------|
| **Rings** | Attack Ring | Critical/DPS | ATK + Crit | Lifesteal |
| | Magic Ring | Mana/Caster | MATK + MP | Regen |
| | Defense Ring | Tank | DEF + HP | MDEF |
| | Elemental Ring | Hybrid | Elemental Dmg | Resistance |
| **Necklaces** | HP Necklace | Tank | HP | DEF |
| | Magic Necklace | Caster | MATK | MP |
| | Regen Necklace | Support | HP/MP Regen | Buffs |
| | Fate Necklace | Balanced | All Stats | Crit |
| **Belts** | Strength Belt | Warrior | HP + DEF | Status Resist |
| | Agility Belt | Rogue | Dodge | Atk Speed |

---

## 9. TIER PROGRESSION CONSISTENCY

### Stat Scaling by Tier (Balanced Progression)

| Tier | Level | Stat Multiplier | Notes |
|------|-------|-----------------|-------|
| T1 | 1-10 | 1.0x | Starting gear |
| T2 | 11-20 | 1.2x | Basic progression |
| T3 | 21-30 | 1.5x | Early mid-game |
| T4 | 31-40 | 1.9x | Mid-game |
| T5 | 41-50 | 2.4x | Late mid-game |
| T6 | 51-60 | 3.0x | End-game starter |
| T7 | 61-70 | 3.7x | High-end |
| T8 | 71-80 | 4.5x | Elite tier |
| T9 | 81-90 | 5.5x | Master tier |
| T10 | 91-99 | 6.8x | Maximum power |

### TIER 7-10 Naming Themes

| Tier | Theme | Naming Pattern |
|------|-------|----------------|
| T7 | Void/Shadow | Void X, Shadow X, Night X |
| T8 | Omega/Dark | Omega X, Dark X, Eclipse X |
| T9 | Divine/Legendary | Divine X, Sacred X, Titan X |
| T10 | Primordial | Primordial X, Eternal X |

---

## 10. Accessory Set Bonuses

### Equipment Set Definitions

| Set Name | Pieces | 2-Piece Bonus | 4-Piece Bonus | 6-Piece Bonus |
|----------|--------|---------------|---------------|---------------|
| **Berserker Set** | Ring + Ring + Belt | +10% Critical Damage | +15% Attack | +25% Lifesteal |
| **Mage Set** | Ring + Ring + Necklace | +15% Magic Damage | +20% Mana Regen | +30% Elemental Damage |
| **Guardian Set** | Ring + Necklace + Belt | +15% Defense | +20% HP | +30% Damage Reduction |
| **Elementalist Set** | Ring + Necklace + Belt | +20% Elemental Damage | +25% Resistance | +35% Elemental Mastery |
| **Divine Set** | Ring + Necklace + Belt | +20% Divine Damage | +25% MDEF | +40% Healing Effect |

---

## 11. Crafting Materials Legend

| Material Type | Source | Used For |
|---------------|--------|----------|
| **Copper Bar** | Smelting Copper Ore | T1 Accessories |
| **Iron Bar** | Smelting Iron Ore | T1-2 Accessories |
| **Silver Bar** | Smelting Silver Ore | T2 Accessories |
| **Gold Bar** | Smelting Gold Ore | T4-5 Accessories |
| **Steel Bar** | Smelting Steel Ore | T2-3 Accessories |
| **Mithril Bar** | Smelting Mithril Ore | T3-4 Accessories |
| **Adamantite Bar** | Smelting Adamantite Ore | T4-5 Accessories |
| **Ether-Bar** | Rare crafting | T5-6 Accessories |
| **Quartz Crystal** | Mining | Magic accessories |
| **Mana Essence** | Alchemy | MP/Regen accessories |
| **Arcane Essence** | Alchemy | Magic damage accessories |
| **Shadow Essence** | Dark crafting | Stealth accessories |
| **Void Essence** | Void crafting | Void accessories |
| **Divine Essence** | Holy crafting | Divine accessories |
| **Lightning Essence** | Storm crafting | Speed accessories |
| **Dragon Scale** | Dragon drops | Dragon accessories |

---

*Document Version: 1.1 - Accessories Edition (Revised)*
*Related: WEAPON_DATA_REFERENCE.md, ITEM_CATEGORIZATION_GDD.md*

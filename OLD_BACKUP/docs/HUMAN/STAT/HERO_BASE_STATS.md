# Hero Base Stats Documentation

**Version:** 2.0  
**Last Updated:** 2026-02-18
**Document Type:** Technical Reference

---

## Overview

Hero Base Stats are the foundational statistics that define a hero's inherent capabilities before any modifiers from equipment, skills, buffs, or other sources are applied. These values are stored directly in the Hero model in the database and serve as the starting point for all stat calculations in the 14-layer stat pipeline.

### Design Philosophy

- **Primary Attributes** = Stats that players can allocate points to (STR, DEX, INT, DEF)
- **Secondary Stats** = Stats derived from equipment, class, buffs (HP, Mana, PDEF, MDEF, etc.)

---

## Primary Attributes (Allocatable)

| Stat | Default | Max Cap | Function |
|------|---------|---------|----------|
| **STR** | 10 | 255 | Physical Damage |
| **DEX** | 10 | 255 | Speed + Critical + Evasion |
| **INT** | 10 | 255 | Magic Damage |
| **DEF** | 10 | 255 | Defense (PDEF = MDEF) |

### Notes:
- **LUK** merged into DEX (Critical comes from DEX)
- **VIT** removed as primary stat (HP comes from Class + Equipment)
- **HP/Mana** NOT from STR/INT - comes from Class Template + Equipment

---

## HP & Mana Sources

| Stat | Source |
|------|--------|
| **HP** | Class Template (base) + Equipment (bonus) |
| **Mana** | Class Template (base) + Equipment (bonus) |

### Class Base Stats:
Each class has different base HP/Mana:
- **Warrior**: High HP, Low Mana
- **Mage**: Low HP, High Mana
- **Rogue**: Medium HP, Medium Mana

---

## Defense System

### Formula:
```
Total PDEF = DEF (allocation) + Equipment PDEF (Armor)
Total MDEF = DEF (allocation) + Equipment MDEF (Robe)
```

### Equipment Defense:

| Equipment Type | Gives |
|---------------|-------|
| **Armor (Plate)** | +PDEF |
| **Robe** | +MDEF |
| **Shield** | +PDEF + Block |
| **Accessories** | HP, Mana, various stats |

### Balance Rationale:
- Tank can wear heavy armor for PDEF
- Mage can wear robes for MDEF
- Single DEF stat simplifies allocation while equipment provides differentiation

---

## Database Schema

### Hero Model Primary Stats

```prisma
model Hero {
  // Primary Attributes (4 main stats)
  str                 Int   @default(10)  // Physical Damage
  dex                 Int   @default(10)  // Speed, Critical, Evasion
  int                 Int   @default(10)  // Magic Damage
  def                 Int   @default(10)  // Defense (PDEF = MDEF)

  // Combat Base Stats (from Class + Equipment, NOT from primary stats)
  hp_base             Int   @default(100) // Health Points
  mana_base           Int   @default(20)   // Mana
  damage_base         Int   @default(10)   // Attack Damage
  defense_base        Int   @default(0)    // Base Defense
  speed_base          Int   @default(5)    // Speed
  range_base          Int   @default(1)    // Attack Range
}
```

---

## Combat Stats (Secondary)

### Combat Base Stats

| Stat | Default | Max Cap | Source |
|------|---------|---------|--------|
| HP | 100 | 99,999 | Class Template + Equipment |
| Mana | 20 | 9,999 | Class Template + Equipment |
| Attack | 10 | 99,999 | STR + Equipment |
| PDEF | 0 | 99,999 | DEF + Armor |
| MDEF | 0 | 99,999 | DEF + Robe |
| Speed | 5 | 255 | DEX |
| Range | 1 | 10 | Class/Weapon |

### Combat Rates

| Stat | Default | Max Cap | Source |
|------|---------|---------|--------|
| Dodge Chance | 5% | 95% | DEX + Equipment |
| Crit Chance | 5% | 100% | DEX |
| Crit Damage | 150% | 500% | Equipment |
| Block Chance | 0% | 75% | Shield + Equipment |
| Parry Chance | 0% | 50% | Equipment |

---

## Attack Speed & Cast Rate

These are **secondary stats** from equipment, NOT primary attributes.

| Stat | Default | Source |
|------|---------|--------|
| Attack Speed | 1.0x | Weapon + Equipment |
| Cast Rate | 1.0x | Weapon (Wand/Staff) + INT |

---

## Other Secondary Stats

| Stat | Default | Source |
|------|---------|--------|
| HP Regen | 0 | Equipment/Buffs |
| Mana Regen | 2 | Equipment/Buffs |
| Accuracy | 100% | Equipment |
| Armor Pen | 0 | Equipment |
| Skill Power | 10 | Equipment |
| Tenacity | 0% | Equipment (CC resist) |
| Lifesteal | 0% | Equipment |
| Spell Vamp | 0% | Equipment |
| Move Speed | 100% | Base |
| Attack Speed | 1.0x | Weapon + Equipment |

---

## Stat Allocation System

### HeroStatAllocation Model

```prisma
model HeroStatAllocation {
  id               Int    @id @default(autoincrement())
  heroId           Int    @unique
  availablePoints  Int    @default(0)
  strAllocated     Int    @default(0)
  dexAllocated     Int    @default(0)
  intAllocated     Int    @default(0)
  defAllocated     Int    @default(0)
  totalSpent       Int    @default(0)
  lastResetAt      DateTime?
}
```

### StatAllocationTemplate

```prisma
model StatAllocationTemplate {
  id                Int     @id @default(autoincrement())
  classId           Int     @unique
  strGrowthCurve    String  @default("linear")
  dexGrowthCurve    String  @default("linear")
  intGrowthCurve    String  @default("linear")
  defGrowthCurve    String  @default("linear")
  strGrowthFactor   Float   @default(1.0)
  dexGrowthFactor   Float   @default(1.0)
  intGrowthFactor   Float   @default(1.0)
  defGrowthFactor   Float   @default(1.0)
  basePointsPerLevel Int    @default(5)
  maxStatCap        Int    @default(255)
  recommendedStr    Int    @default(10)
  recommendedDex    Int    @default(10)
  recommendedInt    Int    @default(10)
  recommendedDef    Int    @default(10)
}
```

---

## Class Templates & Growth

### Class Tiers

Classes are organized into tiers that determine growth patterns:

| Tier | Classes | Example |
|------|---------|---------|
| 0 | Novice | 1001 |
| 1 | Base Classes | Warrior (1101), Scout (1102), Apprentice (1103) |
| 2 | Advanced | Knight (2101), Rogue (2103), Wizard (2111) |
| 3 | Master | Lord Commander (3101), Archmage (3105) |

### ClassTemplate Growth Fields

```prisma
model ClassTemplate {
  // Base stats (NOT from primary attributes)
  hpBase     Int     @default(100)  // Base HP from class
  mpBase     Int     @default(20)   // Base Mana from class
  hpGrowth   Float   @default(5)    // HP per level
  mpGrowth   Float   @default(2)    // Mana per level
  
  // Combat stats
  atkGrowth  Float   @default(1)    // Attack per level
  defGrowth  Float   @default(0.5) // Defense per level
  spdGrowth  Float   @default(0.1) // Speed per level
}
```

---

## Related Documentation

- [Stat System Overview](../STAT_SYSTEM.md)
- [14-Layer Calculation Pipeline](MULTILAYER_CALCULATION.md)
- [Combat System](../COMBAT_SYSTEM.md)
- [Equipment System](../EQUIPMENT_SYSTEM.md)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-02-18 | New design: 4 primary stats (STR/DEX/INT/DEF), HP/Mana from Class+Equipment |
| 1.0 | 2024-08-01 | Initial documentation |

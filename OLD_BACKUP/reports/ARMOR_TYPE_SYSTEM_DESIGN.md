# Armor Type System Design - Traditional System (Engine-Aligned v2.0)

> **System Decision**: This document uses the **Traditional System** where:
> - **Skills/Abilities**: Come from character/class only
> - **Armor**: Provides base defense, resistance bonuses, and passive effects only
> - **Combat Defense**: Uses a unified `defense` stat and elemental resistance to mitigate damage
>
> **Change Log v2.0**: Aligned with game engine. Removed MDEF (unified into `defense`), removed physical damage subtypes (Slash/Pierce/Blunt), corrected elements to match engine (6 elements), removed unimplemented Mastery/Upgrade systems.

---

## 1. Overview

### 1.1 Design Goals

The Armor Type System in Textical provides depth through equipment differentiation while maintaining class identity. Each armor type offers:

| Aspect | Description |
|--------|-------------|
| **Defense** | Unified `defense` stat reducing all incoming damage |
| **Elemental Resistance** | Percentage reduction against 6 elements (Fire, Water, Earth, Wind, Light, Dark) |
| **Movement Impact** | Speed penalty/bonus via `move_speed` stat modifier |
| **Unique Passive Effects** | Via `TraitTemplate` attached to items |
| **Inherent Stats** | Each armor has its own base stats via `ItemStat` entries |

### 1.2 Core Architecture (Engine-Aligned)

```
┌─────────────────────────────────────────────────────────┐
│                    PLAYER / HERO                        │
│                  (Has Class Skills)                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              ARMOR (ItemTemplate + ItemStat)            │
│  ┌─────────────┬──────────────┬─────────────────────┐  │
│  │  Defense    │  Elemental   │  Trait Passives     │  │
│  │  (unified) │  Resistance  │  (via TraitTemplate)│  │
│  └─────────────┴──────────────┴─────────────────────┘  │
│  Equipped via: ItemEquipSlot (HEAD/CHEST/LEGS/etc.)     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│            StatCalculationEngine (Layer 4)              │
│    Equipment stats applied via applyEquipment()         │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Database Model (No ArmorType Model)

Unlike `WeaponType`, armor does **NOT** have a dedicated type model. Instead:

| Model | Role |
|-------|------|
| `ItemTemplate` | Base item data (name, description, category=`EQUIPMENT`, rarity, baseValue) |
| `ItemStat` | Stats (statKey + statValue pairs) |
| `ItemEquipSlot` | Which slot(s) the item can equip (HEAD, CHEST, LEGS, FEET, HANDS, OFF_HAND) |
| `ItemTrait` | Links to `TraitTemplate` for passive effects |
| `EquipmentSetTemplate` | Set bonus definitions |

> **Note**: Armor "category" (Light/Medium/Heavy/Robe/Shield) is conveyed through naming convention and stat values, not a dedicated database field.

---

## 2. Armor Categories & Properties

### 2.1 Category Overview

| **Category** | Primary Role | Defense | Speed Modifier | Equipment Slots |
|----------|-------------|---------|----------------|-----------------|
| **Light Armor** | Evasion/Agility | Low | +5 to +15 | HEAD, CHEST, LEGS, FEET, HANDS |
| **Medium Armor** | Balanced | Medium | -3 to 0 | HEAD, CHEST, LEGS, FEET, HANDS |
| **Heavy Armor** | Tank/Defense | High | -15 to -25 | HEAD, CHEST, LEGS, FEET, HANDS |
| **Robe** | Magic Focus | Low | +3 to +5 | HEAD, CHEST, LEGS, FEET |
| **Shield** | Blocking | High | -5 to -15 | OFF_HAND |

> **Speed Modifier**: Applied via `ItemStat` key `move_speed` as flat value. Base hero move_speed = 100.

### 2.2 Valid Stat Keys for Armor

Based on `StatCalculationEngine._initializeStats()`:

| statKey | Description | Type | Max Cap |
|---------|-------------|------|---------|
| `defense` | Unified damage reduction | flat | 99999 |
| `health_max` | Bonus HP | flat | 99999 |
| `speed` | Turn priority | flat | 255 |
| `move_speed` | Movement speed modifier | flat | — |
| `dodge_chance` | Dodge probability | percent | 0.95 |
| `block_chance` | Block probability | percent | 0.75 |
| `block_power` | Block damage reduction | percent | — |
| `parry_chance` | Parry probability | percent | 0.40 |
| `hp_regen` | HP regeneration per tick | flat | 999 |
| `mana_regen` | Mana regeneration per tick | flat | 999 |
| `tenacity` | CC duration reduction | percent | 1.0 |
| `fire_resistance` | Fire resist | percent | 0.90 |
| `water_resistance` | Water resist | percent | 0.90 |
| `earth_resistance` | Earth resist | percent | 0.90 |
| `wind_resistance` | Wind resist | percent | 0.90 |
| `light_resistance` | Light resist | percent | 0.90 |
| `dark_resistance` | Dark resist | percent | 0.90 |

---

## 3. Elemental Resistance Matrix

### 3.1 Resistance by Armor Category

Armor provides percentage-based resistance against 6 elements:

| Armor Type | Fire | Water | Earth | Wind | Light | Dark |
|------------|------|-------|-------|------|-------|------|
| **Light Armor** | 0.05 | 0.05 | 0.05 | 0.10 | 0.05 | 0.05 |
| **Medium Armor** | 0.10 | 0.10 | 0.10 | 0.10 | 0.10 | 0.10 |
| **Heavy Armor** | 0.15 | 0.15 | 0.20 | 0.10 | 0.15 | 0.15 |
| **Robe** | 0.25 | 0.20 | 0.15 | 0.15 | 0.15 | 0.25 |
| **Shield** | 0.10 | 0.15 | 0.10 | 0.10 | 0.10 | 0.10 |

> **Values are stored as decimals** (0.10 = 10%). Engine cap: 0.90 (90%) max per element.

### 3.2 Resistance Calculation

```
Final Damage = Base Damage × (1 - Total Resistance)
Total Resistance = Base Resistance + Equipment Resistance + Buff Bonus
```

> Resistance capped at 0.90 from all sources combined.

---

## 4. Armor Types & Unique Passives

> **Implementation Note**: Unique passives are implemented via `TraitTemplate` linked through `ItemTrait`. Each armor piece can have 0-2 traits attached.

### 4.1 Light Armor

Light armor prioritizes mobility and evasion over raw defense. Best for DPS classes and agile builds.

#### 4.1.1 Leather Armor

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 15-25 |
| **Move Speed** | `move_speed` | +10 |
| **Trait 1** | Swift Step | +0.08 dodge_chance, +5 move_speed |
| **Trait 2** | Agile Reflexes | +0.15 dodge_chance after moving (conditional) |

#### 4.1.2 Studded Leather

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 25-35 |
| **Move Speed** | `move_speed` | +8 |
| **Trait 1** | Deflection | +0.12 parry_chance |
| **Trait 2** | Mobile Defense | +5% defense when HP < 50% (conditional) |

#### 4.1.3 Shadow Cloak

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 20-30 |
| **Move Speed** | `move_speed` | +12 |
| **Trait 1** | Shadow Walk | +0.20 dodge_chance in darkness (conditional) |
| **Trait 2** | Vanish | 15% chance invisible when HP < 30% (conditional) |

#### 4.1.4 Ranger's Garb

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 20-30 |
| **Move Speed** | `move_speed` | +15 |
| **Trait 1** | Trailblazer | +20 move_speed in forest terrain (conditional) |
| **Trait 2** | Quick Draw | +0.25 attack_speed |

---

### 4.2 Medium Armor

Medium armor provides balanced defense and mobility. Ideal for hybrid classes.

#### 4.2.1 Chainmail

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 40-55 |
| **Move Speed** | `move_speed` | 0 |
| **Trait 1** | Chain Guard | +0.10 block_chance |
| **Trait 2** | Flexible Defense | +0.08 dodge_chance when surrounded (conditional) |

#### 4.2.2 Scale Mail

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 55-70 |
| **Move Speed** | `move_speed` | -5 |
| **Trait 1** | Scales of the Dragon | +0.20 fire_resistance |
| **Trait 2** | Molten Skin | 10% chance to burn attackers (conditional) |

#### 4.2.3 Brigandine

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 45-60 |
| **Move Speed** | `move_speed` | -3 |
| **Trait 1** | Reactive Defense | +20% defense after attacking (conditional) |
| **Trait 2** | Bounty Hunter | +25% damage to humanoid type enemies (conditional) |

#### 4.2.4 Cuirass

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 60-80 |
| **Move Speed** | `move_speed` | -5 |
| **Trait 1** | Heart of the Lion | +500 health_max |
| **Trait 2** | Battle Hardened | +0.15 tenacity when HP < 50% (conditional) |

---

### 4.3 Heavy Armor

Heavy armor maximizes physical defense at the cost of mobility. Best for tanks.

#### 4.3.1 Plate Armor

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 80-100 |
| **Move Speed** | `move_speed` | -15 |
| **Trait 1** | Iron Fortress | +15 defense when HP < 50% (conditional) |
| **Trait 2** | Last Stand | +30 defense when HP < 25% (conditional) |

#### 4.3.2 Full Plate

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 100-120 |
| **Move Speed** | `move_speed` | -20 |
| **Trait 1** | Armored Titan | +0.10 all elemental resistances |
| **Trait 2** | Phalanx Formation | +10 defense per adjacent ally (conditional) |

#### 4.3.3 Dreadnought Armor

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 120-150 |
| **Move Speed** | `move_speed` | -25 |
| **Trait 1** | Unbreakable | +0.25 tenacity, immunity to knockback |
| **Trait 2** | Deathless | Revive once with 25% HP per combat (conditional) |

#### 4.3.4 Gothic Plate

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 90-110 |
| **Move Speed** | `move_speed` | -18 |
| **Trait 1** | Vampire Slayer | +30% damage to undead race (conditional) |
| **Trait 2** | Holy Aura | +0.15 light_resistance |

---

### 4.4 Robes

Robes prioritize magic-oriented stats and mana efficiency. Essential for casters.

#### 4.4.1 Apprentice Robe

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 10-20 |
| **Move Speed** | `move_speed` | +5 |
| **Trait 1** | Mana Shield | +0.25 mana efficiency |
| **Trait 2** | Arcane Mind | +5 mana_regen |

#### 4.4.2 Mage's Robe

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 15-25 |
| **Move Speed** | `move_speed` | +3 |
| **Trait 1** | Elemental Ward | +0.10 all elemental resistances |
| **Trait 2** | Arcane Reflection | 15% chance to reflect magic attacks (conditional) |

#### 4.4.3 Arcane Vestment

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 20-30 |
| **Move Speed** | `move_speed` | +5 |
| **Trait 1** | Mana Overflow | +10 mana_regen when MP < 30% (conditional) |
| **Trait 2** | Spellsteal | 10% chance restore 20 MP when hit by magic (conditional) |

#### 4.4.4 Hierophant's Robe

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 30-45 |
| **Move Speed** | `move_speed` | 0 |
| **Trait 1** | Divine Protection | +0.15 all elemental resistances |
| **Trait 2** | Healing Aura | +10 hp_regen |

---

### 4.5 Shields

Shields are off-hand equipment that provide blocking capabilities and defensive bonuses.

#### 4.5.1 Kite Shield

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 45-60 |
| **Block Chance** | `block_chance` | 0.25 |
| **Block Power** | `block_power` | 0.50 |
| **Move Speed** | `move_speed` | -10 |
| **Trait 1** | Standard Bearer | +15 defense when HP < 50% (conditional) |
| **Trait 2** | Iron Will | +0.15 tenacity |

#### 4.5.2 Tower Shield

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 65-85 |
| **Block Chance** | `block_chance` | 0.35 |
| **Block Power** | `block_power` | 0.75 |
| **Move Speed** | `move_speed` | -15 |
| **Trait 1** | Fortress | Ally protection: nearby allies -15% damage taken (conditional) |
| **Trait 2** | Impenetrable | Immunity to knockback, +0.20 tenacity |

#### 4.5.3 Buckler

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 35-50 |
| **Block Chance** | `block_chance` | 0.20 |
| **Block Power** | `block_power` | 0.40 |
| **Move Speed** | `move_speed` | -5 |
| **Trait 1** | Counter | 20% chance to counterattack on block (conditional) |
| **Trait 2** | Reflex | +0.12 dodge_chance |

#### 4.5.4 Spirit Shield

| Property | statKey | Value |
|----------|---------|-------|
| **Defense** | `defense` | 40-55 |
| **Block Chance** | `block_chance` | 0.20 |
| **Block Power** | `block_power` | 0.50 |
| **Move Speed** | `move_speed` | -8 |
| **Trait 1** | Spectral Ward | Shield = 10% of defense after each attack (conditional) |
| **Trait 2** | Spirit Guide | +0.10 dark_resistance, +0.10 light_resistance |

---

## 5. Movement Speed System

### 5.1 Implementation via ItemStat

Movement speed is stored as `ItemStat` with `statKey = "move_speed"`. The engine processes it through `StatCalculationEngine` Layer 4 (Equipment).

```
Final Move Speed = Hero Base (100) + Sum of all equipment move_speed modifiers
```

| Armor Category | Typical move_speed modifier |
|----------------|----------------------------|
| Light Armor | +5 to +15 |
| Medium Armor | -5 to 0 |
| Heavy Armor | -15 to -25 |
| Robes | +3 to +5 |
| Shields | -5 to -15 |

### 5.2 Movement and Combat

- Movement speed affects **turn order priority** (higher speed = more frequent turns)
- Movement speed affects **positioning** in tactical combat
- Movement speed cannot be reduced below 25% of base value

---

## 6. Combat Integration

### 6.1 Defense Resolution Flow (Engine: CombatFormulaResolver)

```
Incoming Damage
       │
       ▼
┌──────────────────┐
│ calculateHitChance│──── Miss ───► No Damage
│ (accuracy vs     │
│  dodge_rate)     │
└────────┬─────────┘
         │ Hit
         ▼
┌──────────────────┐
│calculateBlockParry│──┬─ Parried ──► damage × 0.25
│ (block_chance,   │  │
│  parry_chance)   │  └─ Blocked ──► damage × (1 - block_power)
└────────┬─────────┘
         │ Not Blocked
         ▼
┌──────────────────┐
│ Apply Defense    │
│ (unified stat)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Apply Elemental  │──── Final Damage
│ Resistance       │
└──────────────────┘
```

### 6.2 Damage Formula (Engine)

```
Final Physical Damage = (Base Damage - Defense) × (1 - Elemental Resistance)
```

| Component | Source |
|-----------|--------|
| **Base Damage** | Attacker ATK - target armor_penetration |
| **Defense** | Hero's total `defense` (base + equipment + buffs) |
| **Elemental Resistance** | Sum of equipment resistances for the damage element |

---

## 7. Passive Effect System (via TraitTemplate)

### 7.1 Implementation

Armor passives are implemented as `TraitTemplate` entries linked to items via `ItemTrait`:

```
ItemTemplate ──> ItemTrait ──> TraitTemplate
                                    │
                                    ▼
                              TraitStatBonus (statKey + statValue)
                              + Hook Events (onBlock, onHit, etc.)
```

### 7.2 Passive Categories

| Category | Trigger | Example |
|----------|---------|---------:|
| **Stat Bonus** | Always active | +0.10 fire_resistance |
| **On Block** | When blocking | Counterattack chance |
| **On Hit** | When damaged | Reflect damage |
| **Conditional** | HP threshold, time, terrain | +20 defense when HP < 50% |

### 7.3 Set Bonus System (Implemented)

The engine supports set bonuses through existing schema:

| Model | Role |
|-------|------|
| `EquipmentSetTemplate` | Set definition (name, description) |
| `EquipmentSetPiece` | Links items to sets (setId, pieceOrder, itemTemplateId) |
| `EquipmentSetBonus` | Bonus tiers (requiredPieces, description) |
| `EquipmentSetBonusStat` | Stat bonuses per tier (statKey, statValue) |

Example sets:

| Set | Pieces | Bonus |
|-----|--------|-------|
| **Dragon Scale** | 3/5 | +0.15 fire_resistance, +10 defense |
| **Dragon Scale** | 5/5 | +0.30 fire_resistance, +25 defense, +500 health_max |
| **Shadow Walker** | 3/5 | +0.10 dodge_chance, +15 move_speed |
| **Shadow Walker** | 5/5 | +0.20 dodge_chance, +25 move_speed |
| **Iron Fortress** | 3/5 | +0.10 block_chance, +15 defense |
| **Iron Fortress** | 5/5 | +0.20 block_chance, +30 defense |

---

## 8. Economy Integration

### 8.1 Armor Value Components

| Component | Contribution |
|-----------|--------------|
| Base Item Value | 40-60% of total |
| Defense Stat | 30-40% of total |
| Unique Passive (Trait) | 20-35% of total |
| Set Bonus potential | 10-20% additional |
| Rarity Multiplier | COMMON=1x, UNCOMMON=1.5x, RARE=2.5x, EPIC=4x, LEGENDARY=8x |

---

## 9. Future Systems (NOT YET IMPLEMENTED)

> **Warning**: The following systems are planned but have no schema/engine support yet.

### 9.1 Armor Mastery System
- 10 mastery levels per armor category
- XP gained from receiving damage, blocking, winning combat
- **Status**: No `ArmorMastery` model exists

### 9.2 Upgrade System (+1 to +10)
- Enhances passive effect strength
- **Status**: No upgrade level field on `ItemTemplate` or `InventoryItem`

### 9.3 ArmorType Model
- Potential future addition similar to `WeaponType` model
- Would allow categorizing armor by type (Light/Medium/Heavy/Robe/Shield)
- **Status**: Not in schema. Armor category is implicit through naming.

---

## Appendix A: Quick Reference

### Armor Type Summary

| Armor | Category | Defense | Speed | Key Trait |
|-------|----------|---------|-------|-----------|
| Leather | Light | 15-25 | +10 | Swift Step |
| Studded Leather | Light | 25-35 | +8 | Deflection |
| Shadow Cloak | Light | 20-30 | +12 | Shadow Walk |
| Ranger's Garb | Light | 20-30 | +15 | Trailblazer |
| Chainmail | Medium | 40-55 | 0 | Chain Guard |
| Scale Mail | Medium | 55-70 | -5 | Dragon Scales |
| Brigandine | Medium | 45-60 | -3 | Reactive Defense |
| Cuirass | Medium | 60-80 | -5 | Heart of Lion |
| Plate Armor | Heavy | 80-100 | -15 | Iron Fortress |
| Full Plate | Heavy | 100-120 | -20 | Armored Titan |
| Dreadnought | Heavy | 120-150 | -25 | Unbreakable |
| Gothic Plate | Heavy | 90-110 | -18 | Vampire Slayer |
| Apprentice Robe | Robe | 10-20 | +5 | Mana Shield |
| Mage's Robe | Robe | 15-25 | +3 | Elemental Ward |
| Arcane Vestment | Robe | 20-30 | +5 | Mana Overflow |
| Hierophant's Robe | Robe | 30-45 | 0 | Divine Protection |
| Kite Shield | Shield | 45-60 | -10 | Standard Bearer |
| Tower Shield | Shield | 65-85 | -15 | Fortress |
| Buckler | Shield | 35-50 | -5 | Counter |
| Spirit Shield | Shield | 40-55 | -8 | Spectral Ward |

---

*Document Version: 2.0 (Engine-Aligned)*
*Last Updated: 2026-02-22*
*Aligned with: StatCalculationEngine.js, CombatFormulaResolver.js, schema.prisma*

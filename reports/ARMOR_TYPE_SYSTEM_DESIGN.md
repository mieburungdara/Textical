# Armor Type System Design - Traditional System

> **System Decision**: This document uses the **Traditional System** where:
> - **Skills/Abilities**: Come from character/class only
> - **Armor**: Provides base stats (DEF, MDEF), resistance bonuses, and passive effects only
> - **Combat Defense**: Uses defense values and resistance to mitigate damage (no active defensive skills from armor)

---

## 1. Overview

### 1.1 Design Goals

The Armor Type System in Textical provides depth through equipment differentiation while maintaining class identity. Each armor type offers:

| Aspect | Description |
|--------|-------------|
| **Defense Types** | Physical DEF, Magic DEF (MDEF) |
| **Damage Resistance** | Percentage reduction against specific damage types (Slash, Pierce, Blunt, etc.) |
| **Elemental Resistance** | Bonus effectiveness against certain elements (Fire, Water, etc.) |
| **Movement Impact** | Speed penalty/bonus based on armor weight |
| **Unique Passive Effects** | Conditional bonuses that trigger under specific conditions |
| **Inherent Stats** | Each armor has its own base DEF/MDEF values (defined in item database) |

### 1.2 Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PLAYER / HERO                        │
│                  (Has Class Skills)                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   ARMOR EQUIPPED                        │
│  ┌─────────────┬──────────────┬─────────────────────┐ │
│  │ Base Stats  │  Resistance │   Passive Effects   │ │
│  │ (DEF/MDEF) │   Bonuses    │   (No Active Skills)│ │
│  └─────────────┴──────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 DAMAGE MITIGATION                       │
│         (Apply DEF/MDEF + Resistance)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 FINAL DAMAGE CALCULATION                │
│      (Base Damage - Defense × Resistance Multiplier)   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Armor Categories & Properties

### 2.1 Category Overview

| **Category** | Primary Role | DEF | MDEF | Movement Speed | Equipment Slots |
|----------|-------------|-----|------|----------------|-----------------|
| **Light Armor** | Evasion/Agility | Low-Medium | Low | +10% | HEAD, CHEST, LEGS, FEET, HANDS |
| **Medium Armor** | Balanced | Medium | Medium | 0% | HEAD, CHEST, LEGS, FEET, HANDS |
| **Heavy Armor** | Tank/Defense | High | Medium | -15% | HEAD, CHEST, LEGS, FEET, HANDS |
| **Robe** | Magic Defense | Low | High | +5% | HEAD, CHEST, LEGS, FEET |
| **Shield** | Blocking | High | High | -10% | OFF_HAND |
| **Accessory** | Utility | Varies | Varies | 0% | RING_1, RING_2, NECKLACE, BELT |

> **Note**: Movement speed modifiers are cumulative. Wearing full Heavy Armor (-15%) with a Tower Shield (-10%) results in -25% total movement speed.
> **Tick System**: Movement speed affects turn order priority, not real-time movement.

### 2.2 Defense Stats Breakdown

Each armor piece contributes to the hero's total defense:

| Stat | Description | Source |
|------|-------------|--------|
| **DEF** | Physical Damage reduction | All armor, primarily Heavy/Medium |
| **MDEF** | Magic Damage reduction | Robes, Shields, Accessories |
| **EVASION** | Chance to dodge attacks | Light Armor, Accessories |
| **BLOCK** | Chance to block with shield | Shields |
| **BLOCK_POWER** | Damage reduction when blocking | Shields, Shield Mastery |
| **RESISTANCE** | % reduction per damage type | All armor (varies) |

---

## 3. Damage Type Resistance Matrix

### 3.1 Physical Damage Resistance by Armor Type

Armor provides percentage-based resistance against different physical damage types:

| Armor Type | Slash | Pierce | Blunt | Chop | Crush | Strike | Rend |
|------------|-------|--------|-------|------|-------|--------|------|
| **Light Armor** | 5% | 10% | 0% | 5% | 0% | 5% | 5% |
| **Medium Armor** | 10% | 15% | 5% | 10% | 5% | 10% | 10% |
| **Heavy Armor** | 20% | 15% | 25% | 15% | 30% | 20% | 15% |
| **Robe** | 0% | 0% | 0% | 0% | 0% | 0% | 0% |
| **Shield** | 15% | 10% | 20% | 10% | 25% | 15% | 10% |

### 3.2 Elemental Resistance by Armor Type

| Armor Type | Fire | Water | Nature | Earth | Lightning | Light | Dark |
|------------|------|-------|--------|-------|-----------|-------|------|
| **Light Armor** | 5% | 5% | 10% | 5% | 5% | 5% | 5% |
| **Medium Armor** | 10% | 10% | 15% | 10% | 10% | 10% | 10% |
| **Heavy Armor** | 15% | 15% | 10% | 20% | 15% | 15% | 15% |
| **Robe** | 25% | 20% | 20% | 15% | 20% | 15% | 25% |
| **Shield** | 10% | 15% | 10% | 10% | 10% | 10% | 10% |

### 3.3 Resistance Calculation Formula

```
Final Damage = Base Damage × (1 - Total Resistance%)
Total Resistance% = Base Resistance% + Armor Bonus% + Buff Bonus% + Set Bonus%
```

> **Note**: Resistance is capped at 75% from armor/buffs (can exceed 75% with debuffs on enemy)

---

## 4. Armor Types & Unique Passives

### 4.1 Light Armor

Light armor prioritizes mobility and evasion over raw defense. Best for DPS classes and agile builds.

#### 4.1.1 Leather Armor

| Property | Value |
|----------|-------|
| **DEF** | Low (15-25) |
| **MDEF** | Low (5-10) |
| **Movement** | +10% |
| **Unique Passive 1** | Swift Step: +8% Evasion, +5% movement speed |
| **Unique Passive 2** | Agile Reflexes: +15% dodge after moving (max 3 stacks), resets after being hit |

**Playstyle**: Fast, evasion-focused survivor

---

#### 4.1.2 Studded Leather

| Property | Value |
|----------|-------|
| **DEF** | Low-Medium (25-35) |
| **MDEF** | Low (10-15) |
| **Movement** | +8% |
| **Unique Passive 1** | Deflection: +12% Parry, 10% chance to reflect projectile attacks |
| **Unique Passive 2** | Mobile Defense: +5% DEF for each 10% HP missing (max +25%) |

**Playstyle**: Survival through movement and positioning

---

#### 4.1.3 Shadow Cloak

| Property | Value |
|----------|-------|
| **DEF** | Low (20-30) |
| **MDEF** | Medium (15-25) |
| **Movement** | +12% |
| **Unique Passive 1** | Shadow Walk: +20% Evasion when in cover/darkness, +10% Critical Rate at night |
| **Unique Passive 2** | Vanish: 15% chance to become invisible for 2 turns when below 30% HP |

**Playstyle**: Assassin/stealth specialist

---

#### 4.1.4 Ranger's Garb

| Property | Value |
|----------|-------|
| **DEF** | Low (20-30) |
| **MDEF** | Low (10-20) |
| **Movement** | +15% |
| **Unique Passive 1** | Trailblazer: +20% movement speed in forests, cannot be slowed below 50% |
| **Unique Passive 2** | Quick Draw: +25% Attack Speed, -10% skill cooldown |

**Playstyle**: Ranged DPS, mobility-focused

---

### 4.2 Medium Armor

Medium armor provides balanced defense and mobility. Ideal for hybrid classes and front-line fighters.

#### 4.2.1 Chainmail

| Property | Value |
|----------|-------|
| **DEF** | Medium (40-55) |
| **MDEF** | Medium (20-30) |
| **Movement** | 0% |
| **Unique Passive 1** | Chain Guard: +15% Pierce resistance, +10% Block chance |
| **Unique Passive 2** | Flexible Defense: +8% Evasion, +5% DEF when surrounded (3+ enemies) |

**Playstyle**: Balanced tank/DPS

---

#### 4.2.2 Scale Mail

| Property | Value |
|----------|-------|
| **DEF** | Medium-High (55-70) |
| **MDEF** | Medium (25-35) |
| **Movement** | -5% |
| **Unique Passive 1** | Scales of the Dragon: +20% Fire resistance, +15% all elemental resistances when HP > 75% |
| **Unique Passive 2** | Molten Skin: 10% chance to burn attackers for 5 damage/turn for 2 turns |

**Playstyle**: Fire-resistant tank

---

#### 4.2.3 Brigandine

| Property | Value |
|----------|-------|
| **DEF** | Medium (45-60) |
| **MDEF** | Medium (20-35) |
| **Movement** | -3% |
| **Unique Passive 1** | Reactive Defense: +20% DEF after attacking, +10% Counter Attack |
| **Unique Passive 2** | Bounty Hunter's Instinct: +25% damage to humanoid enemies, +15% HP when fighting bosses |

**Playstyle**: DPS tank, humanoid specialist

---

#### 4.2.4 Cuirass

| Property | Value |
|----------|-------|
| **DEF** | High (60-80) |
| **MDEF** | Medium (25-35) |
| **Movement** | -5% |
| **Unique Passive 1** | Heart of the Lion: +20% Max HP, +10% HP regeneration |
| **Unique Passive 2** | Battle Hardened: +15% all damage resistance when below 50% HP |

**Playstyle**: Durable frontliner

---

### 4.3 Heavy Armor

Heavy armor maximizes physical defense at the cost of mobility. Best for tanks and dedicated protectors.

#### 4.3.1 Plate Armor

| Property | Value |
|----------|-------|
| **DEF** | High (80-100) |
| **MDEF** | Medium (30-40) |
| **Movement** | -15% |
| **Unique Passive 1** | Iron Fortress: +25% Crush resistance, +15% DEF when below 50% HP |
| **Unique Passive 2** | Last Stand: +30% all defenses when below 25% HP, immunity to fear |

**Playstyle**: Ultimate physical tank

---

#### 4.3.2 Full Plate

| Property | Value |
|----------|-------|
| **DEF** | Very High (100-120) |
| **MDEF** | Medium (35-45) |
| **Movement** | -20% |
| **Unique Passive 1** | Armored Titan: +35% all physical resistances, -10% incoming critical damage |
| **Unique Passive 2** | Phalanx Formation: +10% DEF for each adjacent ally (max +30%), allies within 2 tiles +10% DEF |

**Playstyle**: Group protector, formation tank

---

#### 4.3.3 Dreadnought Armor

| Property | Value |
|----------|-------|
| **DEF** | Extreme (120-150) |
| **MDEF** | High (45-60) |
| **Movement** | -25% |
| **Unique Passive 1** | Unbreakable: Cannot be knocked back, +50% stun resistance, -25% movement speed penalty |
| **Unique Passive 2** | Deathless: When killed, revive once with 25% HP (5-minute cooldown), +50% DEF while at critical HP |

**Playstyle**: Immovable tank, last line of defense

---

#### 4.3.4 Gothic Plate

| Property | Value |
|----------|-------|
| **DEF** | High (90-110) |
| **MDEF** | High (50-70) |
| **Movement** | -18% |
| **Unique Passive 1** | Vampire Slayer: +30% damage to undead, +25% all resistances at night |
| **Unique Passive 2** | Holy Aura: 20% chance to blind attackers for 1 turn, +15% Light resistance |

**Playstyle**: Anti-undead specialist, balanced tank

---

### 4.4 Robes

Robes prioritize magic defense and mana efficiency. Essential for magic users and support classes.

#### 4.4.1 Apprentice Robe

| Property | Value |
|----------|-------|
| **DEF** | Low (10-20) |
| **MDEF** | High (50-65) |
| **Movement** | +5% |
| **Unique Passive 1** | Mana Shield: +25% Mana efficiency, +10% MDEF per 100 Max MP |
| **Unique Passive 2** | Arcane Mind: +15% Mana regeneration, -10% skill cooldown |

**Playstyle**: Sustained magical DPS

---

#### 4.4.2 Mage's Robe

| Property | Value |
|----------|-------|
| **DEF** | Low (15-25) |
| **MDEF** | Very High (70-90) |
| **Movement** | +3% |
| **Unique Passive 1** | Elemental Ward: +30% all elemental resistances, +20% damage when hit |
| **Unique Passive 2** | Arcane Reflection: 15% chance to reflect magic attacks, +25% Critical Resistance |

**Playstyle**: Magical tank, battle mage

---

#### 4.4.3 Arcane Vestment

| Property | Value |
|----------|-------|
| **DEF** | Low-Medium (20-30) |
| **MDEF** | Extreme (90-110) |
| **Movement** | +5% |
| **Unique Passive 1** | Mana Overflow: +40% Mana regeneration when below 30% MP |
| **Unique Passive 2** | Spellsteal: 10% chance to restore 20 MP when hit by magic, +20% Magic Damage |

**Playstyle**: Mana-dependent caster

---

#### 4.4.4 Hierophant's Robe

| Property | Value |
|----------|-------|
| **DEF** | Medium (30-45) |
| **MDEF** | Very High (85-105) |
| **Movement** | 0% |
| **Unique Passive 1** | Divine Protection: +35% all resistances, allies within 3 tiles +15% MDEF |
| **Unique Passive 2** | Healing Aura: +20% healing received, +15% HP regeneration |

**Playstyle**: Support/healer tank

---

### 4.5 Shields

Shields are off-hand equipment that provide blocking capabilities and defensive bonuses. (Note: Shield passives are in addition to weapon passives when equipped in OFF_HAND)

#### 4.5.1 Kite Shield

| Property | Value |
|----------|-------|
| **DEF** | High (45-60) |
| **MDEF** | Medium (30-40) |
| **Block Chance** | 25% |
| **Block Power** | 50% damage reduction |
| **Movement** | -10% |
| **Unique Passive 1** | Standard Bearer: +15% DEF when below 50% HP, +10% MDEF |
| **Unique Passive 2** | Iron Will: +20% Magic DEF, -15% chance to be stunned |

**Playstyle**: Balanced tanking

---

#### 4.5.2 Tower Shield

| Property | Value |
|----------|-------|
| **DEF** | Very High (65-85) |
| **MDEF** | High (45-55) |
| **Block Chance** | 35% |
| **Block Power** | 75% damage reduction |
| **Movement** | -15% |
| **Unique Passive 1** | Fortress: Protects adjacent allies (15% damage reduction), +30% DEF when adjacent to ally |
| **Unique Passive 2** | Impenetrable: Cannot be knocked back, -25% movement speed penalty |

**Playstyle**: Ultimate defensive tank

---

#### 4.5.3 Buckler

| Property | Value |
|----------|-------|
| **DEF** | Medium (35-50) |
| **MDEF** | Low (20-30) |
| **Block Chance** | 20% |
| **Block Power** | 40% damage reduction |
| **Movement** | -5% |
| **Unique Passive 1** | Counter: 20% chance to counterattack when blocking, +25% Counter Damage |
| **Unique Passive 2** | Reflex: +12% Dodge, +7% Counter Attack Rate per successful block (max 25%) |

**Playstyle**: Offensive tank, reactive combat

---

#### 4.5.4 Spirit Shield

| Property | Value |
|----------|-------|
| **DEF** | Medium (40-55) |
| **MDEF** | Very High (60-80) |
| **Block Chance** | 20% |
| **Block Power** | 50% damage reduction |
| **Movement** | -8% |
| **Unique Passive 1** | Spectral Ward: Creates shield equal to 10% of MDEF after each attack, shield persists for 2 turns |
| **Unique Passive 2** | Spirit Guide: +25% Magic DEF, reflects 10% magic damage to attacker |

**Playstyle**: Magical tank, support

---

### 4.6 Accessories

Accessories provide utility bonuses, stat boosts, and special effects. They don't have base DEF/MDEF but can add significant defensive bonuses.

#### 4.6.1 Ring of Protection

| Property | Value |
|----------|-------|
| **DEF** | +15-25 |
| **MDEF** | +15-25 |
| **Unique Passive 1** | Guardian's Blessing: +10% all resistances, +5% HP |
| **Unique Passive 2** | Mending: +5% HP regeneration |

**Playstyle**: General defensive boost

---

#### 4.6.2 Amulet of Vitality

| Property | Value |
|----------|-------|
| **DEF** | +10-20 |
| **MDEF** | +10-20 |
| **Unique Passive 1** | Life Force: +25% Max HP, +15% HP regeneration |
| **Unique Passive 2** | Death Defiance: Once per combat, survive fatal damage with 1 HP |

**Playstyle**: HP-focused survivability

---

#### 4.6.3 Belt of Stability

| Property | Value |
|----------|-------|
| **DEF** | +20-30 |
| **MDEF** | +10-15 |
| **Unique Passive 1** | Rooted: Immune to knockback, +20% Stun resistance |
| **Unique Passive 2** | Iron Stomach: +50% poison/disease resistance, +10% Max HP |

**Playstyle**: Control immunity

---

#### 4.6.4 Cloak of Evasion

| Property | Value |
|----------|-------|
| **DEF** | +10-15 |
| **MDEF** | +15-20 |
| **Unique Passive 1** | Phantom Step: +20% Evasion, +10% movement speed |
| **Unique Passive 2** | Lucky Escape: 15% chance to dodge incoming attacks, +5% Critical Dodge |

**Playstyle**: Evasion specialist

---

#### 4.6.5 Boots of Swiftness

| Property | Value |
|----------|-------|
| **DEF** | +10-15 |
| **MDEF** | +10-15 |
| **Unique Passive 1** | Wind Walker: +20% movement speed, -10% movement skill cooldowns |
| **Unique Passive 2** | Step Lightly: No movement penalty from armor, +15% Evasion when moving |

**Playstyle**: Mobility focus

---

## 5. Movement Speed System

### 5.1 Movement Penalty Calculation

```
Final Movement Speed = Base Speed × (1 - Sum of Armor Penalties + Sum of Boots Bonuses)
```

| Source | Penalty/Bonus |
|--------|---------------|
| Light Armor | +10% |
| Medium Armor | -3% to -5% |
| Heavy Armor | -15% to -25% |
| Robes | +3% to +5% |
| Shield | -5% to -15% |
| Boots of Swiftness | +20% |
| Ranger's Garb | +15% |
| Shadow Cloak | +12% |

### 5.2 Movement and Combat

- Movement speed affects **turn order priority** (higher speed = more frequent turns)
- Movement speed affects **positioning** in tactical combat
- Some skills require minimum movement speed to use effectively
- Movement speed cannot be reduced below 25% of base value

---

## 6. Combat Integration

### 6.1 Defense Resolution Flow

```
Incoming Damage
       │
       ▼
┌──────────────────┐
│ Check Hit/Miss   │──── Miss ───► No Damage
│ (Accuracy vs     │
│  Evasion)        │
└────────┬─────────┘
         │ Hit
         ▼
┌──────────────────┐
│ Check Block      │──── Blocked ──► Apply Block Power
│ (Block Chance)   │                 (Damage × Block%)
└────────┬─────────┘
         │ Not Blocked
         ▼
┌──────────────────┐
│ Apply DEF/MDEF  │
│ (Base Reduction)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Apply Resistance │──── Final Damage
│ (Damage Type &   │
│  Elemental)      │
└──────────────────┘
```

### 6.2 Damage Formula

```
Final Physical Damage = (Base Damage - DEF) × (1 - Physical Resistance%)
Final Magic Damage = (Base Magic Damage - MDEF) × (1 - Elemental Resistance%)
```

| Component | Source |
|-----------|--------|
| **Base Damage** | Enemy ATK - Enemy Armor Penetration |
| **DEF** | Hero's total DEF value |
| **Physical Resistance** | Sum of armor resistances vs damage type |
| **Elemental Resistance** | Sum of armor resistances vs element |

---

## 7. Passive Effect System

### 7.1 Passive Categories

| Category | Trigger | Example |
|----------|---------|---------|
| **On Defend** | When being attacked | +10% DEF when below 50% HP |
| **On Block** | When blocking | Counterattack chance |
| **On Hit** | When damaged | Reflect magic |
| **Conditional** | Under specific conditions | +20% Evasion at night |
| **Set Bonus** | Multiple pieces equipped | Complete set bonuses |

### 7.2 Set Bonus System

Wearing multiple pieces of the same armor set provides additional bonuses:

| Set | Pieces | Bonus |
|-----|--------|-------|
| **Dragon Scale** | 3/5 | +15% Fire Res, +10% DEF |
| **Dragon Scale** | 5/5 | +30% Fire Res, +25% DEF, +10% Max HP |
| **Shadow Walker** | 3/5 | +20% Evasion, +15% movement |
| **Shadow Walker** | 5/5 | +35% Evasion, +25% movement, Invisibility (3s) |
| **Iron Fortress** | 3/5 | +20% Block, +15% MDEF |
| **Iron Fortress** | 5/5 | +35% Block, +25% MDEF, +30% Counter |

---

## 8. Mastery & Progression System

### 8.1 Armor Mastery Trees

Each armor type has 10 mastery levels:

| Level | Requirement | Bonus |
|-------|-------------|-------|
| **1. Unarmored** | 0 XP | Basic defense |
| **2. Novice** | 50 XP | +3% DEF |
| **3. Beginner** | 150 XP | +5% DEF |
| **4. Amateur** | 400 XP | +2% Resistance (all) |
| **5. Competent** | 800 XP | **Unique passive enhancement** |
| **6. Proficient** | 1,500 XP | +8% DEF |
| **7. Advanced** | 3,000 XP | +5% Resistance (all) |
| **8. Veteran** | 5,000 XP | +10% DEF, +3% Block |
| **9. Expert** | 8,000 XP | +12% DEF, +5% Block |
| **10. Master** | 15,000 XP | +15% DEF, +7% Block, +10% Resistance |

### 8.2 Mastery XP Gain

| Action | XP Gain |
|--------|---------|
| Receive attack | +1 XP per 10 damage received |
| Block attack | +5 XP per block |
| Win combat | +50 XP |
| Survive with <25% HP | +25 XP bonus |

---

## 9. Economy Integration

### 9.1 Armor Value Components

| Component | Contribution |
|-----------|---------------|
| Base Item Value | 40-60% of total |
| DEF/MDEF Stats | 30-40% of total |
| Unique Passive | 20-35% of total |
| Set Bonus | 10-20% additional |
| Rarity Bonus | Multiplier (1.0-5.0x) |

### 9.2 Upgrade System

Armor can be upgraded from +1 to +10 to enhance their unique passive effects:

| Upgrade Level | Passive Enhancement | Cost Multiplier |
|---------------|--------------------|-----------------|
| +1 | +10% effect strength | 1.5x |
| +2 | +20% effect strength | 2.25x |
| +3 | +30% effect strength | 3.375x |
| +4 | +40% effect strength | 5.0625x |
| +5 | +50% effect strength | 7.59x |
| +6 | +60% effect strength | 11.39x |
| +7 | +70% effect strength | 17.09x |
| +8 | +80% effect strength | 25.63x |
| +9 | +90% effect strength | 38.45x |
| +10 | +100% effect strength | 57.67x |

---

## 10. Implementation Priority

### Phase 1: Core System
1. Armor type definitions (database schema)
2. DEF/MDEF calculation
3. Resistance calculation
4. Passive effect application

### Phase 2: Advanced Features
5. Armor mastery system
6. Set bonus system
7. Upgrade system

### Phase 3: Polish
8. Unique passive effects
9. Mastery unlocks
10. Economy balancing

---

## Appendix A: Quick Reference

### Armor Type Summary

| Armor | Category | DEF | MDEF | Movement | Key Passive |
|-------|----------|-----|------|----------|-------------|
| **Light Armor** | | | | | |
| Leather | Light | Low | Low | +10% | Swift Step |
| Studded Leather | Light | Low-Med | Low | +8% | Deflection |
| Shadow Cloak | Light | Low | Med | +12% | Shadow Walk |
| Ranger's Garb | Light | Low | Low | +15% | Trailblazer |
| **Medium Armor** | | | | | |
| Chainmail | Medium | Med | Med | 0% | Chain Guard |
| Scale Mail | Medium | Med-High | Med | -5% | Dragon Scales |
| Brigandine | Medium | Med | Med | -3% | Reactive Defense |
| Cuirass | Medium | High | Med | -5% | Heart of Lion |
| **Heavy Armor** | | | | | |
| Plate Armor | Heavy | High | Med | -15% | Iron Fortress |
| Full Plate | Heavy | Very High | Med | -20% | Armored Titan |
| Dreadnought | Heavy | Extreme | High | -25% | Unbreakable |
| Gothic Plate | High | High | High | -18% | Vampire Slayer |
| **Robes** | | | | | |
| Apprentice Robe | Robe | Low | High | +5% | Mana Shield |
| Mage's Robe | Robe | Low | Very High | +3% | Elemental Ward |
| Arcane Vestment | Robe | Low-Med | Extreme | +5% | Mana Overflow |
| Hierophant's Robe | Robe | Med | Very High | 0% | Divine Protection |
| **Shields** | | | | | |
| Kite Shield | Shield | High | Med | -10% | Standard Bearer |
| Tower Shield | Shield | Very High | High | -15% | Fortress |
| Buckler | Shield | Med | Low | -5% | Counter |
| Spirit Shield | Shield | Med | Very High | -8% | Spectral Ward |
| **Accessories** | | | | | |
| Ring of Protection | Accessory | + | + | 0% | Guardian's Blessing |
| Amulet of Vitality | Accessory | + | + | 0% | Life Force |
| Belt of Stability | Accessory | ++ | + | 0% | Rooted |
| Cloak of Evasion | Accessory | + | + | + | Phantom Step |
| Boots of Swiftness | Accessory | + | + | ++ | Wind Walker |

---

*Document Version: 1.0*
*Last Updated: 2026-02-20*

# Weapon Type System Design - Traditional System

> **System Decision**: This document uses the **Traditional System** where:
> - **Skills/Abilities**: Come from character/class only
> - **Weapons**: Provide base stats, damage types, and passive effects only
> - **Basic Attacks**: Use weapon damage type and range (always single target)

---

## 1. Overview

### 1.1 Design Goals

The Weapon Type System in Textical provides depth through equipment differentiation while maintaining class identity. Each weapon type offers:

| Aspect | Description |
|--------|-------------|
| **Damage Types** | Physical/Magical damage classification (Slash, Pierce, Blunt, etc.) |
| **Range** | Attack range (1-5 tiles based on weapon) |
| **Passive Effects** | Unique passive bonuses that trigger under conditions |
| **Elemental Affinity** | Bonus effectiveness against certain elements |
| **Inherent Stats** | Each weapon has its own base ATK/DEF/MATK values (defined in item database)

### 1.2 Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PLAYER / HERO                        │
│                  (Has Class Skills)                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    WEAPON EQUIPPED                     │
│  ┌─────────────┬──────────────┬─────────────────────┐ │
│  │ Base Stats  │  Damage      │   Passive Effects   │ │
│  │ (ATK/DEF)   │  Type        │   (No Active Skills)│ │
│  └─────────────┴──────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 BASIC ATTACK EXECUTION                 │
│         (Uses weapon damage type & range)             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    CLASS SKILL                          │
│     (Skill effect + weapon damage type bonus)          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Weapon Categories & Properties

### 2.1 Category Overview

| **Category** | Range | Primary Use | Attack Type | Resource | Base Attack Ticks |
|----------|-------|-------------|------------|----------|-------------------|
| **Melee** | 1 tile | Physical DPS/Tank | Single Target | Tick-Based | 45 - 90 Ticks |
| **Ranged** | 3-5 tiles | Physical DPS | Single Target | Tick-Based | 60 - 80 Ticks |
| **Magic** | 2-4 tiles | Magic DPS | Single Target | Mana + Ticks | 60 - 75 Ticks |
| **Shield** | 1 tile | Tank/Defense | Single Target | Tick-Based | N/A (Defensive) |
| **Unarmed** | 1 tile | Hybrid DPS | Single Target | Tick-Based | 30 - 45 Ticks |

> **Note**: Attack patterns (Line, Cone, Square, etc.) are determined by **skills**, not basic attacks. Basic attacks always target single enemies.
> **Tick System**: Characters act when their turn gauge is ready. Performing an action (like attacking) adds a "Tick Cost" (Delay) to their next turn. Weapons with lower Attack Ticks (e.g., Dagger: 35) allow characters to attack much faster than heavy weapons (e.g., War Hammer: 90).

### 2.2 Physical Damage Types

Physical weapons deal damage based on physical defense. Each type has unique properties:

| Damage Type | vs Light Armor | vs Heavy Armor | Special Property |
|-------------|----------------|----------------|-------------------|
| **Slash** | 100% | 100% | Balanced, no bonus |
| **Pierce** | 120% | 80% | High vs Light, Low vs Heavy |
| **Blunt** | 80% | 120% | High vs Heavy, Low vs Light |
| **Chop** | 130% | 70% | Very high vs Light, very low vs Heavy |
| **Crush** | 150% | 50% | Extreme vs Light, minimal vs Heavy |
| **Strike** | 90% | 110% | Slightly better vs Heavy |
| **Rend** | 100% | 100% | Applies Bleed effect (see below) |

**Armor vs Damage Type Matrix:**

```
              Light Armor    Heavy Armor    Shield
Slash            100%          100%         50%
Pierce           120%           80%         60%
Blunt             80%          120%         80%
Chop             130%           70%         40%
Crush            150%           50%         30%
Strike            90%          110%         70%
Rend             100%          100%         60%
```

### 2.3 Magical Damage Types

Weapons can have elemental affinities that affect damage effectiveness:

| Element | Bonus vs Element | Weakness |
|---------|------------------|----------|
| **NEUTRAL** | None | None |
| **FIRE** | NATURE | WATER |
| **WATER** | FIRE, EARTH | LIGHTNING, NATURE |
| **NATURE** | EARTH, WATER | FIRE |
| **EARTH** | LIGHTNING | WATER, NATURE |
| **LIGHTNING** | WATER | EARTH |
| **LIGHT** | DARK | DARK |
| **DARK** | LIGHT | LIGHT |

> Note: Elemental effectiveness follows the rules defined in `ElementalEffectivenessResolver.js`

---

## 3. Weapon Types & Unique Passives

### 3.1 Melee Weapons

#### 3.1.1 Sword (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Slash |
| **Range** | 1 tile |
| **Attack Ticks** | 60 |
| **Unique Passive 1** | Precision Strike: +10% Critical Rate when attacking from side or rear
| **Unique Passive 2** | Blade Harmony: +5% damage for each consecutive hit (max 25%), resets after 3 turns without attacking |

**Playstyle**: Balanced, good for consistent damage

---

#### 3.1.2 Greatsword (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Slash |
| **Range** | 1 tile |
| **Attack Ticks** | 80 |
| **Unique Passive 1** | Cleave: Attacks hit all enemies in front arc (adjacent tiles), +10% damage per enemy hit (max +30%)
| **Unique Passive 2** | Momentum: +15% Attack Speed after killing an enemy, stacks 2x |

**Playstyle**: High burst damage, slow attack speed

---

#### 3.1.3 Axe (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Chop |
| **Range** | 1 tile |
| **Attack Ticks** | 70 |
| **Unique Passive 1** | Cleaving Power: +25% damage vs enemies below 50% HP, 15% chance to instant-kill non-boss enemies below 20% HP
| **Unique Passive 2** | Executioner: +30% Critical Damage against enemies below 30% HP |

**Playstyle**: Executes weakened enemies

---

#### 3.1.4 Battle Axe (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Chop |
| **Range** | 1 tile |
| **Attack Ticks** | 85 |
| **Unique Passive 1** | Decapitate: +50% Critical Damage, 10% chance to cause Bleed (5% HP/turn, 3 turns)
| **Unique Passive 2** | Hemorrhage: Attacks apply Bleed, +25% damage to bleeding enemies |

**Playstyle**: High risk, high reward damage dealer

---

#### 3.1.5 Mace (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Blunt |
| **Range** | 1 tile |
| **Attack Ticks** | 65 |
| **Unique Passive 1** | Impact: 20% chance to stun for 1 turn, 30% chance vs unarmored enemies
| **Unique Passive 2** | Skull Breaker: +40% damage against stunned enemies |

**Playstyle**: Control-oriented, disrupts enemies

---

#### 3.1.6 War Hammer (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Crush |
| **Range** | 1 tile |
| **Attack Ticks** | 90 |
| **Unique Passive 1** | Shatter Defense: Ignores 30% of target's DEF, 15% chance to reduce target's DEF by 20% for 3 turns
| **Unique Passive 2** | Crushing Blow: +35% damage against armored enemies, +10% per armor piece (max +30%) |

**Playstyle**: Devastating against heavily armored foes

---

#### 3.1.7 Dagger (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 1 tile |
| **Attack Ticks** | 35 |
| **Unique Passive 1** | Backstab: +30% Critical Rate when attacking from rear, +50% Critical Damage on backstab attacks
| **Unique Passive 2** | Quick Strike: +15% Attack Speed, 10% chance to perform double attack |

**Playstyle**: Fast, crit-focused assassin

---

#### 3.1.8 Spear (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 2 tiles |
| **Attack Ticks** | 65 |
| **Unique Passive 1** | Piercing Thrust: Attacks hit 2 enemies in a line, 20% chance to pierce through (hit 3 enemies)
| **Unique Passive 2** | Phalanx: +15% DEF for each ally adjacent, +10% damage when adjacent to ally |

**Playstyle**: Control space, multi-target damage

---

#### 3.1.9 Scythe (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Rend |
| **Range** | 1 tile |
| **Attack Ticks** | 75 |
| **Unique Passive 1** | Soul Reap: All attacks apply Bleed (4% HP/turn, 3 turns)
| **Unique Passive 2** | Death Harvest: Heal 5% HP if target dies within 3 turns after applying bleed |

**Playstyle**: DoT + sustain, life steal specialist

---

#### 3.1.10 Rapier (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 1 tile |
| **Attack Ticks** | 45 |
| **Unique Passive 1** | Duelist's Pride: +25% damage if only 1 target within 2 tile radius
| **Unique Passive 2** | Elegant Footwork: +15% dodge after attacking, +10% evasion per attack (max 30%), +5% counter attack |

**Playstyle**: 1v1 duelist, evasion tank

---

### 3.2 Ranged Weapons

#### 3.2.1 Bow

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 4 tiles |
| **Attack Ticks** | 60 |
| **Unique Passive 1** | Eagle Eye: Attacks cannot be dodged (100% accuracy), +15% Critical Rate at max range
| **Unique Passive 2** | Rain of Arrows: 25% chance to fire an additional arrow at nearby enemy |

**Playstyle**: Consistent ranged damage

---

#### 3.2.2 Longbow

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 5 tiles |
| **Attack Ticks** | 80 |
| **Unique Passive 1** | Sniping: +50% Critical Damage at max range, can attack over obstacles
| **Unique Passive 2** | Steady Hand: +10% accuracy for each turn not attacking (max 30%), +5% crit per stack |

**Playstyle**: Long-range sniper

---

#### 3.2.3 Crossbow

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 3 tiles |
| **Attack Ticks** | 75 |
| **Unique Passive 1** | Armor Piercing: Ignores 30% of target's DEF, 20% chance to cause Slow for 2 turns
| **Unique Passive 2** | Heavy Bolt: +25% damage, -5% Attack Speed, +10% stun chance |

**Playstyle**: Anti-armor ranged

---

#### 3.2.4 Thrown Weapons

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 3 tiles |
| **Attack Ticks** | 45 |
| **Unique Passive 1** | Ricochet: 30% chance to bounce to nearby enemy, can hit up to 3 enemies per throw
| **Unique Passive 2** | Volley: Can target up to 2 enemies simultaneously, +15% damage per target |

**Playstyle**: Multi-target ranged

---

### 3.3 Magic Weapons

#### 3.3.1 Wand (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Magical (Element based) |
| **Range** | 2 tiles |
| **Attack Ticks** | 60 |
| **Unique Passive 1** | Arcane Focus: +12% Critical Rate, +25% Mana regeneration
| **Unique Passive 2** | Mana Surge: 20% chance to not consume mana on spell cast, +10% spell damage |

**Playstyle**: Balanced magical DPS

---

#### 3.3.2 Orb (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Magical (Element based) |
| **Range** | 2 tiles |
| **Attack Ticks** | 65 |
| **Unique Passive 1** | Arcane Ward: Creates shield equal to 15% of MATK after each attack, shield persists for 2 turns
| **Unique Passive 2** | Spell Shield: +20% Magic DEF, reflects 15% magic damage |

**Playstyle**: Magical tank/support

---

#### 3.3.3 Tome (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Magical (Element based) |
| **Range** | 2 tiles |
| **Attack Ticks** | 75 |
| **Unique Passive 1** | Spell Amplification: +30% damage for all spells, -10% cooldown for all skills
| **Unique Passive 2** | Knowledge Power: +25% experience gain from combat |

**Playstyle**: Heavy magical damage dealer

---

#### 3.3.4 Staff (Two-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Magical (Element based) |
| **Range** | 2-3 tiles |
| **Attack Ticks** | 70 |
| **Unique Passive 1** | Elemental Mastery: Basic attacks inherit weapon's element, +20% damage effectiveness against weakness element
| **Unique Passive 2** | Channeling: +15% spell duration, +15% Mana efficiency |

**Playstyle**: Magical hybrid, elemental damage

---

#### 3.3.5 Catalyst (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Magical (Element based) |
| **Range** | 2 tiles |
| **Attack Ticks** | 65 |
| **Unique Passive 1** | Overcharge: +35% skill damage, -15% mana regen
| **Unique Passive 2** | Arcane Amplification: +25% Critical Damage, -8% accuracy |

**Playstyle**: Glass cannon - extreme damage, no defense

---

### 3.4 Shield Weapons

#### 3.4.1 Shield (One-Handed)

| Property | Value |
|----------|-------|
| **Damage Type** | Blunt |
| **Range** | 1 tile |
| **Attack Ticks** | N/A |
| **Unique Passive 1** | Block: 25% chance to block incoming attacks, block reduces damage by 50%, +12% DEF when below 50% HP
| **Unique Passive 2** | Iron Will: +20% Magic DEF, -15% chance to be stunned |

**Playstyle**: Defensive tank

---

#### 3.4.2 Tower Shield

| Property | Value |
|----------|-------|
| **Damage Type** | Blunt |
| **Range** | 1 tile |
| **Attack Ticks** | N/A |
| **Unique Passive 1** | Fortress: 35% chance to block incoming attacks, block reduces damage by 75%, protects adjacent allies (15% damage reduction)
| **Unique Passive 2** | Impenetrable: +30% DEF when adjacent to ally, -25% movement speed |

**Playstyle**: Ultimate defensive tank

---

#### 3.4.3 Buckler

| Property | Value |
|----------|-------|
| **Damage Type** | Blunt |
| **Range** | 1 tile |
| **Attack Ticks** | N/A |
| **Unique Passive 1** | Counter: 20% chance to counterattack when blocking, +25% Counter Damage, enables counterattack reactions
| **Unique Passive 2** | Reflex: +12% Dodge, +7% Counter Attack Rate per successful block (max 25%) |

**Playstyle**: Offensive tank, reactive combat

---

### 3.5 Unarmed Weapons

#### 3.5.1 Gloves

| Property | Value |
|----------|-------|
| **Damage Type** | Strike |
| **Range** | 1 tile |
| **Attack Ticks** | 30 |
| **Unique Passive 1** | Flurry: 35% chance to perform extra attack, extra attack deals 50% damage
| **Unique Passive 2** | Combination: +7% damage for each different attack used in sequence (max 25%) |

**Playstyle**: Fast, combo-oriented

---

#### 3.5.2 Brass Knuckles

| Property | Value |
|----------|-------|
| **Damage Type** | Strike |
| **Range** | 1 tile |
| **Attack Ticks** | 45 |
| **Unique Passive 1** | Stun Punch: 30% chance to stun for 1 turn, 45% chance to stun when below 30% HP
| **Unique Passive 2** | Iron Fist: +18% damage, reduces incoming melee damage by 12% |

**Playstyle**: Stun-focused brawler

---

#### 3.5.3 Claws

| Property | Value |
|----------|-------|
| **Damage Type** | Rend |
| **Range** | 1 tile |
| **Attack Ticks** | 35 |
| **Unique Passive 1** | Rending Claws: All attacks cause Bleed (4% HP/turn, 3 turns), +25% damage to Bleeding enemies
| **Unique Passive 2** | Predator: +30% damage when enemy has negative status, +12% lifesteal |

**Playstyle**: DoT (Damage over Time) specialist

---

#### 3.5.4 Kaginawa (Grappling Hook)

| Property | Value |
|----------|-------|
| **Damage Type** | Pierce |
| **Range** | 2 tiles |
| **Attack Ticks** | 40 |
| **Unique Passive 1** | Pull: 35% chance to pull enemy toward you, pulled enemies cannot act for 1 turn
| **Unique Passive 2** | Grappling Hook: Can attack enemies 1 tile away, +25% Critical Rate on pulled enemies |

**Playstyle**: Mobility and control

---

## 4. Combat State Machine

### 4.1 Attack Execution Flow

```
┌─────────────┐
│   IDLE      │◄────────────────────────────────────────┐
│  (Ready)    │                                         │
└──────┬──────┘                                         │
       │ Turn starts                                    │
       ▼                                                 │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
│  SELECTING  │────►│  EXECUTING  │────►│   COOLDOWN  │─┘
│   ACTION    │     │   ATTACK    │     │   (Delayed) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       
       │ Basic Attack                           
       ▼                                        
┌─────────────┐                              
│ WEAPON      │                              
│ RESOLUTION  │──── (Apply weapon base stats)  
└─────────────┘
```

### 4.2 Combat States

| State | Description | Transitions |
|-------|-------------|-------------|
| **IDLE** | Unit ready to act | → SELECTING |
| **SELECTING** | Choosing action (attack/skill) | → EXECUTING, → IDLE (cancel) |
| **EXECUTING** | Performing attack animation | → COOLDOWN |
| **COOLDOWN** | Recovery between actions | → IDLE |
| **STUNNED** | Cannot act | → IDLE (when recovered) |
| **CHANNELING** | Casting long spell | → EXECUTING, → IDLE (interrupted) |

---

## 5. Damage Resolution System

### 5.1 Damage Formula

```
Final Damage = Base Damage × Weapon Modifier × Damage Type Factor × Elemental Factor
```

| Component | Source |
|-----------|--------|
| **Base Damage** | Hero ATK/MATK - Enemy DEF/MDEF |
| **Weapon Modifier** | Weapon's base ATK/MATK value |
| **Damage Type Factor** | Armor type vs damage type (see 2.2) |
| **Elemental Factor** | Element effectiveness (see 2.3) |

### 5.2 Damage Type Modifiers

```javascript
const DAMAGE_TYPE_MODIFIERS = {
    // vs Light Armor, vs Heavy Armor
    'SLASH':   { light: 1.0,  heavy: 1.0 },
    'PIERCE':  { light: 1.2,  heavy: 0.8 },
    'BLUNT':   { light: 0.8,  heavy: 1.2 },
    'CHOP':    { light: 1.3,  heavy: 0.7 },
    'CRUSH':   { light: 1.5,  heavy: 0.5 },
    'STRIKE':  { light: 0.9,  heavy: 1.1 },
    'REND':    { light: 1.0,  heavy: 1.0 }
};
```

---

## 6. Pattern & Targeting System

> **Note**: Attack patterns are determined by **skills**, not weapon types. Basic attacks always target a single enemy. This section describes patterns available through skill usage.

### 6.1 Attack Patterns (Skill-Based)

| Pattern | Shape | Description |
|---------|-------|-------------|
| **Single** | 1 tile | Single target |
| **Line** | 3 tiles, straight | All enemies in a straight line |
| **Cone** | 3 tiles, arc | Enemies in a cone/arc area |
| **Square** | 3x3 area | All enemies in a square area |
| **Circle** | radius 2 | All surrounding enemies |
| **Diamond** | 5 tiles | Diamond-shaped area |

> Patterns are unlocked through class skills, not weapon mastery.

### 6.2 Pattern Implementation

```javascript
const ATTACK_PATTERNS = {
    SINGLE: (origin, direction) => [getTile(origin, direction, 1)],
    LINE: (origin, direction) => [
        getTile(origin, direction, 1),
        getTile(origin, direction, 2),
        getTile(origin, direction, 3)
    ],
    CONE: (origin, direction) => {
        // 3 tiles wide at end, 1 tile at origin
        return getConeTiles(origin, direction, 3);
    },
    // ... etc
};
```

---

## 7. Passive Effect System

### 7.1 Passive Categories

| Category | Trigger | Example |
|----------|---------|---------|
| **On Attack** | When attacking | +10% Crit on backstab |
| **On Hit** | When damaging enemy | Bleed on Rend |
| **On Defend** | When being attacked | Block chance |
| **On Kill** | When defeating enemy | +10% ATK for 3 turns |
| **Conditional** | Under specific conditions | +50% Crit at max range |

### 7.2 Passive Stack Rules

| Type | Stack Rule |
|------|------------|
| **Conditional Bonuses** | Multiplicative (e.g., 1.1 × 1.15 = 1.265) |
| **Chance-based** | Roll each trigger independently |
| **Unique Passives** | Only one of same name active |

---

## 8. Mastery & Progression System

### 8.1 Weapon Mastery Trees

Each weapon type has 10 mastery levels:

| Level | Requirement | Bonus |
|-------|-------------|-------|
| **1. Novice** | 0 XP | Basic weapon proficiency |
| **2. Beginner** | 50 XP | +2% Damage |
| **3. Amateur** | 150 XP | +4% Damage |
| **4. Competent** | 400 XP | +6% Damage |
| **5. Proficient** | 800 XP | **Unique passive enhancement** |
| **6. Advanced** | 1,500 XP | +8% Damage |
| **7. Veteran** | 3,000 XP | +10% Damage |
| **8. Elite** | 5,000 XP | +10% Damage, +3% Crit |
| **9. Master** | 8,000 XP | +12% Damage, +5% Crit |
| **10. Legendary** | 15,000 XP | +15% Damage, +7% Crit |

### 8.2 Mastery XP Gain

| Action | XP Gain |
|--------|---------|
| Hit enemy with weapon | +1 XP per damage dealt |
| Kill enemy with weapon | +10 XP per enemy level |
| Win combat | +50 XP |

---

## 9. Economy Integration

### 9.1 Weapon Value Components

| Component | Contribution |
|-----------|---------------|
| Base Item Value | 50-70% of total |
| Unique Passive | 30-50% of total |
| Rarity Bonus | Multiplier (1.0-5.0x) |

### 9.2 Upgrade System

Weapons can be upgraded from +1 to +10 to enhance their unique passive effects. This applies to ALL weapon categories:

| Category | Example Weapons | What Gets Enhanced |
|----------|----------------|-------------------|
| **Melee** | Sword, Axe, Dagger | Backstab, Cleaving Power, etc. |
| **Ranged** | Bow, Crossbow | Eagle Eye, Armor Piercing, etc. |
| **Magic** | Wand, Orb, Tome | Arcane Focus, Arcane Ward, Spell Amplification |
| **Shield** | Shield, Tower Shield | Block, Fortress, etc. |
| **Unarmed** | Gloves, Claws | Flurry, Rending Claws, etc. |

**Upgrade Effects by Weapon Type:**

- **Melee (e.g., Dagger)**: Backstab +30% Crit Rate → +40%, +50%, etc. with upgrade
- **Ranged (e.g., Bow)**: Eagle Eye +15% Crit → +25%, +35%, etc. with upgrade
- **Magic (e.g., Wand)**: Arcane Focus +10% Crit Rate → +20%, +30%, etc. with upgrade
- **Magic (e.g., Orb)**: Arcane Ward 10% MATK shield → +20%, +30%, etc. with upgrade
- **Shield (e.g., Shield)**: Block 20% chance → +30%, +40%, etc. with upgrade
- **Unarmed (e.g., Gloves)**: Flurry 30% extra attack → +40%, +50%, etc. with upgrade

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
1. Weapon type definitions (database schema)
2. Basic attack execution (single target)
3. Damage type resolution
4. Passive effect application

### Phase 2: Advanced Features
5. Weapon mastery system
6. Elemental affinity
7. Upgrade system

### Phase 3: Polish
8. Unique passive effects
9. Mastery unlocks
10. Economy balancing

---

## Appendix A: Quick Reference

> **Note**: For detailed weapon data (base stats, tiers, levels, rarity), see [WEAPON_DATA_REFERENCE.md](./WEAPON_DATA_REFERENCE.md)

### Weapon Type Summary

| Weapon | Category | Damage | Range | Key Passive |
|--------|----------|--------|-------|-------------|
| **Melee** | | | | |
| Sword | Melee | Slash | 1 | Precision Strike |
| Greatsword | Melee | Slash | 1 | Cleave |
| Axe | Melee | Chop | 1 | Cleaving Power |
| Battle Axe | Melee | Chop | 1 | Decapitate |
| Mace | Melee | Blunt | 1 | Impact |
| War Hammer | Melee | Crush | 1 | Shatter Defense |
| Dagger | Melee | Pierce | 1 | Backstab |
| Spear | Melee | Pierce | 2 | Piercing Thrust |
| Scythe | Melee | Rend | 1 | Soul Reap |
| **Ranged** | | | | |
| Bow | Ranged | Pierce | 4 | Eagle Eye |
| Longbow | Ranged | Pierce | 5 | Sniping |
| Crossbow | Ranged | Pierce | 3 | Armor Piercing |
| Thrown | Ranged | Pierce | 3 | Ricochet |
| **Magic** | | | | |
| Wand | Magic | Magical | 2 | Arcane Focus |
| Orb | Magic | Magical | 2 | Arcane Ward |
| Tome | Magic | Magical | 2 | Spell Amplification |
| Staff | Magic | Magical | 2-3 | Elemental Mastery |
| Catalyst | Magic | Magical | 2 | Overcharge |
| **Shield** | | | | |
| Shield | Shield | Blunt | 1 | Block |
| Tower Shield | Shield | Blunt | 1 | Fortress |
| Buckler | Shield | Blunt | 1 | Counter |
| **Unarmed** | | | | |
| Gloves | Unarmed | Strike | 1 | Flurry |
| Brass Knuckles | Unarmed | Strike | 1 | Stun Punch |
| Claws | Unarmed | Rend | 1 | Rending Claws |
| Kaginawa | Unarmed | Pierce | 2 | Pull |

---

*Document Version: 2.1 (Revised - Aligned with WEAPON_DATA_REFERENCE.md)*
*Last Updated: 2026-02-20*

# Combat System Analysis & New Class Proposals

## Executive Summary

This document provides an in-depth analysis of Textical's combat system mechanics and proposes five unique character classes that fill existing gaps in the current class roster. The analysis covers damage calculation, elemental interactions, skill systems, status effects, defensive mechanics, and the traits/hooks system.

---

# Part I: Combat System Analysis

## 1. Core Combat Mechanics

### 1.1 Damage Formula

The combat system uses the following damage calculation flow ([`server/src/logic/combatRules.js:26`](server/src/logic/combatRules.js:26)):

```
Final Damage = floor(max(1, (Attack × DamageMult × ElementalMult) - EffectiveDefense))
```

Where:
- **Attack**: Base attack_damage from attacker
- **DamageMult**: Skill multiplier or attack multiplier
- **ElementalMult**: Elemental effectiveness multiplier
- **EffectiveDefense**: `defense - armor_penetration` (minimum 0)

### 1.2 Combat Stats System

| Stat | Function | Typical Range |
|------|----------|---------------|
| `health_max` | Maximum HP | 100-99999 |
| `mana_max` | Maximum MP for skills | 0-99999 |
| `attack_damage` | Physical damage output | 10-99999 |
| `defense` | Physical damage mitigation | 0-99999 |
| `magic_attack` | Magic damage output | 0-99999 |
| `magic_defense` | Magic damage mitigation | 0-99999 |
| `speed` | Turn order/initiative | 1-9999 |
| `accuracy` | Hit chance base (100 default) | 0-200 |
| `dodge_rate` | Evasion chance | 0-75% |
| `crit_chance` | Critical hit probability (5% default) | 0-100% |
| `crit_damage` | Critical multiplier (1.5x default) | 1.0-5.0 |
| `block_chance` | Shield block probability | 0-75% |
| `parry_chance` | Weapon parry probability | 0-50% |
| `block_power` | Block damage reduction (0.5 default) | 0-1.0 |
| `armor_penetration` | Defense ignore | 0-9999 |

### 1.3 Hit, Critical, and Block Resolution

The system uses [`CombatFormulaResolver`](server/src/logic/rules/CombatFormulaResolver.js:1) for all combat calculations:

**Hit Chance** ([line 15](server/src/logic/rules/CombatFormulaResolver.js:15)):
```
FinalHitChance = Accuracy - DodgeRate + DirectionalBonus - StealthPenalty
```

**Critical Hit** ([line 45](server/src/logic/rules/CombatFormulaResolver.js:45)):
```
CritChance = min(1.0, crit_chance + directionalBonus/400 + traitMods)
CritDamage = crit_damage + traitMods
```

**Block/Parry Priority** ([line 73](server/src/logic/rules/CombatFormulaResolver.js:73)):
1. Parry first (75% cap) → 75% damage reduction
2. Then Block (50% cap) → BlockPower damage reduction

---

## 2. Elemental System

### 2.1 Elements (from [`ElementalEffectivenessResolver.js:6`](server/src/logic/rules/ElementalEffectivenessResolver.js:6))

```javascript
ELEMENTS = { 
    NEUTRAL: 0, FIRE: 1, WATER: 2, NATURE: 3, 
    EARTH: 4, LIGHTNING: 5, LIGHT: 6, DARK: 7 
}
```

### 2.2 Elemental Effectiveness Matrix

| Attacker → | Neutral | Fire | Water | Nature | Earth | Lightning | Light | Dark |
|------------|---------|------|-------|--------|-------|-----------|-------|------|
| **Neutral** | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| **Fire** | 1.0 | 0.5 | 0.5 | **1.5** | 1.0 | 1.0 | 1.0 | 1.0 |
| **Water** | 1.0 | **1.5** | 0.5 | 1.0 | 1.0 | 0.5 | 1.0 | 1.0 |
| **Nature** | 1.0 | 0.5 | 1.0 | 0.5 | **1.5** | 1.0 | 1.0 | 1.0 |
| **Earth** | 1.0 | 1.0 | 1.0 | 0.5 | 0.5 | **1.5** | 1.0 | 1.0 |
| **Lightning**| 1.0 | 1.0 | **1.5** | 1.0 | 0.5 | 0.5 | 1.0 | 1.0 |
| **Light** | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | **1.5** |
| **Dark** | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | **1.5** | 1.0 |

### 2.3 Environmental Modifiers

```javascript
ENVIRONMENTAL_MODIFIERS = {
    DAY:   { LIGHT: 1.25, DARK: 0.75 },
    NIGHT: { LIGHT: 0.75, DARK: 1.25 },
    DUSK:  { LIGHT: 0.90, DARK: 1.10 },
    DAWN:  { LIGHT: 1.10, DARK: 0.90 }
}
```

### 2.4 Type Bonuses

- **Light vs Undead/Demon**: 1.5x damage
- **Dark vs Undead/Demon**: 1.0x (no bonus)

---

## 3. Skill System

### 3.1 Skill Types

| Type | Function | Example |
|------|----------|---------|
| `DAMAGE` | Direct damage to target | Fireball |
| `HEAL` | Restore HP to target | Healing Grace |
| `BUFF` | Apply stat modifiers | Divine Shield |
| `SUPPORT` | Utility effects | Buffs |
| `DEBUFF` | Apply negative effects | Poison |

### 3.2 Skill Execution Flow ([`skillExecutor.js:15`](server/src/logic/rules/skillExecutor.js:15))

1. Execute pre-attack hooks (`onPreAttack`)
2. Calculate damage with mastery bonuses
3. Apply damage/heal to target
4. Execute post-attack hooks (`onPostHit`, `onHealthRegen`)
5. Apply status effects if specified
6. Consume mana costs

### 3.3 AOE Patterns

Supported patterns: `SQUARE`, `LINE`, `CROSS`, `CIRCLE` (via [`SkillResolver.js:27`](server/src/logic/rules/SkillResolver.js:27))

---

## 4. Status Effects

### 4.1 Existing Status Effects

| Status | Effect | Duration |
|--------|--------|----------|
| `STUN` | Skip turn | 1 tick |
| `BURN` | DoT damage | 3 ticks |
| `WET` | 25% more Lightning damage | 3 ticks |
| `LEADEN` | 30% action delay | 3 ticks |
| `STEALTH` | 30-50% hit chance reduction | 2 ticks |
| `SHIELD` | Absorb damage | Variable |
| `LINKED` | Share damage with ally | 3 ticks |
| `FEAR` | Cannot attack | 3 ticks |

---

## 5. Traits & Hook System

### 5.1 Trait Hooks (from [`traitService.js:24`](server/src/logic/services/traitService.js:24))

**Battle Lifecycle**:
- `onBattleStart` - Battle initialization
- `onRoundStart` - Every 100 ticks
- `onRoundEnd` - Round completion
- `onBattleEnd` - Battle conclusion

**Combat Hooks**:
- `onPreAttack` - Before attacking
- `onPreDefend` - Before defending
- `onTakeDamage` - When taking damage
- `onPostHit` - After landing hit
- `onPostAttack` - After completing attack
- `onHealthRegen` - When healing
- `onParry` - On successful parry
- `onBlock` - On successful block
- `onKill` - On defeating enemy

**Calculation Hooks**:
- `onCalculateHitChance` - Modify hit calculation
- `onCalculateCrit` - Modify crit calculation
- `onCalculateBlock` - Modify block/parry
- `onCalculateDodgeChance` - Modify dodge

---

## 6. Current Class Archetypes

### 6.1 Tier 1 (Base Classes)
| Class | Role | Primary Stat | Style |
|-------|------|--------------|-------|
| Warrior | Tank | Defense | Melee |
| Scout | Striker | Speed | Melee/Ranged |
| Apprentice | Mage | Magic Attack | Ranged |
| Votary | Bruiser | HP | Melee |
| Brute | Juggernaut | Attack | Melee |
| Duelist | Assassin | Crit | Melee |
| Archer | Ranger | Speed | Ranged |

### 6.2 Tier 2 (Advanced Classes)
| Class | Role | Primary Stat | Style |
|-------|------|--------------|-------|
| Knight | Tank | Defense | Melee |
| Rogue | Assassin | Crit | Melee |
| Wizard | Blaster | Magic Attack | Ranged |

### 6.3 Tier 3 (Master Classes)
| Class | Role | Primary Stat | Style |
|-------|------|--------------|-------|
| Lord Commander | Leader | Mixed | Hybrid |
| Archmage | Master Mage | Magic Attack | Ranged |

### 6.4 Hero Examples (from [`heroes.json`](client/assets/data/heroes.json))
- **Paladin** (Aldric): Balanced tank/DPS with Light affinity
- **Mage** (Lyra): Pure magic damage dealer
- **Rogue** (Garret): High crit/evasion assassin
- **Warrior** (Thorin): Basic tank
- **Cleric** (Seraphina): Healer/support

---

# Part II: New Class Proposals

## Design Philosophy

Based on the combat system analysis, I've identified several gaps and opportunities:

1. **No dedicated Support/Enchanter class** - Cleric fills healer role but no buffer
2. **No Summoner/Beastmaster** - No class leverages pets/summons
3. **No elemental specialist** - No class focused on elemental combos
4. **No battlefield controller** - No class focused on terrain/positioning
5. **No berserker/blood mage hybrid** - No life-steal or self-damaging class

---

## Proposal 1: Spiritist (Summoner/Support)

### Overview
The **Spiritist** is a unique class that summons ethereal companions to fight alongside them. Unlike other classes that rely on personalstats, the Spiritist enhances their summoned spirits while providing support to allies.

### Role in Team Composition
- **Secondary Healer**: Provides healing through spirits
- **Support Buffer**: Buffs allies with spirit links
- **Flex Summoner**: Summons different spirits for different situations
- **Debuffer**: Applies curses to enemies

### Core Mechanics

**Spirit Bond System**
- Spiritist doesn't attack directly; instead, they command spirits
- Spirits inherit a percentage of the Spiritist's stats
- Different spirit types provide different tactical options

**Spirit Types**:
| Spirit | Role | Element | Special Ability |
|--------|------|---------|-----------------|
| Flame Wisp | DPS | Fire | Burns enemies |
| Frost Wisp | Control | Water | Wets enemies |
| Stone Golem | Tank | Earth | High defense |
| Storm Wisp | Burst | Lightning | Chains to wet targets |
| Shadow Wisp | Assassin | Dark | Applies Shadow Affliction |

### Skill Set

**Tier 1 (Apprentice → Spiritist)**
1. **Summon Wisp** (Active): Summon a basic wisp companion (MP: 30)
2. **Spirit Link** (Active): Bond with ally, share damage 30% (MP: 20)
3. **Ethereal Lash** (Active): Command wisp to attack (MP: 15)

**Tier 2 (Spiritist → Etherealist)**
4. **Elemental Covenant** (Passive): +15% all element damage for summons
5. **Soul Harvest** (Passive): Gain MP when summons kill enemies
6. **Mass Summon** (Active): Summon 2 spirits at once (MP: 60)

**Tier 3 (Etherealist → Spirit Archon)**
7. **Spirit Fusion** (Ultimate): Merge all summons into one powerful entity
8. **Phasing** (Passive): Spiritist takes 20% less damage when spirits alive
9. **Ethereal Inheritance** (Passive): Dead spirits transfer stats to new summons

### Statistics & Growth

| Stat | Base | Growth | Priority |
|------|------|--------|----------|
| HP | 1200 | +80/lvl | Medium |
| MP | 800 | +60/lvl | **High** |
| Magic Attack | 200 | +25/lvl | **High** |
| Magic Defense | 250 | +20/lvl | Medium |
| Speed | 90 | +5/lvl | Medium |
| Defense | 150 | +10/lvl | Low |

### Build Paths

**Support Build** (Spirit Healer):
- Focus: Magic Attack, MP
- Key Stats: Healing Power, MP Regen
- Playstyle: Keep spirits alive, heal allies through Spirit Link

**Damage Build** (Spirit Lord):
- Focus: Magic Attack, Speed
- Key Stats: Elemental Damage, Crit Chance
- Playstyle: Aggressive summoning, sacrifice spirits for burst

### Gaps Filled
- First true summoner class
- Support through non-healer means
- Elemental combo enabler (Wisp combinations)

---

## Proposal 2: Chronomancer (Time Controller)

### Overview
The **Chronomancer** manipulates time itself on the battlefield. They can speed up allies, slow enemies, reset cooldowns, and even briefly reverse damage taken.

### Role in Team Composition
- **Battlefield Controller**: Manipulates turn order and action timing
- **Utility Caster**: Time-based buffs and debuffs
- **Sustained DPS**: Low damage but high uptime
- **Save Mechanic**: Can prevent lethal damage

### Core Mechanics

**Time Manipulation System**
- Each ability affects time/counts rather than dealing direct damage
- Time Dilation: Extend buff durations on allies
- Time Slow: Apply action delays to enemies
- Time Rewind: Reset cooldowns or reverse recent damage

**Temporal Energy (Resource)**
- Instead of MP, uses Temporal Energy (max 500)
- Regenerates 10/tick
- Abilities cost TE instead of scaling MP costs

### Skill Set

**Tier 1 (Apprentice → Chronomancer)**
1. **Hasten** (Active): Target ally acts sooner +20 speed for 3 ticks (TE: 40)
2. **Temporal Slow** (Active): Enemy -30% speed for 4 ticks (TE: 35)
3. **Momentary Glimpse** (Passive): +10% accuracy

**Tier 2 (Chronomancer → Time Warden)**
4. **Chronoshift** (Active): Reset single ally's cooldown (TE: 100)
5. **Time Lock** (Active): Stun enemy for 1 tick but they skip next turn (TE: 80)
6. **Temporal Echo** (Passive): When ally dies, revive with 25% HP once per battle

**Tier 3 (Time Warden → Chronos Sovereign)**
7. **Temporal Rift** (Ultimate): All enemies -50% speed, all allies +50% speed for 5 ticks (TE: 200)
8. **Precognition** (Passive): 25% chance to dodge any attack
9. **Time Fracture** (Passive): Critical hits apply 2-turn Slow

### Statistics & Growth

| Stat | Base | Growth | Priority |
|------|------|--------|----------|
| HP | 1400 | +90/lvl | Medium |
| MP/TE | 500 | +30/lvl | **High** |
| Magic Attack | 180 | +20/lvl | Medium |
| Magic Defense | 300 | +25/lvl | **High** |
| Speed | 110 | +8/lvl | **High** |
| Defense | 180 | +12/lvl | Low |

### Build Paths

**Control Build** (Time Binder):
- Focus: Speed, Magic Defense
- Key Stats: Slow duration, Stun chance
- Playstyle: Maximize enemy action delays

**Utility Build** (Temporal Architect):
- Focus: Magic Attack, TE pool
- Key Stats: Cooldown reduction, buff duration
- Playstyle: Keep allies performing optimally

### Gaps Filled
- First pure controller class
- Time manipulation niche
- Unique resource system (Temporal Energy)

---

## Proposal 3: Dreadknight (Life-Steal Bruiser)

### Overview
The **Drain Knight** (later **Dreadknight**) is a melee fighter who trades health for power. They deal massive damage but sustain themselves through life steal, making them self-sufficient but risky to play.

### Role in Team Composition
- **Sustained DPS**: High damage over time
- **Self-Healer**: Through life steal
- **Tank Shredder**: High single-target damage
- **Risk/Reward Playstyle**: High damage = high risk

### Core Mechanics

**Blood Covenant System**
- Dreadknight's attacks have inherent life steal
- Can "charge up" abilities by sacrificing own HP
- Higher risk = higher reward mechanics

**Blood Meter (Secondary Resource)**
- Max 100 Blood
- Generated by dealing/taking damage
- Powers special abilities

### Skill Set

**Tier 1 (Warrior → Dreadknight)**
1. **Vampiric Strike** (Active): Attack + 20% life steal (Blood: 20)
2. **Blood Rage** (Active): +40% damage, -10% defense for 3 ticks (Blood: 30)
3. **Sanguine Ward** (Passive): +15% life steal on attacks

**Tier 2 (Dreadknight → Blood Reaver)**
4. **Death's Embrace** (Active): Heal for damage dealt for 4 ticks (Blood: 50)
5. **Crimson Barrage** (Active): 3 quick attacks, costs health (Blood: 40)
6. **Hemophagy** (Passive): +25% life steal when below 30% HP

**Tier 3 (Blood Reaver → Dreadlord)**
7. **Blood Fountain** (Ultimate): Deal 500 damage to self, deal 2x that to enemy (Blood: 100)
8. **Undeath's Blessing** (Passive): Cannot die below 1 HP once per battle
9. **Terror Reaper** (Passive): Attacks cause Fear to enemies below 25% HP

### Statistics & Growth

| Stat | Base | Growth | Priority |
|------|------|--------|----------|
| HP | 2000 | +120/lvl | **High** |
| MP | 250 | +15/lvl | Low |
| Attack | 350 | +30/lvl | **High** |
| Defense | 250 | +15/lvl | Medium |
| Crit Chance | 15% | +1%/lvl | Medium |
| Life Steal | 10% | +1%/lvl | **High** |

### Build Paths

**Sustain Build** (Blood Tank):
- Focus: HP, Defense, Life Steal
- Key Stats: Damage reduction, healing multiplier
- Playstyle: Stay alive through sustain

**Glass Cannon Build** (Death Dealer):
- Focus: Attack, Crit, Life Steal
- Key Stats: Crit damage, attack speed
- Playstyle: Maximize burst, heal through kills

### Gaps Filled
- First life-steal focused class
- Risk/reward melee mechanic
- Self-damaging ultimate abilities

---

## Proposal 4: Tempest (Elemental Storm Caster)

### Overview
The **Tempest** is an elemental specialist who combos multiple elements together. Unlike the Wizard's raw power, the Tempest focuses on applying elemental debuffs and chaining elemental reactions.

### Role in Team Composition
- **Elemental Enabler**: Applies WET, Burning for team
- **AOE Controller**: Zone control through elements
- **Reactive DPS**: Damage scales off enemy status
- **Utility Caster**: Multiple element support

### Core Mechanics

**Elemental Reaction System**
- Tempest's skills apply elemental states
- Enemies with elemental states take bonus damage from appropriate elements
- Combo system: Stack elements for multiplicative effects

**Elemental States**:
| State | Applied By | Synergy Bonus |
|-------|------------|---------------|
| BURNING | Fire | +25% Fire damage taken |
| WET | Water | +50% Lightning damage taken |
| EARTHEN | Earth | +25% Physical damage taken |
| SHOCKED | Lightning | Cannot act 1 tick |

### Skill Set

**Tier 1 (Apprentice → Tempest)**
1. **Steam Blast** (Active): Fire + Water = AOE damage, applies WET (MP: 25)
2. **Storm Cloud** (Active): Lightning to area, applies SHOCKED (MP: 30)
3. **Elemental Attunement** (Passive): +10% all elemental damage

**Tier 2 (Tempest → Stormbringer)**
4. **Thunderfall** (Active): If target WET, 2x damage + Stun (MP: 50)
5. **Magma Eruption** (Active): Earth + Fire, applies BURNING (MP: 45)
6. **Elemental Synergy** (Passive): Combo skills cost 20% less MP

**Tier 3 (Stormbringer → Elemental Sovereign)**
7. **Cataclysm** (Ultimate): All elements in 5x5 area, applies all states (MP: 150)
8. **Eye of the Storm** (Passive): Allies in 3-tile radius +15% elemental damage
9. **Elemental Mastery** (Passive): All elemental multipliers +25%

### Statistics & Growth

| Stat | Base | Growth | Priority |
|------|------|--------|----------|
| HP | 1300 | +70/lvl | Medium |
| MP | 900 | +55/lvl | **High** |
| Magic Attack | 350 | +30/lvl | **High** |
| Magic Defense | 280 | +20/lvl | Medium |
| Speed | 100 | +6/lvl | Medium |
| Elemental Bonus | 15% | +2%/lvl | **High** |

### Build Paths

**Combo Build** (Reactive Tempest):
- Focus: Magic Attack, Elemental Bonus
- Key Stats: Status duration, combo multiplier
- Playstyle: Apply states, then detonate

**AOE Build** (Storm Caller):
- Focus: MP, Magic Attack
- Key Stats: AOE size, AOE damage
- Playstyle: Control battlefield zones

### Gaps Filled
- First elemental combo class
- Elemental debuff specialist
- Team elemental enabler

---

## Proposal 5: Bulwark (Position-Based Defender)

### Overview
The **Bulwark** is a defensive specialist who controls the battlefield through positioning. They create protected zones, redirect attacks from allies, and become more powerful when defending chokepoints.

### Role in Team Composition
- **Main Tank**: Primary defender
- **Area Denial**: Controls movement
- **Ally Protector**: Redirects damage
- **Position Master**: Benefits from地形

### Core Mechanics

**Shield Wall System**
- Bulwark doesn't just block; they create defensive zones
- Standing behind Bulwark grants allies defense bonus
- Bulwark gains bonuses based on adjacent allies

**Guardian Positions**:
| Position | Bonus |
|----------|-------|
| Adjacent to ally | +20% defense |
| Near wall/terrain | +15% block chance |
| Surrounded by enemies | +30% damage (taunt) |
| No allies nearby | Self-buff |

### Skill Set

**Tier 1 (Votary → Bulwark)**
1. **Shield Wall** (Active): Create 2-tile zone, allies inside +30% defense (MP: 30)
2. **Intervene** (Active): Redirect next attack on ally to self (MP: 25)
3. **Fortify** (Passive): +15% defense when no allies within 3 tiles

**Tier 2 (Bulwark → Iron Sentinel)**
4. **Bulwark's Bulwark** (Active): Taunt all enemies in 4-tile radius (MP: 50)
5. **Shield Bash** (Active): Stun enemy, +50% damage if Blocking (MP: 20)
6. **Phalanx** (Passive): Adjacent allies gain 10% of Bulwark's defense

**Tier 3 (Iron Sentinel → Living Fortress)**
7. **Fortress Stance** (Ultimate): Become immovable for 5 ticks, 300% defense (MP: 120)
8. **Last Stand** (Passive): When below 25% HP, +50% all defenses
9. **Reflexive Block** (Passive): 25% chance to block without spending action

### Statistics & Growth

| Stat | Base | Growth | Priority |
|------|------|--------|----------|
| HP | 2500 | +150/lvl | **High** |
| MP | 400 | +25/lvl | Medium |
| Defense | 450 | +35/lvl | **High** |
| Magic Defense | 300 | +20/lvl | Medium |
| Block Chance | 20% | +2%/lvl | **High** |
| Speed | 60 | +3/lvl | Low |

### Build Paths

**Main Tank Build** (Unbreakable):
- Focus: HP, Defense, Block
- Key Stats: Damage reduction, block power
- Playstyle: Anchor team, control positioning

**Support Tank Build** (Guardian):
- Focus: Defense, Magic Defense
- Key Stats: Ally buff strength, taunt duration
- Playstyle: Maximize ally protection

### Gaps Filled
- First position-based class
- First true tank class
- Ally protection/redirect mechanic

---

# Part III: Integration Recommendations

## New Trait Hooks Required

For the proposed classes to function, consider adding these hooks:

```javascript
// For Spiritist
const SPIRIT_SUMMON = 'onSpiritSummon';
const SPIRIT_DEATH = 'onSpiritDeath';
const SPIRIT_ATTACK = 'onSpiritAttack';

// For Chronomancer
const ON_TURN_START = 'onTurnStart';
const ON_ACTION_DELAY = 'onApplyActionDelay';
const ON_COOLDOWN_RESET = 'onCooldownReset';

// For Dreadknight
const ON_LIFE_STEAL = 'onLifeSteal';
const ON_SELF_DAMAGE = 'onSelfDamage';
const BELOW_THRESHOLD = 'onBelowHealthThreshold';

// For Tempest
const ON_ELEMENT_APPLY = 'onElementApply';
const ON_ELEMENT_REACTION = 'onElementReaction';
const ON_ELEMENT_STACK = 'onElementStack';

// For Bulwark
const ON_ALLY_DAMAGE_REDIRECT = 'onAllyDamageRedirect';
const ON_POSITION_CALC = 'onPositionCalc';
const ON_ZONE_ENTER = 'onZoneEnter';
```

## Database Schema Updates

New class template IDs (recommended):
- Spiritist: 1108 (Tier 1)
- Chronomancer: 1109 (Tier 1)
- Dreadknight: 1110 (Tier 1)
- Tempest: 1111 (Tier 1)
- Bulwark: 1112 (Tier 1)

Tier 2/Tier 3 follow existing pattern (210X, 310X)

## Balance Considerations

### Power Budget Analysis

| Class | Burst DPS | Sustained DPS | Survivability | Utility | Complexity |
|-------|-----------|--------------|---------------|---------|------------|
| Spiritist | Medium | Medium | Medium | **High** | High |
| Chronomancer | Low | Low | Medium | **High** | **High** |
| Dreadknight | **High** | **High** | Medium | Low | Medium |
| Tempest | **High** | Medium | Low | Medium | Medium |
| Bulwark | Low | Low | **High** | **High** | Low |

### Counter Composition Recommendations

When facing new classes:
- **Spiritist**: Kill summons first, then focus Spiritist
- **Chronomancer**: Burst before time manipulation stacks
- **Dreadknight**: Burst damage before life steal heals
- **Tempest**: Remove elemental states, use cleanse
- **Bulwark**: AOE from outside shield wall range

---

# Conclusion

These five new class proposals address significant gaps in the current class roster:

1. **Spiritist** - First true summoner/support hybrid
2. **Chronomancer** - Unique time manipulation controller
3. **Dreadknight** - Risk/reward life-steal bruiser
4. **Tempest** - Elemental combo specialist
5. **Bulwark** - Position-based tank

Each class integrates deeply with existing combat systems while introducing novel mechanics that expand strategic possibilities without breaking existing balance.

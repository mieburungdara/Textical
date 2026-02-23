# Secondary Stats Documentation

**Version:** 2.0  
**Last Updated:** 2026-02-18  
**Document Type:** Technical Reference

---

## Overview

Secondary Stats are derived statistics that determine a hero's combat effectiveness beyond the Primary Attributes. Unlike Primary Attributes (STR, DEX, INT, DEF) which players can directly allocate points to, Secondary Stats are obtained from various sources including Class Templates, Equipment, Buffs, Skills, and Attribute Scaling.

### Design Philosophy

- **Primary Attributes** = Stats that players can allocate points to (STR, DEX, INT, DEF)
- **Secondary Stats** = Stats derived from equipment, class, buffs, and attribute scaling
- **HP/Mana** = NOT derived from STR/INT - comes from Class Template + Equipment

---

## Secondary Stats Categories

### 1. Core Combat Stats

These are the fundamental stats that directly affect combat performance.

| Stat | Default | Max Cap | Source |
|------|---------|---------|--------|
| HP | 100 | 99,999 | Class Template + Equipment |
| Mana | 20 | 9,999 | Class Template + Equipment |
| Attack | 10 | 99,999 | STR + Equipment |
| PDEF | 0 | 99,999 | DEF + Armor (Plate) |
| MDEF | 0 | 99,999 | DEF + Robe |
| Speed | 5 | 255 | DEX + Equipment |
| Range | 1 | 10 | Class/Weapon |

### 2. Combat Rates (%)

Percentage-based stats that affect combat outcomes.

| Stat | Default | Max Cap | Source |
|------|---------|---------|--------|
| Dodge Chance | 5% | 95% | DEX + Equipment |
| Crit Chance | 5% | 100% | DEX (LUK merged) |
| Crit Damage | 150% | 500% | Equipment |
| Block Chance | 0% | 75% | Shield + Equipment |
| Parry Chance | 0% | 50% | Equipment |

### 3. Regeneration Stats

Stats affecting resource recovery.

| Stat | Default | Source |
|------|---------|--------|
| HP Regen | 0 | Equipment/Buffs |
| Mana Regen | 2 | Equipment/Buffs |

### 4. Offensive Stats

Stats that enhance damage output.

| Stat | Default | Source |
|------|---------|--------|
| Accuracy | 100% | Equipment |
| Armor Penetration | 0 | Equipment |
| **Magic Penetration** | 0 | Equipment |
| Skill Power | 10 | Equipment + INT Scaling |
| Attack Speed | 1.0x | Weapon + Equipment + DEX Scaling |
| Cast Rate | 1.0x | Wand/Staff + INT |

### 5. Defensive & Utility Stats

Stats that provide defensive and utility benefits.

| Stat | Default | Source |
|------|---------|--------|
| Tenacity | 0% | Equipment (CC resist) |
| Lifesteal | 0% | Equipment |
| Spell Vamp | 0% | Equipment + INT Scaling |
| Move Speed | 100% | Base |

### 6. Elemental Damage Stats

All default to 0, sourced from equipment:

| Stat | Source |
|------|--------|
| Fire Damage | Equipment |
| Water Damage | Equipment |
| Earth Damage | Equipment |
| Wind Damage | Equipment |
| Light Damage | Equipment |
| Dark Damage | Equipment |

---

## Primary → Secondary Attribute Scaling

Secondary stats are also derived from Primary Attributes through the Attribute Scaling System at **Layer 12 (SCALING)**.

### STR (Strength)

| Secondary Stat | Formula | Description |
|---------------|---------|-------------|
| `attack_damage` | STR × 0.5 | Physical damage |
| `block_power` | STR × 0.01 | Block effectiveness |

### DEX (Dexterity)

| Secondary Stat | Formula | Description |
|---------------|---------|-------------|
| `accuracy` | DEX × 1.5 | Hit chance |
| `dodge_rate` | DEX × 0.002 | 0.2% per DEX |
| `speed` | DEX × 0.1 | Movement/action speed |
| `attack_speed` | DEX × 0.005 | Attack rate |

### INT (Intelligence)

| Secondary Stat | Formula | Description |
|---------------|---------|-------------|
| `skill_power` | INT × 1.5 | Magic damage |
| `mana_max` | INT × 5 | Max mana pool |
| `spell_vamp` | INT × 0.001 | 0.1% spell lifesteal per INT |

---

> **Note:** LUK merged into DEX, VIT removed - HP from Class + Equipment

---

## Complex Synergies

Certain attribute combinations provide additional bonuses beyond basic mapping.

### STR + DEX → Critical Damage

```javascript
if (s > 0 && d > 0) {
    const critDamageBonus = (STR * DEX) * 0.0001;
    applyMod('crit_damage', critDamageBonus, FLAT, "Synergy:STR+DEX");
}
```

**Example:** STR 100, DEX 50 → +0.5 Critical Damage

> **Note:** LUK merged into DEX. Critical Chance now scales directly from DEX attribute.

---

## Job-Based Bonuses

Heroes with professions receive additional secondary stat bonuses.

### BLACKSMITH

```javascript
applyMod('defense', jobLevel * 2, FLAT, "Job:BLACKSMITH");
applyMod('block_power', jobLevel * 0.005, FLAT, "Job:BLACKSMITH");
```

**Level 10:** +20 Defense, +0.05 Block Power

### MINER

```javascript
applyMod('health_max', jobLevel * 5, FLAT, "Job:MINER");
applyMod('attack_damage', jobLevel * 0.5, FLAT, "Job:MINER");
```

**Level 10:** +50 HP, +5 Attack

### ALCHEMIST

```javascript
applyMod('mana_max', jobLevel * 3, FLAT, "Job:ALCHEMIST");
applyMod('skill_power', jobLevel * 1, FLAT, "Job:ALCHEMIST");
```

**Level 10:** +30 Mana, +10 Skill Power

### LUMBERJACK

```javascript
applyMod('attack_damage', jobLevel * 1, FLAT, "Job:LUMBERJACK");
applyMod('speed', jobLevel * 0.05, FLAT, "Job:LUMBERJACK");
```

**Level 10:** +10 Attack, +0.5 Speed

---

## 14-Layer Pipeline

Secondary stats are calculated through the following pipeline:

```
BASE → GROWTH → ALLOC → EQUIP → GEM → SET → ELEMENT → 
SKILLS → BUFFS → GUILD → BOND → FACTION → EVENT → SCALING → FINALIZE
```

### Layer Breakdown

| Layer | Name | Description |
|-------|------|-------------|
| 1 | BASE | Initialize base secondary stats from Hero model |
| 2 | GROWTH | Apply level-based growth modifiers |
| 3 | ALLOC | Apply stat allocation bonuses |
| 4 | EQUIP | Apply equipment modifiers |
| 5 | GEM | Apply gem socket bonuses |
| 6 | SET | Apply set bonus modifiers |
| 7 | ELEMENT | Apply elemental modifiers |
| 8 | SKILLS | Apply skill-based modifiers |
| 9 | BUFFS | Apply active buff modifiers |
| 10 | GUILD | Apply guild bonuses |
| 11 | BOND | Apply hero bond bonuses |
| 12 | FACTION | Apply faction reputation modifiers |
| 13 | EVENT | Apply world event modifiers |
| 14 | SCALING | Apply attribute scaling & finalize |

### Modifier Types

- **FLAT**: Direct addition
- **PERCENT_ADD**: Percentage addition
- **PERCENT_MULT**: Multiplicative scaling

---

## Class Base Stats

Each class has different base HP/Mana that serve as the foundation for secondary stats:

| Class Type | HP Base | Mana Base |
|------------|---------|-----------|
| Warrior | High | Low |
| Mage | Low | High |
| Rogue | Medium | Medium |

---

## Equipment Sources

### Equipment Defense Types

| Equipment Type | Gives |
|---------------|-------|
| Armor (Plate) | +PDEF |
| Robe | +MDEF |
| Shield | +PDEF + Block |
| Accessories | HP, Mana, Various Stats |

### Equipment-Based Secondary Stats

Secondary stats from equipment include:
- HP Regen
- Mana Regen
- Accuracy
- Armor Pen
- Skill Power
- Tenacity
- Lifesteal
- Spell Vamp
- Move Speed
- Attack Speed
- Cast Rate

---

## Stat Calculation Example

### Hero: Warrior Lv. 50

| Primary Attribute | Value |
|-----------------|-------|
| STR | 80 |
| DEX | 40 |
| INT | 20 |
| Job | BLACKSMITH Lv. 5 |

### Calculation

```javascript
// Base Stats (Layer 1)
hp_base = 100 (from Class)
mana_base = 20

// Attribute Scaling (Layer 12)
attack_damage = 80 * 0.5 = 40
crit_chance = 40 * 0.005 = 0.20 (20%) // From DEX
accuracy = 40 * 1.5 = 60

// Complex Synergies
crit_damage = (80 * 40) * 0.0001 = 0.32

// Job Bonuses (BLACKSMITH Lv.5)
defense = 5 * 2 = 10
block_power = 5 * 0.005 = 0.025
```

---

## Related Documentation

- [Stat System Overview](../STAT_SYSTEM.md)
- [HERO_BASE_STATS.md](HERO_BASE_STATS.md) - Primary stats and base stats
- [ATTRIBUTE_SCALING.md](ATTRIBUTE_SCALING.md) - Primary to Secondary mapping
- [STAT_CAPS.md](STAT_CAPS.md) - Hard, soft, and percent caps
- [Combat System](../COMBAT_SYSTEM.md) - Combat calculations

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-02-18 | Added attribute scaling formulas, job bonuses, synergies |
| 1.0 | 2024-08-01 | Initial documentation |

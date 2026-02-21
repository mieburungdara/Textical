# Secondary Stats - AI Quick Reference

**Version:** 2.0 | **For:** AI Agents

---

## Overview

Secondary Stats = Stats derived from equipment, class, buffs, and attribute scaling.

---

## Core Combat Stats

| Stat | Default | Max Cap | Source |
|------|---------|---------|--------|
| HP | 100 | 99,999 | Class + Equipment |
| Mana | 20 | 9,999 | Class + Equipment |
| Attack | 10 | 99,999 | STR + Equipment |
| PDEF | 0 | 99,999 | DEF + Armor |
| MDEF | 0 | 99,999 | DEF + Robe |
| Speed | 5 | 255 | DEX + Equipment |
| Range | 1 | 10 | Class/Weapon |

---

## Combat Rates (%)

| Stat | Default | Max Cap | Source |
|------|---------|---------|--------|
| Dodge | 5% | 95% | DEX + Equipment |
| Crit | 5% | 100% | DEX (LUK merged) |
| Crit Dmg | 150% | 500% | Equipment |
| Block | 0% | 75% | Shield + Equipment |
| Parry | 0% | 50% | Equipment |

---

## Other Secondary Stats

| Category | Stats | Default | Source |
|----------|-------|---------|--------|
| **Regen** | HP Regen | 0 | Equipment/Buffs |
| | Mana Regen | 2 | Equipment/Buffs |
| **Offensive** | Accuracy | 100% | Equipment |
| | Armor Pen | 0 | Equipment |
| | **Magic Pen** | 0 | Equipment |
| | Skill Power | 10 | Equipment |
| | Attack Speed | 1.0x | Weapon + Equipment |
| | Cast Rate | 1.0x | Wand/Staff |
| **Defensive** | Tenacity | 0% | Equipment |
| | Lifesteal | 0% | Equipment |
| | Spell Vamp | 0% | Equipment |
| | Move Speed | 100% | Base |

---

## Elemental Damage

All default to 0 (from equipment):
- fire_damage, water_damage, earth_damage
- wind_damage, light_damage, dark_damage

---

## Attribute Scaling (Layer 12)

| Primary | Secondary | Formula |
|---------|-----------|---------|
| STR | attack_damage | STR × 0.5 |
| STR | block_power | STR × 0.01 |
| DEX | accuracy | DEX × 1.5 |
| DEX | dodge_rate | DEX × 0.002 |
| DEX | speed | DEX × 0.1 |
| DEX | attack_speed | DEX × 0.005 |
| DEX | crit_chance | DEX × 0.005 | <- From DEX, LUK merged
| INT | skill_power | INT × 1.5 |
| INT | mana_max | INT × 5 |
| INT | spell_vamp | INT × 0.001 |

> **Note:** VIT removed - HP from Class + Equipment

---

## Synergy Bonuses

| Combination | Bonus |
|-------------|-------|
| STR + DEX | crit_damage += (STR*DEX) × 0.0001 |
| DEX + INT | spell_vamp += (DEX+INT) × 0.0005 |

> **Note:** INT+VIT removed - HP Regen from Equipment/Buffs

---

## Job Bonuses

| Job | Bonus |
|-----|-------|
| BLACKSMITH | defense += jobLevel × 2, block_power += jobLevel × 0.005 |
| MINER | health_max += jobLevel × 5, attack += jobLevel × 0.5 |
| ALCHEMIST | mana_max += jobLevel × 3, skill_power += jobLevel × 1 |
| LUMBERJACK | attack += jobLevel × 1, speed += jobLevel × 0.05 |

---

## 14-Layer Pipeline

```
BASE → GROWTH → ALLOC → EQUIP → GEM → SET → ELEMENT → 
SKILLS → BUFFS → GUILD → BOND → FACTION → EVENT → SCALING → FINALIZE
```

Modifier Types: FLAT, PERCENT_ADD, PERCENT_MULT

---

## Schema Location

`server/prisma/schema.prisma` - Hero model

---

## Processing

Layer 1 (BASE): Secondary stats initialized in `_initializeStats()`  
Layer 12 (SCALING): Attribute scaling in `EnhancedScalingComponent.js`

---

## Related

- [Stat System Overview](../STAT_SYSTEM.md)
- [14-Layer Pipeline](MULTILAYER_CALCULATION.md)

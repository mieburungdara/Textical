# Hero Base Stats - AI Quick Reference

**Version:** 2.0 | **For:** AI Agents

---

## Primary Attributes (Allocatable)

| Stat | Default | Max | Function |
|------|---------|-----|----------|
| **STR** | 10 | 255 | Physical Damage |
| **DEX** | 10 | 255 | Speed, Critical, Evasion |
| **INT** | 10 | 255 | Magic Damage |
| **DEF** | 10 | 255 | Defense (PDEF = MDEF) |

---

## HP & Mana Sources (NOT from Primary Stats)

| Stat | Source |
|------|--------|
| **HP** | Class Template + Equipment |
| **Mana** | Class Template + Equipment |

---

## Defense System

### Primary + Equipment Model:
```
Total PDEF = DEF (allocation) + Equipment PDEF (Armor)
Total MDEF = DEF (allocation) + Equipment MDEF (Robe)
```

### Equipment Defense:
| Equipment Type | Gives |
|---------------|-------|
| Armor (Plate) | +PDEF |
| Robe | +MDEF |
| Shield | +PDEF + Block |
| Accessories | HP, Mana, Stats |

---

## Combat Stats (Secondary)

| Stat | Default | Max | Source |
|------|---------|-----|--------|
| HP | 100 | 99,999 | Class + Equipment |
| Mana | 20 | 9,999 | Class + Equipment |
| Attack | 10 | 99,999 | STR + Equipment |
| PDEF | 0 | 99,999 | DEF + Armor |
| MDEF | 0 | 99,999 | DEF + Robe |
| Speed | 5 | 255 | DEX |
| Range | 1 | 10 | Class/Weapon |

---

## Combat Rates (%)

| Stat | Default | Max | Source |
|------|---------|-----|--------|
| Dodge | 5% | 95% | DEX + Equipment |
| Crit | 5% | 100% | DEX + LUK (merged) |
| Crit Dmg | 150% | 500% | Equipment |
| Block | 0% | 75% | Shield + Equipment |
| Parry | 0% | 50% | Equipment |

---

## Attack & Cast Speed (NOT Primary)

| Stat | Default | Source |
|------|---------|--------|
| Attack Speed | 1.0x | Weapon + Equipment |
| Cast Rate | 1.0x | Weapon (Wand/Staff) + INT |

---

## Other Secondary Stats

- HP Regen: 0 (from equipment/buffs)
- Mana Regen: 2 (from equipment/buffs)
- Accuracy: 100% (from equipment)
- Armor Pen: 0 (from equipment)
- Skill Power: 10 (from equipment)
- Tenacity: 0% (from equipment - CC resist)
- Lifesteal: 0% (from equipment)
- Spell Vamp: 0% (from equipment)
- Move Speed: 100% (base)

---

## Elemental Damage (all default 0)

- fire_damage, water_damage, earth_damage
- wind_damage, light_damage, dark_damage

---

## Schema Location

`server/prisma/schema.prisma` - Hero model

---

## Processing

Layer 1 (BASE) in `StatCalculationEngine.js`:
- `_initializeStats()` - Secondary stats
- `_initializePrimaryStats()` - Primary stats (str/dex/int/def)

---

## Related

- [Stat System Overview](../STAT_SYSTEM.md)
- [14-Layer Pipeline](MULTILAYER_CALCULATION.md)

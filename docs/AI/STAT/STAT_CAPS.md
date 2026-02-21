# AI Reference: Stat Caps

**Layer:** 13 (FINALIZE)

---

## Cap Types

### Hard Cap
Absolute maximum - cannot be exceeded
```javascript
{ hardCap: 99999 }
```

### Soft Cap
Diminishing returns above threshold
```javascript
{ softCap: 5000, softCapFactor: 0.1 }
// Only 10% of excess counts
```

### Percent Cap
For rate-based stats (0.0-1.0)
```javascript
{ percentCap: 1.0 } // 100% max
```

---

## Default Caps

| Stat | Cap | Type |
|------|-----|------|
| Primary Attributes: STR, DEX, INT | 255 | hard |
| health_max | 99,999 | hard |
| mana_max | 9,999 | hard |
| crit_chance | 1.0 | percent |
| crit_damage | 5.0 | max |
| dodge_rate | 0.95 | percent |
| resistances | 0.90 | percent |
| speed | 255 | hard |

---

## Exempt Stats (Unlimited)
- fire_damage, water_damage, earth_damage
- wind_damage, light_damage, dark_damage

---

*See [`docs/HUMAN/STAT/STAT_CAPS.md`](../../../HUMAN/STAT/STAT_CAPS.md) for detailed docs*

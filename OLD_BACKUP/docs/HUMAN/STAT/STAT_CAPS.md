# Stat Caps Configuration Documentation

**Layer:** 13 (FINALIZE)  
**Implementation:** `server/src/services/stat/StatCapResolver.js`

---

## Overview

Stat Caps limit the maximum (and sometimes minimum) values for stats to maintain game balance and prevent exploits.

---

## Cap Types

### 1. Hard Cap
Absolute maximum value that cannot be exceeded.

```javascript
{ hardCap: 99999 }
```

### 2. Soft Cap
Value above which diminishing returns apply.

```javascript
{ softCap: 5000, softCapFactor: 0.1 }
// Only 10% of excess counts
```

### 3. Percent Cap
For rate-based stats (0.0 to 1.0 = 0% to 100%).

```javascript
{ percentCap: 1.0 } // 100% max
```

---

## Default Cap Configuration

### Primary Attributes

| Stat | Hard Cap | Type |
|------|----------|------|
| Primary Attributes: STR, DEX, INT | 255 | hard |

### Combat Stats

| Stat | Hard Cap | Soft Cap | Soft Factor |
|------|----------|----------|-------------|
| health_max | 99,999 | 5,000 | 0.1 |
| mana_max | 9,999 | 1,000 | 0.1 |
| attack_damage | 99,999 | - | - |
| defense | 99,999 | - | - |
| speed | 255 | - | - |

### Critical Stats

| Stat | Min | Max | Type |
|------|-----|-----|------|
| crit_chance | 0 | 1.0 (100%) | percent |
| crit_damage | 1.0 | 5.0 (500%) | range |

### Defensive Stats

| Stat | Max | Type |
|------|-----|------|
| dodge_rate | 0.95 (95%) | percent |
| block_chance | 0.75 (75%) | percent |
| resistances | 0.90 (90%) | percent |

---

## Implementation

```javascript
class StatCapResolver {
    applyCap(statName, value, capConfig) {
        let result = value;
        
        // Hard cap
        if (capConfig.hardCap !== undefined && value > capConfig.hardCap) {
            result = capConfig.hardCap;
        }
        
        // Soft cap with diminishing returns
        if (capConfig.softCap !== undefined && value > capConfig.softCap) {
            const excess = value - capConfig.softCap;
            const reduced = excess * (1 - capConfig.softFactor);
            result = capConfig.softCap + reduced;
        }
        
        // Percent cap
        if (capConfig.percentCap !== undefined && value > capConfig.percentCap) {
            result = capConfig.percentCap;
        }
        
        return result;
    }
}
```

---

## Exempt Stats

Some stats are exempt from caps (unlimited):
- fire_damage, water_damage, earth_damage, wind_damage, light_damage, dark_damage

---

## Related Files

- [`StatCapResolver.js`](../../../server/src/services/stat/StatCapResolver.js)
- [`StatCalculationEngine.js`](../../../server/src/services/stat/StatCalculationEngine.js) - Layer 13

---

*Last Updated: 2026-02-18*

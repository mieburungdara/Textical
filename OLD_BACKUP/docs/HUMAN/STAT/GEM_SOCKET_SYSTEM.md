# Gem Socket System Documentation

**Layer:** 4.5 (GEM_SOCKETS)  
**Implementation:** `server/src/services/stat/StatCalculationEngine.js`

---

## Overview

Gem Socket System allows players to insert gems into equipped items for additional stat bonuses. This provides customization options and rewards players who collect gems.

---

## How It Works

### Socket Mechanics

1. Equipment can have 0-2 socket slots
2. Each socket holds one gem
3. Gems provide flat and/or percentage bonuses
4. Socket bonuses apply in Layer 4.5 (after equipment stats)

### Gem Types

| Gem | Primary Bonus | Secondary Bonus |
|-----|--------------|-----------------|
| Ruby | +10 Attack | +2% Crit |
| Sapphire | +10 Magic Attack | +10 Mana |
| Emerald | +10 Defense | +5 HP |
| Diamond | +5% Crit Chance | +5% Dodge |
| Amethyst | +5% Fire Resistance | +2% Lifesteal |
| Topaz | +5% Lightning Resistance | +2% Attack Speed |

---

## Implementation

```javascript
_applyGemSocketBonuses(stats, heroData, context, applyMod) {
    const equipment = heroData.equipment || [];
    
    for (const eq of equipment) {
        const instance = eq.itemInstance;
        if (!instance || !instance.socket || !instance.socket.gem) continue;
        if (instance.currentDurability <= 0) continue;
        
        const gem = instance.socket.gem;
        
        // Apply flat bonus
        if (gem.statValue > 0) {
            applyMod(gem.statKey, gem.statValue, FLAT, `Gem:${gem.name}`);
        }
        
        // Apply percentage bonus
        if (gem.percentValue > 0) {
            applyMod(gem.statKey + '_percent', gem.percentValue, PERCENT_ADD, `Gem:${gem.name}`);
        }
    }
}
```

---

## Calculation Flow

```
Layer 4: EQUIP
  - Apply equipment base stats + quality + durability
       
Layer 4.5: GEM_SOCKETS
  - For each equipped item with gem:
    - Apply flat bonus
    - Apply percent bonus
       
Layer 5: SET BONUS
```

---

## Example

```
Weapon: "Flame Sword" (LEGENDARY)
- Base Stats: +50 Attack
- Socket 1: Ruby (+10 Attack, +2% Crit)

// Layer 4: EQUIP
equipmentAttack = 50 * 1.5 = 75;

// Layer 4.5: GEM
rubyFlat = 10;
rubyPercent = 0.02 * 75 = 1.5;

totalAttack = 75 + 10 + 1.5 = 86.5;
```

---

## Related Files

- [`StatCalculationEngine.js`](../../../server/src/services/stat/StatCalculationEngine.js) - Layer 4.5

---

*Last Updated: 2026-02-18*

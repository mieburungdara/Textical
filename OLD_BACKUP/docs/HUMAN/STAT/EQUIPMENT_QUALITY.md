# Equipment Quality System Documentation

**Layer:** 4 (EQUIP)  
**Implementation:** `server/src/services/stat/StatLayerProcessor.js`

---

## Overview

Equipment Quality System applies multipliers to equipment stats based on item rarity/quality. Higher quality items provide better stats, encouraging players to seek better equipment.

---

## Quality Tiers

| Quality | Multiplier | Color Code | Example |
|---------|------------|------------|---------|
| COMMON | 1.0x | Gray | Basic iron sword |
| UNCOMMON | 1.1x | Green | Steel sword |
| RARE | 1.15x | Blue | Enchanted sword |
| EPIC | 1.25x | Purple | Legendary blade |
| MASTERWORK | 1.3x | Orange | Master-crafted sword |
| LEGENDARY | 1.5x | Gold | Dragon-slaying sword |

---

## Implementation

### Quality Multipliers

```javascript
const qualityMultipliers = {
    'COMMON': 1.0,
    'UNCOMMON': 1.1,
    'RARE': 1.15,
    'EPIC': 1.25,
    'MASTERWORK': 1.3,
    'LEGENDARY': 1.5
};
```

### Application in Layer 4

```javascript
const qualityMult = qualityMultipliers[instance.quality] || 1.0;
const powerScale = instance.powerScale || 1.0;
const totalMultiplier = qualityMult * powerScale * durabilityFactor;

instance.template.stats.forEach(s => {
    const finalValue = s.statValue * totalMultiplier;
    applyMod(s.statKey, finalValue, 0, `Equip:${instance.template.name}`);
});
```

---

## Combined Multipliers

```javascript
const totalMultiplier = qualityMultiplier * powerScale * durabilityFactor;
```

### Durability Factor

```javascript
const durabilityFactor = Math.max(0.5, currentDurability / maxDurability);
```

| Durability | Factor |
|------------|--------|
| 100% | 1.0 |
| 75% | 0.75 |
| 50% | 0.5 (minimum) |
| 25% | 0.5 |
| 0% | 0.5 |

---

## Example Calculations

### Example 1: High Quality Weapon

```
Item: Dragon Slayer Sword
- Base Attack: 50
- Quality: LEGENDARY (1.5x)

Total = 1.5 × 1.0 × 1.0 = 1.5
Final Attack = 50 × 1.5 = 75
```

### Example 2: Damaged Epic Armor

```
Item: Guardian Plate
- Base Defense: 40
- Quality: EPIC (1.25x)
- Durability: 40% (min 0.5)

Total = 1.25 × 1.0 × 0.5 = 0.625
Final Defense = 40 × 0.625 = 25
```

---

## Activity-Specific Equipment

| Category | Required Activity |
|----------|------------------|
| PICKAXE | MINING |
| AXE | LUMBERING |
| FISHING_ROD | FISHING |
| HERBALISM_SICKLE | HERBALISM |

---

## Best Practices

1. **Quality Gaps**: Ensure ~10-15% difference between tiers
2. **Epic Milestone**: EPIC is typically the first "special" tier
3. **Legendary Goals**: LEGENDARY should be rare, endgame content
4. **Durability Matters**: Don't let broken equipment be as good as fixed

---

## Related Files

- [`StatLayerProcessor.js`](../../../server/src/services/stat/StatLayerProcessor.js) - Layer 4

---

*Last Updated: 2026-02-18*

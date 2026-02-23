# AI Reference: Equipment Quality

**Layer:** 4 (EQUIP)

---

## Quality Tiers

| Quality | Multiplier |
|---------|------------|
| COMMON | 1.0x |
| UNCOMMON | 1.1x |
| RARE | 1.15x |
| EPIC | 1.25x |
| MASTERWORK | 1.3x |
| LEGENDARY | 1.5x |

---

## Formula

```
finalStat = baseStat × qualityMultiplier × powerScale × durabilityFactor
```

---

## Durability Factor

```
durabilityFactor = Math.max(0.5, currentDurability / maxDurability)
```

| Durability | Factor |
|------------|--------|
| 100% | 1.0 |
| 50% | 0.5 (min) |
| <50% | 0.5 |

---

*See [`docs/HUMAN/STAT/EQUIPMENT_QUALITY.md`](../../../HUMAN/STAT/EQUIPMENT_QUALITY.md) for detailed docs*

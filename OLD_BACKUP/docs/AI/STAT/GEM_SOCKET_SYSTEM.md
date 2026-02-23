# AI Reference: Gem Socket System

**Layer:** 4.5 (GEM_SOCKETS)

---

## Mechanics

- Equipment can have 0-2 socket slots
- Each socket holds one gem
- Gems apply flat and/or percentage bonuses
- Layer 4.5 (after equipment stats)
- Broken equipment = no gem bonus

---

## Gem Types

| Gem | Primary Bonus | Secondary Bonus |
|-----|--------------|-----------------|
| Ruby | +10 Attack | +2% Crit |
| Sapphire | +10 Magic Attack | +10 Mana |
| Emerald | +10 Defense | +5 HP |
| Diamond | +5% Crit Chance | +5% Dodge |
| Amethyst | +5% Fire Resistance | +2% Lifesteal |
| Topaz | +5% Lightning Resistance | +2% Attack Speed |

---

## Calculation

```
Layer 4: EQUIP
  baseAttack × qualityMultiplier × durabilityFactor
       
Layer 4.5: GEM
  + gem.flatValue
  + (gem.percentValue × equipmentStat)
```

---

*See [`docs/HUMAN/STAT/GEM_SOCKET_SYSTEM.md`](../../../HUMAN/STAT/GEM_SOCKET_SYSTEM.md) for detailed docs*

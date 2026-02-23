# Unit Stat System Documentation

**Version:** 2.0  
**Pipeline:** 14-Layer Calculation

---

## Quick Navigation

| For... | Go to... |
|--------|----------|
| **AI Agents** | [`docs/AI/STAT/`](AI/STAT/) - Quick reference |
| **Human Developers** | [`docs/HUMAN/STAT/`](HUMAN/STAT/) - Detailed docs |

---

## Overview

The Stat System provides comprehensive stat calculations for all units (heroes, monsters, NPCs). It uses a 14-layer pipeline to process modifiers from various sources:

- Primary Attributes: STR, DEX, INT (LUK merged into DEX, VIT removed - HP from Class + Equipment)
- Secondary Stats: HP, Mana, Attack, Defense, Speed, Crit, etc.
- Modifier Types: FLAT, PERCENT_ADD, PERCENT_MULT

---

## Architecture Highlights

### 14-Layer Pipeline

```
BASE → GROWTH → ALLOC → EQUIP → GEM → SET → ELEMENT → 
SKILLS → BUFFS → GUILD → BOND → FACTION → EVENT → SCALING → FINALIZE
```

### Key Features

1. **Attribute Scaling** - Primary → Secondary mapping
2. **Equipment Quality** - Rarity multipliers (COMMON to LEGENDARY)
3. **Gem Sockets** - Equipment gem bonuses
4. **Hero Bonds** - Party synergy bonuses
5. **Stat Caps** - Hard, soft, and percent caps
6. **Job Bonuses** - BLACKSMITH, MINER, ALCHEMIST, LUMBERJACK

---

## Documentation Structure

```
docs/
├── STAT_SYSTEM.md              # This file (Index)
├── AI/
│   └── STAT/
│       ├── README.md         # AI Quick Reference
│       └── SECONDARY_STATS.md # AI Secondary Stats
└── HUMAN/
    └── STAT/
        ├── README.md         # Index
        ├── SECONDARY_STATS.md    # Detailed Secondary Stats
        ├── ATTRIBUTE_SCALING.md    # Primary → Secondary
        ├── EQUIPMENT_QUALITY.md   # Quality system
        ├── GEM_SOCKET_SYSTEM.md   # Gem bonuses
        ├── HERO_BOND_SYSTEM.md    # Party bonds
        └── STAT_CAPS.md           # Cap configuration
```

---

## Related Documentation

- [`COMBAT_SYSTEM.md`](COMBAT_SYSTEM.md) - Combat calculations
- [`TRAITS_REFERENCE.md`](TRAITS_REFERENCE.md) - Trait system

---

*Last Updated: 2026-02-18*

# AI Quick Reference: Stat System

**Version:** 2.0  
**Layers:** 14  
**Engine:** `StatCalculationEngine.js`

---

## Quick Navigation

| Topic | File |
|-------|------|
| 14-Layer Pipeline | [`README.md`](README.md) |
| Attribute Scaling | [`ATTRIBUTE_SCALING.md`](ATTRIBUTE_SCALING.md) |
| Equipment Quality | [`EQUIPMENT_QUALITY.md`](EQUIPMENT_QUALITY.md) |
| Gem Sockets | [`GEM_SOCKET_SYSTEM.md`](GEM_SOCKET_SYSTEM.md) |
| Hero Bonds | [`HERO_BOND_SYSTEM.md`](HERO_BOND_SYSTEM.md) |
| Stat Caps | [`STAT_CAPS.md`](STAT_CAPS.md) |

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Primary Attributes** | STR, DEX, INT (LUK merged into DEX, VIT removed) |
| **Secondary Stats** | HP, Mana, Attack, Defense, Speed, Crit, etc. |
| **Modifier Types** | FLAT (0), PERCENT_ADD (1), PERCENT_MULT (2) |

---

## 14-Layer Pipeline

```
1. BASE        → Database hero stats
2. GROWTH     → Level/class growth curves
3. ALLOC      → Player stat allocation
4. EQUIP      → Equipment stats + quality multiplier
4.5 GEM       → Gem socket bonuses
5. SET        → Equipment set bonuses
6. ELEMENT    → Elemental affinity modifiers
7. SKILLS     → Passive skill bonuses
8. BUFFS      → Active buff effects
9. GUILD      → Guild facility bonuses
9.5 BOND      → Hero party bonds
10. FACT      → Faction reputation
11. EVENT     → World event modifiers
12. SCALING   → Attribute → Secondary mapping
13. FINALIZE  → Apply caps
```

---

## Primary → Secondary Mapping

| Attribute | Stat | Formula |
|-----------|------|---------|
| STR | attack_damage | `STR × 0.5` |
| DEX | speed | `DEX × 0.1` |
| DEX | crit_chance | `DEX × 0.005` (from LUK) |
| INT | mana_max | `INT × 5` |

### Complex Synergies
- `STR + DEX` → crit_damage
- `DEX + INT` → spell_vamp
- `STR + INT` → lifesteal

### Job Bonuses
| Job | Bonus |
|-----|-------|
| BLACKSMITH | +2 DEF/level |
| MINER | +5 HP/level |
| ALCHEMIST | +3 Mana/level |
| LUMBERJACK | +1 ATK/level |

---

## Equipment Quality

| Quality | Multiplier |
|---------|------------|
| COMMON | 1.0x |
| LEGENDARY | 1.5x |

**Formula:** `final = base × quality × durability`

---

## Gem Sockets

| Gem | Bonus |
|-----|-------|
| Ruby | +10 ATK |
| Sapphire | +10 MATK |
| Emerald | +10 DEF |

---

## Default Caps

| Stat | Cap |
|------|-----|
| Primary | 255 |
| health_max | 99,999 |
| crit_chance | 100% |
| resistances | 90% |

---

## Key Files

| File | Purpose |
|------|---------|
| `server/src/services/stat/StatCalculationEngine.js` | Main orchestrator |
| `server/src/services/stat/StatLayerProcessor.js` | Per-layer processing |
| `server/src/services/stat/EnhancedScalingComponent.js` | Attribute mapping |
| `server/src/services/stat/HeroBondResolver.js` | Party bonds |
| `server/src/services/stat/StatCapResolver.js` | Cap application |

---

*For detailed human documentation, see [`docs/HUMAN/STAT/`](../../../HUMAN/STAT/)*

---

*Last Updated: 2026-02-18*

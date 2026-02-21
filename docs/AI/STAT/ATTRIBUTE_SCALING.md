# AI Reference: Attribute Scaling

**Layer:** 12 (SCALING)

---

## Primary → Secondary Mapping

| Attribute | Stat | Formula |
|-----------|------|---------|
| STR | attack_damage | `STR × 0.5` |
| STR | block_power | `STR × 0.01` |
| DEX | accuracy | `DEX × 1.5` |
| DEX | dodge_rate | `DEX × 0.002` |
| DEX | speed | `DEX × 0.1` |
| DEX | attack_speed | `DEX × 0.005` |
| DEX | crit_chance | `DEX × 0.005` | ← From DEX, LUK merged |
| INT | skill_power | `INT × 1.5` |
| INT | mana_max | `INT × 5` |
| INT | spell_vamp | `INT × 0.001` |

> **Note:** VIT removed - HP from Class + Equipment

---

## Complex Synergies

| Combination | Bonus Stat | Formula |
|------------|------------|---------|
| STR + DEX | crit_damage | `(STR × DEX) × 0.0001` |
| DEX + INT | spell_vamp | `(DEX + INT) × 0.0005` |

> **Note:** INT+VIT removed - HP Regen from Equipment/Buffs

---

## Job Bonuses

| Job | Bonuses |
|-----|---------|
| BLACKSMITH | +2 DEF/level, +0.005 block_power/level |
| MINER | +5 HP/level, +0.5 ATK/level |
| ALCHEMIST | +3 Mana/level, +1 Skill Power/level |
| LUMBERJACK | +1 ATK/level, +0.05 Speed/level |

---

*See [`docs/HUMAN/STAT/ATTRIBUTE_SCALING.md`](../../../HUMAN/STAT/ATTRIBUTE_SCALING.md) for detailed docs*

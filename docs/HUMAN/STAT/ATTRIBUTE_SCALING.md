# Attribute Scaling System Documentation

**Layer:** 12 (SCALING)  
**Implementation:** `server/src/services/stat/EnhancedScalingComponent.js`

---

## Overview

Attribute Scaling System maps primary attributes (STR, DEX, INT) to secondary stats. This provides meaningful progression where each point invested in primary attributes has tangible effects on combat capabilities.

> **Note:** LUK merged into DEX, VIT removed - HP now from Class + Equipment

---

## Primary → Secondary Mapping

### STR (Strength)

| Secondary Stat | Formula | Description |
|---------------|---------|-------------|
| `attack_damage` | `STR × 0.5` | Physical damage |
| `block_power` | `STR × 0.01` | Block effectiveness |

### DEX (Dexterity)

| Secondary Stat | Formula | Description |
|---------------|---------|-------------|
| `accuracy` | `DEX × 1.5` | Hit chance |
| `dodge_rate` | `DEX × 0.002` | 0.2% per DEX |
| `speed` | `DEX × 0.1` | Movement/action speed |
| `attack_speed` | `DEX × 0.005` | Attack rate |
| `crit_chance` | `DEX × 0.005` | 0.5% crit per DEX (includes former LUK) |

### INT (Intelligence)

| Secondary Stat | Formula | Description |
|---------------|---------|-------------|
| `skill_power` | `INT × 1.5` | Magic damage |
| `mana_max` | `INT × 5` | Max mana pool |
| `spell_vamp` | `INT × 0.001` | 0.1% spell lifesteal per INT |

---

> **Note:** LUK merged into DEX, VIT removed - HP from Class + Equipment

---

## Complex Synergies

Beyond basic mapping, certain attribute combinations provide additional bonuses.

### STR + DEX → Critical Damage

```javascript
if (s > 0 && d > 0) {
    const critDamageBonus = (STR * DEX) * 0.0001;
    applyMod('crit_damage', critDamageBonus, FLAT, "Synergy:STR+DEX");
}
```

**Example:** STR 100, DEX 50 → +0.5 Critical Damage

---

> **Note:** INT+VIT synergy removed - HP Regen from Equipment/Buffs

---

## Job-Based Bonuses

Heroes with professions/jobs receive additional bonuses.

### BLACKSMITH

```javascript
applyMod('defense', jobLevel * 2, FLAT, "Job:BLACKSMITH");
applyMod('block_power', jobLevel * 0.005, FLAT, "Job:BLACKSMITH");
```

**Level 10:** +20 Defense, +0.05 Block Power

### MINER

```javascript
applyMod('health_max', jobLevel * 5, FLAT, "Job:MINER");
applyMod('attack_damage', jobLevel * 0.5, FLAT, "Job:MINER");
```

**Level 10:** +50 HP, +5 Attack

### ALCHEMIST

```javascript
applyMod('mana_max', jobLevel * 3, FLAT, "Job:ALCHEMIST");
applyMod('skill_power', jobLevel * 1, FLAT, "Job:ALCHEMIST");
```

**Level 10:** +30 Mana, +10 Skill Power

### LUMBERJACK

```javascript
applyMod('attack_damage', jobLevel * 1, FLAT, "Job:LUMBERJACK");
applyMod('speed', jobLevel * 0.05, FLAT, "Job:LUMBERJACK");
```

**Level 10:** +10 Attack, +0.5 Speed

---

## Implementation

### EnhancedScalingComponent

```javascript
class EnhancedScalingComponent {
    applyAttributeScaling(primary, stats, applyMod) {
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const v = primary.vit.getValue();
        // LUK removed - merged into DEX

        // STR
        applyMod('attack_damage', s * 0.5, FLAT, "Attribute:STR");
        applyMod('block_power', s * 0.01, FLAT, "Attribute:STR");
        
        // DEX (includes former LUK scaling for crit)
        applyMod('accuracy', d * 1.5, FLAT, "Attribute:DEX");
        applyMod('dodge_rate', d * 0.002, FLAT, "Attribute:DEX");
        applyMod('crit_chance', d * 0.005, FLAT, "Attribute:DEX (was LUK)");
        
        // ... etc
    }

    applyComplexScaling(primary, stats, applyMod) {
        // Synergy bonuses
    }

    applyJobScaling(heroData, stats, applyMod) {
        if (!heroData.job || !heroData.jobLevel) return;
        // Job bonuses
    }
}
```

---

## Calculation Flow

```
Layer 11: EVENT
   - World event modifiers
       
Layer 12: SCALING
   1. ApplyAttributeScaling() - Primary → Secondary mapping
   2. ApplyComplexScaling() - Synergy bonuses
   3. ApplyJobScaling() - Job bonuses
       
Layer 13: FINALIZE
   - Apply caps
```

---

## Example

### Hero: Warrior Lv. 50
- STR: 80
- DEX: 40
- INT: 20
- Job: BLACKSMITH Lv. 5

### Calculation

```javascript
// Attribute Scaling
attack_damage = 80 * 0.5 = 40
mana_max = 20 * 5 = 100
crit_chance = 40 * 0.005 = 0.20 (20%) // From DEX
accuracy = 40 * 1.5 = 60

// Complex Synergies
crit_damage = (80 * 40) * 0.0001 = 0.32

// Job Bonuses (BLACKSMITH Lv.5)
defense = 5 * 2 = 10
block_power = 5 * 0.005 = 0.025
```

---

## Related Files

- [`EnhancedScalingComponent.js`](../../../server/src/services/stat/EnhancedScalingComponent.js)
- [`StatCalculationEngine.js`](../../../server/src/services/stat/StatCalculationEngine.js) - Layer 12

---

*Last Updated: 2026-02-18*

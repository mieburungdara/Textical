# Unit Stat System - Backend Logic Enhancement

## Overview
Enhancement untuk sistem stat di backend (Node.js).

---

## 1. Enhanced Stat System (`statSystem.js`)

### EnhancedStat Class
- **Caps**: minValue, maxValue configuration
- **Curves**: linear, exponential, logarithmic, sigmoid
- **Conditional Modifiers**: Modifiers yang hanya aktif dengan kondisi tertentu
- **StatSet**: Grouping untuk equipment set bonuses

```javascript
class EnhancedStat {
    constructor(baseValue, config = {}) {
        this.baseValue = baseValue;
        this.modifiers = [];
        this.minValue = config.minValue ?? -Infinity;
        this.maxValue = config.maxValue ?? Infinity;
        this.curveType = config.curveType ?? 'linear';
        this.curveFactor = config.curveFactor ?? 1.0;
    }
    
    getValue() {
        // Apply modifiers dengan curve dan caps
    }
    
    getDetailedBreakdown() {
        // Return detailed breakdown untuk UI
    }
}
```

### StatModifier Types
- `FLAT`: +10
- `PERCENT_ADD`: +10%
- `PERCENT_MULT`: x1.1

---

## 2. Enhanced Stat Service (`statService.js`)

### Main Method
```javascript
async calculateHeroStats(heroId, context = {}) {
    // context: { contextType, includeBreakdown, applyBuffs }
}
```

### New Features
1. **Stat Caps**: Apply caps per attribute
2. **Set Bonuses**: Calculate equipment set bonuses
3. **Elemental Modifiers**: Apply elemental damage/resistance
4. **Conditional Buffs**: Buffs dengan kondisi
5. **Detailed Breakdown**: Optional breakdown untuk UI

### Stats Calculated
- **Primary**: STR, DEX, INT, VIT, LUK
- **Combat**: attack_damage, defense, crit_chance, crit_damage, accuracy, dodge, block, parry
- **Resources**: health_max, mana_max, vitality_max
- **Speed**: speed, attack_speed, move_speed
- **Utility**: skill_power, tenacity, lifesteal, spell_vamp
- **Elemental**: fire_damage, water_damage, earth_damage, wind_damage, light_damage, dark_damage
- **Resistances**: fire_resistance, water_resistance, dll

---

## 3. Enhanced Growth System (`StatGrowthSystem.js`)

### Features
- **Base Level Growth**: Stats gained per unit level
- **Class Level Growth**: Stats gained per class level
- **Growth Curves**: linear, polynomial, exponential
- **Recommended Distribution**: Suggest stat allocation per class

```javascript
applyGrowth(stats, classTemplate, unitLevel, classLevel, options = {}) {
    // Apply base growth
    // Apply class growth
    // Apply curves
}
```

---

## 4. Elemental Resolver (`ElementalResolver.js`)

### Features
- **Elemental Interactions**: Fire > Wind > Earth > Water > Fire
- **Resistance Application**: Dari HeroElementalAffinity
- **Damage Bonuses**: Based on affinity
- **Damage Multipliers**: Calculate final damage based on resistance

```javascript
ELEMENTS = ['fire', 'water', 'earth', 'wind', 'light', 'dark'];

applyElementalModifiers(stats, heroData, applyMod) {
    // Apply base elemental damage
    // Apply elemental affinities
    // Apply elemental interactions
}
```

---

## 5. Set Bonus Resolver (`SetBonusResolver.js`)

### Features
- **Register Set Bonuses**: Track equipped set items
- **Calculate Active Bonus**: Based on piece count
- **Skill Bonuses**: Apply bonus skills from sets

```javascript
registerSetBonuses(statSet, setItems) {
    // Group items by set
    // Register bonuses per piece count
    // Apply active bonuses
}
```

---

## 6. Stat Cap Resolver (`StatCapResolver.js`)

### Features
- **Level-based Scaling**: Caps increase with level
- **Class Modifiers**: Different caps per class
- **Global Caps**: Server-wide maximums

```javascript
getCaps(heroData, options = {}) {
    // Apply level scaling
    // Apply class modifiers
    // Apply global configuration
}
```

---

## 7. Enhanced Scaling Component (`EnhancedScalingComponent.js`)

### Features
- **Attribute Scaling**: STR → ATK, DEX → ACC, INT → SP, VIT → HP, LUK → CRIT
- **Complex Scaling**: Attribute interactions (STR+DEX = crit damage)
- **Job Scaling**: Collection/Crafting job bonuses

```javascript
applyAttributeScaling(primary, stats, applyMod) {
    // Basic scaling
    // Complex scaling (attribute synergies)
    // Job scaling
}
```

---

## File Structure
```
server/src/
├── logic/
│   └── statSystem.js (Enhanced)
├── services/
│   ├── statService.js (Enhanced)
│   └── stat/
│       ├── EnhancedStatGrowthSystem.js
│       ├── ElementalResolver.js
│       ├── SetBonusResolver.js
│       ├── StatCapResolver.js
│       └── EnhancedScalingComponent.js
```

---

## Dependencies
- `mathjs`: For complex calculations
- Existing database models

# Unit Stat System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Stat Calculation Flow](#stat-calculation-flow)
4. [Core Components](#core-components)
5. [Supporting Services](#supporting-services)
6. [Integration Points](#integration-points)
7. [Examples and Use Cases](#examples-and-use-cases)
8. [Best Practices](#best-practices)

---

## Overview

The Unit Stat System is a comprehensive stat management framework for the Textical game. It provides advanced stat calculations with support for:

- **Layered Calculation**: 12-layer calculation pipeline for flexible stat computation
- **Growth Curves**: Linear, exponential, sigmoid, polynomial, and logarithmic growth
- **Conditional Modifiers**: Context-aware stat modifiers based on various conditions
- **Stat Caps**: Hard caps, soft caps (diminishing returns), and percentage caps
- **Caching**: Performance optimization through intelligent caching
- **Set Bonuses**: Equipment set bonus detection and application
- **Elemental System**: Elemental damage and resistance calculations

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EnhancedStatService                          │
│                  (Main Orchestration Layer)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  StatCurveCalculator │ │ ElementalResolver │ │  SetBonusResolver  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EnhancedStat                               │
│                  (Individual Stat Logic)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────────┐
        │  Modifiers │   │   Caps    │   │ Growth Curves │
        └───────────┘   └───────────┘   └───────────────┘
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `EnhancedStat` | `server/src/logic/statSystem.js` | Individual stat with caps, modifiers, and growth |
| `EnhancedStatService` | `server/src/services/statService.js` | Main service orchestrating hero stat calculation |
| `StatCurveCalculator` | `server/src/services/stat/StatCurveCalculator.js` | Growth curve implementations |
| `ElementalResolver` | `server/src/services/stat/ElementalResolver.js` | Elemental damage/resistance calculations |
| `SetBonusResolver` | `server/src/services/stat/SetBonusResolver.js` | Equipment set bonus handling |
| `StatCapResolver` | `server/src/services/stat/StatCapResolver.js` | Stat cap application and management |

---

## Stat Calculation Flow

### 12-Layer Calculation Pipeline

The stat calculation follows a strict 12-layer pipeline:

```
Layer 1: BASE     → Initialize stats with base values from database
Layer 2: GROWTH   → Apply level/class growth curves
Layer 3: ALLOC    → Apply stat allocation points
Layer 4: EQUIP    → Apply equipment stats
Layer 5: SET      → Apply set bonuses
Layer 6: ELEMENT  → Apply elemental modifiers
Layer 7: SKILLS   → Apply passive skill bonuses
Layer 8: BUFFS    → Apply active buff effects
Layer 9: GUILD    → Apply guild facility bonuses
Layer 10: FACT    → Apply faction perks
Layer 11: EVENT   → Apply world event modifiers
Layer 12: CAPS    → Apply final caps and limits
```

### Layer Details

#### Layer 1: BASE
Initialize all stats with their base values from hero database records.
- Health: `hp_base` or default 100
- Mana: `mana_base` or default 20
- Attack: `damage_base` or default 10
- Defense: `defense_base` or default 0

#### Layer 2: GROWTH
Apply growth curves based on combat class and level.
```javascript
// Example: Warrior class with linear growth
StatCurveCalculator.calculateLinear(baseValue, rate, level)
```

#### Layer 3: ALLOCATION
Apply stat points allocated by the player.
```javascript
// Primary stats: STR, DEX, INT, VIT, LUK
primary.str.addModifier(new StatModifier({
    value: allocatedSTR,
    type: StatModifierType.FLAT,
    source: 'StatAllocation',
    priority: 10
}));
```

#### Layer 4: EQUIPMENT
Apply stats from equipped items.
```javascript
// Equipment stat with quality modifier
const qualityMultiplier = item.quality / 100;
applyMod('attack_damage', baseStat * qualityMultiplier, 0, `Equip:${item.slot}`);
```

#### Layer 5: SET BONUS
Apply equipment set bonuses when equipped pieces meet requirements.
```javascript
// Dragon Set (4 pieces): +50 ATK, +10% Crit
// Currently equipped: 3 pieces
// Active bonus: 2-piece bonus (+25 ATK)
```

#### Layer 6: ELEMENTAL
Apply elemental affinity bonuses and resistances.
```javascript
// Fire affinity: +15% fire damage
applyMod('fire_damage', 0.15, 1, 'ElementAffinity:fire');
```

#### Layer 7: SKILLS
Apply passive skill bonuses.
```javascript
// Passive skill: "Critical Strike" - +20% crit damage
applyMod('crit_damage', 0.20, 1, 'Skill:CriticalStrike');
```

#### Layer 8: BUFFS
Apply active buff effects.
```javascript
// Buff: "Power Strike" - +30 ATK for 60 seconds
applyMod('attack_damage', 30, 0, 'Buff:PowerStrike');
```

#### Layer 9: GUILD
Apply guild facility bonuses.
```javascript
// Guild Hall Level 5: +5% all stats
applyMod('attack_damage', 0.05, 1, 'Guild:TrainingHall');
```

#### Layer 10: FACTION
Apply faction reputation perks.
```javascript
// Hero rank in Warrior faction: +10 defense
applyMod('defense', 10, 0, 'Faction:Warrior');
```

#### Layer 11: EVENTS
Apply world event modifiers.
```javascript
// World Boss Event: All damage +25%
applyMod('attack_damage', 0.25, 1, 'Event:WorldBoss');
```

#### Layer 12: CAPS
Apply final caps to all stats.
```javascript
// Critical chance capped at 100%
const result = statCapResolver.applyCap('crit_chance', calculated, capConfig);
```

---

## Core Components

### EnhancedStat Class

The `EnhancedStat` class is the fundamental building block for all stats.

```javascript
const { EnhancedStat, StatModifier, StatModifierType } = require('../logic/statSystem');

// Create a stat with base value and configuration
const health = new EnhancedStat(100, {
    name: 'health_max',
    max: 99999,           // Hard cap
    min: 0,               // Minimum value
    softCap: 5000,        // Soft cap for diminishing returns
    softCapFactor: 0.1,   // 10% diminishing returns above soft cap
    curveType: 'linear',
    curveFactor: 1.0,
    isExempt: false
});
```

#### EnhancedStat Methods

| Method | Description |
|--------|-------------|
| `addModifier(modifier)` | Add a modifier to the stat |
| `addModifiers([...])` | Add multiple modifiers at once |
| `removeModifier(id)` | Remove a modifier by ID |
| `clearModifiers()` | Remove all modifiers |
| `setBase(value)` | Set the base value |
| `setCaps({min, max, soft})` | Configure cap settings |
| `setGrowthCurve({type, factor})` | Configure growth curve |
| `getValue(context)` | Calculate final value |
| `getDetailedBreakdown(context)` | Get detailed calculation breakdown |
| `getValueAtLevel(level, options)` | Get value at specific level |
| `clone()` | Create a copy of the stat |

### StatModifier Types

```javascript
const StatModifierType = {
    FLAT: 0,           // Direct addition: +10
    PERCENT_ADD: 1,    // Percentage addition: +10% (adds to base)
    PERCENT_MULT: 2    // Multiplier: x1.1 (multiplies total)
};
```

#### Example: Modifier Types

```javascript
// FLAT: +10 damage
stat.addModifier({
    value: 10,
    type: StatModifierType.FLAT,
    source: 'Weapon'
});

// PERCENT_ADD: +10% damage (adds to base)
stat.addModifier({
    value: 0.10,
    type: StatModifierType.PERCENT_ADD,
    source: 'Buff'
});

// PERCENT_MULT: x1.1 damage (multiplies final)
stat.addModifier({
    value: 1.1,
    type: StatModifierType.PERCENT_MULT,
    source: 'Skill'
});

// Calculation: ((100 + 10) * (1 + 0.10)) * 1.1 = 133.1
```

### Growth Curves

```javascript
const GrowthCurveType = {
    LINEAR: 'linear',
    EXPONENTIAL: 'exponential',
    SIGMOID: 'sigmoid',
    POLYNOMIAL: 'polynomial',
    LOGARITHMIC: 'logarithmic'
};
```

#### Curve Formulas

| Type | Formula | Use Case |
|------|---------|----------|
| Linear | `base + (rate * level)` | Constant growth |
| Exponential | `base * (rate ^ level)` | Rapid early growth |
| Sigmoid | `base + (max * sigmoid(level))` | S-curve with plateau |
| Polynomial | `base + (rate * level^power)` | Accelerating growth |
| Logarithmic | `base + (rate * log(level))` | Rapid early, slows down |

### Conditional Modifiers

Conditional modifiers only apply when their conditions are met:

```javascript
const ConditionType = {
    STAT_THRESHOLD: 'STAT_THRESHOLD',  // e.g., STR >= 100
    LEVEL_MIN: 'LEVEL_MIN',            // e.g., level >= 50
    LEVEL_MAX: 'LEVEL_MAX',            // e.g., level <= 30
    CLASS: 'CLASS',                    // e.g., Warrior class
    ELEMENT: 'ELEMENT',                // e.g., Fire affinity
    BUFF_ACTIVE: 'BUFF_ACTIVE',        // e.g., "Power" buff active
    TIME_OF_DAY: 'TIME_OF_DAY',        // e.g., 18:00-22:00
    REGION_TYPE: 'REGION_TYPE'         // e.g., "dungeon"
};

// Example: Bonus attack when health is below 30%
stat.addModifier({
    value: 50,
    type: StatModifierType.FLAT,
    source: 'Recklessness',
    condition: {
        type: ConditionType.STAT_THRESHOLD,
        statKey: 'health_max',
        operator: '<',
        threshold: 0.30
    }
});
```

---

## Supporting Services

### StatCurveCalculator

Implements various growth curve calculations.

```javascript
const StatCurveCalculator = require('./stat/StatCurveCalculator');

// Linear growth
const linear = StatCurveCalculator.calculateLinear(base, rate, level);

// Exponential growth
const exponential = StatCurveCalculator.calculateExponential(base, rate, level);

// Sigmoid growth
const sigmoid = StatCurveCalculator.calculateSigmoid(base, max, level, steepness, midpoint);

// Polynomial growth
const polynomial = StatCurveCalculator.calculatePolynomial(base, rate, level, power);

// Logarithmic growth
const logarithmic = StatCurveCalculator.calculateLogarithmic(base, rate, level, baseLog);
```

### ElementalResolver

Handles elemental damage and resistance calculations.

```javascript
const ElementalResolver = require('./stat/ElementalResolver');

// Element types
ElementalResolver.Element.FIRE;
ElementalResolver.Element.WATER;
ElementalResolver.Element.EARTH;
ElementalResolver.Element.WIND;
ElementalResolver.Element.LIGHT;
ElementalResolver.Element.DARK;

// Calculate damage multiplier based on interaction
const multiplier = ElementalResolver.calculateDamageMultiplier(
    attackElement,    // 'fire'
    targetElement,    // 'water'
    heroAffinity,     // { fire: { bonusDamage: 0.1 } }
    targetAffinity    // { water: { resistance: 0.2 } }
); // Returns: 0.9 (50% weakness + 10% bonus - 20% resistance)

// Apply elemental modifiers
ElementalResolver.applyElementalModifiers(stats, heroData, applyMod);
```

#### Element Interactions

| Attacker | Strong Against | Weak Against |
|----------|---------------|--------------|
| Fire | Wind | Water |
| Water | Fire | Earth |
| Earth | Water | Wind |
| Wind | Earth | Fire |
| Light | Dark | Dark |
| Dark | Light | Light |

#### Interaction Multipliers

- **Strong**: 1.5x damage
- **Weak**: 0.5x damage
- **Neutral**: 1.0x damage

### SetBonusResolver

Handles equipment set bonus detection and application.

```javascript
const SetBonusResolver = require('./stat/SetBonusResolver');

const resolver = new SetBonusResolver();

// Register equipped items
const setData = resolver.registerSetBonuses(equipment);

// Get active bonuses
const activeBonuses = resolver.getActiveBonuses(setData, setTemplates, heroData);

// Apply bonuses to stats
resolver.applySetBonuses(stats, activeBonuses, applyMod);

// Calculate synergy between sets
const synergy = resolver.calculateSynergy(activeBonuses);

// Get detailed breakdown for UI
const breakdown = resolver.getDetailedBreakdown(setData, setTemplates, heroData);
```

### StatCapResolver

Manages stat caps with support for hard caps, soft caps, and percentage caps.

```javascript
const StatCapResolver = require('./stat/StatCapResolver');

const resolver = new StatCapResolver();

// Get caps for a hero (with level scaling)
const caps = resolver.getCaps(heroData);

// Apply caps to stats
const result = resolver.applyAllCaps(stats, caps);

// Apply single cap
const capped = resolver.applyCap('crit_chance', calculatedValue, capConfig);

// Get cap info without applying
const info = resolver.getCapInfo('crit_chance', caps);

// Get effective value (for display)
const effective = resolver.getEffectiveValue(rawValue, 'crit_chance', caps);
```

#### Default Caps

| Stat | Max | Type |
|------|-----|------|
| Primary (STR, DEX, INT, VIT, LUK) | 255 | hard |
| Health | 99,999 | hard |
| Mana | 9,999 | hard |
| Crit Chance | 1.0 (100%) | percent |
| Dodge Rate | 0.95 (95%) | percent |
| Resistances | 0.9 (90%) | percent |
| Elemental Damage | ∞ | exempt |

---

## Integration Points

### Battle System Integration

```javascript
// In battle calculations
const stats = await enhancedStatService.calculateHeroStats(heroId);

// Use stats for damage calculation
const damage = stats.attack_damage * attackMultiplier;

// Apply defense
const damageAfterDefense = Math.max(1, damage - targetStats.defense);

// Calculate crit
if (Math.random() < stats.crit_chance) {
    damageAfterDefense *= stats.crit_damage;
}

// Apply elemental modifier
const elementMultiplier = ElementalResolver.calculateDamageMultiplier(
    attackElement,
    targetElement,
    heroElementalAffinities,
    targetElementalAffinities
);
```

### Status Effect Integration

```javascript
// Status effects can modify stats through modifiers
class BurnStatus extends BaseStatus {
    applyEffect(target) {
        target.stats.attack_damage.addModifier(new StatModifier({
            value: -10,
            type: StatModifierType.FLAT,
            source: 'Status:Burn',
            priority: 5
        }));
    }

    removeEffect(target) {
        // Remove modifier when status expires
    }
}
```

### Trait System Integration

```javascript
// Traits can provide stat bonuses
class StrengthTrait extends BaseTrait {
    getStatBonuses() {
        return {
            attack_damage: { value: 5, type: 'flat' },
            crit_chance: { value: 0.05, type: 'percent_add' }
        };
    }
}
```

### Equipment System Integration

```javascript
// Equipment stats are applied through equipment layer
function applyEquipmentStats(stats, equipment, applyMod) {
    equipment.forEach(item => {
        const itemStats = item.itemInstance.template.stats;
        
        itemStats.forEach(stat => {
            // Apply with quality modifier
            const qualityMultiplier = item.itemInstance.quality / 100;
            const value = stat.value * qualityMultiplier;
            
            applyMod(stat.statKey, value, stat.modifierType, `Equip:${item.slot}`);
        });
    });
}
```

### Guild/Faction Integration

```javascript
// Guild facilities
const guildBonuses = await facilityResolver.getFacilityBonuses(hero.user.guild);
guildBonuses.forEach(bonus => {
    applyMod(bonus.statKey, bonus.value, bonus.modifierType, `Guild:${bonus.facilityName}`);
});

// Faction perks
const factionPerks = await factionService.getPerks(hero.factionId, hero.reputationLevel);
factionPerks.forEach(perk => {
    applyMod(perk.statKey, perk.value, perk.modifierType, `Faction:${hero.factionName}`);
});
```

---

## Examples and Use Cases

### Example 1: Basic Stat Calculation

```javascript
// Create a hero's attack stat
const attack = new EnhancedStat(10, { name: 'attack_damage', max: 99999 });

// Add modifiers
attack.addModifier({
    value: 5,
    type: StatModifierType.FLAT,
    source: 'LevelBonus'
});

attack.addModifier({
    value: 0.10,
    type: StatModifierType.PERCENT_ADD,
    source: 'WarriorClass'
});

attack.addModifier({
    value: 1.2,
    type: StatModifierType.PERCENT_MULT,
    source: 'SharpBlade'
});

// Calculate final value: ((10 + 5) * 1.10) * 1.2 = 19.8
const finalAttack = attack.getValue();
console.log(finalAttack); // 19.8
```

### Example 2: Equipment with Quality Modifiers

```javascript
async function calculateEquipmentStats(heroId) {
    const stats = await enhancedStatService.calculateHeroStats(heroId);
    
    // Example: Dragon Slayer Sword (Quality: 150%)
    // Base: 50 ATK, Quality Modifier: 1.5
    const swordBaseATK = 50;
    const qualityModifier = 1.5;
    const qualityBonus = swordBaseATK * (qualityModifier - 1); // +25 ATK
    
    return {
        baseWeaponDamage: swordBaseATK,
        qualityBonus: qualityBonus,
        totalEquipmentATK: swordBaseATK + qualityBonus
    };
}
```

### Example 3: Set Bonus Activation

```javascript
// Hero has equipped:
// - Dragon Helm (setId: 1, pieceOrder: 1)
// - Dragon Armor (setId: 1, pieceOrder: 2)
// - Dragon Boots (setId: 1, pieceOrder: 3)

const equipment = [helm, armor, boots];
const setData = setBonusResolver.registerSetBonuses(equipment Result: setCount = { 1: 3 }

const setTemplates = [{
    id: 1,
   );
// name: 'Dragon Set',
    setBonuses: [
        { requiredPieces: 2, bonusStats: { attack_damage: 25 } },
        { requiredPieces: 3, bonusStats: { attack_damage: 50, crit_chance: 0.05 } },
        { requiredPieces: 4, bonusStats: { attack_damage: 100, crit_chance: 0.10, crit_damage: 0.20 } }
    ]
}];

const activeBonuses = setBonusResolver.getActiveBonuses(setData, setTemplates, heroData);
// Result: [2-piece bonus, 3-piece bonus] are active
```

### Example 4: Conditional Modifier

```javascript
// Create a "Recklessness" skill that grants bonus attack when HP is low
const attackStat = new EnhancedStat(100, { name: 'attack_damage' });

attackStat.addModifier({
    value: 50,
    type: StatModifierType.FLAT,
    source: 'Recklessness',
    priority: 10,
    condition: {
        type: ConditionType.STAT_THRESHOLD,
        statKey: 'health_max',
        operator: '<',
        threshold: 0.30
    },
    isConditional: true
});

// Normal context (HP > 30%)
const normalValue = attackStat.getValue({ stats: { health_max: 1000 } });
// Result: 100

// Low HP context (HP < 30%)
const lowHPContext = { stats: { health_max: 200 } }; // 200/1000 = 20%
const lowHPValue = attackStat.getValue(lowHPContext);
// Result: 150
```

### Example 5: Stat Allocation

```javascript
async function applyStatAllocation(heroId, allocation) {
    const stats = await enhancedStatService.calculateHeroStats(heroId);
    
    // Player allocates 10 points to STR
    const strAllocation = 10;
    
    // This is applied in Layer 3 (ALLOCATION)
    // Result: Base STR + Allocation
    const totalSTR = stats.attributes.str + strAllocation;
    
    // STR provides bonus attack damage (1 STR = 0.5 ATK)
    const strBonus = totalSTR * 0.5;
    
    return {
        allocatedSTR: strAllocation,
        strBonus: strBonus
    };
}
```

### Example 6: Level-Up Prediction

```javascript
async function predictLevelUp(heroId, targetLevel) {
    const predicted = await enhancedStatService.predictStatsAtLevel(
        heroId,
        targetLevel,
        { includeBreakdown: true }
    );
    
    return {
        currentLevel: predicted.unitLevel,
        predictedLevel: targetLevel,
        predictedHP: predicted.health_max,
        predictedATK: predicted.attack_damage,
        growthFromLevelUp: predicted.growthEstimate
    };
}
```

### Example 7: Soft Cap with Diminishing Returns

```javascript
// Create stat with soft cap
const dodgeRate = new EnhancedStat(0, {
    name: 'dodge_rate',
    max: 0.95,           // Hard cap: 95%
    softCap: 0.50,       // Soft cap: 50%
    softCapFactor: 0.5   // 50% diminishing returns above soft cap
});

// Add modifiers
dodgeRate.addModifier({ value: 0.30, type: StatModifierType.FLAT, source: 'Base' });
dodgeRate.addModifier({ value: 0.30, type: StatModifierType.FLAT, source: 'Gear' });

// Calculation:
// Raw value: 0.60
// Above soft cap: 0.10 (0.60 - 0.50)
// Reduced by factor: 0.10 * 0.5 = 0.05
// Final value: 0.50 + 0.05 = 0.55

const finalDodge = dodgeRate.getValue();
console.log(finalDodge); // 0.55 (instead of raw 0.60)
```

### Example 8: Detailed Breakdown for UI

```javascript
async function getStatBreakdown(heroId) {
    const result = await enhancedStatService.calculateStatsWithBreakdown(heroId);
    
    // Display attack_damage breakdown
    const attackBreakdown = result.breakdowns.attack_damage;
    
    console.log('Attack Damage Breakdown:');
    console.log(`Base Value: ${attackBreakdown.baseValue}`);
    console.log(`Flat Modifiers: ${attackBreakdown.modifiers.flat.length}`);
    console.log(`Percent Add Modifiers: ${attackBreakdown.modifiers.percentAdd.length}`);
    console.log(`Percent Mult Modifiers: ${attackBreakdown.modifiers.percentMult.length}`);
    console.log(`Active Conditional: ${attackBreakdown.activeConditionalModifiers.length}`);
    console.log(`Final Value: ${attackBreakdown.finalValue}`);
    
    return attackBreakdown;
}
```

---

## Best Practices

### 1. Use Modifiers Instead of Direct Value Changes

```javascript
// ❌ Avoid: Direct modification
stat.value += 10;

// ✅ Preferred: Use modifiers
stat.addModifier(new StatModifier({
    value: 10,
    type: StatModifierType.FLAT,
    source: 'Bonus'
}));
```

**Why**: Modifiers track source, allow removal, support conditions, and enable detailed breakdowns.

### 2. Use Appropriate Modifier Types

```javascript
// ❌ Wrong: Percentage bonus as FLAT
stat.addModifier({ value: 0.10, type: StatModifierType.FLAT, source: 'Bonus' });

// ✅ Correct: Percentage bonus as PERCENT_ADD
stat.addModifier({ value: 0.10, type: StatModifierType.PERCENT_ADD, source: 'Bonus' });
```

### 3. Set Appropriate Caps

```javascript
// ❌ Avoid: No caps
const crit = new EnhancedStat(0, { name: 'crit_chance' });

// ✅ Preferred: Set appropriate caps
const crit = new EnhancedStat(0, {
    name: 'crit_chance',
    max: 1.0,      // 100% max
    min: 0,
    type: 'percent'
});
```

### 4. Use Conditional Modifiers for Context-Aware Effects

```javascript
// ❌ Avoid: Manual condition checking
if (hero.level >= 50 && hero.hp < 0.3) {
    stat.addModifier({ value: 50, ... });
}

// ✅ Preferred: Conditional modifiers
stat.addModifier({
    value: 50,
    type: StatModifierType.FLAT,
    source: 'Recklessness',
    condition: {
        type: ConditionType.STAT_THRESHOLD,
        statKey: 'health_max',
        operator: '<',
        threshold: 0.30
    },
    isConditional: true
});
```

### 5. Use Caching for Performance

```javascript
// ✅ Enable caching in production
const statService = new EnhancedStatService({
    cacheEnabled: true,
    cacheTTL: 30000  // 30 seconds
});

// Force recalculation when needed
const stats = await statService.calculateHeroStats(heroId, {
    forceRecalculate: true
});
```

### 6. Invalidate Cache on Relevant Changes

```javascript
// When hero equipment changes
async function equipItem(heroId, item) {
    await db.heroEquipment.create({ ... });
    
    // Invalidate cache
    statService.invalidateHeroCache(heroId);
}

// When hero levels up
async function levelUp(heroId, newLevel) {
    await db.hero.update({ where: { id: heroId }, data: { unitLevel: newLevel } });
    
    // Invalidate cache
    statService.invalidateHeroCache(heroId);
}
```

### 7. Use Detailed Breakdowns for Debugging

```javascript
// When debugging stat calculations
const breakdown = stat.getDetailedBreakdown(context);

console.log('Modifiers Applied:');
breakdown.modifiers.flat.forEach(m => {
    console.log(`  ${m.source}: +${m.value}`);
});

console.log('Intermediate Values:');
console.log(`  After Flat: ${breakdown.intermediateValues.afterFlat}`);
console.log(`  After Percent Add: ${breakdown.intermediateValues.afterPercentAdd}`);
console.log(`  After Percent Mult: ${breakdown.intermediateValues.afterPercentMult}`);
```

---

## API Reference

### EnhancedStatService Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `calculateHeroStats` | `heroId`, `context` | `Promise<Object>` | Calculate all hero stats |
| `calculateStatsWithBreakdown` | `heroId`, `context` | `Promise<Object>` | Calculate with detailed breakdown |
| `predictStatsAtLevel` | `heroId`, `targetLevel`, `options` | `Promise<Object>` | Predict stats at target level |
| `invalidateHeroCache` | `heroId` | `void` | Clear cache for a hero |
| `clearCache` | - | `void` | Clear all caches |

### EnhancedStat Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addModifier` | `modifier` | `EnhancedStat` | Add modifier (chainable) |
| `addModifiers` | `modifiers[]` | `EnhancedStat` | Add multiple (chainable) |
| `removeModifier` | `modifierId` | `EnhancedStat` | Remove by ID (chainable) |
| `clearModifiers` | `keepBase` | `EnhancedStat` | Clear all (chainable) |
| `setBase` | `value` | `EnhancedStat` | Set base (chainable) |
| `setCaps` | `caps` | `EnhancedStat` | Set caps (chainable) |
| `setGrowthCurve` | `config` | `EnhancedStat` | Set curve (chainable) |
| `getValue` | `context` | `number` | Calculate final value |
| `getDetailedBreakdown` | `context` | `Object` | Get calculation details |
| `getValueAtLevel` | `level`, `options` | `number` | Value at specific level |
| `clone` | - | `EnhancedStat` | Create copy |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial implementation |
| 1.1.0 | 2024-02-20 | Added soft caps and diminishing returns |
| 1.2.0 | 2024-03-10 | Added conditional modifiers |
| 1.3.0 | 2024-04-05 | Added set bonus system |
| 1.4.0 | 2024-05-15 | Added elemental system |
| 1.5.0 | 2024-06-20 | Added caching and performance optimizations |
| 2.0.0 | 2024-08-01 | Full rewrite with 12-layer calculation pipeline |

---

*Last Updated: 2024-08-01*
*Document Version: 2.0*

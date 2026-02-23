# Hero Bond System Documentation

**Layer:** 9.5 (BOND)  
**Implementation:** `server/src/services/stat/HeroBondResolver.js`

---

## Overview

Hero Bond System provides party synergy bonuses based on the composition of heroes in a user's formation. This encourages players to build teams with complementary classes, races, or elemental affinities.

---

## Bond Types

### 1. CLASS Bond

Based on matching combat classes in the party.

- "Warrior Trio": 3 Warriors → +15% Attack
- "Mage Circle": 3 Mages → +20% Magic Attack
- "Rogue's Guild": 2+ Rogues → +10% Critical Damage

### 2. RACE Bond

Based on matching races in the party.

- "Human Alliance": 3 Humans → +5% all stats
- "Elven Grace": 2+ Elves → +10% Dodge

### 3. ELEMENTAL Bond

Based on matching elemental affinities.

- "Fire Covenant": 2+ Fire heroes → +15% Fire Damage
- "Ice Alliance": 2+ Water heroes → +10% Defense

---

## Implementation

```javascript
class HeroBondResolver {
    async calculateActiveBonds(userId) {
        const partyHeroes = await this.getPartyHeroes(userId);
        const templates = await this.getBondTemplates();
        const activeBonds = [];

        for (const template of templates) {
            const matched = this.checkBondRequirement(template, partyHeroes);
            if (matched) {
                activeBonds.push({
                    name: template.name,
                    bondType: template.bondType,
                    bonuses: JSON.parse(template.bonuses)
                });
            }
        }
        return activeBonds;
    }
}
```

### Integration in Stat Calculation

```javascript
// In StatCalculationEngine.js - Layer 9.5
async _applyHeroBonds(stats, heroData, context, applyMod) {
    const activeBonds = await HeroBondResolver.calculateActiveBonds(heroData.userId);
    
    for (const bond of activeBonds) {
        for (const [statKey, value] of Object.entries(bond.bonuses)) {
            applyMod(statKey, value, PERCENT_ADD, `Bond:${bond.name}`);
        }
    }
}
```

---

## Bond Application Flow

```
1. User changes formation
       ↓
2. HeroBondResolver.recalculateBonds(userId)
       ↓
3. Get all heroes in active formation
       ↓
4. Check each bond template against party
       ↓
5. Save active bonds to database
       ↓
6. Invalidate stat cache
       ↓
7. Next stat calculation includes bond bonuses
```

---

## Related Files

- [`StatCalculationEngine.js`](../../../server/src/services/stat/StatCalculationEngine.js) - Layer 9.5
- [`HeroBondResolver.js`](../../../server/src/services/stat/HeroBondResolver.js)

---

*Last Updated: 2026-02-18*

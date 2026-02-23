# AI Reference: Hero Bond System

**Layer:** 9.5 (BOND)

---

## Bond Types

### CLASS Bond
- Based on matching combat classes in party
- Example: "Warrior Trio" (3 Warriors) → +15% Attack

### RACE Bond
- Based on matching races in party
- Example: "Human Alliance" (3 Humans) → +5% all stats

### ELEMENTAL Bond
- Based on matching elemental affinities
- Example: "Fire Covenant" (2+ Fire) → +15% Fire Damage

---

## Flow

```
1. User changes formation
2. HeroBondResolver.recalculateBonds(userId)
3. Check each bond template against party
4. Save active bonds to database
5. Invalidate stat cache
6. Next stat calculation includes bond bonuses
```

---

*See [`docs/HUMAN/STAT/HERO_BOND_SYSTEM.md`](../../docs/HUMAN/STAT/HERO_BOND_SYSTEM.md) for detailed docs*

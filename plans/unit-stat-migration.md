# Unit Stat System - Migration Strategy

## Overview
Strategi migrasi untuk upgrade sistem stat tanpa merusak data yang sudah ada.

---

## Migration Steps

### Phase 1: Database Schema Update

#### 1.1 Add New Columns (Safe)
```sql
ALTER TABLE Hero ADD COLUMN luk INTEGER DEFAULT 5;
ALTER TABLE Hero ADD COLUMN fire_damage INTEGER DEFAULT 0;
ALTER TABLE Hero ADD COLUMN water_damage INTEGER DEFAULT 0;
ALTER TABLE Hero ADD COLUMN earth_damage INTEGER DEFAULT 0;
ALTER TABLE Hero ADD COLUMN wind_damage INTEGER DEFAULT 0;
ALTER TABLE Hero ADD COLUMN light_damage INTEGER DEFAULT 0;
ALTER TABLE Hero ADD COLUMN dark_damage INTEGER DEFAULT 0;
ALTER TABLE Hero ADD COLUMN defense_base INTEGER DEFAULT 0;
-- ... other new columns
```

#### 1.2 Create New Tables
```sql
CREATE TABLE ElementalType (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weaknessTo TEXT,
    resistOf TEXT
);

CREATE TABLE HeroElementalAffinity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    heroId INTEGER NOT NULL,
    elementTypeId TEXT NOT NULL,
    resistance REAL DEFAULT 0,
    bonusDamage REAL DEFAULT 0,
    FOREIGN KEY (heroId) REFERENCES Hero(id),
    FOREIGN KEY (elementTypeId) REFERENCES ElementalType(id),
    UNIQUE(heroId, elementTypeId)
);

CREATE TABLE EquipmentSetTemplate (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE EquipmentSetBonus (
    id INTEGER PRIMARY KEY,
    setId INTEGER NOT NULL,
    requiredPieces INTEGER NOT NULL,
    description TEXT,
    bonusStats TEXT,
    bonusSkillId INTEGER,
    FOREIGN KEY (setId) REFERENCES EquipmentSetTemplate(id),
    UNIQUE(setId, requiredPieces)
);

CREATE TABLE HeroStatAllocation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    heroId INTEGER UNIQUE NOT NULL,
    availablePoints INTEGER DEFAULT 0,
    strAllocated INTEGER DEFAULT 0,
    dexAllocated INTEGER DEFAULT 0,
    intAllocated INTEGER DEFAULT 0,
    vitAllocated INTEGER DEFAULT 0,
    statCaps TEXT DEFAULT '{}',
    totalSpent INTEGER DEFAULT 0,
    lastResetAt DATETIME,
    FOREIGN KEY (heroId) REFERENCES Hero(id)
);

CREATE TABLE HeroStatHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    heroId INTEGER NOT NULL,
    recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    primaryStats TEXT NOT NULL,
    secondaryStats TEXT NOT NULL,
    level INTEGER NOT NULL,
    equippedItems TEXT,
    activeBuffs TEXT,
    FOREIGN KEY (heroId) REFERENCES Hero(id)
);
```

#### 1.3 Seed Data
```sql
INSERT INTO ElementalType (id, name, weaknessTo, resistOf) VALUES
('FIRE', 'Fire', 'WATER', 'WIND'),
('WATER', 'Water', 'EARTH', 'FIRE'),
('EARTH', 'Earth', 'WIND', 'WATER'),
('WIND', 'Wind', 'FIRE', 'EARTH'),
('LIGHT', 'Light', 'DARK', 'DARK'),
('DARK', 'Dark', 'LIGHT', 'LIGHT');
```

---

### Phase 2: Code Migration

#### 2.1 Update statSystem.js
```javascript
// Backward compatible - existing code still works
class Stat {
    constructor(baseValue) {
        this.baseValue = baseValue;
        this.modifiers = [];
    }
    // ... existing methods
}

// Add new EnhancedStat class
class EnhancedStat {
    constructor(baseValue, config = {}) {
        this.baseValue = baseValue;
        this.modifiers = [];
        this.minValue = config.minValue ?? -Infinity;
        this.maxValue = config.maxValue ?? Infinity;
        this.curveType = config.curveType ?? 'linear';
    }
    // ... new methods
}

module.exports = { Stat, StatModifier, EnhancedStat };
```

#### 2.2 Update statService.js
```javascript
// Phase 1: Calculate using old system first
const oldStats = this._calculateOldStats(heroData);

// Phase 2: Merge with new stats
const newStats = this._calculateNewStats(heroData);

// Phase 3: Return combined result (new overrides old)
return { ...oldStats, ...newStats };
```

---

### Phase 3: Data Migration

#### 3.1 Migrate Existing Heroes
```javascript
async function migrateExistingHeroes() {
    const heroes = await db.hero.findMany();
    
    for (const hero of heroes) {
        // 1. Initialize stat allocation (0 points)
        await db.heroStatAllocation.create({
            data: {
                heroId: hero.id,
                availablePoints: 0,
                strAllocated: 0,
                dexAllocated: 0,
                intAllocated: 0,
                vitAllocated: 0
            }
        });
        
        // 2. Create initial stat history snapshot
        await db.heroStatHistory.create({
            data: {
                heroId: hero.id,
                primaryStats: JSON.stringify({
                    str: hero.str,
                    dex: hero.dex,
                    int: hero.int,
                    vit: hero.vit,
                    luk: hero.luk || 5
                }),
                secondaryStats: JSON.stringify({
                    health_max: hero.hp_base,
                    mana_max: hero.mana_base,
                    attack_damage: hero.damage_base
                }),
                level: hero.unitLevel
            }
        });
    }
}
```

#### 3.2 Default Stat Allocation
- All existing heroes: `availablePoints = 0`
- All allocated: `0`
- Caps: Set based on hero level

---

### Phase 4: Testing Strategy

#### 4.1 Unit Tests
```javascript
describe('EnhancedStat', () => {
    it('should calculate flat modifiers correctly', () => {
        const stat = new EnhancedStat(100);
        stat.addModifier(new StatModifier(10, 0)); // +10 flat
        assert.equal(stat.getValue(), 110);
    });
    
    it('should respect max value cap', () => {
        const stat = new EnhancedStat(100, { maxValue: 150 });
        stat.addModifier(new StatModifier(100, 0));
        assert.equal(stat.getValue(), 150);
    });
});
```

#### 4.2 Integration Tests
```javascript
describe('StatService', () => {
    it('should calculate hero stats correctly', async () => {
        const hero = await createTestHero();
        const stats = await statService.calculateHeroStats(hero.id);
        
        assert(stats.health_max > 0);
        assert(stats.attack_damage > 0);
        assert(stats.attributes.str > 0);
    });
});
```

#### 4.3 Migration Tests
```javascript
describe('Migration', () => {
    it('should preserve existing hero stats', async () => {
        const hero = await createHeroWithKnownStats({
            str: 50,
            dex: 40,
            hp_base: 1000
        });
        
        await migrateHero(hero.id);
        
        const newHero = await db.hero.findUnique({ where: { id: hero.id } });
        assert.equal(newHero.str, 50);
        assert.equal(newHero.hp_base, 1000);
    });
});
```

---

### Phase 5: Rollout Plan

#### 5.1 Staged Rollout
1. **Deploy Schema Changes** (Day 1)
   - Add columns (non-destructive)
   - Create new tables
   - Seed data

2. **Deploy Code Changes** (Day 2)
   - Deploy new statSystem.js
   - Deploy new statService.js
   - All endpoints backward compatible

3. **Enable New Features** (Day 3)
   - Enable stat allocation UI
   - Enable set bonuses
   - Enable elemental system

#### 5.2 Rollback Plan
- Keep old stat calculation method as fallback
- Feature flags for new functionality
- Quick toggle to disable if issues arise

---

### Phase 6: Data Verification

#### 6.1 Verification Queries
```sql
-- Check all heroes have stat allocation record
SELECT COUNT(*) as total,
       COUNT(ha.id) as with_allocation
FROM Hero h
LEFT JOIN HeroStatAllocation ha ON h.id = ha.heroId;

-- Verify stat values preserved
SELECT h.id, h.str, h.hp_base, h.damage_base
FROM Hero h
WHERE h.str IS NULL OR h.hp_base IS NULL;
```

#### 6.2 Health Checks
- Random sample verification (10% of heroes)
- Compare old vs new calculation results
- Log any discrepancies

---

## Backward Compatibility

### Old API Still Works
```javascript
// Old endpoint still returns same format
GET /hero/:id/profile

// Returns:
{
    "name": "Hero",
    "totalStats": {
        "hp_base": 100,
        "damage_base": 10
    }
}
```

### New API Adds Fields
```javascript
// New endpoint adds more data
GET /stats/:id

// Returns:
{
    "attributes": { "str": 10, ... },
    "health_max": 100,
    "attack_damage": 15,
    "fire_damage": 5,
    // ... new fields
}
```

---

## Summary

| Phase | Action | Risk |
|-------|--------|------|
| 1 | Add columns | Low |
| 2 | Create tables | Low |
| 3 | Seed data | Low |
| 4 | Deploy code | Medium |
| 5 | Enable features | Medium |
| 6 | Verify data | Low |

**Total Risk**: Medium (code changes during phase 4-5)
**Rollback**: Possible up to phase 3
**Downtime**: None (all migrations are backward compatible)

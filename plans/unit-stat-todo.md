# Unit Stat System - Implementation Order

## Overview
This file contains the complete ordered task list for implementing the enhanced unit stat system across the Textical game project.

---

## Phase 1: Database Foundation

### 1.1 Schema Enhancement
- [ ] Create new Prisma models in `server/prisma/schema.prisma`
  - [ ] ElementalType enum
  - [ ] HeroElementalAffinity model
  - [ ] EquipmentSetTemplate model
  - [ ] EquipmentSetPiece model
  - [ ] HeroEquipmentSet model
  - [ ] HeroStatAllocation model
  - [ ] StatAllocationTemplate model
  - [ ] HeroStatHistory model
  - [ ] SetBonusCondition model

### 1.2 Data Migration
- [ ] Create seed data for element types
- [ ] Create seed data for stat allocation templates
- [ ] Create seed data for equipment set templates
- [ ] Create seed data for set bonuses with conditions

---

## Phase 2: Backend Logic Core

### 2.1 EnhancedStat Class
- [ ] Refactor `server/src/logic/statSystem.js`
  - [ ] Add stat caps (soft/hard)
  - [ ] Add growth curves (linear/exponential/sigmoid)
  - [ ] Add conditional modifiers with priority
  - [ ] Add stat aggregation from multiple sources

### 2.2 EnhancedStatService
- [ ] Refactor `server/src/services/statService.js`
  - [ ] Implement layered stat calculation
  - [ ] Add stat caching with invalidation
  - [ ] Add real-time stat recalculation
  - [ ] Integrate element type modifiers
  - [ ] Integrate set bonus system

### 2.3 Supporting Services
- [ ] Create `server/src/services/stat/ElementalResolver.js`
  - [ ] Calculate elemental multipliers
  - [ ] Handle elemental resistances
  - [ ] Support elemental weaknesses

- [ ] Create `server/src/services/stat/SetBonusResolver.js`
  - [ ] Check equipped set pieces
  - [ ] Apply conditional bonuses
  - [ ] Handle set bonus stacking

- [ ] Create `server/src/services/stat/StatCapResolver.js`
  - [ ] Apply soft caps with diminishing returns
  - [ ] Apply hard caps (absolute limits)
  - [ ] Support cap exemptions

- [ ] Create `server/src/services/stat/StatCurveCalculator.js`
  - [ ] Implement linear growth
  - [ ] Implement exponential growth
  - [ ] Implement sigmoid growth
  - [ ] Support custom growth curves

---

## Phase 3: Integration with Existing Systems

### 3.1 Battle System Integration
- [ ] Update `server/src/logic/battleUnit.js`
  - [ ] Use EnhancedStats for stat access
  - [ ] Implement action point calculation
  - [ ] Implement resource type handling (Mana/Rage/Energy)
  - [ ] Add stealth mechanics integration
  - [ ] Add directional combat bonuses

- [ ] Update `server/src/logic/battleRules.js`
  - [ ] Integrate dodge/miss mechanics
  - [ ] Implement accuracy vs dodge calculation
  - [ ] Add critical hit bonuses
  - [ ] Implement block/parry mechanics

### 3.2 Status Effect Integration
- [ ] Update `server/src/logic/status/BaseStatus.js`
  - [ ] Add stat modifier integration
  - [ ] Implement conditional status effects
  - [ ] Add status effect priority system

- [ ] Create new status definitions in `server/src/logic/status/definitions/`
  - [ ] BurnStatus (damage over time)
  - [ ] StunStatus (action denial)
  - [ ] LeadenStatus (speed reduction)
  - [ ] WetStatus (elemental weakness)
  - [ ] StealthStatus (invisibility)
  - [ ] ShieldStatus (damage absorption)

### 3.3 Trait System Integration
- [ ] Update `server/src/logic/traits/BaseTrait.js`
  - [ ] Add stat modifier hooks
  - [ ] Implement trait stat bonuses
  - [ ] Add conditional trait effects

- [ ] Refactor trait stat application in `statService.js`
  - [ ] Apply trait stat bonuses in correct order
  - [ ] Handle trait stat stacking
  - [ ] Support trait stat conditions

### 3.4 Equipment System Integration
- [ ] Update `server/src/services/statService.js`
  - [ ] Integrate item quality multipliers
  - [ ] Implement durability stat penalties
  - [ ] Add set bonus application
  - [ ] Support affix stat bonuses

- [ ] Update `server/src/logic/crafting/QualityResolver.js`
  - [ ] Connect quality to stat scaling
  - [ ] Implement quality-based stat caps

### 3.5 Guild System Integration
- [ ] Update `server/src/logic/guild/FacilityEffectResolver.js`
  - [ ] Connect facility buffs to stat system
  - [ ] Implement facility stat stacking

### 3.6 Faction System Integration
- [ ] Update `server/src/services/factionService.js`
  - [ ] Connect faction perks to stat bonuses
  - [ ] Implement faction stat modifiers

### 3.7 World/Environment Integration
- [ ] Update `server/src/logic/world/EnvironmentalResolver.js`
  - [ ] Connect environmental modifiers to stat calculation
  - [ ] Implement day/night stat bonuses
  - [ ] Add weather stat modifiers

---

## Phase 4: Client-Side Implementation

### 4.1 Network Layer
- [ ] Create `client/src/network/StatHandler.gd`
  - [ ] Implement stat sync protocol
  - [ ] Add stat change notifications
  - [ ] Implement stat comparison requests

- [ ] Update `client/src/network/SocketHandler.gd`
  - [ ] Add stat event handlers
  - [ ] Integrate stat handler with socket

### 4.2 UI Components
- [ ] Create `client/src/ui/components/StatDisplay.gd`
  - [ ] Display individual stats
  - [ ] Show stat values with formatting
  - [ ] Add stat tooltips

- [ ] Create `client/src/ui/components/StatComparison.gd`
  - [ ] Compare current vs base stats
  - [ ] Show stat differences
  - [ ] Highlight changed stats

- [ ] Create `client/src/ui/components/StatAllocation.gd`
  - [ ] Show available stat points
  - [ ] Implement stat allocation UI
  - [ ] Preview stat changes

- [ ] Create `client/src/ui/HeroProfileScreen.gd` updates
  - [ ] Integrate stat display panels
  - [ ] Add stat comparison view
  - [ ] Show elemental affinities
  - [ ] Display set bonuses

### 4.3 HUD Updates
- [ ] Update `client/src/ui/TopHUD.gd`
  - [ ] Add stat summary display
  - [ ] Show resource bars (HP/MP/AP)
  - [ ] Add buff/debuff indicators

- [ ] Update `client/src/ui/BottomHUD.gd`
  - [ ] Add action point display
  - [ ] Show resource regeneration

---

## Phase 5: API Development

### 5.1 REST Endpoints
- [ ] Create `server/src/routes/statRoutes.js`
  - [ ] GET /api/stats/:heroId - Get hero stats
  - [ ] GET /api/stats/:heroId/history - Get stat history
  - [ ] POST /api/stats/:heroId/allocate - Allocate stat points
  - [ ] GET /api/stats/:heroId/capabilities - Get stat caps
  - [ ] GET /api/stats/elemental/:heroId - Get elemental data

### 5.2 Socket Events
- [ ] Create `server/src/handlers/statHandler.js`
  - [ ] stat:request - Client requests stat data
  - [ ] stat:update - Server sends stat update
  - [ ] stat:allocate - Client requests stat allocation
  - [ ] stat:compare - Client requests stat comparison

---

## Phase 6: Testing & Validation

### 6.1 Unit Tests
- [ ] Test EnhancedStat class
  - [ ] Stat calculation with modifiers
  - [ ] Stat caps application
  - [ ] Growth curve calculations
  - [ ] Conditional modifiers

- [ ] Test StatService
  - [ ] Layered stat calculation
  - [ ] Equipment stat integration
  - [ ] Trait stat application
  - [ ] Status effect modifiers

### 6.2 Integration Tests
- [ ] Test battle system integration
  - [ ] Stat usage in damage calculation
  - [ ] Resource type handling
  - [ ] Status effect interactions

- [ ] Test equipment integration
  - [ ] Quality multiplier application
  - [ ] Durability stat penalties
  - [ ] Set bonus activation

### 6.3 Audit Scripts
- [ ] Create audit scripts for validation
  - [ ] `stat_growth_audit.js` - Verify level-based growth
  - [ ] `stat_durability_integrity_audit.js` - Verify durability impact
  - [ ] `stat_instance_trait_audit.js` - Verify instance traits
  - [ ] `stat_quality_audit.js` - Verify quality scaling
  - [ ] `stat_elemental_audit.js` - Verify elemental modifiers

---

## Phase 7: Documentation

### 7.1 Code Documentation
- [ ] Document EnhancedStat class
- [ ] Document StatService methods
- [ ] Document stat calculation pipeline
- [ ] Add inline comments for complex logic

### 7.2 Design Documentation
- [ ] Update `docs/STAT_SYSTEM.md` with new architecture
- [ ] Document stat calculation flow
- [ ] Document integration points
- [ ] Add examples and use cases

---

## Priority Order

### High Priority (Phase 1-2)
1. Database schema enhancement
2. EnhancedStat class implementation
3. StatService refactoring
4. Basic stat calculation pipeline

### Medium Priority (Phase 3)
5. Battle system integration
6. Equipment system integration
7. Status effect integration
8. Trait system integration

### Lower Priority (Phase 4-7)
9. Client-side UI implementation
10. API development
11. Testing and validation
12. Documentation

---

## Estimated Dependencies

```
Phase 1 (Database) ──────────────┐
                                  │
Phase 2 (Backend Core) ──────────┼─── Prerequisite for Phase 3
                                  │
Phase 3 (Integration) ───────────┼─── Prerequisite for Phase 4-7
                                  │
Phase 4 (Client UI) ─────────────┼─── Requires Phase 3 completion
                                  │
Phase 5 (API) ───────────────────┼─── Can run parallel with Phase 4
                                  │
Phase 6 (Testing) ───────────────┼─── Requires Phase 2-5 completion
                                  │
Phase 7 (Documentation) ─────────┴─── Final step
```

---

## Quick Reference

| Phase | Focus | Key Files | Status |
|-------|-------|-----------|--------|
| 1 | Database | `schema.prisma` seeds | ⏳ Pending |
| 2 | Backend Core | `statSystem.js`, `statService.js` | ⏳ Pending |
| 3 | Integration | `battleUnit.js`, `BaseStatus.js` | ⏳ Pending |
| 4 | Client UI | `StatHandler.gd`, `StatDisplay.gd` | ⏳ Pending |
| 5 | API | `statRoutes.js`, `statHandler.js` | ⏳ Pending |
| 6 | Testing | Audit scripts, unit tests | ⏳ Pending |
| 7 | Docs | `STAT_SYSTEM.md` | ⏳ Pending |

---

## Start Here

To begin implementation, start with:
1. Review `plans/unit-stat-db-schema.md` for database details
2. Review `plans/unit-stat-backend-logic.md` for backend architecture
3. Run database migration
4. Implement EnhancedStat class
5. Refactor StatService

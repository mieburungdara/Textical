# Secondary Stats Implementation Plan

## Overview

- **Goal:** Implement design changes from documentation to game engine
- **Changes Required:**
  1. Remove LUK from primary attributes (merge into DEX)
  2. Add Magic Penetration as secondary stat
- **Scope:** Server-side (Node.js), Database Schema

---

## Checklist

### Phase 1: Database Schema Updates

- [ ] 1. Update `server/prisma/schema.prisma`
  - Files: `schema.prisma`
  - TEST: Check Hero model has no luk field
  - IMPLEMENT: Remove `luk` field from Hero model
  - VERIFY: Run `npx prisma migrate dev` and verify schema

### Phase 2: Stat Calculation Services

- [ ] 2. Update `EnhancedScalingComponent.js`
  - Files: `server/src/services/stat/EnhancedScalingComponent.js`
  - TEST: crit_chance comes from DEX, not LUK
  - IMPLEMENT: Remove LUK references, add crit_chance to DEX scaling
  - VERIFY: Run stat calculation test

- [ ] 3. Update `StatCapResolver.js`
  - Files: `server/src/services/stat/StatCapResolver.js`
  - TEST: No luk in caps
  - IMPLEMENT: Remove luk from stat caps
  - VERIFY: Verify no luk cap errors

- [ ] 4. Update `StatCurveCalculator.js`
  - Files: `server/src/services/stat/StatCurveCalculator.js`
  - TEST: No luk allocation
  - IMPLEMENT: Remove luk from allocation calculations
  - VERIFY: Verify allocation sums correctly

- [ ] 5. Update `StatAllocationService.js`
  - Files: `server/src/services/stat/StatAllocationService.js`
  - TEST: No luk recommendations
  - IMPLEMENT: Remove luk from class recommendations
  - VERIFY: Verify recommendations load correctly

- [ ] 6. Update `StatHistoryService.js`
  - Files: `server/src/services/stat/StatHistoryService.js`
  - TEST: No luk in history
  - IMPLEMENT: Remove luk from history tracking
  - VERIFY: Verify history queries work

- [ ] 7. Update `ProfileCalculator.js`
  - Files: `server/src/services/formation/ProfileCalculator.js`
  - TEST: No luk in profile
  - IMPLEMENT: Remove luk from profile calculations
  - VERIFY: Verify formation stats display correctly

### Phase 3: Magic Penetration

- [ ] 8. Add Magic Penetration to stat system
  - Files: `EnhancedScalingComponent.js`, `StatCapResolver.js`
  - TEST: magic_pen stat exists and calculates
  - IMPLEMENT: Add magic_pen as equipment-based stat
  - VERIFY: Verify magic pen affects magic damage

### Phase 4: Testing

- [ ] 9. Run integration tests
  - Files: All modified services
  - TEST: Full stat pipeline execution
  - IMPLEMENT: Run existing test suites
  - VERIFY: All tests pass

---

## Progress Log

- 2026-02-18 - Plan created

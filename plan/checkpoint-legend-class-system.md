# Legendary Class System (v5.0)

## Feature summary
- Goal: Implement a deep, 4-tier class evolution system with unique resource mechanics and tactical role specializations.
- User-facing behavior: Heroes can promote to higher classes, gain specific stats per level, and use different energy types (Rage for Warriors, Energy for Rogues, Mana for Mages).
- Scope (in): Prisma schema expansion, StatGrowthSystem, DynamicResourceEngine, PromotionService, Tactical Role traits.
- Scope (out): Front-end skill tree UI (logic only).
- Assumptions: Heroes start as "Novice" (ID 1001). 4-tier hierarchy is enforced.
- Risks: Balancing growth curves to prevent power creep.

## Checklist

- [x] Upgrade Database Schema (Classes & Growth)
  - Files: `server/prisma/schema.prisma`
  - TEST: Run `npx prisma migrate` and verify fields.
  - IMPLEMENT: Add tier, resourceType, and growth fields to ClassTemplate.
  - VERIFY: Database successfully accepts class-specific growth metadata.

- [x] Implement StatGrowthSystem
  - Files: `server/src/services/stat/StatGrowthSystem.js`, `server/src/services/statService.js`
  - TEST: `stat_growth_audit.js`
  - IMPLEMENT: Logic to calculate stats as `Base + (Growth * Level)`.
  - VERIFY: A Level 50 Knight has significantly more HP than a Level 1 Knight.

- [x] Implement Dynamic Resource Engine
  - Files: `server/src/logic/battleUnit.js`, `server/src/logic/rules/ResourceResolver.js`
  - TEST: `resource_mechanic_audit.js`
  - IMPLEMENT: Rage (gain on hit), Energy (fast regen), Mana (slow regen).
  - VERIFY: Warrior starts with 0 Rage and gains it during combat.

- [x] Implement Promotion Service
  - Files: `server/src/services/promotionService.js`
  - TEST: `promotion_audit.js`
  - IMPLEMENT: Check Level/Deeds requirements and update classId in DB.
  - VERIFY: Novice promotes to Warrior at Level 20.

- [x] Implement Tactical Role Specializations
  - Files: `server/src/logic/traits/definitions/Vanguard.js`, `server/src/logic/traits/definitions/Disruptor.js`
  - TEST: `debug_tactical_roles.js`
  - IMPLEMENT: Zone of Control (Knight) and Slipstream (Rogue) logic.
  - VERIFY: Knight protects adjacent allies; Rogue moves through enemies.

## Progress log
- 2026-01-29T19:45:00 - Initial system design and plan creation.
- 2026-01-29T19:55:00 - Upgraded Prisma schema and seeded class hierarchy.
- 2026-01-29T20:05:00 - Implemented StatGrowthSystem and verified with audit.
- 2026-01-29T20:15:00 - Implemented Dynamic Resource Engine and verified Rage/Energy mechanics.
- 2026-01-29T20:25:00 - Implemented PromotionService and verified class advancement.
- 2026-01-29T20:35:00 - Implemented Tactical Role Specializations (Vanguard & Disruptor).

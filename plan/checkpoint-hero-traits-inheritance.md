# Hero Traits & Inheritance Expansion

## Feature summary (high-level, 5–10 lines)
- Goal: Deepen the genetic trait system and implement an Albion-style inheritance model for hero creation.
- User-facing behavior: New heroes can be "born" from existing heroes, inheriting their parents' traits with a 70/30 probability split and a 5% "Mutation" stat bonus for each generation. This adds massive value to heroes with rare traits in the auction house.
- Scope (in): DB schema for Hero Parent-Child relations, `InheritanceLogic` component, `HeroBreedingService`, and specialized "Inheritable" traits.
- Scope (out): 3D breeding visuals (UI will be text/data-driven).
- Assumptions: A hero can only have one offspring in their lifetime (as per lore).
- Risks: Infinite stat inflation if mutation bonuses are not capped.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Inheritance & Generation
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `Hero` model has `fatherId`, `motherId`, `generation`, and `hasOffspring` fields.
  - IMPLEMENT: Add self-referencing relations for parents. Add `generation` (Int, default 1) and `hasOffspring` (Boolean, default false).
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Inheritance Logic Component
  - Files: `server/src/logic/genetics/InheritanceResolver.js` (NEW)
  - TEST: `inheritance_logic_audit.js`
  - IMPLEMENT: Pure function to calculate trait inheritance (70% Father, 30% Mother) and mutation rolls. Calculate base stat bonuses (+5% per gen).
  - VERIFY: Audit confirms correct trait distribution over 100 simulated births.

- [x] Implement Hero Breeding Service
  - Files: `server/src/services/heroBreedingService.js` (NEW)
  - TEST: `hero_breeding_audit.js`
  - IMPLEMENT: Orchestrator to handle the "Breeding" transaction: Verify 1 offspring limit -> Consume gold/vitality -> Resolve genetics -> Create new Hero -> Mark parents.
  - VERIFY: Parents are correctly flagged as `hasOffspring: true` and cannot breed again.

- [x] Final Genetic Integrity Audit
  - Files: `server/src/scripts/hero_inheritance_master_audit.js`
  - TEST: Breed two Heroes -> Verify child inherits traits -> Verify child has +5% stats -> Verify parents cannot breed again -> Verify Gen 3 stats.
  - IMPLEMENT: Create and run the master inheritance audit script.
  - VERIFY: 100% relational integrity and logical accuracy.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T13:30:00 - Initial plan for Hero Traits & Inheritance Expansion created.
- 2026-01-31T13:40:00 - Migrated DB schema to include father/mother relations and generation tracking.
- 2026-01-31T13:50:00 - Implemented InheritanceResolver logic for 70/30 trait split and mutation bonuses.
- 2026-01-31T14:00:00 - Created HeroBreedingService orchestrator for lineage generation.
- 2026-01-31T14:15:00 - Verified full genetic inheritance lifecycle (Trait split ➡️ Gen Bonus ➡️ Lock) via Master Audit.
- 2026-01-31T14:20:00 - System finalized and high-fidelity DevLog sent to Telegram.

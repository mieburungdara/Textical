# Branching Tier 2 Class System

## Feature summary
- Goal: Ensure every Tier 1 class has exactly two promotion choices at Tier 2.
- User-facing behavior: When promoting a hero from Tier 1, players will be presented with a choice between two specialized Tier 2 classes.
- Scope (in): `seed_classes.js` update, expansion of Tier 2 class roster (to ~46 classes), metadata alignment.
- Scope (out): Tier 3 implementations, UI screens.
- Assumptions: Promotion logic remains Level 50 and hierarchy-aware.
- Risks: Database ID collisions if not handled carefully.

## Checklist

- [x] Design and Map the 2-Choice Branches
  - Files: N/A (Documentation/Plan)
  - TEST: Verify all 23 Tier 1 classes have 2 distinct Tier 2 targets.
  - IMPLEMENT: Draft the full mapping of parent-child relationships.
  - VERIFY: List is complete and covers all archetypes.

- [x] Update Seeding Script with Expanded Roster
  - Files: `server/src/scripts/seed_classes.js`
  - TEST: Check for unique IDs and consistent `parentClassId` links.
  - IMPLEMENT: Add the new Tier 2 classes and update Tier 1 `leadsTo` metadata.
  - VERIFY: Run the script without errors.

- [x] Sync Database State
  - Files: `prisma/dev.db`
  - TEST: N/A
  - IMPLEMENT: Execute `node server/src/scripts/seed_classes.js`.
  - VERIFY: Count of classes in DB matches the expected 1 (T0) + 23 (T1) + 46 (T2) = 70 total.

- [x] Verify Promotion Eligibility
  - Files: `server/src/scripts/verify_promotion_paths.js`
  - TEST: Write a script to query every Tier 1 class and assert it returns 2 Tier 2 choices.
  - IMPLEMENT: Use `PromotionService.getEligiblePromotions` in a loop.
  - VERIFY: Console output shows "2 options found" for every Tier 1 entry.

## Progress log
- 2026-01-29T18:45:00 - Initial plan for Branching Tier 2 System created.
- 2026-01-29T20:45:00 - Designed 46 specialist branches and successfully seeded the 70-class database.
- 2026-01-29T21:00:00 - Fixed legacy overlap and achieved 100% perfect dual-branching verification.

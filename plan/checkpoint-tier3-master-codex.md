# Tier 3 Master Class Codex (v15.0)

## Feature summary
- Goal: Implement a unique Tier 3 "Master" class for each of the 46 Tier 2 specialized classes.
- User-facing behavior: Heroes reaching Level 75 can promote to their final Master form, gaining peak growth rates and "Game-Ending" tactical mechanics.
- Scope (in): `seed_classes.js` full roster expansion, Tier 3 metadata, Promotion requirement enforcement.
- Scope (out): Unique T3 skill animations (logic only).
- Assumptions: 1-to-1 successor mapping for Tier 3 to ensure hyper-specialization.
- Risks: Database performance with 115+ class templates (negligible for SQLite).

## Checklist

- [x] Design the Full Tier 3 Successor Map (46 Classes)
  - Files: N/A (Documentation)
  - TEST: Verify every T2 ID from 2101-2146 has a corresponding T3 successor.
  - IMPLEMENT: Draft the names, focuses, and ultimate mechanics.
  - VERIFY: Roster is balanced and highly specific.

- [x] Update Seeding Script with T3 Legends
  - Files: `server/src/scripts/seed_classes.js`
  - TEST: Check for parentClassId integrity and Tier 3 flags.
  - IMPLEMENT: Add IDs 3101-3146. Update Tier 2 `leadsTo` metadata.
  - VERIFY: Script runs and upserts without foreign key errors.

- [x] Verify Promotion Hierarchy (T2 -> T3)
  - Files: `server/src/scripts/verify_promotion_paths.js`
  - TEST: Assert that T2 classes now return exactly 1 specialized T3 option.
  - IMPLEMENT: Run the verification script.
  - VERIFY: 100% pathing accuracy.

- [x] Stat Growth Stress Test (End-game Power)
  - Files: `server/src/scripts/stat_growth_audit.js`
  - TEST: Compare a Level 100 T3 Master with a Level 100 T2 Specialist.
  - IMPLEMENT: Run the audit.
  - VERIFY: T3 stats show a clear "Legendary" gap.

## Progress log
- 2026-01-29T21:30:00 - Initial plan for Tier 3 Master Codex created.
- 2026-01-29T21:45:00 - Designed 46 unique Master classes and successfully seeded the database.
- 2026-01-29T21:50:00 - Verified T1->T2 branching and T2->T3 successor links.
- 2026-01-29T22:00:00 - Executed End-game Stress Test and confirmed legendary power gap.

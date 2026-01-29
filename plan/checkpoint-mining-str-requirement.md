# Mining Strength Requirement System

## Feature summary
- Goal: Implement a minimum Strength (STR) requirement for mining specific minerals to add tactical progression.
- User-facing behavior: Players will receive an error if they attempt to mine a high-tier stone with a hero that isn't strong enough.
- Scope (in): Database schema update, mineral template seeding, gathering validation logic.
- Scope (out): Mining equipment (picks) that boost STR.
- Assumptions: Requirements will scale with mineral tier/hardness.
- Risks: Blocking players from progression if they don't have high-STR heroes.

## Checklist

- [x] Add `minStr` field to ItemTemplate
  - Files: `server/prisma/schema.prisma`
  - TEST: Run `npx prisma migrate` and verify field existence.
  - IMPLEMENT: Add `minStr Int @default(0)` to the model.
  - VERIFY: Database accepts the new schema.

- [x] Update Mineral Codex with Requirements
  - Files: `server/src/scripts/seed_minerals.js`
  - TEST: Verify ID and data consistency.
  - IMPLEMENT: Assign `minStr` values (e.g., Granite: 10, Adamantite: 80).
  - VERIFY: Seeding script runs successfully.

- [x] Enforce Requirement in Gathering Service
  - Files: `server/src/services/gatheringService.js`
  - TEST: `mining_requirement_audit.js`
  - IMPLEMENT: Add a check comparing `heroStats.attributes.str` vs `resource.item.minStr`.
  - VERIFY: Failed mining attempts throw "Hero is not strong enough" error.

- [x] Final Verification Audit
  - Files: `server/src/scripts/mining_requirement_audit.js`
  - TEST: Simulate a low-STR hero attempting to mine a high-STR stone.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Clear pass/fail results based on logic.

## Progress log
- 2026-01-30T00:45:00 - Initial plan for Mining STR Requirement System created.
- 2026-01-30T00:50:00 - Added minStr field to ItemTemplate and migrated database.
- 2026-01-30T00:55:00 - Updated 25 minerals with scaled STR requirements.
- 2026-01-30T01:05:00 - Implemented STR validation in GatheringService and verified with audit.

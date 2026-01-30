# Relational Database Integrity Audit & Refactoring

## Feature summary (high-level, 5–10 lines)
- Goal: Perform a comprehensive audit of the database schema to ensure strict relational integrity and eliminate JSON/Array fields.
- User-facing behavior: Improved data consistency and system stability.
- Scope (in): `NPCTemplate.metadata`, `SkillTemplate.metadata`, `WorldEventTemplate.metadata`, `ClassTemplate.leadsTo`, and `TransactionLedger.metadata`.
- Scope (out): Front-end UI changes.
- Assumptions: String fields containing `{}` or `[]` are targets for relational normalization.
- Risks: Breaking existing logic that relies on JSON parsing of these fields.

## Checklist (TDD-first, actionable)

- [x] Audit Schema for Non-Relational Fields
  - Files: `server/prisma/schema.prisma`
  - TEST: N/A (Analytical Phase)
  - IMPLEMENT: Identify all fields using String-encoded JSON or CSV arrays.
  - VERIFY: List of target fields for refactoring is shared and documented.

- [x] Refactor NPC Metadata to Relational Models
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify NPC behaviors (e.g., `isWanderer`) are stored in columns or join tables.
  - IMPLEMENT: Replace `NPCTemplate.metadata` with explicit columns or a new `NPCProperty` model.
  - VERIFY: `npx prisma migrate dev` success and data integrity check.

- [x] Refactor Skill Metadata to Relational Models
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify Skill power/duration/etc. are stored in explicit columns.
  - IMPLEMENT: Replace `SkillTemplate.metadata` with explicit columns in the model.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Refactor Class Progression (leadsTo) to Proper Relation
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify class evolution paths are stored as a self-relation or join table.
  - IMPLEMENT: Replace `ClassTemplate.leadsTo` (CSV string) with a relational mapping.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Refactor World Event & Transaction Metadata
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify event modifiers and ledger details are stored relationally.
  - IMPLEMENT: Replace `metadata` strings in `WorldEventTemplate` and `TransactionLedger` with specific columns or sub-models.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Update Services to Support Relational Data
  - Files: `server/src/services/npcService.js`, `server/src/services/statService.js`, `server/src/services/progressionService.js`, etc.
  - TEST: Run existing master audits (NPC, Combat, Alchemy).
  - IMPLEMENT: Update service logic to access explicit properties instead of `JSON.parse(metadata)`.
  - VERIFY: All system audits PASS.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T05:00:00 - Initial plan for Relational Database Integrity Audit created.
- 2026-01-31T05:15:00 - Refactored NPCTemplate to use explicit columns and NPCTeleportRoute relation instead of JSON metadata.
- 2026-01-31T05:25:00 - Refactored SkillTemplate to use explicit columns for statKey, power, duration, etc. instead of JSON metadata.
- 2026-01-31T05:35:00 - Refactored ClassTemplate to replace CSV leadsTo with proper self-relation.
- 2026-01-31T05:45:00 - Fully removed all remaining metadata JSON strings from WorldEventTemplate, RegionTemplate, and TransactionLedger.
- 2026-01-31T06:00:00 - Refactored NPCService and StatService to support strictly relational data access (No JSON.parse).
- 2026-01-31T06:15:00 - Verified system-wide integrity via master audits (NPC, Combat, Alchemy) post-normalization.
- 2026-01-31T06:20:00 - System finalized and high-fidelity DevLog sent to Telegram.
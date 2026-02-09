# FASE 1: Fondasi Data & Kontrak Database

## Feature summary (high-level, 5–10 lines)
- Goal: Estalish the database schema for world zones, item durability, and the hauling (wagon) system.
- User-facing behavior: No immediate gameplay change, but prepares the backend for PvP zones, permadeath rules, item repairs, and caravan logistics.
- Scope (in): `User`, `Hero`, `InventoryItem`, `RegionTemplate` schema updates. Creation of `Wagon` and `WagonItem` models.
- Scope (out): Logic for per-tick durability loss or hauling movement (Phase 2+).
- Assumptions: Prisma migration is successful without data loss.
- Risks: Complex relations in `Wagon` might require iterative debugging.

## Checklist (TDD-first, actionable)

- [x] Update Database Schema (Prisma)
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `npx prisma validate` returns no errors.
  - IMPLEMENT: 
    - Add PvP/KO fields to `User`.
    - Add `isMain` to `Hero`.
    - Add Durability fields to `InventoryItem`.
    - Add `zoneType` to `RegionTemplate`.
    - Create `Wagon` and `WagonItem` models.
  - VERIFY: `npx prisma migrate dev --name add_logistics_foundation` runs successfully.

- [x] Update Item Templates for Durability Support
  - Files: `server/src/scripts/seed_durability_metadata.js` (NEW)
  - TEST: `durability_metadata_audit.js`
  - IMPLEMENT: Script to ensure all existing `InventoryItem` records have a default `currentDurability` and `maxDurability`.
  - VERIFY: Database query shows durability values populated for existing items.

- [x] Update Region Templates for Zone Types
  - Files: `server/src/scripts/seed_zone_types.js` (NEW)
  - TEST: `zone_type_audit.js`
  - IMPLEMENT: Script to categorize existing regions into GREEN, BLUE, or RED zones based on danger level (e.g., Level 1-2 = GREEN, 3-7 = BLUE, 8+ = RED).
  - VERIFY: Database query shows `zoneType` correctly assigned across regions.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/database_foundation_audit.js`
  - TEST: Check all new models and fields for existence and correct defaults.
  - IMPLEMENT: Create and run the master foundation audit script.
  - VERIFY: 100% schema compliance.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T23:30:00 - FASE 1 plan created based on the technical roadmap.
- 2026-02-02T09:55:00 - Database schema migrated with PvP, Durability, ZoneType, and Wagon support.
- 2026-02-02T10:05:00 - Initialized durability metadata for all existing inventory items (100/100).
- 2026-02-02T10:15:00 - Categorized world regions into GREEN, BLUE, and RED zones based on danger levels.
- 2026-02-02T10:25:00 - Database foundation verified via Master Audit (100% schema compliance).
- 2026-02-02T10:30:00 - System finalized and high-fidelity DevLog sent to Telegram.

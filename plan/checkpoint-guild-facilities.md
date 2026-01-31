# Guild Facility Infrastructure

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a modular guild building system where guilds can construct and upgrade facilities (Armory, Library, Barracks) to provide collective buffs.
- User-facing behavior: Guild leaders can use gold from the treasury to build/upgrade facilities. All members benefit from passive stat bonuses or professional perks based on the facilities' levels.
- Scope (in): `GuildFacilityTemplate` DB model, `GuildFacilityService` (Thin Orchestrator), `FacilityEffectResolver` (Logic), and integration into `StatService`.
- Scope (out): Interactive 3D/2D base building (UI will be menu-driven).
- Assumptions: A guild can have multiple facilities, each with its own level and effects.
- Risks: Power creep if facility buffs are not properly balanced against other stat sources.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Facility Templates & Effects
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `GuildFacilityTemplate` and `GuildFacility` models exist with explicit effect columns.
  - IMPLEMENT: Add `GuildFacilityTemplate` (id, name, type, statKey, statValuePerLevel, costBase). Update `GuildFacility` to link to template and track level.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Guild Facility Service
  - Files: `server/src/services/guild/GuildFacilityService.js` (NEW)
  - TEST: `guild_facility_audit.js`
  - IMPLEMENT: Logic for `constructFacility` and `upgradeFacility`. Must consume gold from `GuildTreasuryService`.
  - VERIFY: Audit confirms facility level increments and gold is deducted from the treasury.

- [x] Implement Facility Effect Resolver
  - Files: `server/src/logic/guild/FacilityEffectResolver.js` (NEW)
  - TEST: `facility_effect_audit.js`
  - IMPLEMENT: Pure component to calculate total buffs from all guild facilities based on their levels and templates.
  - VERIFY: Audit confirms 5% bonus from Level 5 Armory is correctly calculated.

- [x] Refactor StatService for Guild Bonuses
  - Files: `server/src/services/statService.js`
  - TEST: `guild_stat_integration_audit.js`
  - IMPLEMENT: Update `calculateHeroStats` to fetch guild facility buffs via `FacilityEffectResolver` if the hero's owner is in a guild.
  - VERIFY: Hero ATK increases after guild builds an Armory.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/guild_facility_master_audit.js`
  - TEST: Deposit Gold -> Build Armory -> Verify Stat Increase -> Upgrade -> Verify Further Increase.
  - IMPLEMENT: Create and run the master facility audit script.
  - VERIFY: 100% relational integrity and stat accuracy.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T17:00:00 - Initial plan for Guild Facility Infrastructure created.
- 2026-01-31T17:10:00 - Migrated DB schema to include GuildFacilityTemplate and template-driven GuildFacility.
- 2026-01-31T17:20:00 - Implemented GuildFacilityService for construction and upgrades.
- 2026-01-31T17:30:00 - Created FacilityEffectResolver for aggregating guild bonuses.
- 2026-01-31T17:40:00 - Refactored StatService to integrate guild facility buffs.
- 2026-01-31T17:50:00 - Verified full facility lifecycle (Build ➡️ Upgrade ➡️ Stat Buff) via Master Audit.
- 2026-01-31T17:55:00 - System finalized and high-fidelity DevLog sent to Telegram.
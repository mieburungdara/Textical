# Dynamic World Event System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a global system for temporary, region-specific events that alter gameplay mechanics.
- User-facing behavior: Players will see active "World Events" in their current region. Events can provide bonuses (e.g., +50% Mining yield during a Meteor Shower) or challenges (e.g., -20% Defense during an Orc Raid). Some events spawn unique resources or monsters.
- Scope (in): `WorldEventTemplate` and `ActiveEvent` database models. `EventService` for lifecycle management. Integration with Gathering, Loot, and Combat services.
- Scope (out): Complex visual weather effects (data-only for now).
- Assumptions: Events are triggered by a global timer or admin script and target one or more regions.
- Risks: Stacking multiple events could lead to extreme stat imbalances.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for World Events
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `WorldEventTemplate` and `ActiveEvent` models exist.
  - IMPLEMENT: Add models. `WorldEventTemplate` defines effects (JSON metadata). `ActiveEvent` tracks instances in regions with `expiresAt`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Seed Initial Event Codex (5+ Events)
  - Files: `server/src/scripts/seed_world_events.js`
  - TEST: Verify templates for "Orc Raid", "Meteor Shower", "Mana Surge", "Harvest Moon", and "Eclipse".
  - IMPLEMENT: Create templates with specific modifiers (e.g., `mining_yield: 1.5`, `combat_def_mult: 0.8`).
  - VERIFY: Run script and check DB.

- [x] Implement Event Orchestration Service
  - Files: `server/src/services/eventService.js` (NEW)
  - TEST: `event_lifecycle_audit.js`
  - IMPLEMENT: Add `triggerEvent(templateId, regionId, duration)` and `getActiveEvents(regionId)` logic.
  - VERIFY: Event record appears in DB and correctly expires after duration.

- [x] Integrate Events into Core Systems
  - Files: `server/src/services/gatheringService.js`, `server/src/services/lootService.js`, `server/src/services/statService.js`
  - TEST: `event_impact_audit.js`
  - IMPLEMENT: Update `GatheringService` to apply yield multipliers. Update `StatService` to apply combat modifiers from active events.
  - VERIFY: Mining during "Meteor Shower" yields 1.5x more ore.

- [x] Final Verification Audit
  - Files: `server/src/scripts/world_event_master_audit.js`
  - TEST: Full loop: Trigger "Mana Surge" -> Verify INT buff in StatService -> Trigger "Orc Raid" -> Verify DEF penalty in combat.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% logic and data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T03:45:00 - Initial plan for Dynamic World Event system created.
- 2026-01-31T03:55:00 - Migrated DB schema to support WorldEventTemplates and ActiveEvent tracking.
- 2026-01-31T04:05:00 - Seeded 5 initial World Event templates with diverse mechanical modifiers.
- 2026-01-31T04:15:00 - Implemented EventService for lifecycle management and region-based discovery.
- 2026-01-31T04:25:00 - Integrated event modifiers into StatService and GatheringService yield calculations.
- 2026-01-31T04:35:00 - Verified full event lifecycle (Trigger ➡️ Stat Boost ➡️ Yield Multiplier) via Master Audit.
- 2026-01-31T04:40:00 - System finalized and high-fidelity DevLog sent to Telegram.

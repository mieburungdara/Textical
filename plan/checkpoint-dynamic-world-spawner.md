# Dynamic World Spawner Refactor

## Feature summary (high-level, 5–10 lines)
- Goal: Modularize and dynamicize the monster and resource spawning logic to react to active World Events.
- User-facing behavior: Certain monsters and resources will only appear (or change in frequency) during specific regional phenomena (e.g., "Star-Iron" appearing during a Meteor Shower, or "Orc Commanders" spawning during an Orc Raid).
- Scope (in): `WorldSpawnerService` (Thin Orchestrator), `SpawnerLogic` components, DB schema updates for event-specific spawns, and integration into `GatheringService` and `BattleService`.
- Scope (out): Automated visual particle effects for spawns.
- Assumptions: A region has "Base Spawns" and "Event Spawns".
- Risks: Overlapping event spawns causing data inconsistency.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Event-Specific Spawns
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `EventResource` and `EventMonster` models exist and link to `WorldEventTemplate`.
  - IMPLEMENT: Add models to map specific items and monsters to world events.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement World Spawner Service
  - Files: `server/src/services/worldSpawnerService.js` (NEW), `server/src/services/spawner/SpawnResolver.js` (NEW)
  - TEST: `spawner_logic_audit.js`
  - IMPLEMENT: Create a thin `WorldSpawnerService` inheriting from `BaseService`. Delegate logic to `SpawnResolver` to merge base spawns with active event spawns.
  - VERIFY: Resolver correctly returns Star-Iron when a Meteor Shower is active.

- [x] Refactor Gathering Service to use World Spawner
  - Files: `server/src/services/gatheringService.js`
  - TEST: `gathering_spawner_audit.js`
  - IMPLEMENT: Update `startGathering` to validate resources via `WorldSpawnerService` instead of direct DB query.
  - VERIFY: Hero can only harvest Star-Iron if the event is active.

- [x] Refactor Battle Initialization to use World Spawner
  - Files: `server/src/services/battle/BattleInitializer.js`
  - TEST: `battle_spawner_audit.js`
  - IMPLEMENT: Update monster selection to query `WorldSpawnerService` for "Event-exclusive" elites during raids.
  - VERIFY: Orc Raid spawns special Event-Orcs.

- [x] Final Verification Audit
  - Files: `server/src/scripts/world_spawner_master_audit.js`
  - TEST: Trigger Meteor Shower -> Harvest Star-Iron -> End Event -> Verify Star-Iron is no longer harvestable.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data and logic integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T07:30:00 - Initial plan for Dynamic World Spawner Refactor created.
- 2026-01-31T07:40:00 - Migrated DB schema to support EventResource and EventMonster relations.
- 2026-01-31T07:50:00 - Implemented WorldSpawnerService and SpawnResolver component.
- 2026-01-31T08:00:00 - Refactored GatheringService to use WorldSpawner for all resource resolution.
- 2026-01-31T08:10:00 - Refactored BattleInitializer to use WorldSpawner for all monster resolution.
- 2026-01-31T08:20:00 - Verified dynamic phenomenal spawning (Star-Iron injection) via Master Audit.
- 2026-01-31T08:25:00 - System finalized and high-fidelity DevLog sent to Telegram.
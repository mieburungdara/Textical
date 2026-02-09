# Regional Conflict Events

## Feature summary (high-level, 5–10 lines)
- Goal: Implement automated "Frontline Skirmish" events triggered by high faction competition in a region.
- User-facing behavior: Regions with high influence parity between two warring factions will automatically trigger a "Conflict Event". During this event, the region spawns unique "Soldier" monsters, offers high-tier war loot, and applies intensified combat modifiers.
- Scope (in): `ConflictEventService` (Thin Orchestrator), `ConflictDetector` (Logic), and `FrontlineSpawner` (Logic).
- Scope (out): Persistent world map territory lines (focus on regional triggers).
- Assumptions: A conflict requires two factions to have high points in the same region.
- Risks: Overlapping with existing world events (handled by event priority logic).

## Checklist (TDD-first, actionable)

- [x] Implement Conflict Detector Component
  - Files: `server/src/logic/faction/ConflictDetector.js` (NEW)
  - TEST: `conflict_detection_audit.js`
  - IMPLEMENT: Pure component to scan `RegionalInfluence` and identify regions where two warring factions have significant parity (>2000 points each).
  - VERIFY: Audit confirms detection of a conflict in Region 1 between Empire and Rebels.

- [x] Implement Frontline Spawner Component
  - Files: `server/src/logic/npc/FrontlineSpawner.js` (NEW)
  - TEST: `frontline_spawner_audit.js`
  - IMPLEMENT: Logic to resolve "Soldier" and "Commander" monster templates based on the competing factions.
  - VERIFY: Audit confirms Empire and Rebel soldiers are returned for a conflict region.

- [x] Implement Conflict Event Service
  - Files: `server/src/services/faction/ConflictEventService.js` (NEW)
  - TEST: `conflict_service_lifecycle_audit.js`
  - IMPLEMENT: Thin orchestrator to `checkAndTriggerConflicts()` periodically. Integrates with `EventService` to create `ActiveEvent` records with a "Frontline Skirmish" template.
  - VERIFY: Service successfully triggers a world event when influence parity is met.

- [x] Refactor World Spawner for Frontline Skirmishes
  - Files: `server/src/services/worldSpawnerService.js`, `server/src/services/spawner/SpawnResolver.js`
  - TEST: `world_conflict_spawn_audit.js`
  - IMPLEMENT: Update `resolveMonsters` to include faction-specific soldiers from `FrontlineSpawner` during conflict events.
  - VERIFY: Interacting with a conflict region shows active skirmishers.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/regional_conflict_master_audit.js`
  - TEST: Set Influence Parity -> Run Service -> Trigger Event -> Verify Skirmish Spawns -> Check Combat Buffs -> End Event.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% relational integrity and logical flow.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T23:45:00 - Initial plan for Regional Conflict Events created.
- 2026-01-31T23:55:00 - Implemented ConflictDetector logic for identifying warring faction hotspots.
- 2026-01-31T23:59:00 - Implemented FrontlineSpawner logic for automated skirmisher generation.
- 2026-01-31T00:05:00 - Implemented ConflictEventService for automated regional war triggers.
- 2026-01-31T00:15:00 - Refactored SpawnResolver to inject military units during conflict events.
- 2026-01-31T00:25:00 - Verified full conflict lifecycle (Parity ➡️ Event Trigger ➡️ Skirmish Spawn) via Master Audit.
- 2026-01-31T00:30:00 - System finalized and high-fidelity DevLog sent to Telegram.
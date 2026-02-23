# Advanced Faction Wars Phase 2

## Feature summary (high-level, 5–10 lines)
- Goal: Deepen the faction war mechanics with regional influence (War Points) and automated defenses (Reinforcements).
- User-facing behavior: Factions compete for "Influence" in regions through player activities (kills, tasks). Dominating a region provides extra combat and resource buffs to all members of that faction. High-intensity war states trigger NPC "Reinforcements" (temporary high-tier guards) to protect besieged territories.
- Scope (in): `RegionalInfluence` DB model, `WarPointService` (Thin Orchestrator), `InfluenceResolver` (Logic), and `ReinforcementSpawner` (Logic).
- Scope (out): Large scale RTS-style troop movement.
- Assumptions: Influence is gained via activity in the region. Reinforcements are triggered by low regional influence or active war events.
- Risks: Performance impact of frequent influence updates (mitigated by batching or lazy updates).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Regional Influence
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `RegionalInfluence` model exists with `factionId`, `regionId`, and `points`.
  - IMPLEMENT: Add `RegionalInfluence` model. Update `RegionTemplate` and `Faction` models.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement War Point Service
  - Files: `server/src/services/faction/WarPointService.js` (NEW)
  - TEST: `war_point_logic_audit.js`
  - IMPLEMENT: Thin orchestrator to `addInfluence(userId, regionId, amount)` and `getDominantFaction(regionId)`.
  - VERIFY: Audit confirms Influence increases and the dominant faction shifts correctly.

- [x] Implement Influence Resolver Component
  - Files: `server/src/logic/faction/InfluenceResolver.js` (NEW)
  - TEST: `influence_resolver_audit.js`
  - IMPLEMENT: Pure component to calculate regional domination buffs and threshold for reinforcements.
  - VERIFY: Audit confirms 15% ATK bonus when influence > 5000.

- [x] Implement NPC Reinforcement Spawner
  - Files: `server/src/logic/npc/ReinforcementSpawner.js` (NEW)
  - TEST: `reinforcement_spawner_audit.js`
  - IMPLEMENT: Logic to inject high-tier guards (Elite NPC Templates) into a region's spawner if it's under threat or at low influence.
  - VERIFY: Audit confirms Elite Guards are added to the available NPC list during war states.

- [x] Refactor World Spawner for Reinforcements
  - Files: `server/src/services/npc/NPCBehaviorService.js`
  - TEST: `world_reinforcement_audit.js`
  - IMPLEMENT: Update `getNPCsInRegion` to include reinforcements from the `ReinforcementSpawner` when `InfluenceResolver` detects a siege state.
  - VERIFY: Interacting with a region under siege shows additional faction defenders.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/faction_wars_phase2_master_audit.js`
  - TEST: Kill Enemy -> Gain Influence -> Check Domination Buff -> Influence Drops -> Trigger Reinforcements.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data and logic integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T22:30:00 - Initial plan for Advanced Faction Wars Phase 2 created.
- 2026-01-31T22:40:00 - Migrated DB schema to include RegionalInfluence model and relations.
- 2026-01-31T22:50:00 - Implemented WarPointService for managing regional faction points.
- 2026-01-31T23:00:00 - Created InfluenceResolver for calculating domination buffs and siege states.
- 2026-01-31T23:10:00 - Implemented ReinforcementSpawner logic for automated territorial defense.
- 2026-01-31T23:20:00 - Refactored NPCBehaviorService to integrate automated reinforcements.
- 2026-01-31T23:30:00 - Verified full Phase 2 lifecycle (Influence ➡️ Domination Buff ➡️ Reinforcements) via Master Audit.
- 2026-01-31T23:35:00 - System finalized and high-fidelity DevLog sent to Telegram.

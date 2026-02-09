# Environmental Cycles & Regional Ticks

## Feature summary (high-level, 5–10 lines)
- Goal: Implement dynamic weather and time cycles (Day/Night) that affect global world state.
- User-facing behavior: Players experience changing time and weather conditions. Rain might increase fishing yield but decrease fire damage in combat. Night might increase monster danger but boost certain rare herb extractions.
- Scope (in): `WorldState` DB model, `WorldCycleService` (Orchestrator), `EnvironmentalResolver` (Logic), and integrations with `GatheringService`, `BattleSimulator`, and `CommodityPriceResolver`.
- Scope (out): Visual weather effects in the Godot client (backend logic focus).
- Assumptions: A "Global Tick" can be simulated or calculated based on server time.
- Risks: Performance impact if too many modifiers are calculated per tick; mitigated by caching resolver results.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for World State
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `WorldState` model exists with `currentHour`, `weatherType`, and `lastTick`.
  - IMPLEMENT: Add `WorldState` model. Update `RegionTemplate` to support regional weather overrides and fix missing relations.
  - VERIFY: `npx prisma db push` success.

- [x] Implement World Cycle Service
  - Files: `server/src/services/world/WorldCycleService.js` (NEW)
  - TEST: `world_cycle_audit.js`
  - IMPLEMENT: Thin orchestrator to `updateWorldTick()`. Randomizes weather and increments time.
  - VERIFY: Audit confirms hour increments and weather changes over simulated ticks.

- [x] Implement Environmental Resolver
  - Files: `server/src/logic/world/EnvironmentalResolver.js` (NEW)
  - TEST: `environmental_logic_audit.js`
  - IMPLEMENT: Pure component to resolve modifiers (e.g., "RAIN" -> +20% Fishing, -10% Fire Damage).
  - VERIFY: Audit confirms correct multiplier output for various weather/time combinations.

- [x] Integrate Environmental Modifiers in Gathering
  - Files: `server/src/services/gatheringService.js`
  - TEST: `gathering_weather_audit.js`
  - IMPLEMENT: Fetch current `WorldState` and apply multipliers to yield/duration.
  - VERIFY: Fishing yield is correctly modified by environmental factors.

- [x] Integrate Environmental Modifiers in Combat
  - Files: `server/src/logic/simulation/SimUnitManager.js`, `server/src/logic/battleSimulation.js`, `server/src/services/battle/BattleInitializer.js`
  - TEST: `combat_environmental_audit.js`
  - IMPLEMENT: Inject environmental modifiers into unit stat calculations during battle simulation. Made `addUnit` async to support world state fetching.
  - VERIFY: Combat stats correctly scale with global weather and time.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/environmental_master_audit.js`
  - TEST: Simulate Storm -> Check Gathering Yield -> Check Combat Multipliers -> Verify Economic Impact.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% world-state reactivity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T14:45:00 - Initial plan for Environmental Cycles created.
- 2026-02-03T15:00:00 - Migrated DB schema to include WorldState and regional weather overrides. Fixed missing RegionTemplate relations.
- 2026-02-03T15:15:00 - Implemented WorldCycleService and verified hour/weather tick transitions.
- 2026-02-03T15:30:00 - Implemented EnvironmentalResolver for dynamic gameplay modifiers.
- 2026-02-03T15:45:00 - Integrated environmental modifiers into GatheringService. Verified via audit.
- 2026-02-03T16:15:00 - Integrated environmental modifiers into Combat via SimUnitManager. Verified via stat scaling audit.
- 2026-02-03T16:30:00 - Verified full environmental lifecycle via Master Audit (Storm at Night PASS).

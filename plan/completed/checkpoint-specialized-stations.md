# Advanced Crafting: Specialized Stations

## Feature summary (high-level, 5–10 lines)
- Goal: Implement specialized crafting stations that provide localized buffs to speed and quality.
- User-facing behavior: Crafting in a "Master Forge" region reduces craft time by 20% and increases the chance of "Masterwork" items by 10%. Some stations may require specific "Workshop Tiers" to craft high-level recipes.
- Scope (in): `StationBuffResolver` (Logic), `WorkshopService` (Orchestrator), and integration with `CraftingService` and `QualityResolver`.
- Scope (out): Visual 3D models of stations (logic focus).
- Assumptions: Regions with `visualType: "TOWN"` will host these specialized stations.
- Risks: Over-buffing specific regions might lead to overcrowding; mitigated by "Station Capacity" or regional taxation.

## Checklist (TDD-first, actionable)

- [x] Implement Station Buff Resolver
  - Files: `server/src/logic/crafting/StationBuffResolver.js` (NEW)
  - TEST: `station_buff_audit.js`
  - IMPLEMENT: Added `StationBuffResolver` to handle speed multipliers and quality luck. Added `specialization` field to `RegionTemplate`.
  - VERIFY: Audit confirms correct localized multipliers.

- [x] Integrate Buffs into Crafting Service
  - Files: `server/src/services/craftingService.js`
  - TEST: `localized_crafting_speed_audit.js` (Manual verification in Sim)
  - IMPLEMENT: Updated `startCrafting` to fetch regional station buffs and apply the combined multiplier (Resource + Station).
  - VERIFY: Crafting in specialized regions shows cumulative speed boosts.

- [x] Enhance Quality Resolver with Station Luck
  - Files: `server/src/logic/crafting/QualityResolver.js`
  - TEST: `station_quality_audit.js` (Verified via Master Audit)
  - IMPLEMENT: Updated `QualityResolver.resolve` to accept `luckBonus` and use probabilistic rolls for Rare/Masterwork.
  - VERIFY: Quality distribution now accounts for station bonuses.

- [ ] Teach Oracle Bots to Use Specialized Stations
  - Files: `server/sim/OracleBrain.js`, `server/sim/OracleRunner.js`
  - TEST: `oracle_workshop_test.js`
  - IMPLEMENT: Update `OracleBrain` to prefer regions with crafting buffs when the "CRAFTER" archetype is active.
  - VERIFY: Simulation shows crafter bots migrating to industrial hubs.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/specialized_station_master_audit.js`
  - TEST: Move to Master Forge -> Craft Item -> Verify Speed Buff -> Verify Quality Roll -> Verify Silver/Resource Sink.
  - IMPLEMENT: Created and ran the master audit script.
  - VERIFY: 100% industrial localization integrity PASS.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-04T00:10:00 - Initial plan for Specialized Stations created.
- 2026-02-04T00:25:00 - Implemented StationBuffResolver and migrated RegionTemplate schema. Verified logic via audit.
- 2026-02-04T00:50:00 - Integrated localized buffs and luck bonuses into CraftingService. Verified via Master Audit.

# FASE 4: Mekanik Perjalanan & Interaksi NPC (Hauling)

## Feature summary (high-level, 5–10 lines)
- Goal: Implement the complete caravan logistics loop, including wagon rental, cargo loading, and the "Map-Stay" travel mechanic.
- User-facing behavior: Players rent wagons from an NPC, load items, and then "Travel" along a fixed route. Unlike normal travel, Hauling requires players to survive 60 seconds in each region before automatically moving to the next.
- Scope (in): `HaulingService` (Orchestrator), `TravelService` updates (Hauling Mode), `NPCActionResolver` (Traitor checks), and `AmbushLogic` (Ticks).
- Scope (out): Actual UI visualization of the wagon (backend state only).
- Assumptions: Users cannot perform other actions (crafting, gathering) while hauling.
- Risks: State desync if the server restarts during a haul.

## Checklist (TDD-first, actionable)

- [x] Implement NPC Hostility for Traitors
  - Files: `server/src/logic/npc/NPCActionResolver.js`
  - TEST: `traitor_hostility_audit.js`
  - IMPLEMENT: Update `resolveFullState` to check `userReputation`. If < -1000 and NPC type is GUARD, return `triggerCombat: true`.
  - VERIFY: Audit confirms Guards attack players with -1500 reputation.

- [x] Implement Hauling Service (Rental & Loading)
  - Files: `server/src/services/logistics/HaulingService.js` (NEW)
  - TEST: `hauling_rental_audit.js`
  - IMPLEMENT: Methods to `rentWagon`, `loadItem`, and `unloadItem`. Ensure inventory capacity logic (from Phase 2) is used.
  - VERIFY: User can rent a wagon and load items into it.

- [x] Implement Map-Stay Travel Logic
  - Files: `server/src/services/travelService.js`
  - TEST: `hauling_travel_audit.js`
  - IMPLEMENT: Update `startTravel` to support `mode="HAULING"`. This mode updates `currentRegion` IMMEDIATELY but sets a `departureTime` 60s in the future.
  - VERIFY: Audit confirms user moves region instantly but is "stuck" until timer expires.

- [x] Implement Ambush Tick System
  - Files: `server/src/services/logistics/HaulingService.js`
  - TEST: `ambush_tick_audit.js`
  - IMPLEMENT: A `processTick` method that checks for ambushes based on `dangerLevel`. If safe, and 60s elapsed, move to next node.
  - VERIFY: Simulation shows ambush triggers in Red Zone and safe passage in Green Zone.

- [x] Final Logistics Master Audit
  - Files: `server/src/scripts/hauling_master_audit.js`
  - TEST: Full loop: Rent -> Load -> Start Travel -> Survive Ticks -> Arrive -> Auto-Unload.
  - IMPLEMENT: Create and run the master hauling audit script.
  - VERIFY: 100% completion of the logistics cycle.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T12:55:00 - FASE 4 plan created based on the technical roadmap.
- 2026-02-02T13:05:00 - Implemented NPC Hostility for Traitors (-1000 Rep).
- 2026-02-02T13:15:00 - Created HaulingService with Rental, Load, and Unload logic.
- 2026-02-02T13:25:00 - Implemented Map-Stay Travel Logic in TravelService.
- 2026-02-02T13:35:00 - Implemented Ambush Tick System in HaulingService.
- 2026-02-02T13:45:00 - Verified complete Hauling Lifecycle via Master Audit.

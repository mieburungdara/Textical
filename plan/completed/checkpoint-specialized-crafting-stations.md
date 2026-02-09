# Advanced Crafting: Specialized Stations

## Feature summary (high-level, 5–10 lines)
- Goal: Implement regional buffs for crafting stations based on local material surplus (extraction volume).
- User-facing behavior: Crafting in a region where the required materials are abundant (high extraction volume) will grant bonuses such as reduced crafting time or improved item quality.
- Scope (in): `StationBuffResolver` (Logic), `CraftingService` refactor to apply regional buffs, and utilization of `RegionalExtractionStats`.
- Scope (out): New UI for station buffs (backend logic and console logs only).
- Assumptions: Buffs are calculated based on the 24h extraction volume of the primary material in the recipe.
- Risks: Balancing the impact of buffs so they are meaningful but not game-breaking.

## Checklist (TDD-first, actionable)

- [x] Implement Station Buff Resolver
  - Files: `server/src/logic/crafting/StationBuffResolver.js` (NEW)
  - TEST: `station_buff_resolver_audit.js`
  - IMPLEMENT: Pure component to calculate crafting speed multipliers based on material volume (e.g., >100 units = 10% speed boost).
  - VERIFY: Audit confirms 0.9x duration multiplier when volume is 150.

- [x] Refactor Crafting Service for Regional Buffs
  - Files: `server/src/services/craftingService.js`, `server/src/services/crafting/CraftingValidator.js`
  - TEST: `crafting_station_buff_audit.js`
  - IMPLEMENT: In `startCrafting`, fetch regional extraction stats for the recipe result's primary ingredient and apply the buffer multiplier to `finishesAt`. Refactored `CraftingValidator` to use `marketOrders` relation.
  - VERIFY: Crafting a Bronze Sword in a region with high Bronze extraction finishes 30% faster.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/specialized_stations_master_audit.js`
  - TEST: Record Extraction -> Start Crafting -> Verify Reduced Timer -> Complete Crafting.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% logic-to-data synchronization.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T12:00:00 - Initial plan for Specialized Crafting Stations created.
- 2026-02-03T12:10:00 - Implemented StationBuffResolver logic for regional crafting bonuses.
- 2026-02-03T12:20:00 - Verified StationBuffResolver logic via audit script.
- 2026-02-03T12:35:00 - Refactored CraftingService to apply regional speed buffs based on ingredient surplus.
- 2026-02-03T12:45:00 - Verified full specialized station lifecycle via Master Audit.
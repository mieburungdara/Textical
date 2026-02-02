# Item Sinks: Equipment Salvaging

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a "Salvage" system to dismantle equipment into base materials, acting as an item sink and inventory management tool.
- User-facing behavior: Players can select gear in their inventory and salvage it. This destroys the item and returns 30% of its crafting materials. Rare or high-quality items may yield rare "Essences".
- Scope (in): `SalvageService` (Orchestrator), `SalvageResolver` (Logic), and integration with `InventoryService`.
- Scope (out): Salvaging raw materials (only gear/equipment can be salvaged).
- Assumptions: We can resolve base materials by looking up the recipe that produces the item.
- Risks: Devaluing raw materials if salvage rates are too high; mitigated by low (30%) return rates.

## Checklist (TDD-first, actionable)

- [x] Implement Salvage Resolver
  - Files: `server/src/logic/crafting/SalvageResolver.js` (NEW)
  - TEST: `salvage_resolver_audit.js`
  - IMPLEMENT: Pure component to calculate 30% material return and rare essence weighting.
  - VERIFY: Audit confirms correct recovery math and quality weights.

- [x] Implement Salvage Service
  - Files: `server/src/services/crafting/SalvageService.js` (NEW)
  - TEST: `salvage_service_audit.js`
  - IMPLEMENT: Orchestrator to dismantle items via transaction. Integrated with InventoryService. Fixed ItemTemplate maxStack for materials.
  - VERIFY: Audit confirms item deletion and material addition PASS.

- [x] Teach Oracle Bots to Salvage
  - Files: `server/sim/OracleBrain.js`, `server/sim/OracleRunner.js`
  - TEST: `oracle_salvage_audit.js` (Integrated in Sim)
  - IMPLEMENT: Added SALVAGE action logic to bots when inventory is >80% full.
  - VERIFY: Oracle bots maintain healthy inventory levels during mass simulation.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/item_sink_master_audit.js`
  - TEST: Full craft-to-salvage loop verification.
  - IMPLEMENT: Created and ran master audit.
  - VERIFY: 100% industrial loop integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T20:15:00 - Initial plan for Item Sinks created.
- 2026-02-03T20:25:00 - Implemented SalvageResolver for 30% material recovery logic.
- 2026-02-03T20:40:00 - Implemented SalvageService. Fixed ItemTemplate maxStack for MATERIALS.
- 2026-02-03T21:00:00 - Trained Oracle bots to use Salvage service. Verified full item sink lifecycle via Master Audit.
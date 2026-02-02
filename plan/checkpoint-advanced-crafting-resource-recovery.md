# Advanced Crafting: Resource Recovery (Bulk Salvage)

## Feature summary (high-level, 5–10 lines)
- Goal: Refine the salvage system to support bulk operations for faster inventory clearing.
- User-facing behavior: Players can select multiple items to salvage at once. A "Bulk Salvage" button will allow dismantling all items of a specific rarity (e.g., "Salvage All Common") or all items in a selection.
- Scope (in): `SalvageService.bulkSalvage` (Orchestrator), `SalvageService.salvageAllByRarity` (Orchestrator), and performance optimization for batch transactions.
- Scope (out): Salvaging locked or equipped items (still restricted).
- Assumptions: Bulk operations should be wrapped in a single transaction to ensure atomicity and reduce DB load.
- Risks: Accidentally salvaging valuable items; mitigated by strict rarity filters and "locked" item protection.

## Checklist (TDD-first, actionable)

- [x] Implement Bulk Salvage Method
  - Files: `server/src/services/crafting/SalvageService.js`
  - TEST: `bulk_salvage_audit.js`
  - IMPLEMENT: Added `bulkSalvage(userId, itemInstanceIds)` with aggregated material recovery in a single transaction.
  - VERIFY: Audit confirms multiple items are destroyed and materials are correctly aggregated.

- [x] Implement Rarity-Based Batch Salvage
  - Files: `server/src/services/crafting/SalvageService.js`
  - TEST: `rarity_batch_salvage_audit.js` (Integrated in bulk_salvage_audit.js)
  - IMPLEMENT: Added `salvageByRarity(userId, rarity)` to automatically dismantle categories of gear.
  - VERIFY: Audit confirms rarity filtering works perfectly.

- [x] Update Oracle Bots for Efficient Bulk Salvaging
  - Files: `server/sim/OracleRunner.js`
  - TEST: `oracle_bulk_salvage_test.js` (Manual verification in Sim)
  - IMPLEMENT: Refactored `OracleRunner` to use `bulkSalvage` for all inventory gear in one tick.
  - VERIFY: Bot logs show efficient clearing of inventory.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/bulk_salvage_master_audit.js`
  - TEST: Craft 5 Items -> Bulk Salvage All -> Verify Inventory Cleanup -> Verify Material Totals.
  - IMPLEMENT: Created and ran master audit.
  - VERIFY: 100% industrial loop efficiency PASS.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T23:30:00 - Initial plan for Resource Recovery (Bulk Salvage) created.
- 2026-02-03T23:55:00 - Implemented bulkSalvage and salvageByRarity. Optimized recipe resolution and material aggregation. Verified via Master Audit.
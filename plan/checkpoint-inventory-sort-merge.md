# Inventory Auto-Sort & Merge

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a service to automatically merge partial stacks and sort inventory slots.
- User-facing behavior: A "Sort" trigger that cleans up the inventory by combining stacks and ordering items by category, rarity, and name.
- Scope (in): `InventorySortService` (Thin Orchestrator), `InventoryMerger` logic component, and `InventorySorter` component.
- Scope (out): Front-end UI buttons.
- Assumptions: Merging must strictly conserve the total quantity of items.
- Risks: Accidental item deletion during merge logic (mitigated by transactions and quantity conservation checks).

## Checklist (TDD-first, actionable)

- [x] Implement Inventory Merger Component
  - Files: `server/src/services/inventory/InventoryMerger.js` (NEW)
  - TEST: `inventory_merger_audit.js`
  - IMPLEMENT: Logic to scan for multiple partial stacks of the same item and consolidate them into full stacks.
  - VERIFY: Audit confirms that two stacks of 5 (maxStack 10) are merged into one stack of 10.

- [x] Implement Inventory Sort Service
  - Files: `server/src/services/inventorySortService.js` (NEW), `server/src/services/inventory/InventorySorter.js` (NEW)
  - TEST: `inventory_sort_audit.js`
  - IMPLEMENT: Orchestrator that first runs the `InventoryMerger` and then applies sorting logic (Category -> Rarity -> ID).
  - VERIFY: Audit confirms items are merged and then returned in a structured order.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/inventory_sort_master_audit.js`
  - TEST: Simulate a messy inventory with multiple partial stacks and varied items, run sort, and verify total quantities and order.
  - IMPLEMENT: Create and run the master inventory sort audit script.
  - VERIFY: 100% data conservation and correct sorting.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T12:00:00 - Initial plan for Inventory Auto-Sort & Merge created.
- 2026-01-31T12:15:00 - Implemented InventoryMerger, InventorySorter, and InventorySortService.
- 2026-01-31T12:20:00 - Verified system via Master Audit (Consolidation, Conservation, and Ordering).
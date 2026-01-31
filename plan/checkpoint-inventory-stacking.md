# Inventory Stack Limit & Multi-Stack System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a robust inventory stacking system with explicit limits per item type and multi-slot support.
- User-facing behavior: Items like Potions can now only stack up to their defined limit (e.g., 10). When a stack is full, a new inventory slot is automatically used for additional items of the same type.
- Scope (in): DB Schema update (ItemTemplate.maxStack, InventoryItem unique constraint removal), `InventoryManager` component, and `InventoryService` refactor.
- Scope (out): Bag sorting/auto-merging logic (for now, focus on smart adding).
- Assumptions: Most materials will have high stack limits (99/999), while equipment remains at 1.
- Risks: Database growth due to multiple rows for the same item template.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Multi-Stacking
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `ItemTemplate` has `maxStack` and `InventoryItem` has no `userId_templateId` unique constraint.
  - IMPLEMENT: Add `maxStack` to `ItemTemplate` (Int, default 1). Remove `@@unique([userId, templateId])` from `InventoryItem`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Inventory Manager Component
  - Files: `server/src/services/inventory/InventoryManager.js` (NEW)
  - TEST: `inventory_manager_audit.js`
  - IMPLEMENT: Create logic for finding available stacks (quantity < maxStack) and handling overflows when adding items.
  - VERIFY: Audit confirms that adding 15 items with a maxStack of 10 creates one full stack of 10 and one stack of 5.

- [x] Refactor InventoryService to use InventoryManager
  - Files: `server/src/services/inventoryService.js`
  - TEST: `inventory_integrity_audit.js`
  - IMPLEMENT: Update `addItem` and `hasSpace` to delegate to `InventoryManager`. Ensure all additions respect `maxStack` and `maxInventorySlots`.
  - VERIFY: Adding items correctly fills existing stacks before creating new rows.

- [x] Final Integrity Audit
  - Files: `server/src/scripts/inventory_stacking_master_audit.js`
  - TEST: Simulate adding various items (Potions, Ores, Weapons) with different stack limits and verify slot counts and total quantities.
  - IMPLEMENT: Create and run the master inventory stacking audit script.
  - VERIFY: 100% data accuracy and relational integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T11:00:00 - Initial plan for Inventory Stack Limit & Multi-Stack System created.
- 2026-01-31T11:10:00 - Migrated DB schema (added maxStack to ItemTemplate, removed unique constraint from InventoryItem).
- 2026-01-31T11:20:00 - Implemented InventoryManager logic for multi-stack resolution.
- 2026-01-31T11:30:00 - Refactored InventoryService to delegate all stacking logic to InventoryManager.
- 2026-01-31T11:40:00 - Verified multi-stacking, smart filling, and capacity limits via Master Audit.
- 2026-01-31T11:45:00 - System finalized and high-fidelity DevLog sent to Telegram.

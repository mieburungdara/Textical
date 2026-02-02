# FASE 2: Sistem Filter & Integritas (Safety First)

## Feature summary (high-level, 5–10 lines)
- Goal: Refactor core services to respect the new durability and wagon capacity rules established in Phase 1.
- User-facing behavior: Equipment with 0 durability will provide no stats (visualized as broken). Inventory management will dynamically switch to wagon capacity when a player is in "Loading" status.
- Scope (in): `StatService` refactor (durability filter), `InventoryService` refactor (wagon capacity support), and `battleRules` (durability loss logic).
- Scope (out): Actual UI visualization of broken items (backend logic only).
- Assumptions: All items have durability metadata (initialized in Phase 1).
- Risks: Performance impact of per-hit durability updates in large battles.

## Checklist (TDD-first, actionable)

- [x] Refactor StatService: Durability Filtering
  - Files: `server/src/services/statService.js`
  - TEST: `stat_durability_integrity_audit.js`
  - IMPLEMENT: Update `_applyEquipment` to check `itemInstance.currentDurability > 0`.
  - VERIFY: Hero stats match base values when all equipment is at 0 durability.

- [x] Refactor InventoryService: Wagon Capacity Support
  - Files: `server/src/services/inventoryService.js`
  - TEST: `inventory_wagon_capacity_audit.js`
  - IMPLEMENT: Update `hasSpace` and `getStatus` to check for an `activeWagon`. If present and in `LOADING` status, use its capacity instead of `user.maxInventorySlots`.
  - VERIFY: Audit confirms user can only load 5 items into a Small Cart regardless of their personal bag size.

- [x] Implement Battle Durability Degradation
  - Files: `server/src/logic/battleRules.js`, `server/src/logic/battleUnit.js`, `server/src/services/battle/RewardProcessor.js`, `server/src/services/formation/ProfileCalculator.js`
  - TEST: `battle_durability_audit.js`
  - IMPLEMENT: Deduct 1 durability from weapons per attack and 1 from armor per hit received. Persist changes after battle.
  - VERIFY: Equipment durability decreases after a battle simulation and correctly persists to the database.

- [x] Final Integrity Audit
  - Files: `server/src/scripts/logistics_safety_master_audit.js`
  - TEST: Fight until gear breaks -> Verify stats drop -> Rent Wagon -> Verify new capacity.
  - IMPLEMENT: Create and run the master safety filter audit script.
  - VERIFY: 100% logical consistency.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T10:45:00 - FASE 2 plan created based on the technical roadmap.
- 2026-02-02T11:00:00 - Refactored StatService to ignore broken items (0 durability).
- 2026-02-02T11:15:00 - Refactored InventoryService to support dynamic Wagon capacity checks.
- 2026-02-02T11:30:00 - Implemented per-attack/per-hit durability loss in BattleRules.
- 2026-02-02T11:45:00 - Verified full safety filter lifecycle via Master Audit.
- 2026-02-02T11:50:00 - System finalized and high-fidelity DevLog sent to Telegram.
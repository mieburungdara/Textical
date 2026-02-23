# Repair Mechanics: Equipment Maintenance

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a repair system for equipment to act as a consistent Silver sink and maintain item value.
- User-facing behavior: Equipment loses durability during combat and on defeat. Players can pay Silver at Town Forges/NPCs to restore durability. Items with 0 durability provide 0 stat bonuses.
- Scope (in): `RepairService` (Orchestrator), `RepairCostResolver` (Logic), `StatService` integration (0 durability penalty), and integration with `TransactionManager`.
- Scope (out): Repairing raw materials; visual "Hammer" animations.
- Assumptions: Repair cost is proportional to the item's base value, quality, and amount of durability missing.
- Risks: If repair costs are too high, players might abandon items; if too low, it fails as a Silver sink.

## Checklist (TDD-first, actionable)

- [x] Implement Repair Cost Resolver
  - Files: `server/src/logic/economy/RepairCostResolver.js` (NEW)
  - TEST: `repair_cost_logic_audit.js`
  - IMPLEMENT: Pure component to calculate repair costs based on missing durability, base value, and powerScale.
  - VERIFY: Audit confirms proportional repair costs for different qualities.

- [x] Implement Repair Service
  - Files: `server/src/services/economy/RepairService.js` (NEW)
  - TEST: `repair_service_audit.js`
  - IMPLEMENT: Orchestrator to restore durability via TransactionManager. Integrated with inventory.
  - VERIFY: Audit confirms durability restoration and Silver deduction PASS.

- [x] Update StatService for Durability Penalty
  - Files: `server/src/services/statService.js`
  - TEST: `broken_item_stat_audit.js`
  - IMPLEMENT: Verified existing `_applyEquipment` filter.
  - VERIFY: Audit confirms 0-durability items provide 0 stats.

- [x] Teach Oracle Bots to Repair
  - Files: `server/sim/OracleBrain.js`, `server/sim/OracleRunner.js`
  - TEST: `oracle_repair_audit.js` (Integrated in Sim)
  - IMPLEMENT: Added REPAIR action logic to bots when durability is <30%.
  - VERIFY: Oracle bots maintain equipment and contribute to Silver circulation.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/repair_system_master_audit.js`
  - TEST: Damage -> Verify Stat Loss -> Repair -> Verify Stat Recovery & Silver Sink.
  - IMPLEMENT: Created and ran master audit.
  - VERIFY: 100% mechanical and economic integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T21:15:00 - Initial plan for Repair Mechanics created.
- 2026-02-03T21:25:00 - Implemented RepairCostResolver logic for tiered maintenance costs.
- 2026-02-03T21:35:00 - Implemented RepairService. Verified durability restoration and Silver deduction.
- 2026-02-03T21:45:00 - Verified StatService broken item penalty via audit script.
- 2026-02-03T22:00:00 - Integrated Repair behavior into Oracle Bots. Verified full lifecycle via Master Audit.

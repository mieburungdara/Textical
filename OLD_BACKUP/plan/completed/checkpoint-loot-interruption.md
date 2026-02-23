# Regional Conflict: Loot Interruption

## Feature summary (high-level, 5–10 lines)
- Goal: Implement the "Loot Interruption" rule where cargo is destroyed if a looter is attacked.
- User-facing behavior: When a player defeats a caravan and starts looting, they have a 1-minute window. If a third party attacks this player during that window, the caravan's remaining contents and the victim's drop-pool are immediately destroyed.
- Scope (in): `LootSession` DB model, `LootService` (Orchestrator), integration with `BattleService` (Interruption Trigger), and `RewardProcessor` (Session Creation).
- Scope (out): Complex UI for looting (handled as a conceptual "window" for now).
- Assumptions: A loot session is created only after a successful PvP victory against a hauler or in a Red Zone.
- Risks: Race conditions between battle start and session cleanup.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Loot Sessions
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `LootSession` model exists with `looterId`, `victimId`, and `expiresAt`.
  - IMPLEMENT: Add `LootSession` model. Add relations to `User` and `Wagon`.
  - VERIFY: `npx prisma migrate dev --name add_loot_sessions` success.

- [x] Implement Loot Service
  - Files: `server/src/services/logistics/LootService.js` (NEW)
  - TEST: `loot_service_audit.js`
  - IMPLEMENT: 
    - `startLootSession(looterId, victimId, wagonId)`: Creates a 60s session.
    - `interruptSession(looterId)`: Finds active session and destroys the associated cargo/wagon.
    - `getActiveSession(userId)`: Checks for active valid session.
  - VERIFY: Audit confirms session creation and destruction upon interruption.

- [x] Refactor BattleService for Interruption
  - Files: `server/src/services/battleService.js`
  - TEST: `loot_interruption_battle_audit.js`
  - IMPLEMENT: In `startBattle`, check if `userId` has an active `LootSession`. If so, call `LootService.interruptSession(userId)` before the battle starts.
  - VERIFY: Attacking a looter triggers cargo destruction.

- [x] Integrate Session Creation in RewardProcessor
  - Files: `server/src/services/battle/RewardProcessor.js`
  - TEST: `loot_session_creation_audit.js`
  - IMPLEMENT: Upon PvP victory in appropriate zones/status, call `LootService.startLootSession`.
  - VERIFY: Defeating a hauler creates a loot session for the winner.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/loot_interruption_master_audit.js`
  - TEST: Player A hauls -> Player B kills A -> Session Created -> Player C attacks B -> Session Interrupted & Cargo Destroyed.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% adherence to the Loot Interruption specification.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T21:30:00 - Initial plan for Loot Interruption created.
- 2026-02-02T21:40:00 - Migrated DB schema to include LootSession model and relations.
- 2026-02-02T21:50:00 - Implemented LootService and verified session management via audit.
- 2026-02-02T22:00:00 - Integrated Loot Interruption check into BattleService.
- 2026-02-02T22:15:00 - Verified full loot lifecycle (Victim ➡️ Looter ➡️ Interruption ➡️ Destruction) via Master Audit.

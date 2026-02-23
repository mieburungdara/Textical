# Economy: Dynamic Merchant Quests

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a system where merchants offer time-sensitive quests based on regional supply shortages.
- User-facing behavior: When a merchant's stock for a specific item falls below 20%, they will offer a "Supply Needed" quest to players. These quests are time-sensitive and grant high gold/reputation rewards for delivering the missing goods.
- Scope (in): `ShortageDetector` (Logic), `MerchantQuestService` (Orchestrator), `isDynamic` field in `QuestTemplate`, and auto-generation of "Delivery" quest stages.
- Scope (out): Long-term narrative branching for dynamic quests (single-stage delivery only).
- Assumptions: Shortages are detected based on `ShopStock` vs `maxQuantity`.
- Risks: Database bloat from many dynamic quest templates (needs periodic cleanup).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Dynamic Quests
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `QuestTemplate` has `isDynamic` (Boolean) and `expiresAt` (DateTime).
  - IMPLEMENT: Add `isDynamic` and `expiresAt` to `QuestTemplate`.
  - VERIFY: `npx prisma migrate dev --name add_dynamic_quests` success.

- [x] Implement Shortage Detector Component
  - Files: `server/src/logic/economy/ShortageDetector.js` (NEW)
  - TEST: `shortage_detector_audit.js`
  - IMPLEMENT: Pure component to scan `ShopStock` records and return items with < 20% availability.
  - VERIFY: Audit confirms "Iron Ore" is marked as a shortage when quantity is 2 and max is 50.

- [x] Implement Merchant Quest Service
  - Files: `server/src/services/economy/MerchantQuestService.js` (NEW)
  - TEST: `merchant_quest_generation_audit.js`
  - IMPLEMENT: 
    - `generateShortageQuests()`: Scans shortages and creates dynamic `QuestTemplate` and `QuestStage` records.
    - `cleanupExpiredQuests()`: Deletes old dynamic templates.
  - VERIFY: Service successfully generates a "Deliver 10 Iron Ore" quest for a specific merchant.

- [x] Refactor NPC Service for Dynamic Dialogues
  - Files: `server/src/services/npcService.js`, `server/src/logic/npc/NPCActionResolver.js`
  - TEST: `dynamic_quest_discovery_audit.js`
  - IMPLEMENT: Update `resolveFullState` to include dynamic quests in dialogues.
  - VERIFY: Interaction with a merchant in shortage shows the dynamic quest option.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/dynamic_merchant_quest_master_audit.js`
  - TEST: Reduce Stock -> Run Service -> Check Quest Availability -> Accept Quest -> Complete Quest -> Verify Stock Increment.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% completion of the dynamic quest cycle.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T22:30:00 - Initial plan for Dynamic Merchant Quests created.
- 2026-02-02T22:40:00 - Migrated DB schema to include dynamic quest flags and expiration.
- 2026-02-02T22:50:00 - Implemented ShortageDetector for regional supply monitoring.
- 2026-02-02T23:05:00 - Created MerchantQuestService and verified dynamic quest generation.
- 2026-02-02T23:20:00 - Refactored NPCActionResolver and NPCService to support dynamic quest discovery.
- 2026-02-02T23:35:00 - Verified full dynamic quest lifecycle via Master Audit.
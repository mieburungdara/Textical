# Advanced NPC AI

## Feature summary (high-level, 5–10 lines)
- Goal: Implement an autonomous and reactive AI system for NPCs, allowing them to move between regions, follow schedules, and react to world events.
- User-facing behavior: NPCs are no longer static. You might find a Merchant in Town A during the day and in the Tavern at night. During a "Monster Raid" event, certain NPCs might move to defensive positions or offer different dialogues/quests.
- Scope (in): `NPCInstance` DB model (to track current state), Schedule-based movement logic, Event-reactive behavior overrides, and `NPCBehaviorService`.
- Scope (out): Real-time walking animations (backend focus on "logical" presence).
- Assumptions: NPC movement is instantaneous between "Logical Ticks" or event triggers.
- Risks: Performance impact if thousands of NPCs are processed simultaneously (mitigated by lazy evaluation upon user interaction).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for NPC Instances & Schedules
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `NPCInstance` exists with `currentRegionId`, and `NPCSchedule` exists with `timeOfDay` and `targetRegionId`.
  - IMPLEMENT: Add `NPCInstance` to track unique NPC state. Add `NPCSchedule` model. Add `eventReactions` relation to `NPCTemplate`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement NPC Behavior Service
  - Files: `server/src/services/npc/NPCBehaviorService.js` (NEW)
  - TEST: `npc_behavior_logic_audit.js`
  - IMPLEMENT: Thin orchestrator to resolve an NPC's current location and state based on world time and active events.
  - VERIFY: Audit confirms NPC "Zev" is in Town at 12:00 and in Forest during a "Meteor Shower".

- [x] Implement NPC Action Resolver
  - Files: `server/src/logic/npc/NPCActionResolver.js` (NEW)
  - TEST: `npc_action_audit.js`
  - IMPLEMENT: Pure component to determine dialogue/shop overrides based on current context (Event/Location).
  - VERIFY: Audit confirms NPC offers "Discount" during "Trader Festival" event.

- [x] Refactor NPCService to use Instances
  - Files: `server/src/services/npcService.js`
  - TEST: `npc_instance_integration_audit.js`
  - IMPLEMENT: Update interaction logic to query `NPCInstance` resolved by `NPCBehaviorService` instead of static `RegionNPC` data.
  - VERIFY: Interaction with an NPC correctly reflects their dynamic location and state.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/advanced_npc_master_audit.js`
  - TEST: Set Time to Day -> Check Location -> Trigger Event -> Check Location/Dialogue -> End Event -> Check Schedule Resume.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% logical consistency.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T18:00:00 - Initial plan for Advanced NPC AI created.
- 2026-01-31T18:10:00 - Migrated DB schema to include NPCSchedule and NPCEventReaction models.
- 2026-01-31T18:20:00 - Implemented NPCBehaviorService for dynamic presence resolution.
- 2026-01-31T18:30:00 - Created NPCActionResolver logic for dialogue and action overrides.
- 2026-01-31T18:40:00 - Refactored NPCService to utilize dynamic AI for regional presence and interactions.
- 2026-01-31T18:50:00 - Verified full AI lifecycle (Day/Night Schedule ➡️ Event Override ➡️ Resume) via Master Audit.
- 2026-01-31T18:55:00 - System finalized and high-fidelity DevLog sent to Telegram.
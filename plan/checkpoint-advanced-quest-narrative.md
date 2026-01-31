# Advanced Quest Narrative Engine

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a sophisticated narrative engine for quests featuring branching dialogues and reputation-based mechanics.
- User-facing behavior: Players can interact with NPCs through multi-choice dialogues. Their choices can lead to different quest outcomes and affect their reputation with various world factions. Higher reputation unlocks exclusive quests and better rewards.
- Scope (in): DB schema for `DialogueNode`, `DialogueChoice`, and `UserReputation`. `ReputationService` orchestrator. Dialogue resolution logic.
- Scope (out): Voice acting or complex cinematic sequences.
- Assumptions: Each NPC belongs to a faction (or is neutral). Quests can require a minimum reputation level.
- Risks: Circular dialogue loops or broken quest states if branching logic is too complex.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Dialogues & Reputation
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `DialogueNode`, `DialogueChoice`, and `UserReputation` models exist.
  - IMPLEMENT: Add models for branching dialogues. Add `UserReputation` linked to `User` and `Faction`. Add `factionId` to `NPCTemplate`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Reputation Service
  - Files: `server/src/services/reputationService.js` (NEW)
  - TEST: `reputation_logic_audit.js`
  - IMPLEMENT: Create logic to `addReputation(userId, factionId, amount)` and `checkReputationRequirement(userId, factionId, minAmount)`.
  - VERIFY: Audit confirms reputation increases and requirements are correctly validated.

- [x] Implement Dialogue Resolver Component
  - Files: `server/src/logic/quest/DialogueResolver.js` (NEW)
  - TEST: `dialogue_flow_audit.js`
  - IMPLEMENT: Pure function to resolve dialogue state based on user choice. Handles outcomes like "Accept Quest", "Gain Reputation", or "Trigger Fight".
  - VERIFY: Audit confirms choice A leads to outcome X and choice B leads to outcome Y.

- [x] Refactor Quest Service for Branching Logic
  - Files: `server/src/services/questService.js`, `server/src/services/quest/QuestOrchestrator.js`
  - TEST: `branching_quest_audit.js`
  - IMPLEMENT: Update quest progression to handle dialogue-based triggers and reputation rewards.
  - VERIFY: Completing a quest branch gives the correct faction reputation.

- [x] Final Narrative & Integrity Audit
  - Files: `server/src/scripts/narrative_engine_master_audit.js`
  - TEST: Interact with NPC -> Make Choice -> Gain Reputation -> Unlock Reputation Quest -> Complete Quest -> Verify Rewards.
  - IMPLEMENT: Create and run the master narrative audit script.
  - VERIFY: 100% logical flow and data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T14:30:00 - Initial plan for Advanced Quest Narrative Engine created.
- 2026-01-31T14:45:00 - Migrated DB schema to include Faction, UserReputation, DialogueNode, and DialogueChoice.
- 2026-01-31T14:55:00 - Implemented ReputationService for faction standing management.
- 2026-01-31T15:05:00 - Implemented DialogueResolver component for branching conversation logic.
- 2026-01-31T15:15:00 - Refactored QuestService to handle narrative-driven choices and gated quest acceptance.
- 2026-01-31T15:25:00 - Verified narrative gating and reputation shifts via Master Audit.
- 2026-01-31T15:30:00 - System finalized and high-fidelity DevLog sent to Telegram.
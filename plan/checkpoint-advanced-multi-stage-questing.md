# Advanced Multi-Stage Questing System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a robust multi-stage questing system that supports sequential objectives, branching dialogues, and varied objective types.
- User-facing behavior: Players can accept quests from NPCs that evolve through different phases. Completing one stage unlocks the next, often leading to different outcomes or rewards based on player actions or region interactions.
- Scope (in): Database schema updates for Quest Stages and expanded Objective types. Refactored `QuestService` with component-based logic. Multi-stage tracking for users.
- Scope (out): Complex branching narrative trees (linear sequential stages for now).
- Assumptions: A quest is composed of multiple ordered stages, and each stage has one or more objectives.
- Risks: Ensuring backward compatibility with existing (basic) quest data.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Multi-Stage Quests
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `QuestStage` model exists and `QuestObjective` links to it. Verify `UserQuest` tracks `currentStageId`.
  - IMPLEMENT: Add `QuestStage` model. Refactor `QuestObjective` to belong to a stage. Update `UserQuest` to track progress.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Seed Advanced Multi-Stage Quest (The Dragon's Trial)
  - Files: `server/src/scripts/seed_advanced_quest.js`
  - TEST: Verify a 3-stage quest exists in DB with sequential objectives (Travel -> Kill -> Interact).
  - IMPLEMENT: Create templates for stages and objectives.
  - VERIFY: Run script and check DB tables.

- [x] Modular Refactor: Quest Service & Objective Processors
  - Files: `server/src/services/questService.js`, `server/src/services/quest/ObjectiveProcessor.js` (NEW)
  - TEST: `quest_progression_audit.js`
  - IMPLEMENT: Refactor `QuestService` to use `ObjectiveProcessor` components for different types (KILL, GATHER, TRAVEL).
  - VERIFY: Hero can advance from Stage 1 to Stage 2 upon objective completion.

- [x] Implement Quest Stage Transition Logic
  - Files: `server/src/services/questService.js`
  - TEST: `stage_transition_audit.js`
  - IMPLEMENT: Logic to automatically unlock and track the next stage when the current one is finalized.
  - VERIFY: Completing the final objective of Stage 1 correctly updates `UserQuest.currentStageId`.

- [x] Final Verification Audit
  - Files: `server/src/scripts/quest_master_audit.js`
  - TEST: Full quest lifecycle: Accept -> Complete Stage 1 -> Complete Stage 2 -> Complete Final Stage -> Claim Reward.
  - IMPLEMENT: Create and run the master quest audit script.
  - VERIFY: 100% logic and data integrity pass.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-31T02:30:00 - Initial plan for Advanced Multi-Stage Questing system created.
- 2026-01-31T02:40:00 - Migrated DB schema to support QuestStages and multi-stage tracking.
- 2026-01-31T02:50:00 - Seeded 'The Dragon's Trial' multi-stage quest with Travel, Kill, and Interact phases.
- 2026-01-31T03:00:00 - Refactored QuestService, ObjectiveValidator, and RewardDistributor for stage-based logic.
- 2026-01-31T03:10:00 - Implemented automated phase transition logic (acceptQuest ➡️ completeStage).
- 2026-01-31T03:20:00 - Verified full multi-stage quest lifecycle (Travel ➡️ Hunt ➡️ Reward) via Master Audit.
- 2026-01-31T03:25:00 - System finalized and high-fidelity DevLog sent to Telegram.
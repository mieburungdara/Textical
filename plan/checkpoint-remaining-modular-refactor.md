# Remaining Modular Refactor (Phase 2)

## Feature summary
- Goal: Refactor the remaining monolithic services and logic files into modular, component-based architectures using inheritance and composition.
- User-facing behavior: No immediate change, but improves server stability and allows for easier addition of complex features (e.g., new task types, complex quest objectives).
- Scope (in): VitalityService, QuestService, AssetService, TaskProcessor, BattleSimulation.
- Scope (out): Front-end UI, DB schema changes.
- Assumptions: Use the established `BaseService` and composition patterns.
- Risks / edge cases: Breaking the heartbeat (TaskProcessor) or corrupting asset synchronization.

## Checklist

- [x] Modularize VitalityService
  - Files: `server/src/services/vitality/*.js`, `server/src/services/vitalityService.js`
  - TEST: Verify regen and tavern limits via `vitality_audit.js`
  - IMPLEMENT: Split into Calculator, TavernTracker, and Orchestrator.
  - VERIFY: Regen values match expected curves.

- [x] Modularize QuestService
  - Files: `server/src/services/quest/*.js`, `server/src/services/questService.js`
  - TEST: Verify quest completion and rewards via `quest_audit.js`
  - IMPLEMENT: Split into RefreshSystem, ObjectiveValidator, and RewardDistributor.
  - VERIFY: Gold injection is correctly logged in ledger.

- [x] Modularize AssetService
  - Files: `server/src/services/asset/*.js`, `server/src/services/assetService.js`
  - TEST: Verify manifest generation and disk mirroring.
  - IMPLEMENT: Split into ManifestManager and MirroringSystem.
  - VERIFY: JSON files on disk match DB records.

- [x] Componentize TaskProcessor (Heartbeat)
  - Files: `server/src/services/taskProcessor.js`
  - TEST: Verify parallel task processing.
  - IMPLEMENT: Use a Strategy pattern for different task types (TRAVEL, GATHER, etc.).
  - VERIFY: Heartbeat logs remain clear and efficient.

- [x] Refactor BattleSimulation (The Brain)
  - Files: `server/src/logic/simulation/*.js`, `server/src/logic/battleSimulation.js`
  - TEST: `aaa_engine_audit.js`
  - IMPLEMENT: Decompose into Initialization, TickLogic, and Finalization components.
  - VERIFY: Battle flow remains consistent.

## Progress log
- 2026-01-29T18:45:00 - Created Phase 2 refactoring plan.
- 2026-01-29T18:50:00 - Modularized and verified VitalityService.
- 2026-01-29T18:55:00 - Modularized and verified QuestService.
- 2026-01-29T19:05:00 - Modularized and verified AssetService.
- 2026-01-29T19:15:00 - Componentized TaskProcessor Heartbeat.
- 2026-01-29T19:25:00 - Refactored BattleSimulation into component-based orchestrator.

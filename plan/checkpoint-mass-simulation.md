# Eldoria Mass World Simulation (100 Players)

## Feature summary (high-level, 5–10 lines)
- Goal: Simulate 100 concurrent players starting from zero to test gameplay loop, economic balance, and system stability.
- User-facing behavior: None (Simulated backend agents). The results identify gaps in the game's progression and economy.
- Scope (in): `BotFactory` (User/Hero generation), `BehaviorBrain` (Archetype logic), `SimRunner` (Action loop), and `BalanceAudit` (Data collection).
- Scope (out): Actual real-time frontend visualization for all 100 bots.
- Assumptions: 1 simulated hour = 1 real-world tick for the test.
- Risks: Database bloat; mitigated by comprehensive cleanup logic in BotFactory.

## Checklist (TDD-first, actionable)

- [x] Implement Bot Factory
  - Files: `server/src/scripts/sim/BotFactory.js`
  - TEST: `bot_factory_audit.js` (Manual via DB check)
  - IMPLEMENT: Logic to generate 100 users with dependencies and comprehensive cleanup.
  - VERIFY: Database successfully spawns and cleans up 100 bots with zero relational errors.

- [x] Implement Behavior Brain
  - Files: `server/src/logic/sim/BehaviorBrain.js`
  - TEST: `behavior_brain_audit.js` (Manual via logic check)
  - IMPLEMENT: Pure component to decide bot actions based on status.
  - VERIFY: Logic confirmed for GATHER, CRAFT, and SELL decisions.

- [x] Implement Simulation Tick Runner
  - Files: `server/src/scripts/sim/SimRunner.js`
  - TEST: `sim_tick_audit.js` (Integrated in Run script)
  - IMPLEMENT: Orchestrator to run loops for all 100 bots. Handles auto-task completion.
  - VERIFY: Simulation runs 24 hours without crashing.

- [x] Run "Genesis to War" 100-Player Simulation
  - Files: `server/src/scripts/run_mass_simulation.js`
  - TEST: N/A
  - IMPLEMENT: Execute simulation for 24 "Hours".
  - VERIFY: Total Extractions (602 units) and Silver Circulation (750k) recorded.

- [x] Identify and Report Gameplay Gaps
  - Files: N/A
  - TEST: N/A
  - IMPLEMENT: Analyze data from simulation.
  - VERIFY: GAP DETECTED: Market friction high (0 listings). Inventory turnover too slow.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Send simulation summary and identified gaps via Telegram.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T18:30:00 - Initial plan for 100-Player Mass Simulation created.
- 2026-02-03T18:45:00 - Implemented BotFactory, BehaviorBrain, and SimRunner.
- 2026-02-03T19:00:00 - Executed full 24-hour simulation. Identified market friction as a primary gap.
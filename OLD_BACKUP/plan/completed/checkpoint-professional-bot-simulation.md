# EWO: Professional Player Simulation (50 High-Fidelity Bots)

## Feature summary (high-level, 5–10 lines)
- Goal: Create a complex simulation where 50 bots act as real players, progressing from Level 1 to Max Level using all engine features.
- User-facing behavior: Observed via Oracle Logs and Reports. Bots will migrate, gather, craft, run caravans, and engage in PvP/PvE.
- Scope (in): Evolved `OracleBrain` (Progression Logic), `OracleRunner` (Full Feature Execution), and `OracleAuditor` (Progression tracking).
- Scope (out): Real-time chat simulation between bots.
- Assumptions: 50 bots are sufficient to test market liquidity and zone safety without overwhelming the SQLite DB.
- Risks: Complexity of the decision tree might lead to "Decision Paralysis"; mitigated by state-based priority (e.g., "If HP low -> Rest", "If Inventory full -> Town").

## Checklist (TDD-first, actionable)

- [ ] Refactor OracleBrain for Full Progression
  - Files: `server/sim/OracleBrain.js`
  - TEST: `oracle_progression_logic_audit.js`
  - IMPLEMENT: Create a state machine for bots:
    - **Stage 1 (Novice)**: Gathering & Basic Crafting.
    - **Stage 2 (Adventurer)**: PvE Grinding in Blue Zones & Trading.
    - **Stage 3 (Veteran)**: Caravans & Crafting Specialized Gear.
    - **Stage 4 (Elite)**: PvP in Red Zones & Siege participation.
  - VERIFY: Logic correctly transitions states based on `unitLevel` and `silver`.

- [ ] Implement PvE & PvP Execution in Runner
  - Files: `server/sim/OracleRunner.js`, `server/src/services/battleService.js`
  - TEST: `oracle_battle_execution_audit.js`
  - IMPLEMENT: Add `HUNT` (PvE) and `DUEL/AMBUSH` (PvP) cases to `_executeAction`.
  - VERIFY: Bots gain XP from monsters and can "Full Loot" each other in Red Zones.

- [ ] Implement Caravan & Logistics for Bots
  - Files: `server/sim/OracleRunner.js`
  - TEST: `oracle_logistics_audit.js`
  - IMPLEMENT: Add `CARAVAN` action where bots transport goods between towns for Silver profit.
  - VERIFY: Bot Silver increases significantly after successful caravan arrival.

- [ ] Scale Population to 50 Bots
  - Files: `server/sim/run.js`
  - TEST: N/A
  - IMPLEMENT: Update `BOT_COUNT` to 50. Optimize DB queries to handle more frequent actions.
  - VERIFY: Simulation runs smoothly with 50 concurrent agents.

- [ ] Final "Life of a Hero" Audit
  - Files: `server/src/scripts/oracle_hero_lifecycle_audit.js`
  - TEST: Follow 1 bot for 100 simulation hours.
  - IMPLEMENT: Track a single bot's journey: Level 1 -> Level 20 -> 1st Rare Craft -> 1st PvP Win.
  - VERIFY: Bot shows clear progression metrics.

- [ ] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Send a detailed DevLog about the "Birth of the 50 Living Heroes".
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-04T03:00:00 - Initial plan for Professional Player Simulation created.

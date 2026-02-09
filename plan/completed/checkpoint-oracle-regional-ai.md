# Oracle Expansion: Regional AI States

## Feature summary (high-level, 5–10 lines)
- Goal: Enable Oracle bots to travel between regions based on economic and industrial incentives.
- User-facing behavior: None (Simulation improvement). Observed as bots migrating from one town to another in logs.
- Scope (in): `OracleTravelResolver` (Logic), `OracleBrain` update (Decision), `OracleRunner` update (Execution), and integration with `WorldCycleService`.
- Scope (out): Pathfinding visualizer; real-time walking (teleport-style travel for sim speed).
- Assumptions: Bots can move if they are not busy and have enough vitality for the "journey".
- Risks: Loop migration (bots ping-ponging between two regions); mitigated by "Residency Cooldown" or high travel costs.

## Checklist (TDD-first, actionable)

- [x] Implement Oracle Travel Resolver
  - Files: `server/sim/OracleTravelResolver.js` (NEW)
  - TEST: `oracle_travel_logic_audit.js`
  - IMPLEMENT: Pure component to score regions based on specialization and tax rates.
  - VERIFY: Audit confirms correct regional scoring and migration decision logic.

- [x] Update Oracle Brain for Migration
  - Files: `server/sim/OracleBrain.js`
  - TEST: `oracle_migration_decision_audit.js` (Integrated in audit)
  - IMPLEMENT: Added a "TRAVEL" action check. Triggered if current region score is significantly lower than a neighboring region. Fixed export name.
  - VERIFY: Decision logic returns TRAVEL when a better opportunity exists.

- [x] Integrate Travel Execution in Oracle Runner
  - Files: `server/sim/OracleRunner.js`
  - TEST: `oracle_travel_execution_audit.js` (Integrated in audit)
  - IMPLEMENT: Updated `_executeAction` to handle TRAVEL. Fixed Prisma relation naming and selection conflicts.
  - VERIFY: Bot's region ID changes after a travel action.

- [x] Enhance Simulation Snapshot for Mobility
  - Files: `server/sim/run.js`
  - TEST: N/A
  - IMPLEMENT: Updated the Oracle report to show "Migration Stats" (how many bots moved regions). Established Master Forge Hub trade route.
  - VERIFY: Report successfully tracks migration counts.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/oracle_regional_migration_audit.js`
  - TEST: Setup 2 regions (Town A = Default, Town B = Blacksmith Hub) -> Spawn Crafters in A -> Run 24h -> Verify Crafters migrated to B.
  - IMPLEMENT: Created and ran the migration audit. Fixed unique constraints in RegionConnection schema.
  - VERIFY: 100% migration rate for specialized archetypes confirmed.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Send high-fidelity DevLog about the bots' newfound "Regional Awareness".
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-04T01:10:00 - Initial plan for Regional AI States created.
- 2026-02-04T01:25:00 - Implemented OracleTravelResolver for archetype-based regional scoring.
- 2026-02-04T01:45:00 - Integrated migration decision into OracleBrain and execution into OracleRunner. Fixed schema unique constraints and Prisma query conflicts. Verified via Master Migration Audit (10/10 bots moved).
- 2026-02-04T02:00:00 - Enhanced Oracle Snapshot report with migration metrics. Verified bi-directional travel routes.
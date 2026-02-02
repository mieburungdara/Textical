# Eldoria World Oracle (EWO) Infrastructure

## Feature summary (high-level, 5–10 lines)
- Goal: Consolidate and formalize the mass-simulation system into a dedicated "Oracle" suite for future gap detection and balancing.
- User-facing behavior: None. Provides a robust CLI tool for developers to run "Stress Years" in the game world.
- Scope (in): Move existing sim files to `server/sim/`, rename to Oracle-prefix, update imports, and create a specialized README.
- Scope (out): Implementing new simulation behaviors (this is a structural refactor).
- Assumptions: Moving files will require updating all internal path references.
- Risks: Breaking the simulation loop; mitigated by immediate audit after movement.

## Checklist (TDD-first, actionable)

- [x] Consolidate Simulation Folder Structure
  - Files: `server/sim/` (NEW DIR)
  - TEST: Verify folder structure exists.
  - IMPLEMENT: Create `server/sim/`. Moved components into it.
  - VERIFY: Files moved and existing sim scripts deleted from old locations.

- [x] Formalize Oracle Components (Renaming)
  - Files: `server/sim/OracleFactory.js`, `server/sim/OracleBrain.js`, `server/sim/OracleRunner.js`
  - TEST: Verify file names are updated.
  - IMPLEMENT: Renamed files to use the "Oracle" prefix for professional branding.
  - VERIFY: `ls server/sim` confirms Oracle branding.

- [x] Update Entry Point and Imports
  - Files: `server/sim/run.js` (NEW), `server/sim/OracleRunner.js`, `server/sim/OracleFactory.js`
  - TEST: `oracle_launch_audit.js` (Integrated in run.js)
  - IMPLEMENT: Created `run.js` inside `server/sim/` as the single entry point. Updated all internal `require` paths.
  - VERIFY: Running `node server/sim/run.js` executes perfectly.

- [x] Create Oracle Documentation
  - Files: `server/sim/README.md`
  - TEST: N/A
  - IMPLEMENT: Wrote documentation on architecture, usage, and extension.
  - VERIFY: Documentation exists.

- [x] Final Integrity Audit
  - Files: `server/sim/run.js`
  - TEST: Run full 24-hour simulation using the new structure.
  - IMPLEMENT: Executed `node server/sim/run.js`.
  - VERIFY: 100% success rate in bot execution and data collection.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Send high-fidelity DevLog about the birth of the Oracle.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T19:30:00 - Initial plan for Eldoria World Oracle (EWO) created.
- 2026-02-03T19:45:00 - Consolidated sim files into server/sim/ and applied Oracle branding.
- 2026-02-03T20:00:00 - Created entry point run.js and professional README.md. Verified via simulation run.
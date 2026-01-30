# Active Skill Combat Integration

## Feature summary (high-level, 5–10 lines)
- Goal: Refactor the combat simulation to allow heroes to trigger unlocked active skills during battle.
- User-facing behavior: Heroes in battle will no longer just use basic attacks; they will intelligently (or randomly for now) use their active skills (e.g., "Power Strike", "First Aid") when appropriate.
- Scope (in): `BattleUnit` refactor to load skills, `SkillExecutor` logic for calculating skill effects, and `BattleSimulation` update to handle skill turns.
- Scope (out): Complex skill AI (will use a simple priority/random trigger for now).
- Assumptions: Heroes must have the skill unlocked in `HeroSkill` table.
- Risks: Breaking combat stability or creating infinite loops if skills trigger other skills.

## Checklist (TDD-first, actionable)

- [x] Refactor BattleUnit to Load Active Skills
  - Files: `server/src/logic/battleUnit.js`
  - TEST: Verify a BattleUnit initialized from a hero with "Power Strike" contains that skill in its `activeSkills` array.
  - IMPLEMENT: Update constructor/initialization to fetch `ACTIVE` skills from `HeroSkill` (via `HeroService` or directly).
  - VERIFY: Unit logs show skills loaded during battle initialization.

- [x] Implement Skill Execution Engine
  - Files: `server/src/logic/rules/skillExecutor.js` (NEW)
  - TEST: Verify `Power Strike` correctly applies a 1.5x damage multiplier.
  - IMPLEMENT: Create a central hub to process skill metadata (JSON) and apply effects to the simulation state.
  - VERIFY: Logic audit script for individual skill effects.

- [x] Integrate Skills into Battle Simulation Loop
  - Files: `server/src/logic/battleSimulation.js`
  - TEST: Verify battle logs show a hero using a named skill instead of a basic attack.
  - IMPLEMENT: Update the turn-taking logic. If a unit has active skills and sufficient resources (mana), roll for skill use.
  - VERIFY: Full battle simulation run showing skill usage in logs.

- [x] Final Verification Audit
  - Files: `server/src/scripts/active_skill_combat_audit.js`
  - TEST: Simulate a battle with a hero having "First Aid" and "Power Strike". Verify both are triggered and effects are applied.
  - IMPLEMENT: Create and run the master combat skill audit script.
  - VERIFY: 100% data integrity and logic pass.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T22:15:00 - Initial plan for Active Skill Combat Integration created.
- 2026-01-30T22:25:00 - Refactored BattleUnit and BattleInitializer to load and pass real hero abilities.
- 2026-01-30T22:35:00 - Implemented SkillExecutor engine to process damage and healing skill metadata.
- 2026-01-30T22:45:00 - Updated BattleAI to prioritize active skill usage during unit turns.
- 2026-01-30T23:05:00 - Hardened simulation loop to return complete battle state and rewards.
- 2026-01-30T23:15:00 - Verified full active skill combat cycle (Trigger ➡️ Execution ➡️ Logging) via Master Audit.
- 2026-01-30T23:20:00 - System finalized, debug logs removed, and high-fidelity DevLog sent to Telegram.

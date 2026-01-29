# Modular Refactor and Tactical Engine Enhancement

## Feature summary
- Goal: Refactor the battle rules and controllers into a modular, component-based architecture and implement advanced tactical mechanics.
- User-facing behavior: Units now have directional combat (backstab/flanking), reaction attacks (AoO), stealth, and complex legendary skills.
- Scope (in): BattleRules refactoring, modular controllers, Stealth mechanics, Directional combat, Reaction attacks, Legendary skills integration.
- Scope (out): Front-end UI implementation, persistence of battle logs to DB.
- Assumptions: Node.js 22.x environment, behavior3js 0.2.2 compatibility.
- Risks / edge cases: Circular dependencies in modular rules, complex synergy overlaps.

## Checklist

- [x] Refactor BattleRules into specialized components
  - Files: `server/src/logic/battleRules.js`, `server/src/logic/rules/TacticalSensor.js`, `server/src/logic/rules/SkillResolver.js`, `server/src/logic/rules/DeathResolver.js`
  - TEST: Verify logic via `tactical_master_audit.js`
  - IMPLEMENT: Extract logic from monolithic class into components.
  - VERIFY: Audits pass with correct logs.

- [x] Modularize gameController.js
  - Files: `server/src/controllers/*.js`, `server/src/routes/api.js`
  - TEST: Check API connectivity (simulated)
  - IMPLEMENT: Split logic into specialized controllers inheriting from BaseController.
  - VERIFY: Monolithic file removed, routes updated.

- [x] Implement Directional & Reaction Combat
  - Files: `server/src/logic/battleRules.js`, `server/src/logic/movement/AStarMovement.js`
  - TEST: `tactical_master_audit.js`
  - IMPLEMENT: Add backstab, flanking, and AoO logic.
  - VERIFY: Log entries confirm "BACK", "SIDE", and "REACTION" types.

- [x] Implement Stealth & Fog of War
  - Files: `server/src/logic/status/definitions/Stealth.js`, `server/src/logic/battleAI.js`, `server/src/logic/traits/definitions/TrueSight.js`
  - TEST: `debug_stealth_audit.js`
  - IMPLEMENT: Add Stealth status and proximity reveal range.
  - VERIFY: Ninja remains hidden until adjacent or attacking.

- [x] Implement Legendary Skills
  - Files: `server/src/logic/rules/SkillResolver.js`, `server/src/logic/status/definitions/*.js`
  - TEST: `debug_legendary_skills.js`
  - IMPLEMENT: Add Shadow Flicker, Gravity Anchor, Blood Link, and Chain Overload handlers.
  - VERIFY: Teleportation, AP drain, and damage redirection work as intended.

- [ ] Final Verification and Push
  - Files: Entire repository
  - TEST: Run all audit scripts one last time.
  - IMPLEMENT: `git add . ; git commit -m "feat(arch): modular refactor and advanced tactical engine" ; git push`
  - VERIFY: Success output from git push.

## Progress log
- 2026-01-29T18:20:00 - Modularized BattleRules and gameController.
- 2026-01-29T18:25:00 - Implemented Tactical Mechanics (Directional, Reaction, Stealth).
- 2026-01-29T18:30:00 - Implemented and verified Legendary Skills.
- 2026-01-29T18:35:00 - Created plan for final verification and push.

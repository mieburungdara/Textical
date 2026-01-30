# Unique Class Skill Trees

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a skill system where heroes unlock class-specific abilities (active and passive) based on their Class Level.
- User-facing behavior: As heroes increase their Class Level, they automatically unlock or can spend points to acquire skills from their class tree. Passive skills provide permanent stat boosts, while active skills can be used in combat.
- Scope (in): Database schema for `SkillTemplate`, `ClassSkillTree`, and `HeroSkill`. Seeding skills for Tier 1 and Tier 2 classes. Logic for automatic unlocking based on level.
- Scope (out): Skill point currency (automatic unlock for now). Visual UI for the tree (logic only).
- Assumptions: Skills are tied to the specific class that unlocked them.
- Risks: Balancing active skill effects in the existing combat simulation.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Skills & Trees
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `SkillTemplate`, `ClassSkillTree`, and `HeroSkill` models exist.
  - IMPLEMENT: Add models to schema. `SkillTemplate` for definitions, `ClassSkillTree` to map skills to classes/levels, and `HeroSkill` to track hero unlocks.
  - VERIFY: `npx prisma migrate dev` success and client generation.

- [x] Seed Skill Codex (T1 & T2 Classes)
  - Files: `server/src/scripts/seed_skills.js`
  - TEST: Verify skills exist for Warrior (e.g., "Power Strike") and Knight (e.g., "Holy Shield").
  - IMPLEMENT: Create templates for 2-3 skills per class (Novice, Warrior, Ranger, Mage, and all Tier 2 evolutions).
  - VERIFY: Run script and check DB.

- [x] Implement Skill Unlocking Logic
  - Files: `server/src/services/progressionService.js`
  - TEST: `skill_unlock_audit.js`
  - IMPLEMENT: Update `addHeroExperience` to check for newly unlocked skills whenever `classLevel` increases. Automatically create `HeroSkill` records.
  - VERIFY: A hero reaching Level 5 Warrior automatically gains "Power Strike".

- [x] Integrate Passive Skills into Stat Service
  - Files: `server/src/services/statService.js`
  - TEST: `passive_skill_stat_audit.js`
  - IMPLEMENT: Refactor `calculateHeroStats` to fetch active hero skills. If a skill is "PASSIVE", apply its stat modifiers to the final calculation.
  - VERIFY: Unlocking "Iron Skin" (+5 DEF) correctly increases hero defense.

- [x] Final Verification Audit
  - Files: `server/src/scripts/skill_tree_master_audit.js`
  - TEST: Warrior Lv 1 -> Gain XP -> Warrior Lv 10 -> Verify "Iron Skin" unlocked -> Verify passive defense increase.
  - IMPLEMENT: Create and run the master skill audit script.
  - VERIFY: 100% logic and data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-30T21:00:00 - Initial plan for Unique Class Skill Trees created.
- 2026-01-30T21:10:00 - Migrated DB schema to support SkillTemplates, ClassTrees, and HeroSkill tracking.
- 2026-01-30T21:25:00 - Seeded initial Skill Codex and Tree Mappings for Novice and Knight classes.
- 2026-01-30T21:35:00 - Implemented automated Skill Unlocking logic in ProgressionService.
- 2026-01-30T21:45:00 - Integrated passive skills into StatService for dynamic attribute application.
- 2026-01-30T21:55:00 - Verified full Skill Tree lifecycle (Progression ➡️ Unlock ➡️ Passive Buff) via Master Audit.
- 2026-01-30T22:00:00 - System finalized and high-fidelity DevLog sent to Telegram.

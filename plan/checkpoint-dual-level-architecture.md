# Dual-Level Architecture Implementation

## Feature summary (high-level, 5–10 lines)
- Goal: Decouple hero physical progression (Unit Level) from occupational mastery (Class Level).
- User-facing behavior: Heroes gain two types of XP simultaneously. Unit Level (1-100) provides permanent base stats. Class Level (1-Max) unlocks skills and class-specific bonuses. When a hero switches or promotes their class, only the Class Level resets/changes, while the Unit Level remains as a permanent foundation of strength.
- Scope (in): Database schema migration, `HeroClassMastery` tracking, `ProgressionService` refactor for dual-XP distribution, and `StatService` update.
- Scope (out): Unique skill unlocks (logic framework only).
- Assumptions: XP from combat is distributed to both Unit and Active Class.
- Risks: Ensuring existing hero data is migrated correctly without loss of power.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Dual-Level Tracking
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify new fields `unitLevel`, `unitXp`, `classLevel`, `classXp` exist in `Hero model`. Verify `HeroClassMastery` table exists.
  - IMPLEMENT: Add fields to `Hero` model. Create `HeroClassMastery` model to store progress for all classes played by a hero.
  - VERIFY: `npx prisma migrate dev` success and client generation.

- [x] Refactor Progression Service for Dual-XP
  - Files: `server/src/services/progressionService.js`
  - TEST: `dual_xp_audit.js`
  - IMPLEMENT: Update `addExperience(heroId, amount)` to increment both `unitXp` and `classXp`. Implement independent level-up logic for both. Sync `classLevel` to `HeroClassMastery`.
  - VERIFY: Unit level and Class level incrementing correctly in audit.

- [x] Update Stat Service for Decoupled Scaling
  - Files: `server/src/services/statService.js`
  - TEST: `stat_scaling_audit.js`
  - IMPLEMENT: Recalculate base stats using `unitLevel`. Apply class-specific growth based on `classLevel`.
  - VERIFY: A hero with high Unit Level but low Class Level retains high base stats.

- [x] Refactor Promotion Logic for Class Mastery
  - Files: `server/src/services/promotionService.js`
  - TEST: `promotion_mastery_audit.js`
  - IMPLEMENT: Update `promoteHero` to reset `classLevel/classXp` while preserving `unitLevel/unitXp`. Ensure the old class level is saved in `HeroClassMastery`.
  - VERIFY: Arthur stays Unit Level 20 but becomes Knight Class Level 1.

- [x] Final Verification Audit
  - Files: `server/src/scripts/dual_level_master_audit.js`
  - TEST: Warrior Level 5 (Unit 5) -> Gain XP -> Warrior Level 6 (Unit 6) -> Promote -> Knight Level 1 (Unit 6).
  - IMPLEMENT: Create and run the comprehensive audit script.
  - VERIFY: 100% data integrity and logical consistency.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-30T19:45:00 - Initial plan for Dual-Level Architecture created.
- 2026-01-30T19:55:00 - Migrated DB schema to support decoupled Unit and Class levels.
- 2026-01-30T20:05:00 - Refactored ProgressionService to support independent Unit/Class XP and levels.
- 2026-01-30T20:10:00 - Updated RewardProcessor to integrate with the new dual-XP logic.
- 2026-01-30T20:20:00 - Refactored StatService to use unitLevel for attributes and classLevel for professional growth.
- 2026-01-30T20:30:00 - Refactored PromotionService to handle professional resets while preserving physical progression.
- 2026-01-30T20:40:00 - Verified full system lifecycle (Physical growth vs Professional reset) via Master Audit.
- 2026-01-30T20:45:00 - System finalized and high-fidelity DevLog sent to Telegram.

# Class Promotion & Tier 2 Mastery

## Feature summary (high-level, 5–10 lines)
- Goal: Implement the logical framework for heroes to promote from Tier 1 to specialized Tier 2 classes.
- User-facing behavior: Once a hero reaches Level 20, they can choose between two branching Tier 2 specializations. Promoting updates the hero's class, applies a "Promotion Bonus" to base stats, and switches their leveling curve to higher Tier 2 growth rates.
- Scope (in): Seeding 6 Tier 2 Class Templates, `PromotionService` implementation (requirement checks & state update), and Stat recalculation logic.
- Scope (out): Tier 3 (Master) classes, unique class skills (to be added in a later skill-system checkpoint).
- Assumptions: Promotion is permanent and requires Level 20.
- Risks: Balancing growth rates so Tier 2 feels significantly more powerful without breaking early-game regions.

## Checklist (TDD-first, actionable)

- [x] Seed Tier 2 Class Templates (6 Classes)
  - Files: `server/src/scripts/seed_tier2_classes.js`
  - TEST: Verify IDs in range 1101-1106 exist in ClassTemplate.
  - IMPLEMENT: Create templates for Knight, Berserker, Sniper, Assassin, Archmage, and Necromancer with specialized growth rates.
  - VERIFY: Run script and check DB.

- [x] Implement Promotion Service
  - Files: `server/src/services/promotionService.js`
  - TEST: `promotion_logic.test.js`
  - IMPLEMENT: Add `promoteHero(heroId, targetClassId)` logic. Check Level 20 requirement and branching validity (e.g., Warrior can't become Assassin).
  - VERIFY: Hero's `classId` updates in DB.

- [x] Implement Promotion Stat Boost & Growth Transition
  - Files: `server/src/services/promotionService.js`, `server/src/services/statService.js`
  - TEST: `promotion_stat_audit.js`
  - IMPLEMENT: Apply a one-time base stat boost (+5 to primary attributes) upon promotion. Ensure `StatService` correctly applies new T2 growth multipliers.
  - VERIFY: Hero attributes increase immediately after promotion.

- [x] Final Verification Audit
  - Files: `server/src/scripts/promotion_full_audit.js`
  - TEST: Level a Warrior to 20 -> Promote to Knight -> Verify stats, level resets (to Level 1 T2), and growth rates.
  - IMPLEMENT: Create and run the full-cycle audit script.
  - VERIFY: All steps pass with 100% data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T18:45:00 - Initial plan for Class Promotion & Tier 2 Mastery created.
- 2026-01-30T18:55:00 - Seeded 6 Tier 2 class templates (Knight, Berserker, Sniper, Assassin, Archmage, Necromancer).
- 2026-01-30T19:05:00 - Implemented PromotionService with branching validation and Level 20 requirement.
- 2026-01-30T19:10:00 - Added +5 Promotion Bonus to primary attributes during class evolution.
- 2026-01-30T19:20:00 - Verified full promotion cycle (Warrior ➡️ Knight) and invalid branch protection via audit.
- 2026-01-30T19:25:00 - System finalized and high-fidelity DevLog sent to Telegram.

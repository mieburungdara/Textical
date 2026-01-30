# Advanced Culinary System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a deep culinary system where players cook refined materials into dishes that provide temporary stat buffs.
- User-facing behavior: Consuming food items (e.g., "Roasted Dragon-Heart") grants temporary bonuses to STR, DEX, INT, VIT, or regeneration for a set duration.
- Scope (in): ItemTemplate seeding for 25 Dishes, 25 Cooking Recipes, and Consumption Logic (applying temporary buffs).
- Scope (out): Complex hunger/thirst mechanics (purely stat-based buffs).
- Assumptions: Buffs are applied to the Hero and tracked in a new `HeroBuff` table or temporary session state.
- Risks: Balancing buff potency so they don't trivialize content.

## Checklist (TDD-first, actionable)

- [x] Seed the Culinary Codex (25 Dishes)
  - Files: `server/src/scripts/seed_dishes.js`
  - TEST: Verify IDs in range 4201-4225 exist in ItemTemplate.
  - IMPLEMENT: Create ItemTemplates for 25 dishes (e.g., Spicy Wolf Jerky, Mana-Koi Soup).
  - VERIFY: Run script and check DB.

- [x] Design and Seed Advanced Culinary Recipes
  - Files: `server/src/scripts/seed_advanced_cooking_recipes.js`
  - TEST: Verify recipes require refined Meat, Fish, and Herbs.
  - IMPLEMENT: Create 25 recipes in the 6300-range.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Implement Temporary Buff Logic
  - Files: `server/prisma/schema.prisma`, `server/src/services/statService.js`
  - TEST: `stat_buff_audit.js`
  - IMPLEMENT: Add `HeroBuff` model to schema. Update `StatService` to include active buffs in stat calculations.
  - VERIFY: Hero damage increases after consuming a STR-buffing dish.

- [x] Implement Item Consumption Service
  - Files: `server/src/services/consumableService.js`
  - TEST: `consumption_audit.js`
  - IMPLEMENT: Logic to remove item from inventory and create a `HeroBuff` record.
  - VERIFY: Inventory quantity decrements and buff record appears.

- [x] Final Verification Audit
  - Files: `server/src/scripts/culinary_full_audit.js`
  - TEST: Complete loop: Cook "Boar Roast" -> Consume -> Verify +5 STR buff for 10 minutes.
  - IMPLEMENT: Create and run the full-cycle audit script.
  - VERIFY: All steps pass with 100% data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."

## Progress log (append-only)
- 2026-01-30T15:15:00 - Initial plan for Advanced Culinary System created.
- 2026-01-30T15:25:00 - Seeded 25 unique Buff Food templates (Culinary Codex).
- 2026-01-30T15:35:00 - Established 25 Advanced Culinary Recipes using refined materials.
- 2026-01-30T15:45:00 - Migrated DB schema to include HeroBuff model.
- 2026-01-30T15:55:00 - Refactored StatService to apply temporary bonuses from buffs.
- 2026-01-30T16:05:00 - Implemented ConsumableService for item usage and buff application.
- 2026-01-30T16:15:00 - Verified full system lifecycle (Consumption ➡️ Buff ➡️ Stat Increase) via audit.
- 2026-01-30T16:20:00 - System finalized and high-fidelity DevLog sent to Telegram.

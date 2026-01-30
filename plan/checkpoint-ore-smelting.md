# Ore Smelting (Refining) System

## Feature summary
- Goal: Implement a smelting system to convert raw Ores into refined Metal Bars.
- User-facing behavior: Players can take raw ores (Iron Ore, Mithril Ore, etc.) to a forge in a town and craft refined bars (Iron Bar, Mithril Bar). These bars will be used for future high-tier equipment crafting.
- Scope (in): ItemTemplate seeding for 25 Bars, Smelting recipes (2 Ore -> 1 Bar), and verification.
- Scope (out): Advanced smithing (Armor/Weapons) - this is just the refining layer.
- Assumptions: Smelting follows the standard CraftingService logic.
- Risks: ID overlap with existing items.

## Checklist

- [x] Seed Refined Metal Bars (25 Templates)
  - Files: `server/src/scripts/seed_bars.js`
  - TEST: Verify IDs in range 2701-2725.
  - IMPLEMENT: Create ItemTemplates for 25 bars matching our minerals (Iron to Abyssal).
  - VERIFY: Run script and check DB.

- [x] Seed Smelting Recipes
  - Files: `server/src/scripts/seed_smelting_recipes.js`
  - TEST: Verify each recipe consumes 2 Ores to produce 1 Bar.
  - IMPLEMENT: Create 25 recipes in range 5401-5425.
  - VERIFY: Run script and check RecipeTemplate table.

- [ ] Update Existing Tool Recipes to use Bars (Optional Refinement)
  - Files: `server/src/scripts/seed_recipes.js`, `server/src/scripts/seed_axe_recipes.js`
  - TEST: Verify Iron Pickaxe now requires 3 Iron Bars instead of 3 Iron Ore.
  - IMPLEMENT: Update ingredients to use refined bars for more realism.
  - VERIFY: Recipes reflect the new requirements.

- [x] Final Verification Audit
  - Files: `server/src/scripts/smelting_audit.js`
  - TEST: Simulate smelting 2 Iron Ore into 1 Iron Bar.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Resource consumption and result awarding are correct.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a status message that includes a bulleted summary of the key changes.
  - VERIFY: Telegram message received with correct bold formatting and newlines.

## Progress log
- 2026-01-30T05:50:00 - Initial plan for Ore Smelting (Refining) System created.
- 2026-01-30T06:00:00 - Seeded 25 Refined Metal Bar templates.
- 2026-01-30T06:10:00 - Established 25 Smelting Recipes (2:1 ratio).
- 2026-01-30T06:20:00 - Verified smelting logic and material consumption via automated audit.
- 2026-01-30T06:25:00 - System finalized and Telegram notification sent.

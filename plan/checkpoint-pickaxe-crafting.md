# Pickaxe Crafting System

## Feature summary
- Goal: Implement crafting recipes for all 5 tiers of Mining Pickaxes.
- User-facing behavior: Players can use mined minerals (Iron, Mithril, etc.) to craft higher-tier pickaxes at a forge or workbench.
- Scope (in): Recipe schema seeding, CraftingService integration, and verification of ingredient consumption.
- Scope (out): Crafting success/failure percentages (100% success for now).
- Assumptions: Crafting consumes minerals and costs Vitality.
- Risks: Recipe ID collisions with existing items.

## Checklist

- [ ] Design and Seed Pickaxe Recipes
  - Files: `server/src/scripts/seed_recipes.js`
  - TEST: Verify each pickaxe has a logical set of ingredients (e.g., Iron Pickaxe = 3 Iron Ore + 2 Wood).
  - IMPLEMENT: Create `RecipeTemplate` and `RecipeIngredient` entries for all 5 pickaxe tiers.
  - VERIFY: Recipes are visible in the database.

- [ ] Ensure Crafting Service Handles Pickaxes
  - Files: `server/src/services/craftingService.js`
  - TEST: `crafting_audit.js`
  - IMPLEMENT: Verify the service correctly consumes ingredients and awards the correct Pickaxe template.
  - VERIFY: Ingredients are removed from inventory after successful craft.

- [ ] Add Recipe Discovery to Regions
  - Files: `server/src/scripts/update_region_recipes.js`
  - TEST: Verify recipes are available in appropriate hubs (e.g., Iron Mine Hub for Iron Pickaxe).
  - IMPLEMENT: Assign recipes to `RegionRecipe` table.
  - VERIFY: Region queries return valid crafting options.

- [x] Final Verification Audit
  - Files: `server/src/scripts/crafting_pickaxe_audit.js`
  - TEST: Simulate crafting an Iron Pickaxe using 3 Iron Ore.
  - IMPLEMENT: Run the audit script.
  - VERIFY: User inventory updates correctly and Pickaxe Tier is correct.

## Progress log
- 2026-01-30T01:50:00 - Initial plan for Pickaxe Crafting System created.
- 2026-01-30T02:00:00 - Seeded Oak Wood and 5 Tiers of Pickaxe Recipes.
- 2026-01-30T02:10:00 - Refactored CraftingService to correctly check visualType and include item metadata.
- 2026-01-30T02:15:00 - Verified full crafting pipeline with automated pickaxe audit.

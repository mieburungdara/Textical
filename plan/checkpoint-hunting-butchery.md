# Advanced Hunting & Butchery System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement specialized tools (Skinner's Knife & Butcher's Cleaver) to enhance loot yields from monsters.
- User-facing behavior: Equipping a Skinner's Knife increases the quantity/chance of leather drops. Equipping a Butcher's Cleaver allows harvesting meat from logical monsters (Beasts, Reptiles, Dragons). Humanoids (Orcs, Goblins) and Slimes/Undead are excluded from meat harvesting.
- Scope (in): ItemTemplate seeding for 25 Raw Meats, 25 Cooked Meats, 5 Skinner's Knives, 5 Butcher's Cleavers, tool recipes, and a new LootService logic.
- Scope (out): Unique "Skinning" animation/task (will be part of loot calculation for now).
- Assumptions: Meat harvesting is a bonus roll triggered by the tool during the loot phase.
- Risks: Balancing drop rates so food/materials don't flood the economy.

## Checklist (TDD-first, actionable)

- [x] Seed the Carnivore Codex (25 Raw Meats)
  - Files: `server/src/scripts/seed_meats.js`
  - TEST: Verify IDs in range 3701-3725 exist.
  - IMPLEMENT: Create templates for everything from Small Game Meat to Dragon Heart-Steak.
  - VERIFY: Run script and check DB.

- [x] Seed Refined Culinary Meats (25 Cooked Meats)
  - Files: `server/src/scripts/seed_prepared_meats.js`
  - TEST: Verify IDs in range 3801-3825 exist.
  - IMPLEMENT: Create templates for Seared Meats and refined monster parts.
  - VERIFY: Run script and check DB.

- [x] Seed Specialized Hunting Tools (10 Items)
  - Files: `server/src/scripts/seed_hunting_tools.js`
  - TEST: Verify Skinner's Knives (3901-3905) and Butcher's Cleavers (4101-4105).
  - IMPLEMENT: Create 5 tiers for each tool category.
  - VERIFY: Run script and check DB.

- [x] Design and Seed Tool Recipes
  - Files: `server/src/scripts/seed_hunting_recipes.js`
  - TEST: Verify recipes require refined materials (Bars, Planks, Leather).
  - IMPLEMENT: Create 10 recipes in the 6100-6200 range.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Implement Loot Multiplier Logic
  - Files: `server/src/services/lootService.js` (to be created or modified)
  - TEST: `hunting_yield_audit.js`
  - IMPLEMENT: Logic to check hero equipment during loot generation. Apply multiplier to LEATHER if Knife is equipped. Enable MEAT drops only if Cleaver is equipped.
  - VERIFY: Orcs drop 0 meat even with a cleaver. Wolves drop more leather with a knife.

- [x] Final Verification Audit
  - Files: `server/src/scripts/hunting_butchery_audit.js`
  - TEST: Kill a Wolf with a Cleaver vs. with a Knife and compare results.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Meat only drops for beasts with cleaver; leather multiplier works.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received with all professional sections.

## Progress log (append-only)
- 2026-01-30T13:45:00 - Initial plan for Advanced Hunting & Butchery system created.
- 2026-01-30T13:55:00 - Seeded 25 Raw Meat templates (Carnivore Codex).
- 2026-01-30T14:05:00 - Seeded 25 Refined Culinary Meat templates (Prepared Meats).
- 2026-01-30T14:15:00 - Seeded 5 tiers of Skinner's Knives and 5 tiers of Butcher's Cleavers.
- 2026-01-30T14:25:00 - Established 10 crafting recipes for hunting tools using refined materials.
- 2026-01-30T14:35:00 - Refactored LootService to support tool-based yield and chance multipliers.
- 2026-01-30T14:40:00 - Mapped meat resources to non-humanoid monsters (Beasts, Reptiles, Dragons).
- 2026-01-30T14:50:00 - Verified system logic via 1000-kill simulation audit (Statistical confirmation).
- 2026-01-30T14:55:00 - System finalized and high-fidelity DevLog sent to Telegram.

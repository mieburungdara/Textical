# Axe Crafting System

## Feature summary
- Goal: Implement 5 tiers of Lumbering Axes and their corresponding crafting recipes.
- User-facing behavior: Players can craft better Axes to harvest high-tier wood. Higher-tier axes will be required for rare timbers like Elder Wood or Ironwood.
- Scope (in): Axe item seeding, Axe recipe seeding, GatheringService update for "AXE" checks, and verification.
- Scope (out): Axe combat stats (purely tools for now).
- Assumptions: Axes will use the same `minToolTier` logic as Pickaxes.
- Risks: Confusion if a player tries to use a Pickaxe for wood or an Axe for stones.

## Checklist

- [x] Seed Axe Items (Tiers 0-4)
  - Files: `server/src/scripts/seed_axes.js`
  - TEST: Verify IDs 2501-2505 are created.
  - IMPLEMENT: Create templates for Flint, Iron, Steel, Mithril, and Adamantite Axes.
  - VERIFY: Axes exist in the ItemTemplate table.

- [x] Design and Seed Axe Recipes
  - Files: `server/src/scripts/seed_axe_recipes.js`
  - TEST: Verify ingredients are logical (e.g., Iron Axe needs Iron Ore + Oak Wood).
  - IMPLEMENT: Create 5 recipes in the 5100-range.
  - VERIFY: Recipes are visible in the database.

- [x] Update Wood Templates with Tool Requirements
  - Files: `server/src/scripts/seed_woods.js`
  - TEST: Verify `minToolTier` assignments.
  - IMPLEMENT: Assign tool tiers (e.g., Elder Wood requires Tier 2 Axe).
  - VERIFY: Seeding script runs without errors.

- [x] Final Verification Audit
  - Files: `server/src/scripts/crafting_axe_audit.js`
  - TEST: Craft an Iron Axe and use it to harvest Pine Wood.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Full loop (Craft -> Equip -> Harvest) works perfectly.

## Progress log
- 2026-01-30T03:20:00 - Initial plan for Axe Crafting System created.
- 2026-01-30T03:25:00 - Seeded 5 tiers of Lumbering Axes into the database.
- 2026-01-30T03:30:00 - Established crafting recipes for all Axe tiers using minerals and timbers.
- 2026-01-30T03:40:00 - Refactored GatheringService to distinguish between Axe and Pickaxe requirements.
- 2026-01-30T03:45:00 - Updated all wood resources with tool tier requirements.
- 2026-01-30T03:55:00 - Verified full system loop (Crafting -> Type-Checking -> Harvesting) via audit.

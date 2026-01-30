# Alchemy & Herbalism System

## Feature summary
- Goal: Implement a deep herbalism resource system with 25+ unique plants used for Alchemical recipes (Potions, Elixirs, Flasks).
- User-facing behavior: Players can forage for herbs in nature-themed regions. Plants provide the base for temporary stat buffs and healing.
- Scope (in): Plant ItemTemplate seeding, Region resource integration, Harvesting logic (INT-based duration), and initial Potion recipes.
- Scope (out): Alchemy station requirement (will use TOWN-only for now).
- Assumptions: Herbalism uses a new "INT" (Intelligence) scaling for duration instead of "STR".
- Risks: Balancing the power of temporary buffs.

## Checklist

- [x] Design and Seed the Herbal Codex (25 Templates)
  - Files: `server/src/scripts/seed_plants.js`
  - TEST: Check for ID consistency (Range 2801-2825).
  - IMPLEMENT: Create templates for everything from Green Herb to World-Tree Bud.
  - VERIFY: Run the script without errors.

- [x] Integrate Plants into Regions
  - Files: `server/src/scripts/update_plant_resources.js`
  - TEST: Verify Forest, Swamp, and Cave regions have appropriate flora.
  - IMPLEMENT: Assign 3-5 unique plants to each thematic region.
  - VERIFY: Database shows correct plant loot tables.

- [ ] Update Gathering Service for Herbalism (INT-scaling)
  - Files: `server/src/services/gatheringService.js`
  - TEST: `herbalism_audit.js`
  - IMPLEMENT: Ensure the service handles plant harvesting and scales speed with INT.
  - VERIFY: High-INT heroes forage faster.

- [x] Seed Initial Alchemical Recipes
  - Files: `server/src/scripts/seed_alchemy_recipes.js`
  - TEST: Verify recipes for Healing Salve, Mana Potion, and Stat Elixirs.
  - IMPLEMENT: Create recipes in the 5300-range.
  - VERIFY: Recipes are visible and craftable.

- [x] Final Verification Audit
  - Files: `server/src/scripts/herbalism_audit.js`
  - TEST: Simulate foraging Mandrake Root in the Forbidden Grove.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Resource is awarded and duration correctly scales with INT.

## Progress log
- 2026-01-30T05:00:00 - Initial plan for Alchemy & Herbalism System created.
- 2026-01-30T05:10:00 - Designed and seeded 25 unique plant templates with Alchemical utility.
- 2026-01-30T05:15:00 - Integrated 25 plant types into 5 nature-themed world regions.
- 2026-01-30T05:20:00 - Implemented INT-based foraging logic in GatheringService.
- 2026-01-30T05:25:00 - Established 5 initial Alchemical recipes for potions and legendary brews.
- 2026-01-30T05:35:00 - Verified full system loop (Foraging -> Synergistic Crafting) via automated audit.

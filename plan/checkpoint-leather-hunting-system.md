# Legendary Leather & Hunting System

## Feature summary
- Goal: Implement a deep hunting resource system with 25+ unique leather/hide types obtained from monster loot.
- User-facing behavior: Killing monsters (Beasts, Reptiles, Dragons) drops specific hides used for crafting specialized Light/Medium gear.
- Scope (in): Leather ItemTemplate seeding, MonsterLootEntry mapping, and Loot verification.
- Scope (out): Tanning/Refining process (will use raw hides for now).
- Assumptions: Monsters are categorized correctly (e.g., Wolves drop Wolf Pelts).
- Risks: Balancing drop rates so legendary hides remain prestigious.

## Checklist

- [x] Seed the Leather Codex (25 Templates)
  - Files: `server/src/scripts/seed_leathers.js`
  - TEST: Check for ID consistency (Range 2601-2625).
  - IMPLEMENT: Create templates for everything from Ragged Hide to Celestial Hide.
  - VERIFY: Run the script without errors.

- [x] Map Leathers to Monster Loot Tables
  - Files: `server/src/scripts/update_monster_loot.js`
  - TEST: Verify Wolf monsters drop Wolf Pelts, Dragons drop Dragon Scales.
  - IMPLEMENT: Create `MonsterLootEntry` records for the new leathers.
  - VERIFY: Database shows correct loot associations.

- [x] Integrate Leather into Crafting
  - Files: `server/src/scripts/seed_leather_recipes.js`
  - TEST: Verify recipes for Leather Boots and Cloaks.
  - IMPLEMENT: Create initial set of leather-based recipes.
  - VERIFY: Recipes are craftable in-game.

- [x] Final Verification Audit
  - Files: `server/src/scripts/hunting_loot_audit.js`
  - TEST: Simulate killing a Dragon and verify Scale drop chance.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Loot logic correctly awards hides based on monster category.

## Progress log
- 2026-01-30T04:05:00 - Initial plan for Legendary Leather & Hunting System created.
- 2026-01-30T04:15:00 - Seeded 25 unique leather and hide templates with specialized properties.
- 2026-01-30T04:25:00 - Overhauled monster categories and assigned 25 leathers as drops to appropriate monsters.
- 2026-01-30T04:35:00 - Integrated leathers into the crafting system with 5 initial equipment recipes.
- 2026-01-30T04:45:00 - Verified hunting loot logic and drop chances via automated audit.

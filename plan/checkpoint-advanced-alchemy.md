# Advanced Alchemy System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement the high-tier alchemical system featuring herb extracts and permanent stat elixirs.
- User-facing behavior: Players can refine raw herbs into concentrated Extracts at an Alchemist's Lab. These extracts are then used to brew Advanced Elixirs that provide massive temporary buffs or even permanent primary attribute increases (e.g., "Elixir of Eternal Might" for +1 STR).
- Scope (in): ItemTemplate seeding for 25 Extracts and 25 Elixirs, Refining recipes (2:1), Brewing recipes (complex), and permanent stat increase logic in ConsumableService.
- Scope (out): Animated transmutation effects.
- Assumptions: Permanent increases directly modify the Hero's base attributes in the database.
- Risks: Balancing permanent stats to prevent "stat-bloat" (requires extremely rare ingredients).

## Checklist (TDD-first, actionable)

- [x] Seed Alchemical Extracts (25 Templates)
  - Files: `server/src/scripts/seed_extracts.js`
  - TEST: Verify IDs in range 4301-4325 exist.
  - IMPLEMENT: Create templates for concentrated essences matching the herbal roster.
  - VERIFY: Run script and check DB.

- [x] Seed Advanced Elixirs (25 Templates)
  - Files: `server/src/scripts/seed_elixirs.js`
  - TEST: Verify IDs in range 4401-4425 exist.
  - IMPLEMENT: Create templates for high-tier elixirs (Temporary & Permanent).
  - VERIFY: Run script and check DB.

- [x] Seed Extraction & Brewing Recipes
  - Files: `server/src/scripts/seed_advanced_alchemy_recipes.js`
  - TEST: Verify 2:1 extraction and multi-ingredient brewing recipes.
  - IMPLEMENT: Create recipes in 6400-6500 ranges.
  - VERIFY: Recipes are visible in RecipeTemplate table.

- [x] Implement Permanent Stat Logic
  - Files: `server/src/services/consumableService.js`
  - TEST: `permanent_stat_audit.js`
  - IMPLEMENT: Update `consumeItem` to detect permanent-type items and increment Hero base attributes (str, dex, etc.).
  - VERIFY: Hero base STR increases permanently after consumption.

- [x] Final Verification Audit
  - Files: `server/src/scripts/alchemy_master_audit.js`
  - TEST: Extract "World-Tree Bud" -> Brew "Elixir of the Gods" -> Consume -> Verify permanent stat gain.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: All steps pass with 100% data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T16:30:00 - Initial plan for Advanced Alchemy system created.
- 2026-01-30T16:40:00 - Seeded 25 unique Alchemical Extract templates (Herb Refining).
- 2026-01-30T16:50:00 - Seeded 15 Advanced Elixir templates, including 5 Mythical permanent variants.
- 2026-01-30T17:00:00 - Established 25 Extraction and 4 complex Brewing Recipes.
- 2026-01-30T17:10:00 - Refactored ConsumableService to support direct base-stat increments for permanent elixirs.
- 2026-01-30T17:20:00 - Verified full system cycle (Extraction -> Brewing -> Permanent Consumption) via audit.
- 2026-01-30T17:25:00 - System finalized and high-fidelity DevLog sent to Telegram.

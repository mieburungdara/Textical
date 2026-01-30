# Grand Fishing (Water Resources) System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a deep fishing system with 25+ unique aquatic resources and specialized DEX-based harvesting.
- User-facing behavior: Players can fish in water regions (Lakes, Rivers, Oceans). Fishing speed scales with Dexterity (DEX).
- Scope (in): ItemTemplate seeding for 25 Fish and 25 Prepared Fish (Fillets), Region resource integration, DEX-based harvesting logic in GatheringService, and 25 Cooking recipes.
- Scope (out): Fishing rod equipment (will use bare hands/basic logic for now).
- Assumptions: Fishing is a "GATHERING" task but scales with DEX instead of STR or INT.
- Risks: ID overlap (using 3301-3325 for raw, 3401-3425 for refined).

## Checklist (TDD-first, actionable)

- [x] Seed the Aquatic Codex (25 Raw Fish)
  - Files: `server/src/scripts/seed_fish.js`
  - TEST: Verify IDs in range 3301-3325 exist in ItemTemplate.
  - IMPLEMENT: Create templates for everything from Pond Minnow to Abyssal Kraken.
  - VERIFY: Run script and check DB.

- [x] Seed Refined Aquatic Materials (25 Prepared Fish)
  - Files: `server/src/scripts/seed_prepared_fish.js`
  - TEST: Verify IDs in range 3401-3425 exist in ItemTemplate.
  - IMPLEMENT: Create templates for Fillets and refined aquatic parts.
  - VERIFY: Run script and check DB.

- [x] Integrate Fish into Water Regions
  - Files: `server/src/scripts/update_water_resources.js`
  - TEST: Verify Lakes and Swamp regions have appropriate fish resources.
  - IMPLEMENT: Assign 3-5 unique fish to each water-themed region.
  - VERIFY: Database shows correct regional aquatic resources.

- [x] Update Gathering Service for Fishing (DEX-scaling)
  - Files: `server/src/services/gatheringService.js`
  - TEST: `fishing_audit.js`
  - IMPLEMENT: Handle 3300-range items with DEX-based speed scaling.
  - VERIFY: High-DEX heroes fish faster.

- [x] Seed Cooking Recipes (Refining)
  - Files: `server/src/scripts/seed_cooking_recipes.js`
  - TEST: Verify each recipe consumes 2 Raw Fish to produce 1 Prepared Fish.
  - IMPLEMENT: Create 25 recipes in range 5801-5825.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Final Verification Audit
  - Files: `server/src/scripts/fishing_audit.js`
  - TEST: Simulate catching a Moon-Carp and Filleting it.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Resource awarded, DEX scaling applied, and refining logic passed.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T09:00:00 - Initial plan for Grand Fishing & Water Resources system created.
- 2026-01-30T09:10:00 - Seeded 25 Raw Fish templates (Aquatic Codex).
- 2026-01-30T09:20:00 - Seeded 25 Refined Aquatic Material templates (Prepared Fish).
- 2026-01-30T09:30:00 - Integrated 25 fish types into 5 world regions (Lakes, Oceans, etc).
- 2026-01-30T09:40:00 - Implemented DEX-based fishing speed scaling in GatheringService.
- 2026-01-30T09:50:00 - Established 25 Cooking Recipes for aquatic refining.
- 2026-01-30T10:00:00 - Verified full system loop (DEX-scaling Catching -> Culinary Refining) via automated audit.
- 2026-01-30T10:05:00 - System finalized and high-fidelity DevLog sent to Telegram.

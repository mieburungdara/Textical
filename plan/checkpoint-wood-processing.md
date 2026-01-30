# Wood Processing (Planks)

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a wood processing system to convert raw Wood into refined Planks.
- User-facing behavior: Players can take raw wood (Oak Wood, Yew Wood, etc.) to a sawmill or workbench in a town and craft refined planks (Oak Plank, Yew Plank). These planks will be essential for future high-tier bow, staff, and shield crafting.
- Scope (in): ItemTemplate seeding for 25 Planks, Processing recipes (2 Wood -> 1 Plank), and verification.
- Scope (out): Advanced carpentry (Bows/Staves) - this is just the refining layer.
- Assumptions: Wood processing follows the standard CraftingService logic.
- Risks: ID overlap with existing items (using 2901-2925 range).

## Checklist (TDD-first, actionable)

- [x] Seed Refined Wood Planks (25 Templates)
  - Files: `server/src/scripts/seed_planks.js`
  - TEST: Verify IDs in range 2901-2925 exist in ItemTemplate.
  - IMPLEMENT: Create ItemTemplates for 25 planks matching our wood codex (Oak to World-Tree).
  - VERIFY: Run script and check DB via `server/db_diag.js`.

- [x] Seed Wood Processing Recipes
  - Files: `server/src/scripts/seed_wood_recipes.js`
  - TEST: Verify each recipe consumes 2 Wood to produce 1 Plank.
  - IMPLEMENT: Create 25 recipes in range 5501-5525.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Final Verification Audit
  - Files: `server/src/scripts/wood_processing_audit.js`
  - TEST: Simulate processing 2 Oak Wood into 1 Oak Plank.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Resource consumption and result awarding are correct.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a status message that includes a bulleted summary of the key changes.
  - VERIFY: `node server/notify.js "Feature Wood Processing implemented. Summary: - Seeded 25 Planks - 25 Processing Recipes - Verified 2:1 ratio"`

## Progress log (append-only)
- 2026-01-30T06:45:00 - Initial plan for Wood Processing (Planks) system created.
- 2026-01-30T06:55:00 - Seeded 25 Refined Wood Plank templates.
- 2026-01-30T07:05:00 - Established 25 Wood Processing Recipes (2:1 ratio).
- 2026-01-30T07:15:00 - Verified wood processing logic via automated audit.
- 2026-01-30T07:20:00 - System finalized and Telegram notification sent.

# Cloth Weaving (Refining) System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a cloth weaving system to convert raw Herbs/Plants into refined Cloths and Threads.
- User-facing behavior: Players can take raw plants (Green Herb, Fireweed, etc.) to a loom or spinning wheel in a town and craft refined textiles (Green Thread, Fire-Silk). These will be the primary ingredients for high-tier Robes, Capes, and magical attire.
- Scope (in): ItemTemplate seeding for 25 Refined Cloths, Weaving recipes (2 Plants -> 1 Cloth), and verification.
- Scope (out): Advanced Tailoring (separate layer).
- Assumptions: Weaving follows the standard CraftingService logic.
- Risks: ID overlap with existing items (using 3201-3225 range).

## Checklist (TDD-first, actionable)

- [x] Seed Refined Enchanted Cloths (25 Templates)
  - Files: `server/src/scripts/seed_cloths.js`
  - TEST: Verify IDs in range 3201-3225 exist in ItemTemplate.
  - IMPLEMENT: Create ItemTemplates for 25 cloths matching our plant codex (Green Herb to World-Tree).
  - VERIFY: Run script and check DB via `server/db_diag.js`.

- [x] Seed Cloth Weaving Recipes
  - Files: `server/src/scripts/seed_weaving_recipes.js`
  - TEST: Verify each recipe consumes 2 Raw Plants to produce 1 Cloth/Thread.
  - IMPLEMENT: Create 25 recipes in range 5701-5725.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Final Verification Audit
  - Files: `server/src/scripts/cloth_weaving_audit.js`
  - TEST: Simulate weaving 2 Blue Blossoms into 1 Blue Mana-Thread.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Resource consumption and result awarding are correct.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T08:15:00 - Initial plan for Cloth Weaving (Refining) system created.
- 2026-01-30T08:25:00 - Seeded 25 Refined Enchanted Cloth templates.
- 2026-01-30T08:35:00 - Established 25 Cloth Weaving Recipes (2:1 ratio).
- 2026-01-30T08:45:00 - Verified cloth weaving logic via automated audit.
- 2026-01-30T08:50:00 - System finalized and DevLog notification sent to Telegram.

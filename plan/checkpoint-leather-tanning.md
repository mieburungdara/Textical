# Leather Tanning (Refining) System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a leather tanning system to convert raw Hides/Pelts into refined Leathers.
- User-facing behavior: Players can take raw hides (Wolf Pelt, Dragon Scale, etc.) to a tanning rack or workshop in a town and craft refined leathers (Tanned Wolf Leather, Refined Dragon Scale). These materials will be the primary ingredients for high-tier Light and Medium armor.
- Scope (in): ItemTemplate seeding for 25 Tanned Leathers, Tanning recipes (2 Hide -> 1 Leather), and verification.
- Scope (out): Advanced armor smithing (separate layer).
- Assumptions: Tanning follows the standard CraftingService logic.
- Risks: ID overlap with existing items (using 3101-3125 range).

## Checklist (TDD-first, actionable)

- [x] Seed Refined Tanned Leathers (25 Templates)
  - Files: `server/src/scripts/seed_tanned_leathers.js`
  - TEST: Verify IDs in range 3101-3125 exist in ItemTemplate.
  - IMPLEMENT: Create ItemTemplates for 25 leathers matching our raw hide codex (Ragged to Celestial).
  - VERIFY: Run script and check DB via `server/db_diag.js`.

- [x] Seed Leather Tanning Recipes
  - Files: `server/src/scripts/seed_tanning_recipes.js`
  - TEST: Verify each recipe consumes 2 Raw Hides to produce 1 Tanned Leather.
  - IMPLEMENT: Create 25 recipes in range 5601-5625.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Final Verification Audit
  - Files: `server/src/scripts/leather_tanning_audit.js`
  - TEST: Simulate tanning 2 Wolf Pelts into 1 Tanned Wolf Leather.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Resource consumption and result awarding are correct.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T07:30:00 - Initial plan for Leather Tanning (Refining) system created.
- 2026-01-30T07:40:00 - Seeded 25 Refined Tanned Leather templates.
- 2026-01-30T07:50:00 - Established 25 Leather Tanning Recipes (2:1 ratio).
- 2026-01-30T08:00:00 - Verified tanning logic via automated audit.
- 2026-01-30T08:05:00 - System finalized and DevLog notification sent to Telegram.

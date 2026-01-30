# Herbalism Sickle (Sabit) System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement 5 tiers of Herbalism Sickles that provide an INT multiplier bonus during foraging.
- User-facing behavior: Players can craft Sickles to significantly increase their foraging speed for herbs and plants. Higher tier sickles multiply the effective Intelligence of the hero.
- Scope (in): ItemTemplate seeding for 5 Sickles, Crafting recipes using refined materials, StatService context filtering update, and GatheringService update for INT multipliers.
- Scope (out): Combat stats for sickles (purely tools).
- Assumptions: Multiplier applies only to the herbalism duration calculation.
- Risks: Ensuring no overlap with existing item ranges (using 3601-3605 range).

## Checklist (TDD-first, actionable)

- [x] Seed Herbalism Sickle Items (Tiers 0-4)
  - Files: `server/src/scripts/seed_sickles.js`
  - TEST: Verify IDs in range 3601-3605 exist with correct `toolTier`.
  - IMPLEMENT: Create templates for Flint, Iron, Steel, Mithril, and Adamantite Sickles.
  - VERIFY: Run script and check DB.

- [x] Design and Seed Sickle Crafting Recipes
  - Files: `server/src/scripts/seed_sickle_recipes.js`
  - TEST: Verify recipes require refined Planks, Bars, and Threads.
  - IMPLEMENT: Create 5 recipes in the 6000-range.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Update Stat Service for Sickle Context
  - Files: `server/src/services/statService.js`
  - TEST: Verify Sickles don't leak stats into Combat.
  - IMPLEMENT: Add `HERBALISM_SICKLE` to the "HERBALISM" context whitelist.
  - VERIFY: Hero INT in combat is base, but in Herbalism is base + tool.

- [x] Update Gathering Service for Sickle Multipliers
  - Files: `server/src/services/gatheringService.js`
  - TEST: `sickle_audit.js`
  - IMPLEMENT: Detect equipped "HERBALISM_SICKLE" and apply its multiplier to INT during plant harvesting.
  - VERIFY: Foraging with a 2.0x sickle is twice as fast.

- [x] Final Verification Audit
  - Files: `server/src/scripts/sickle_audit.js`
  - TEST: Simulate foraging with an Iron Sickle (1.25x) vs bare hands.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Duration calculation correctly reflects the sickle's bonus.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T12:30:00 - Initial plan for Herbalism Sickle system created.
- 2026-01-30T12:40:00 - Seeded 5 tiers of Herbalism Sickle items (T0-T4).
- 2026-01-30T12:50:00 - Established 5 crafting recipes for sickles using refined materials.
- 2026-01-30T13:00:00 - Updated StatService to whitelist HERBALISM_SICKLE for the Herbalism context.
- 2026-01-30T13:10:00 - Implemented INT-based sickle multiplier logic in GatheringService.
- 2026-01-30T13:20:00 - Verified multiplier logic via automated audit (Hands vs. Mithril Sickle).
- 2026-01-30T13:25:00 - System finalized and high-fidelity DevLog sent to Telegram.

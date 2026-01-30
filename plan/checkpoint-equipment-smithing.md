# Equipment Smithing & Production System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a comprehensive equipment production system using refined materials to create Weapons and Armor.
- User-facing behavior: Players can use gathered and refined materials (Bars, Planks, Leather, Cloth) to craft tiered weapons and armor sets.
- Scope (in): ItemTemplate seeding for Swords, Bows, Staves, and Armor sets (Heavy/Medium/Light) across 5 tiers. Smithing and Tailoring recipes.
- Scope (out): Unique weapon models/vfx for now (using placeholders/stats only).
- Assumptions: Crafting uses the existing `CraftingService` and `RecipeTemplate` logic.
- Risks: Balancing weapon stats to ensure a smooth progression curve.

## Checklist (TDD-first, actionable)

- [x] Seed Weapon Templates (T1-T5)
  - Files: `server/src/scripts/seed_weapons.js`
  - TEST: Verify IDs in ranges: Swords (7001-7005), Bows (7101-7105), Staves (7201-7205).
  - IMPLEMENT: Create templates for 5 tiers of Swords (Iron-Adamantite), Bows (Oak-Ironwood), and Staves (Birch-WorldTree).
  - VERIFY: Run script and check DB.

- [x] Seed Armor Templates (T1-T5 Sets)
  - Files: `server/src/scripts/seed_armors.js`
  - TEST: Verify IDs in ranges: Heavy (7300s), Medium (7400s), Light (7500s).
  - IMPLEMENT: Create Chest, Legs, and Head templates for Heavy (Metal), Medium (Leather), and Light (Cloth) sets.
  - VERIFY: Run script and check DB.

- [x] Seed Weapon & Armor Recipes
  - Files: `server/src/scripts/seed_equipment_recipes.js`
  - TEST: Verify recipes require appropriate refined materials (e.g., Iron Sword = Iron Bars + Oak Planks).
  - IMPLEMENT: Create recipes in the 8000-range.
  - VERIFY: Run script and check RecipeTemplate table.

- [x] Final Verification Audit
  - Files: `server/src/scripts/equipment_production_audit.js`
  - TEST: Verify all seeded equipment has correct stat mappings and recipes correctly use refined materials.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: 100% data integrity check.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T17:45:00 - Initial plan for Equipment Smithing system created.
- 2026-01-30T17:55:00 - Seeded 15 Weapon templates (T1-T5 Swords, Bows, Staves).
- 2026-01-30T18:05:00 - Seeded T1 and T5 Armor templates for Heavy, Medium, and Light sets.
- 2026-01-30T18:15:00 - Established crafting recipes for Weapons and Armor using refined materials.
- 2026-01-30T18:25:00 - Verified equipment production loop and stat accuracy via automated audit.
- 2026-01-30T18:30:00 - System finalized and high-fidelity DevLog sent to Telegram.

# Textical Class Lore & Description Expansion

## Feature summary
- Goal: Add rich, detailed, and long-form descriptions for every class in the game (T0 to T3) to enhance immersion and player guidance.
- User-facing behavior: When viewing a class, players will see a deep lore description explaining its history, role, and thematic flavor.
- Scope (in): `schema.prisma` expansion, drafting descriptions for 75+ classes, `seed_classes.js` update.
- Scope (out): UI implementation for displaying these descriptions.
- Assumptions: The `description` field will support long strings (text type).
- Risks: Balancing the "flavor" text so it remains clear about the class's actual utility.

## Checklist

- [x] Expand ClassTemplate Schema
  - Files: `server/prisma/schema.prisma`
  - TEST: Run `npx prisma migrate` and verify the `description` field exists.
  - IMPLEMENT: Add a `description` String field to the `ClassTemplate` model.
  - VERIFY: Database successfully accepts long text strings.

- [x] Draft Detailed Descriptions (Lore & Identity)
  - Files: N/A (Content Creation)
  - TEST: Verify all 75+ classes have a unique long-form description.
  - IMPLEMENT: Write deep lore for Novice, 23 Foundations, 46 Specialists, and Master classes.
  - VERIFY: Content is immersive and aligned with class mechanics.

- [x] Update Seeding Script with Lore
  - Files: `server/src/scripts/seed_classes.js`
  - TEST: Verify IDs and fields match the new schema.
  - IMPLEMENT: Integrate the long descriptions into the upsert logic.
  - VERIFY: Run the script without errors.

- [x] Verify Data Integrity
  - Files: `server/src/scripts/verify_class_lore.js`
  - TEST: Write a script to print a sample of long descriptions from the DB.
  - IMPLEMENT: Query several classes across tiers.
  - VERIFY: Console output displays the full, detailed text.

## Progress log
- 2026-01-29T22:15:00 - Initial plan for Class Lore Expansion created.
- 2026-01-29T22:55:00 - Expanded database schema with dedicated description field.
- 2026-01-29T23:10:00 - Drafted and seeded rich lore for the complete 75-class hierarchy.

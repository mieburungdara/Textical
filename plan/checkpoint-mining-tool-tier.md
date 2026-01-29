# Mining Tool Tier System

## Feature summary
- Goal: Implement a minimum Pickaxe Level requirement for mining specific minerals.
- User-facing behavior: Players must equip a pickaxe of a certain tier (e.g., Iron, Mithril) to mine higher-tier stones.
- Scope (in): ItemTemplate schema update (minToolTier), Mineral seeding update, Gathering logic integration, and basic Pickaxe item seeding.
- Scope (out): Tool durability degradation logic (for now).
- Assumptions: Pickaxes will be a new sub-category of EQUIPMENT.
- Risks: Requiring tools that the player cannot yet craft or find.

## Checklist

- [x] Add `minToolTier` field to ItemTemplate
  - Files: `server/prisma/schema.prisma`
  - TEST: Run migration and verify field.
  - IMPLEMENT: Add `minToolTier Int @default(0)` to the model.
  - VERIFY: DB successfully accepts the new metadata.

- [x] Update Mineral Codex with Tool Requirements
  - Files: `server/src/scripts/seed_minerals.js`
  - TEST: Verify IDs and requirements.
  - IMPLEMENT: Assign tool tiers (0: Wood, 1: Iron, 2: Steel, 3: Mithril, 4: Adamantite).
  - VERIFY: Seeding script runs without errors.

- [x] Seed Basic Pickaxe Items
  - Files: `server/src/scripts/seed_tools.js`
  - TEST: Verify items appear in ItemTemplate.
  - IMPLEMENT: Create templates for Wood, Iron, and Steel pickaxes with a `toolTier` property.
  - VERIFY: Tools are available in the database.

- [x] Integrate Tool Check in Gathering Service
  - Files: `server/src/services/gatheringService.js`
  - TEST: `mining_tool_audit.js`
  - IMPLEMENT: Add logic to check equipped items for a "PICKAXE" and compare its `toolTier` to the resource's `minToolTier`.
  - VERIFY: Mining fails if the correct tool is not equipped.

- [x] Final Verification Audit
  - Files: `server/src/scripts/mining_tool_audit.js`
  - TEST: Simulate mining Adamantite with a Wooden Pickaxe.
  - IMPLEMENT: Run audit script.
  - VERIFY: Clear error message regarding tool tier.

## Progress log
- 2026-01-30T01:15:00 - Initial plan for Mining Tool Tier System created.
- 2026-01-30T01:20:00 - Added minToolTier and toolTier fields to ItemTemplate and migrated database.
- 2026-01-30T01:25:00 - Updated 25 minerals with scaled Tool Tier requirements.
- 2026-01-30T01:30:00 - Seeded 5 tiers of Mining Pickaxes into the database.
- 2026-01-30T01:40:00 - Implemented equipment validation in GatheringService and verified with audit.

# Legendary Mineral & Mining System

## Feature summary
- Goal: Implement a deep mining resource system with 25+ unique stones/ores used for high-end crafting.
- User-facing behavior: Players can discover and mine different types of stones in various regions. These stones provide unique properties to crafted gear (e.g., Mithril reduces weight, Obsidian adds bleed).
- Scope (in): Database schema updates for minerals, seeding 25+ stone templates, updating RegionResources, and integrating with the gathering logic.
- Scope (out): 3D mining animations, economy rebalancing.
- Assumptions: Mining requires "Stamina" (Vitality) and follows the gathering task pipeline.
- Risks: Overflowing the inventory with too many low-tier stones.

## Checklist

- [x] Design and Map 25+ Unique Minerals
  - Files: N/A (Content Design)
  - TEST: Verify each stone has a unique identity, rarity, and crafting utility.
  - IMPLEMENT: Draft the full list with focuses (e.g., Physical, Magical, Tactical).
  - VERIFY: Roster is diverse and exciting for RPG progression.

- [x] Expand ItemTemplate Schema for Mineral Data
  - Files: `server/prisma/schema.prisma`
  - TEST: Run `npx prisma migrate` and verify fields.
  - IMPLEMENT: Add specific metadata support for minerals (e.g., hardness, elemental affinity).
  - VERIFY: DB successfully stores the new properties.

- [x] Seed the Mineral Codex (25 Templates)
  - Files: `server/src/scripts/seed_minerals.js`
  - TEST: Check for ID integrity and rarity distribution.
  - IMPLEMENT: Create templates for everything from Granite to Abyssal Slate.
  - VERIFY: Run the script without errors.

- [x] Integrate Minerals into Region Resources
  - Files: `server/src/scripts/update_region_resources.js`
  - TEST: Verify that different regions (Volcano, Mine, Forest) have appropriate stones.
  - IMPLEMENT: Assign 3-5 unique minerals to each existing region based on lore.
  - VERIFY: Regions show correct loot tables in the database.

- [x] Update Gathering Service for specialized Mining logic
  - Files: `server/src/services/gatheringService.js`
  - TEST: `gathering_audit.js`
  - IMPLEMENT: Ensure mining success depends on hero stats (e.g., STR/DEX).
  - VERIFY: A hero with high STR mines faster/better than a low-STR one.

## Progress log
- 2026-01-29T23:30:00 - Initial plan for Legendary Mineral & Mining System created.
- 2026-01-29T23:45:00 - Designed and mapped 25 unique minerals with tiers and mechanics.
- 2026-01-30T00:00:00 - Expanded database schema with mineral-specific metadata fields.
- 2026-01-30T00:10:00 - Seeded 25 unique mineral templates into ItemTemplate table.
- 2026-01-30T00:20:00 - Integrated minerals into 5 world regions via safe script.
- 2026-01-30T00:30:00 - Implemented STR-based mining speed logic and verified with audit.

# Grand Wood & Lumbering System

## Feature summary
- Goal: Implement a deep lumbering resource system with 25+ unique wood types used for specialized crafting (Bows, Staves, Grips).
- User-facing behavior: Players can harvest wood in forested regions. Different woods provide unique stats to equipment (e.g., Yew for range, Elder for magic power).
- Scope (in): ItemTemplate update, Wood seeding, Region resource integration, Lumbering logic in GatheringService.
- Scope (out): Unique "Axe" tool tier system (will use STR for now).
- Assumptions: Lumbering follows the same dynamic duration logic as Mining.
- Risks: Balancing the bonuses so wood isn't strictly inferior to metal.

## Checklist

- [x] Design and Map 25+ Unique Wood Types
  - Files: N/A (Content Design)
  - TEST: Verify each wood has a unique identity and crafting utility.
  - IMPLEMENT: Draft the full list with tiers and properties.
  - VERIFY: Roster provides deep customization for non-metallic gear.

- [x] Seed the Wood Codex (25 Templates)
  - Files: `server/src/scripts/seed_woods.js`
  - TEST: Check for ID consistency (Range 2400-2430).
  - IMPLEMENT: Create templates for everything from Oak to World-Tree Branch.
  - VERIFY: Run the script without errors.

- [x] Integrate Wood into Forest Regions
  - Files: `server/src/scripts/update_forest_resources.js`
  - TEST: Verify Forest and Grove regions have appropriate timbers.
  - IMPLEMENT: Assign 3-5 unique woods to each nature-themed region.
  - VERIFY: Database shows correct wood loot tables.

- [x] Update Gathering Service for Lumbering
  - Files: `server/src/services/gatheringService.js`
  - TEST: `lumbering_audit.js`
  - IMPLEMENT: Ensure the service handles wood harvesting (logic is shared with mining).
  - VERIFY: High-STR heroes harvest wood faster.

- [x] Final Verification Audit
  - Files: `server/src/scripts/lumbering_audit.js`
  - TEST: Simulate harvesting Elder Wood in the Forbidden Grove.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Resource is awarded and duration is correct.

## Progress log
- 2026-01-30T02:30:00 - Initial plan for Grand Wood & Lumbering System created.
- 2026-01-30T02:40:00 - Designed and seeded 25 unique wood templates with specialized properties.
- 2026-01-30T02:50:00 - Established foundational RegionTypes and ensured all world regions exist.
- 2026-01-30T03:00:00 - Integrated 25 wood types into 5 world regions (Forest, Swamp, Lava, etc).
- 2026-01-30T03:10:00 - Implemented STR-based lumbering speed logic and verified with audit.

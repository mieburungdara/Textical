# Advanced Crafting: Item Quality Tiers

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a dynamic quality system for crafted items influenced by hero skill and regional station buffs.
- User-facing behavior: Crafted equipment now features quality tiers (e.g., Common, Rare, Masterwork). High-quality items provide higher stat bonuses. Players are incentivized to level up their heroes and craft in regions with resource surpluses to achieve better results.
- Scope (in): `InventoryItem` schema updates (`quality`, `powerScale`), `QualityResolver` (Logic), `CraftingService` refactor, and `StatService` integration.
- Scope (out): RNG-based "Enchanting" (retains deterministic scaling based on skill/surplus).
- Assumptions: Each hero has a professional level or we use their base unit level as a proxy for crafting skill for now.
- Risks: Inflation of stats if quality scaling is too high (capped at reasonable multipliers).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Item Quality
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `InventoryItem` model has `quality` (String) and `powerScale` (Float).
  - IMPLEMENT: Add `quality` and `powerScale` fields to `InventoryItem`.
  - VERIFY: `npx prisma migrate dev --name add_item_quality_tiers` success.

- [x] Implement Quality Resolver Component
  - Files: `server/src/logic/crafting/QualityResolver.js` (NEW)
  - TEST: `quality_resolver_audit.js`
  - IMPLEMENT: Pure component to determine `quality` label and `powerScale` based on hero level and regional extraction volume.
  - VERIFY: Audit confirms 1.3x powerScale for level 60 hero in surplus region.

- [x] Refactor Crafting Service for Quality Generation
  - Files: `server/src/services/craftingService.js`, `server/src/services/inventoryService.js`
  - TEST: `crafting_quality_integration_audit.js` (Merged in Master Audit)
  - IMPLEMENT: Update `completeCrafting` to fetch hero level and regional surplus. Use `QualityResolver` to set the resulting item's quality and power scale.
  - VERIFY: Crafting completion results in an item with "MASTERWORK" quality if criteria are met.

- [x] Update StatService for Quality Scaling
  - Files: `server/src/services/statService.js`
  - TEST: `stat_quality_scaling_audit.js` (Merged in Master Audit)
  - IMPLEMENT: Update `_applyEquipment` to multiply base template stats by the instance's `powerScale`.
  - VERIFY: Hero ATK is higher when using a "MASTERWORK" sword vs a "COMMON" one.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/item_quality_master_audit.js`
  - TEST: Level Hero -> Record Surplus -> Craft Item -> Check Quality -> Equip -> Verify Scaled Stats.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% logic-to-data synchronization.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T12:55:00 - Initial plan for Item Quality Tiers created.
- 2026-02-02T15:20:00 - Migrated DB schema to support item quality and power scaling.
- 2026-02-02T15:30:00 - Implemented QualityResolver logic component.
- 2026-02-02T15:45:00 - Refactored CraftingService and InventoryService to support dynamic quality assignment.
- 2026-02-02T15:55:00 - Updated StatService to apply powerScale multipliers to item stats.
- 2026-02-02T16:10:00 - Verified full Item Quality lifecycle via Master Audit.
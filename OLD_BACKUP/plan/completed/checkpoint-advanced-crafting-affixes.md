# Advanced Crafting: Magical Affixes

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a magical affix system where specific refined materials grant unique traits to crafted equipment.
- User-facing behavior: When crafting items, players can use "Affix Materials" (e.g., Fire Essence, Dragon Scale) to imbue the result with magical properties like +10% Fire Damage, Lifesteal, or bonus Speed. The UI will show potential affixes based on the selected materials.
- Scope (in): `CraftingAffixService` (Orchestrator), `AffixResolver` (Logic), updated `CraftingService` to support optional catalyst materials, and DB updates for `ItemTrait` instances on specific items.
- Scope (out): RNG-based "Enchanting" (this is deterministic crafting based on materials).
- Assumptions: Equipment can hold a limited number of affixes based on rarity.
- Risks: Power creep if affixes are too strong or stackable without limits.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Instance-Based Traits
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `InventoryItem` can have unique traits not present in the base `ItemTemplate`.
  - IMPLEMENT: Add `traits` relation to `InventoryItem` (model `ItemInstanceTrait`). Add `TraitStat` model.
  - VERIFY: `npx prisma migrate dev --name add_instance_traits` success.

- [x] Implement Affix Resolver Component
  - Files: `server/src/logic/crafting/AffixResolver.js` (NEW)
  - TEST: `affix_resolver_audit.js`
  - IMPLEMENT: Pure component that maps `ItemTemplate` (Material) to specific `TraitTemplate` effects.
  - VERIFY: Audit confirms "Fire Essence" resolves to "FLAME_STRIKE" trait.

- [x] Refactor Crafting Service for Catalysts
  - Files: `server/src/services/craftingService.js`, `server/src/services/inventoryService.js`, `server/prisma/schema.prisma` (TaskQueue)
  - TEST: `crafting_affix_integration_audit.js`
  - IMPLEMENT: Update `craftItem` to accept an optional `affixMaterialId`. If provided, use `AffixResolver` to apply the trait to the resulting `InventoryItem`.
  - VERIFY: Crafting a Sword with Fire Essence results in a "Flaming Sword" with the Fire trait.

- [x] Update StatService for Instance Traits
  - Files: `server/src/services/statService.js`
  - TEST: `stat_instance_trait_audit.js`
  - IMPLEMENT: Update `_applyEquipment` to also aggregate stats from traits stored on the `itemInstance` itself, not just the template.
  - VERIFY: A hero's stats increase correctly from a magical affix.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/magical_affixes_master_audit.js`
  - TEST: Gather Material -> Refine -> Craft with Affix -> Check Stats -> Verify Visual Title.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data integrity and stat accuracy.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T18:30:00 - Initial plan for Advanced Crafting: Magical Affixes created.
- 2026-02-02T18:40:00 - Migrated DB schema to support instance-based traits (ItemInstanceTrait).
- 2026-02-02T18:50:00 - Seeded basic traits and implemented AffixResolver component.
- 2026-02-02T19:00:00 - Refactored CraftingService and InventoryService to support affix catalysts.
- 2026-02-02T19:15:00 - Updated StatService to aggregate stats from instance-based magical affixes.
- 2026-02-02T19:30:00 - Verified full magical affix crafting lifecycle via Master Audit.
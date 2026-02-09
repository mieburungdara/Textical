# Economy: Dynamic Shop Inventory

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a system where NPC shops have rotating stock based on regional supply.
- User-facing behavior: NPC shops no longer have infinite stock. Instead, they feature a "Restocking" mechanic where item availability and quantities fluctuate. Regional "Phenomena" or high player trading in a region can influence what items appear in local shops.
- Scope (in): `ShopStock` DB model, `ShopInventoryService` (Thin Orchestrator), `RegionalSupplyResolver` (Logic), and `StockRotationEngine` (Logic).
- Scope (out): Global market price manipulation (handled by PriceIndexService).
- Assumptions: Each NPC has a set of potential items they can sell, but only a subset is active at any time.
- Risks: Performance impact of global restock ticks; player frustration if essential items are constantly out of stock.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Dynamic Shop Stock
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `ShopStock` model exists with `npcId`, `templateId`, `quantity`, and `nextRestock`.
  - IMPLEMENT: Add `ShopStock` model. Update `NPCTemplate`, `RegionTemplate`, and `ItemTemplate` to relate to `ShopStock`.
  - VERIFY: `npx prisma migrate dev --name add_dynamic_shop_stock` success.

- [x] Implement Regional Supply Resolver
  - Files: `server/src/logic/economy/RegionalSupplyResolver.js` (NEW)
  - TEST: `regional_supply_audit.js`
  - IMPLEMENT: Pure component to determine "Stock Multipliers" based on region danger level and nearby resource nodes.
  - VERIFY: Audit confirms higher supply of "Iron Ore" in regions with many mining nodes.

- [x] Implement Stock Rotation Engine
  - Files: `server/src/logic/economy/StockRotationEngine.js` (NEW)
  - TEST: `stock_rotation_audit.js`
  - IMPLEMENT: Logic to pick $N$ items from an NPC's potential pool and set their current quantities based on `RegionalSupplyResolver`.
  - VERIFY: Audit confirms stock rotates correctly when triggered.

- [x] Implement Shop Inventory Service
  - Files: `server/src/services/economy/ShopInventoryService.js` (NEW)
  - TEST: `shop_inventory_service_audit.js`
  - IMPLEMENT: Thin orchestrator to `restockAllShops()` and `getNPCCurrentStock(npcId)`.
  - VERIFY: Service correctly updates database records for NPC stocks.

- [x] Refactor NPC Trade Handler for Limited Stock
  - Files: `server/src/services/npc/TradeHandler.js`
  - TEST: `trade_stock_limit_audit.js`
  - IMPLEMENT: Update `handlePurchase` to check `ShopStock.quantity`. Deduct on purchase. Throw error if 0.
  - VERIFY: User cannot buy more items than available in the NPC's stock.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/dynamic_shop_master_audit.js`
  - TEST: Initialize Shop -> Buy Item -> Verify Stock Drop -> Trigger Restock -> Verify Rotation.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% relational integrity and stock behavior.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T19:45:00 - Initial plan for Dynamic Shop Inventory created.
- 2026-02-02T20:00:00 - Migrated DB schema to include ShopStock model and relations.
- 2026-02-02T20:10:00 - Implemented RegionalSupplyResolver for calculating stock multipliers.
- 2026-02-02T20:20:00 - Implemented StockRotationEngine for automated NPC inventory rotation.
- 2026-02-02T20:30:00 - Created ShopInventoryService and verified global restocking lifecycle.
- 2026-02-02T20:45:00 - Refactored TradeHandler to enforce localized limited stock during purchase.
- 2026-02-02T21:00:00 - Verified complete dynamic shop lifecycle via Master Audit.
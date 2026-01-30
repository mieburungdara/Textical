# Albion-Style Localized Market System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a Player-Driven, Localized Market system with Sell/Buy orders similar to Albion Online.
- User-facing behavior: Players can only see and trade in the market of their current Town. They can create Sell Orders (listing items at a set price) or Buy Orders (requesting items at a set price). Instant buy/sell options will match the best available orders in the local market.
- Scope (in): DB migration for `MarketOrder`, `MarketService` refactor, Order Matching logic, and Localized Discovery.
- Scope (out): Transport/Caravan mechanics (for now, players move items manually).
- Assumptions: Markets are only accessible in regions with `visualType: "TOWN"`.
- Risks: Partial order fulfillment logic requires careful transactional handling to prevent gold/item duplication.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Localized Orders
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `MarketOrder` model exists with `type` (BUY/SELL), `regionId`, and quantity tracking.
  - IMPLEMENT: Replace `MarketListing` with `MarketOrder`. Add relations to `User`, `ItemTemplate`, and `RegionTemplate`. Support partial fills via `remainingQuantity`.
  - VERIFY: `npx prisma migrate dev` success and client generation.

- [x] Implement Market Order Manager (Thin Component)
  - Files: `server/src/services/market/MarketOrderManager.js` (NEW)
  - TEST: `market_order_logic_audit.js`
  - IMPLEMENT: Create logic for `createSellOrder` (locks item) and `createBuyOrder` (escrows gold using `TransactionManager`).
  - VERIFY: Audit confirms item/gold locking works correctly.

- [x] Implement Order Matching Engine (Core Component)
  - Files: `server/src/services/market/OrderMatcher.js` (NEW)
  - TEST: `market_matching_audit.js`
  - IMPLEMENT: Logic to find the best Sell Order (lowest price) or best Buy Order (highest price) in a specific region. Handle partial fulfillment.
  - VERIFY: Placing a Buy Order that matches an existing Sell Order triggers an immediate transaction.

- [x] Refactor MarketService to Orchestrator
  - Files: `server/src/services/marketService.js`
  - TEST: `market_localized_audit.js`
  - IMPLEMENT: Update service to delegate to `MarketOrderManager` and `OrderMatcher`. Ensure all queries are filtered by `regionId`.
  - VERIFY: Players in Town A cannot see orders from Town B.

- [x] Final Economic Integrity Audit
  - Files: `server/src/scripts/albion_market_master_audit.js`
  - TEST: Full lifecycle: User A lists Sword in Town 1 -> User B in Town 2 sees nothing -> User B travels to Town 1 -> User B places Buy Order -> Partial fill verification.
  - IMPLEMENT: Create and run the master market audit script.
  - VERIFY: 100% data integrity and no gold "leaks".

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T10:00:00 - Initial plan for Albion-Style Localized Market created.
- 2026-01-31T10:10:00 - Migrated DB schema to support Localized MarketOrders (Buy/Sell) and partial fills.
- 2026-01-31T10:20:00 - Implemented MarketOrderManager for secure order creation and gold escrow.
- 2026-01-31T10:30:00 - Implemented OrderMatcher engine for Albion-style price matching.
- 2026-01-31T10:40:00 - Refactored MarketService into a localized thin orchestrator.
- 2026-01-31T10:50:00 - Verified full market lifecycle (Cross-town localization ➡️ Matching ➡️ Tax) via Master Audit.
- 2026-01-31T10:55:00 - System finalized and high-fidelity DevLog sent to Telegram.

# Tiered Multi-Currency System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a 5-tier currency system (Copper, Silver, Gold, Platinum, Diamond) with a 1000:1 conversion rate between tiers.
- User-facing behavior: Players will see their balance split into five denominations. 1000 units of a lower tier automatically promote to 1 unit of the next tier. Transactions can be paid using any combination of tiers.
- Scope (in): `User` schema updates (5 currency fields), `CurrencyResolver` (Logic), `TransactionManager` refactor (tiered math), and automatic promotion/demotion logic.
- Scope (out): Direct trading of physical "Coin" items (this is digital wallet balance).
- Assumptions: Storing denominations separately in the DB for transparency, with an internal "Total Copper" representation for math.
- Risks: Complex subtraction logic when a higher tier needs to be broken down into lower tiers.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Tiered Currencies
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `User` model has `copper`, `silver`, `gold`, `platinum`, and `diamond` fields.
  - IMPLEMENT: Add 5 tiered currency fields to `User`. Update `TransactionLedger` to use BigInt for base copper units.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Currency Resolver component
  - Files: `server/src/logic/economy/CurrencyResolver.js` (NEW)
  - TEST: `currency_resolver_audit.js`
  - IMPLEMENT: Pure component to convert "Total Copper" into 5 tiers and vice-versa.
  - VERIFY: Audit confirms 1,001,001 Copper converts to 1 Gold, 1 Silver, 1 Copper.

- [x] Refactor TransactionManager for Tiered Support
  - Files: `server/src/services/economy/TransactionManager.js`
  - TEST: `tiered_transaction_audit.js`
  - IMPLEMENT: Update `addGold` and `removeGold` (renaming to `addCurrency` / `removeCurrency`) to handle automatic carry and borrowing across tiers.
  - VERIFY: Adding 500 Copper to a balance of 600 Copper results in 1 Silver and 100 Copper.

- [x] Update Economic Services for Multi-Currency
  - Files: `server/src/services/marketService.js`, `server/src/services/npc/TradeHandler.js`, `server/src/services/economy/MarketFeeComponent.js`, `server/src/services/market/MarketOrderManager.js`, `server/src/services/market/MarketListingService.js`, `server/src/services/market/OrderMatcher.js`
  - TEST: `multi_currency_market_audit.js`
  - IMPLEMENT: Update all price-related logic to treat values as base copper units. Refactored all services to use TransactionManager's new tiered methods.
  - VERIFY: Buying an item for 1500 units correctly deducts 1 Silver and 500 Copper.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/tiered_currency_master_audit.js`
  - TEST: Add 1 Diamond -> Perform 1 Copper purchase -> Verify higher tier breaks down into 999 Platinum, Gold, Silver, and Copper.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% mathematical and relational integrity.

## Progress log (append-only)
- 2026-02-03T10:00:00 - Initial plan for Tiered Multi-Currency System created.
- 2026-02-03T10:10:00 - Migrated DB schema to support tiered currencies and BigInt copper-based ledger tracking.
- 2026-02-03T10:20:00 - Implemented CurrencyResolver logic for 1000:1 tiered conversions.
- 2026-02-03T10:30:00 - Refactored TransactionManager to support tiered math (Carry/Borrow) and unified base copper tracking.
- 2026-02-03T10:45:00 - Refactored all economic services (Market, NPC, Listing) to utilize the tiered currency system.
- 2026-02-03T11:00:00 - Verified full multi-currency lifecycle via Master Audit (Diamond-to-Copper breakdown).

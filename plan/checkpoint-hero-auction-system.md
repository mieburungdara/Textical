# Advanced Hero Auction System

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a localized marketplace for trading Heroes, following the Albion stock-market model.
- User-facing behavior: Players can list their Heroes for sale (locking them from combat/tasks) in their current Town. Buyers can search for heroes by class, level, and rarity. Includes Buy Orders for specific hero types.
- Scope (in): `HeroOrder` DB model, `HeroAuctionService` (Orchestrator), `HeroOrderManager` (Logic), and matching logic.
- Scope (out): Hero "breeding" or "renting" (sticking to pure ownership transfer).
- Assumptions: A listed hero cannot be used in a formation or sent on tasks.
- Risks: Complex locking logic to prevent a hero from being sold while currently in a battle.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Hero Orders
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `HeroOrder` model exists with `type` (BUY/SELL), `regionId`, `classId`, and `minLevel`.
  - IMPLEMENT: Add `HeroOrder` model. Link `Hero` to `HeroOrder`. Remove legacy unique constraints if necessary.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Hero Order Manager (Thin Component)
  - Files: `server/src/services/market/HeroOrderManager.js` (NEW)
  - TEST: `hero_order_locking_audit.js`
  - IMPLEMENT: Logic for `listHero` (locks hero status) and `cancelHeroOrder` (unlocks). Create `createHeroBuyOrder` (escrows gold).
  - VERIFY: Audit confirms hero is removed from formations upon listing and gold is escrowed for buy orders.

- [x] Implement Hero Auction Service
  - Files: `server/src/services/heroAuctionService.js` (NEW)
  - TEST: `hero_auction_transaction_audit.js`
  - IMPLEMENT: Orchestrator inheriting from `BaseService`. Handles `purchaseHero` (transfer ownership, payout seller minus tax).
  - VERIFY: Purchasing a hero correctly transfers the instance, updates gold balances, and records in ledger.

- [x] Refactor Hero Status Logic
  - Files: `server/src/services/formationService.js`, `server/src/services/heroService.js`
  - TEST: `hero_market_protection_audit.js`
  - IMPLEMENT: Add checks to ensure heroes with status `IN_MARKET` are excluded from all combat and task operations.
  - VERIFY: Attempting to use a listed hero throws a "Hero is currently in the market" error.

- [x] Final Integrity Audit
  - Files: `server/src/scripts/hero_auction_master_audit.js`
  - TEST: Full lifecycle: List Hero in Town A -> Verify invisible in Town B -> Buy in Town A -> Verify ownership transfer and gold accuracy.
  - IMPLEMENT: Create and run the master hero auction audit script.
  - VERIFY: 100% data integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T12:30:00 - Initial plan for Advanced Hero Auction System created.
- 2026-01-31T12:40:00 - Migrated DB schema to include HeroOrder model and relations.
- 2026-01-31T12:50:00 - Implemented HeroOrderManager for listing and buy order creation.
- 2026-01-31T13:00:00 - Created HeroAuctionService orchestrator for ownership transfers and payouts.
- 2026-01-31T13:10:00 - Refactored FormationService to protect listed heroes from combat use.
- 2026-01-31T13:20:00 - Verified full hero market lifecycle (Locking ➡️ Localized Purchase ➡️ Payout) via Master Audit.
- 2026-01-31T13:25:00 - System finalized and high-fidelity DevLog sent to Telegram.
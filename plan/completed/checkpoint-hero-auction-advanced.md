# Advanced Hero Auction System (Mastery Trading)

## Feature summary (high-level, 5–10 lines)
- Goal: Expand the Hero Auction system with "Mastery Trading" and Market Analytics.
- User-facing behavior: High-level pahlawan can "Extract" their Class Level into a **Mastery Tome** (resetting their class level to 1). This Tome can be sold on the localized market, allowing other players to instantly boost their hero's professional expertise. Players can also view "Recent Sale Prices" for heroes of specific classes to gauge market value.
- Scope (in): `MasteryExtractionService` (NEW), `MasteryTome` Item Templates, Localized Price History tracking, and refined search filters.
- Scope (out): Direct Hero-to-Hero XP transfer (must use Tome as an intermediary).
- Assumptions: Extraction resets the class level but preserves Unit Level (Physical Strength).
- Risks: Devaluing the leveling process if Tomes are too cheap/abundant.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Mastery Tomes & Analytics
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `ItemTemplate` can store mastery metadata. Verify `HeroSaleHistory` model exists.
  - IMPLEMENT: Add `HeroSaleHistory` (classId, unitLevel, price, regionId). Add fields to `ItemTemplate` for `masteryClassId` and `masteryXpAmount`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Mastery Extraction Logic
  - Files: `server/src/services/hero/MasteryExtractionService.js` (NEW)
  - TEST: `mastery_extraction_audit.js`
  - IMPLEMENT: Logic to verify hero level -> Deduct class level -> Reset class XP -> Award **Mastery Tome** item.
  - VERIFY: Audit confirms hero resets to Class Level 1 and receives an item containing their former XP.

- [x] Implement Hero Market Analytics Component
  - Files: `server/src/logic/market/MarketAnalytics.js` (NEW)
  - TEST: `market_analytics_audit.js`
  - IMPLEMENT: Pure component to track and calculate "Average Price" and "Recent Sales" for heroes based on Class and Tier.
  - VERIFY: Audit confirms correct average price calculation from 5 simulated sales.

- [x] Refactor HeroAuctionService for History Logging
  - Files: `server/src/services/heroAuctionService.js`
  - TEST: `hero_sale_logging_audit.js`
  - IMPLEMENT: Update `purchaseHero` to record a `HeroSaleHistory` entry upon successful transaction.
  - VERIFY: Every hero sale creates a relational history record for analytics.

- [x] Final Advanced Auction Audit
  - Files: `server/src/scripts/hero_auction_advanced_master_audit.js`
  - TEST: Extract Mastery -> Sell Tome -> Buy Tome -> Use Tome on different Hero -> Check Price History.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data integrity and professional loop.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T00:45:00 - Initial plan for Advanced Hero Auction System (Mastery Trading) created.
- 2026-01-31T00:55:00 - Migrated DB schema to include HeroSaleHistory and Mastery Tome metadata.
- 2026-01-31T01:05:00 - Seeded 77 Mastery Tome templates and implemented MasteryExtractionService.
- 2026-01-31T01:15:00 - Created MarketAnalytics component and refactored HeroAuctionService for history logging.
- 2026-01-31T01:25:00 - Solved 'Transaction within Transaction' bug in InventoryService.addItem.
- 2026-01-31T01:30:00 - Verified full Mastery Trading lifecycle (Extraction ➡️ Sale ➡️ Analytics) via Master Audit.
- 2026-01-31T01:35:00 - System finalized and high-fidelity DevLog sent to Telegram.
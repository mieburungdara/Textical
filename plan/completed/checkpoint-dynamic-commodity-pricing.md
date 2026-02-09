# Economy: Dynamic Commodity Pricing

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a system where regional raw material prices fluctuate based on extraction volume.
- User-facing behavior: Players will see commodity prices (ores, wood, etc.) change in regional markets. High extraction volume in a region increases supply and lowers prices locally. Scarcity (low extraction) increases prices. This encourages trade between regions.
- Scope (in): `RegionalExtractionStats` DB model, `ExtractionTrackerService` (Orchestrator), `CommodityPriceResolver` (Logic), and integration with `MarketListingService`.
- Scope (out): Global inflation; focus is on regional supply/demand.
- Assumptions: Extraction events (mining, lumbering) can be hooked to update stats.
- Risks: Database write pressure if every single extraction is a separate write (mitigated by batching/increment logic).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Regional Extraction Stats
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `RegionalExtractionStats` model exists with `regionId`, `templateId`, and `volume24h`.
  - IMPLEMENT: Add `RegionalExtractionStats` model. Add relations to `RegionTemplate` and `ItemTemplate`.
  - VERIFY: `npx prisma migrate dev --name add_extraction_stats` success.

- [x] Implement Extraction Tracker Service
  - Files: `server/src/services/economy/ExtractionTrackerService.js` (NEW)
  - TEST: `extraction_tracker_audit.js`
  - IMPLEMENT: Thin orchestrator to `recordExtraction(regionId, templateId, amount)`. Updates/Upserts stats.
  - VERIFY: Audit confirms extraction volume increments in the database.

- [x] Implement Commodity Price Resolver
  - Files: `server/src/logic/economy/CommodityPriceResolver.js` (NEW)
  - TEST: `commodity_price_logic_audit.js`
  - IMPLEMENT: Pure component to calculate regional price multipliers (e.g., 0.8x for high supply, 1.5x for scarcity).
  - VERIFY: Audit confirms 50% price increase when extraction volume is 0.

- [x] Refactor Market Listing Service for Dynamic Base Values
  - Files: `server/src/services/market/MarketListingService.js`
  - TEST: `dynamic_listing_price_audit.js`
  - IMPLEMENT: Update listing fee calculations to use the dynamic regional base value instead of the static template `baseValue`.
  - VERIFY: Listing fees are higher in regions with commodity shortages.

- [x] Integrate Extraction Hooks in Gathering Services
  - Files: `server/src/services/GatheringController.js`, `server/src/services/gatheringService.js`
  - TEST: `gathering_extraction_sync_audit.js`
  - IMPLEMENT: Call `ExtractionTrackerService.recordExtraction` upon successful gather.
  - VERIFY: Mining iron ore correctly updates regional iron stats.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/dynamic_commodity_master_audit.js`
  - TEST: Gather Item -> Check Price Change -> Create Listing -> Verify Dynamic Fee.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data and economic flow integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T23:00:00 - Initial plan for Dynamic Commodity Pricing created.
- 2026-02-02T23:10:00 - Migrated DB schema to include RegionalExtractionStats and relations.
- 2026-02-02T23:20:00 - Implemented ExtractionTrackerService and verified volume tracking.
- 2026-02-02T23:30:00 - Implemented CommodityPriceResolver logic for regional scaling.
- 2026-02-02T23:45:00 - Refactored MarketListingService to use dynamic base values for fees. Verified via fee audit.
- 2026-02-03T00:00:00 - Integrated extraction hooks into GatheringService. Verified via sync audit.
- 2026-02-03T00:15:00 - Verified full dynamic commodity lifecycle via Master Audit.

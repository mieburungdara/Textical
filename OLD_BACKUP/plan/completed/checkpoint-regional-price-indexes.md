# Regional Price Indexes

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a tracking and visualization system for regional item price trends.
- User-facing behavior: Players/Admins can view historical price charts for any item in specific regional markets. This helps identify high-demand regions and profitable trade routes (Albion-style "buy low, sell high" analytics).
- Scope (in): `ItemSaleHistory` DB model, `PriceIndexService` (Orchestrator), API for historical data, and a Chart.js-based frontend visualizer in the Admin Panel.
- Scope (out): Predictive price AI or automated trade bots.
- Assumptions: Prices are tracked per unit. Data is aggregated by sale event.
- Risks: Database size growth due to large number of sale history records (can be mitigated by aggregation/archiving later).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Item Sale History
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `ItemSaleHistory` model exists with `templateId`, `pricePerUnit`, `quantity`, and `regionId`.
  - IMPLEMENT: Add `ItemSaleHistory` model. Add relation to `ItemTemplate` and `RegionTemplate`.
  - VERIFY: `npx prisma migrate dev --name add_item_sale_history` success.

- [x] Refactor OrderMatcher for Sale Logging
  - Files: `server/src/services/market/OrderMatcher.js`
  - TEST: `market_sale_logging_audit.js` (Manual verification during next audit)
  - IMPLEMENT: Inject `ItemSaleHistory.create` logic inside `matchBuyOrder` and `matchSellOrder` loops.
  - VERIFY: Every fulfilled market transaction generates a relational history record.

- [x] Implement Price Index Service
  - Files: `server/src/services/market/PriceIndexService.js` (NEW)
  - TEST: `price_index_logic_audit.js`
  - IMPLEMENT: Method `getPriceHistory(templateId, regionId)` that returns a chronological array of price points.
  - VERIFY: Audit confirms correct retrieval of 5 simulated sales for a specific item.

- [x] Expose Price Index API Endpoint
  - Files: `server/src/controllers/MarketController.js`, `server/src/routes/api.js`
  - TEST: `price_index_api_audit.js`
  - IMPLEMENT: GET `/api/market/price-index/:templateId` returning historical data for frontend charts.
  - VERIFY: Curl/fetch returns the JSON price array.

- [x] Build Frontend Price Visualizer
  - Files: `server/public/visualizer.js`, `server/public/index.html`
  - TEST: Manual: Chart renders in browser when an item is selected.
  - IMPLEMENT: 
    - Add "Economy Analytics" tab to Admin Panel.
    - Integrate Chart.js via CDN.
    - Implement line chart renderer for price vs time.
  - VERIFY: Browser shows a beautiful line chart of price trends.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/regional_price_index_master_audit.js`
  - TEST: Create Buy Order -> Create Sell Order -> Match -> Verify History Entry.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data and visual integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T16:45:00 - Initial plan for Regional Price Indexes created.
- 2026-02-02T17:00:00 - Migrated DB schema to include ItemSaleHistory and relations.
- 2026-02-02T17:15:00 - Refactored OrderMatcher to log fulfilled transactions into ItemSaleHistory.
- 2026-02-02T17:30:00 - Created PriceIndexService and verified logic via audit script.
- 2026-02-02T17:45:00 - Exposed /api/market/price-index endpoint and verified via API audit.
- 2026-02-02T18:00:00 - Integrated Chart.js and built frontend Economy dashboard.
- 2026-02-02T18:15:00 - Verified full regional price index lifecycle via Master Audit.

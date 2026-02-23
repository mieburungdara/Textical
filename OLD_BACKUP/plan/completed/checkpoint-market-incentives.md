# Market Incentives: High-Volume Trading

## Feature summary (high-level, 5–10 lines)
- Goal: Reduce market friction by adjusting fees and taxes to encourage higher trading volume.
- User-facing behavior: Players will notice significantly lower upfront costs for listing items. Additionally, selling items in bulk or frequently may grant temporary "Trader Buffs" that further reduce sales tax.
- Scope (in): `MarketFeeComponent` refactor, `TraderMasteryResolver` (Logic), and integration with `MarketListingService` and `OrderMatcher`.
- Scope (out): Implementing a full "Trading" professional skill (focus is on economic incentives).
- Assumptions: Lowering upfront fees will directly increase market liquidity as seen in the Oracle simulation.
- Risks: Reducing fees too much might remove a necessary Silver sink; mitigated by keeping sales tax as the primary drain.

## Checklist (TDD-first, actionable)

- [x] Implement Trader Mastery Resolver
  - Files: `server/src/logic/economy/TraderMasteryResolver.js` (NEW)
  - TEST: `trader_mastery_audit.js`
  - IMPLEMENT: Pure component to calculate tax discounts based on a user's recent trade volume (e.g., >10 sales = 10% tax reduction).
  - VERIFY: Audit confirms lower tax rates for users with high successful sales counts.

- [x] Refactor Market Fee Component for Incentives
  - Files: `server/src/services/economy/MarketFeeComponent.js`
  - TEST: `market_incentive_fee_audit.js`
  - IMPLEMENT: Lower `BASE_LISTING_FEE_RATE` from 5% to 1%. Integrate `TraderMasteryResolver` into `calculateTotalSalesTax`.
  - VERIFY: Audit confirms listing fees are now much cheaper (1%), and sales tax is dynamic.

- [x] Update Oracle Bots for Higher Trading Frequency
  - Files: `server/sim/OracleBrain.js`, `server/sim/OracleRunner.js`
  - TEST: `oracle_incentive_test.js` (Integrated in EWO)
  - IMPLEMENT: Adjust bot logic to list items at 50% inventory capacity. Fixed dynamic resource selection in runner.
  - VERIFY: Oracle simulation shows a significant increase in "Active Listings" (from 0 to 21+).

- [x] Final Architectural Integrity Audit
  - Files: `server/sim/run.js` (Oracle)
  - TEST: Run full Oracle simulation (100 hours).
  - IMPLEMENT: Compare "Market Activity" metrics.
  - VERIFY: Market Activity > 0 recorded (21 active orders). Economic flow confirmed.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T22:15:00 - Initial plan for Market Incentives created.
- 2026-02-03T22:25:00 - Updated DB schema to track seller volume. Implemented TraderMasteryResolver logic.
- 2026-02-03T22:40:00 - Refactored MarketFeeComponent and OrderMatcher to reward high-volume trading.
- 2026-02-03T23:00:00 - Refactored Oracle Bots and Runner. Verified market activity increase via simulation.
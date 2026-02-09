# Economy: Dynamic Taxation

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a system where regional market tax rates fluctuate based on faction war state and infrastructure.
- User-facing behavior: Trading in a region at war will incur higher "War Taxes," while regions with advanced guild infrastructure (e.g., Library/Market upgrades) will have lower tax rates.
- Scope (in): `RegionTemplate` DB updates, `TaxRateResolver` (Logic), `TaxationService` (Orchestrator), and refactoring `MarketFeeComponent`.
- Scope (out): Direct player-voted tax rates (fully automated for now).
- Assumptions: War state is determined by `FactionRelation`. Infrastructure is based on `GuildFacility`.
- Risks: High taxes might stifle regional trade and drive players to neutral zones.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Regional Taxation
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `RegionTemplate` has `regionalTaxRate` (Float).
  - IMPLEMENT: Add `regionalTaxRate` field to `RegionTemplate`.
  - VERIFY: `npx prisma migrate dev --name add_regional_taxation` success.

- [x] Implement Tax Rate Resolver
  - Files: `server/src/logic/economy/TaxRateResolver.js` (NEW)
  - TEST: `tax_rate_resolver_audit.js`
  - IMPLEMENT: Pure component to calculate base tax + war penalty + infrastructure bonus.
  - VERIFY: Audit confirms 15% tax during war and 8% with high infrastructure.

- [x] Implement Taxation Service
  - Files: `server/src/services/economy/TaxationService.js` (NEW)
  - TEST: `taxation_service_audit.js`
  - IMPLEMENT: Orchestrator to update `regionalTaxRate` across all regions based on current world state.
  - VERIFY: Database records reflect updated tax rates after service execution.

- [x] Refactor Market Fee Logic
  - Files: `server/src/services/economy/MarketFeeComponent.js`, `server/src/services/market/OrderMatcher.js`
  - TEST: `market_dynamic_tax_audit.js`
  - IMPLEMENT: Update `MarketFeeComponent` to accept a dynamic regional rate from the DB.
  - VERIFY: Net profit for a seller in a "War Region" is lower than in a "Peace Region."

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/dynamic_taxation_master_audit.js`
  - TEST: Set War State -> Run Taxation -> Match Market Order -> Verify Correct Gold Deductions.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data integrity and economic logic.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T23:45:00 - Initial plan for Economy: Dynamic Taxation created.
- 2026-02-02T23:55:00 - Migrated DB schema to include regionalTaxRate in RegionTemplate.
- 2026-02-03T00:05:00 - Implemented TaxRateResolver logic with precision handling.
- 2026-02-03T00:15:00 - Created TaxationService orchestrator and verified global updates.
- 2026-02-03T00:25:00 - Refactored MarketFeeComponent and OrderMatcher to support dynamic regional tax rates. Verified via regional profit comparison.
- 2026-02-03T00:35:00 - Verified full dynamic taxation lifecycle via Master Audit.
# Simplified Dual-Currency System (Silver & Gold)

## Feature summary (high-level, 5–10 lines)
- Goal: Simplify the economy from 5 tiers to 2 (Silver and Gold) with a 1,000,000:1 conversion rate.
- User-facing behavior: Players will see their balance in Silver and Gold only. 1,000,000 Silver automatically promotes to 1 Gold.
- Scope (in): `User` and `TransactionLedger` schema updates, `CurrencyResolver` refactor, `TransactionManager` refactor.
- Scope (out): External pricing adjustments (prices remain in base units, now called Silver).
- Assumptions: Previous "Copper" base units are now called "Silver". 
- Risks: Large conversion rate (1M) might make Gold extremely rare or visually empty for new players.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Silver & Gold
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `User` model only has `silver` and `gold` fields. Verify `TransactionLedger` uses `silverDelta` and `silverBalance`.
  - IMPLEMENT: Remove copper, platinum, diamond. Keep gold and silver. Rename ledger fields to silver-based.
  - VERIFY: `npx prisma migrate dev --name simplify_to_dual_currency` success.

- [x] Refactor Currency Resolver for Dual-Tier
  - Files: `server/src/logic/economy/CurrencyResolver.js`
  - TEST: `currency_resolver_dual_audit.js`
  - IMPLEMENT: Update `resolveTiers` and `getTotalSilver` to handle 1,000,000:1 ratio.
  - VERIFY: Audit confirms 1,500,000 Silver converts to 1 Gold and 500,000 Silver.

- [x] Refactor TransactionManager for Dual-Tier Support
  - Files: `server/src/services/economy/TransactionManager.js`
  - TEST: `dual_currency_transaction_audit.js`
  - IMPLEMENT: Update `addCurrency` and `removeCurrency` to use the new 2-tier logic and silver-based BigInt ledger.
  - VERIFY: Adding 2,000,000 Silver results in 2 Gold and 0 Silver.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/dual_currency_master_audit.js`
  - TEST: Add 1 Gold -> Purchase something for 100 Silver -> Verify Gold breaks down into 999,900 Silver.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% mathematical and relational integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T11:15:00 - Initial plan for Simplified Dual-Currency System created.
- 2026-02-03T11:25:00 - Migrated DB schema to dual-tier (Silver/Gold) and renamed ledger fields.
- 2026-02-03T11:35:00 - Refactored CurrencyResolver for 1,000,000:1 Silver-to-Gold logic.
- 2026-02-03T11:45:00 - Refactored TransactionManager to handle simplified tiered math.
- 2026-02-03T11:55:00 - Verified full dual-currency lifecycle via Master Audit (Gold breakdown PASS).
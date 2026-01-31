# Guild Territory Conquest

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a guild-based territory control system where guilds can capture regions and benefit from them.
- User-facing behavior: Guilds can fight for control of specific regions. Once captured, the guild owns the territory, can set local tax rates for market transactions and gathering activities, and receives tax revenue into the guild treasury.
- Scope (in): `Territory` DB model, Conquest/Siege mechanics, Regional Taxation logic, Guild Treasury integration, and Upkeep system.
- Scope (out): Visual regional flags or guild building construction (focus on control and economy).
- Assumptions: Only certain regions are "Conquerable". Guilds must pay daily upkeep to maintain control.
- Risks: Large guilds dominating the map (mitigated by increasing upkeep costs per territory).

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Territory & Guild Treasury
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `Territory` model exists linked to `RegionTemplate` and `Guild`. Verify `Guild` has a `treasury` field and `taxRate` settings.
  - IMPLEMENT: Add `Territory` model. Update `Guild` model with `treasury`, `marketTaxRate`, and `gatheringTaxRate`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Territory Conquest Service
  - Files: `server/src/services/territoryConquestService.js` (NEW)
  - TEST: `territory_conquest_audit.js`
  - IMPLEMENT: Logic for `declareWar`, `processSiegeOutcome` (transfer ownership), and `relinquishTerritory`.
  - VERIFY: Audit confirms ownership transfer from Guild A to Guild B after a successful siege.

- [x] Implement Regional Taxation Logic
  - Files: `server/src/services/economy/MarketFeeComponent.js`, `server/src/services/gatheringService.js`
  - TEST: `regional_taxation_audit.js`
  - IMPLEMENT: Refactor fee calculations to check for territory ownership. Apply guild-defined taxes on top of base taxes. Redirect guild tax revenue to the guild treasury.
  - VERIFY: Selling an item in a guild-owned town sends a percentage of the sale to the owning guild's treasury.

- [x] Implement Guild Treasury & Upkeep System
  - Files: `server/src/services/guild/GuildTreasuryService.js` (NEW)
  - TEST: `guild_upkeep_audit.js`
  - IMPLEMENT: Logic for guilds to withdraw/deposit gold. Automated "Daily Upkeep" task that deducts gold from the treasury based on owned territories.
  - VERIFY: Upkeep correctly deducts gold; if treasury is empty, territory is relinquished.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/guild_territory_master_audit.js`
  - TEST: Full lifecycle: Capture Town -> Set Taxes -> User Trades -> Guild Earns Gold -> Upkeep Deducted.
  - IMPLEMENT: Create and run the master conquest audit script.
  - VERIFY: 100% relational integrity and economic accuracy.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T16:00:00 - Initial plan for Guild Territory Conquest created.
- 2026-01-31T16:10:00 - Migrated DB schema to support Territory ownership and Guild treasury/taxes.
- 2026-01-31T16:20:00 - Implemented TerritoryConquestService for managing regional ownership.
- 2026-01-31T16:30:00 - Integrated Regional Taxation across Market and Gathering services.
- 2026-01-31T16:40:00 - Implemented GuildTreasuryService and automated Daily Upkeep system.
- 2026-01-31T16:50:00 - Verified full conquest lifecycle (Capture ➡️ Tax ➡️ Upkeep ➡️ Relinquish) via Master Audit.
- 2026-01-31T16:55:00 - System finalized and high-fidelity DevLog sent to Telegram.
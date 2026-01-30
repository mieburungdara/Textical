# Alchemy Stat Persistence Fix

## Feature summary (high-level, 5–10 lines)
- Goal: Revert permanent stat increases from elixirs and convert them into temporary buffs.
- User-facing behavior: Consuming high-tier elixirs like the "Elixir of Eternal Might" will now grant a powerful temporary buff (e.g., +50 STR for 60 minutes) instead of a permanent +1 STR increase.
- Scope (in): `ConsumableService.js` refactor, `seed_elixirs.js` update (descriptions), and metadata correction in `_getBuffData`.
- Scope (out): New items or recipes (only modifying existing elixir behavior).
- Assumptions: All elixirs should follow the `HeroBuff` lifecycle.
- Risks: Ensuring existing "permanent" stats in the DB are not inadvertently wiped (this fix affects future consumption).

## Checklist (TDD-first, actionable)

- [x] Refactor Consumable Service to Remove Permanent Logic
  - Files: `server/src/services/consumableService.js`
  - TEST: Verify `consumeItem` no longer calls `tx.hero.update` for stats.
  - IMPLEMENT: Remove the `if (buffData.isPermanent)` block and ensure all items path to `tx.heroBuff.create`.
  - VERIFY: Code inspection of `consumableService.js`.

- [x] Update Elixir Metadata to Temporary Buffs
  - Files: `server/src/services/consumableService.js`
  - TEST: `alchemy_temporary_audit.js`
  - IMPLEMENT: Update `_getBuffData` for IDs 4421-4425 to use `durationSeconds: 3600` and `statValue: 50` (or similar high value) instead of `isPermanent: true`.
  - VERIFY: Log confirmation that mythical elixirs now have durations.

- [x] Update Elixir Item Descriptions
  - Files: `server/src/scripts/seed_elixirs.js`
  - TEST: Verify DB entries after seeding.
  - IMPLEMENT: Change "permanently" to "temporarily" in descriptions for IDs 4421-4425.
  - VERIFY: Run `node server/src/scripts/seed_elixirs.js` and check ItemTemplate table.

- [x] Final Verification Audit
  - Files: `server/src/scripts/alchemy_temporary_audit.js`
  - TEST: Consume "Elixir of Eternal Might" -> Verify +50 STR buff created -> Verify duration is 60m -> Verify base STR remains 10.
  - IMPLEMENT: Create and run the audit script.
  - VERIFY: Audit passes with statistical confirmation of temporary application.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-30T17:40:00 - Initial plan for Alchemy Stat Persistence Fix created.
- 2026-01-30T17:50:00 - Removed permanent stat logic from ConsumableService.
- 2026-01-30T17:55:00 - Updated elixir metadata and re-seeded items with temporary buff descriptions.
- 2026-01-30T18:05:00 - Verified temporary buff application and base-stat isolation via audit.
- 2026-01-30T18:10:00 - System finalized and high-fidelity DevLog sent to Telegram.

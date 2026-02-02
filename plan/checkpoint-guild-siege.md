# Guild Siege & Territory Conquest

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a multi-stage Guild-vs-Guild (GvG) system for seizing regional territories.
- User-facing behavior: Guilds can declare a "Siege" on a territory. Attackers must reduce the territory's "Fortification" points through successful battles. If fortification reaches zero, the territory is conquered. Owners can "Repair" fortifications using guild treasury.
- Scope (in): `Territory` schema updates (Fortification, Siege status), `Siege` and `SiegeLog` relations, `SiegeService` (Orchestrator), `SiegeFortificationResolver` (Logic), and integration with `BattleRewardProcessor`.
- Scope (out): Real-time RTS-style siege battles (focus is on simulated tactical engagements).
- Assumptions: Sieges have a "Window" or duration to prevent instant ninja-capping.
- Risks: Strong guilds monopolizing all regions; mitigated by increasing "Maintenance Silver" for each additional territory owned.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Sieges & Fortification
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `Territory` has `fortification`, `maxFortification`, and `siegeStatus`.
  - IMPLEMENT: Update `Territory` model. Refactor `Siege` and `SiegeLog` to be strictly relational.
  - VERIFY: `npx prisma db push` success.

- [x] Implement Siege Orchestrator Service
  - Files: `server/src/services/guild/SiegeService.js` (NEW)
  - TEST: `siege_declaration_audit.js`
  - IMPLEMENT: Thin orchestrator to `declareSiege(attackerGuildId, regionId)`. Checks requirements (Silver cost).
  - VERIFY: Audit confirms siege record creation and currency deduction.

- [x] Implement Fortification Logic Resolver
  - Files: `server/src/logic/guild/SiegeFortificationResolver.js` (NEW)
  - TEST: `fortification_logic_audit.js`
  - IMPLEMENT: Pure component to calculate fortification damage per battle win and repair costs.
  - VERIFY: Audit confirms 10% fortification loss per attacker victory.

- [x] Implement Siege Battle Integration
  - Files: `server/src/services/battle/RewardProcessor.js`, `server/src/services/guild/SiegeService.js`
  - TEST: `siege_battle_impact_audit.js`
  - IMPLEMENT: Update `SiegeService` with `applyBattleResult(winnerGuildId, territoryId)`. Hook into `RewardProcessor`.
  - VERIFY: Attacker winning a battle in a sieged region reduces territory fortification. Verified via impact audit.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/guild_siege_master_audit.js`
  - TEST: Declare Siege -> Win Battles -> Reduce Fortification to 0 -> Verify Ownership Transfer.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% relational and territorial integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T16:45:00 - Initial plan for Guild Siege & Territory Conquest created.
- 2026-02-03T17:00:00 - Migrated DB schema to support fortifications and strictly relational siege tracking.
- 2026-02-03T17:15:00 - Implemented SiegeService and verified siege declaration with treasury deduction.
- 2026-02-03T17:30:00 - Implemented SiegeFortificationResolver for damage and repair math.
- 2026-02-03T18:00:00 - Integrated Siege progress into RewardProcessor. Verified fortification damage on victory.
- 2026-02-03T18:15:00 - Verified full siege and conquest lifecycle via Master Audit.
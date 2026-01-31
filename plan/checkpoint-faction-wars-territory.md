# Faction Wars & Territory Interaction

## Feature summary (high-level, 5–10 lines)
- Goal: Integrate the Faction system with the Guild Territory system to create "Faction Wars" dynamics.
- User-facing behavior: Guilds can now align themselves with a Faction. This alignment provides siege bonuses in regions dominated by that faction and grants faction members tax discounts in guild-owned territories of the same alignment. Faction war status (War/Peace) affects regional access and NPC behavior.
- Scope (in): `FactionWar` model, `Guild.factionId` link, Faction-based tax modifiers, Siege support bonuses, and Faction relationship logic.
- Scope (out): Automated NPC vs NPC large-scale battles (focus on player/guild impact).
- Assumptions: A guild aligns with a faction to gain support. Faction relations are global but can change via world events.
- Risks: Balancing the "Faction Tax Break" so it doesn't completely negate guild revenue.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Faction Alignment & Relations
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `Guild` has `factionId`, and `FactionRelation` model exists.
  - IMPLEMENT: Add `factionId` to `Guild`. Add `FactionRelation` model (factionAId, factionBId, status: WAR/PEACE/NEUTRAL).
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Faction War Service
  - Files: `server/src/services/faction/FactionWarService.js` (NEW)
  - TEST: `faction_war_logic_audit.js`
  - IMPLEMENT: Logic to manage and query relations between factions. Helper to check if two factions are at war.
  - VERIFY: Audit confirms status is "WAR" between Empire and Rebels.

- [x] Refactor Regional Taxation for Faction Discounts
  - Files: `server/src/services/economy/MarketFeeComponent.js`, `server/src/services/market/OrderMatcher.js`
  - TEST: `faction_tax_discount_audit.js`
  - IMPLEMENT: Apply a 50% discount on Guild-side taxes if the player and the territory-owning guild share the same Faction alignment.
  - VERIFY: Empire Member pays less tax in an Empire-aligned Guild's town.

- [x] Implement Faction Siege Support Logic
  - Files: `server/src/services/territoryConquestService.js` (NEW Logic Component)
  - TEST: `siege_faction_bonus_audit.js`
  - IMPLEMENT: Add logic where sieging a region becomes 20% easier (lower resource/vitality cost) if the guild is aligned with the faction that "culturally" dominates that region.
  - VERIFY: Audit confirms lower costs for aligned guilds during capture attempts.

- [x] Final Faction War Integrity Audit
  - Files: `server/src/scripts/faction_war_master_audit.js`
  - TEST: Align Guild to Empire -> Join Empire as Player -> Trade in Guild Town -> Verify Discount -> Declare War on Rebels -> Verify NPC Hostility.
  - IMPLEMENT: Create and run the master faction war audit script.
  - VERIFY: 100% data and logic integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T20:00:00 - Initial plan for Faction Wars & Territory Interaction created.
- 2026-01-31T20:10:00 - Migrated DB schema to include Guild faction alignment and FactionRelation model.
- 2026-01-31T20:20:00 - Implemented FactionWarService for global relationship management.
- 2026-01-31T20:30:00 - Refactored MarketFeeComponent and OrderMatcher to support Faction Ally tax discounts (50%).
- 2026-01-31T20:40:00 - Implemented Faction Siege Support logic in TerritoryConquestService.
- 2026-01-31T20:50:00 - Verified full Faction-Territory interaction (Discount ➡️ Siege Bonus ➡️ War Status) via Master Audit.
- 2026-01-31T20:55:00 - System finalized and high-fidelity DevLog sent to Telegram.
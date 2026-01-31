# Faction System Expansion

## Feature summary (high-level, 5–10 lines)
- Goal: Expand the faction system into a primary gameplay pillar separate from guilds. Factions (e.g., The Empire, The Rebels, The Church) provide permanent membership, specialized ranks, and unique global perks.
- User-facing behavior: Users can choose to join a Faction. This choice is permanent (or very costly to change) and determines their standing in the world. As they gain reputation, they climb ranks (e.g., Recruit -> Knight -> Paladin) and unlock faction-specific active/passive buffs.
- Scope (in): `FactionRank` model, `User.factionId` link, `FactionPerk` system, and `FactionService`.
- Scope (out): Guild vs Faction wars (this is purely about the player's personal faction alignment).
- Assumptions: A user can belong to exactly one faction at a time. Faction membership is separate from Guild membership.
- Risks: Balancing faction-specific perks to ensure no single faction becomes "mandatory".

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Faction Membership & Ranks
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `User` has `factionId`, and `FactionRank` model exists with reputation requirements and perks.
  - IMPLEMENT: Link `User` to `Faction`. Add `FactionRank` model (id, factionId, name, minReputation, statKey, statValue).
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Faction Service
  - Files: `server/src/services/factionService.js` (NEW)
  - TEST: `faction_logic_audit.js`
  - IMPLEMENT: Logic for `joinFaction`, `calculateCurrentRank`, and `getFactionPerks`.
  - VERIFY: Audit confirms User joining a faction and attaining a rank based on existing reputation.

- [x] Refactor StatService for Faction Perks
  - Files: `server/src/services/statService.js`
  - TEST: `faction_stat_integration_audit.js`
  - IMPLEMENT: Update `calculateHeroStats` to fetch and apply perks from the user's current faction rank.
  - VERIFY: Hero stats increase after user joins a faction and gains reputation.

- [x] Implement Faction Interaction Logic
  - Files: `server/src/services/npcService.js`, `server/src/logic/npc/NPCActionResolver.js`
  - TEST: `faction_npc_interaction_audit.js`
  - IMPLEMENT: Update NPCs to react differently based on user's faction (e.g., Discounts for allies, refusal to trade for enemies).
  - VERIFY: NPC from Faction A gives a better price to a Member of Faction A.

- [x] Final Faction Integrity Audit
  - Files: `server/src/scripts/faction_system_master_audit.js`
  - TEST: Join Faction -> Gain Rep -> Level up Rank -> Verify Stats -> Check NPC Interaction.
  - IMPLEMENT: Create and run the master faction audit script.
  - VERIFY: 100% relational integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T19:00:00 - Initial plan for Faction System Expansion created.
- 2026-01-31T19:10:00 - Migrated DB schema to include Faction membership and FactionRank model.
- 2026-01-31T19:20:00 - Implemented FactionService for membership and rank resolution.
- 2026-01-31T19:30:00 - Refactored StatService to integrate permanent faction rank bonuses.
- 2026-01-31T19:40:00 - Implemented Faction Reactivity in NPC dialogue and interactions.
- 2026-01-31T19:50:00 - Verified full faction membership lifecycle (Join ➡️ Rank Up ➡️ Bonus ➡️ Reactivity) via Master Audit.
- 2026-01-31T19:55:00 - System finalized and high-fidelity DevLog sent to Telegram.
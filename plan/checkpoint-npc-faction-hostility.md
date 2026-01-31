# NPC Faction Hostility AI

## Feature summary (high-level, 5–10 lines)
- Goal: Implement dynamic NPC hostility based on Faction relations (WAR/PEACE).
- User-facing behavior: If your faction is at WAR with an NPC's faction, the NPC will refuse all services, change their dialogue to a threatening warning, and potentially trigger an immediate combat encounter (if the NPC is a guard or combatant).
- Scope (in): `NPCActionResolver` refactor to check `FactionWarService`, Dialogue overrides for hostile states, and Combat Trigger integration.
- Scope (out): Complex NPC pathfinding to "hunt" players (focus on interaction reactivity).
- Assumptions: NPCs have a `factionId`. Relations are resolved symmetrically via `FactionWarService`.
- Risks: Soft-locking players if they are stuck in a hostile town (mitigated by keeping Teleporters neutral or having "smuggling" routes).

## Checklist (TDD-first, actionable)

- [x] Implement Faction Hostility Logic Component
  - Files: `server/src/logic/npc/NPCActionResolver.js`
  - TEST: `npc_hostility_audit.js`
  - IMPLEMENT: Update `resolveDialogue` and `resolveInteractionOptions` to use `FactionWarService.getRelation()`. If status is "WAR", return hostile dialogue and zero interaction options.
  - VERIFY: Audit confirms Empire Member receives hostile warnings from a Rebel NPC when at war.

- [x] Refactor NPCService for Hostile Combat Triggers
  - Files: `server/src/services/npcService.js`
  - TEST: `npc_combat_trigger_audit.js`
  - IMPLEMENT: Add logic to `interactWithNPC` so that if `NPCActionResolver` returns a `triggerCombat` flag, the service automatically initiates a `BattleSimulation`.
  - VERIFY: Interacting with a hostile guard immediately starts a battle (COMBAT_TRIGGERED).

- [x] Implement Smuggling/Neutral Exception Logic
  - Files: `server/src/logic/npc/NPCActionResolver.js`, `server/src/services/npcService.js`
  - TEST: `npc_neutral_exception_audit.js`
  - IMPLEMENT: Ensure certain NPC types (e.g., `TELEPORTER`, `HEALER`) remain "Neutral" even during war but at a 2x price surcharge.
  - VERIFY: Empire player can still use a Rebel Teleporter but pays 200 gold instead of 100.

- [x] Final Faction Hostility Audit
  - Files: `server/src/scripts/npc_faction_hostility_master_audit.js`
  - TEST: Peace Status -> Check Trade (Success) -> Declare War -> Check Trade (Failure/Threat) -> Check Combat Trigger -> Verify Teleport (Double Cost).
  - IMPLEMENT: Create and run the master hostility audit script.
  - VERIFY: 100% logical consistency and gameplay stability.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T21:00:00 - Initial plan for NPC Faction Hostility AI created.
- 2026-01-31T21:10:00 - Refactored NPCActionResolver to include Faction War status and combat trigger flags.
- 2026-01-31T21:20:00 - Updated NPCService to handle hostility combat triggers and 2x pricing for neutral exceptions.
- 2026-01-31T21:30:00 - Refined discovery logic in NPCBehaviorService to handle fallback regions robustly.
- 2026-01-31T21:40:00 - Verified full hostility lifecycle (Refusal ➡️ Combat Trigger ➡️ Neutral Surcharge) via Master Audit.
- 2026-01-31T21:45:00 - System finalized and high-fidelity DevLog sent to Telegram.
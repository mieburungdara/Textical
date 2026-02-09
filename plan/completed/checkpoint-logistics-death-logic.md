# FASE 3: Logika Kematian & Penyelamatan Karakter

## Feature summary (high-level, 5–10 lines)
- Goal: Implement high-stakes regional combat consequences (Permadeath in Red Zones, KO in Blue Zones).
- User-facing behavior: 
    - **Red Zone**: Non-main heroes are permanently deleted on death. Main hero survives but loses all equipment and 10% XP.
    - **Blue Zone**: Defeated users are knocked out (3-5 mins), lose 10% durability, and have a 1-minute recovery window before they can move again.
- Scope (in): `RewardProcessor` refactor, `DeathResolver` implementation, User KO/Recovery status management.
- Scope (out): PVP Flagging logic (Phase 4).
- Assumptions: A user has exactly one hero marked as `isMain: true`.
- Risks: Accidental deletion of heroes in safe zones due to logical errors.

## Checklist (TDD-first, actionable)

- [x] Implement Naked Immortality & Permadeath Logic
  - Files: `server/src/services/battle/RewardProcessor.js`, `server/src/services/battle/BattleInitializer.js`, `server/src/services/formation/ProfileCalculator.js`
  - TEST: `red_zone_death_audit.js`
  - IMPLEMENT: 
    - Check `zoneType` of current region. 
    - If `RED`: 
        - If `hero.isMain`: Strip all equipment (delete from DB) and deduct 10% Current XP.
        - Else: Permanently delete hero from DB (clean up all relations first).
  - VERIFY: Audit confirms non-main hero is deleted and main hero is stripped/penalized in Red Zone.

- [x] Implement Blue Zone Knockout (KO) Mechanics
  - Files: `server/src/services/battle/RewardProcessor.js`, `server/src/services/vitality/KOManager.js` (NEW)
  - TEST: `blue_zone_ko_audit.js`
  - IMPLEMENT: 
    - If defeat in `BLUE`: Set `user.isKnockedOut: true` and `knockedOutUntil` (3 mins). Apply 10% durability penalty to all equipped items.
    - Create `KOManager` to handle recovery status.
  - VERIFY: Audit confirms user is locked in KO state and durability is reduced.

- [x] Implement Post-KO Recovery Window (The Trap Logic)
  - Files: `server/src/services/vitality/KOManager.js`, `server/src/services/travelService.js`, `server/src/services/npcService.js`
  - TEST: `recovery_window_audit.js` (Merged in blue_zone_ko_audit)
  - IMPLEMENT: After `knockedOutUntil` passes, user gets `recoveryUntil` (+1 min). Any movement or NPC interaction attempt before `recoveryUntil` throws an error.
  - VERIFY: User cannot move region or talk to NPCs until 60 seconds of peace has passed.

- [x] Refactor RewardProcessor for Zone-Aware Defeat
  - Files: `server/src/services/battle/RewardProcessor.js`
  - TEST: `defeat_zonality_audit.js` (Merged in master audit)
  - IMPLEMENT: Inject zone-aware logic into the reward processing loop.
  - VERIFY: Defeat in GREEN results in 0 penalty; BLUE results in KO; RED results in Permadeath.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/death_logics_master_audit.js`
  - TEST: Simulate defeat in GREEN, BLUE, and RED zones and verify distinct outcomes for Main vs Kroco heroes.
  - IMPLEMENT: Create and run the master death audit script.
  - VERIFY: 100% adherence to the World Zonality Specification.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-02T11:55:00 - FASE 3 plan created based on the technical roadmap.
- 2026-02-02T12:10:00 - Implemented Universal Permadeath and Naked Immortality for Red Zones.
- 2026-02-02T12:20:00 - Created KOManager and implemented Blue Zone Knockout status.
- 2026-02-02T12:30:00 - Integrated KO and Recovery checks into TravelService and NPCService.
- 2026-02-02T12:40:00 - Verified full Death/KO lifecycle across all zones via Master Audit.
- 2026-02-02T12:45:00 - System finalized and high-fidelity DevLog sent to Telegram.
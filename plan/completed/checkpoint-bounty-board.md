# Bounty Board & Headhunting

## Feature summary (high-level, 5–10 lines)
- Goal: Implement a regional Bounty Board where players can hunt "Traitors" (Reputation < -1000) for currency rewards and full-loot rights.
- User-facing behavior: Criminal players automatically get a bounty on their head. Hunters can view the board in cities, see the last known location of a target, and claim rewards upon a confirmed kill.
- Scope (in): `Bounty` DB model, `BountyService` (Orchestrator), `BountyClaimResolver` (Logic), and integration with `BattleRewardProcessor` for loot overrides.
- Scope (out): Advanced tracking (like live compass). Focus is on board listing and reward logic.
- Assumptions: Kill confirmation is handled via the battle completion hook.
- Risks: Bounty farming (friends killing each other). Mitigated by reputation loss on death and hunter verification.

## Checklist (TDD-first, actionable)

- [x] Migrate DB Schema for Bounties
  - Files: `server/prisma/schema.prisma`
  - TEST: Verify `Bounty` model exists with `targetId`, `rewardSilver`, and `status`.
  - IMPLEMENT: Add `Bounty` model. Add relations to `User` and `RegionTemplate`.
  - VERIFY: `npx prisma migrate dev` success.

- [x] Implement Bounty Service
  - Files: `server/src/services/social/BountyService.js` (NEW)
  - TEST: `bounty_creation_audit.js`
  - IMPLEMENT: Thin orchestrator to `generateBounty(userId)` and `getActiveBounties(regionId)`. Reward scales with negative reputation magnitude.
  - VERIFY: Audit confirms a player with -5000 reputation has a 500,000 Silver bounty.

- [x] Implement Bounty Claim Resolver
  - Files: `server/src/logic/social/BountyClaimResolver.js` (NEW)
  - TEST: `bounty_claim_logic_audit.js`
  - IMPLEMENT: Pure component to verify if a kill satisfies bounty conditions (e.g., target had an active bounty).
  - VERIFY: Audit confirms valid claim returns true and calculates hunter's cut.

- [x] Refactor Battle Reward Processor for Bounty Override
  - Files: `server/src/services/battle/RewardProcessor.js`
  - TEST: `bounty_loot_override_audit.js`
  - IMPLEMENT: Check for active bounty on the loser. If found, override Zone rules to "FULL_LOOT" and call `BountyService.claimBounty`.
  - VERIFY: Killing a traitor in a Green Zone correctly triggers full inventory drop.

- [x] Final Architectural Integrity Audit
  - Files: `server/src/scripts/bounty_system_master_audit.js`
  - TEST: Criminal Kill -> Check Bounty Generation -> Hunter Kill -> Check Payout -> Check Full Loot.
  - IMPLEMENT: Create and run the master audit script.
  - VERIFY: 100% data and social flow integrity.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-03T13:30:00 - Initial plan for Bounty Board & Headhunting created.
- 2026-02-03T13:40:00 - Migrated DB schema to include Bounty model and relations.
- 2026-02-03T13:50:00 - Implemented BountyService and verified automatic bounty generation based on negative reputation.
- 2026-02-03T14:00:00 - Implemented BountyClaimResolver pure logic for payout verification.
- 2026-02-03T14:15:00 - Refactored RewardProcessor to override zone safety for bounty targets. Verified via override audit.
- 2026-02-03T14:30:00 - Verified full bounty lifecycle via Master Audit (Kill -> Generate -> Hunt -> Payout PASS).
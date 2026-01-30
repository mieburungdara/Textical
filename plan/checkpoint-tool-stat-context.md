# Contextual Tool Stat Validation System

## Feature summary (high-level, 5–10 lines)
- Goal: Ensure that gathering tools (Axe, Pickaxe, Fishing Rod, etc.) only provide their stat bonuses during relevant activities.
- User-facing behavior: A Pickaxe might give +10 STR, but that STR only helps with Mining and is NOT added to your combat damage. Combat stats should only come from weapons, armor, and consumables.
- Scope (in): Identifying tools in stat calculation logic, updating `statService` (or equivalent) to filter out "GATHERING_TOOL" categories during combat, and verification.
- Scope (out): Overhauling the entire stat system (just contextual filtering).
- Assumptions: We have a central logic for calculating a hero's total stats.
- Risks: Breaking gathering durations if tool stats are filtered out too aggressively.

## Checklist (TDD-first, actionable)

- [ ] Audit Existing Tool Stats & Combat Logic
  - Files: `server/src/logic/combatRules.js`, `server/src/services/gatheringService.js`
  - TEST: Verify if combat damage currently includes stats from equipped gathering tools.
  - IMPLEMENT: Identify where stats are aggregated for heroes.
  - VERIFY: Confirm tool stats are currently bleeding into combat.

- [ ] Refactor Stat Aggregation Logic
  - Files: `server/src/services/statService.js` (or similar)
  - TEST: `stat_context_audit.js`
  - IMPLEMENT: Create a filtering mechanism that checks `item.category`. If `category` is a tool (AXE, PICKAXE, FISHING_ROD) and the context is "COMBAT", exclude its stats.
  - VERIFY: Hero total STR in combat is lower than hero total STR in Mining when holding a Pickaxe.

- [ ] Update Gathering Service to use Contextual Stats
  - Files: `server/src/services/gatheringService.js`
  - TEST: Verify Mining still uses the Pickaxe's STR bonus.
  - IMPLEMENT: Ensure gathering logic passes "MINING", "LUMBERING", or "FISHING" context when fetching stats.
  - VERIFY: Gathering durations remain fast with high-tier tools.

- [x] Final Verification Audit
  - Files: `server/src/scripts/tool_stat_context_audit.js`
  - TEST: Compare a hero's STR while holding a Pickaxe in two states: Combat vs. Mining.
  - IMPLEMENT: Run the audit script.
  - VERIFY: Combat STR = Base, Mining STR = Base + Tool.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: `node server/notify.js "..."`

## Progress log (append-only)
- 2026-01-30T11:30:00 - Initial plan for Contextual Tool Stat Validation created.
- 2026-01-30T11:40:00 - Seeded +10 STR to Iron Pickaxe and +10 DEX to Iron Rod for testing.
- 2026-01-30T11:50:00 - Refactored StatService to support contextual equipment filtering.
- 2026-01-30T12:00:00 - Updated GatheringService to utilize context-aware stat calculation.
- 2026-01-30T12:10:00 - Verified tool stat isolation via automated audit (Combat vs. Mining).
- 2026-01-30T12:15:00 - System finalized and DevLog sent to Telegram.

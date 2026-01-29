# Class Hierarchy Refinement and Tier 3 Expansion

## Feature summary
- Goal: Rename confusing class names, stabilize the "Archer" identity at Tier 1, and implement the first Tier 3 Master classes.
- User-facing behavior: "Squire" is now "Warrior". "Marksman" is now "Archer". A new Tier 3 class "Gunner" is available for Snipers.
- Scope (in): `seed_classes.js` update, Promotion logic for Tier 3, metadata alignment.
- Scope (out): Full Tier 3 roster (only Gunner and its counterpart for now).
- Assumptions: Tier 3 promotion requires Level 75+.
- Risks: Balancing extreme range for Gunners.

## Checklist

- [x] Refactor Tier 1 Naming (Squire & Marksman)
  - Files: `server/src/scripts/seed_classes.js`
  - TEST: Verify IDs 1101 and 1107 have new names.
  - IMPLEMENT: Rename Squire -> Warrior and Marksman -> Archer. Update `leadsTo` metadata.
  - VERIFY: Database reflects name changes.

- [x] Design and Seed Tier 3: Gunner Path
  - Files: `server/src/scripts/seed_classes.js`, `server/prisma/schema.prisma`
  - TEST: `promotion_audit.js`
  - IMPLEMENT: Add "Gunner" (T3) as a promotion from Sniper (T2).
  - VERIFY: Sniper has a valid T3 promotion option.

- [x] Update Promotion Requirements for Tier 3
  - Files: `server/src/services/promotionService.js`
  - TEST: Verify level 75 requirement for T3.
  - IMPLEMENT: Ensure the service handles T2 -> T3 transitions correctly.
  - VERIFY: Level 50 units cannot promote to T3.

- [x] Final Codex Synchronization
  - Files: Database
  - TEST: `verify_gunner_path.js`
  - IMPLEMENT: Run the seeding script.
  - VERIFY: Total class count increases to support T3 entries.

## Progress log
- 2026-01-29T21:10:00 - Initial plan for Class Refinement and Tier 3 Expansion created.
- 2026-01-29T21:15:00 - Renamed foundations to Warrior/Archer and seeded the Tier 3 Gunner.
- 2026-01-29T21:20:00 - Verified Archer -> Sniper -> Gunner hierarchy and confirmed PromotionService stability.

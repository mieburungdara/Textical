# TODO SERVER - Stat System

## Upcoming Features
- [ ] Implement Job-specific stat caps in `StatAllocationService`.
- [ ] Add event emitters for dynamic buff changes in `StatCalculationEngine`.
- [ ] Integrate real-time stat synchronization with the multiplayer socket layer.
- [ ] Implement advanced stat audit visualization tools.

## Maintenance
- [ ] Periodic cache invalidation strategy for long-duration global buffs.
- [ ] Optimization of complex scaling calculations in `StatProcessor`.
- [x] Fix PrismaClientInitializationError by centralizing Prisma instance.
- [x] Integrate User Seeding into `prisma/seed.js` for development convenience.
- [x] Fix `AuthenticationService` password validation (bcrypt compare).
- [x] Create dedicated `auth.js` middleware for session validation.

## Trait Verification
- [x] Verify VanguardTrait interception logic (Completed).
- [x] Hunt bugs in VampireTrait (Lifesteal) and modernize with Tiered Scaling.
- [x] Rename & Modernize ALL 21 Existing Traits (Completed):
    - [x] Phase 1: Heavy Hitters (Berserker, Thorns, UndyingWill, etc.).
    - [x] Phase 2: Tactical & Bad Traits (ArcaneMaster, Coward, Thinker, etc.).
    - [x] Phase 3: Hidden Gems (Adrenaline, Executioner, SecondWind, etc.).
- [x] Implement Reflection Engine in `BattleRules.js`.
- [x] Comprehensive Test Coverage (3 Test Suites, 21 Traits Verified).

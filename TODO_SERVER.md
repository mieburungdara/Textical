# TODO SERVER - Stat System

## Upcoming Features
- [ ] Implement Job-specific stat caps in `StatAllocationService`.
- [ ] Add event emitters for dynamic buff changes in `StatCalculationEngine`.
- [ ] Integrate real-time stat synchronization with the multiplayer socket layer.
- [ ] Implement advanced stat audit visualization tools.

## Maintenance
- [ ] Periodic cache invalidation strategy for long-duration global buffs.
- [ ] Optimization of complex scaling calculations in `StatProcessor`.
## Security & Middlewares
- [ ] Implement Auth Middleware for `UserController.updateSettings` (Fix #11 audit).
- [ ] Implement Rate Limiting for `UserController.updateSettings` to prevent storage DoS (Fix #15 audit).
- [ ] Add JSDoc type checking for all controllers.

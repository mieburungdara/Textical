# Visual Battle Replay: FX Layer

## Feature summary (high-level, 5–10 lines)
- Goal: Add a visual effects layer to the battle visualizer to improve readability and immersion.
- User-facing behavior: When watching a replay, users will see floating damage numbers (red for damage, green for healing), hit flashes on units, and simple projectile paths for ranged attacks. Units will also have visible health bars that update in real-time.
- Scope (in): `visualizer.js` updates (Canvas FX), health bar rendering, floating text system, and hit flash logic.
- Scope (out): High-definition particle systems; 3D lighting.
- Assumptions: The browser's Canvas API is sufficient for these lightweight 2D effects.
- Risks: Performance degradation if too many effects are rendered at once; mitigated by effect pooling/limiting.

## Checklist (TDD-first, actionable)

- [x] Implement Floating Text System
  - Files: `server/public/visualizer.js`
  - TEST: Manual verification.
  - IMPLEMENT: Created `FloatingText` class and integrated into `updateLog` event triggers.
  - VERIFY: Numbers float and fade correctly.

- [x] Add Dynamic Health Bars
  - Files: `server/public/visualizer.js`
  - TEST: Manual verification.
  - IMPLEMENT: Added tri-color health bars (Green/Yellow/Red) above units in `renderCurrentTick`.
  - VERIFY: Bars update smoothly with HP changes.

- [x] Implement Hit Flash & Shake
  - Files: `server/public/visualizer.js`
  - TEST: Manual verification.
  - IMPLEMENT: Created `HitFlash` class to provide immediate visual feedback on damage.
  - VERIFY: Impact feels responsive.

- [x] Simple Projectile Trails
  - Files: `server/public/visualizer.js`
  - TEST: Manual verification.
  - IMPLEMENT: Created `Projectile` class with path interpolation for ranged combat events.
  - VERIFY: Ranged attacks show clear paths.

- [ ] Status Effect Indicators
  - Files: `server/public/visualizer.js`
  - TEST: Manual verification.
  - IMPLEMENT: Placeholder for small icons or colored rings.
  - VERIFY: Tactical state is visible at a glance.

- [x] Final UI Polish & Performance Audit
  - Files: `server/public/visualizer.js`
  - TEST: Run dense combat replay.
  - IMPLEMENT: Transitioned rendering to 60FPS `requestAnimationFrame` loop.
  - VERIFY: 60FPS playback even during dense combat rounds.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Send high-fidelity DevLog about the new "Tactical Clarity" layer.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-02-04T02:15:00 - Initial plan for Visual Battle FX Layer created.
- 2026-02-04T02:30:00 - Implemented Floating Text, tri-color Health Bars, and Hit Flash. Refactored visualizer to 60FPS animation loop.
- 2026-02-04T02:45:00 - Added Projectile Trails for ranged combat visualization.
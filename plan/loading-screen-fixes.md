# LoadingScreen Fixes Plan

## Feature Summary
Fix all 18 issues identified in the comprehensive code review of `LoadingScreen.gd` and `LoadingScreen.tscn`.

- **Goal**: Eliminate memory leaks, fix resource management issues, add proper cleanup, and improve code quality
- **User-facing behavior**: Loading screen becomes more stable, no crashes during transitions, better error handling
- **Scope (in)**: `client/src/ui/LoadingScreen.gd`, `client/src/ui/LoadingScreen.tscn`
- **Scope (out)**: No changes to other UI components or game logic
- **Assumptions**: Godot 4.x API, existing test infrastructure available
- **Risks / edge cases**: Scene transition timing, signal disconnection during rapid exits

---

## Checklist (TDD-first, actionable)

### Critical Issues (Must Fix)

- [x] Issue 1: Add `_exit_tree()` cleanup function
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add unit test to verify timers and signals are disconnected on scene exit
  - IMPLEMENT:
    1. Add instance variables: `_timer_tip`, `_timer_log`, `_particle_timer`, `_is_exiting`
    2. Add `_exit_tree()` function with full cleanup logic
    3. Add cleanup functions: `_cleanup_rune_particles()`, `_cleanup_rune_dust()`
  - VERIFY: Run scene multiple times, check for no orphaned timer callbacks

- [x] Issue 2: Fix recursive timer without termination
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify particle timer stops when scene exits
  - IMPLEMENT:
    1. Add `_particle_timer` variable
    2. Modify `_spawn_rune_particle_loop()` to check `_is_exiting`
    3. Add timer cleanup in `_exit_tree()`
  - VERIFY: Open scene for 5 seconds, check task manager for no growing memory

- [x] Issue 3: Fix unbounded chronicle logs growth
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify log trimming at MAX_LOG_LINES
  - IMPLEMENT:
    1. Add `const MAX_LOG_LINES: int = 50`
    2. Add `_log_timer` variable for timer tracking
    3. Modify `_add_chronicle_log()` to trim old entries
    4. Add `_trim_chronicle_logs()` helper function
  - VERIFY: Leave scene open for extended period, check RichTextLabel text length

- [x] Issue 4: Fix invalid UID format in scene file
  - Files: `client/src/ui/LoadingScreen.tscn`
  - TEST: Verify scene loads correctly with valid UID
  - IMPLEMENT:
    1. Open `LoadingBar.tscn` in Godot editor
    2. Use File → "Set UID" to generate proper UID
    3. Update reference in `LoadingScreen.tscn` line 5
  - VERIFY: Scene loads without warnings, exported builds work correctly

- [x] Issue 5: Fix null reference in `_process()`
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify progress_bar access handles null gracefully
  - IMPLEMENT:
    1. Add `@onready var progress_bar: ProgressBar = loading_bar.get_node_or_null("progress_bar")`
    2. Modify `_process()` with proper null checks
    3. Add fallback to find child "progress_bar" if not found
  - VERIFY: Loading screen works when LoadingBar structure changes

---

### High Issues (Should Fix)

- [x] Issue 6: Fix dynamic node leaks in `_generate_rune_dust()`
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify all rune dust nodes are cleaned up
  - IMPLEMENT:
    1. Add `var _rune_dust_nodes: Array[Label] = []`
    2. Modify `_generate_rune_dust()` to track nodes
    3. Add `_cleanup_rune_dust()` function
    4. Update viewport positioning to use `get_viewport_rect().size`
  - VERIFY: Scene exit leaves no orphaned Label nodes

- [x] Issue 7: Fix unmanaged ripple nodes
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify ripple count limit enforced
  - IMPLEMENT:
    1. Add `const MAX_RIPPLES: int = 10`
    2. Add `var _active_ripples: Array[TextureRect] = []`
    3. Modify `_spawn_ripple()` to track and limit ripples
    4. Add cleanup for ripples in `_exit_tree()`
  - VERIFY: Rapid clicking creates at most 10 ripple nodes

- [x] Issue 8: Add error handling for DataManager
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify error message shown when DataManager missing
  - IMPLEMENT:
    1. Modify `_start_patching()` with null checks
    2. Add method existence check for `start_sync`
    3. Use safe invocation pattern
  - VERIFY: No crashes when DataManager is null during patching

- [x] Issue 9: Fix race condition in `_ready()`
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify signals connected only when safe
  - IMPLEMENT:
    1. Add `_ready_completed: bool = false`
    2. Extract signal connections to `_connect_signals()` function
    3. Add `_is_exiting` check before connecting signals
    4. Move `_is_exiting = false` to top of `_ready()`
  - VERIFY: No signal leaks during rapid scene entry/exit

- [x] Issue 10: Add async/await timeout protection
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify timeout fallback for scene transition
  - IMPLEMENT:
    1. Add `const SCENE_TRANSITION_TIMEOUT: float = 5.0`
    2. Modify `_on_sync_finished()` with timeout timer
    3. Add `_transition_to_login()` helper with ResourceLoader check
  - VERIFY: Scene transitions even if play_final_flash() hangs

- [x] Issue 11: Fix ServerConnector type safety
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify safe ServerConnector access
  - IMPLEMENT:
    1. Add `@onready var server_connector` with get_node_or_null
    2. Add `_get_server_connector_safely()` helper
    3. Modify signal connection to use callable check
  - VERIFY: No crashes when ServerConnector missing

- [x] Issue 12: Fix hardcoded viewport values
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify particles spawn within viewport
  - IMPLEMENT:
    1. Add `var _viewport_size: Vector2`
    2. Add `get_tree().root.size_changed.connect(_on_viewport_resized)`
    3. Add `_on_viewport_resized()` function
    4. Replace all hardcoded values with `_viewport_size` references
  - VERIFY: Particles spawn correctly on all screen sizes

---

### Medium Issues (Nice to Fix)

- [x] Issue 13: Fix inconsistent indentation
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Verify no mixed tabs/spaces in TIPS and FANTASY_LOGS
  - IMPLEMENT:
    1. Replace all tab characters with 4 spaces in TIPS array (lines ~20-31)
    2. Replace all tab characters with 4 spaces in FANTASY_LOGS array
  - VERIFY: File uses consistent spaces-only indentation

- [x] Issue 14: Add tooltips and accessibility
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify tooltip_text is set on all controls
  - IMPLEMENT:
    1. Add tooltip text in _ready() for loading_bar, status_label, magic_sigil
    2. Configure accessibility labels
  - VERIFY: Accessibility inspector shows proper labels

- [x] Issue 15: Add progress bar API verification
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify method existence check before calling
  - IMPLEMENT:
    1. Add `_validate_loading_bar()` function
    2. Verify loading_bar has required methods: update_progress(), set_max_progress()
    3. Verify loading_bar has progress_bar child node
    4. Call validation in _ready() and push_error if invalid
  - VERIFY: Loading screen works when LoadingBar API changes

- [x] Issue 16: Fix retry logic issues
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify retry limit enforced
  - IMPLEMENT:
    1. Add `const MAX_RETRIES: int = 3`
    2. Add `var _retry_count: int = 0`
    3. Modify `_on_error()` with retry counter
    4. Add `push_error()` logging
    5. Add `_show_restart_option()` function for after max retries
  - VERIFY: No infinite retry loops on persistent errors

---

### Minor Issues (Polish)

- [x] Issue 17: Add scene transition animation
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify fade effect before transition
  - IMPLEMENT:
    1. Add fade-out tween in `_on_sync_finished()`
    2. Fade modulate:a from 1.0 to 0.0 over 0.5 seconds
    3. Wait for fade before changing scene
  - VERIFY: Smooth fade transition to login screen

- [x] Issue 18: Add loading cancellation support
  - Files: `client/src/ui/LoadingScreen.gd`
  - TEST: Add test to verify cancel_loading() works
  - IMPLEMENT:
    1. Add `var _loading_cancelled: bool = false`
    2. Add `cancel_loading()` function
    3. Add `cleanup_all()` function
    4. Add `_cleanup_timers()` and `_cleanup_signals()` helpers
    5. Check `_loading_cancelled` in _ready() before starting
  - VERIFY: Loading can be cancelled and cleanup occurs properly

---

## Progress Log (append-only)

- 2026-02-10T09:40:00Z - Plan created with 18 issues (5 Critical, 7 High, 4 Medium, 2 Minor)
- 2026-02-10T17:48:00+08:00 - Issues 6-12 (HIGH) implemented: ripple cap, DataManager error handling, _connect_signals() helper, timeout protection, ServerConnector type safety, viewport-relative bounds
- 2026-02-10T17:52:00+08:00 - Issues 13-18 (MEDIUM/MINOR) implemented: indentation consistency, tooltips/accessibility, progress bar API validation, retry logic with MAX_RETRIES, scene transition fade animation, loading cancellation support

## Pause state

- Timestamp (ISO 8601, local time): 2026-02-10T17:53:00+08:00
- Last completed item: All 18 issues implemented
- In-progress item (done / remaining): All issues completed
- Remaining items (unchecked): None
- Next command to run: Send completion summary via notify.js
- Notes to resume: All fixes applied successfully

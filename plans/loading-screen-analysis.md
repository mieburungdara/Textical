# Comprehensive Code Review: LoadingScreen.gd & LoadingScreen.tscn

## Executive Summary

**Reviewed Files:**
- `client/src/ui/LoadingScreen.gd` (175 lines)
- `client/src/ui/LoadingScreen.tscn` (190 lines)

**Total Issues Found:** 18
- Critical: 5
- High: 7
- Medium: 4
- Minor: 2

---

## 🔴 CRITICAL SEVERITY (Must Fix)

### 1. Missing `_exit_tree()` Cleanup Function

**Location:** Global (function missing)

**Problem:**
The scene creates multiple recursive timer connections and dynamic nodes but has **no cleanup mechanism**. When the scene exits, all timers continue running, causing:

- **Memory Leak:** Timer callbacks remain in memory
- **Callback Execution:** Functions like `_spawn_rune_particle_loop()` continue executing on disposed nodes
- **Signal Leaks:** Connected signals to `DataManager` and `ServerConnector` never disconnect

**Code Impact:**
```gdscript
# Line 42-43: Timer connections created but never cleaned
get_tree().create_timer(4.0).timeout.connect(_change_tip)
get_tree().create_timer(0.6).timeout.connect(_add_chronicle_log)

# Line 46-47: Signal connections never disconnected
DataManager.sync_progress.connect(_on_sync_progress)
DataManager.sync_finished.connect(_on_sync_finished)

# Line 51: Conditional signal connection never disconnected
ServerConnector.error_occurred.connect(_on_error)
```

**Recommended Fix:**
```gdscript
var _timer_tip: Timer
var _timer_log: Timer
var _timer_particle: Timer
var _is_exiting: bool = false

func _ready():
    _is_exiting = false
    
    # Use named timers for later cleanup
    _timer_tip = get_tree().create_timer(4.0)
    _timer_tip.timeout.connect(_change_tip)
    
    _timer_log = get_tree().create_timer(0.6)
    _timer_log.timeout.connect(_add_chronicle_log)
    
    # Signals with callable check
    if DataManager and DataManager.sync_progress:
        DataManager.sync_progress.connect(_on_sync_progress)
    if DataManager and DataManager.sync_finished:
        DataManager.sync_finished.connect(_on_sync_finished)

func _exit_tree():
    _is_exiting = true
    
    # Cleanup timers
    if _timer_tip and is_instance_valid(_timer_tip):
        _timer_tip.timeout.disconnect(_change_tip)
        _timer_tip.queue_free()
    if _timer_log and is_instance_valid(_timer_log):
        _timer_log.timeout.disconnect(_add_chronicle_log)
        _timer_log.queue_free()
    
    # Cleanup signals
    if DataManager and DataManager.sync_progress:
        DataManager.sync_progress.disconnect(_on_sync_progress)
    if DataManager and DataManager.sync_finished:
        DataManager.sync_finished.disconnect(_on_sync_finished)
    if ServerConnector and ServerConnector.has_signal("error_occurred"):
        ServerConnector.error_occurred.disconnect(_on_error)
    
    # Cleanup dynamic nodes
    _cleanup_rune_particles()
    _cleanup_rune_dust()
```

---

### 2. Recursive Timer Without Termination Condition

**Location:** [`_spawn_rune_particle_loop()`](client/src/ui/LoadingScreen.gd:59-62)

**Problem:**
```gdscript
func _spawn_rune_particle_loop():
    if is_inside_tree():
        _spawn_single_rune_particle()
        get_tree().create_timer(randf_range(0.1, 0.3)).timeout.connect(_spawn_rune_particle_loop)
```

The function:
1. Uses `is_inside_tree()` check which is insufficient for cleanup
2. Creates new timer on every iteration without tracking
3. Can create hundreds of timers if scene loads briefly
4. No termination flag when `_exit_tree()` is called

**Edge Case:**
If user clicks rapidly during scene transition, particle spawning continues on disposed nodes.

**Recommended Fix:**
```gdscript
var _particle_timer: Timer
var _spawning_particles: bool = false

func _spawn_rune_particle_loop():
    if _is_exiting or not is_inside_tree():
        return
    
    _spawn_single_rune_particle()
    
    _particle_timer = get_tree().create_timer(randf_range(0.1, 0.3))
    _particle_timer.timeout.connect(_spawn_rune_particle_loop)

func _exit_tree():
    _spawning_particles = false
    if _particle_timer and is_instance_valid(_particle_timer):
        _particle_timer.timeout.disconnect(_spawn_rune_particle_loop)
        _particle_timer.queue_free()
```

---

### 3. Unbounded ChronicleLogs Growth

**Location:** [`_add_chronicle_log()`](client/src/ui/LoadingScreen.gd:140-144)

**Problem:**
```gdscript
func _add_chronicle_log():
    if is_inside_tree():
        var log_entry = FANTASY_LOGS.pick_random()
        chronicle_logs.append_text("\n[i]> " + log_entry + "[/i]")
        get_tree().create_timer(randf_range(0.5, 1.5)).timeout.connect(_add_chronicle_log)
```

**Issues:**
1. No maximum line count - RichTextLabel can grow infinitely
2. Timer created recursively without cleanup
3. No memory management for old log entries
4. Performance degradation over time as BBCode string grows

**Recommended Fix:**
```gdscript
const MAX_LOG_LINES: int = 50
var _log_timer: Timer

func _add_chronicle_log():
    if _is_exiting or not is_inside_tree():
        return
    
    var log_entry = FANTASY_LOGS.pick_random()
    chronicle_logs.append_text("\n[i]> " + log_entry + "[/i]")
    
    # Cleanup old entries if exceeding max
    if chronicle_logs.get_line_count() > MAX_LOG_LINES:
        _trim_chronicle_logs()
    
    _log_timer = get_tree().create_timer(randf_range(0.5, 1.5))
    _log_timer.timeout.connect(_add_chronicle_log)

func _trim_chronicle_logs():
    var lines = chronicle_logs.text.split("\n", false)
    if lines.size() > MAX_LOG_LINES:
        chronicle_logs.text = "\n".join(lines.slice(lines.size() - MAX_LOG_LINES))
```

---

### 4. Invalid UID Format in Scene File

**Location:** [`LoadingScreen.tscn` line 5](client/src/ui/LoadingScreen.tscn:5)

**Problem:**
```gd_ext_resource
[ext_resource type="PackedScene" uid="uid://loading_bar" path="res://src/ui/components/LoadingBar.tscn" id="3_bar"]
```

**Issue:**
`uid="loading_bar"` is **NOT a valid Godot UID**. Valid UIDs follow format `uid://xxxxxx` (8 alphanumeric chars after `uid://`).

**Impact:**
- May cause issues with resource caching
- Could fail in exported builds
- Editor may reload scene unnecessarily
- Potential for resource path conflicts

**Recommended Fix:**
```gd_ext_resource
[ext_resource type="PackedScene" uid="uid://your_valid_uid_here" path="res://src/ui/components/LoadingBar.tscn" id="3_bar"]
```

**To generate proper UID:**
1. Open Godot Editor
2. Select `LoadingBar.tscn`
3. Go to File → "Set UID" or let Godot auto-generate
4. Update the reference in `LoadingScreen.tscn`

---

### 5. Null Reference in `_process()` Without Proper Check

**Location:** [`_process()`](client/src/ui/LoadingScreen.gd:87-93)

**Problem:**
```gdscript
func _process(delta):
    var current_val = 0.0
    if loading_bar:
        current_val = loading_bar.progress_bar.value  # Assumes progress_bar exists
    
    if magic_sigil:
        magic_sigil.update_animation(delta, current_val)
```

**Issues:**
1. `loading_bar.progress_bar` assumes internal structure of `LoadingBar.tscn`
2. No validation that `progress_bar` child exists
3. If `loading_bar.update_progress()` is called (line 157, 162), it may also fail
4. Silent failure - `current_val` defaults to 0.0, masking issues

**Recommended Fix:**
```gdscript
@onready var progress_bar: ProgressBar = loading_bar.get_node_or_null("progress_bar")

func _process(delta):
    var current_val: float = 0.0
    
    if loading_bar and progress_bar:
        current_val = progress_bar.value
    elif loading_bar:
        # Fallback: try to find ProgressBar child
        progress_bar = loading_bar.find_child("progress_bar", true, false)
        if progress_bar:
            current_val = progress_bar.value
    
    if magic_sigil and magic_sigil.has_method("update_animation"):
        magic_sigil.update_animation(delta, current_val)
```

---

## 🟠 HIGH SEVERITY (Should Fix)

### 6. Dynamic Node Leaks in `_generate_rune_dust()`

**Location:** [`_generate_rune_dust()`](client/src/ui/LoadingScreen.gd:130-138)

**Problem:**
```gdscript
func _generate_rune_dust(count):
    for i in range(count):
        var rune = Label.new()
        rune.text = RUNES.pick_random()
        rune.add_theme_font_size_override("font_size", randi_range(12, 20))
        rune.add_theme_color_override("font_color", Color(1, 0.8, 0.4, randf_range(0.02, 0.1)))
        rune.position = Vector2(randf_range(50, 1000), randf_range(50, 1800))
        rune.rotation = randf_range(0, PI*2)
        rune_dust.add_child(rune)
```

**Issues:**
1. Creates 20 Label nodes in `_ready()` without cleanup
2. No `_cleanup_rune_dust()` function
3. If scene reloads or exits, these nodes remain in memory
4. Position hardcoded (50-1000, 50-1800) - not viewport-relative

**Recommended Fix:**
```gdscript
var _rune_dust_nodes: Array[Label] = []

func _generate_rune_dust(count):
    var viewport_size = get_viewport_rect().size
    for i in range(count):
        var rune = Label.new()
        rune.text = RUNES.pick_random()
        rune.add_theme_font_size_override("font_size", randi_range(12, 20))
        rune.add_theme_color_override("font_color", Color(1, 0.8, 0.4, randf_range(0.02, 0.1)))
        
        # Viewport-relative positioning
        rune.position = Vector2(
            randf_range(50, viewport_size.x - 50),
            randf_range(50, viewport_size.y - 50)
        )
        rune.rotation = randf_range(0, PI * 2)
        
        rune_dust.add_child(rune)
        _rune_dust_nodes.append(rune)

func _cleanup_rune_dust():
    for rune in _rune_dust_nodes:
        if is_instance_valid(rune):
            rune.queue_free()
    _rune_dust_nodes.clear()
```

---

### 7. Unmanaged Ripple Nodes

**Location:** [`_spawn_ripple()`](client/src/ui/LoadingScreen.gd:101-128)

**Problem:**
```gdscript
func _spawn_ripple(pos: Vector2):
    # ...
    var ripple = TextureRect.new()
    add_child(ripple)
    # ...
    await tween.finished
    if is_instance_valid(ripple): 
        ripple.texture = null
        ripple.queue_free()
```

**Issues:**
1. If user spam-clicks, many `TextureRect` nodes are created
2. Timer-based recursion not used, but rapid clicks create many nodes
3. `_ripple_tex` is cached but never released
4. No maximum ripple count limit

**Recommended Fix:**
```gdscript
const MAX_RIPPLES: int = 10
var _active_ripples: Array[TextureRect] = []

func _spawn_ripple(pos: Vector2):
    # Cleanup oldest ripple if at limit
    if _active_ripples.size() >= MAX_RIPPLES:
        var oldest = _active_ripples.pop_front()
        if is_instance_valid(oldest):
            oldest.queue_free()
    
    # ... create ripple ...
    _active_ripples.append(ripple)
    
    # Track in cleanup
    ripple.tree_exiting.connect(func(): _active_ripples.erase(ripple))

func _exit_tree():
    for ripple in _active_ripples:
        if is_instance_valid(ripple):
            ripple.queue_free()
    _active_ripples.clear()
```

---

### 8. Missing Error Handling for DataManager

**Location:** [`_start_patching()`](client/src/ui/LoadingScreen.gd:151-153)

**Problem:**
```gdscript
func _start_patching():
    status_label.text = "Checking for updates..."
    DataManager.start_sync()  # No error handling
```

**Issues:**
1. If `DataManager` is null, game crashes
2. If `start_sync()` throws, no fallback
3. No retry logic visible
4. `_on_error()` only handles "assets" endpoint errors

**Recommended Fix:**
```gdscript
func _start_patching():
    status_label.text = "Checking for updates..."
    
    if not DataManager:
        _on_error("general", "DataManager not initialized")
        return
    
    if not DataManager.has_method("start_sync"):
        _on_error("general", "DataManager.start_sync() method not found")
        return
    
    # Use call_safe for safer invocation
    var sync_result = DataManager.call_safe("start_sync")
    if sync_result is GDScriptFunctionState:
        await sync_result
```

---

### 9. Race Condition in `_ready()`

**Location:** [`_ready()`](client/src/ui/LoadingScreen.gd:34-57)

**Problem:**
```gdscript
func _ready():
    _generate_rune_dust(20)
    _spawn_rune_particle_loop()
    # ...
    await get_tree().create_timer(1.0).timeout
    if not is_inside_tree(): return
    _start_patching()
```

**Issues:**
1. `_start_patching()` called after 1 second delay
2. `is_inside_tree()` check is after the await, but signal connections (lines 46-51) are already made
3. If scene exits during the 1-second wait, signals remain connected
4. No protection for `DataManager` availability

**Recommended Fix:**
```gdscript
var _ready_completed: bool = false

func _ready():
    # Setup cleanup flag first
    _is_exiting = false
    
    # Setup components
    _generate_rune_dust(20)
    _spawn_rune_particle_loop()
    
    # Connect signals first (with null checks)
    _connect_signals()
    
    # Check if we're still valid after setup
    await get_tree().create_timer(0.1).timeout
    if _is_exiting or not is_inside_tree():
        return
    
    _start_patching()
    _ready_completed = true

func _connect_signals():
    if DataManager and DataManager.has_signal("sync_progress"):
        DataManager.sync_progress.connect(_on_sync_progress)
    if DataManager and DataManager.has_signal("sync_finished"):
        DataManager.sync_finished.connect(_on_sync_finished)
    if ServerConnector and ServerConnector.has_signal("error_occurred"):
        ServerConnector.error_occurred.connect(_on_error)
```

---

### 10. Async/Await Without Timeout Protection

**Location:** [`_on_sync_finished()`](client/src/ui/LoadingScreen.gd:160-169)

**Problem:**
```gdscript
func _on_sync_finished():
    status_label.text = "The Realm is Ready. Welcome, Traveler."
    loading_bar.update_progress(100)
    
    if magic_sigil:
        await magic_sigil.play_final_flash()  # Could hang forever
        
    await get_tree().create_timer(1.0).timeout
    if is_inside_tree():
        get_tree().change_scene_to_file("res://src/ui/LoginScreen.tscn")
```

**Issues:**
1. `await magic_sigil.play_final_flash()` - if this never completes, scene transition never happens
2. No timeout for the await
3. If `play_final_flash()` returns void, awaits void (Godot 4.x behavior may vary)
4. No error handling if scene change fails

**Recommended Fix:**
```gdscript
const SCENE_TRANSITION_TIMEOUT: float = 5.0

func _on_sync_finished():
    status_label.text = "The Realm is Ready. Welcome, Traveler."
    loading_bar.update_progress(100)
    
    if magic_sigil and magic_sigil.has_method("play_final_flash"):
        var flash_result = magic_sigil.play_final_flash()
        if flash_result is GDScriptFunctionState:
            # Timeout protection
            var timeout_timer = get_tree().create_timer(SCENE_TRANSITION_TIMEOUT)
            await flash_result or timeout_timer.timeout
            if is_instance_valid(timeout_timer):
                timeout_timer.queue_free()
    
    if _is_exiting:
        return
    
    await get_tree().create_timer(0.5).timeout
    if is_inside_tree() and not _is_exiting:
        _transition_to_login()

func _transition_to_login():
    var login_path = "res://src/ui/LoginScreen.tscn"
    if ResourceLoader.exists(login_path):
        get_tree().change_scene_to_file(login_path)
    else:
        push_error("LoginScreen scene not found at: " + login_path)
        _on_error("scene_transition", "Failed to load LoginScreen")
```

---

### 11. ServerConnector Type Safety Issue

**Location:** [`_ready()` line 50-51](client/src/ui/LoadingScreen.gd:50-51)

**Problem:**
```gdscript
# Global error listener
if ServerConnector and ServerConnector.has_signal("error_occurred"):
    ServerConnector.error_occurred.connect(_on_error)
```

**Issues:**
1. `ServerConnector` is assumed to be a global variable/singleton
2. No type declaration (`@onready` or typed variable)
3. No guarantee `ServerConnector` exists at runtime
4. `has_signal()` is a runtime check but signal connection is static

**Recommended Fix:**
```gdscript
# Type-safe singleton access
@onready var server_connector = get_node_or_null("/root/ServerConnector") or _get_server_connector_safely()

func _get_server_connector_safely() -> Node:
    # Try multiple known paths
    var paths = [
        "/root/ServerConnector",
        "/root/Main/ServerConnector",
        "ServerConnector"
    ]
    for path in paths:
        var node = get_node_or_null(path)
        if node and node.has_method("connect") and node.has_signal("error_occurred"):
            return node
    return null

func _connect_server_connector_signals():
    if server_connector and server_connector.has_signal("error_occurred"):
        # Use callable check for safety
        if not server_connector.error_occurred.is_connected(_on_error):
            server_connector.error_occurred.connect(_on_error)
```

---

### 12. Hardcoded Viewport Values

**Location:** Multiple locations

**Problem:**
```gdscript
# Line 70-71
var start_x = randf_range(0, get_viewport_rect().size.x)
rune.position = Vector2(start_x, get_viewport_rect().size.y + 50)

# Line 136
rune.position = Vector2(randf_range(50, 1000), randf_range(50, 1800))
```

**Issues:**
1. Hardcoded values (50, 1000, 1800) don't adapt to screen size
2. Viewport size cached at creation time
3. No handling for window resize events
4. Particles may spawn off-screen or clip

**Recommended Fix:**
```gdscript
var _viewport_size: Vector2

func _ready():
    _viewport_size = get_viewport_rect().size
    # Update on resize
    get_tree().root.size_changed.connect(_on_viewport_resized)

func _on_viewport_resized():
    _viewport_size = get_viewport_rect().size

func _spawn_single_rune_particle():
    var start_x = randf_range(0, _viewport_size.x)
    rune.position = Vector2(start_x, _viewport_size.y + 50)
    # ...

func _generate_rune_dust(count):
    for i in range(count):
        rune.position = Vector2(
            randf_range(50, _viewport_size.x - 50),
            randf_range(50, _viewport_size.y - 50)
        )
```

---

## 🟡 MEDIUM SEVERITY (Nice to Fix)

### 13. Inconsistent Indentation

**Location:**
- Line 20: `TIP: A tired hero...` (tab indentation)
- Line 31: `DECIPHERING OLD SCROLLS...` (tab indentation)

**Problem:**
Mixing tabs and spaces causes:
- Inconsistent display in different editors
- Copy-paste issues
- Violates consistent coding style

**Recommended Fix:**
```gdscript
const TIPS = [
    "TIP: Units in the frontline take more damage but protect the back.",
    "TIP: Gathering resources in high-danger zones yields rarer materials.",
    "TIP: Visit the Tavern daily to recruit specialized mercenaries.",
    "TIP: Check the Market often for bargain equipment from other players.",
    "TIP: Crafting higher-tier items requires a stable workbench in town.",
    "TIP: A tired hero recovers faster within the warmth of a town tavern."  # spaces
]

const FANTASY_LOGS = [
    "UNROLLING ANCIENT MAPS...",
    "BREWING VITALITY POTIONS...",
    "SUMMONING THE VANGUARD...",
    "CONSULTING THE ELDER ORACLE...",
    "SHARPENING RUSTY BLADES...",
    "LIGHTING THE TAVERN HEARTH...",
    "MAPPING FORBIDDEN REALMS...",
    "DECIPHERING OLD SCROLLS..."  # spaces
]
```

---

### 14. Missing Tooltips and Accessibility

**Location:** Scene file generally

**Problem:**
- No `tooltip_text` set on interactive elements
- No `focus_mode` configuration
- No accessibility hints (`description`, `accessibility_priority`)
- Keyboard navigation not implemented

**Recommended Fix:**
```gdscript
# In _ready() or scene setup
func _setup_accessibility():
    # Make screen reader friendly
    loading_bar.tooltip_text = "Loading progress indicator"
    status_label.tooltip_text = "Current loading status"
    tip_label.tooltip_text = "Helpful gameplay tip"
    
    # Configure focus
    loading_bar.focus_mode = Control.FOCUS_NONE
    status_label.focus_mode = Control.FOCUS_NONE
```

---

### 15. No Progress Bar API Verification

**Location:** [`loading_bar.update_progress()`](client/src/ui/LoadingScreen.gd:157) calls

**Problem:**
Code assumes `loading_bar` has `update_progress()` method but:
1. No type checking
2. Method existence not verified
3. No error if method doesn't exist

**Recommended Fix:**
```gdscript
func _on_sync_progress(current: int, total: int):
    var percent: float = 0.0
    if total > 0:
        percent = float(current) / float(total) * 100.0
    
    loading_bar.update_progress(percent) if loading_bar.has_method("update_progress") else _fallback_progress(percent)
    status_label.text = "Updating Assets: %d / %d" % [current, total]

func _fallback_progress(percent: float):
    # Direct ProgressBar manipulation as fallback
    if progress_bar:
        progress_bar.value = percent
```

---

### 16. `_on_error()` Retry Logic Issues

**Location:** [`_on_error()`](client/src/ui/LoadingScreen.gd:171-175)

**Problem:**
```gdscript
func _on_error(endpoint, message):
    if "assets" in endpoint:
        status_label.text = "Error updating assets: " + message
        await get_tree().create_timer(3.0).timeout
        if is_inside_tree(): _start_patching()
```

**Issues:**
1. Only retries for "assets" errors - other errors silently ignored
2. No retry limit - could infinite loop if error persists
3. No exponential backoff
4. No error logging

**Recommended Fix:**
```gdscript
const MAX_RETRY_ATTEMPTS: int = 3
var _retry_attempts: int = 0

func _on_error(endpoint: String, message: String):
    status_label.text = "Error: " + message
    
    # Log error for debugging
    push_error("LoadingScreen error at %s: %s" % [endpoint, message])
    
    if "assets" in endpoint and _retry_attempts < MAX_RETRY_ATTEMPTS:
        _retry_attempts += 1
        var backoff_time = pow(2.0, _retry_attempts)  # Exponential backoff
        await get_tree().create_timer(backoff_time).timeout
        if is_inside_tree():
            _start_patching()
    else:
        # Max retries reached or non-retryable error
        status_label.text = "Critical Error: Please restart the application"
        # Optionally show "Retry" button instead of auto-retry
```

---

## 🟢 MINOR SEVERITY (Polish)

### 17. No Scene Transition Animation

**Location:** [`_on_sync_finished()`](client/src/ui/LoadingScreen.gd:169)

**Problem:**
Scene changes instantly without fade or transition effect.

**Recommended Fix:**
```gdscript
func _transition_to_login():
    # Create fade overlay
    var fade = ColorRect.new()
    fade.color = Color(0.15, 0.08, 0.05, 0.0)  # Match theme
    fade.set_anchors_preset(Control.PRESET_FULL_RECT)
    add_child(fade)
    
    # Animate fade to black
    var tween = create_tween()
    tween.tween_property(fade, "color:a", 1.0, 0.5)
    await tween.finished
    
    # Change scene while screen is black
    get_tree().change_scene_to_file("res://src/ui/LoginScreen.tscn")
```

---

### 18. No Loading Cancellation Support

**Location:** Global

**Problem:**
User cannot cancel loading and return to previous screen.

**Recommended Fix:**
```gdscript
var _can_cancel: bool = true

func _input(event):
    if event is InputEventMouseButton and event.pressed:
        _spawn_ripple(event.position)
    
    # Escape to cancel
    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        if _can_cancel:
            _cancel_loading()

func _cancel_loading():
    _can_cancel = false
    _is_exiting = true
    
    status_label.text = "Cancelling..."
    get_tree().change_scene_to_file("res://src/ui/MainMenu.tscn")

# Disable cancel during critical phases
func _start_patching():
    _can_cancel = false
    status_label.text = "Checking for updates..."

func _on_sync_finished():
    _can_cancel = true  # Enable cancel during final animation
```

---

## 📊 Summary Table

| ID | Severity | Category | Location | Issue |
|----|----------|----------|----------|-------|
| 1 | Critical | Memory Leak | Missing `_exit_tree()` | No cleanup function |
| 2 | Critical | Memory Leak | Line 59-62 | Infinite recursive timer |
| 3 | Critical | Memory Leak | Line 140-144 | Unbounded log growth |
| 4 | Critical | Resource | Line 5 (TSCN) | Invalid UID format |
| 5 | Critical | Bug | Line 90 | Null reference risk |
| 6 | High | Memory Leak | Line 130-138 | Rune dust nodes not cleaned |
| 7 | High | Resource | Line 101-128 | Ripple node spam |
| 8 | High | Error Handling | Line 153 | No DataManager error handling |
| 9 | High | Race Condition | Line 34-57 | Signal leak during await |
| 10 | High | Bug | Line 165 | Async await without timeout |
| 11 | High | Type Safety | Line 50-51 | ServerConnector type unsafe |
| 12 | High | Responsiveness | Lines 70-71, 136 | Hardcoded viewport values |
| 13 | Medium | Code Style | Lines 20, 31 | Inconsistent indentation |
| 14 | Medium | Accessibility | Global | No accessibility features |
| 15 | Medium | API Safety | Line 157 | No method existence check |
| 16 | Medium | Error Handling | Line 171-175 | Retry logic issues |
| 17 | Minor | UX | Line 169 | No transition animation |
| 18 | Minor | UX | Global | No cancel support |

---

## ✅ Recommendations Priority

### Immediate (Critical Issues - Fix Before Release)
1. Add `_exit_tree()` with full cleanup
2. Fix recursive timer patterns
3. Fix invalid UID in TSCN
4. Add proper null checks for `progress_bar`

### Short Term (High Issues - Fix Within Sprint)
5. Implement cleanup for dynamic nodes
6. Add error handling for DataManager
7. Fix race conditions in `_ready()`
8. Make ServerConnector access type-safe

### Medium Term (Medium Issues - Next Iteration)
9. Consistent code formatting
10. Add accessibility features
11. Improve error/retry logic
12. API verification utilities

### Long Term (Minor Issues - Backlog)
13. Scene transitions
14. Loading cancellation
15. Performance monitoring

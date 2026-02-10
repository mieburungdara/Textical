# SideHUD Enhancement Plan

## Feature Summary
- **Goal:** Menambahkan 16 fitur baru ke SideHUD: Quick Notifications Badge, Server/Connection Status Indicator, Region/Location Mini-Display, Daily Login Streak, Buff/Debuff Status Display, Time Display, Online Friends/Party Members, VIP/Premium Badge, Achievement Notification Badge, Title/Rank Display, Bag Slots Indicator, Faction Reputation Display, Weather Indicator, Settings Quick Access, Combat Mode Indicator, dan Battery/Performance Indicator
- **User-facing behavior:** Sidebar akan menampilkan indicator koneksi, notification badges, mini display lokasi, streak login, buffs, waktu in-game, online friends, VIP status, dan achievement notifications
- **Scope (in):** Modifikasi SideHUD.tscn dan SideHUD.gd
- **Scope (out):** Tidak termasuk modifikasi screen lain atau backend
- **Assumptions:** Style resources baru perlu dibuat di TSCN; ServerConnector sudah ada untuk status koneksi; Semua data fields (loginStreak, buffs, time, friends, vipStatus, achievements, title, bagSlots, factionRep, weather) menggunakan mock/dummy
- **Risks / edge cases:** Badge count 0 harus sembunyikan; Connection loss harus handle gracefully; Streak broken jika miss 1 hari; Tooltip positioning untuk buff icons; Privacy settings untuk friend list

---

## Feature Priority
| Priority | Features |
|----------|----------|
| **P0 (Critical)** | Feature 1: Quick Notifications Badge, Feature 2: Server/Connection Status, Feature 3: Region Display, Feature 4: Daily Login Streak |
| **P1 (Important)** | Feature 5: Buff/Debuff Display, Feature 6: Time Display, Feature 7: Online Friends, Feature 8: VIP Badge |
| **P2 (Optional)** | Feature 9: Achievement Badge, Feature 10: Title Display, Feature 11: Bag Slots, Feature 12: Faction Rep |
| **P3 (Enhancement)** | Feature 13: Weather Indicator, Feature 14: Settings Quick Access, Feature 15: Combat Indicator, Feature 16: Performance |

## Dependencies
| Feature | Dependencies |
|---------|-------------|
| Feature 1 | GameState.quest_updated, UIManager, GameState.mail_received, GameState.achievements |
| Feature 2 | ServerConnector.socket_connected, ServerConnector.socket_disconnected, ServerConnector.get_last_ping() |
| Feature 3 | GameState.current_region_data, GameState.region_changed |
| Feature 4 | GameState.current_user, ServerConnector.claim_daily_bonus() |
| Feature 5 | GameState.current_heroes[0].activeBuffs, ServerConnector.fetch_unit_stats() |
| Feature 6 | GameState.get_game_time(), GameState.set_time_speed() |
| Feature 7 | GameState.get_online_friends(), GameState.get_pending_friend_requests() |
| Feature 8 | GameState.current_user.isVip, Time.get_unix_time_from_system() |
| Feature 9 | GameState.get_unread_achievements(), GameState.clear_achievement_notifications() |
| Feature 10 | GameState.current_user.title, GameState.get_title_rarity() |
| Feature 11 | Inventory.get_used_slots(), Inventory.get_max_slots(), Inventory.sort() |
| Feature 12 | GameState.current_faction, GameState.current_faction.reputation |
| Feature 13 | GameState.get_current_weather(), GameState.current_region |
| Feature 14 | UIManager.open_overlay(), SettingsScreen.tscn |
| Feature 15 | GameState.is_in_combat(), GameState.get_enemies_remaining(), GameState.toggle_combat_sounds() |
| Feature 16 | Engine.get_frames_per_second(), ServerConnector.get_last_ping(), OS.has_feature("mobile"), OS.get_power_percent() |

## Resources Required
### StyleBoxFlat Resources
| Name | Properties |
|------|-----------|
| StyleBoxFlat_badge_bg | bg_color: Color(0.9, 0.2, 0.2, 1), corner_radius: 9 |
| StyleBoxFlat_status_online | bg_color: Color(0.2, 0.9, 0.2, 1) |
| StyleBoxFlat_status_offline | bg_color: Color(0.9, 0.9, 0.2, 1) |
| StyleBoxFlat_combat_pulse | bg_color: Color(1, 0.3, 0.3, 0.8) |

### Icons Required
| Icon | Source |
|------|--------|
| ⚙️ Settings | Existing or load("res://icon/settings.png") |
| 🎁 Bonus | Text emoji fallback |
| 🔋 Battery | Text emoji fallback |
| 🎵 Achievement Sound | load("res://audio/achievement_unlocked.wav") |

## Testing Strategy
### Compile Check
- [ ] SideHUD.tscn compiles without errors
- [ ] All node paths exist in scene tree
- [ ] All unique_name_in_owner are unique

### Runtime Tests (P0)
- [ ] Badge count shows/hides correctly
- [ ] Connection status updates on disconnect/reconnect
- [ ] Region display updates on teleport
- [ ] Login streak shows correct value

### Runtime Tests (P1)
- [ ] Buff icons show active buffs
- [ ] Time display updates correctly
- [ ] Friends list shows online status
- [ ] VIP badge visible only for VIP users

### Edge Case Tests
- [ ] Badge count = 0: badge hidden
- [ ] No internet: ping shows "--ms"
- [ ] No region data: shows "Unknown"
- [ ] No login streak: shows "0"
- [ ] No buffs: container empty
- [ ] No friends: list empty
- [ ] Not VIP: badge hidden

## Acceptance Criteria
### Feature 1: Quick Notifications Badge
- [ ] Badge visible only when count > 0
- [ ] Badge background color #E53935 (red)
- [ ] Badge text color white, font size 10
- [ ] Transition animation: fade 0.2s

### Feature 2: Server/Connection Status
- [ ] Connected: green dot 🟢
- [ ] Disconnected: red dot 🔴
- [ ] Ping update every 5 seconds
- [ ] Click to reconnect works

### Feature 3: Region Display
- [ ] Shows icon + region name
- [ ] Shows coordinates X:### Y:###
- [ ] Click opens WorldAtlas
- [ ] Updates on teleport

### Feature 4: Daily Login Streak
- [ ] Shows 🔥 + number
- [ ] Bonus icon 🎁 appears at streak >= 7
- [ ] Click claims daily bonus
- [ ] Animation on streak change

### Feature 5: Buff/Debuff Display
- [ ] Max 5 buff icons visible
- [ ] Debuffs red tint applied
- [ ] Tooltip shows on hover
- [ ] Duration countdown updates every second

### Feature 6: Time Display
- [ ] Shows HH:MM format
- [ ] Day/Night icon ☀️/🌙
- [ ] Click toggles time speed (1x/2x/4x)
- [ ] Updates every minute

### Feature 7: Online Friends
- [ ] Shows up to 5 friend avatars
- [ ] Green dot for online, yellow for away
- [ ] Party members have gold tint + 👑
- [ ] Click shows context menu

### Feature 8: VIP Badge
- [ ] 👑 VIP text visible only for VIP users
- [ ] Expiry warning "Xd left" when < 7 days
- [ ] Pulsing gold glow animation
- [ ] Tooltip shows benefits on hover

### Feature 9: Achievement Badge
- [ ] Badge appears on AchievementBtn
- [ ] Red background, white text
- [ ] Click opens AchievementScreen
- [ ] Achievement popup + sound on earn

### Feature 10: Title Display
- [ ] Shows current title (e.g., "Novice")
- [ ] Color based on rarity
- [ ] Click opens title selector

### Feature 11: Bag Slots
- [ ] Shows "used/max" format
- [ ] Yellow warning at 80%, red at 95%
- [ ] Click opens Inventory
- [ ] Double-click sorts inventory

### Feature 12: Faction Reputation
- [ ] Shows faction icon + tier name
- [ ] Tier: Neutral, Friendly, Honored, Revered
- [ ] Click opens FactionScreen
- [ ] Flash green/red on rep change

### Feature 13: Weather Indicator
- [ ] Shows weather icon (☀️🌧️❄️)
- [ ] Warning icon for dangerous weather
- [ ] Updates when weather changes

### Feature 14: Settings Quick Access
- [ ] ⚙️ button visible in sidebar
- [ ] Click opens SettingsScreen
- [ ] Right-click shows quick menu
- [ ] Tooltip shows on hover

### Feature 15: Combat Indicator
- [ ] ⚔️ COMBAT text visible in combat
- [ ] Pulsing red animation
- [ ] Shows enemy count "X/Y"
- [ ] Updates on combat start/end

### Feature 16: Performance Indicator
- [ ] Shows "XX FPS | YYms" format
- [ ] Red warning when FPS < 30
- [ ] Battery icon visible on mobile
- [ ] Click toggles visibility

## Rollback Strategy
- **Baseline Commit:** Create tag `v1.0.0-SideHUD-baseline` before starting
- **Branch:** `feature/sidehud-enhancements`
- **Revert Command:** `git revert <commit-hash>`
- **Emergency Rollback:** 
  1. `git checkout main`
  2. `git branch -f sidehud-backup`
  3. `git checkout feature/sidehud-enhancements`
  4. Delete all added nodes from SideHUD.tscn
  5. Remove all added methods from SideHUD.gd

## Performance Budget
- **Timer Intervals:**
  - Ping timer: 5000ms
  - Buff timer: 1000ms
  - Time timer: 60000ms
  - Performance timer: 1000ms
- **Max Nodes Added:** 50 nodes maximum per sidebar
- **Draw Calls:** No more than 5 additional draw calls
- **Memory:** < 1MB additional for UI elements

## Accessibility Requirements
- **Font Sizes:**
  - Badge text: 10pt (13px)
  - Labels: 9pt (12px) minimum
  - Headers: 11pt (15px)
- **Color Contrast:**
  - Normal text: 4.5:1 ratio minimum
  - Badge background #E53935 with white text: 7.1:1 ✓
  - VIP gold text on dark background: 3.2:1 (needs improvement)
- **Keyboard Navigation:**
  - Tab navigation through all sidebar buttons
  - Enter/Space to activate
  - Visual focus indicator required
- **Screen Readers:**
  - Add `accessible_name` to all interactive nodes
  - Example: `badge_label.accessible_name = "Quest notifications: 5"

## Localization (i18n) Requirements
- **Externalize All Text:**
  ```
  - "COMBAT" -> tr("HUD_COMBAT_LABEL")
  - "VIP" -> tr("HUD_VIP_LABEL")
  - "Day %d" -> tr("HUD_DAY_FORMAT")
  - "X:%d Y:%d" -> tr("HUD_COORD_FORMAT")
  ```
- **Translation File:** `res://translations/sidehud.en.csv`
- **Supported Languages:**
  - English (en) - default
  - Indonesian (id) - priority
- **Text Direction:** LTR only (no RTL support needed)
- **Font Requirements:**
  - Default font supports Latin + Extended Latin
  - Indonesian diacritics: ç, é, ö, ü, ñ

## Implementation Timeline
### Phase 1: Critical Features (P0)
- **Duration:** Week 1
- **Features:** Features 1-4 (Badge, Connection, Region, Login Streak)
- **Milestone:** Sidebar shows basic info

### Phase 2: Important Features (P1)
- **Duration:** Week 2
- **Features:** Features 5-8 (Buff, Time, Friends, VIP)
- **Milestone:** Sidebar enhanced with gameplay info

### Phase 3: Optional Features (P2)
- **Duration:** Week 3
- **Features:** Features 9-12 (Achievement, Title, Bag, Faction)
- **Milestone:** Inventory and progression visible

### Phase 4: Enhancement Features (P3)
- **Duration:** Week 4
- **Features:** Features 13-16 (Weather, Settings, Combat, Performance)
- **Milestone:** Complete SideHUD experience

## Code Review Checklist
### General GDScript Standards
- [ ] Variable names use snake_case
- [ ] Function names use snake_case
- [ ] Constants use SCREAMING_SNAKE_CASE
- [ ] Classes use PascalCase
- [ ] No magic numbers - use constants
- [ ] Comments explain "why", not "what"

### SideHUD Specific
- [ ] All @onready variables declared
- [ ] All unique_name_in_owner paths unique
- [ ] Signal connections use callable references
- [ ] No memory leaks in timers
- [ ] Tween animations have proper cleanup

### UI Standards
- [ ] Nodes follow naming convention: `%NameLabel`, `%NameIcon`, `%NameContainer`
- [ ] Theme overrides documented
- [ ] Custom minimum sizes set for interactive elements
- [ ] Mouse filter properly set (stop/pass/ignore)

## Security Considerations
### Server Data Validation
- [ ] All data from ServerConnector validated before use
- [ ] Null checks on user data before accessing properties
- [ ] Type checking for stats data (int, not string)

### Input Sanitization
- [ ] Player names from GameState sanitized before display
- [ ] No direct string concatenation for SQL or commands
- [ ] Use parameterized methods only

### Resource Access
- [ ] Only load resources from `res://` paths
- [ ] No external URL loading without validation
- [ ] Icon paths verified exist before load

## Monitoring & Observability
### Logging Strategy
- **Debug Level:** Detailed state changes (connect/disconnect, region changes)
- **Info Level:** Feature usage (badge clicks, inventory opens)
- **Warning Level:** Graceful degradations (null data, fallback values)
- **Error Level:** Crashes, exceptions, failed operations

### Logging Format
```gdscript
print("[SideHUD] %s: %s" % [action, details])
```

### Analytics Events
- `hud_badge_clicked` - Badge type, count
- `hud_inventory_opened` - Current slots usage
- `hud_settings_opened` - Quick menu usage
- `hud_combat_indicator_shown` - Combat start

### Error Tracking
- Track null reference exceptions in timer callbacks
- Track signal connection failures
- Track resource load failures

## Definition of Done (DoD)
### Code Complete
- [ ] All TEST/IMPLEMENT/VERIFY items checked
- [ ] Code compiles without errors
- [ ] No linting warnings
- [ ] Type hints used where applicable

### Tests Complete
- [ ] Manual testing performed for all acceptance criteria
- [ ] Edge cases tested (null data, offline, etc.)
- [ ] Performance within budget verified
- [ ] Accessibility requirements met

### Documentation Complete
- [ ] Code comments added for complex logic
- [ ] README updated if needed
- [ ] Translation keys documented

### Review Complete
- [ ] Code reviewed by at least one team member
- [ ] All review comments addressed
- [ ] No blocking issues remaining

### Deployment Ready
- [ ] Feature flagged ready for release
- [ ] Rollback plan tested
- [ ] Analytics events registered

## UI/UX Design References
### Sidebar Layout (ASCII Wireframe)
```
+----------------------------+
| ⚡ Vitality          [Icon]|  <- Feature 4
| ❤️ HP                 [Icon]|  <- Feature 4
| 💙 MP                 [Icon]|  <- Feature 4
|---------------------------|
| 🟢 Connection        45ms |  <- Feature 2
| 🏰 TOWN             X:0 Y:0|  <- Feature 3
| 🔥 7                 🎁    |  <- Feature 4
| ☀️ 14:30                    |  <- Feature 6
| 🎒 5/50                     |  <- Feature 11
| ⚔️ COMBAT           3/5    |  <- Feature 15
|---------------------------|
| 🤴 HERO                    |  <- Existing
| 👥 PARTY                   |  <- Existing
| 📜 QUESTS                  |  <- Existing
| 🗺️ WORLD                   |  <- Existing
| 🏰 TOWN                    |  <- Existing
| 🎒 BAG              [Badge]|  <- Feature 1
| 🏛️ GUILD                   |  <- Existing
|---------------------------|
| 👥 Friends (3)             |  <- Feature 7
| ⚙️ Settings         [Badge]|  <- Feature 14
| 🚀 60 FPS | 45ms           |  <- Feature 16
+----------------------------+
```

### Color Palette
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Badge BG | Red | #E53935 | Notification badges |
| Online | Green | #4CAF50 | Status indicators |
| Away | Yellow | #FFC107 | AFK status |
| Combat | Red | #F44336 | Combat warning |
| VIP Gold | Gold | #FFD700 | Premium users |
| Text Normal | White | #FFFFFF | Primary text |
| Text Muted | Gray | #9E9E9E | Secondary text |
| Background | Dark Brown | #0D0C0B | Sidebar bg |
| Border | Gold Dim | #99804D | Panel borders |

### Typography
- **Primary Font:** Default Godot font (Inter/Roboto)
- **Badge Text:** Size 10pt, Bold
- **Labels:** Size 9pt, Regular
- **Headers:** Size 11pt, Medium

## Common Code Patterns
### Timer Setup Pattern
```gdscript
var _timer: Timer

func _ready():
    _timer = Timer.new()
    _timer.wait_time = 1000  # milliseconds
    _timer.timeout.connect(_on_timer_timeout)
    add_child(_timer)
    _timer.start()

func _on_timer_timeout():
    # Update logic here
    pass

func _exit_tree():
    if _timer:
        _timer.queue_free()
```

### Signal Connection Pattern
```gdscript
func _ready():
    # Connect to signals
    ServerConnector.socket_connected.connect(_on_connected)
    ServerConnector.socket_disconnected.connect(_on_disconnected)
    GameState.region_changed.connect(_on_region_changed)

func _on_connected():
    _update_connection_status(true)

func _on_disconnected():
    _update_connection_status(false)

func _on_region_changed(_data):
    _update_region_display()
```

### Badge Update Pattern
```gdscript
func update_badge_count(btn_key: String, count: int):
    var badge = get_node_or_null("%" + btn_key + "Badge")
    if badge:
        badge.visible = count > 0
        badge.text = str(count)
    print("[SideHUD] Badge updated: %s = %d" % [btn_key, count])
```

### Tween Animation Pattern
```gdscript
func _animate_streak_change(new_streak: int):
    var tween = create_tween()
    tween.set_parallel(false)
    tween.tween_property(streak_count_label, "scale", Vector2(1.3, 1.3), 0.2)
    tween.tween_property(streak_count_label, "scale", Vector2(1.0, 1.0), 0.2)
```

### Null-Safe Data Access Pattern
```gdscript
func _update_streak_display():
    var user = GameState.current_user
    if not user:
        streak_count_label.text = "0"
        return
    
    var streak = user.get("loginStreak", 0)
    streak_count_label.text = str(streak)
```

## Integration Testing Plan
### Cross-Feature Tests
| Test Case | Features Involved | Expected Result |
|-----------|-------------------|-----------------|
| Badge shows during combat | Feature 1, 15 | Badge visible, combat indicator active |
| Settings open from sidebar | Feature 14, UIManager | Settings overlay opens correctly |
| VIP badge in combat | Feature 8, 15 | Both indicators visible, no conflicts |
| Friend list during combat | Feature 7, 15 | Friend list still interactive |
| Performance indicator under load | Feature 16, all | FPS updates accurately |

### UI Integration Tests
| Test Case | UI Components | Expected Result |
|-----------|---------------|-----------------|
| Sidebar with existing nav | Feature 2-16, existing nav | No layout breaks |
| Tooltip positioning | Feature 5, 8, 14 | Tooltips stay on screen |
| Click through panels | All features | Click events pass through correctly |

### Data Flow Tests
| Test Case | Data Source | Expected Result |
|-----------|--------------|-----------------|
| Server disconnect handling | ServerConnector, Feature 2 | All indicators show offline state |
| Region change update | GameState, Feature 3 | Region display updates within 100ms |
| Login streak refresh | GameState, Feature 4 | Streak updates on login |

## Communication Plan
### Daily Standup Updates
- **Format:** What did, What doing, Blockers
- **Channel:** #sidehud-dev (Slack/Discord)
- **Time:** 10:00 AM local time

### Weekly Review Demos
- **Frequency:** Every Friday
- **Attendees:** Team lead, developers, QA
- **Deliverable:** Demo of completed features

### Phase Completion Reviews
- **Frequency:** End of each phase
- **Attendees:** All stakeholders
- **Deliverable:** Sign-off on phase completion

### Issue Reporting
- **Bug Reports:** #sidehud-bugs
- **Feature Requests:** #sidehud-features
- **Urgent Issues:** Tag @lead-developer

### Point of Contact
- **Project Lead:** [Name]
- **Tech Lead:** [Name]
- **QA Lead:** [Name]

---

## API/Data Contract Specifications
### GameState Methods Required
| Method | Return Type | Parameters | Description |
|--------|-------------|------------|-------------|
| `get_online_friends()` | Array[Dictionary] | None | Returns list of friends with status: `{"id": int, "name": String, "avatar_path": String, "status": String, "is_party": bool}` |
| `get_pending_friend_requests()` | Array[Dictionary] | None | Returns list of pending requests: `{"from_id": int, "from_name": String}` |
| `get_game_time()` | Dictionary | None | Returns: `{"hour": int, "minute": int, "day": int, "speed": int}` |
| `set_time_speed(speed: int)` | void | speed (1, 2, 4) | Sets time multiplier |
| `get_current_weather()` | String | None | Returns weather type: "sunny", "rainy", "stormy", "snowy", etc. |
| `is_in_combat()` | bool | None | Returns true if player is in combat |
| `get_enemies_remaining()` | int | None | Returns count of enemies remaining |
| `toggle_combat_sounds()` | void | None | Toggles combat sound effects |
| `get_current_region()` | Dictionary | None | Returns region data with weather info |
| `get_unread_achievements()` | Array[Dictionary] | None | Returns list of recently unlocked achievements |
| `clear_achievement_notifications()` | void | None | Clears achievement badge |
| `get_title_rarity()` | String | None | Returns title rarity: "common", "rare", "epic", "legendary" |
| `get_used_slots()` | int | None | Returns current inventory slot usage |
| `get_max_slots()` | int | None | Returns maximum inventory slots |
| `get_current_faction()` | Dictionary | None | Returns faction data: `{"id": int, "name": String, "reputation": int}` |

### ServerConnector Methods Required
| Method | Return Type | Parameters | Description |
|--------|-------------|------------|-------------|
| `get_last_ping()` | int | None | Returns ping in milliseconds, or 0 if disconnected |
| `reconnect()` | void | None | Attempts to reconnect to server |
| `fetch_unit_stats(hero_id: int)` | void | hero_id | Fetches stats for specified hero |

### Inventory Methods Required
| Method | Return Type | Parameters | Description |
|--------|-------------|------------|-------------|
| `sort()` | void | None | Sorts inventory items |

---

## Animation Specifications
### General Animation Rules
| Property | Value | Notes |
|----------|-------|-------|
| Fade duration | 0.2s | Opacity transitions |
| Scale duration | 0.15s | Button press effects |
| Color transition | 0.3s | State changes |
| Pulse period | 1.0s | Continuous animations |
| Default easing | TRANS_SINE + EASE_IN_OUT | Smooth, natural feel |
| Fast transitions | TRANS_LINEAR | Timer-based updates |

### Tween Configurations by Feature
| Feature | Animation Type | Tween Settings | Duration |
|---------|---------------|----------------|----------|
| Badge count change | Scale | `set_trans(TRANS_ELASTIC).set_ease(EASE_OUT)` | 0.2s |
| Combat indicator pulse | Color + Scale | `set_trans(SINE).set_ease(IN_OUT)` | 0.5s loop |
| VIP badge glow | Modulate | `set_trans(SINE).set_ease(IN_OUT)` | 1.5s loop |
| Streak change | Scale | `set_trans(BOUNCE).set_ease(OUT)` | 0.3s |
| Connection status | Color | `set_trans(SINE).set_ease(IN)` | 0.2s |
| Reputation flash | Modulate | `set_trans(SINE).set_ease(OUT)` | 0.3s |
| Weather icon change | Fade | `set_trans(EXPO).set_ease(OUT)` | 0.15s |

### Animation Cleanup
```gdscript
func _cleanup_tween(tween: Tween):
    if tween and is_instance_valid(tween):
        tween.kill()
    tween = null
```

---

## Technical Architecture Diagram
### Component Hierarchy
```
SideHUD (CanvasLayer)
├── UIRoot (Control)
│   ├── SidebarPanel (PanelContainer)
│   │   └── Layout (VBoxContainer)
│   │       ├── ResourceSection (PanelContainer)
│   │       │   └── VBox
│   │       │       ├── ConnectionStatus
│   │       │       ├── RegionInfo
│   │       │       ├── LoginStreak
│   │       │       ├── TimeDisplay
│   │       │       ├── BuffDisplay
│   │       │       ├── VIPBadge
│   │       │       ├── BagIndicator
│   │       │       ├── FactionDisplay
│   │       │       └── WeatherDisplay
│   │       ├── NavSection (VBoxContainer)
│   │       │   ├── HeroBtn + Badge
│   │       │   ├── PartyBtn + Badge
│   │       │   ├── QuestBtn + Badge
│   │       │   ├── WorldBtn
│   │       │   ├── TownBtn
│   │       │   ├── BagBtn + Badge
│   │       │   └── GuildBtn + Badge
│   │       ├── FriendsSection (VBoxContainer)
│   │       │   └── FriendsList
│   │       ├── CombatIndicator
│   │       ├── SettingsBtn
│   │       └── PerfIndicator
│   └── TooltipLayer (CanvasLayer - for tooltips)
```

### Signal Flow Diagram
```
ServerConnector ──connected──> SideHUD._update_connection_status()
                    └──disconnected──> SideHUD._update_connection_status()

GameState ──region_changed──> SideHUD._update_region_display()
          ──quest_updated──> SideHUD._on_quest_updated()
          ──mail_received──> SideHUD._on_mail_received()
          ──achievement_unlocked──> SideHUD._on_achievement_unlocked()

UIManager ──overlay_opened──> SideHUD._highlight_active_menu()
         └──overlay_closed──> SideHUD._highlight_active_menu()

SideHUD._update_combat_stats() ──> ServerConnector.fetch_unit_stats()
```

---

## Fallback/Mock Data Strategy
### Feature-Specific Fallbacks
| Feature | Normal Data | Fallback When | Fallback Value |
|---------|-------------|---------------|----------------|
| Connection Status | ServerConnector ping | Disconnected/no server | `"--ms"`, red icon |
| Region Display | `GameState.current_region_data` | No data/loading | `"🏰 UNKNOWN"` |
| Login Streak | `user.loginStreak` | No user/not logged in | `"🔥 0"` |
| Buffs Display | `hero.activeBuffs` | No hero/empty | Empty container |
| Time Display | `GameState.get_game_time()` | Error/uninitialized | `"00:00"`, "Day 1" |
| Online Friends | `GameState.get_online_friends()` | Error | Empty list, "No friends" message |
| VIP Badge | `user.isVip` | No user/not VIP | Hidden |
| Achievements | `GameState.get_unread_achievements()` | No achievements | Badge hidden |
| Title Display | `user.title` | No title | Hidden or "Novice" |
| Bag Slots | `Inventory.get_used_slots()` | No inventory | "0/0" |
| Faction Rep | `GameState.current_faction` | No faction | "⚔️ Neutral" |
| Weather | `GameState.get_current_weather()` | No region | "☀️ Clear" |
| Combat Indicator | `GameState.is_in_combat()` | Error | Hidden |
| Performance | `Engine.get_fps()` | Error | "-- FPS" |

### Mock Data for Development
```gdscript
# Example mock data for testing
const MOCK_FRIENDS = [
    {"id": 1, "name": "PlayerOne", "avatar_path": "res://avatars/p1.png", "status": "online", "is_party": true},
    {"id": 2, "name": "CraftMaster", "avatar_path": "res://avatars/p2.png", "status": "away", "is_party": false},
    {"id": 3, "name": "DragonSlayer", "avatar_path": "res://avatars/p3.png", "status": "online", "is_party": false}
]

const MOCK_BUFFS = [
    {"id": 1, "name": "Strength", "duration": 300, "icon": "💪"},
    {"id": 2, "name": "Speed", "duration": 180, "icon": "⚡"}
]

const MOCK_REGION = {
    "name": "Ancient Forest",
    "visualType": "FOREST",
    "x": 123,
    "y": 456
}
```

### Fallback Toggle
```gdscript
# Enable mock data for development
const USE_MOCK_DATA = true  # Set to false in production

func _get_online_friends():
    if USE_MOCK_DATA:
        return MOCK_FRIENDS
    return GameState.get_online_friends()
```

---

## Theming Guide
### StyleBoxFlat Reuse Strategy
| Resource Name | Base Style | Reused By |
|---------------|------------|-----------|
| `StyleBoxFlat_sidebar` | Base bg | SidebarPanel background |
| `StyleBoxFlat_res_bg` | Resource bg | ResourceSection background |
| `StyleBoxFlat_bar_bg` | Bar bg | HPBar, VitBar, MPBar backgrounds |
| `StyleBoxFlat_badge_bg` | Badge bg | QuestBtnBadge, GuildBadge |
| `StyleBoxFlat_status_online` | Online bg | Status dot backgrounds |
| `StyleBoxFlat_combat_pulse` | Combat bg | Combat indicator fill |

### Custom Theme Constants
```gdscript
# Theme.tres constants for SideHUD
const THEME_BORDER_COLOR = Color(0.6, 0.5, 0.3, 0.3)
const THEME_BG_DARK = Color(0.05, 0.04, 0.03, 0.9)
const THEME_BG_LIGHT = Color(0, 0, 0, 0.3)
const THEME_HIGHLIGHT = Color(1.5, 1.3, 0.8)
const THEME_WARNING = Color(1.0, 0.8, 0.2)
const THEME_DANGER = Color(1.0, 0.3, 0.3)
const THEME_SUCCESS = Color(0.3, 0.8, 0.4)
```

### Font Size Standards
| Usage | Size (pt) | Size (px) | Font Setting |
|-------|-----------|-----------|--------------|
| Badge numbers | 10 | 13 | Bold |
| Icons | 12 | 16 | Regular |
| Labels | 9 | 12 | Regular |
| Headers | 11 | 15 | Medium |
| Status text | 10 | 13 | Regular |

---

## Tooltip System Specifications
### Tooltip Content by Feature
| Feature | Tooltip Title | Tooltip Body | Position |
|---------|---------------|--------------|----------|
| Connection | "Connection Status" | "🟢 Connected - 45ms\nClick to see details" | Below indicator |
| Region | "{Region Name}" | "Type: {visualType}\nCoordinates: X:{x} Y:{y}" | Below region info |
| Login Streak | "Daily Streak" | "🔥 Day {streak}\nClick to claim bonus" | Below streak |
| Buffs | "{Buff Name}" | "Duration: {time remaining}s\nEffect: {description}" | Right of buff |
| Time | "In-Game Time" | "{hour}:{minute} - Day {day}\nSpeed: {speed}x" | Below time |
| Friends | "{Friend Name}" | "Status: {status}\nClass: {class}" | Right of avatar |
| VIP | "VIP Premium" | "Expires: {date}\nBenefits: ..." | Below badge |
| Title | "{Title Name}" | "Rarity: {rarity}\nClick to change" | Below title |
| Bag | "Inventory" | "{used}/{max} slots\n{percent}% full" | Below bag |
| Faction | "{Faction Name}" | "Reputation: {rep}\nTier: {tier}" | Below faction |
| Weather | "{Weather Name}" | "Effect: {effect}\nDanger: {danger_level}" | Below weather |
| Combat | "Combat Mode" | "Enemies: {remaining}/{total}\nClick to toggle sounds" | Below combat |
| Settings | "Settings" | "Left-click: Open settings\nRight-click: Quick menu" | Below button |
| Performance | "Performance" | "FPS: {fps}\nPing: {ms}ms" | Below indicator |

### Tooltip Styling
```gdscript
# Tooltip default style
var tooltip_style = StyleBoxFlat.new()
tooltip_style.bg_color = Color(0.1, 0.1, 0.1, 0.95)
tooltip_style.border_width_left = 1
tooltip_style.border_width_top = 1
tooltip_style.border_width_right = 1
tooltip_style.border_width_bottom = 1
tooltip_style.border_color = Color(0.5, 0.5, 0.5, 0.5)
tooltip_style.corner_radius_top_left = 4
tooltip_style.corner_radius_top_right = 4
tooltip_style.corner_radius_bottom_right = 4
tooltip_style.corner_radius_bottom_left = 4
tooltip_style.content_margin_left = 8
tooltip_style.content_margin_top = 6
tooltip_style.content_margin_right = 8
tooltip_style.content_margin_bottom = 6
```

### Tooltip Positioning Rules
| Condition | Position | Offset |
|-----------|----------|--------|
| Near right edge | Left of cursor | -10px |
| Near bottom edge | Above cursor | -10px |
| Near left edge | Right of cursor | +10px |
| Near top edge | Below cursor | +10px |
| Default | Right of cursor | +15px |

---

## Keyboard Shortcuts Matrix
### SideHUD-Specific Hotkeys
| Key Combination | Action | Feature | Mode |
|----------------|--------|---------|------|
| `B` | Open Bag | Feature 1 | Any |
| `C` | Toggle Combat Sounds | Feature 15 | Combat only |
| `H` | Open Hero | Existing | Any |
| `P` | Open Party | Existing | Any |
| `Q` | Open Quests | Existing | Any |
| `M` | Open Map/World | Existing | Any |
| `T` | Open Town/Region | Existing | Any |
| `G` | Open Guild | Existing | Any |
| `I` | Toggle Inventory | Feature 1 | Any |
| `S` | Open Settings | Feature 14 | Any |
| `Ctrl+F` | Toggle FPS Display | Feature 16 | Any |
| `Ctrl+T` | Cycle Time Speed | Feature 6 | Any |

### Reserved Hotkeys (Do Not Use)
| Key | Reserved For |
|-----|---------------|
| `Esc` | Close overlay/menu |
| `Tab` | Focus navigation |
| `Enter` | Confirm action |
| `Space` | Primary action |
| `1-9` | Quick slot selection |
| `0` | Ultimate ability |

### Implementation
```gdscript
func _input(event: InputEvent):
    if event is InputEventKey and event.pressed:
        match event.keycode:
            KEY_B:
                _on_nav_pressed("Bag")
            KEY_S:
                _on_settings_pressed()
            KEY_I:
                if not UIManager.is_overlay_open("Inventory"):
                    UIManager.open_overlay("Inventory", "res://src/ui/InventoryScreen.tscn")
                else:
                    UIManager.close_overlay("Inventory")
            KEY_F if event.ctrl_pressed:
                _perf_visible = !_perf_visible
                _update_perf_visibility()
            KEY_T if event.ctrl_pressed:
                _cycle_time_speed()
```

---

## Checklist (TDD-first, actionable)

### Feature 1: Quick Notifications Badge System
- [ ] Add BadgeContainer di setiap nav button (QuestBtn, GuildBtn, BagBtn)
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/NavSection/{BtnName}/BadgePanel`
  - TEST: Tambahin Label/Panel kecil di corner kanan atas button dengan background merah (Color 0.9, 0.2, 0.2, 1), visibility based on count
  - IMPLEMENT: Add node BadgeLabel dengan style badge_background, text "", custom_minimum_size: Vector2(18, 18), horizontal_alignment: 1, vertical_alignment: 1
  - VERIFY: Compile scene tanpa error, badge visible jika count > 0, hidden jika count == 0

- [ ] Add update_badge_count() method di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%QuestBtnBadge`, `%GuildBtnBadge`, `%BagBtnBadge`
  - TEST: Panggil method dengan key "QuestBtn" dan value 5, label show "5"
  - IMPLEMENT: Add func update_badge_count(btn_key: String, count: int): var badge = get_node_or_null("%" + btn_key + "Badge"); if badge: badge.visible = count > 0; badge.text = str(count)
  - VERIFY: Console print "[HUD] Badge updated: QuestBtn = 5", label text berubah sesuai parameter

- [ ] Connect badge signals dari GameState/UIManager
  - Files: `client/src/ui/SideHUD.gd`
  - Signals: GameState.quest_updated, GameState.mail_received, UIManager.achievement_unlocked
  - TEST: Trigger event quest_completed, badge QuestBtn update ke value baru
  - IMPLEMENT: Add signal connections di _listen_for_state_changes(): GameState.quest_updated.connect(_on_quest_updated); GameState.mail_received.connect(_on_mail_received)
  - VERIFY: Badge muncul/hilang sesuai state changes, badges reset ke 0 setelah di-click

- [ ] Add badge click-to-clear functionality
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/NavSection/{BtnName}/BadgePanel`
  - TEST: Click badge, count reset ke 0
  - IMPLEMENT: Add gui_input signal handler: badge.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: clear_badge(btn_key))
  - VERIFY: Click badge clears notification

---

### Feature 2: Server/Connection Status Indicator
- [ ] Add ConnectionStatus node di ResourceSection bottom
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/ConnectionStatus`
  - Style: HBoxContainer dengan custom_minimum_size: Vector2(120, 20), theme_override_constants/separation: 4
  - TEST: Add HBoxContainer dengan icon (🟢/🔴) dan ping label
  - IMPLEMENT: Add StatusIndicator HBox dengan 2 child: StatusIcon (Label, text="🟢", font_size: 10) dan PingLabel (Label, text="--ms", font_size: 9, font_color: Color(0.7, 0.7, 0.7))
  - VERIFY: Indicator visible, default state connected (green)

- [ ] Add connection monitoring di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%StatusIcon`, `%PingLabel`
  - TEST: Buat _update_connection_status(connected: bool) method, panggil dari _ready
  - IMPLEMENT: Add @onready var status_icon = %StatusIcon, ping_label = %PingLabel; Add func _update_connection_status(connected: bool): status_icon.text = "🟢" if connected else "🔴"; status_icon.modulate = Color(1, 1, 1) if connected else Color(1, 0.3, 0.3)
  - VERIFY: Indicator berubah warna saat socket disconnect/reconnect

- [ ] Add ServerConnector signal connection
  - Files: `client/src/ui/SideHUD.gd`
  - Signals: ServerConnector.socket_connected, ServerConnector.socket_disconnected
  - TEST: Socket disconnect, icon berubah ke merah
  - IMPLEMENT: Add di _listen_for_state_changes(): ServerConnector.socket_connected.connect(func(): _update_connection_status(true)); ServerConnector.socket_disconnected.connect(func(): _update_connection_status(false))
  - VERIFY: Auto-update saat socket events

- [ ] Add ping display dengan periodic update
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%PingLabel`
  - TEST: Show numeric ping value (e.g., "45ms")
  - IMPLEMENT: Add var _ping_timer: Timer = Timer.new(); func _get_ping_ms() -> int: return ServerConnector.get_last_ping() if ServerConnector else 0; func _on_ping_timer_timeout(): ping_label.text = str(_get_ping_ms()) + "ms"
  - VERIFY: Ping value update setiap 5 detik, shows "--ms" saat disconnected

- [ ] Add click untuk reconnect
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/ConnectionStatus`
  - TEST: Click indicator saat disconnected, trigger reconnect
  - IMPLEMENT: Add gui_input signal: connection_status.gui_input.connect(func(e): if not connected and e is InputEventMouseButton and e.pressed: ServerConnector.reconnect())
  - VERIFY: Click reconnect button works

---

### Feature 3: Region/Location Mini-Display
- [ ] Add RegionInfo section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/RegionInfo`
  - Style: VBoxContainer dengan theme_override_constants/separation: 2
  - TEST: Add VBoxContainer dengan region icon dan region name label
  - IMPLEMENT: Add RegionInfo VBox dengan child: RegionIconLabel (Label, font_size: 12, text="🏰") dan RegionNameLabel (Label, font_size: 9, text="Town", font_color: Color(0.8, 0.8, 0.8))
  - VERIFY: Display show "🏰 Town" saat di town, atau "🌲 Forest" saat di field

- [ ] Add region update logic di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%RegionIconLabel`, `%RegionNameLabel`
  - TEST: Panggil _update_region_display() saat region_changed signal emit
  - IMPLEMENT: Add @onready var region_icon_label = %RegionIconLabel, region_name_label = %RegionNameLabel; Add func _update_region_display(): var region = GameState.current_region_data; if region: region_icon_label.text = _get_region_type_icon(region.get("visualType", "TOWN")); region_name_label.text = region.get("name", "Unknown").to_upper()
  - VERIFY: Region display update saat player teleport/change region

- [ ] Add coordinates display
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/RegionInfo/CoordLabel`
  - TEST: Show X:123 Y:456 format
  - IMPLEMENT: Add CoordLabel (Label, font_size: 8, font_color: Color(0.5, 0.5, 0.5)); Add di _update_region_display(): coord_label.text = "X:%d Y:%d" % [region.get("x", 0), region.get("y", 0)]
  - VERIFY: Coordinates update saat movement

- [ ] Add click untuk open WorldAtlas
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/RegionInfo`
  - TEST: Click region info, open WorldAtlas
  - IMPLEMENT: Add gui_input signal: region_info.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn"))
  - VERIFY: Click navigates to World Atlas

- [ ] Add region type icon mapping
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Region FOREST show 🌲 icon
  - IMPLEMENT: Add func _get_region_type_icon(type: String) -> String: match type: "FOREST": return "🌲"; "MINE": return "⛏️"; "CAVE": return "💎"; "DUNGEON": return "💀"; "RUINS": return "🏛️"; "SWAMP": return "🐊"; "DESERT": return "🏜️"; "VOLCANO", "LAVA": return "🌋"; "SNOW", "ICE": return "❄️"; "OCEAN": return "🌊"; "GARDEN": return "🌿"; _: return "🚩"

---

### Feature 4: Daily Login Streak Display
- [ ] Add LoginStreak section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/LoginStreak`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add HBoxContainer dengan streak icon (🔥) dan streak count label
  - IMPLEMENT: Add LoginStreak HBox dengan child: StreakIconLabel (Label, text="🔥", font_size: 11) dan StreakCountLabel (Label, text="0", font_size: 10, font_color: Color(1, 0.8, 0.3))
  - VERIFY: Display show "🔥 7" untuk streak 7 hari

- [ ] Add loginStreak data access di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%StreakIconLabel`, `%StreakCountLabel`
  - TEST: Ambil loginStreak dari GameState.current_user
  - IMPLEMENT: Add @onready var streak_icon_label = %StreakIconLabel, streak_count_label = %StreakCountLabel; Add func _update_streak_display(): var user = GameState.current_user; var streak = user.get("loginStreak", 0) if user else 0; streak_count_label.text = str(streak)
  - VERIFY: Streak display update saat login

- [ ] Add streak bonus indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/LoginStreak/BonusLabel`
  - TEST: Show bonus info jika streak >= 7 hari
  - IMPLEMENT: Add BonusLabel (Label, text="🎁", font_size: 10, visible=false); Add di _update_streak_display(): bonus_label.visible = streak >= 7
  - VERIFY: Bonus indicator visible jika streak >= 7

- [ ] Add click untuk claim bonus
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/LoginStreak`
  - TEST: Click streak, claim daily bonus
  - IMPLEMENT: Add gui_input signal: login_streak.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: _claim_daily_bonus()); Add func _claim_daily_bonus(): if streak >= 7: ServerConnector.claim_daily_bonus(); streak = 0; update display
  - VERIFY: Bonus claimed, streak resets

- [ ] Add streak animation on update
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Streak count animates when increasing
  - IMPLEMENT: Add func _animate_streak_change(new_streak: int): var tween = create_tween(); tween.tween_property(streak_count_label, "scale", Vector2(1.3, 1.3), 0.2); tween.tween_property(streak_count_label, "scale", Vector2(1.0, 1.0), 0.2)
  - VERIFY: Visual feedback on streak change

---

### Feature 5: Buff/Debuff Status Display
- [ ] Add BuffContainer section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BuffContainer`
  - Style: HBoxContainer dengan theme_override_constants/separation: 2, custom_minimum_size: Vector2(100, 20)
  - TEST: Add HBoxContainer max 5 buff icons
  - IMPLEMENT: Add BuffDisplay HBox dengan container untuk 5 icons. Each buff slot: TextureRect atau Label dengan custom_minimum_size: Vector2(18, 18)
  - VERIFY: Show buff icons saat aktif, scroll jika > 5 buffs

- [ ] Add buff update logic di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%BuffContainer`
  - TEST: Ambil active buffs dari GameState.current_hero
  - IMPLEMENT: Add @onready var buff_container = %BuffContainer; Add func _update_buffs_display(): var hero = GameState.current_heroes[0] if GameState.current_heroes.size() > 0 else null; var buffs = hero.get("activeBuffs", []) if hero else []; clear_buffs(); for buff in buffs: add_buff_icon(buff)
  - VERIFY: Buff icons update saat status change

- [ ] Add debuff icons (different color/style)
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BuffContainer/DebuffContainer`
  - TEST: Show debuffs dengan red tint
  - IMPLEMENT: Add separate debuff container atau tint logic: func add_debuff_icon(debuff): var icon = create_icon(debuff.icon); icon.modulate = Color(1, 0.4, 0.4); buff_container.add_child(icon)
  - VERIFY: Debuffs visible dan berbeda dari buffs (red tint)

- [ ] Add buff tooltip on hover
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BuffTooltip`
  - TEST: Hover buff icon, show tooltip dengan nama dan durasi
  - IMPLEMENT: Add Tooltip Panel (PanelContainer) dengan Label di dalam. Add mouse_entered/mouse_exited signals pada setiap buff icon
  - VERIFY: Tooltip shows correct buff info

- [ ] Add buff duration countdown
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Show remaining time pada buff icon
  - IMPLEMENT: Add var _buff_timer: Timer = Timer.new(); func _on_buff_timer_timeout(): update_all_buff_durations(); Add func add_buff_icon(buff): var icon = Label.new(); icon.text = buff.icon; var remaining = buff.get("duration", 0); if remaining > 0: icon.text += "\n%d" % [remaining / 1000]
  - VERIFY: Duration countdown visible pada timed buffs

- [ ] Add buff expiration handling
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Buff removed saat expired
  - IMPLEMENT: Add di _on_buff_timer_timeout(): for buff in buffs: if buff.duration <= 0: remove_buff(buff); Call ServerConnector.fetch_unit_stats() untuk refresh
  - VERIFY: Auto-remove expired buffs

---

### Feature 6: Time Display (In-Game Clock)
- [ ] Add TimeDisplay section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/TimeDisplay`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add Label show "14:30" format
  - IMPLEMENT: Add TimeLabel (Label, text="00:00", font_size: 11, font_color: Color(0.9, 0.9, 0.8)) dan optional DateLabel (Label, text="Day 1", font_size: 9)
  - VERIFY: Show correct in-game time

- [ ] Add time update timer di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%TimeLabel`, `%DateLabel`
  - TEST: Timer tick setiap 1 menit update display
  - IMPLEMENT: Add @onready var time_label = %TimeLabel, date_label = %DateLabel; Add var _time_timer: Timer = Timer.new(); func _update_time_display(): var time = GameState.get_game_time(); time_label.text = "%02d:%02d" % [time.hour, time.minute]; date_label.text = "Day %d" % [time.day]
  - VERIFY: Time updates automatically

- [ ] Add day/night indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/TimeDisplay/DayNightIcon`
  - TEST: Show ☀️/🌙 icon sesuai waktu
  - IMPLEMENT: Add DayNightIcon (Label, font_size: 12); Add func _update_daynight_icon(): var hour = GameState.get_game_time().hour; if hour >= 6 and hour < 18: icon.text = "☀️" else: icon.text = "🌙"
  - VERIFY: Icon changes sesuai cycle (☀️ 06:00-18:00, 🌙 18:00-06:00)

- [ ] Add time speed control
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/TimeDisplay`
  - TEST: Click time display, toggle time speed (1x/2x/4x)
  - IMPLEMENT: Add gui_input signal: time_display.gui_input.connect(_on_time_click); Add var _time_speed = 1; func _on_time_click(e): if e is InputEventMouseButton and e.pressed: _time_speed = [_time_speed * 2, 1, 2, 4][_time_speed % 4]; GameState.set_time_speed(_time_speed)
  - VERIFY: Time speed changes visual indicator

- [ ] Add time-based region effects
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Show warning untuk night-only monsters
  - IMPLEMENT: Add func _check_night_warnings(): var hour = GameState.get_game_time().hour; if hour >= 20 or hour < 5: show_night_warning() else: hide_night_warning()
  - VERIFY: Night warnings visible during dangerous hours

---

### Feature 7: Online Friends/Party Members
- [ ] Add FriendsSection di NavSection bottom
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/FriendsSection`
  - Style: VBoxContainer dengan theme_override_constants/separation: 2, custom_minimum_size: Vector2(0, 60)
  - TEST: Add VBoxContainer dengan 3-5 online friend avatars
  - IMPLEMENT: Add FriendsList VBox dengan header Label ("Friends", font_size: 9, font_color: Color(0.5, 0.5, 0.5)) dan container untuk avatars
  - VERIFY: Show online friends avatars

- [ ] Add friend status update di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%FriendsList`
  - TEST: Ambil online friends list dari GameState
  - IMPLEMENT: Add @onready var friends_list = %FriendsList; Add func _update_friends_display(): var online_friends = GameState.get_online_friends(); clear_friends(); for friend in online_friends.slice(0, 5): add_friend_avatar(friend)
  - VERIFY: Friends list update saat login/logout

- [ ] Add friend avatar display
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/FriendsSection/FriendsList/FriendAvatar_{n}`
  - TEST: Show friend avatar dengan status dot
  - IMPLEMENT: Add func add_friend_avatar(friend): var avatar = TextureRect.new(); avatar.texture = load(friend.avatar_path); avatar.custom_minimum_size = Vector2(24, 24); var status_dot = ColorRect.new(); status_dot.color = Color(0.2, 0.9, 0.2) if friend.status == "online" else Color(0.9, 0.9, 0.2); friends_list.add_child(avatar)
  - VERIFY: Green dot untuk online, yellow untuk away

- [ ] Add party member indicator (special highlight)
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/FriendsSection/FriendsList/PartyMember_{n}`
  - TEST: Party members show dengan golden border
  - IMPLEMENT: Add func add_party_member(member): var avatar = add_friend_avatar(member); avatar.modulate = Color(1, 0.9, 0.5); var party_icon = Label.new(); party_icon.text = "👑"; avatar.add_child(party_icon)
  - VERIFY: Party members highlighted dengan gold tint dan crown icon

- [ ] Add click untuk friend/party actions
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/FriendsSection/FriendsList/FriendAvatar_{n}`
  - TEST: Click avatar, show context menu
  - IMPLEMENT: Add gui_input signal pada setiap avatar: avatar.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: show_friend_menu(friend_id))
  - VERIFY: Context menu shows: Invite, Message, View Profile

- [ ] Add friend request badge
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/FriendsSection/FriendRequestBadge`
  - TEST: Show badge jika ada pending friend requests
  - IMPLEMENT: Add BadgeLabel (visible=false); Add var pending_requests = GameState.get_pending_friend_requests(); badge.visible = pending_requests.size() > 0; badge.text = str(pending_requests.size())
  - VERIFY: Badge visible untuk pending requests

---

### Feature 8: VIP/Premium Badge
- [ ] Add VIPBadge section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/VIPBadge`
  - Style: HBoxContainer dengan theme_override_constants/separation: 2
  - TEST: Add Label dengan "👑 VIP" atau gold badge
  - IMPLEMENT: Add VIPBadge HBox dengan child: VIPIcon (Label, text="👑", font_size: 12) dan VIPLabel (Label, text="VIP", font_size: 10, font_color: Color(1, 0.8, 0.2))
  - VERIFY: Badge visible untuk premium users

- [ ] Add VIP check di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%VIPBadge`
  - TEST: Ambil isVip dari GameState.current_user
  - IMPLEMENT: Add @onready var vip_badge = %VIPBadge; Add func _update_vip_display(): var user = GameState.current_user; var is_vip = user.get("isVip", false) if user else false; vip_badge.visible = is_vip
  - VERIFY: Badge visible/hide berdasarkan VIP status

- [ ] Add VIP expiry info
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/VIPBadge/VIPExpiryLabel`
  - TEST: Show "5 days left" jika mendekati expiry
  - IMPLEMENT: Add VIPExpiryLabel (Label, visible=false, font_size: 8, font_color: Color(1, 0.6, 0.6)); Add func _update_vip_expiry(): var expiry = user.get("vipExpiry", 0); if expiry > 0: var days = (expiry - Time.get_unix_time_from_system()) / 86400; if days <= 7: expiry_label.visible = true; expiry_label.text = "%.0fd left" % [days]
  - VERIFY: Expiry warning visible jika < 7 hari

- [ ] Add VIP glow animation
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/VIPBadge`
  - TEST: VIP badge pulses dengan gold glow
  - IMPLEMENT: Add func _animate_vip_badge(): var tween = create_tween().set_loops(); tween.tween_property(vip_badge, "modulate", Color(1, 0.9, 0.5), 1.0); tween.tween_property(vip_badge, "modulate", Color(1, 1, 1), 1.0)
  - VERIFY: Subtle pulsing animation for VIP badge

- [ ] Add VIP-only features indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/VIPBadge/VIPFeaturesHint`
  - TEST: Show tooltip tentang VIP benefits
  - IMPLEMENT: Add mouse_entered signal: vip_badge.mouse_entered.connect(func(): show_vip_tooltip()); Add func show_vip_tooltip(): UIManager.show_tooltip(vip_badge, "VIP Benefits:\n- 2x Exp\n- Exclusive Items\n- Premium Chat")
  - VERIFY: Tooltip shows benefits on hover

---

### Feature 9: Achievement Notification Badge
- [ ] Add AchievementBadge di NavSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/NavSection/AchievementBtn/AchievementBadge`
  - Style: PanelContainer dengan custom_minimum_size: Vector2(18, 18), theme_override_styles/panel: StyleBoxFlat(bg_color: Color(0.9, 0.3, 0.2, 1), corner_radius: 9)
  - TEST: Add small badge di AchievementBtn corner
  - IMPLEMENT: Add AchievementBadgeLabel (Label, text="", horizontal_alignment: 1, vertical_alignment: 1, font_size: 10, font_color: Color(1, 1, 1))
  - VERIFY: Badge visible jika ada achievement baru

- [ ] Add achievement check di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%AchievementBadge`
  - TEST: Ambil unread achievements count
  - IMPLEMENT: Add @onready var achievement_badge = %AchievementBadge; Add func _update_achievement_badge(): var unread = GameState.get_unread_achievements(); achievement_badge.visible = unread > 0; achievement_badge.text = str(unread)
  - VERIFY: Badge count sesuai unread

- [ ] Add achievement click handler
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/NavSection/AchievementBtn`
  - TEST: Click badge open achievements screen
  - IMPLEMENT: Add signal connection to AchievementBtn.pressed.connect(func(): UIManager.open_overlay("Achievements", "res://src/ui/AchievementScreen.tscn"); GameState.clear_achievement_notifications())
  - VERIFY: Click navigates correctly, clears badge

- [ ] Add achievement popup
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%AchievementPopup`
  - TEST: Achievement popup saat earn baru
  - IMPLEMENT: Add func _on_achievement_earned(achievement): show_popup(achievement.name, achievement.icon); badge.text = str(unread + 1)
  - VERIFY: Popup shows achievement details

- [ ] Add achievement sound
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Play sound saat achievement earned
  - IMPLEMENT: Add func _play_achievement_sound(): var sound = load("res://audio/achievement_unlocked.wav"); AudioServer.play_sound(sound)
  - VERIFY: Sound plays on achievement

---

### Feature 10: Title/Rank Display
- [ ] Add TitleDisplay section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/TitleDisplay`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add Label show current title (e.g., "Novice Knight")
  - IMPLEMENT: Add TitleLabel (Label, text="Novice", font_size: 10, font_color: Color(0.8, 0.9, 1.0)) dan optional TitleIcon (Label, text="📜", font_size: 11)
  - VERIFY: Show correct player title

- [ ] Add title update logic di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%TitleLabel`, `%TitleIcon`
  - TEST: Ambil title dari GameState.current_user
  - IMPLEMENT: Add @onready var title_label = %TitleLabel, title_icon = %TitleIcon; Add func _update_title_display(): var user = GameState.current_user; var title = user.get("title", "Novice") if user else "Novice"; title_label.text = title
  - VERIFY: Title updates when rank changes

- [ ] Add title click untuk open title selection
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/TitleDisplay`
  - TEST: Click title, open selection modal
  - IMPLEMENT: Add gui_input signal: title_display.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: UIManager.open_title_selector())
  - VERIFY: Title selector opens on click

- [ ] Add title rarity colors
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Different colors untuk different title rarities
  - IMPLEMENT: Add func _get_title_color(title: String) -> Color: var rarity = GameState.get_title_rarity(title); match rarity: "common": return Color(0.8, 0.8, 0.8); "rare": return Color(0.3, 0.6, 0.9); "epic": return Color(0.6, 0.3, 0.8); "legendary": return Color(1, 0.6, 0.1)
  - VERIFY: Title color matches rarity

---

### Feature 11: Bag Slots Indicator
- [ ] Add BagIndicator section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BagIndicator`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add Label show "5/50" format
  - IMPLEMENT: Add BagIcon (Label, text="🎒", font_size: 11) dan BagSlotsLabel (Label, text="0/0", font_size: 10, font_color: Color(0.8, 0.8, 0.8))
  - VERIFY: Show correct inventory usage

- [ ] Add bag update logic di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%BagIcon`, `%BagSlotsLabel`
  - TEST: Ambil bag slots dan max dari Inventory
  - IMPLEMENT: Add @onready var bag_icon = %BagIcon, bag_slots_label = %BagSlotsLabel; Add func _update_bag_display(): var current = Inventory.get_used_slots(); var max_slots = Inventory.get_max_slots(); bag_slots_label.text = "%d/%d" % [current, max_slots]
  - VERIFY: Updates when item added/removed

- [ ] Add warning color when full
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BagIndicator`
  - TEST: Show red text when >= 95%
  - IMPLEMENT: Add func _update_bag_colors(): var usage = float(current) / max_slots; if usage >= 0.95: bag_slots_label.font_color = Color(1, 0.3, 0.3); elif usage >= 0.8: bag_slots_label.font_color = Color(1, 0.8, 0.3); else: bag_slots_label.font_color = Color(0.8, 0.8, 0.8)
  - VERIFY: Warning visible saat inventory full

- [ ] Add click untuk open inventory
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BagIndicator`
  - TEST: Click indicator, open inventory overlay
  - IMPLEMENT: Add gui_input signal: bag_indicator.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: UIManager.open_overlay("Inventory", "res://src/ui/InventoryScreen.tscn"))
  - VERIFY: Opens inventory on click

- [ ] Add quick-sort button
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/BagIndicator/SortBtn`
  - TEST: Small sort icon, click sorts inventory
  - IMPLEMENT: Add SortBtn (Label, text="📦", font_size: 10, visible=false); bag_slots_label.gui_input.connect(func(e): if e is InputEventMouseButton and e.double_click: Inventory.sort(); update_display())
  - VERIFY: Double-click sorts inventory

---

### Feature 12: Faction Reputation Display
- [ ] Add FactionDisplay section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/FactionDisplay`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add Label show faction name dan standing
  - IMPLEMENT: Add FactionIcon (Label, text="⚔️", font_size: 11) dan FactionLabel (Label, text="Neutral", font_size: 9, font_color: Color(0.7, 0.7, 0.7))
  - VERIFY: Show correct reputation

- [ ] Add faction update logic di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%FactionIcon`, `%FactionLabel`
  - TEST: Ambil faction dan reputation dari GameState
  - IMPLEMENT: Add @onready var faction_icon = %FactionIcon, faction_label = %FactionLabel; Add func _update_faction_display(): var faction = GameState.current_faction; var rep = faction.get("reputation", 0) if faction else 0; faction_label.text = _get_reputation_tier(rep)
  - VERIFY: Updates when reputation changes

- [ ] Add reputation tier indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/FactionDisplay/TierBar`
  - TEST: Show icon for tier (Neutral, Friendly, Honored)
  - IMPLEMENT: Add TierBar (ProgressBar, custom_minimum_size: Vector2(60, 4), show_percentage=false); Add func _get_reputation_tier(rep: int) -> String: if rep >= 10000: return "Revered"; elif rep >= 6000: return "Honored"; elif rep >= 3000: return "Friendly"; elif rep >= 1000: return "Neutral"; elif rep >= 0: return "Stranger"; else: return "Hostile"
  - VERIFY: Tier icon matches reputation

- [ ] Add click untuk open faction screen
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/FactionDisplay`
  - TEST: Click, open faction details
  - IMPLEMENT: Add gui_input signal: faction_display.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: UIManager.open_overlay("Faction", "res://src/ui/FactionScreen.tscn"))
  - VERIFY: Opens faction screen

- [ ] Add reputation change animation
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Flash green/red saat rep change
  - IMPLEMENT: Add func _animate_reputation_change(delta: int): var color = Color(0.3, 1, 0.3) if delta > 0 else Color(1, 0.3, 0.3); var tween = create_tween(); tween.tween_property(faction_label, "modulate", color, 0.3); tween.tween_property(faction_label, "modulate", Color(1, 1, 1), 0.3)
  - VERIFY: Visual feedback on rep change

---

### Feature 13: Weather Indicator
- [ ] Add WeatherDisplay section di ResourceSection
  - Files: `client/src/ui/SideHUD.tscn`
  - TEST: Add Label show weather icon (☀️☀️🌧️❄️)
  - IMPLEMENT: Add WeatherLabel dengan style weather_display
  - VERIFY: Show correct weather

- [ ] Add weather update logic di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - TEST: Ambil current weather dari GameState.current_region
  - IMPLEMENT: Add @onready var weather_label; Add _update_weather_display()
  - VERIFY: Updates when weather changes

- [ ] Add weather effect indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/ResourceSection/WeatherDisplay/WeatherEffectLabel`
  - TEST: Show debuff icon jika dangerous weather
  - IMPLEMENT: Add WeatherEffectLabel (Label, visible=false); Add func _check_weather_dangers(): var weather = GameState.get_current_weather(); if weather in ["storm", "blizzard", "sandstorm"]: effect_label.visible = true; effect_label.text = _get_weather_debuff_icon(weather)
  - VERIFY: Warning visible untuk bad weather

---

### Feature 14: Settings Quick Access
- [ ] Add SettingsBtn di SidebarPanel bottom
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/SettingsBtn`
  - Style: Button atau TextureButton dengan icon ⚙️
  - TEST: Add small gear icon button ⚙️
  - IMPLEMENT: Add SettingsButton (Button, text="⚙️ Settings", icon=load("res://icon/settings.png"))
  - VERIFY: Button visible di sidebar

- [ ] Add settings open handler di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%SettingsBtn`
  - TEST: Click button open settings overlay
  - IMPLEMENT: Add @onready var settings_btn = %SettingsBtn; Add func _on_settings_pressed(): UIManager.open_overlay("Settings", "res://src/ui/SettingsScreen.tscn")
  - VERIFY: Settings overlay opens correctly

- [ ] Add settings context menu
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/SettingsBtn/PopupMenu`
  - TEST: Right-click, show quick options
  - IMPLEMENT: Add PopupMenu dengan items: "Audio", "Graphics", "Controls", "Exit Game"; Add settings_btn.gui_input.connect(func(e): if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_RIGHT and e.pressed: popup.show())
  - VERIFY: Quick menu shows on right-click

- [ ] Add hover tooltip
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%SettingsBtn`
  - TEST: Hover button, show tooltip
  - IMPLEMENT: Add mouse_entered signal: settings_btn.mouse_entered.connect(func(): UIManager.show_tooltip(settings_btn, "Settings\nRight-click for quick options"))
  - VERIFY: Tooltip shows on hover

---

### Feature 15: Combat Mode Indicator
- [ ] Add CombatIndicator section
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/CombatIndicator`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add Label "⚔️ COMBAT" saat dalam combat
  - IMPLEMENT: Add CombatIcon (Label, text="⚔️", font_size: 12) dan CombatLabel (Label, text="COMBAT", font_size: 10, font_color: Color(1, 0.3, 0.3))
  - VERIFY: Indicator visible saat combat

- [ ] Add combat state monitoring di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%CombatIndicator`, `%CombatIcon`, `%CombatLabel`
  - TEST: Ambil combat state dari GameState
  - IMPLEMENT: Add @onready var combat_indicator = %CombatIndicator, combat_icon = %CombatIcon, combat_label = %CombatLabel; Add func _update_combat_state(): var in_combat = GameState.is_in_combat(); combat_indicator.visible = in_combat
  - VERIFY: Indicator toggles saat combat start/end

- [ ] Add pulsing animation
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/CombatIndicator`
  - TEST: Label pulses saat combat
  - IMPLEMENT: Add func _animate_combat(): var tween = create_tween().set_loops(); tween.tween_property(combat_indicator, "modulate", Color(1, 0.5, 0.5), 0.5); tween.tween_property(combat_indicator, "modulate", Color(1, 1, 1), 0.5)
  - VERIFY: Animation plays during combat

- [ ] Add combat sound toggle
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%CombatIndicator`
  - TEST: Click indicator, toggle combat sounds
  - IMPLEMENT: Add gui_input signal: combat_indicator.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: GameState.toggle_combat_sounds())
  - VERIFY: Sound toggle works

- [ ] Add enemy count indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/CombatIndicator/EnemyCountLabel`
  - TEST: Show enemies remaining (e.g., "3/5")
  - IMPLEMENT: Add EnemyCountLabel (Label, visible=false); Add di _update_combat_state(): if in_combat: var enemies = GameState.get_enemies_remaining(); enemy_count.visible = enemies > 0; enemy_count.text = str(enemies)
  - VERIFY: Shows enemy count during combat

---

### Feature 16: Battery/Performance Indicator
- [ ] Add PerfIndicator section di SidebarPanel bottom
  - Files: `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/PerfIndicator`
  - Style: HBoxContainer dengan theme_override_constants/separation: 4
  - TEST: Add Label show "60 FPS | 45ms"
  - IMPLEMENT: Add FPSLabel (Label, text="-- FPS", font_size: 9, font_color: Color(0.5, 0.5, 0.5)) dan PingLabel (Label, text="--ms", font_size: 9, font_color: Color(0.5, 0.5, 0.5))
  - VERIFY: Show correct FPS dan ping

- [ ] Add performance monitoring di SideHUD.gd
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%FPSLabel`, `%PingLabel`
  - TEST: Timer tick every 1s update FPS display
  - IMPLEMENT: Add @onready var fps_label = %FPSLabel, perf_ping_label = %PingLabel; Add var _perf_timer: Timer = Timer.new(); func _update_perf_display(): fps_label.text = "%d FPS" % [Engine.get_frames_per_second()]; perf_ping_label.text = "%dms" % [ServerConnector.get_last_ping()]
  - VERIFY: FPS updates in real-time

- [ ] Add battery indicator
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/PerfIndicator/BatteryLabel`
  - TEST: Show battery icon dengan percentage
  - IMPLEMENT: Add BatteryLabel (Label, visible=OS.has_feature("mobile")); Add func _update_battery(): if OS.has_feature("mobile"): var battery = OS.get_power_percent(); battery_label.text = "🔋 %d%%" % [battery]
  - VERIFY: Battery visible on mobile devices

- [ ] Add performance toggle
  - Files: `client/src/ui/SideHUD.gd`, `client/src/ui/SideHUD.tscn`
  - Node Path: `UIRoot/SidebarPanel/Layout/PerfIndicator`
  - TEST: Click toggle performance display
  - IMPLEMENT: Add gui_input signal: perf_indicator.gui_input.connect(func(e): if e is InputEventMouseButton and e.pressed: _perf_visible = !_perf_visible; fps_label.visible = _perf_visible; perf_ping_label.visible = _perf_visible)
  - VERIFY: Toggle shows/hides performance info

- [ ] Add low FPS warning
  - Files: `client/src/ui/SideHUD.gd`
  - Node Path: `%FPSLabel`
  - TEST: FPS < 30, show red warning
  - IMPLEMENT: Add func _check_fps_warning(): var fps = Engine.get_frames_per_second(); if fps < 30: fps_label.font_color = Color(1, 0.3, 0.3); else: fps_label.font_color = Color(0.5, 0.5, 0.5)
  - VERIFY: Red warning when FPS is low

---

## Version History
| Version | Date | Author | Changes |
|---------|------|--------|----------|
| 1.0 | 2026-02-09 | [Name] | Initial plan creation |
| 1.1 | 2026-02-09 | [Name] | Added Features 1-4 (P0) |
| 1.2 | 2026-02-09 | [Name] | Added Features 5-8 (P1) |
| 1.3 | 2026-02-09 | [Name] | Added Features 9-12 (P2) |
| 1.4 | 2026-02-09 | [Name] | Added Features 13-16 (P3) |
| 1.5 | 2026-02-10 | [Name] | Added API specs, animation, architecture, theming, tooltips, shortcuts |
| 1.6 | 2026-02-10 | [Name] | Added data schema, state machine, error codes, known issues, future roadmap |

---

## Data Schema Specifications
### Server Response Schemas
| Data Type | Schema (JSON) | Example |
|-----------|---------------|---------|
| User Data | `{"id": int, "username": String, "vitality": int, "maxVitality": int, "silver": int, "gold": int, "isVip": bool, "vipExpiry": int, "loginStreak": int, "title": String}` | `{"id": 1, "username": "Player1", "vitality": 100, "maxVitality": 100, "silver": 500, "gold": 10, "isVip": true, "vipExpiry": 1735689600, "loginStreak": 7, "title": "Hero"}` |
| Hero Stats | `{"id": int, "hp": int, "maxHp": int, "mp": int, "maxMp": int, "activeBuffs": Array}` | `{"id": 1, "hp": 150, "maxHp": 200, "mp": 50, "maxMp": 100, "activeBuffs": [{"name": "Strength", "duration": 300}]}` |
| Region Data | `{"id": int, "name": String, "type": String, "visualType": String, "x": int, "y": int, "weather": String}` | `{"id": 5, "name": "Ancient Forest", "type": "FOREST", "visualType": "FOREST", "x": 123, "y": 456, "weather": "sunny"}` |
| Friend Data | `{"id": int, "name": String, "avatar_path": String, "status": String, "is_party": bool}` | `{"id": 2, "name": "Friend1", "avatar_path": "res://avatars/p2.png", "status": "online", "is_party": false}` |
| Achievement | `{"id": int, "name": String, "description": String, "icon": String, "unlocked_at": int}` | `{"id": 10, "name": "First Kill", "description": "Kill your first monster", "icon": "⚔️", "unlocked_at": 1735689600}` |
| Faction Data | `{"id": int, "name": String, "reputation": int, "tier": String}` | `{"id": 1, "name": "Warriors Guild", "reputation": 3500, "tier": "Friendly"}` |

### Client Request Schemas
| Action | Schema | Example |
|--------|---------|---------|
| Claim Daily | `{"action": "claim_daily", "userId": int}` | `{"action": "claim_daily", "userId": 1}` |
| Open Inventory | `{"action": "open_inventory", "heroId": int}` | `{"action": "open_inventory", "heroId": 1}` |
| Send Friend Request | `{"action": "friend_request", "targetId": int}` | `{"action": "friend_request", "targetId": 5}` |

---

## State Machine Diagram
### UI State Transitions
```
[IDLE] ──click──> [ACTIVE]
   │              │
   │              └──hover──> [HOVER]
   │
   │
[COMBAT] <──enter combat── [IDLE]
   │
   │
[OVERLAY_OPEN] <──open── [IDLE]
   │              │
   │              └──close── [IDLE]
```

### SideHUD Visibility States
| State | Condition | Visible Elements |
|-------|-----------|------------------|
| LOGIN_SCREEN | scene_name == "LoginScreen" | Hidden |
| LOADING_SCREEN | scene_name == "LoadingScreen" | Hidden |
| GAME_IDLE | scene_name in ["Town", "WorldAtlas", "Field"] && !in_combat | All indicators |
| GAME_COMBAT | in_combat == true | All + Combat indicator |
| INVENTORY_OPEN | overlay == "Inventory" | All + Inventory highlighted |
| SETTINGS_OPEN | overlay == "Settings" | All + Settings highlighted |

### Combat State Flow
```
[PEACEFUL] ──enemy_spotted──> [COMBAT_PREP]
    │                            │
    │                            └──5s──> [COMBAT_ACTIVE]
    │                                        │
    │                                        └──all_enemies_dead──> [VICTORY]
    │                                        │
    │                                        └──timeout──> [DEFEAT]
    │
    [VICTORY] ──10s──> [PEACEFUL]
    [DEFEAT] ──respawn──> [PEACEFUL]
```

---

## Error Code Reference
### Client-Side Error Codes
| Code | Error Type | Message | Action |
|------|------------|---------|--------|
| HUD_ERR_001 | Connection Lost | "Connection lost. Attempting to reconnect..." | Auto-reconnect, show offline indicator |
| HUD_ERR_002 | Invalid Data | "Invalid data received from server" | Log error, use fallback data |
| HUD_ERR_003 | Resource Missing | "Resource not found: {path}" | Log error, show placeholder |
| HUD_ERR_004 | Node Not Found | "Node path not found: {path}" | Log error, skip operation |
| HUD_ERR_005 | Signal Error | "Failed to connect signal: {signal}" | Log error, retry connection |
| HUD_ERR_006 | Timer Error | "Timer callback failed" | Restart timer, log error |
| HUD_ERR_007 | Animation Error | "Animation failed: {name}" | Skip animation, continue |
| HUD_ERR_008 | Data Timeout | "Data request timed out" | Show loading state, retry |

### Server-Side Error Codes
| Code | Message | Client Action |
|------|---------|---------------|
| SVR_ERR_001 | Authentication failed | Redirect to login |
| SVR_ERR_002 | Session expired | Show reauth dialog |
| SVR_ERR_003 | Rate limited | Show cooldown indicator |
| SVR_ERR_004 | Invalid request | Log error, ignore |
| SVR_ERR_005 | Server maintenance | Show maintenance message |

---

## Known Issues and Limitations
### Current Known Issues
| Issue ID | Severity | Description | Workaround | Status |
|----------|----------|-------------|------------|--------|
| HUD-001 | Medium | VIP badge contrast ratio below WCAG AA | Use darker gold color | Pending |
| HUD-002 | Low | Tooltip positioning fails near screen edges | Manual offset adjustment | In Progress |
| HUD-003 | Low | Performance drop with 50+ friends | Limit display to 5 friends | Implemented |
| HUD-004 | Medium | Time display not synced with server | Use server time on connect | Planned |

### Feature Limitations
| Feature | Limitation | Impact | Mitigation |
|---------|------------|--------|------------|
| Friends List | Max 5 avatars shown | Limited visibility | Add expand button |
| Buff Display | Max 5 buffs visible | Overflow hidden | Add scroll container |
| Combat Indicator | No auto-hide after combat | Confusion | Add 5s delay before hide |
| Performance | FPS update every 1s | Slight lag | Use frame averaging |
| Tooltips | No keyboard navigation | Accessibility issue | Add shortcuts |

### Browser/Platform Limitations
| Platform | Limitation | Notes |
|----------|------------|-------|
| Mobile | Battery API not available | Hide battery indicator |
| Web export | Some Godot APIs restricted | Test thoroughly |
| Low-end devices | Performance impact | Reduce update frequency |

---

## Future Enhancements Roadmap
### Post-MVP Features (Version 2.0)
| Feature | Priority | Effort | Description |
|---------|----------|--------|-------------|
| Customizable Layout | P1 | High | Allow users to rearrange HUD elements |
| Mini-Map Integration | P1 | High | Add minimap to sidebar |
| Quick Actions Bar | P1 | Medium | Skill/ability shortcuts |
| Chat Integration | P2 | Medium | Guild/party chat in sidebar |
| Guild Events | P2 | Low | Show guild activities |
| Seasonal Events | P2 | Low | Event-specific indicators |
| Dark/Light Theme | P3 | Low | Theme toggle |
| Compact Mode | P3 | Medium | Reduce sidebar width |
| Voice Chat Status | P3 | Low | Show voice channel status |
| Achievement Progress | P3 | Medium | Track achievement progress |

### Long-Term Vision (Version 3.0)
- **Dashboard-style HUD** with widgets
- **Widget Marketplace** for custom indicators
- **Mobile Companion App** integration
- **Cross-platform sync** of HUD preferences
- **AI-powered suggestions** based on gameplay

---

## Progress Log (append-only)
- 2026-02-09T22:09:00 - Initial analysis completed
- 2026-02-09T22:09:18 - User selected 3 features: Quick Notifications Badge, Server/Connection Status Indicator, Region/Location Mini-Display
- 2026-02-09T22:14:00 - Added 4th feature: Daily Login Streak display
- 2026-02-09T22:18:00 - Added 5 new features: Buff/Debuff Status Display, Time Display, Online Friends/Party Members, VIP/Premium Badge, Achievement Notification Badge
- 2026-02-09T22:21:00 - Added 4 new features: Title/Rank Display, Bag Slots Indicator, Faction Reputation Display, Weather Indicator
- 2026-02-09T22:25:00 - Added 2 new features: Settings Quick Access, Combat Mode Indicator
- 2026-02-09T22:46:00 - Added 1 new feature: Battery/Performance Indicator
- 2026-02-09T23:40:00 - Fixed duplicate Feature 10 and renumbered Features 11-16
- 2026-02-09T23:42:00 - Added Resources Required, Dependencies, Feature Priority, Testing Strategy sections
- 2026-02-09T23:48:00 - Added Acceptance Criteria, Rollback Strategy, Performance Budget, Accessibility, Localization sections
- 2026-02-09T23:54:00 - Added Implementation Timeline, Code Review Checklist, Security Considerations, Monitoring & Observability, Definition of Done sections
- 2026-02-10T00:01:00 - Added UI/UX Design References (ASCII mockup, color palette), Common Code Patterns (Timer, Signal, Badge, Tween, Null-Safe), Integration Testing Plan, Communication Plan sections

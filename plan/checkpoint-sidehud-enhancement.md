# SideHUD Enhancement - Checkpoint Plan

## Feature summary
- Goal: Menambahkan 16 fitur baru ke SideHUD
- User-facing behavior: Sidebar dengan notifications, status indicators, displays
- Scope in: Modifikasi SideHUD.tscn dan SideHUD.gd
- Scope out: Tidak termasuk backend, screen lain
- Assumptions: Semua data fields mock/dummy
- Risks: Badge count 0 hide, connection loss handle gracefully

## Checklist

### Phase 1: Basic UI Framework
- [ ] Setup SideHUD.tscn structure
  - Files: client/src/ui/SideHUD.tscn
  - TEST: Create new ResourceSection nodes
  - IMPLEMENT: Add ResourceSection/VBox containers
  - VERIFY: Scene compiles without error
  
- [ ] Setup SideHUD.gd variables
  - Files: client/src/ui/SideHUD.gd
  - TEST: Add @onready vars untuk semua new nodes
  - IMPLEMENT: Add var declarations
  - VERIFY: Script compiles

### Phase 2: Resource Displays (Priority)
- [ ] Add Connection Status Indicator
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show 🟢/🔴 icon dan ping
  - IMPLEMENT: Add StatusIcon, PingLabel nodes + _update_connection_status()
  - VERIFY: Indicator updates on socket events

- [ ] Add Time Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show HH:MM format + Day/Night icon
  - IMPLEMENT: Add TimeLabel + _update_time_display()
  - VERIFY: Clock updates every minute

- [ ] Add Bag Slots Indicator
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show "5/50" format dengan warning colors
  - IMPLEMENT: Add BagIcon, BagSlotsLabel + _update_bag_display()
  - VERIFY: Updates on inventory change

### Phase 3: Status Indicators
- [ ] Add Login Streak Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show "🔥 7" format
  - IMPLEMENT: Add StreakIconLabel, StreakCountLabel + _update_streak_display()
  - VERIFY: Updates on login

- [ ] Add VIP Badge
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show "👑 VIP" untuk premium users
  - IMPLEMENT: Add VIPBadge + _update_vip_display()
  - VERIFY: Visible only for VIP users

- [ ] Add Title Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show current title
  - IMPLEMENT: Add TitleDisplay + _update_title_display()
  - VERIFY: Updates on rank change

### Phase 4: Notification Badges
- [ ] Add Quest/Bag/Guild Badges
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show badge count di button corner
  - IMPLEMENT: Add BadgePanel + update_badge_count()
  - VERIFY: Shows/hides based on count

- [ ] Add Achievement Badge
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show count di AchievementBtn
  - IMPLEMENT: Add AchievementBadge + _update_achievement_badge()
  - VERIFY: Updates on achievement earned

### Phase 5: Game State Displays
- [ ] Add Region Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show "🏰 Town" atau "🌲 Forest"
  - IMPLEMENT: Add RegionInfo + _update_region_display()
  - VERIFY: Updates on region change

- [ ] Add Faction Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show faction name + reputation tier
  - IMPLEMENT: Add FactionDisplay + _update_faction_display()
  - VERIFY: Updates on reputation change

- [ ] Add Weather Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show weather icon + effects
  - IMPLEMENT: Add WeatherDisplay + _update_weather_display()
  - VERIFY: Updates on weather change

### Phase 6: Combat & Social
- [ ] Add Combat Indicator
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show "⚔️ COMBAT" saat dalam combat
  - IMPLEMENT: Add CombatIndicator + _update_combat_state()
  - VERIFY: Shows/hides on combat start/end

- [ ] Add Friends List
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show online friends avatars
  - IMPLEMENT: Add FriendsSection + _update_friends_display()
  - VERIFY: Updates on friend login/logout

### Phase 7: Utility Features
- [ ] Add Settings Button
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show ⚙️ button, opens settings
  - IMPLEMENT: Add SettingsBtn + _on_settings_pressed()
  - VERIFY: Opens settings overlay

- [ ] Add Performance Indicator
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show "60 FPS | 45ms"
  - IMPLEMENT: Add PerfIndicator + _update_perf_display()
  - VERIFY: Updates every second

### Phase 8: Buff System
- [ ] Add Buff/Debuff Display
  - Files: SideHUD.tscn + SideHUD.gd
  - TEST: Show buff icons dengan duration
  - IMPLEMENT: Add BuffContainer + _update_buffs_display()
  - VERIFY: Updates on buff gained/lost

### Phase 9: Polish & Testing
- [ ] Add animations
  - Files: SideHUD.gd
  - TEST: Pulsing, fade, scale effects
  - IMPLEMENT: Add tween animations
  - VERIFY: Smooth visual feedback

- [ ] Test all features
  - Files: All
  - TEST: Run game, verify all displays work
  - IMPLEMENT: Fix any bugs
  - VERIFY: No console errors

## Progress log

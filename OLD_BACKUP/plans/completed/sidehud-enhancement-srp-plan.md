# SideHUD Enhancement Plan - Single Responsibility Principle

## Architecture: 16 Separate Components

```
SideHUD (Orchestrator - hanya connect signals)
├── ResourceDisplay Container
│   ├── ConnectionStatusPanel.gd
│   ├── TimeDisplayPanel.gd
│   ├── BagSlotsPanel.gd
│   ├── LoginStreakPanel.gd
│   ├── VIPBadgePanel.gd
│   └── TitleDisplayPanel.gd
├── NotificationBadges Container
│   ├── QuestBadgePanel.gd
│   ├── AchievementBadgePanel.gd
│   └── MailBadgePanel.gd
├── GameStateDisplay Container
│   ├── RegionDisplayPanel.gd
│   ├── FactionDisplayPanel.gd
│   ├── WeatherDisplayPanel.gd
│   └── CombatIndicatorPanel.gd
├── SocialDisplay Container
│   └── FriendsListPanel.gd
└── UtilityDisplay Container
    ├── SettingsButtonPanel.gd
    └── PerformancePanel.gd
```

## Each Component Structure

```gdscript
# Base template untuk semua components
extends Control

@onready var data_label: Label
var _data_source: String  # e.g., "GameState.current_user.loginStreak"

func _ready() -> void:
    _connect_signals()
    _update_ui()

func _connect_signals() -> void:
    # Override di subclass
    pass

func _update_ui() -> void:
    # Override di subclass - fetch data dan update UI
    pass
```

## 16 Components Checklist

### ResourceDisplay Components

#### 1. ConnectionStatusPanel.gd
- **Responsibility:** Tampilkan connection status + ping
- **Data:** ServerConnector.socket_connected, get_last_ping()
- **TEST:** Shows 🟢/🔴 + "45ms"
- **Files:** components/ConnectionStatusPanel.tscn, .gd

#### 2. TimeDisplayPanel.gd
- **Responsibility:** Tampilkan in-game time + day/night
- **Data:** GameState.get_game_time()
- **TEST:** Shows "14:30" + ☀️/🌙
- **Files:** components/TimeDisplayPanel.tscn, .gd

#### 3. BagSlotsPanel.gd
- **Responsibility:** Tampilkan inventory usage
- **Data:** Inventory.get_used_slots(), get_max_slots()
- **TEST:** Shows "5/50" + warning colors
- **Files:** components/BagSlotsPanel.tscn, .gd

#### 4. LoginStreakPanel.gd
- **Responsibility:** Tampilkan login streak
- **Data:** GameState.current_user.loginStreak
- **TEST:** Shows "🔥 7"
- **Files:** components/LoginStreakPanel.tscn, .gd

#### 5. VIPBadgePanel.gd
- **Responsibility:** Tampilkan VIP status
- **Data:** GameState.current_user.isVip
- **TEST:** Shows "👑 VIP" only if VIP
- **Files:** components/VIPBadgePanel.tscn, .gd

#### 6. TitleDisplayPanel.gd
- **Responsibility:** Tampilkan current title
- **Data:** GameState.current_user.title
- **TEST:** Shows "Novice Knight"
- **Files:** components/TitleDisplayPanel.tscn, .gd

### NotificationBadges Components

#### 7. QuestBadgePanel.gd
- **Responsibility:** Tampilkan quest notification count
- **Data:** GameState.get_pending_quests()
- **TEST:** Shows badge count di QuestBtn
- **Files:** components/QuestBadgePanel.tscn, .gd

#### 8. AchievementBadgePanel.gd
- **Responsibility:** Tampilkan achievement notification count
- **Data:** GameState.get_unread_achievements()
- **TEST:** Shows badge count
- **Files:** components/AchievementBadgePanel.tscn, .gd

#### 9. MailBadgePanel.gd
- **Responsibility:** Tampilkan unread mail count
- **Data:** GameState.get_unread_mails()
- **TEST:** Shows badge count
- **Files:** components/MailBadgePanel.tscn, .gd

### GameStateDisplay Components

#### 10. RegionDisplayPanel.gd
- **Responsibility:** Tampilkan current region
- **Data:** GameState.current_region_data
- **TEST:** Shows "🏰 Town"
- **Files:** components/RegionDisplayPanel.tscn, .gd

#### 11. FactionDisplayPanel.gd
- **Responsibility:** Tampilkan faction reputation
- **Data:** GameState.current_faction.reputation
- **TEST:** Shows "Honored"
- **Files:** components/FactionDisplayPanel.tscn, .gd

#### 12. WeatherDisplayPanel.gd
- **Responsibility:** Tampilkan weather
- **Data:** GameState.get_current_weather()
- **TEST:** Shows "🌧️ Rain"
- **Files:** components/WeatherDisplayPanel.tscn, .gd

#### 13. CombatIndicatorPanel.gd
- **Responsibility:** Tampilkan combat status
- **Data:** GameState.is_in_combat()
- **TEST:** Shows "⚔️ COMBAT"
- **Files:** components/CombatIndicatorPanel.tscn, .gd

### SocialDisplay Components

#### 14. FriendsListPanel.gd
- **Responsibility:** Tampilkan online friends avatars
- **Data:** GameState.get_online_friends()
- **TEST:** Shows friend avatars
- **Files:** components/FriendsListPanel.tscn, .gd

### UtilityDisplay Components

#### 15. SettingsButtonPanel.gd
- **Responsibility:** Quick settings access
- **Data:** None (action only)
- **TEST:** Click opens settings
- **Files:** components/SettingsButtonPanel.tscn, .gd

#### 16. PerformancePanel.gd
- **Responsibility:** Tampilkan FPS + ping
- **Data:** Engine.get_frames_per_second()
- **TEST:** Shows "60 FPS | 45ms"
- **Files:** components/PerformancePanel.tscn, .gd

## SideHUD.gd (Orchestrator Only)

```gdscript
extends Control

@onready var resource_display: Control = %ResourceDisplay
@onready var notification_badges: Control = %NotificationBadges
@onready var game_state_display: Control = %GameStateDisplay
@onready var social_display: Control = %SocialDisplay
@onready var utility_display: Control = %UtilityDisplay

func _ready() -> void:
    # Hanya connect signals, tidak ada update logic
    GameState.region_changed.connect(_on_region_changed)
    # ... other signals
```

## Files Created

1. 16 x .tscn files di components/
2. 16 x .gd files di components/
3. SideHUD.gd (refactored)
4. SideHUD.tscn (updated structure)

## Progress Log
- 2026-02-09T23:30:00 - Refactored untuk Single Responsibility Principle

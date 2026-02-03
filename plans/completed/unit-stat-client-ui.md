# Unit Stat System - Client-Side Implementation

## Overview
Implementasi UI untuk menampilkan dan mengelola stat di client (Godot/GDScript).

---

## 1. Stat Handler (`StatHandler.gd`)

### Network Handler untuk Stats

```gdscript
extends Node

signal stats_calculated(stats)
signal stat_breakdown_received(breakdown)
signal stat_allocation_updated(allocation)

func request_hero_stats(hero_id: int, context_type: String = "GLOBAL"):
    var payload = {
        "heroId": hero_id,
        "contextType": context_type,
        "includeBreakdown": true
    }
    _send_request("/stats/calculate", HTTPClient.METHOD_POST, payload)

func request_stat_allocation(hero_id: int):
    _send_request("/stats/allocation/" + str(hero_id), HTTPClient.METHOD_GET)

func allocate_stat_point(hero_id: int, stat_key: String, points: int = 1):
    var payload = {
        "heroId": hero_id,
        "statKey": stat_key,
        "points": points
    }
    _send_request("/stats/allocate", HTTPClient.METHOD_POST, payload)

func reset_stat_allocation(hero_id: int):
    var payload = {"heroId": hero_id}
    _send_request("/stats/reset", HTTPClient.METHOD_POST, payload)

func preview_allocation(hero_id: int, allocation: Dictionary) -> Dictionary:
    # Preview perubahan tanpa commit
    pass
```

---

## 2. Stat Display Component (`StatDisplay.gd`)

### Main Stat Display UI

```gdscript
extends VBoxContainer

@export var hero_id: int = -1
var current_stats: Dictionary = {}
var stat_breakdown: Dictionary = {}

func refresh_display():
    _display_primary_stats()
    _display_secondary_stats()
    _display_elemental_stats()

func _display_primary_stats():
    var attrs = current_stats.get("attributes", {})
    for attr in ["str", "dex", "int", "vit", "luk"]:
        var label = get_node(attr + "_label")
        label.text = str(attrs.get(attr, 0))

func _display_secondary_stats():
    var stat_order = [
        "health_max", "mana_max", "attack_damage", "defense",
        "crit_chance", "crit_damage", "accuracy", "dodge_rate",
        "speed", "skill_power", "tenacity", "lifesteal_rate"
    ]
    
    for stat in stat_order:
        if current_stats.has(stat):
            var value = current_stats[stat]
            _update_stat_row(stat, value)

func _display_elemental_stats():
    var elements = ["fire", "water", "earth", "wind", "light", "dark"]
    for element in elements:
        var damage = current_stats.get(element + "_damage", 0)
        var resistance = current_stats.get(element + "_resistance", 0)
        # Update UI untuk elemental stats

func show_stat_detail(stat_key: String):
    if stat_breakdown.has(stat_key):
        breakdown_panel.show_stat_breakdown(stat_key, stat_breakdown[stat_key])
```

---

## 3. Stat Comparison UI (`StatComparison.gd`)

### Compare Stats Before/After

```gdscript
extends VBoxContainer

var base_stats: Dictionary = {}
var compare_stats: Dictionary = {}

func set_base_stats(stats: Dictionary):
    base_stats = stats
    if not compare_stats.is_empty():
        refresh_comparison()

func refresh_comparison():
    var all_stats = base_stats.duplicate()
    for key in compare_stats:
        if not all_stats.has(key):
            all_stats[key] = compare_stats[key]
    
    for stat in all_stats:
        var base_val = base_stats.get(stat, 0)
        var compare_val = compare_stats.get(stat, 0)
        var diff = compare_val - base_val
        
        if abs(diff) > 0.001:
            _add_comparison_row(stat, base_val, compare_val, diff)
```

---

## 4. Stat Allocation UI (`StatAllocation.gd`)

### UI untuk Allocate Stat Points

```gdscript
extends VBoxContainer

var stat_allocation: Dictionary = {}
var available_points: int = 0

func update_available_points(points: int):
    available_points = points
    $PointsLabel.text = "Available: " + str(points)

func update_allocated(attr: String, allocated: int):
    var row = get_node(attr + "_row")
    var allocated_label = row.get_node("Allocated")
    allocated_label.text = str(allocated)
    
    # Update button states
    var minus_btn = row.get_node("MinusButton")
    var plus_btn = row.get_node("PlusButton")
    minus_btn.disabled = allocated <= 0
    plus_btn.disabled = available_points <= 0

func _on_plus_pressed(attr: String):
    if available_points > 0:
        StatHandler.allocate_stat_point(hero_id, attr, 1)

func _on_minus_pressed(attr: String):
    # Logic untuk remove points
    pass

func _on_reset_pressed():
    StatHandler.reset_stat_allocation(hero_id)
```

---

## 5. UI Components Structure

### Scene Tree
```
StatScreen (Control)
├── PanelContainer
│   └── VBoxContainer
│       ├── PrimaryStats (HBoxContainer)
│       │   ├── STR_Label
│       │   ├── DEX_Label
│       │   ├── INT_Label
│       │   ├── VIT_Label
│       │   └── LUK_Label
│       ├── SecondaryStats (VBoxContainer)
│       │   ├── HealthRow
│       │   ├── ManaRow
│       │   ├── AttackRow
│       │   └── ...
│       ├── ElementalStats (GridContainer)
│       │   ├── FireRow
│       │   ├── WaterRow
│       │   └── ...
│       ├── AllocationPanel (PanelContainer)
│       │   ├── PointsLabel
│       │   ├── STR_AllocationRow
│       │   ├── DEX_AllocationRow
│       │   └── ...
│       └── BreakdownPanel (PanelContainer)
│           └── StatBreakdownContent
```

---

## 6. Integration Points

### HeroProfileScreen Integration
```gdscript
func _ready():
    StatHandler.stats_calculated.connect(_on_stats_calculated)
    StatHandler.stat_breakdown_received.connect(_on_breakdown_received)
    
    if GameState.selected_hero_id != -1:
        StatHandler.request_hero_stats(GameState.selected_hero_id)

func _on_stats_calculated(stats: Dictionary):
    $StatsLabel.text = _format_stats(stats)
```

### TopHUD Integration
```gdscript
func refresh():
    if GameState.current_user:
        # Request stats untuk current hero
        StatHandler.request_hero_stats(GameState.selected_hero_id, "COMBAT")
```

---

## 7. Features

### Real-time Updates
- Stats recalculate saat equipment berubah
- Breakdown tersedia on-demand
- Allocation points update real-time

### Visual Feedback
- Color coding untuk positive/negative changes
- Stat caps indicator
- Tooltip untuk detailed breakdown

### Performance
- Cache stats calculation result
- Debounce rapid requests
- Background calculation untuk complex stats

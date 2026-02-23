# Godot Engine Development Guide - Textical Project

Dokumen ini mendokumentasikan semua konvensi dan best practices yang digunakan dalam pengembangan game Textical dengan Godot Engine 4.x. Semua aturan didasarkan pada analisis struktur kode yang ada di folder `client/` - lebih dari 30+ file source telah dianalisis untuk memastikan akurasi.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Naming Conventions](#2-naming-conventions)
3. [GDScript Style Guide](#3-gdscript-style-guide)
4. [Scene & Prefab Management](#4-scene--prefab-management)
5. [Asset & Resource Management](#5-asset--resource-management)
6. [Autoload & Singleton Patterns](#6-autoload--singleton-patterns)
7. [Network Handler Architecture](#7-network-handler-architecture)
8. [UI Components Patterns](#8-ui-components-patterns)
9. [Loading Screen System](#9-loading-screen-system)
10. [Advanced UI Patterns](#10-advanced-ui-patterns)
11. [2D Game Strategies](#112d-game-strategies)
12. [Performance Optimization](#12-performance-optimization)
13. [Behavior Tree (BT) Templates](#13-behavior-tree-bt-templates)
14. [Error Handling & ErrorCodes](#14-error-handling--errorcodes)
15. [Localization System](#15-localization-system)

---

## 1. Project Structure

### 1.1 Folder Organization

Struktur folder yang digunakan di proyek Textical:

```
client/
├── assets/                    # Aset statis dan data
│   ├── data/                  # File JSON data (heroes, items, monsters)
│   ├── projectiles/           # Scene projectile (.tscn + .gd)
│   └── vfx/                   # Visual effects (.tscn + .gd)
├── src/                       # Source code utama
│   ├── autoload/              # Singleton scripts (autoload)
│   ├── constants/             # Konstanta global
│   ├── network/               # Network handlers
│   └── ui/                   # User Interface
│       ├── components/        # Reusable UI components
│       ├── loading/           # Loading screen + managers
│       │   └── managers/      # Loading sub-managers
│       ├── login/             # Login screen + managers
│       ├── regions/           # Region/world screens
│       ├── hero_profile/      # Hero profile screens
│       ├── codex/             # Codex/screens
│       └── side_hud/          # Side HUD components
├── addons/                    # Godot addons
├── script_templates/          # Template script untuk BT nodes
├── test/                      # Unit tests
└── project.godot              # Konfigurasi proyek
```

### 1.2 Konfigurasi project.godot

File [`project.godot`](client/project.godot:1-55) adalah entry point konfigurasi:

```ini
; Engine configuration file.
config_version=5

[application]
config/name="Textical"
run/main_scene="res://src/ui/loading/LoadingScreen.tscn"
config/features=PackedStringArray("4.5", "Forward Plus")

[autoload]
GameState="*res://src/autoload/game_state.gd"
DataManager="*res://src/autoload/data_manager.gd"
ServerConnector="*res://src/autoload/server_connector.gd"
SocketHandler="*res://src/network/SocketHandler.gd"

[display]
window/size/viewport_width=1300
window/size/viewport_height=650
window/stretch/mode="canvas_items"

[rendering]
renderer/rendering_method="mobile"
textures/vram_compression/import_etc2_astc=true
```

### 1.3 Key Configuration Details

| Setting | Value | Purpose |
|---------|-------|---------|
| `config_version` | 5 | Godot 4.x format |
| `config_features` | 4.5 | Godot version |
| `stretch_mode` | canvas_items | 2D UI scaling |
| `renderer` | mobile | Mobile-compatible rendering |
| `viewport` | 1300x650 | Fixed resolution |

---

## 2. Naming Conventions

### 2.1 Files dan Folders

| Type | Convention | Example |
|------|------------|---------|
| Scene files | PascalCase | `LoadingScreen.tscn`, `InventoryScreen.tscn` |
| Script files | snake_case | `game_state.gd`, `socket_handler.gd` |
| Folder names | snake_case | `side_hud`, `loading_managers` |
| Data files | snake_case | `heroes.json`, `monsters.json` |
| BT node templates | snake_case | `default.gd` |

### 2.2 Variables dan Functions

| Type | Convention | Example |
|------|------------|---------|
| Regular variables | snake_case | `current_user`, `session_token` |
| Private variables | snake_case + `_` prefix | `_inventory_data`, `_filtered_data` |
| Class variables | snake_case | `hero_data`, `item_stats` |
| Constants | SCREAMING_SNAKE_CASE | `DATA_DIR`, `MAX_SPEED` |
| Enum values | SCREAMING_SNAKE_CASE | `Status.undefined`, `Status.success` |
| Functions | snake_case | `get_region()`, `fetch_heroes_from_server()` |
| Class names | PascalCase | `ErrorCodes`, `GameState` |
| Signal names | snake_case | `heroes_loaded`, `request_completed` |

### 2.3 Node References

Dalam GDScript, gunakan `@onready` dengan `%` prefix untuk node path:

```gdscript
# client/src/ui/SideHUD.gd
@onready var vit_label = %VitalityLabel
@onready var vit_bar = %VitBar
@onready var silver_label = %SilverLabel
@onready var nav_buttons = {
    "Character": %CharacterBtn,
    "Bag": %BagBtn,
    "Town": %TownBtn,
}
```

### 2.4 Safe Node Access Pattern

Selalu gunakan `has_node()` untuk node yang mungkin tidak ada di semua scene variant:

```gdscript
# client/src/ui/TopHUD.gd
@onready var main_container = $MarginContainer/HBoxContainer if has_node("MarginContainer/HBoxContainer") else null
@onready var gold_label = $MarginContainer/HBoxContainer/GoldGroup/Label if has_node("MarginContainer/HBoxContainer/GoldGroup/Label") else null
@onready var energy_bar = $MarginContainer/HBoxContainer/EnergyGroup/ProgressBar if has_node("MarginContainer/HBoxContainer/EnergyGroup/ProgressBar") else null
```

### 2.5 Error Codes Convention

Gunakan format: `MODULE_ENTITY_STATUS` dengan semua huruf besar:

```gdscript
# client/src/constants/ErrorCodes.gd
const AUTH_INVALID_CREDENTIALS: String = "AUTH_INVALID_CREDENTIALS"
const AUTH_SESSION_EXPIRED: String = "AUTH_SESSION_EXPIRED"
const INVENTORY_FULL: String = "INVENTORY_FULL"
const COMBAT_NO_ACTIVE_BATTLE: String = "COMBAT_NO_ACTIVE_BATTLE"
```

---

## 3. GDScript Style Guide

### 3.1 Basic Structure

Setiap script GDScript mengikuti struktur ini:

```gdscript
extends Node  # atau class lain

## Class/Module Description
## Penjelasan singkat tentang fungsi class ini

class_name MyClassName  # opsional - untuk autoload/utility

# === SIGNALS ===
signal something_happened(data)
signal state_changed(old_state, new_state)

# === EXPORT VARIABLES ===
@export var hero_data: Dictionary = {}
@export var show_stats_bar: bool = true

# === PUBLIC VARIABLES ===
var current_state: String = "idle"

# === PRIVATE VARIABLES ===
var _internal_cache = {}
var _is_loading: bool = false

# === ONREADY VARIABLES ===
@onready var my_node = %MyNode

# === CONSTANTS ===
const MAX_SPEED: int = 100
const DATA_DIR: String = "user://data/"

# === BUILT-IN CALLBACKS ===
func _ready():
    _connect_signals()
    _initialize()

func _process(delta):
    _update_game_logic(delta)

# === PUBLIC METHODS ===
func do_something(param: String) -> void:
    pass

# === PRIVATE METHODS ===
func _connect_signals():
    pass

func _initialize():
    pass
```

### 3.2 Type Hints

**Selalu gunakan type hints untuk:**
- Function parameters
- Return types
- Variable declarations

```gdscript
# ✅ BENAR - Dengan type hints
func get_region(id: int) -> Dictionary:
    var cache_key: String = category + "_" + str(id)
    return _data_cache.get(cache_key, {})

func _on_request_completed(endpoint: String, response) -> void:
    var data = response.get("data", response) if response is Dictionary else response

func _setup_ui_update_timer() -> void:
    _ui_update_timer = Timer.new()
    _ui_update_timer.wait_time = 1.0
```

### 3.3 Documentation Comments

Gunakan `##` untuk dokumentasi dan `//` untuk komentar biasa:

```gdscript
## Data Manager with Version Checking
## Downloads templates from server if version mismatch
class_name DataManager

## Get user-friendly error message for an error code
## @param error_code: The error code string
## @return: User-friendly message or the code itself if not found
static func get_message(error_code: String) -> String:
    if ERROR_MESSAGES.has(error_code):
        return ERROR_MESSAGES[error_code]
    return error_code
```

### 3.4 Constants Organization

Kelompokkan konstanta dengan separator:

```gdscript
# ===========================================
# Authentication Errors (AUTH_*)
# ===========================================
const AUTH_INVALID_CREDENTIALS: String = "AUTH_INVALID_CREDENTIALS"
const AUTH_USER_NOT_FOUND: String = "AUTH_USER_NOT_FOUND"
const AUTH_SESSION_EXPIRED: String = "AUTH_SESSION_EXPIRED"

# ===========================================
# Inventory Errors (INVENTORY_*)
# ===========================================
const INVENTORY_FULL: String = "INVENTORY_FULL"
const INVENTORY_ITEM_NOT_FOUND: String = "INVENTORY_ITEM_NOT_FOUND"
```

### 3.5 Signal Definitions

Deklarasikan signals di bagian atas file dengan grouped comments:

```gdscript
# client/src/network/SocketHandler.gd
# --- SIGNALS (Real-time / WebSocket) ---
signal task_completed(data)
signal task_started(data)
signal task_failed(data)

signal stat_updated(unit_id, stats)
signal stat_changed(unit_id, stat_name, old_value, new_value)
signal stat_cap_reached(unit_id, stat_name, current_value, cap_value)
signal elemental_affinity_updated(unit_id, affinities)
signal set_bonus_updated(unit_id, bonuses)

signal badge_updated(badge_data)
signal item_socketed(equipment_id, gem_id)

# --- SIGNALS (Guild / WebSocket) ---
signal connected()
signal guild_created(data)
signal guild_left()
signal guild_disbanded()
signal guild_info_received(data)
```

### 3.6 Match Statement

Gunakan match untuk conditional yang banyak:

```gdscript
func get_region_scene(r_type: String) -> String:
    match r_type.to_upper():
        "TOWN": return "res://src/ui/TownScreen.tscn"
        "FOREST": return "res://src/ui/regions/ForestScreen.tscn"
        "MINE": return "res://src/ui/regions/MineScreen.tscn"
        "DUNGEON": return "res://src/ui/regions/DungeonScreen.tscn"
        _: return "res://src/ui/regions/ForestScreen.tscn"
```

### 3.7 Lambda Functions

Gunakan lambda untuk sorting dan filtering:

```gdscript
# client/src/ui/InventoryScreen.gd
sorted_items.sort_custom(func(a, b):
    var name_a = a.get("template", {}).get("name", "").to_lower()
    var name_b = b.get("template", {}).get("name", "").to_lower()
    return name_a < name_b
)
```

### 3.8 Class Definition Patterns

Gunakan `class_name` untuk membuat class bisa di-load:

```gdscript
# BaseNetworkHandler - Base class untuk semua network handlers
extends Node
class_name BaseNetworkHandler

## Import centralized error codes
const ErrCodes = preload("res://src/constants/ErrorCodes.gd")

## Signals for request handling
signal request_completed(endpoint, data)
signal error_occurred(endpoint, error_code, message)
```

### 3.9 Resource Cleanup Pattern

Selalu cleanup resource di `_exit_tree()`:

```gdscript
# client/src/ui/loading/managers/SyncManager.gd
func _exit_tree() -> void:
    if DataManager:
        if DataManager.has_signal("sync_progress"):
            DataManager.sync_progress.disconnect(_on_sync_progress)
        if DataManager.has_signal("sync_finished"):
            DataManager.sync_finished.disconnect(_on_sync_finished)
    _is_syncing = false
```

---

## 4. Scene & Prefab Management

### 4.1 Scene Naming

Gunakan PascalCase untuk nama scene:

```
✅ Benar: InventoryScreen.tscn, HeroCard.tscn, SideHUD.tscn
❌ Salah: inventory_screen.tscn, hero_card.tscn
```

### 4.2 Scene Structure Pattern

Setiap scene mengikuti pola parent-child:

```text
InventoryScreen.tscn (Control)
├── MainContainer (PanelContainer)
│   ├── CategoryHeader (HBoxContainer)
│   ├── SearchPanel (HBoxContainer)
│   ├── Grid (GridContainer)
│   └── RightPanel (PanelContainer)
│       ├── ItemIcon (TextureRect)
│       ├── ItemName (Label)
│       └── Actions (VBoxContainer)
```

### 4.3 Dynamic Node Creation

Gunakan kode untuk membuat node secara dinamis:

```gdscript
# client/src/ui/InventoryScreen.gd
func _create_slot_node() -> Control:
    var slot = PanelContainer.new()
    slot.custom_minimum_size = Vector2(80, 80)
    
    var style = StyleBoxFlat.new()
    style.bg_color = Color(1, 1, 1, 0.02)
    style.corner_radius_top_left = 10
    style.corner_radius_top_right = 10
    style.corner_radius_bottom_right = 10
    style.corner_radius_bottom_left = 10
    slot.add_theme_stylebox_override("panel", style)
    
    return slot
```

### 4.4 Component Reusability

Buat komponen yang bisa di-reuse di folder `components/`:

```
client/src/ui/components/
├── HeroCard.tscn + .gd
├── EquipmentSlot.tscn + .gd
├── StatRow.tscn + .gd
├── StatDisplay.tscn + .gd
├── StatComparison.tscn + .gd
├── SkillListItem.tscn + .gd
├── SideNavButton.tscn + .gd
└── SkillsTab.tscn + .gd
```

### 4.5 Signal Connection Patterns

**Connecting signals dalam _ready():**

```gdscript
func _ready():
    _setup_styles()
    _setup_search_sort_ui()
    _connect_signals()
    refresh()

func _connect_signals():
    ServerConnector.request_completed.connect(_on_request_completed)
    
    # Action buttons
    equip_btn.pressed.connect(_on_equip_pressed)
    use_btn.pressed.connect(_on_use_pressed)
    drop_btn.pressed.connect(_on_drop_pressed)
    
    # Category buttons
    for btn in category_header.get_children():
        if btn is Button:
            btn.pressed.connect(_on_category_pressed.bind(btn.name))
```

---

## 5. Asset & Resource Management

### 5.1 Data File Organization

Simpan data JSON di `client/assets/data/`:

```
assets/data/
├── heroes.json      # Template data heroes
├── items.json       # Item templates
├── monsters.json    # Monster definitions
├── regions.json     # Region data
└── weapons.json     # Weapon templates
```

### 5.2 Loading Data dengan Fallback

Gunakan pattern fallback dengan lokal cache:

```gdscript
# client/src/autoload/data_manager.gd
func get_asset(category: String, id: int) -> Dictionary:
    var cache_key: String = category + "_" + str(id)
    
    # Try memory cache first
    if _data_cache.has(cache_key):
        return _data_cache[cache_key]
    
    # Try local file
    var path: String = DATA_DIR + category + "/" + str(id) + ".json"
    if FileAccess.file_exists(path):
        var file = FileAccess.open(path, FileAccess.READ)
        var json = JSON.parse_string(file.get_as_text())
        if json:
            _data_cache[cache_key] = json
            return json
    
    # Try fallback
    if _fallback_data.has(category):
        var str_id = str(id)
        if _fallback_data[category].has(str_id):
            return _fallback_data[category][str_id]
    
    print("[DataManager] Asset not found: %s %d" % [category, id])
    return {}
```

---

## 6. Autoload & Singleton Patterns

### 6.1 Autoload Definition

Di [`project.godot`](client/project.godot:17-28), autoload didefinisikan seperti:

```ini
[autoload]
GameState="*res://src/autoload/game_state.gd"
DataManager="*res://src/autoload/data_manager.gd"
ServerConnector="*res://src/autoload/server_connector.gd"
SocketHandler="*res://src/network/SocketHandler.gd"
UIManager="*res://src/autoload/ui_manager.gd"
```

### 6.2 GameState Pattern

GameState adalah central state management:

```gdscript
# client/src/autoload/game_state.gd
extends Node

# Signals
signal heroes_loaded(count: int)
signal heroes_loading_failed(error: String)
signal region_changed(new_data)
signal quest_updated()

# Public variables
var current_user = null
var session_token: String = ""
var current_heroes = []
var inventory = []

# Constants
const REGION_POSITIONS = {
    1: Vector2(2500, 2500),  # Oakhaven Hub (CENTER)
    2: Vector2(1200, 1800),  # Iron Mine (West)
}

func _ready():
    print("[STATE] GameState ready.")

func is_in_town() -> bool:
    return current_user and current_user.get("currentRegion", 0) == 1
```

### 6.3 UIManager Pattern

UIManager mengelola overlay screens:

```gdscript
# client/src/autoload/ui_manager.gd
extends Node

var ui_layer: CanvasLayer
var active_overlays: Dictionary = {}

signal overlay_opened(overlay_name)
signal overlay_closed(overlay_name)

func _ready():
    ui_layer = CanvasLayer.new()
    ui_layer.layer = 100
    add_child(ui_layer)

func open_overlay(overlay_name: String, scene_path: String, data: Dictionary = {}):
    if active_overlays.has(overlay_name):
        return active_overlays[overlay_name]
    
    var scene = load(scene_path)
    var instance = scene.instantiate()
    ui_layer.add_child(instance)
    active_overlays[overlay_name] = instance
    
    overlay_opened.emit(overlay_name)
    return instance

func close_overlay(overlay_name: String):
    if active_overlays.has(overlay_name):
        var instance = active_overlays[overlay_name]
        active_overlays.erase(overlay_name)
        # Animation...
        instance.queue_free()
        overlay_closed.emit(overlay_name)
```

### 6.4 LocalizationManager Pattern

Simple localization system:

```gdscript
# client/src/autoload/LocalizationManager.gd
extends Node

## RESPONSIBILITY: Handles localization and string translation
## SINGLE RESPONSIBILITY: Only handles language-specific strings

const LOCALIZED_STRINGS = {
    "en": {
        "status_preparing": "Preparing the realm...",
        "status_ready": "The Realm is Ready. Welcome, Traveler.",
    },
    "id": {
        "status_preparing": "Mempersiapkan dunia...",
        "status_ready": "Dunia Sudah Siap. Selamat Datang, Penjelajah.",
    }
}

var current_lang: String = "en"

## Simple localization helper
func translate(key: String, params: Array = []) -> String:
    if not LOCALIZED_STRINGS.has(current_lang):
        return key
        
    var lang_data = LOCALIZED_STRINGS[current_lang]
    var text = lang_data.get(key, key)
    
    if text is Array:
        return text.pick_random()
        
    if params.size() > 0:
        return text % params
        
    return text

func set_language(lang: String):
    if LOCALIZED_STRINGS.has(lang):
        current_lang = lang
```

---

## 7. Network Handler Architecture

### 7.1 BaseNetworkHandler Pattern

Semua network handlers extends `BaseNetworkHandler`:

```gdscript
# client/src/network/BaseNetworkHandler.gd
extends Node
class_name BaseNetworkHandler

const ErrCodes = preload("res://src/constants/ErrorCodes.gd")

signal request_completed(endpoint, data)
signal error_occurred(endpoint, error_code, message)

var base_url = "http://127.0.0.1:5000/api"

func _request(endpoint: String, method: HTTPClient.Method, body: Dictionary = {}):
    var url = base_url + endpoint
    var http = HTTPRequest.new()
    add_child(http)
    http.request_completed.connect(func(result, response_code, _headers, response_body): 
        _on_request_completed(http, endpoint, result, response_code, response_body)
    )
    var error = http.request(url, ["Content-Type: application/json"], method, JSON.stringify(body))

func _on_request_completed(http_node, endpoint, result, response_code, body):
    var json = JSON.parse_string(body.get_string_from_utf8())
    if response_code >= 400:
        var error_code = _extract_error_code(json)
        emit_signal("error_occurred", endpoint, error_code, json.get("message", "Error"))
    else:
        emit_signal("request_completed", endpoint, json)
    http_node.queue_free()

func _handle_success(_endpoint: String, _json):
    pass

func _handle_error(_endpoint: String, _error_code: String, _message: String):
    pass
```

### 7.2 Response Data Extraction Pattern

Handle berbagai format response dari server:

```gdscript
# client/src/network/InventoryHandler.gd - Pattern extraction
func _handle_success(endpoint: String, json):
    print("[InventoryHandler] _handle_success called")
    
    if endpoint.contains("/inventory"):
        # Handle both direct dict and {"success": true, "data": {...}} format
        var inventory_data = json
        if json is Dictionary and json.has("data"):
            inventory_data = json.get("data")
        
        if inventory_data is Dictionary and inventory_data.has("items"):
            GameState.set_inventory(inventory_data)
    
    elif endpoint.contains("/heroes"):
        # Handle both Array and {"success": true, "data": [...]} format
        var heroes_data = null
        if json is Array:
            heroes_data = json
        elif json is Dictionary:
            if json.has("data"):
                heroes_data = json.get("data")
            elif json.has("heroes"):
                heroes_data = json.get("heroes")
        
        if heroes_data is Array:
            GameState.set_heroes(heroes_data)
```

### 7.3 AuthHandler dengan Device Detection

```gdscript
# client/src/network/AuthHandler.gd
extends BaseNetworkHandler
class_name AuthHandler

signal login_success(user, session)
signal login_failed(error, extra)

var device_info: String = "Unknown Device"

func _ready():
    super._ready()
    _detect_device_info()

func _detect_device_info():
    var os_name = OS.get_name()
    var model = "Desktop"
    
    # Detect device type
    if OS.has_feature("mobile"):
        model = "Mobile"
    elif OS.has_feature("web"):
        model = "Web"
    
    device_info = "%s (%s)" % [os_name, model]

func login(username: String, password: String):
    var body = {
        "username": username,
        "password": password,
        "deviceInfo": device_info
    }
    _request("/auth/login", HTTPClient.METHOD_POST, body)
```

### 7.4 ServerConnector Facade

ServerConnector adalah facade yang menggabungkan semua handlers:

```gdscript
# client/src/autoload/server_connector.gd
extends Node

const AuthHandlerClass = preload("res://src/network/AuthHandler.gd")
const StatHandlerClass = preload("res://src/network/StatHandler.gd")

var auth
var stat

func _ready():
    auth = AuthHandlerClass.new()
    stat = StatHandlerClass.new()
    add_child(auth)
    add_child(stat)

# Facade methods
func login_with_password(u, p): auth.login(u, p)
func fetch_unit_stats(unit_id: int): stat.fetch_unit_stats(unit_id)
func get_cached_stats(unit_id: int) -> Dictionary: return stat.get_cached_stats(unit_id)
```

---

## 8. UI Components Patterns

### 8.1 HeroCard Component

```gdscript
# client/src/ui/components/HeroCard.gd
extends Button
class_name HeroCard

signal hero_selected(hero_data: Dictionary)

@export var hero_data: Dictionary = {}

@onready var border_frame: ColorRect = $BorderFrame
@onready var portrait_container: Control = $PortraitContainer

var _rarity_colors: Dictionary = {
    "COMMON": {"border": Color(0.7, 0.7, 0.7, 0.6)},
    "RARE": {"border": Color(1.0, 0.75, 0.0, 0.7)},
    "EPIC": {"border": Color(0.6, 0.4, 1.0, 0.8)},
}

var _is_selected: bool = false

func _ready():
    _setup_ui()
    _connect_signals()

func set_hero_data(data: Dictionary):
    hero_data = data
    _update_display()

func _update_display():
    if hero_data.is_empty():
        return
    name_label.text = hero_data.get("name", "Unknown")
    var rarity = hero_data.get("rarity", "COMMON")
    _set_rarity_visuals(rarity)
```

### 8.2 SideNavButton Component

```gdscript
# client/src/ui/components/SideNavButton.gd
extends Button

@export var icon_text: String = "❓"
@export var menu_label: String = "Menu"
@export var target_scene: String = ""
@export var is_overlay: bool = false
@export var overlay_name: String = ""

@onready var icon_node = $HBox/Icon
@onready var label_node = $HBox/Label

func _ready():
    icon_node.text = icon_text
    label_node.text = menu_label
    
    mouse_entered.connect(_on_hover.bind(true))
    mouse_exited.connect(_on_hover.bind(false))

func _on_hover(is_hover: bool):
    var tw = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
    if is_hover:
        tw.tween_property(self, "custom_minimum_size:x", 160.0, 0.2)
        modulate = Color(1.2, 1.2, 1.2)
    else:
        tw.tween_property(self, "custom_minimum_size:x", 150.0, 0.2)
        modulate = Color(1, 1, 1)
```

### 8.3 StatRow Component

```gdscript
# client/src/ui/components/StatRow.gd
extends PanelContainer
class_name StatRow

## StatRow - Reusable component untuk menampilkan stat (tanpa progress bar)
## Features: Icon, name, value, bonus dengan hover effect

signal stat_clicked

# === NODE REFERENCES ===
@onready var row_content: HBoxContainer = $HBox
@onready var stat_icon: Label = $HBox/StatIcon
@onready var stat_name: Label = $HBox/VBox/StatName
@onready var stat_value: Label = $HBox/VBox/StatValue
@onready var stat_bonus: Label = $HBox/VBox/StatBonus
@onready var accent_bar: Panel = $HBox/Accent

func setup_stat(p_name: String, p_icon: String, p_key: String = "", p_current: int = 0, _p_unused: int = 0):
    _stat_name = p_name
    _stat_key = p_key
    _current_value = p_current
    
    _update_accent_color()
    
    if stat_icon: stat_icon.text = p_icon
    if stat_name: stat_name.text = p_name.to_upper()
    
    if stat_value:
        if _stat_key.to_lower() in ["fire", "water", "earth", "wind", "light", "dark"]:
            var sign_str = "+" if p_current > 0 else ""
            stat_value.text = "%s%d%%" % [sign_str, p_current]
        else:
            stat_value.text = str(p_current)

func _update_accent_color():
    if not accent_bar: return
    
    match _stat_key.to_lower():
        "hp", "health": accent_bar.modulate = Color(0.3, 0.8, 0.4)
        "mp", "mana": accent_bar.modulate = Color(0.2, 0.5, 0.9)
        "attack": accent_bar.modulate = Color(0.9, 0.3, 0.2)
        "defense": accent_bar.modulate = Color(0.2, 0.6, 0.9)
        "fire": accent_bar.modulate = Color(1.0, 0.3, 0.1)
        _: accent_bar.modulate = Color(0.4, 0.35, 0.3)

func _on_mouse_entered():
    modulate = Color(1.1, 1.1, 1.1, 1.0)

func _on_mouse_exited():
    modulate = Color(1.0, 1.0, 1.0, 1.0)
```

### 8.4 StatDisplay Component

Complex stat display dengan tooltip:

```gdscript
# client/src/ui/components/StatDisplay.gd
extends Control
class_name StatDisplay

# === EXPORT VARIABLES ===
@export var stat_name: String = "attack"
@export var stat_icon: Texture2D = null
@export var show_icon: bool = true
@export var show_tooltip: bool = true
@export var show_comparison: bool = true
@export var show_capped_indicator: bool = true

# === STAT METADATA ===
const STAT_METADATA: Dictionary = {
    "hp": {"display_name": "Health Points", "icon": "❤️", "description": "Jumlah HP maksimum."},
    "mp": {"display_name": "Mana Points", "icon": "💙", "description": "Jumlah MP maksimum."},
    "attack": {"display_name": "Attack Power", "icon": "⚔️", "description": "Damage fisik."},
    "defense": {"display_name": "Defense", "icon": "🛡️", "description": "Mengurangi damage."},
    "speed": {"display_name": "Speed", "icon": "💨", "description": "Urutan turn dalam battle."},
}

func _setup_tooltip():
    tooltip_panel.visible = false
    tooltip_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    
    _tooltip_timer = Timer.new()
    _tooltip_timer.wait_time = 0.3
    _tooltip_timer.one_shot = true
    _tooltip_timer.timeout.connect(_show_tooltip)
    add_child(_tooltip_timer)

## Static factory method
static func create_from_config(parent: Node, config: Dictionary) -> StatDisplay:
    var display = StatDisplay.new()
    display.stat_name = config.get("name", "attack")
    display.show_icon = config.get("show_icon", true)
    parent.add_child(display)
    return display
```

### 8.5 StatComparison Component

```gdscript
# client/src/ui/components/StatComparison.gd
extends Control
class_name StatComparison

# === CONSTANTS ===
const MAIN_STATS: Array = ["hp", "mp", "initiative", "attack", "defense", "magic_attack", "magic_defense", "speed"]
const DERIVED_STATS: Array = ["critical_rate", "critical_damage", "accuracy", "evasion"]
const ELEMENTAL_STATS: Array = ["elemental_fire", "elemental_water", "elemental_earth", "elemental_wind", "elemental_light", "elemental_dark"]

## Set stats untuk comparison
func set_comparison(base_stats: Dictionary, current_stats: Dictionary):
    _base_stats = base_stats
    _current_stats = current_stats
    _is_preview_mode = false
    _calculate_differences()
    _update_display()

## Set equipment preview
func set_equipment_preview(base_stats: Dictionary, equipment: Array, preview_stats: Dictionary):
    _base_stats = base_stats
    _equipment_preview = equipment
    _current_stats = preview_stats
    _is_preview_mode = true
    _calculate_differences()
    _update_display()
```

---

## 9. Loading Screen System

### 9.1 LoadingScreen Coordinator

```gdscript
# client/src/ui/loading/LoadingScreen.gd
extends Control

## RESPONSIBILITY: Main coordinator for the Loading Screen system
## SINGLE RESPONSIBILITY: Orchestrates sub-managers and high-level flow

@onready var magic_sigil = $MagicSigil
@onready var loading_bar = $VBoxContainer/LoadingBar
@onready var status_label = $VBoxContainer/StatusLabel

var sync = SyncManager.new()
var log_manager = LogManager.new()
var tip_manager = TipManager.new()
var particles = ParticleManager.new()
var ripples = RippleManager.new()

func _ready():
    _setup_managers()
    _setup_accessibility()
    _start_flow()

func _setup_managers():
    add_child(sync)
    add_child(log_manager)
    # ... connect signals
```

### 9.2 Manager Pattern dengan _exit_tree Cleanup

```gdscript
# client/src/ui/loading/managers/SyncManager.gd
class_name SyncManager
extends Node

## RESPONSIBILITY: Data synchronization with DataManager
## SINGLE RESPONSIBILITY: Only handles sync state and signals

signal sync_started()
signal sync_progress(current: int, total: int)
signal sync_completed()
signal sync_error(endpoint: String, message: String)

var _is_syncing: bool = false
var _sync_error_count: int = 0
const MAX_RETRY_COUNT: int = 3

func _ready() -> void:
    _connect_signals()

func _exit_tree() -> void:
    if DataManager:
        if DataManager.has_signal("sync_progress"):
            DataManager.sync_progress.disconnect(_on_sync_progress)
        if DataManager.has_signal("sync_finished"):
            DataManager.sync_finished.disconnect(_on_sync_finished)
    _is_syncing = false
```

### 9.3 ProgressManager Pattern

```gdscript
# client/src/ui/loading/managers/ProgressManager.gd
class_name ProgressManager
extends Node

## RESPONSIBILITY: Progress bar and loading status
## SINGLE RESPONSIBILITY: Only handles progress display updates

signal progress_updated(current: int, total: int)
signal status_changed(new_status: String)

var loading_bar: Control = null
var status_label: Label = null

func update_sync_progress(current: int, total: int) -> void:
    var percent: float = 0.0
    if total > 0:
        percent = (float(current) / float(total)) * 100.0
    
    update_progress(percent)
    
    var status: String = "Updating Assets: %d / %d" % [current, total]
    _set_status(status)
    
    progress_updated.emit(current, total)
```

### 9.4 LoadingUtils Static Functions

```gdscript
# client/src/ui/loading/LoadingUtils.gd
class_name LoadingUtils
extends Node

const SCENE_TRANSITION_TIMEOUT: float = 5.0
const RUNES: Array[String] = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ"]

## Race between a signal and a timer timeout
static func race_signal_or_timer(tree: SceneTree, sig: Signal, timer: SceneTreeTimer, exit_flag_provider: Callable) -> void:
    var status = {"done": false}
    sig.connect(func(): status.done = true, CONNECT_ONE_SHOT)
    timer.timeout.connect(func(): status.done = true, CONNECT_ONE_SHOT)
    
    while not status.done and not exit_flag_provider.call() and tree:
        await tree.process_frame

static func validate_scene_path(path: String) -> bool:
    var allowed_paths = [
        "res://src/ui/login/LoginScreen.tscn",
        "res://src/ui/TownScreen.tscn"
    ]
    if path in allowed_paths:
        return true
    if path.contains("/regions/"):
        return true
    push_error("Security: Unauthorized scene path attempt: " + path)
    return false
```

---

## 10. Advanced UI Patterns

### 10.1 TopHUD - Complex UI dengan Resource Bars

```gdscript
# client/src/ui/TopHUD.gd
extends Control
class_name TopHUD

## TopHUD - Heads-up display dengan stat summary, resource bars, dan elemental affinity

# === EXPORT VARIABLES ===
@export var show_resource_bars: bool = true
@export var show_stat_summary: bool = true
@export var bar_colors: Dictionary = {
    "hp": Color(0.8, 0.2, 0.2, 1.0),
    "mp": Color(0.2, 0.4, 0.9, 1.0)
}

# === BUFF/DEBUFF METADATA ===
const BUFF_METADATA: Dictionary = {
    "shield": {"icon": "🛡️", "color": Color(0.3, 0.6, 0.9, 1.0), "tooltip": "Shield: Damage reduction active"},
    "haste": {"icon": "⚡", "color": Color(0.9, 0.9, 0.3, 1.0), "tooltip": "Haste: Speed increased"},
}

const DEBUFF_METADATA: Dictionary = {
    "burn": {"icon": "🔥", "color": Color(0.9, 0.3, 0.2, 1.0), "tooltip": "Burn: Damage over time"},
    "stun": {"icon": "💫", "color": Color(0.7, 0.7, 0.3, 1.0), "tooltip": "Stun: Cannot act"},
}

func _ready():
    _setup_connections()
    _setup_ui()
    refresh()
    
    # Register with UIManager to allow auto-hide on overlays
    if UIManager:
        UIManager.register_world_hud(self)

func _setup_connections():
    ServerConnector.login_success.connect(_on_data_updated)
    ServerConnector.request_completed.connect(_on_request_completed)
    ServerConnector.stats_updated.connect(_on_stats_updated)
    ServerConnector.stat_changed.connect(_on_stat_changed)

func _update_resource_bars(stats: Dictionary):
    if not show_resource_bars or not resource_bars_container:
        return
    
    # HP Bar
    var hp_current = stats.get("hp", 100)
    var hp_max = stats.get("maxHp", stats.get("hp", 100))
    _update_bar(resource_bars_container.get_node_or_null("HPBar"), hp_current, hp_max, bar_colors.hp)
    
    # MP Bar
    var mp_current = stats.get("mp", 50)
    var mp_max = stats.get("maxMp", stats.get("mp", 50))
    _update_bar(resource_bars_container.get_node_or_null("MPBar"), mp_current, mp_max, bar_colors.mp)

func _update_bar(bar: ProgressBar, current: float, max_val: float, color: Color):
    if not bar: return
    
    bar.max_value = max_val
    bar.value = current
    
    # Update color (optional - can use stylebox instead)
    if bar.has_theme_stylebox_override("fill"):
        var style = bar.get_theme_stylebox("fill").duplicate()
        style.bg_color = color
        bar.add_theme_stylebox_override("fill", style)

func update_buffs_debuffs(statuses: Array):
    # Clear existing
    for child in buffs_container.get_children():
        child.queue_free()
    
    # Create icon for each active status
    for status in statuses:
        var status_name = status.get("name", "") if status is Dictionary else ""
        var metadata = BUFF_METADATA.get(status_name, {})
        if metadata.is_empty():
            metadata = DEBUFF_METADATA.get(status_name, {"icon": "❓", "color": Color.WHITE})
        
        var icon = _create_buff_icon(status_name, metadata, status.get("duration", 0))
        buffs_container.add_child(icon)
```

### 10.2 AtlasBase - Map System dengan Drawing

```gdscript
# client/src/ui/AtlasBase.gd
extends Control
class_name AtlasBase

@onready var pins_layer = $MapLayer/Pins if has_node("MapLayer/Pins") else null
@onready var landmarks_layer = $MapLayer/Landmarks if has_node("MapLayer/Landmarks") else null
@onready var player_marker = $MapLayer/PlayerMarker if has_node("MapLayer/PlayerMarker") else null
@onready var connections_layer = $MapLayer/Connections if has_node("MapLayer/Connections") else null
@onready var cam = $Camera2D if has_node("Camera2D") else null

var SHOW_DEBUG_GRID = true
var _active_connections = []

func _spawn_map_elements():
    if not is_node_ready(): await ready
    
    # [OPTIMASI] Null checks are vital since AtlasBase is shared
    
    if landmarks_layer:
        landmarks_layer.queue_redraw()
        if not landmarks_layer.draw.is_connected(_draw_landmarks):
            landmarks_layer.draw.connect(_draw_landmarks)
    
    if connections_layer:
        if not connections_layer.draw.is_connected(_draw_connections):
            connections_layer.draw.connect(_draw_connections)

func _draw_landmarks():
    var font = ThemeDB.fallback_font
    var font_size = 32
    var color = Color(0.4, 0.3, 0.2, 0.6)
    for lm in GameState.FLAVOR_LANDMARKS:
        landmarks_layer.draw_string(font, lm.pos, lm.name, HORIZONTAL_ALIGNMENT_CENTER, -1, font_size, color)

func _draw_debug_grid():
    if not SHOW_DEBUG_GRID: return
    var grid_size = 5000
    var step = 256
    var color = Color(0, 0, 0, 0.1)
    
    for i in range(0, grid_size + step, step):
        debug_grid.draw_line(Vector2(i, 0), Vector2(i, grid_size), color, 1.0)
        debug_grid.draw_line(Vector2(0, i), Vector2(grid_size, i), color, 1.0)

func _update_map_tiles():
    if not map_tiles_layer or not cam: return
    
    # [OPTIMASI] Kalkulasi Tile yang terlihat (Frustum Culling)
    var view_size = get_viewport_rect().size / cam.zoom
    var center = cam.position
    var start_pos = center - view_size / 2.0
    var end_pos = center + view_size / 2.0
    
    var _step = 256
    var _start_x = int(max(0, start_pos.x / _step))
    var _start_y = int(max(0, start_pos.y / _step))
    var _end_x = int(min(5000 / _step, end_pos.x / _step))
    var _end_y = int(min(5000 / _step, end_pos.y / _step))
```

### 10.3 CharacterHub - Overlay Setup

```gdscript
# client/src/ui/CharacterHub.gd
extends Control

## CharacterHub - Unified Hub for Character-related screens
## Manages Hero List, Party/Formation, and Achievements as tabs.

@onready var tab_container = %TabContainer
@onready var close_btn = %CloseBtn

func setup_as_overlay(data: Dictionary = {}):
    # Position container correctly to clear sidebar
    if has_node("MarginContainer"):
        $MarginContainer.offset_left = 160 # Matches SideHUD width
        $MarginContainer.offset_right = 0
        $MarginContainer.offset_top = 0
        $MarginContainer.offset_bottom = 0
    
    # Recursively setup children that are designed as overlays
    for child in tab_container.get_children():
        if child.has_method("setup_as_overlay"):
            child.setup_as_overlay(data)
    
    # Handle initial tab selection if provided
    if data.has("tab_index"):
        tab_container.current_tab = data.tab_index

func _ready():
    close_btn.pressed.connect(func(): UIManager.close_overlay("CharacterHub"))
    tab_container.tab_changed.connect(_on_tab_changed)

func _on_tab_changed(tab_idx: int):
    var current_tab = tab_container.get_child(tab_idx)
    if current_tab.has_method("refresh"):
        current_tab.refresh()
```

### 10.4 Dynamic Style Creation

```gdscript
func _setup_styles():
    _style_tab_normal = StyleBoxFlat.new()
    _style_tab_normal.bg_color = Color(1, 1, 1, 0.03)
    _style_tab_normal.corner_radius_top_left = 8
    _style_tab_normal.corner_radius_top_right = 8
    _style_tab_normal.content_margin_left = 12
    _style_tab_normal.content_margin_top = 6
    
    _style_tab_hover = StyleBoxFlat.new()
    _style_tab_hover.bg_color = Color(1, 1, 1, 0.08)
    _style_tab_hover.corner_radius_top_left = 8
    _style_tab_hover.corner_radius_top_right = 8
```

---

## 11. 2D Game Strategies

### 11.1 UI Scaling

Gunakan [`canvas_items`](client/project.godot:37) stretch mode:

```ini
# project.godot
window/size/viewport_width=1300
window/size/viewport_height=650
window/stretch/mode="canvas_items"
```

### 11.2 Node Types untuk 2D

| Use Case | Node Type |
|----------|-----------|
| UI Screens | `Control` / `CanvasLayer` |
| Game World | `Node2D` |
| Sprites | `Sprite2D` |
| Animations | `AnimationPlayer` / `AnimatedSprite2D` |
| Particles | `CPUParticles2D` |
| SideHUD Overlay | `CanvasLayer` dengan `layer = 110` |

### 11.3 Z-Ordering dengan CanvasLayer

```gdscript
# SideHUD - selalu di atas
var side_hud = CanvasLayer.new()
side_hud.layer = 110  # Higher = more on top

# Overlay UI
var ui_layer = CanvasLayer.new()
ui_layer.layer = 100
```

### 11.4 Tweening Animations

```gdscript
# Selection animation
var tw = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
tw.tween_property(btn, "scale", Vector2(0.9, 0.9), 0.05)
tw.tween_property(btn, "scale", Vector2(1.1, 1.1), 0.15)

# Progress bar animation
var tw = create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
tw.tween_property(progress_bar, "value", float(used), 0.4)

# Hover animation
var tw = create_tween().set_parallel(true).set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
tw.tween_property(node, "scale", Vector2(1.06, 1.06), 0.1)
```

### 11.5 Projectile dengan Tween

```gdscript
# client/assets/projectiles/projectile.gd
extends Node2D

func launch(start_pos: Vector2, target_pos: Vector2, duration: float = 0.3, p_color: Color = Color.WHITE):
    position = start_pos
    # Rotate to face target
    look_at(target_pos)
    
    if has_node("Visual"):
        $Visual.modulate = p_color
    
    var tween = create_tween()
    tween.set_trans(Tween.TRANS_LINEAR)
    tween.tween_property(self, "position", target_pos, duration)
    await tween.finished
    queue_free()
```

### 11.6 One-Shot VFX dengan Auto-Cleanup

```gdscript
# client/assets/vfx/one_shot_vfx.gd
extends CPUParticles2D

func _ready():
    one_shot = true
    emitting = true
    finished.connect(_on_finished)

func _on_finished():
    queue_free()
```

---

## 12. Performance Optimization

### 12.1 Caching Patterns

Gunakan caching untuk data yang sering diakses:

```gdscript
# Memory cache
var _data_cache = {}

func get_asset(category: String, id: int) -> Dictionary:
    var cache_key = category + "_" + str(id)
    
    if _data_cache.has(cache_key):
        return _data_cache.get(cache_key)
    
    var asset = _load_asset(category, id)
    _data_cache[cache_key] = asset
    return asset
```

### 12.2 Lazy Loading

Jangan load semua data di awal:

```gdscript
func _on_category_pressed(category: String):
    _current_category = category
    
    if category == "Maps":
        _fetch_treasure_maps()  # Lazy load
        return
    
    _apply_filter()
```

### 12.3 Signal-based Communication

Gunakan signals untuk decoupling:

```gdscript
# ✅ Better - decoupled via signals
ServerConnector.request_completed.connect(_on_request_completed)
GameState.heroes_loaded.connect(_on_heroes_loaded)
```

### 12.4 Minimize _process() Usage

Gunakan timer untuk periodic updates:

```gdscript
func _setup_time_timer():
    var timer = Timer.new()
    timer.name = "TimeTickTimer"
    timer.wait_time = 60.0  # Sync with server every minute
    timer.timeout.connect(func(): if current_user: ServerConnector.fetch_world_state())
    add_child(timer)
    timer.start()
```

### 12.5 Batch Operations

```gdscript
func _populate_grid():
    for child in grid.get_children(): 
        child.queue_free()  # Batch cleanup
    
    for i in range(_filtered_data.size()):
        var slot = _create_slot_node()
        grid.add_child(slot)
        _fill_slot(slot, _filtered_data[i])
        _animate_slot_appearance(slot, i * 0.01)  # Staggered
```

### 12.6 Frustum Culling

```gdscript
# client/src/ui/AtlasBase.gd
func _update_map_tiles():
    var view_size = get_viewport_rect().size / cam.zoom
    var center = cam.position
    var start_pos = center - view_size / 2.0
    var end_pos = center + view_size / 2.0
    
    var _step = 256
    var _start_x = int(max(0, start_pos.x / _step))
    var _start_y = int(max(0, start_pos.y / _step))
    var _end_x = int(min(5000 / _step, end_pos.x / _step))
    var _end_y = int(min(5000 / _step, end_pos.y / _step))
```

---

## 13. Behavior Tree (BT) Templates

### 13.1 BT Node Template

```
client/script_templates/BTNode/default.gd
```

```gdscript
# meta-default: true
# meta-description: Base template for behavior nodes
extends _BASE_

func enter():
    super()

func exit(is_interrupted : bool):
    super(is_interrupted)

func tick(delta : float):
    super(delta)
    _set_status(Status.undefined)
```

### 13.2 BT Composite Template

```
client/script_templates/BTComposite/default.gd
```

```gdscript
# meta-default: true
# meta-description: Base template for Composites
extends _BASE_

func enter():
    super()

func exit(is_interrupted : bool):
    super(is_interrupted)

func tick(delta : float):
    super(delta)
    
    if _active_child == null:
        _set_status(Status.failure)
        return
    
    _set_status(Status.undefined)
```

### 13.3 BT Decorator Template

```
client/script_templates/BTDecorator/default.gd
```

```gdscript
# meta-default: true
# meta-description: Base template for Decorators
extends _BASE_

func enter():
    super()

func exit(is_interrupted : bool):
    super(is_interrupted)

func tick(delta : float):
    super(delta)
    
    if _active_child == null:
        _set_status(Status.failure)
        return
    
    _set_status(Status.undefined)
```

---

## 14. Error Handling & ErrorCodes

### 14.1 ErrorCodes Structure

ErrorCodes adalah centralized error registry dengan 150+ error codes:

```gdscript
# client/src/constants/ErrorCodes.gd
class_name ErrorCodes

# ===========================================
# Authentication Errors (AUTH_*)
# ===========================================
const AUTH_INVALID_CREDENTIALS: String = "AUTH_INVALID_CREDENTIALS"
const AUTH_USER_NOT_FOUND: String = "AUTH_USER_NOT_FOUND"
const AUTH_SESSION_EXPIRED: String = "AUTH_SESSION_EXPIRED"
const AUTH_UNAUTHORIZED: String = "AUTH_UNAUTHORIZED"
const AUTH_FORBIDDEN: String = "AUTH_FORBIDDEN"

# ===========================================
# Hero Errors (HERO_*)
# ===========================================
const HERO_NOT_FOUND: String = "HERO_NOT_FOUND"
const HERO_DEAD: String = "HERO_DEAD"
const HERO_LOW_LEVEL: String = "HERO_LOW_LEVEL"
const HERO_ALREADY_SPECIALIZED: String = "HERO_ALREADY_SPECIALIZED"

# ===========================================
# Network Errors (NETWORK_*)
# ===========================================
const NETWORK_CONNECTION_ERROR: String = "NETWORK_CONNECTION_ERROR"
const NETWORK_TIMEOUT: String = "NETWORK_TIMEOUT"
```

### 14.2 Error Messages Dictionary

```gdscript
const ERROR_MESSAGES: Dictionary = {
    AUTH_INVALID_CREDENTIALS: "Invalid username or password",
    AUTH_SESSION_EXPIRED: "Your session has expired. Please log in again.",
    HERO_NOT_FOUND: "Hero not found",
    HERO_DEAD: "Hero is dead",
    NETWORK_CONNECTION_ERROR: "Unable to connect to server",
    # ... 150+ more entries
}

static func get_message(error_code: String) -> String:
    if ERROR_MESSAGES.has(error_code):
        return ERROR_MESSAGES[error_code]
    return error_code
```

### 14.3 Error Classification Helpers

```gdscript
## Check if error code is an authentication error
static func is_auth_error(error_code: String) -> bool:
    return error_code.begins_with("AUTH_")

## Check if error code indicates user/hero is busy
static func is_busy_error(error_code: String) -> bool:
    return error_code.ends_with("_BUSY") or error_code == "USER_BUSY"

## Check if error is recoverable (user can retry)
static func is_recoverable(error_code: String) -> bool:
    var non_recoverable: Array = [
        AUTH_SESSION_EXPIRED,
        AUTH_FORBIDDEN,
        USER_UNCONSCIOUS,
        HERO_DEAD,
    ]
    return not non_recoverable.has(error_code)
```

---

## 15. Localization System

### 15.1 LocalizationManager

Simple dictionary-based localization:

```gdscript
# client/src/autoload/LocalizationManager.gd
extends Node

const LOCALIZED_STRINGS = {
    "en": {
        "status_preparing": "Preparing the realm...",
        "status_updating": "Updating Assets: %d / %d",
        "status_ready": "The Realm is Ready. Welcome, Traveler.",
        "tips": [
            "TIP: Units in the frontline take more damage but protect the back.",
            "TIP: Gathering resources in high-danger zones yields rarer materials.",
        ],
        "logs": [
            "UNROLLING ANCIENT MAPS...",
            "BREWING VITALITY POTIONS...",
        ]
    },
    "id": {
        "status_preparing": "Mempersiapkan dunia...",
        "status_updating": "Memperbarui Aset: %d / %d",
        "status_ready": "Dunia Sudah Siap. Selamat Datang, Penjelajah.",
    }
}

var current_lang: String = "en"

func translate(key: String, params: Array = []) -> String:
    if not LOCALIZED_STRINGS.has(current_lang):
        return key
    
    var lang_data = LOCALIZED_STRINGS[current_lang]
    var text = lang_data.get(key, key)
    
    if text is Array:
        return text.pick_random()
    
    if params.size() > 0:
        return text % params
    
    return text
```

---

## Quick Reference Cheatsheet

| Category | Pattern | Example |
|----------|---------|---------|
| Scene file | PascalCase | `InventoryScreen.tscn` |
| Script file | snake_case | `inventory_screen.gd` |
| Variable | snake_case | `current_heroes` |
| Private var | snake_case + `_` | `_filtered_data` |
| Constant | SCREAMING_SNAKE | `DATA_DIR`, `AUTH_INVALID_CREDENTIALS` |
| @onready | `%NodeName` | `@onready var grid = %Grid` |
| Type hint | `: Type` | `var count: int = 0` |
| Signal emit | `.emit()` | `heroes_loaded.emit(count)` |
| class_name | PascalCase | `class_name ErrorCodes` |
| Enum | PascalCase + SCREAMING | `Status.undefined` |
| Autoload access | Direct name | `GameState.current_user` |
| Safe node | `has_node()` + ternary | `$Node if has_node("Node") else null` |
| Cleanup | `_exit_tree()` | Override untuk disconnect signals |
| Factory | `static func create_` | `StatDisplay.create_from_config(parent, config)` |

---

## Referensi Files Lengkap

- [project.godot](client/project.godot) - Konfigurasi proyek
- [game_state.gd](client/src/autoload/game_state.gd) - Contoh autoload state management
- [data_manager.gd](client/src/autoload/data_manager.gd) - Contoh caching & loading
- [LocalizationManager.gd](client/src/autoload/LocalizationManager.gd) - Contoh localization
- [ErrorCodes.gd](client/src/constants/ErrorCodes.gd) - Contoh constants registry (794 lines)
- [InventoryScreen.gd](client/src/ui/InventoryScreen.gd) - Contoh UI complex
- [SideHUD.gd](client/src/ui/SideHUD.gd) - Contoh autoload UI component
- [TopHUD.gd](client/src/ui/TopHUD.gd) - Contoh complex UI dengan resource bars
- [AtlasBase.gd](client/src/ui/AtlasBase.gd) - Contoh map system
- [CharacterHub.gd](client/src/ui/CharacterHub.gd) - Contoh overlay setup
- [BaseNetworkHandler.gd](client/src/network/BaseNetworkHandler.gd) - Contoh base class
- [StatHandler.gd](client/src/network/StatHandler.gd) - Contoh network handler
- [InventoryHandler.gd](client/src/network/InventoryHandler.gd) - Contoh response handling
- [AuthHandler.gd](client/src/network/AuthHandler.gd) - Contoh device detection
- [SocketHandler.gd](client/src/network/SocketHandler.gd) - Contoh comprehensive signals
- [ServerConnector.gd](client/src/autoload/server_connector.gd) - Contoh facade pattern
- [UIManager.gd](client/src/autoload/ui_manager.gd) - Contoh overlay management
- [LoadingScreen.gd](client/src/ui/loading/LoadingScreen.gd) - Contoh coordinator pattern
- [SyncManager.gd](client/src/ui/loading/managers/SyncManager.gd) - Contoh manager dengan cleanup
- [ProgressManager.gd](client/src/ui/loading/managers/ProgressManager.gd) - Contoh progress handling
- [HeroCard.gd](client/src/ui/components/HeroCard.gd) - Contoh reusable component
- [SideNavButton.gd](client/src/ui/components/SideNavButton.gd) - Contoh button component
- [StatRow.gd](client/src/ui/components/StatRow.gd) - Contoh stat display
- [StatDisplay.gd](client/src/ui/components/StatDisplay.gd) - Contoh complex stat component
- [StatComparison.gd](client/src/ui/components/StatComparison.gd) - Contoh comparison UI
- [projectile.gd](client/assets/projectiles/projectile.gd) - Contoh tween animation
- [one_shot_vfx.gd](client/assets/vfx/one_shot_vfx.gd) - Contoh auto-cleanup VFX

extends Control

## SideHUD Orchestrator - SRP Refactor
## Manages global visibility and coordinates sub-components.

# === COMPONENT REFERENCES ===
@onready var resources = %Resources
@onready var status = %Status
@onready var navigation = %Navigation
@onready var social = %Social
@onready var system = %System

var _ui_update_timer: Timer

func _ready():
    _setup_ui_update_timer()
    _check_visibility()
    
    # Initial visibility check on scene changes
    get_tree().node_added.connect(func(_n): _check_visibility())

func _setup_ui_update_timer():
    _ui_update_timer = Timer.new()
    _ui_update_timer.wait_time = 1.0 # Global update pulse
    _ui_update_timer.timeout.connect(_on_ui_update_pulse)
    add_child(_ui_update_timer)
    _ui_update_timer.start()

func _on_ui_update_pulse():
    # Each component handles its own internal update logic, 
    # but we can trigger a refresh if needed.
    if status.has_method("update_all"): status.update_all()
    if system.has_method("update_all"): system.update_all()
    if social.has_method("update_display"): social.update_display()

func _check_visibility():
    if not is_inside_tree(): return
    _do_check_visibility.call_deferred()

func _do_check_visibility():
    if not is_inside_tree(): return
    var tree = get_tree()
    if not tree: return
    var current_scene = tree.current_scene
    if not current_scene: return
    
    var path = current_scene.scene_file_path
    var hidden_screens = ["LoadingScreen", "LoginScreen", "AuthScreen"]
    
    var should_hide = false
    for screen in hidden_screens:
        if screen in path:
            should_hide = true
            break
            
    visible = !should_hide

# Compatibility method for external calls
func refresh_stats():
    if GameState.selected_hero_id != -1:
        ServerConnector.fetch_unit_stats(GameState.selected_hero_id)

extends Control

## RESPONSIBILITY: Coordinator for the Login system
## SINGLE RESPONSIBILITY: UI Interaction and Module Orchestration

# UI NODES
@onready var username_input = $LoginPanel/MarginContainer/VBoxContainer/UsernameInput
@onready var password_input = $LoginPanel/MarginContainer/VBoxContainer/PasswordInput
@onready var remember_me_check = $LoginPanel/MarginContainer/VBoxContainer/RememberMeCheck
@onready var login_button = $LoginPanel/MarginContainer/VBoxContainer/LoginButton
@onready var status_label = $LoginPanel/MarginContainer/VBoxContainer/StatusLabel
@onready var login_panel = $LoginPanel
@onready var background = $Background
@onready var magic_sigil = $MagicSigil
@onready var rune_system = $RuneFloatingSystem

# MODULES
var auth = LoginAuthManager.new()
var preloader = LoginPreloader.new()
var vfx = LoginVFXManager.new()

# STATE
var _is_transitioning: bool = false
var _loading_cancelled: bool = false

func _ready() -> void:
    _setup_modules()
    _load_saved_creds()
    
    login_button.pressed.connect(_on_login_pressed)
    
    # Try auto-login if session exists
    if auth.check_auto_login():
        status_label.text = "Verifying session..."
        login_button.disabled = true

func _setup_modules() -> void:
    add_child(auth)
    add_child(preloader)
    add_child(vfx)
    
    # Link VFX references
    vfx.login_panel = login_panel
    vfx.background = background
    vfx.magic_sigil = magic_sigil
    vfx.rune_system = rune_system
    
    # Connect signals
    auth.login_started.connect(_on_auth_started)
    auth.login_success.connect(_on_auth_success)
    auth.login_failed.connect(_on_auth_failed)
    
    preloader.preload_progress.connect(_on_preload_progress)
    preloader.preload_completed.connect(_on_preload_completed)

func _load_saved_creds() -> void:
    var creds = auth.load_credentials()
    username_input.text = creds.username
    password_input.text = creds.password
    remember_me_check.button_pressed = creds.remember_me

func _on_login_pressed() -> void:
    var u = username_input.text.strip_edges()
    var p = password_input.text.strip_edges()
    var remember = remember_me_check.button_pressed
    
    auth.login(u, p, remember)

func _on_auth_started() -> void:
    vfx.set_login_progress(true)
    login_button.disabled = true
    status_label.text = "Handshaking..."
    status_label.add_theme_color_override("font_color", Color(1, 0.8, 0.2))

func _on_auth_success(_user_data: Dictionary) -> void:
    status_label.text = "Syncing world state..."
    
    # Save credentials if Remember Me is on
    if GameState.remember_me:
        auth.save_credentials(username_input.text, password_input.text, true)
    
    # Start preloading — use GameState.current_user which is already correctly
    # set by LoginAuthManager.set_user() before this signal fires.
    # NOTE: _user_data is at the {user, session} nesting level and does NOT
    # contain currentRegion directly; GameState.current_user is the real user object.
    var user: Dictionary = GameState.current_user if GameState.current_user else _user_data
    var user_id: int = int(user.get("id", 0))
    var current_region: int = int(user.get("currentRegion", 0))
    preloader.start_preloading(user_id, current_region)

func _on_auth_failed(error: String) -> void:
    vfx.set_login_progress(false)
    login_button.disabled = false
    status_label.text = "Unauthorized: " + error
    status_label.add_theme_color_override("font_color", Color(0.9, 0.3, 0.3))

func _on_preload_progress(message: String) -> void:
    status_label.text = message

func _on_preload_completed(region_data: Dictionary) -> void:
    if _is_transitioning: return
    _is_transitioning = true
    
    status_label.text = "READY."
    status_label.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))
    
    await vfx.play_success_flash()
    
    if is_inside_tree():
        _handle_scene_transition(region_data)

func _handle_scene_transition(region_data: Dictionary) -> void:
    # Small grace period for the flash
    await get_tree().create_timer(0.2).timeout
    if not is_inside_tree(): return
    
    var target_scene = ""
    if GameState.active_task and GameState.active_task.type == "TRAVEL":
        target_scene = "res://src/ui/map/MapScreen.tscn"
    else:
        target_scene = GameState.get_region_scene(region_data.get("type", ""))
        GameState.last_visited_hub = target_scene
    
    if LoadingUtils.validate_scene_path(target_scene):
        get_tree().change_scene_to_file(target_scene)

func _input(event):
    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        if not _loading_cancelled:
            _cancel_loading_sequence()

func _cancel_loading_sequence():
    _loading_cancelled = true
    status_label.text = LocalizationManager.translate("status_cancelling")
    
    # Return to login (self transition to reset)
    get_tree().change_scene_to_file("res://src/ui/login/LoginScreen.tscn")

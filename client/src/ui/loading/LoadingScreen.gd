extends Control

## RESPONSIBILITY: Main coordinator for the Loading Screen system
## SINGLE RESPONSIBILITY: Orchestrates sub-managers and high-level flow

# COMPONENTS (UI Nodes)
@onready var magic_sigil = $MagicSigil
@onready var loading_bar = $VBoxContainer/LoadingBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var tip_label = $VBoxContainer/TipLabel
@onready var chronicle_logs = $ChronicleLogs
@onready var rune_dust = $RuneDust
@onready var rune_particles = $RuneParticles

# MANAGERS (Initialized in _ready)
var sync = SyncManager.new()
var log_manager = LogManager.new()
var tip_manager = TipManager.new()
var particles = ParticleManager.new()
var ripples = RippleManager.new()

# State
var _is_exiting: bool = false
var _loading_cancelled: bool = false

func _ready():
    _setup_managers()
    _setup_accessibility()
    _start_flow()

func _setup_managers():
    # Add managers as children for lifecycle management
    add_child(sync)
    add_child(log_manager)
    add_child(tip_manager)
    add_child(particles)
    add_child(ripples)
    
    # Link UI nodes to managers
    log_manager.chronicle_logs = chronicle_logs
    tip_manager.tip_label = tip_label
    particles.rune_dust_container = rune_dust
    particles.rune_particles_container = rune_particles
    
    # Connect sync signals
    sync.sync_progress.connect(_on_sync_progress)
    sync.sync_completed.connect(_on_sync_finished)
    sync.sync_error.connect(_on_sync_error)
    
    # Connect version check signals
    sync.version_check_started.connect(_on_version_check_started)
    sync.version_check_completed.connect(_on_version_check_completed)
    sync.version_check_failed.connect(_on_version_check_failed)

func _setup_accessibility():
    loading_bar.tooltip_text = LocalizationManager.translate("status_updating", [0, 100])
    status_label.tooltip_text = LocalizationManager.translate("status_preparing")
    tip_label.tooltip_text = "Helpful gameplay tip"
    magic_sigil.tooltip_text = "Magical sigil animation"
    
    status_label.focus_mode = Control.FOCUS_NONE
    tip_label.focus_mode = Control.FOCUS_NONE
    chronicle_logs.focus_mode = Control.FOCUS_NONE
    loading_bar.focus_mode = Control.FOCUS_NONE

func _start_flow():
    status_label.text = LocalizationManager.translate("status_preparing")
    
    # Small delay to ensure everything is ready
    await get_tree().create_timer(0.1).timeout
    if _is_exiting or _loading_cancelled: return
    
    _start_version_check()

func _start_version_check():
    status_label.text = "Checking for updates..."
    
    # Call DataManager's version check method
    if DataManager and DataManager.has_method("check_server_versions"):
        DataManager.check_server_versions()
    else:
        # Fallback to direct sync if version check not available
        _start_patching()

func _on_version_check_started():
    status_label.text = "Checking for updates..."

func _on_version_check_completed(needs_update: bool) -> void:
    if needs_update:
        status_label.text = "Updates available. Downloading..."
        _start_patching()
    else:
        status_label.text = "Game is up to date."
        await get_tree().create_timer(0.5).timeout
        _transition_to_login()

func _on_version_check_failed(error: String) -> void:
    print("[LoadingScreen] Version check status: " + error)
    
    # Update status label with retry info
    status_label.text = "⚠ Connection: " + error
    log_manager.add_custom_entry("[color=orange]" + error + "[/color]")
    
    # DO NOT transition to login. DataManager will keep retrying and emit version_check_completed on success.
    # We stay on this screen to ensure data integrity.

func _start_patching():
    status_label.text = LocalizationManager.translate("status_checking")
    sync.start_sync()

func _on_sync_progress(current: int, total: int):
    var percent = 0.0
    if total > 0:
        percent = float(current) / float(total) * 100
    
    if loading_bar:
        loading_bar.update_progress(percent)
    status_label.text = LocalizationManager.translate("status_updating", [current, total])

func _on_sync_finished():
    status_label.text = LocalizationManager.translate("status_ready")
    if loading_bar:
        loading_bar.update_progress(100)

    if magic_sigil and magic_sigil.has_method("play_final_flash"):
        var flash_result = magic_sigil.play_final_flash()
        if flash_result is Signal:
            var timeout_timer = get_tree().create_timer(LoadingUtils.SCENE_TRANSITION_TIMEOUT)
            await LoadingUtils.race_signal_or_timer(get_tree(), flash_result, timeout_timer, func(): return _is_exiting)

    if _is_exiting: return

    await get_tree().create_timer(0.5).timeout
    _transition_to_login()

func _transition_to_login():
    if _is_exiting: return
    
    var fade_tween = create_tween()
    fade_tween.tween_property(self, "modulate:a", 0.0, 0.5)
    await fade_tween.finished

    var target_scene = "res://src/ui/login/LoginScreen.tscn"
    if LoadingUtils.validate_scene_path(target_scene):
        get_tree().change_scene_to_file(target_scene)

func _on_sync_error(_error_type: String, error_message: String):
    status_label.text = "Error: " + error_message
    
    if sync.can_retry():
        var count = sync.get_error_count()
        status_label.text = LocalizationManager.translate("status_retrying", [count, 3])
        await get_tree().create_timer(2.0).timeout
        _start_patching()
    else:
        status_label.text = LocalizationManager.translate("status_failed", [3])
        _show_restart_option()

func _show_restart_option():
    if has_node("restart_button"):
        $restart_button.visible = true

func _input(event):
    if event is InputEventMouseButton and event.pressed:
        ripples.create_ripple(event.position)
    
    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        if not _loading_cancelled:
            _cancel_loading_sequence()

func _cancel_loading_sequence():
    _loading_cancelled = true
    status_label.text = LocalizationManager.translate("status_cancelling")
    
    # Return to login
    get_tree().change_scene_to_file("res://src/ui/login/LoginScreen.tscn")

func _process(delta):

    var current_val: float = 0.0

    var progress_bar = loading_bar.get_node_or_null("ProgressBar") if loading_bar else null

    

    if progress_bar:

        current_val = progress_bar.value

    

    if magic_sigil and magic_sigil.has_method("update_animation"):

        magic_sigil.update_animation(delta, current_val)



func _exit_tree():

    _is_exiting = true

extends Control

@onready var username_input = $LoginPanel/MarginContainer/VBoxContainer/UsernameInput
@onready var password_input = $LoginPanel/MarginContainer/VBoxContainer/PasswordInput
@onready var login_button = $LoginPanel/MarginContainer/VBoxContainer/LoginButton
@onready var status_label = $LoginPanel/MarginContainer/VBoxContainer/StatusLabel

const SAVE_PATH = "user://auth.cfg"

var heroes_loaded = false
var inventory_loaded = false
var region_loaded = false
var region_data = null
var _is_transitioning = false
var _time_accumulator = 0.0

# Animation State
var _login_in_progress = false
var _sigil_intensity = 0.0
var _rune_spawn_timer = 0.0
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛟ", "ᛞ"]

func _ready():
    _load_credentials()
    login_button.pressed.connect(_on_login_pressed)
    ServerConnector.login_success.connect(_on_login_success)
    ServerConnector.login_failed.connect(_on_login_failed)
    ServerConnector.request_completed.connect(_on_request_completed)
    
    # Force initial visibility
    if has_node("MagicSigil"):
        $MagicSigil.update_animation(0, 0)

func _process(delta):
    _time_accumulator += delta
    
    # 1. Floating Panel Effect
    if has_node("LoginPanel") and has_node("Background"):
        var base_y = ($Background.size.y / 2 - $LoginPanel.size.y / 2)
        var offset_y = sin(_time_accumulator * 1.5) * 5.0
        $LoginPanel.position.y = base_y + offset_y

    # 2. Magic Sigil Animation
    if has_node("MagicSigil"):
        var target_intensity = 80.0 if _login_in_progress else 0.0
        _sigil_intensity = move_toward(_sigil_intensity, target_intensity, delta * 30.0)
        $MagicSigil.update_animation(delta, _sigil_intensity)

    # 3. Rune Particle Spawner
    _spawn_runes(delta)

func _spawn_runes(delta):
    if !has_node("RuneFloatingSystem"): return
    
    _rune_spawn_timer += delta
    # Spawn rate: faster when logging in
    var spawn_rate = 0.1 if _login_in_progress else 0.4
    
    if _rune_spawn_timer > spawn_rate:
        _rune_spawn_timer = 0.0
        var rune = Label.new()
        rune.text = RUNES.pick_random()
        rune.add_theme_font_size_override("font_size", randi_range(16, 28))
        # Gold/White color with low alpha
        var start_color = Color(1, 0.9, 0.5, 0.0)
        rune.modulate = start_color
        
        # Random position at bottom
        var screen_w = get_viewport_rect().size.x
        var screen_h = get_viewport_rect().size.y
        rune.position = Vector2(randf_range(0, screen_w), screen_h + 20)
        
        $RuneFloatingSystem.add_child(rune)
        
        # Animate Upwards
        var duration = randf_range(4.0, 7.0)
        var end_y = rune.position.y - randf_range(200, 400)
        var sway = randf_range(-50, 50)
        
        var tw = create_tween()
        tw.set_parallel(true)
        tw.tween_property(rune, "position:y", end_y, duration)
        tw.tween_property(rune, "position:x", rune.position.x + sway, duration)
        tw.tween_property(rune, "modulate:a", 0.6, duration * 0.2) # Fade in
        tw.tween_property(rune, "modulate:a", 0.0, duration * 0.3).set_delay(duration * 0.7) # Fade out
        
        # Cleanup
        tw.chain().tween_callback(rune.queue_free)

func _on_login_pressed():
    var username = username_input.text
    var password = password_input.text
    
    if username == "" or password == "":
        status_label.text = "Enter username and password"
        return
    
    _login_in_progress = true
    status_label.text = "Handshaking..."
    status_label.add_theme_color_override("font_color", Color(1, 0.8, 0.2)) # Gold status
    
    ServerConnector.login_with_password(username, password)

func _on_login_success(user):
    status_label.text = "Syncing world state..."
    GameState.set_user(user)
    _save_credentials(username_input.text, password_input.text)
    
    # Start Parallel Pre-loading
    ServerConnector.fetch_heroes(user.id)
    ServerConnector.fetch_inventory(user.id)
    ServerConnector.get_region_details(user.currentRegion)

func _on_request_completed(endpoint, data):
    if endpoint.contains("/heroes"):
        heroes_loaded = true
    elif endpoint.contains("/inventory"):
        inventory_loaded = true
    elif endpoint.contains("/region/"):
        region_loaded = true
        region_data = data
        GameState.current_region_data = data
    
    _check_transition()

func _check_transition():
    if heroes_loaded and inventory_loaded and region_loaded and !_is_transitioning:
        _is_transitioning = true
        status_label.text = "READY."
        status_label.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4)) # Green Success
        
        # Trigger Sigil Flash
        if has_node("MagicSigil"):
            await $MagicSigil.play_final_flash()
        
        # Safety check before timer
        if !is_inside_tree(): return
        await get_tree().create_timer(0.2).timeout
        
        # Safety check after timer
        if !is_inside_tree(): return
        
        if GameState.active_task:
            if GameState.active_task.type == "TRAVEL":
                get_tree().change_scene_to_file("res://src/ui/WorldAtlas.tscn")
                return
        
        if region_data.type == "TOWN":
            GameState.last_visited_hub = "res://src/ui/TownScreen.tscn"
            get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
        else:
            GameState.last_visited_hub = "res://src/ui/WildernessScreen.tscn"
            get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

func _on_login_failed(error):
    _login_in_progress = false
    status_label.text = "Unauthorized: " + error
    status_label.add_theme_color_override("font_color", Color(0.9, 0.3, 0.3)) # Red error

# --- PERSISTENCE LOGIC ---

func _save_credentials(username, password):
    var config = ConfigFile.new()
    config.set_value("auth", "username", username)
    config.set_value("auth", "password", password)
    config.save(SAVE_PATH)

func _load_credentials():
    var config = ConfigFile.new()
    var err = config.load(SAVE_PATH)
    if err == OK:
        username_input.text = config.get_value("auth", "username", "player1")
        password_input.text = config.get_value("auth", "password", "")

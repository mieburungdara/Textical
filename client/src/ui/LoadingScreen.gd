extends Control

# COMPONENTS
@onready var magic_sigil = $MagicSigil
@onready var loading_bar = $VBoxContainer/LoadingBar
@onready var status_label = $VBoxContainer/StatusLabel
@onready var tip_label = $VBoxContainer/TipLabel
@onready var chronicle_logs = $ChronicleLogs
@onready var rune_dust = $RuneDust
@onready var rune_particles = $RuneParticles

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛟ", "ᛞ"]

const TIPS = [
    "TIP: Units in the frontline take more damage but protect the back.",
    "TIP: Gathering resources in high-danger zones yields rarer materials.",
    "TIP: Visit the Tavern daily to recruit specialized mercenaries.",
    "TIP: Check the Market often for bargain equipment from other players.",
    "TIP: Crafting higher-tier items requires a stable workbench in town.",
	"TIP: A tired hero recovers faster within the warmth of a town tavern."
]

const FANTASY_LOGS = [
    "UNROLLING ANCIENT MAPS...",
    "BREWING VITALITY POTIONS...",
    "SUMMONING THE VANGUARD...",
    "CONSULTING THE ELDER ORACLE...",
    "SHARPENING RUSTY BLADES...",
    "LIGHTING THE TAVERN HEARTH...",
    "MAPPING FORBIDDEN REALMS...",
	"DECIPHERING OLD SCROLLS..."
]

func _ready():
    _generate_rune_dust(20)
    _spawn_rune_particle_loop()

    status_label.text = "Preparing the realm..."
    tip_label.text = TIPS.pick_random()
    
    # Rotate tips & logs
    get_tree().create_timer(4.0).timeout.connect(_change_tip)
    get_tree().create_timer(0.6).timeout.connect(_add_chronicle_log)
    
    # Connect to DataManager signals
    DataManager.sync_progress.connect(_on_sync_progress)
    DataManager.sync_finished.connect(_on_sync_finished)
    
    # Global error listener
    ServerConnector.error_occurred.connect(_on_error)
    
    # Small delay to ensure everything is ready
    await get_tree().create_timer(1.0).timeout
    if not is_inside_tree(): return
    
    _start_patching()

func _spawn_rune_particle_loop():
    if is_inside_tree():
        _spawn_single_rune_particle()
        get_tree().create_timer(randf_range(0.1, 0.3)).timeout.connect(_spawn_rune_particle_loop)

func _spawn_single_rune_particle():
    var rune = Label.new()
    rune.text = RUNES.pick_random()
    rune.add_theme_font_size_override("font_size", randi_range(14, 24))
    rune.add_theme_color_override("font_color", Color(1, 0.8, 0.4, 0.2))
    
    var start_x = randf_range(0, get_viewport_rect().size.x)
    rune.position = Vector2(start_x, get_viewport_rect().size.y + 50)
    rune.pivot_offset = Vector2(10, 10)
    rune_particles.add_child(rune)
    
    var tween = create_tween()
    tween.set_parallel(true)
    var target_y = -100
    var duration = randf_range(4.0, 7.0)
    tween.tween_property(rune, "position:y", target_y, duration)
    tween.tween_property(rune, "position:x", start_x + randf_range(-100, 100), duration)
    tween.tween_property(rune, "rotation", randf_range(-PI, PI), duration)
    tween.tween_property(rune, "modulate:a", 0.0, duration).set_delay(duration * 0.5)
    
    await tween.finished
    if is_instance_valid(rune): rune.queue_free()

func _process(delta):
    var current_val = 0.0
    if loading_bar:
        current_val = loading_bar.progress_bar.value
    
    if magic_sigil:
        magic_sigil.update_animation(delta, current_val)

var _is_transitioning = false
var _ripple_tex: ImageTexture = null

func _input(event):
    if event is InputEventMouseButton and event.pressed:
        _spawn_ripple(event.position)

func _spawn_ripple(pos: Vector2):
    if _ripple_tex == null:
        var img = Image.create(32, 32, false, Image.FORMAT_RGBA8)
        for y in range(32):
            for x in range(32):
                var dist = Vector2(x-16, y-16).length()
                if dist < 14: img.set_pixel(x, y, Color(1, 1, 1, 1.0))
        _ripple_tex = ImageTexture.create_from_image(img)
    
    var ripple = TextureRect.new()
    ripple.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    ripple.texture = _ripple_tex
    ripple.custom_minimum_size = Vector2(40, 40)
    ripple.position = pos - Vector2(20, 20)
    ripple.pivot_offset = Vector2(20, 20)
    ripple.scale = Vector2.ZERO
    ripple.modulate = Color(1, 0.8, 0.4, 0.3)
    ripple.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(ripple)
    
    var tween = create_tween()
    tween.set_parallel(true)
    tween.tween_property(ripple, "scale", Vector2(4, 4), 0.6).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT) 
    tween.tween_property(ripple, "modulate:a", 0.0, 0.6)
    await tween.finished
    if is_instance_valid(ripple): ripple.queue_free()

func _generate_rune_dust(count):
    for i in range(count):
        var rune = Label.new()
        rune.text = RUNES.pick_random()
        rune.add_theme_font_size_override("font_size", randi_range(12, 20))
        rune.add_theme_color_override("font_color", Color(1, 0.8, 0.4, randf_range(0.02, 0.1)))
        rune.position = Vector2(randf_range(50, 1000), randf_range(50, 1800))
        rune.rotation = randf_range(0, PI*2)
        rune_dust.add_child(rune)

func _add_chronicle_log():
    if is_inside_tree():
        var log_entry = FANTASY_LOGS.pick_random()
        chronicle_logs.append_text("\n[i]> " + log_entry + "[/i]")
        get_tree().create_timer(randf_range(0.5, 1.5)).timeout.connect(_add_chronicle_log)

func _change_tip():
    if is_inside_tree():
        tip_label.text = TIPS.pick_random()
        get_tree().create_timer(4.0).timeout.connect(_change_tip)

func _start_patching():
    status_label.text = "Checking for updates..."
    DataManager.start_sync()

func _on_sync_progress(current, total):
    var percent = float(current) / float(total) * 100
    loading_bar.update_progress(percent)
    status_label.text = "Updating Assets: %d / %d" % [current, total]

func _on_sync_finished():
    status_label.text = "The Realm is Ready. Welcome, Traveler."
    loading_bar.update_progress(100)
    
    if magic_sigil:
        await magic_sigil.play_final_flash()
        
    await get_tree().create_timer(1.0).timeout
    if is_inside_tree():
        get_tree().change_scene_to_file("res://src/ui/LoginScreen.tscn")

func _on_error(endpoint, message):
    if "assets" in endpoint:
        status_label.text = "Error updating assets: " + message
        await get_tree().create_timer(3.0).timeout
        if is_inside_tree(): _start_patching()

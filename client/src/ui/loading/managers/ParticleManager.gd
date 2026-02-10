class_name ParticleManager
extends Node

## RESPONSIBILITY: Rune particle effects
## SINGLE RESPONSIBILITY: Only handles rune particle spawning and animation
## Godot 4.5 Compatible

signal particle_spawned(rune: Label)
signal particle_removed(rune: Label)
signal spawning_started()
signal spawning_stopped()

# Configuration
const MIN_SPAWN_INTERVAL: float = 0.1
const MAX_SPAWN_INTERVAL: float = 0.3
const MIN_DURATION: float = 4.0
const MAX_DURATION: float = 7.0
const MIN_START_Y: float = -100.0

# Node references - will be set by LoadingScreen
var rune_dust_container: Control = null
var rune_particles_container: Control = null

# State tracking
var _spawn_timer: SceneTreeTimer = null
var _is_spawning: bool = false
var _rune_dust_nodes: Array[Label] = []

## Get viewport size safely
func _get_viewport_size() -> Vector2:
    var vp = get_viewport()
    if vp:
        return vp.get_visible_rect().size
    return Vector2(800, 600)  # Default fallback

func _ready() -> void:
    _setup_dust()
    _start_spawning()

## Setup initial rune dust
func _setup_dust() -> void:
    _generate_rune_dust(20)

## Generate rune dust particles
func _generate_rune_dust(count: int) -> void:
    var viewport_size: Vector2 = _get_viewport_size()
    
    for i in range(count):
        var rune: Label = _create_rune_label()
        rune.position = Vector2(
            randf_range(50, viewport_size.x - 50),
            randf_range(50, viewport_size.y - 50)
        )
        rune.rotation = randf_range(0, PI * 2)
        
        if rune_dust_container:
            rune_dust_container.add_child(rune)
        _rune_dust_nodes.append(rune)

## Create a new rune label

func _create_rune_label() -> Label:

    var rune: Label = Label.new()

    rune.text = LoadingUtils.RUNES.pick_random()

    rune.add_theme_font_size_override("font_size", randi_range(12, 20))


    rune.add_theme_color_override("font_color", Color(1, 0.8, 0.4, randf_range(0.02, 0.1)))
    return rune

## Start spawning particles
func _start_spawning() -> void:
    _is_spawning = true
    spawning_started.emit()
    _spawn_single_particle()
    _spawn_timer = get_tree().create_timer(randf_range(MIN_SPAWN_INTERVAL, MAX_SPAWN_INTERVAL))
    _spawn_timer.timeout.connect(_on_spawn_timer)

## Spawn a single particle
func _spawn_single_particle() -> void:
    var rune: Label = _create_rune_label()
    
    var viewport_size: Vector2 = _get_viewport_size()
    var start_x: float = randf_range(0, viewport_size.x)
    rune.position = Vector2(start_x, viewport_size.y + 50)
    rune.pivot_offset = Vector2(10, 10)
    
    if rune_particles_container:
        rune_particles_container.add_child(rune)
    
    _animate_rune(rune)
    particle_spawned.emit(rune)

## Animate a rune particle
func _animate_rune(rune: Label) -> void:
    var tween: Tween = create_tween()
    var duration: float = randf_range(MIN_DURATION, MAX_DURATION)
    
    tween.set_parallel(true)
    tween.tween_property(rune, "position:y", MIN_START_Y, duration)
    tween.tween_property(rune, "position:x", rune.position.x + randf_range(-100, 100), duration)
    tween.tween_property(rune, "rotation", randf_range(-PI, PI), duration)
    tween.tween_property(rune, "modulate:a", 0.0, duration).set_delay(duration * 0.5)
    
    tween.finished.connect(func():
        if is_instance_valid(rune):
            rune.queue_free()
            particle_removed.emit(rune)
    )

## Timer callback for spawning
func _on_spawn_timer() -> void:
    if _is_spawning:
        _spawn_single_particle()
        _spawn_timer = get_tree().create_timer(randf_range(MIN_SPAWN_INTERVAL, MAX_SPAWN_INTERVAL))
        _spawn_timer.timeout.connect(_on_spawn_timer)

## Stop spawning particles
func stop_spawning() -> void:
    _is_spawning = false
    spawning_stopped.emit()

## Check if currently spawning
func is_spawning() -> bool:
    return _is_spawning

## Get rune dust count
func get_dust_count() -> int:
    return _rune_dust_nodes.size()

## Cleanup all particles
func cleanup_all() -> void:
    stop_spawning()
    
    for rune in _rune_dust_nodes:
        if is_instance_valid(rune):
            rune.queue_free()
    _rune_dust_nodes.clear()

## Cleanup on exit
func _exit_tree() -> void:
    cleanup_all()
    
    if _spawn_timer:
        _spawn_timer.timeout.disconnect(_on_spawn_timer)
        _spawn_timer = null

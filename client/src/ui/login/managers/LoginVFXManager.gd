class_name LoginVFXManager
extends Node

## RESPONSIBILITY: Handles visual effects for the Login Screen
## SINGLE RESPONSIBILITY: Animations, particles, and floating effects

# Nodes to manage (will be set by Coordinator)
var login_panel: Control = null
var background: Control = null
var magic_sigil: Control = null
var rune_system: Control = null

# State
var _time_accumulator: float = 0.0
var _sigil_intensity: float = 0.0
var _rune_spawn_timer: float = 0.0
var _is_login_in_progress: bool = false

func _process(delta: float) -> void:
	_time_accumulator += delta
	_update_floating_panel()
	_update_magic_sigil(delta)
	_update_runes(delta)

## Handle floating animation
func _update_floating_panel() -> void:
	if login_panel and background:
		var v_size = background.size
		var p_size = login_panel.size
		var base_y = (v_size.y / 2 - p_size.y / 2)
		var offset_y = sin(_time_accumulator * 1.5) * 5.0
		login_panel.position.y = base_y + offset_y

## Handle sigil intensity
func _update_magic_sigil(delta: float) -> void:
	if magic_sigil:
		var target = 80.0 if _is_login_in_progress else 0.0
		_sigil_intensity = move_toward(_sigil_intensity, target, delta * 30.0)
		if magic_sigil.has_method("update_animation"):
			magic_sigil.update_animation(delta, _sigil_intensity)

## Handle rune spawning
func _update_runes(delta: float) -> void:
	if not rune_system: return
	
	_rune_spawn_timer += delta
	var spawn_rate = 0.1 if _is_login_in_progress else 0.4
	
	if _rune_spawn_timer > spawn_rate:
		_rune_spawn_timer = 0.0
		_spawn_single_rune()

func _spawn_single_rune() -> void:
	var rune = Label.new()
	rune.text = LoadingUtils.RUNES.pick_random()
	rune.add_theme_font_size_override("font_size", randi_range(16, 28))
	rune.modulate = Color(1, 0.9, 0.5, 0.0)
	
	var vp_size = rune_system.get_viewport_rect().size
	rune.position = Vector2(randf_range(0, vp_size.x), vp_size.y + 20)
	
	rune_system.add_child(rune)
	
	var duration = randf_range(4.0, 7.0)
	var end_y = rune.position.y - randf_range(200, 400)
	var sway = randf_range(-50, 50)
	
	var tw = create_tween()
	tw.set_parallel(true)
	tw.tween_property(rune, "position:y", end_y, duration)
	tw.tween_property(rune, "position:x", rune.position.x + sway, duration)
	tw.tween_property(rune, "modulate:a", 0.6, duration * 0.2)
	tw.tween_property(rune, "modulate:a", 0.0, duration * 0.3).set_delay(duration * 0.7)
	tw.chain().tween_callback(rune.queue_free)

## Set login progress state
func set_login_progress(in_progress: bool) -> void:
	_is_login_in_progress = in_progress

## Play completion flash
func play_success_flash() -> Signal:
	if magic_sigil and magic_sigil.has_method("play_final_flash"):
		return magic_sigil.play_final_flash()
	# Fallback if method missing
	var tw = create_tween()
	return tw.finished

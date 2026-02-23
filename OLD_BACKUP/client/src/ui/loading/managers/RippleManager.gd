class_name RippleManager
extends Node

## RESPONSIBILITY: Ripple click effects
## SINGLE RESPONSIBILITY: Only handles ripple visual effects on input
## Godot 4.5 Compatible

signal ripple_created(position: Vector2)
signal ripple_removed(position: Vector2)

# Configuration
const MAX_RIPPLES: int = 10
const RIPPLE_DURATION: float = 0.6

# State tracking
var _ripple_tex: ImageTexture = null
var _active_ripples: Array[TextureRect] = []

func _ready() -> void:
	_create_ripple_texture()

## Create ripple texture
func _create_ripple_texture() -> void:
	if _ripple_tex:
		return
	
	var img = Image.create(32, 32, false, Image.FORMAT_RGBA8)
	for y in range(32):
		for x in range(32):
			var dist = Vector2(x - 16, y - 16).length()
			if dist < 14:
				img.set_pixel(x, y, Color(1, 1, 1, 1.0))
	
	_ripple_tex = ImageTexture.create_from_image(img)

## Create a ripple at position
func create_ripple(position: Vector2) -> void:
	_cleanup_oldest_ripple()
	_spawn_ripple(position)

## Cleanup oldest ripple if at limit
func _cleanup_oldest_ripple() -> void:
	if _active_ripples.size() >= MAX_RIPPLES:
		var oldest = _active_ripples.pop_front()
		if is_instance_valid(oldest):
			oldest.queue_free()

## Spawn a new ripple
func _spawn_ripple(pos: Vector2) -> void:
	if not _ripple_tex:
		_create_ripple_texture()
	
	var ripple = TextureRect.new()
	ripple.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	ripple.texture = _ripple_tex
	ripple.custom_minimum_size = Vector2(40, 40)
	ripple.position = pos - Vector2(20, 20)
	ripple.pivot_offset = Vector2(20, 20)
	ripple.scale = Vector2.ZERO
	ripple.modulate = Color(1, 0.8, 0.4, 0.3)
	ripple.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	var target_parent = get_parent()
	if target_parent:
		target_parent.add_child(ripple)
	
	_animate_ripple(ripple)
	_active_ripples.append(ripple)
	ripple_created.emit(pos)

## Animate ripple
func _animate_ripple(ripple: TextureRect) -> void:
	var tween: Tween = create_tween()
	
	tween.set_parallel(true)
	tween.tween_property(ripple, "scale", Vector2(4, 4), RIPPLE_DURATION).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(ripple, "modulate:a", 0.0, RIPPLE_DURATION)
	
	tween.finished.connect(func():
		if is_instance_valid(ripple):
			ripple.texture = null
			ripple.queue_free()
			_active_ripples.erase(ripple)
			ripple_removed.emit(ripple.position)
	)

## Cleanup all ripples
func cleanup_all() -> void:
	for ripple in _active_ripples:
		if is_instance_valid(ripple):
			ripple.queue_free()
	_active_ripples.clear()

## Get active ripple count
func get_active_count() -> int:
	return _active_ripples.size()

## Release texture reference
func release_texture() -> void:
	_ripple_tex = null

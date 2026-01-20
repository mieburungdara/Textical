class_name UnitAnimatorComponent
extends Node

var owner_node: Control

func setup(p_owner: Control):
	owner_node = p_owner

func move_to(target_pixel: Vector2):
	var tween = owner_node.create_tween()
	tween.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(owner_node, "position", target_pixel, 0.4)
	await tween.finished

func play_attack(target_pixel: Vector2):
	var start_pos = owner_node.position
	var dir = (target_pixel - start_pos).normalized()
	var lunge = 20.0
	
	var tween = owner_node.create_tween()
	tween.tween_property(owner_node, "position", start_pos + (dir * lunge), 0.1)
	tween.tween_property(owner_node, "position", start_pos, 0.2)
	await tween.finished

func play_hit():
	var tween = owner_node.create_tween()
	tween.tween_property(owner_node, "modulate", Color.RED, 0.1)
	tween.tween_property(owner_node, "modulate", Color.WHITE, 0.1)
	await tween.finished

func play_death():
	var tween = owner_node.create_tween()
	tween.tween_property(owner_node, "modulate", Color(1, 1, 1, 0), 0.5)
	tween.tween_callback(owner_node.queue_free)
	await tween.finished

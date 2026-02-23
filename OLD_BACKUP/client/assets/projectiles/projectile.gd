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

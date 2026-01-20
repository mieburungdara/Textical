extends Label

func setup(value: String, color: Color = Color.WHITE):
    text = value
    add_theme_color_override("font_color", color)
    
    # Initial scale for a "pop" effect
    scale = Vector2(0.5, 0.5)
    pivot_offset = size / 2
    
    var tween = create_tween().set_parallel(true)
    
    # Float up
    tween.tween_property(self, "position:y", position.y - 60, 0.8).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    # Random horizontal drift
    tween.tween_property(self, "position:x", position.x + randf_range(-20, 20), 0.8)
    # Fade out
    tween.tween_property(self, "modulate:a", 0.0, 0.8).set_delay(0.2)
    # Scale pop
    var pop_tween = create_tween()
    pop_tween.tween_property(self, "scale", Vector2(1.2, 1.2), 0.1)
    pop_tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.1)
    
    tween.finished.connect(queue_free)

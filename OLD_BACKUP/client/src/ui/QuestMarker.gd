extends Label

func _ready():
    text = "!"
    add_theme_color_override("font_color", Color(1, 0.8, 0))
    add_theme_font_size_override("font_size", 32)
    # Simple animation
    var tw = create_tween().set_loops()
    tw.tween_property(self, "scale", Vector2(1.2, 1.2), 0.5)
    tw.tween_property(self, "scale", Vector2(1.0, 1.0), 0.5)

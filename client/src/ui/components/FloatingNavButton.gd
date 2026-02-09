extends Control

## FloatingNavButton - Smaller FAB for secondary navigation
## Features: Scene-change logic, hover scaling

@export var icon_text: String = "❓"
@export var target_scene: String = ""
@export var glow_color: Color = Color(1, 1, 1, 0.2)

@onready var button: Button = $Button
@onready var icon_label: Label = $Button/Icon

func _ready():
	icon_label.text = icon_text
	button.pressed.connect(_on_pressed)
	button.mouse_entered.connect(_on_hover.bind(true))
	button.mouse_exited.connect(_on_hover.bind(false))

func _on_pressed():
	# Visual feedback
	var tw = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(self, "scale", Vector2(0.8, 0.8), 0.05)
	tw.tween_property(self, "scale", Vector2(1.0, 1.0), 0.1)
	
	if target_scene != "":
		# Jika ini adalah scene change (bukan overlay)
		if get_tree().current_scene.scene_file_path == target_scene: return
		UIManager.close_all_overlays()
		get_tree().change_scene_to_file(target_scene)

func _on_hover(is_hover: bool):
	var tw = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
	if is_hover:
		tw.tween_property(self, "scale", Vector2(1.1, 1.1), 0.2)
		button.modulate = Color(1.2, 1.2, 1.2)
	else:
		tw.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)
		button.modulate = Color(1, 1, 1)

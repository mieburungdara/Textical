extends Control

## FloatingBagButton - Animated FAB for opening inventory
## Features: Pulsing animation, hover scaling, and UIManager integration

@onready var anim: AnimationPlayer = $AnimationPlayer
@onready var button: Button = $Button

func _ready():
	if not button:
		push_error("[FAB] Button node not found!")
		return
		
	button.pressed.connect(_on_pressed)
	button.mouse_entered.connect(_on_hover.bind(true))
	button.mouse_exited.connect(_on_hover.bind(false))
	
	# Start pulsing animation
	if anim and anim.has_animation("pulse"):
		anim.play("pulse")

func _on_pressed():
	# Haptic-like feedback
	var tw = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(self, "scale", Vector2(0.85, 0.85), 0.05)
	tw.tween_property(self, "scale", Vector2(1.0, 1.0), 0.1)
	
	if UIManager.is_overlay_open("Inventory"):
		UIManager.close_overlay("Inventory")
	else:
		# Use UIManager to open inventory as an overlay
		UIManager.close_all_overlays()
		UIManager.open_overlay("Inventory", "res://src/ui/InventoryScreen.tscn")

func _on_hover(is_hover: bool):
	var tw = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
	if is_hover:
		tw.tween_property(self, "scale", Vector2(1.1, 1.1), 0.2)
		button.modulate = Color(1.2, 1.2, 1.2)
	else:
		tw.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)
		button.modulate = Color(1, 1, 1)

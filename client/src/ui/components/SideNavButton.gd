extends Button

@export var icon_text: String = "❓"
@export var menu_label: String = "Menu"
@export var target_scene: String = ""
@export var is_overlay: bool = false
@export var overlay_name: String = ""

@onready var icon_node = $HBox/Icon
@onready var label_node = $HBox/Label

func _ready():
	icon_node.text = icon_text
	label_node.text = menu_label
	
	mouse_entered.connect(_on_hover.bind(true))
	mouse_exited.connect(_on_hover.bind(false))

func set_menu_label(p_text: String):
	menu_label = p_text
	if label_node: label_node.text = p_text

func set_icon_text(p_icon: String):
	icon_text = p_icon
	if icon_node: icon_node.text = p_icon

func _on_hover(is_hover: bool):
	var tw = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
	if is_hover:
		tw.tween_property(self, "custom_minimum_size:x", 140.0, 0.2)
		modulate = Color(1.2, 1.2, 1.2)
	else:
		tw.tween_property(self, "custom_minimum_size:x", 130.0, 0.2)
		modulate = Color(1, 1, 1)

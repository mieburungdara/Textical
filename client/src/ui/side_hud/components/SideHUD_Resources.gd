extends Control

## SideHUD_Resources - SRP Component
## Manages global user stats (Vitality, Gold, Silver) display.

@onready var vit_label = %VitalityLabel
@onready var vit_bar = %VitBar
@onready var silver_label = %SilverLabel
@onready var gold_label = %GoldLabel

func _ready():
	_listen_for_changes()
	update_display()

func _listen_for_changes():
	# Sync resources when user data changes
	GameState.region_changed.connect(func(_d): update_display())

func update_display():
	if not is_inside_tree(): return
	var user = GameState.current_user
	if not user: return
	
	# Update Vitality
	var vit = user.get("vitality", 0)
	var max_vit = user.get("maxVitality", 100)
	if vit_label: vit_label.text = "%d / %d" % [vit, max_vit]
	if vit_bar:
		vit_bar.max_value = max_vit
		vit_bar.value = vit
	
	# Update Currencies
	if silver_label: silver_label.text = _format_number(user.get("silver", 0))
	if gold_label: gold_label.text = _format_number(user.get("gold", 0))

func _format_number(n: int) -> String:
	var s = str(n)
	var out = ""
	for i in range(s.length()):
		if i > 0 and (s.length() - i) % 3 == 0:
			out += ","
		out += s[i]
	return out

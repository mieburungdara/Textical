class_name UnitUIComponent
extends Node

@export var name_label: Label
@export var hp_bar: ProgressBar
@export var action_bar: ProgressBar

func setup(data: UnitData):
	name_label.text = data.name
	# Ensure max is set before value to prevent clamping
	hp_bar.max_value = data.hp_base
	hp_bar.value = data.hp_base
	action_bar.max_value = 100.0
	action_bar.value = 0

func update_hp(current: float, max_hp: float = -1.0):
	# Always set max_value first if provided to avoid visual dipping/clamping
	if max_hp > 0 and hp_bar.max_value != max_hp:
		hp_bar.max_value = max_hp
	
	# If the bar is far from current (due to clamping), snap it immediately 
	# before starting the smooth tween
	if hp_bar.value > hp_bar.max_value:
		hp_bar.value = hp_bar.max_value
		
	var tween = get_tree().create_tween()
	tween.tween_property(hp_bar, "value", current, 0.2).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

func update_action_bar(current: float, max_ap: float = 100.0):
	if action_bar.max_value != max_ap:
		action_bar.max_value = max_ap
	var tween = get_tree().create_tween()
	tween.tween_property(action_bar, "value", current, 0.1)

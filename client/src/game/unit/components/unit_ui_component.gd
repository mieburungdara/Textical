class_name UnitUIComponent
extends Node

@export var name_label: Label
@export var hp_bar: ProgressBar
@export var mana_bar: ProgressBar # NEW
@export var action_bar: ProgressBar

func setup(data: UnitData):
	name_label.text = data.name
	hp_bar.max_value = data.hp_base
	hp_bar.value = data.hp_base
	if mana_bar:
		mana_bar.max_value = data.mana_base
		mana_bar.value = data.mana_base
	action_bar.max_value = 100.0
	action_bar.value = 0

func update_hp(current: float, max_hp: float = -1.0):
	if max_hp > 0 and hp_bar.max_value != max_hp:
		hp_bar.max_value = max_hp
	if hp_bar.value > hp_bar.max_value:
		hp_bar.value = hp_bar.max_value
	var tween = get_tree().create_tween()
	tween.tween_property(hp_bar, "value", current, 0.2).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

func update_mana(current: float, max_m: float = -1.0):
	if not mana_bar: return
	if max_m > 0 and mana_bar.max_value != max_m:
		mana_bar.max_value = max_m
	var tween = get_tree().create_tween()
	tween.tween_property(mana_bar, "value", current, 0.2)

func update_action_bar(current: float, max_ap: float = 100.0):
	if action_bar.max_value != max_ap:
		action_bar.max_value = max_ap
	var tween = get_tree().create_tween()
	tween.tween_property(action_bar, "value", current, 0.1)
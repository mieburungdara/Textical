class_name BattlePreviewPopup
extends Control

signal attack_confirmed(enemies: Array[MonsterData])
signal cancelled

@onready var enemy_list: HBoxContainer = $Panel/VBox/EnemyList
@onready var loot_label: Label = $Panel/VBox/Stats/LootInfo
@onready var gold_label: Label = $Panel/VBox/Stats/GoldInfo
@onready var exp_label: Label = $Panel/VBox/Stats/ExpInfo
@onready var chance_label: Label = $Panel/VBox/Stats/ScoutChance

var current_enemies: Array[MonsterData] = []

func setup(enemies: Array[MonsterData], scout_power: int):
	current_enemies = enemies
	
	# Clear old icons
	for child in enemy_list.get_children():
		child.queue_free()
	
	# 1. Show Enemy Icons
	for monster in enemies:
		var rect = TextureRect.new()
		rect.custom_minimum_size = Vector2(64, 64)
		rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		rect.texture = monster.icon if monster.icon else PlaceholderTexture2D.new()
		rect.modulate = monster.model_color
		enemy_list.add_child(rect)
	
	# 2. Calculate Intelligence Accuracy
	# Higher scout power means more accurate numbers
	var accuracy = clamp(float(scout_power) / 50.0, 0.3, 1.0)
	
	_update_rewards_info(enemies, accuracy)
	
	chance_label.text = "Scouting Intel Accuracy: %d%%" % (accuracy * 100)
	visible = true

func _update_rewards_info(enemies: Array[MonsterData], accuracy: float):
	var total_min_gold = 0
	var total_max_gold = 0
	var total_exp = 0
	
	for m in enemies:
		total_min_gold += m.gold_reward_min
		total_max_gold += m.gold_reward_max
		total_exp += m.experience_reward
	
	# If accuracy is low, show ranges or "???"
	if accuracy < 0.6:
		gold_label.text = "Estimated Gold: %d - %d" % [total_min_gold * 0.5, total_max_gold * 1.5]
		exp_label.text = "Estimated EXP: ~%d" % [total_exp]
		loot_label.text = "Potential Loot: Unknown"
	else:
		gold_label.text = "Estimated Gold: %d - %d" % [total_min_gold, total_max_gold]
		exp_label.text = "Total EXP: %d" % total_exp
		loot_label.text = "Potential Loot: Common Materials" # We'll refine this when loot system exists

func _on_attack_pressed():
	attack_confirmed.emit(current_enemies)
	hide()

func _on_cancel_pressed():
	cancelled.emit()
	hide()

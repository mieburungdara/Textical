extends Control

@onready var log_label = $VBoxContainer/LogPanel/RichTextLabel
@onready var monster_hp_bar = $VBoxContainer/MonsterArea/MonsterHP
@onready var hero_hp_bar = $VBoxContainer/PartyArea/HeroHP
@onready var result_label = $ResultPopup/VBoxContainer/ResultText
@onready var loot_label = $ResultPopup/VBoxContainer/LootText
@onready var popup = $ResultPopup

@onready var monster_node = $VBoxContainer/MonsterArea
@onready var hero_node = $VBoxContainer/PartyArea

const HIT_VFX = preload("res://assets/vfx/HitEffect.tscn")

var battle_data = null
var current_log_index = 0

func _ready():
	popup.hide()
	log_label.text = "Initializing combat..."
	ServerConnector.request_completed.connect(_on_request_completed)
	
	if GameState.current_user:
		ServerConnector.start_battle(GameState.current_user.id, 6001)

func _on_request_completed(endpoint, data):
	if "battle/start" in endpoint:
		battle_data = data
		_start_log_replay()

func _start_log_replay():
	current_log_index = 0
	_process_next_log_line()

func _process_next_log_line():
	if current_log_index >= battle_data.battleLog.size():
		_show_result()
		return

	var line = battle_data.battleLog[current_log_index]
	log_label.append_text(line + "\n")
	
	if "attacks Monster" in line:
		_play_hit_vfx(monster_node)
	elif "attacks Arthur" in line:
		_play_hit_vfx(hero_node)

	if "Monster HP:" in line:
		var hp_val = line.split("Monster HP: ")[1].replace(")", "").to_int()
		_animate_hp(monster_hp_bar, hp_val)
	elif "Arthur HP:" in line:
		var hp_val = line.split("Arthur HP: ")[1].replace(")", "").to_int()
		_animate_hp(hero_hp_bar, hp_val)

	current_log_index += 1
	get_tree().create_timer(0.5).timeout.connect(_process_next_log_line)

func _play_hit_vfx(target_node: Control):
	var effect = HIT_VFX.instantiate()
	add_child(effect)
	effect.global_position = target_node.global_position + (target_node.size / 2)
	
	# Simple Shake
	var tween = create_tween()
	var original_pos = target_node.position
	tween.tween_property(target_node, "position", original_pos + Vector2(10, 0), 0.05)
	tween.tween_property(target_node, "position", original_pos - Vector2(10, 0), 0.05)
	tween.tween_property(target_node, "position", original_pos, 0.05)

func _animate_hp(bar: ProgressBar, new_val: int):
	var tween = create_tween()
	tween.tween_property(bar, "value", float(new_val), 0.2)

func _show_result():
	result_label.text = battle_data.result
	if battle_data.loot.size() > 0:
		loot_label.text = "Loot: Item " + str(battle_data.loot[0].templateId)
	else:
		loot_label.text = "No loot found."
	popup.show()

func _on_close_pressed():
	get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")
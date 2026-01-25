extends Control

@onready var gold_label = $MarginContainer/HBoxContainer/GoldGroup/Label
@onready var vitality_bar = $MarginContainer/HBoxContainer/VitalityGroup/ProgressBar
@onready var vitality_label = $MarginContainer/HBoxContainer/VitalityGroup/Label

func _ready():
	ServerConnector.login_success.connect(_on_data_updated)
	# Also update when any request completes, as gold/vitality might change
	ServerConnector.request_completed.connect(func(_e, _d): _on_data_updated(GameState.current_user))
	refresh()

func refresh():
	if GameState.current_user:
		_on_data_updated(GameState.current_user)

func _on_data_updated(user):
	if !user: return
	gold_label.text = str(user.gold)
	vitality_bar.max_value = user.maxVitality
	vitality_bar.value = user.vitality
	vitality_label.text = "%d / %d" % [user.vitality, user.maxVitality]

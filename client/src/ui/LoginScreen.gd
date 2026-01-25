extends Control

@onready var username_input = $VBoxContainer/UsernameInput
@onready var login_button = $VBoxContainer/LoginButton
@onready var status_label = $VBoxContainer/StatusLabel

func _ready():
	login_button.pressed.connect(_on_login_pressed)
	ServerConnector.login_success.connect(_on_login_success)
	ServerConnector.login_failed.connect(_on_login_failed)

func _on_login_pressed():
	var username = username_input.text
	if username == "":
		status_label.text = "Enter username"
		return
	
	status_label.text = "Connecting..."
	ServerConnector.login(username)

func _on_login_success(user):
	status_label.text = "Success! Welcome " + user.username
	GameState.set_user(user)
	# Transition to Main Game Scene (TODO)
	get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")

func _on_login_failed(error):
	status_label.text = "Error: " + error

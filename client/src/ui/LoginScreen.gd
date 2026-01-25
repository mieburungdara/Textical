extends Control

@onready var username_input = $VBoxContainer/UsernameInput
@onready var password_input = $VBoxContainer/PasswordInput
@onready var login_button = $VBoxContainer/LoginButton
@onready var status_label = $VBoxContainer/StatusLabel

const SAVE_PATH = "user://auth.cfg"

func _ready():
	_load_credentials()
	login_button.pressed.connect(_on_login_pressed)
	ServerConnector.login_success.connect(_on_login_success)
	ServerConnector.login_failed.connect(_on_login_failed)
	ServerConnector.request_completed.connect(_on_request_completed)

func _on_login_pressed():
	var username = username_input.text
	var password = password_input.text
	
	if username == "" or password == "":
		status_label.text = "Enter username and password"
		return
	
	status_label.text = "Authenticating..."
	ServerConnector.login_with_password(username, password)

func _on_login_success(user):
	status_label.text = "Success! Welcome " + user.username
	_save_credentials(username_input.text, password_input.text)
	GameState.set_user(user)
	ServerConnector.get_region_details(user.currentRegion)

func _on_request_completed(endpoint, data):
	if endpoint.contains("/region/"):
		if data.type == "TOWN":
			get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
		else:
			get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

func _on_login_failed(error):
	status_label.text = "Auth Error: " + error

# --- PERSISTENCE LOGIC ---

func _save_credentials(username, password):
	var config = ConfigFile.new()
	config.set_value("auth", "username", username)
	config.set_value("auth", "password", password)
	config.save(SAVE_PATH)
	print("[AUTH] Credentials saved locally.")

func _load_credentials():
	var config = ConfigFile.new()
	var err = config.load(SAVE_PATH)
	if err == OK:
		username_input.text = config.get_value("auth", "username", "player1")
		password_input.text = config.get_value("auth", "password", "")
		print("[AUTH] Credentials loaded.")
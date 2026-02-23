class_name LoginAuthManager
extends Node

## RESPONSIBILITY: Handles credential persistence and login authentication flow
## SINGLE RESPONSIBILITY: Logic for logging in and saving/loading auth configs

signal login_started()
signal login_success(user_data: Dictionary)
signal login_failed(error_message: String)

const SAVE_PATH = "user://auth.cfg"

func _ready() -> void:
	ServerConnector.login_success.connect(_on_server_login_success)
	ServerConnector.login_failed.connect(_on_server_login_failed)

## Start login process
func login(username: String, password: String, remember_me: bool = true) -> void:
	if username.is_empty() or password.is_empty():
		login_failed.emit("Enter username and password")
		return
	
	GameState.remember_me = remember_me
	login_started.emit()
	ServerConnector.login_with_password(username, password)

## Check for existing session on startup
func check_auto_login() -> bool:
	if GameState.load_session_from_disk():
		login_started.emit()
		ServerConnector.login_with_token()
		return true
	return false

## Handle server success
func _on_server_login_success(user: Dictionary) -> void:
	# Extract user data
	var user_data = user.get("data", user)
	if user_data:
		GameState.set_user(user_data)
	
	login_success.emit(user_data)

## Handle server failure
func _on_server_login_failed(error: String) -> void:
	login_failed.emit(error)

## Persistence: Save
func save_credentials(username: String, password: String, remember_me: bool = true) -> void:
	if not remember_me:
		if FileAccess.file_exists(SAVE_PATH):
			DirAccess.remove_absolute(SAVE_PATH)
		return
		
	var config = ConfigFile.new()
	config.set_value("auth", "username", username)
	config.set_value("auth", "password", password)
	config.set_value("auth", "remember_me", remember_me)
	config.save(SAVE_PATH)

## Persistence: Load
func load_credentials() -> Dictionary:
	var config = ConfigFile.new()
	var err = config.load(SAVE_PATH)
	if err == OK:
		return {
			"username": config.get_value("auth", "username", "player1"),
			"password": config.get_value("auth", "password", ""),
			"remember_me": config.get_value("auth", "remember_me", true)
		}
	return {"username": "player1", "password": "", "remember_me": true}

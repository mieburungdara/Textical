extends Control

@onready var username_input = $VBoxContainer/UsernameInput
@onready var password_input = $VBoxContainer/PasswordInput
@onready var login_button = $VBoxContainer/LoginButton
@onready var status_label = $VBoxContainer/StatusLabel

const SAVE_PATH = "user://auth.cfg"

var heroes_loaded = false
var inventory_loaded = false
var region_loaded = false
var region_data = null

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
    
    status_label.text = "Handshaking..."
    ServerConnector.login_with_password(username, password)

func _on_login_success(user):
    status_label.text = "Checking assets..."
    GameState.set_user(user)
    _save_credentials(username_input.text, password_input.text)
    
    # Start Asset Sync
    DataManager.sync_finished.connect(_on_sync_finished, CONNECT_ONE_SHOT)
    DataManager.start_sync()

func _on_sync_finished():
    status_label.text = "Syncing world state..."
    var user = GameState.current_user
    # Start Parallel Pre-loading
    ServerConnector.fetch_heroes(user.id)
    ServerConnector.fetch_inventory(user.id)
    ServerConnector.get_region_details(user.currentRegion)

func _on_request_completed(endpoint, data):
    if endpoint.contains("/heroes"):
        heroes_loaded = true
    elif endpoint.contains("/inventory"):
        inventory_loaded = true
    elif endpoint.contains("/region/"):
        region_loaded = true
        region_data = data
        GameState.current_region_data = data
    
    _check_transition()

func _check_transition():
    if heroes_loaded and inventory_loaded and region_loaded:
        status_label.text = "READY."
        await get_tree().create_timer(0.2).timeout
        
        # BUG FIX: If there is an active task, route to the action scene instead of the hub
        if GameState.active_task:
            if GameState.active_task.type == "TRAVEL":
                get_tree().change_scene_to_file("res://src/ui/TravelScene.tscn")
                return
            # Add other task types here (GATHERING, etc) if they have scenes
        
        if region_data.type == "TOWN":
            GameState.last_visited_hub = "res://src/ui/TownScreen.tscn"
            get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
        else:
            GameState.last_visited_hub = "res://src/ui/WildernessScreen.tscn"
            get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

func _on_login_failed(error):
    status_label.text = "Unauthorized: " + error

# --- PERSISTENCE LOGIC ---

func _save_credentials(username, password):
    var config = ConfigFile.new()
    config.set_value("auth", "username", username)
    config.set_value("auth", "password", password)
    config.save(SAVE_PATH)

func _load_credentials():
    var config = ConfigFile.new()
    var err = config.load(SAVE_PATH)
    if err == OK:
        username_input.text = config.get_value("auth", "username", "player1")
        password_input.text = config.get_value("auth", "password", "")

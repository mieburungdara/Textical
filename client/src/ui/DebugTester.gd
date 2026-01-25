extends Control

@onready var log_box = $VBoxContainer/RichTextLabel
@onready var run_btn = $VBoxContainer/RunButton

func _ready():
	run_btn.pressed.connect(_run_tests)
	ServerConnector.request_completed.connect(_on_pass)
	ServerConnector.error_occurred.connect(_on_fail)

func _log(msg: String, color: String = "white"):
	log_box.append_text("[color=%s]%s[/color]\n" % [color, msg])

func _on_pass(endpoint, _data):
	_log("PASS: %s" % endpoint, "green")

func _on_fail(endpoint, msg):
	_log("FAIL: %s -> %s" % [endpoint, msg], "red")

func _run_tests():
	log_box.clear()
	_log("--- STARTING INTEGRATION TESTS ---", "yellow")
	
	_log("Step 1: Testing Login...")
	ServerConnector.login("player1")
	await get_tree().create_timer(1.0).timeout
	
	if !GameState.current_user:
		_log("CRITICAL: Login failed, stopping tests.", "red")
		return

	var uid = GameState.current_user.id
	
	_log("Step 2: Testing Profile Fetch...")
	ServerConnector.fetch_profile(uid)
	await get_tree().create_timer(0.5).timeout
	
	_log("Step 3: Testing Inventory...")
	ServerConnector.fetch_inventory(uid)
	await get_tree().create_timer(0.5).timeout
	
	_log("Step 4: Testing World Atlas...")
	ServerConnector.fetch_all_regions()
	await get_tree().create_timer(0.5).timeout
	
	_log("Step 5: Testing Tavern Entrance...")
	ServerConnector.enter_tavern(uid)
	await get_tree().create_timer(0.5).timeout
	
	_log("Step 6: Testing Tavern Exit...")
	ServerConnector.exit_tavern(uid)
	await get_tree().create_timer(0.5).timeout
	
	_log("--- TESTS COMPLETE ---", "yellow")

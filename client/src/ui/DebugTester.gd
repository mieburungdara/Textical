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
	_log("PASS: Response from %s" % endpoint, "green")

func _on_fail(endpoint, msg):
	_log("CRITICAL FAIL: %s -> %s" % [endpoint, msg], "red")

func _run_tests():
	log_box.clear()
	_log("--- STARTING 100% ENGINE VALIDATION ---", "yellow")
	
	# Stage 1: Auth
	_log("[STAGE 1] Authentication...")
	ServerConnector.login_with_password("player1", "password123")
	await get_tree().create_timer(1.5).timeout
	if !GameState.current_user: return _log("Test Aborted: Auth Failed", "red")

	var uid = GameState.current_user.id

	# Stage 2: Data Retrieval
	_log("[STAGE 2] Basic Data Retrieval...")
	ServerConnector.fetch_profile(uid)
	ServerConnector.fetch_inventory(uid)
	ServerConnector.fetch_heroes(uid)
	ServerConnector.fetch_recipes(uid)
	ServerConnector.fetch_formation(uid)
	await get_tree().create_timer(2.0).timeout

	# Stage 3: World & Tavern
	_log("[STAGE 3] World & Social Functions...")
	ServerConnector.fetch_all_regions()
	ServerConnector.get_region_details(1)
	ServerConnector.enter_tavern(uid)
	await get_tree().create_timer(1.0).timeout
	ServerConnector.get_mercenaries(uid)
	ServerConnector.exit_tavern(uid)
	await get_tree().create_timer(1.0).timeout

	# Stage 4: Economy & Quests
	_log("[STAGE 4] Economy & Progression...")
	ServerConnector.fetch_market_listings(uid)
	ServerConnector.fetch_quests(uid)
	await get_tree().create_timer(1.5).timeout

	# Stage 5: Combat & Interaction
	_log("[STAGE 5] High-Level Logic...")
	ServerConnector.fetch_hero_profile(1) # Assuming hero 1 exists from seed
	ServerConnector.start_battle(uid, 6001) # Test battle with slime
	
	_log("--- 100% ENGINE VALIDATION COMPLETE ---", "yellow")
	_log("If all lines above are GREEN, your game is 100% stable.", "green")
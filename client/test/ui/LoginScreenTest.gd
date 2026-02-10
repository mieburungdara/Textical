# tests/test_login_screen.gd
extends GdUnitTestSuite

var _screen: Control

func before_each():
	_screen = load("res://src/ui/login/LoginScreen.tscn").instantiate()
	add_child(_screen)

func after_each():
	if is_instance_valid(_screen):
		_screen.queue_free()

func test_manager_initialization():
	# Verify coordinator setup
	assert_not_null(_screen.auth)
	assert_not_null(_screen.preloader)
	assert_not_null(_screen.vfx)
	
	# Verify VFX links
	assert_not_null(_screen.vfx.login_panel)
	assert_not_null(_screen.vfx.magic_sigil)

func test_auth_persistence():
	var username = "test_user_" + str(randi())
	_screen.username_input.text = username
	_screen.auth.save_credentials(username, "secret")
	
	var loaded = _screen.auth.load_credentials()
	assert_str(loaded.username).is_equal(username)

func test_vfx_state_routing():
	_screen._on_auth_started()
	assert_bool(_screen.vfx._is_login_in_progress).is_true()
	
	_screen._on_auth_failed("error")
	assert_bool(_screen.vfx._is_login_in_progress).is_false()

func test_preload_routing():
	# Simulate progress signal
	_screen.preloader.preload_progress.emit("Testing progress...")
	assert_str(_screen.status_label.text).is_equal("Testing progress...")

func test_security_whitelist():
	assert_bool(_screen._validate_scene_path("res://src/ui/login/LoginScreen.tscn")).is_true()
	assert_bool(_screen._validate_scene_path("res://evil_scene.tscn")).is_false()
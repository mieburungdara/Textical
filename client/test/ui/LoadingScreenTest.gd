# tests/test_loading_screen.gd
extends GdUnitTestSuite

var _screen: Control

func before_each():
	_screen = load("res://src/ui/loading/LoadingScreen.tscn").instantiate()
	add_child(_screen)

func after_each():
	if is_instance_valid(_screen):
		_screen.queue_free()

func test_manager_initialization():
	# Verify coordinator setup
	assert_not_null(_screen.localization)
	assert_not_null(_screen.sync)
	assert_not_null(_screen.log_manager)
	assert_not_null(_screen.tip_manager)
	assert_not_null(_screen.particles)
	assert_not_null(_screen.ripples)
	
	# Verify links
	assert_not_null(_screen.log_manager.chronicle_logs)
	assert_not_null(_screen.tip_manager.tip_label)

func test_timer_cleanup():
	# Verify timers created in managers
	assert_bool(_screen.tip_manager.is_timer_valid()).is_true()
	
	# Exit tree
	_screen._exit_tree()
	
	# Verify cleanup flag
	assert_bool(_screen._is_exiting).is_true()

func test_progress_update():
	_screen._on_sync_progress(50, 100)
	
	# Verify progress updated via coordinator
	assert_float(_screen.loading_bar.get_node("ProgressBar").value).is_equal(50.0)
	assert_str(_screen.status_label.text).contains("50 / 100")

func test_error_handling():
	# Coordinator routes error handling
	_screen._on_sync_error("test", "Test error message")
	
	# Verify error displayed
	assert_str(_screen.status_label.text).contains("Error")

func test_security_whitelist():
	assert_bool(_screen._validate_scene_path("res://src/ui/login/LoginScreen.tscn")).is_true()
	assert_bool(_screen._validate_scene_path("res://invalid_path.tscn")).is_false()

func test_localization_routing():
	var translated = _screen.localization.translate("status_ready")
	assert_str(translated).is_not_empty()
	assert_str(translated).is_equal(_screen.localization.LOCALIZED_STRINGS["en"]["status_ready"])
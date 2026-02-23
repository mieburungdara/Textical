# tests/test_hero_profile_screen.gd
extends GdUnitTestSuite

var _screen: Control

func before_each():
	_screen = load("res://src/ui/hero_profile/HeroProfileScreen.tscn").instantiate()
	add_child(_screen)

func after_each():
	if is_instance_valid(_screen):
		_screen.queue_free()

func test_manager_initialization():
	# Verify coordinator setup
	assert_not_null(_screen.layout)
	assert_not_null(_screen.selection)
	
	# Verify links
	assert_not_null(_screen.selection.hero_grid)
	assert_not_null(_screen.layout.margin_container)

func test_selection_routing():
	# Simulate grid selection
	var test_data = {"id": 123, "name": "Hero Test"}
	_screen._on_hero_selected_in_grid(test_data)
	
	# Verify manager updates
	assert_int(GameState.selected_hero_id).is_equal(123)
	assert_bool(_screen.layout.is_overlay_visible()).is_true()

func test_clear_selection():
	_screen.clear_selection()
	assert_int(GameState.selected_hero_id).is_equal(-1)
	assert_bool(_screen.layout.is_overlay_visible()).is_false()

func test_setup_as_overlay():
	_screen.setup_as_overlay()
	assert_float(_screen.margin_container.offset_left).is_equal(200.0)
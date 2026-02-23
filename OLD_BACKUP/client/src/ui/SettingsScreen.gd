extends Control

## SettingsScreen - Quick access to game settings
## Designed as an overlay managed by UIManager.

@onready var close_btn = %CloseBtn

var _settings_dirty = false

func setup_as_overlay(_data: Dictionary = {}):
	# Position container correctly to clear sidebar
	if has_node("MarginContainer"):
		$MarginContainer.offset_left = 160 # Matches SideHUD width
		$MarginContainer.offset_right = 0
		$MarginContainer.offset_top = 0
		$MarginContainer.offset_bottom = 0

func _ready():
	close_btn.pressed.connect(_close)
	
	# Click background to close
	if has_node("Background"):
		$Background.gui_input.connect(func(event):
			if event is InputEventMouseButton and event.pressed:
				_close()
		)
	
	_load_current_settings()
	_setup_actual_settings()

func _close():
	if _settings_dirty and GameState.current_user:
		ServerConnector.update_settings(GameState.current_user.id, GameState.user_settings)
		_settings_dirty = false
	UIManager.close_overlay("Settings")

func _load_current_settings():
	var settings = GameState.user_settings
	
	var master_slider = get_node_or_null("%MasterVolumeSlider")
	if master_slider and settings.has("audio"):
		master_slider.value = settings.audio.get("master_volume", 80)
		
	var full_check = get_node_or_null("%FullscreenCheck")
	if full_check and settings.has("display"):
		full_check.button_pressed = settings.display.get("fullscreen", false)

func _setup_actual_settings():
	var master_slider = get_node_or_null("%MasterVolumeSlider")
	if master_slider:
		master_slider.value_changed.connect(_on_audio_changed)
	
	var full_check = get_node_or_null("%FullscreenCheck")
	if full_check:
		full_check.toggled.connect(_on_display_changed)

func _on_audio_changed(val):
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Master"), linear_to_db(val / 100.0))
	if !GameState.user_settings.has("audio"): GameState.user_settings["audio"] = {}
	GameState.user_settings.audio["master_volume"] = val
	_settings_dirty = true

func _on_display_changed(is_pressed):
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN if is_pressed else DisplayServer.WINDOW_MODE_WINDOWED)
	if !GameState.user_settings.has("display"): GameState.user_settings["display"] = {}
	GameState.user_settings.display["fullscreen"] = is_pressed
	_settings_dirty = true

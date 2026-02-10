extends Control

## SideHUD_System - SRP Component
## Manages system indicators (Connection, Combat, Performance, Settings).

@onready var status_icon = %StatusIcon
@onready var ping_label = %PingLabel
@onready var combat_indicator = %CombatIndicator
@onready var settings_btn = %SettingsBtn
@onready var fps_label = %FPSLabel
@onready var perf_ping_label = %PerfPingLabel

var _ping_timer: Timer

func _ready():
	_setup_ping_timer()
	_listen_for_changes()
	_update_connection_status(ServerConnector.is_socket_connected() if ServerConnector.has_method("is_socket_connected") else true)
	update_all()

func _setup_ping_timer():
	_ping_timer = Timer.new()
	_ping_timer.wait_time = 5.0
	_ping_timer.timeout.connect(_on_ping_timeout)
	add_child(_ping_timer)
	_ping_timer.start()

func _on_ping_timeout():
	if ServerConnector and ServerConnector.has_method("get_last_ping"):
		var ping = ServerConnector.get_last_ping()
		if ping_label: ping_label.text = str(ping) + "ms" if ping > 0 else "--ms"
		if perf_ping_label: perf_ping_label.text = str(ping) + "ms" if ping > 0 else "--ms"

func _listen_for_changes():
	if ServerConnector.has_signal("socket_connected"):
		ServerConnector.socket_connected.connect(func(): _update_connection_status(true))
	if ServerConnector.has_signal("socket_disconnected"):
		ServerConnector.socket_disconnected.connect(func(): _update_connection_status(false))
	
	if settings_btn:
		settings_btn.pressed.connect(_on_settings_pressed)

func update_all():
	_update_combat_state()
	_update_perf_display()

func _on_settings_pressed():
	if UIManager.is_overlay_open("Settings"):
		UIManager.close_overlay("Settings")
	else:
		UIManager.close_all_overlays()
		UIManager.open_overlay("Settings", "res://src/ui/SettingsScreen.tscn")

func _update_connection_status(connected: bool):
	if status_icon:
		status_icon.text = "🟢" if connected else "🔴"
		status_icon.modulate = Color(1, 1, 1) if connected else Color(1, 0.3, 0.3)
	if not connected and ping_label:
		ping_label.text = "--ms"

func _update_combat_state():
	if not combat_indicator: return
	var in_combat = GameState.is_in_combat()
	combat_indicator.visible = in_combat
	if in_combat:
		_animate_combat()

func _animate_combat():
	var tw = create_tween().set_loops()
	tw.tween_property(combat_indicator, "modulate:a", 0.4, 0.5)
	tw.tween_property(combat_indicator, "modulate:a", 1.0, 0.5)

func _update_perf_display():
	if fps_label:
		fps_label.text = "%d FPS" % Engine.get_frames_per_second()
		if Engine.get_frames_per_second() < 30:
			fps_label.modulate = Color(1, 0.3, 0.3)
		else:
			fps_label.modulate = Color(0.5, 0.5, 0.5)
	
	if perf_ping_label:
		var ping = ServerConnector.get_last_ping()
		perf_ping_label.text = str(ping) + "ms" if ping > 0 else "--ms"

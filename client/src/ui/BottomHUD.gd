extends Control

@onready var nav_hbox = $DockPanel/Margin/NavHBox
@onready var hub_btn = $DockPanel/Margin/NavHBox/Town

# === AP DISPLAY NODE REFERENCES ===
@onready var ap_display = $DockPanel/Margin/APDisplay
@onready var ap_current_label = $DockPanel/Margin/APDisplay/CurrentLabel
@onready var ap_max_label = $DockPanel/Margin/APDisplay/MaxLabel
@onready var ap_bar = $DockPanel/Margin/APDisplay/APBar

# === REGEN DISPLAY NODE REFERENCES ===
@onready var regen_display = $DockPanel/Margin/RegenDisplay
@onready var hp_regen_label = $DockPanel/Margin/RegenDisplay/HPRegenLabel
@onready var mp_regen_label = $DockPanel/Margin/RegenDisplay/MPRegenLabel

const ROUTES = {
	"Inventory": "res://src/ui/InventoryScreen.tscn",
	"Formation": "res://src/ui/FormationScreen.tscn",
	"Hero": "res://src/ui/HeroProfileScreen.tscn",
	"Atlas": "res://src/ui/WorldAtlas.tscn",
	"Guild": "res://src/ui/GuildScreen.tscn"
}

var _style_active: StyleBoxFlat
var _style_normal: StyleBoxFlat

# === PRIVATE VARIABLES ===
var _current_stats: Dictionary = {}
var _ap_regen_timer: Timer = null
var _regen_update_interval: float = 1.0  # Update regen display every second

func _ready():
	# Pre-configure styles
	_style_active = StyleBoxFlat.new()
	_style_active.bg_color = Color(1, 0.8, 0.4, 0.08)
	_style_active.border_width_bottom = 3
	_style_active.border_color = Color(1, 0.8, 0.2, 1)
	_style_active.corner_radius_top_left = 8
	_style_active.corner_radius_top_right = 8

	_style_normal = StyleBoxFlat.new()
	_style_normal.bg_color = Color(0, 0, 0, 0)
	_style_normal.border_width_bottom = 2
	_style_normal.border_color = Color(0, 0, 0, 0)
	_style_normal.corner_radius_top_left = 8
	_style_normal.corner_radius_top_right = 8

	# Connect fixed routes
	for btn_name in ROUTES.keys():
		var btn = nav_hbox.get_node(btn_name)
		if btn:
			btn.pressed.connect(_on_nav_pressed.bind(ROUTES[btn_name]))
	
	# Connect dynamic HUB button
	hub_btn.pressed.connect(_on_hub_pressed)

	# LISTEN FOR STATE CHANGES
	GameState.region_changed.connect(func(_d): _update_ui())
	ServerConnector.task_completed.connect(func(_d): _update_ui())
	
	# Setup AP and Regen displays
	_setup_ap_display()
	_setup_regen_display()
	_connect_stat_signals()
	
	# Delay initial update slightly to ensure scene tree is ready
	if is_inside_tree():
		_update_ui()
	else:
		await ready
		_update_ui()

func _on_nav_pressed(path: String):
	if get_tree().current_scene.scene_file_path == path: return
	get_tree().change_scene_to_file(path)

func _on_hub_pressed():
	var path = "res://src/ui/TownScreen.tscn"
	if GameState.current_region_data:
		path = GameState.get_region_scene(GameState.current_region_data.get("type", "TOWN"))
	
	if get_tree().current_scene.scene_file_path == path: return
	get_tree().change_scene_to_file(path)

func _update_ui():
	var current_path = get_tree().current_scene.scene_file_path
	
	# Update HUB Button Label with Emoji
	if GameState.current_region_data and GameState.current_region_data.get("type") != "TOWN":
		hub_btn.text = "🌲\nField"
	else:
		hub_btn.text = "🏰\nTown"
		
	# Highlight active
	var all_btns = {"Town": hub_btn}
	for k in ROUTES.keys(): all_btns[k] = nav_hbox.get_node(k)
	
	for b_name in all_btns:
		var btn = all_btns[b_name]
		var target_path = ROUTES.get(b_name, "")
		var is_active = false
		
		if b_name == "Town": # Special case for hub
			is_active = current_path.contains("TownScreen") or current_path.contains("WildernessScreen")
		else:
			is_active = (current_path == target_path)
			
		if is_active:
			# Active: Gold Color + Active Style
			btn.add_theme_color_override("font_color", Color(1, 0.8, 0.2, 1))
			btn.add_theme_stylebox_override("normal", _style_active)
		else:
			# Inactive: Muted Blue-Grey + Transparent Style
			btn.add_theme_color_override("font_color", Color(0.6, 0.6, 0.7, 1))
			btn.remove_theme_stylebox_override("normal") # Revert to default or normal style

	# Also update AP and regen displays
	_update_ap_display()
	_update_regen_display()

# === AP DISPLAY ===

func _setup_ap_display():
	# Create AP display if nodes exist
	if ap_bar:
		ap_bar.max_value = 10  # Default max AP
		ap_bar.value = 10
		
		# Style the AP bar
		var ap_style = StyleBoxFlat.new()
		ap_style.bg_color = Color(0.9, 0.8, 0.2, 0.8)
		ap_style.corner_radius_top_left = 4
		ap_style.corner_radius_top_right = 4
		ap_style.corner_radius_bottom_left = 4
		ap_style.corner_radius_bottom_right = 4
		ap_bar.add_theme_stylebox_override("fill", ap_style)

func _update_ap_display():
	if not ap_display:
		return
	
	var ap_current = _current_stats.get("ap", 0)
	var ap_max = _current_stats.get("maxAp", _current_stats.get("ap", 10))
	
	if ap_current_label:
		ap_current_label.text = str(int(ap_current))
		# Color based on AP level
		if ap_current <= ap_max * 0.3:
			ap_current_label.modulate = Color(0.9, 0.3, 0.3, 1.0)  # Low AP - red
		elif ap_current <= ap_max * 0.6:
			ap_current_label.modulate = Color(0.9, 0.7, 0.2, 1.0)  # Medium AP - orange
		else:
			ap_current_label.modulate = Color(0.9, 0.9, 0.3, 1.0)  # High AP - yellow
	
	if ap_max_label:
		ap_max_label.text = "/ %d" % int(ap_max)
	
	if ap_bar:
		ap_bar.max_value = ap_max
		ap_bar.value = ap_current

# === REGEN DISPLAY ===

func _setup_regen_display():
	# Initialize regen display
	if hp_regen_label:
		hp_regen_label.text = "+0/turn"
		
	if mp_regen_label:
		mp_regen_label.text = "+0/turn"
	
	# Create timer for regen updates
	_ap_regen_timer = Timer.new()
	_ap_regen_timer.wait_time = _regen_update_interval
	_ap_regen_timer.autostart = false
	_ap_regen_timer.timeout.connect(_on_regen_timer_timeout)
	add_child(_ap_regen_timer)

func _update_regen_display():
	if not regen_display:
		return
	
	# HP Regen
	var hp_regen = _current_stats.get("hpRegen", 0)
	if hp_regen_label:
		if hp_regen > 0:
			hp_regen_label.text = "+%d/turn" % int(hp_regen)
			hp_regen_label.modulate = Color(0.3, 0.9, 0.4, 1.0)  # Green for positive regen
		elif hp_regen < 0:
			hp_regen_label.text = "%d/turn" % int(hp_regen)  # Negative - no plus sign
			hp_regen_label.modulate = Color(0.9, 0.3, 0.3, 1.0)  # Red for damage
		else:
			hp_regen_label.text = "0/turn"
			hp_regen_label.modulate = Color(0.5, 0.5, 0.5, 0.8)
	
	# MP Regen
	var mp_regen = _current_stats.get("mpRegen", 0)
	if mp_regen_label:
		if mp_regen > 0:
			mp_regen_label.text = "+%d/turn" % int(mp_regen)
			mp_regen_label.modulate = Color(0.3, 0.6, 0.9, 1.0)  # Blue for MP
		elif mp_regen < 0:
			mp_regen_label.text = "%d/turn" % int(mp_regen)
			mp_regen_label.modulate = Color(0.7, 0.3, 0.3, 1.0)
		else:
			mp_regen_label.text = "0/turn"
			mp_regen_label.modulate = Color(0.5, 0.5, 0.5, 0.8)

func _on_regen_timer_timeout():
	# This would be called periodically to update regen values
	# In a real implementation, this might calculate actual regen based on time
	pass

# === STAT SIGNAL HANDLERS ===

func _connect_stat_signals():
	ServerConnector.stats_updated.connect(_on_stats_updated)
	ServerConnector.stat_changed.connect(_on_stat_changed)

func _on_stats_updated(_unit_id, stats_data: Dictionary):
	_current_stats = stats_data
	_update_ap_display()
	_update_regen_display()

func _on_stat_changed(_unit_id, stat_name: String, _old_value, new_value):
	_current_stats[stat_name] = new_value
	
	# Update specific displays based on stat changed
	match stat_name:
		"ap", "maxAp":
			_update_ap_display()
		"hpRegen":
			_update_regen_display()
		"mpRegen":
			_update_regen_display()

# === PUBLIC METHODS ===

func refresh_stats():
	# Fetch fresh stats from server
	if GameState.selected_hero_id != -1:
		ServerConnector.fetch_unit_stats(GameState.selected_hero_id)

func set_ap_regen_active(active: bool):
	if _ap_regen_timer:
		if active:
			if _ap_regen_timer.is_stopped():
				_ap_regen_timer.start()
		else:
			_ap_regen_timer.stop()

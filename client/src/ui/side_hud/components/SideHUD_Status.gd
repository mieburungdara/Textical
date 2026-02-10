extends Control

## SideHUD_Status - SRP Component
## Manages world status indicators (Region, Time, Weather, Buffs, VIP, Title, Faction).

@onready var region_icon = %RegionIcon
@onready var region_name = %RegionName
@onready var coord_label = %CoordLabel
@onready var day_night_icon = %DayNightIcon
@onready var time_label = %TimeLabel
@onready var date_label = %DateLabel
@onready var weather_icon = %WeatherIcon
@onready var weather_label = %WeatherLabel
@onready var buff_container = %BuffContainer
@onready var vip_badge = %VIPBadge
@onready var title_label = %TitleLabel
@onready var faction_label = %FactionLabel

func _ready():
	_listen_for_changes()
	update_all()

func _listen_for_changes():
	GameState.region_changed.connect(func(_d): 
		_update_region_display()
		_update_weather_display()
	)
	GameState.world_state_updated.connect(func(_s):
		_update_time_display()
		_update_weather_display()
	)
	GameState.achievement_unlocked.connect(func(_a): _update_achievement_indicator())

func update_all():
	_update_region_display()
	_update_time_display()
	_update_buffs_display()
	_update_vip_display()
	_update_title_display()
	_update_faction_display()
	_update_weather_display()

func _update_region_display():
	var region = GameState.current_region_data
	if not region:
		region_icon.text = "🏰"
		region_name.text = "UNKNOWN"
		coord_label.text = "X:0 Y:0"
		return
	
	var r_type = region.get("visualType", region.get("type", "TOWN"))
	region_icon.text = _get_region_type_icon(r_type)
	region_name.text = region.get("name", "Unknown").to_upper()
	
	var x = region.get("x")
	var y = region.get("y")
	
	if x == null or y == null:
		var rid = int(region.get("id", 0))
		if GameState.REGION_POSITIONS.has(rid):
			var pos = GameState.REGION_POSITIONS[rid]
			x = pos.x
			y = pos.y
	
	coord_label.text = "X:%d Y:%d" % [int(x) if x != null else 0, int(y) if y != null else 0]

func _update_time_display():
	var time = GameState.get_game_time()
	if time_label: time_label.text = "%02d:%02d" % [time.hour, time.minute]
	if date_label: date_label.text = "Day %d" % time.day
	if day_night_icon: day_night_icon.text = "☀️" if time.hour >= 6 and time.hour < 18 else "🌙"

func _update_buffs_display():
	if not buff_container: return
	for child in buff_container.get_children():
		child.queue_free()
	
	if GameState.current_heroes.size() == 0:
		return
		
	var hero = GameState.current_heroes[0]
	var buffs = hero.get("activeBuffs", [])
	
	if buffs.is_empty() and OS.is_debug_build():
		buffs = [{"icon": "🛡️", "name": "Shield"}, {"icon": "⚡", "name": "Haste"}]
	
	for buff in buffs:
		var lbl = Label.new()
		lbl.text = buff.get("icon", "✨")
		lbl.tooltip_text = buff.get("name", "Unknown Buff")
		buff_container.add_child(lbl)

func _update_vip_display():
	var user = GameState.current_user
	var is_vip = user.get("isVip", false) if user else false
	if vip_badge:
		vip_badge.visible = is_vip
		if is_vip:
			_animate_vip_badge()

func _animate_vip_badge():
	var tw = create_tween().set_loops()
	tw.tween_property(vip_badge, "modulate:a", 0.5, 1.0)
	tw.tween_property(vip_badge, "modulate:a", 1.0, 1.0)

func _update_achievement_indicator():
	# This logic might be handled by navigation or a separate badge,
	# but we keep it here if there's a status-specific achievement info.
	pass

func _update_title_display():
	var user = GameState.current_user
	var title = user.get("title", "NOVICE") if user else "NOVICE"
	if title_label:
		title_label.text = title.to_upper()
		title_label.modulate = _get_title_color(title)

func _get_title_color(title: String) -> Color:
	var rarity = GameState.get_title_rarity(title)
	match rarity:
		"common": return Color(0.8, 0.8, 0.8)
		"rare": return Color(0.3, 0.6, 0.9)
		"epic": return Color(0.6, 0.3, 0.8)
		"legendary": return Color(1, 0.6, 0.1)
		_: return Color.WHITE

func _update_faction_display():
	var faction = GameState.get_current_faction()
	var rep = faction.get("reputation", 0)
	if faction_label:
		faction_label.text = _get_reputation_tier(rep).to_upper()

func _get_reputation_tier(rep: int) -> String:
	if rep >= 10000: return "Revered"
	elif rep >= 6000: return "Honored"
	elif rep >= 3000: return "Friendly"
	elif rep >= 1000: return "Neutral"
	else: return "Stranger"

func _update_weather_display():
	var weather = GameState.get_current_weather() if GameState.has_method("get_current_weather") else "sunny"
	if weather_label: weather_label.text = weather.to_upper()
	
	if weather_icon:
		match weather:
			"sunny", "clear": weather_icon.text = "☀️"
			"rainy": weather_icon.text = "🌧️"
			"stormy": weather_icon.text = "⛈️"
			"snowy": weather_icon.text = "❄️"
			"cloudy": weather_icon.text = "☁️"
			_: weather_icon.text = "🌈"

func _get_region_type_icon(type: String) -> String:
	match type:
		"FOREST": return "🌲"
		"MINE": return "⛏️"
		"CAVE": return "💎"
		"DUNGEON": return "💀"
		"RUINS": return "🏛️"
		"SWAMP": return "🐊"
		"DESERT": return "🏜️"
		"VOLCANO", "LAVA": return "🌋"
		"SNOW", "ICE": return "❄️"
		"OCEAN": return "🌊"
		"GARDEN": return "🌿"
		_: return "🚩"

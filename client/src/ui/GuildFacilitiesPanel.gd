extends VBoxContainer

@onready var facility_list = $FacilityList/VBox
@onready var build_btn = $Controls/BuildBtn
@onready var upgrade_btn = $Controls/UpgradeBtn

var _facilities = []
var _socket_handler = null
var _guild_handler = null

func _ready():
	_socket_handler = get_node_or_null("/root/SocketHandler")
	_guild_handler = get_node_or_null("/root/GuildHandler")
	if build_btn:
		build_btn.pressed.connect(_on_build_pressed)
	if upgrade_btn:
		upgrade_btn.pressed.connect(_on_upgrade_pressed)

func update_facilities(facilities: Array):
	_facilities = facilities
	_populate_list()

func _populate_list():
	for child in facility_list.get_children(): 
		child.queue_free()
	
	for facility in _facilities:
		var facility_row = _create_facility_row(facility)
		facility_list.add_child(facility_row)

func _create_facility_row(facility: Dictionary) -> Control:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, 60)
	
	# Facility Icon
	var icon = Label.new()
	icon.text = "🏛️"
	icon.add_theme_font_size_override("font_size", 32)
	row.add_child(icon)
	
	# Facility Name & Level
	var info = VBoxContainer.new()
	var name = Label.new()
	name.text = facility.get("template", {}).get("name", "Unknown Facility")
	info.add_child(name)
	
	var level = Label.new()
	level.text = "Level %d" % facility.get("level", 1)
	level.add_theme_color_override("font_color", Color.GOLD)
	info.add_child(level)
	row.add_child(info)
	
	# Effects
	var effects = Label.new()
	var template = facility.get("template", {})
	effects.text = "Bonus: +%d %s" % [
		template.get("statValuePerLevel", 0) * facility.get("level", 1),
		template.get("statKey", "ATK")
	]
	row.add_child(effects)
	
	return row

func _on_build_pressed():
	if _guild_handler:
		_guild_handler.build_facility(1)  # Default template 1

func _on_upgrade_pressed():
	if _guild_handler and _facilities.size() > 0:
		_guild_handler.upgrade_facility(_facilities[0].get("id", 1))

func show_build_options(templates: Array):
	# Show build section with available facility templates
	pass

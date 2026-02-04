extends Control

@onready var guild_name_label = $Main/LeftPanel/GuildInfo/VBox/GuildName if has_node("Main/LeftPanel/GuildInfo/VBox/GuildName") else null
@onready var guild_level_label = $Main/LeftPanel/GuildInfo/VBox/GuildLevel if has_node("Main/LeftPanel/GuildInfo/VBox/GuildLevel") else null
@onready var member_count_label = $Main/LeftPanel/GuildInfo/VBox/MemberCount if has_node("Main/LeftPanel/GuildInfo/VBox/MemberCount") else null
@onready var treasury_label = $Main/LeftPanel/GuildInfo/VBox/Treasury if has_node("Main/LeftPanel/GuildInfo/VBox/Treasury") else null
@onready var members_panel = $Main/CenterPanel/MemberPanel/MemberPanelInst if has_node("Main/CenterPanel/MemberPanel/MemberPanelInst") else null
@onready var facilities_panel = $Main/RightPanel/FacilitiesPanel/FacilitiesPanelInst if has_node("Main/RightPanel/FacilitiesPanel/FacilitiesPanelInst") else null
@onready var treasury_panel = $Main/RightPanel/TreasuryPanel/TreasuryPanelInst if has_node("Main/RightPanel/TreasuryPanel/TreasuryPanelInst") else null

var _current_guild = null
var _socket_handler = null
var _guild_handler = null

func _ready():
	_socket_handler = get_node_or_null("/root/SocketHandler")
	if _socket_handler:
		_guild_handler = get_node_or_null("/root/GuildHandler")
		if _guild_handler:
			_guild_handler.guild_my_info_received.connect(_on_guild_info_received)
			_guild_handler.guild_left.connect(_on_guild_left)
			_guild_handler.guild_disbanded.connect(_on_guild_disbanded)
			_guild_handler.guild_error.connect(_on_guild_error)
	
	# Request guild info
	request_guild_info()

func request_guild_info():
	if _socket_handler and _socket_handler.is_authenticated:
		_guild_handler.request_my_guild()

func _on_guild_info_received(data):
	if data == null or data.is_empty():
		# Player is not in a guild
		_current_guild = null
		_show_no_guild_screen()
		return
	
	_current_guild = data
	_update_ui()

func _update_ui():
	if _current_guild == null:
		return
	
	guild_name_label.text = _current_guild.get("name", "Unknown Guild")
	guild_level_label.text = "Level %d" % _current_guild.get("level", 1)
	member_count_label.text = "%d Members" % _current_guild.get("members", []).size()
	
	var treasury = _current_guild.get("treasury", 0)
	var gold = int(treasury / 1000) if typeof(treasury) == TYPE_INT else 0
	var silver = int(treasury % 1000) if typeof(treasury) == TYPE_INT else 0
	treasury_label.text = "Gold: %d | Silver: %d" % [gold, silver]
	
	# Update each panel
	members_panel.update_members(_current_guild.get("members", []))
	facilities_panel.update_facilities(_current_guild.get("facilities", []))
	if treasury_panel.has_method("update_treasury"):
		treasury_panel.update_treasury(treasury)

func _show_no_guild_screen():
	guild_name_label.text = "No Guild"
	guild_level_label.text = ""
	member_count_label.text = ""
	
	# Show create guild option
	pass

func _on_guild_left():
	_current_guild = null
	_show_no_guild_screen()

func _on_guild_disbanded():
	_current_guild = null
	_show_no_guild_screen()

func _on_guild_error(message):
	print("[GUILD ERROR] ", message)

func close():
	queue_free()

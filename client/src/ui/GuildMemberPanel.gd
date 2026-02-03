extends VBoxContainer

@onready var member_list = $MemberList/VBox
@onready var invite_btn = $Controls/InviteBtn
@onready var leave_btn = $Controls/LeaveBtn

var _members = []
var _socket_handler = null
var _guild_handler = null

func _ready():
	_socket_handler = get_node_or_null("/root/SocketHandler")
	_guild_handler = get_node_or_null("/root/GuildHandler")
	if invite_btn:
		invite_btn.pressed.connect(_on_invite_pressed)
	if leave_btn:
		leave_btn.pressed.connect(_on_leave_pressed)

func update_members(members: Array):
	_members = members
	_populate_list()

func _populate_list():
	for child in member_list.get_children(): 
		child.queue_free()
	
	for member in _members:
		var member_row = _create_member_row(member)
		member_list.add_child(member_row)

func _create_member_row(member: Dictionary) -> Control:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, 50)
	
	# Avatar/Icon
	var avatar = Label.new()
	avatar.text = "👤"
	avatar.add_theme_font_size_override("font_size", 24)
	row.add_child(avatar)
	
	# Username
	var username = Label.new()
	username.text = member.get("username", "Unknown")
	username.custom_minimum_size = Vector2(200, 0)
	row.add_child(username)
	
	# Role
	var role = Label.new()
	var role_text = member.get("guildRole", "MEMBER")
	role.text = "[%s]" % role_text
	
	# Color by role
	match role_text:
		"MASTER": role.add_theme_color_override("font_color", Color.GOLD)
		"OFFICER": role.add_theme_color_override("font_color", Color.CYAN)
		_: role.add_theme_color_override("font_color", Color.WHITE)
	
	row.add_child(role)
	
	# Level/Info
	var level = Label.new()
	level.text = "Lvl %d" % member.get("level", 1)
	row.add_child(level)
	
	# Actions (only for officers)
	var user_role = GameState.current_user.get("guildRole", "") if GameState.current_user else ""
	if user_role in ["MASTER", "OFFICER"] and member.get("guildRole") != "MASTER":
		var action_menu = VBoxContainer.new()
		row.add_child(action_menu)
		
		# Promote button
		if member.get("guildRole") in ["RECRUIT", "MEMBER"]:
			var promote_btn = Button.new()
			promote_btn.text = "Promote"
			promote_btn.pressed.connect(func(): _promote_member(member.get("id")))
			action_menu.add_child(promote_btn)
		
		# Demote button
		if member.get("guildRole") == "MEMBER":
			var demote_btn = Button.new()
			demote_btn.text = "Demote"
			demote_btn.pressed.connect(func(): _demote_member(member.get("id")))
			action_menu.add_child(demote_btn)
		
		# Kick button
		var kick_btn = Button.new()
		kick_btn.text = "Kick"
		kick_btn.pressed.connect(func(): _kick_member(member.get("id")))
		action_menu.add_child(kick_btn)
	
	return row

func _on_invite_pressed():
	if _guild_handler:
		_guild_handler.create_invite()

func _on_leave_pressed():
	if _guild_handler:
		_guild_handler.leave_guild()

func _promote_member(target_id: int):
	if _guild_handler:
		_guild_handler.promote_member(target_id, "OFFICER")

func _demote_member(target_id: int):
	if _guild_handler:
		_guild_handler.demote_member(target_id)

func _kick_member(target_id: int):
	if _guild_handler:
		_guild_handler.kick_member(target_id)

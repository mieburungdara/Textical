extends VBoxContainer

@onready var member_list = $MemberList/VBox
@onready var invite_btn = $Controls/InviteBtn
@onready var leave_btn = $Controls/LeaveBtn

var _members = []
var _socket_handler = null
var _guild_handler = null
var _reputation_handler = null
var _member_reputations = {}  # Cache for member reputations

func _ready():
	_socket_handler = get_node_or_null("/root/SocketHandler")
	_guild_handler = get_node_or_null("/root/GuildHandler")
	_reputation_handler = get_node_or_null("/root/ReputationHandler")
	
	# Connect guild handler signals
	if _guild_handler:
		_guild_handler.guild_info_received.connect(_on_guild_info_received)
	
	if invite_btn:
		invite_btn.pressed.connect(_on_invite_pressed)
	if leave_btn:
		leave_btn.pressed.connect(_on_leave_pressed)

func _on_guild_info_received(guild_data: Dictionary):
	# Refresh member list when guild info is received
	var members = guild_data.get("members", [])
	if not members.is_empty():
		update_members(members)

func update_members(members: Array):
	_members = members
	_populate_list()
	_fetch_member_reputations()

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
	
	# Reputation Badge
	var rep_label = Label.new()
	var user_id = member.get("id", -1)
	var rep_data = _member_reputations.get(user_id, {})
	rep_label.text = _get_reputation_display(rep_data)
	row.add_child(rep_label)
	
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

# === REPUTATION FUNCTIONS ===

func _fetch_member_reputations():
	# Fetch reputation for each guild member
	for member in _members:
		var user_id = member.get("id", -1)
		if user_id > 0 and _reputation_handler:
			_reputation_handler.get_user_reputation(user_id)
			# Connect one-time signal for this user
			var callback = func(stats): _on_reputation_received(user_id, stats)
			if _reputation_handler.reputation_received.is_connected(callback):
				pass  # Already connected
			else:
				_reputation_handler.reputation_received.connect(callback)

func _on_reputation_received(user_id: int, stats: Dictionary):
	_member_reputations[user_id] = stats
	# Refresh the list to show reputation badges
	_populate_list()

func _get_reputation_display(rep_data: Dictionary) -> String:
	if rep_data.is_empty():
		return "⚪ Newcomer"
	
	var likes = rep_data.get("totalLikes", 0)
	var dislikes = rep_data.get("totalDislikes", 0)
	var tier = rep_data.get("likeTier", "NEWCOMER")
	
	# Get badge info
	var badge_info = ReputationHandler.get_badge_info(tier)
	var icon = badge_info.get("icon", "⚪")
	var name = badge_info.get("name", "Newcomer")
	
	# Check for special badges
	var special = ReputationHandler.get_special_badge(likes, dislikes)
	if not special.is_empty():
		icon = special.get("icon", icon)
	
	return "%s %s (%d/%d)" % [icon, name, likes, dislikes]

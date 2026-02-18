extends PanelContainer

# === LEADERBOARD PANEL ===
# Displays top reputation players

@onready var title_label = $VBox/TitleLabel
@onready var type_toggle = $VBox/TypeToggle
@onready var leaderboard_list = $VBox/ScrollContainer/LeaderboardList
@onready var refresh_btn = $VBox/RefreshBtn

var _reputation_handler = null
var _current_type = "like"  # "like" or "dislike"
var _leaderboard_data = []

func _ready():
	_reputation_handler = get_node_or_null("/root/ReputationHandler")
	if _reputation_handler:
		_connect_signals()
	
	if refresh_btn:
		refresh_btn.pressed.connect(_refresh_leaderboard)
	
	# Load initial leaderboard
	_refresh_leaderboard()

func _connect_signals():
	if _reputation_handler:
		_reputation_handler.leaderboard_received.connect(_on_leaderboard_received)

func _refresh_leaderboard():
	if _reputation_handler:
		_reputation_handler.get_leaderboard(_current_type, 10)

func _on_leaderboard_received(data: Array):
	_leaderboard_data = data
	_populate_list()

func _populate_list():
	if not leaderboard_list:
		return
	
	# Clear existing
	for child in leaderboard_list.get_children():
		child.queue_free()
	
	# Populate with data
	for i in range(_leaderboard_data.size()):
		var entry = _leaderboard_data[i]
		var row = _create_leaderboard_row(entry, i + 1)
		leaderboard_list.add_child(row)

func _create_leaderboard_row(entry: Dictionary, rank: int) -> Control:
	var row = HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, 40)
	
	# Rank
	var rank_label = Label.new()
	rank_label.custom_minimum_size = Vector2(40, 0)
	rank_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	
	match rank:
		1: rank_label.text = "🥇"
		2: rank_label.text = "🥈"
		3: rank_label.text = "🥉"
		_: rank_label.text = "#" + str(rank)
	
	row.add_child(rank_label)
	
	# Username
	var username = Label.new()
	username.text = entry.get("username", "Unknown")
	username.custom_minimum_size = Vector2(150, 0)
	row.add_child(username)
	
	# Likes
	var likes = Label.new()
	likes.text = "❤️ " + str(entry.get("totalLikes", 0))
	likes.custom_minimum_size = Vector2(80, 0)
	row.add_child(likes)
	
	# Dislikes
	var dislikes = Label.new()
	dislikes.text = "💔 " + str(entry.get("totalDislikes", 0))
	dislikes.custom_minimum_size = Vector2(80, 0)
	row.add_child(dislikes)
	
	# Tier
	var tier = Label.new()
	var like_tier = entry.get("likeTier", "NEWCOMER")
	var badge_info = ReputationHandler.get_badge_info(like_tier)
	tier.text = badge_info.get("icon", "❓") + " " + like_tier
	row.add_child(tier)
	
	# Special badge
	var special = ReputationHandler.get_special_badge(entry.get("totalLikes", 0), entry.get("totalDislikes", 0))
	if not special.is_empty():
		var special_label = Label.new()
		special_label.text = special.get("icon", "")
		special_label.add_theme_font_size_override("font_size", 20)
		row.add_child(special_label)
	
	return row

func _on_type_toggled(button_pressed: bool):
	# Toggle between like and dislike leaderboard
	_current_type = "like" if button_pressed else "dislike"
	_refresh_leaderboard()

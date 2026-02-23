extends PanelContainer

# === REPUTATION PANEL ===
# Displays player reputation stats with badges

@onready var username_label = $VBox/Header/UsernameLabel
@onready var badge_label = $VBox/Header/BadgeLabel
@onready var stats_container = $VBox/StatsContainer
@onready var likes_label = $VBox/StatsContainer/LikesRow/LikesValue
@onready var dislikes_label = $VBox/StatsContainer/DislikesRow/DislikesValue
@onready var tier_label = $VBox/StatsContainer/TierRow/TierValue
@onready var special_badge_label = $VBox/SpecialBadge
@onready var comments_container = $VBox/CommentsContainer
@onready var actions_container = $VBox/ActionsContainer
@onready var give_like_btn = $VBox/ActionsContainer/GiveLikeBtn
@onready var give_dislike_btn = $VBox/ActionsContainer/GiveDislikeBtn

var _reputation_handler = null
var _current_user_id = -1
var _target_user_id = -1
var _target_username = ""
var _can_give = false
var _current_stats = {}

func _ready():
	_reputation_handler = get_node_or_null("/root/ReputationHandler")
	if _reputation_handler:
		_connect_signals()
	
	# Get current user
	if GameState.current_user:
		_current_user_id = GameState.current_user.get("id", -1)
	
	# Setup button connections
	if give_like_btn:
		give_like_btn.pressed.connect(_on_give_like_pressed)
	if give_dislike_btn:
		give_dislike_btn.pressed.connect(_on_give_dislike_pressed)

func _connect_signals():
	if _reputation_handler:
		_reputation_handler.reputation_received.connect(_on_reputation_received)
		_reputation_handler.reputation_given_success.connect(_on_reputation_given)
		_reputation_handler.can_give_result.connect(_on_can_give_result)
		_reputation_handler.reputation_error.connect(_on_error)

func load_user_reputation(user_id: int, username: String):
	_target_user_id = user_id
	_target_username = username
	
	if username_label:
		username_label.text = username
	
	# Request stats and check if can give
	if _reputation_handler:
		_reputation_handler.get_user_reputation(user_id)
		_reputation_handler.can_give_reputation(user_id)

func _on_reputation_received(stats: Dictionary):
	_current_stats = stats
	
	# Update likes
	var likes = stats.get("totalLikes", 0)
	if likes_label:
		likes_label.text = str(likes)
	
	# Update dislikes
	var dislikes = stats.get("totalDislikes", 0)
	if dislikes_label:
		dislikes_label.text = str(dislikes)
	
	# Update tier
	var like_tier = stats.get("likeTier", "NEWCOMER")
	var dislike_tier = stats.get("dislikeTier", "NEWCOMER")
	if tier_label:
		tier_label.text = like_tier + " / " + dislike_tier
	
	# Update badge display
	_update_badge_display(likes, dislike_tier)
	
	# Update special badges (Angel/Devil)
	_update_special_badges(likes, dislikes)

func _update_badge_display(likes: int, tier: String):
	if not badge_label:
		return
	
	var badge_info = ReputationHandler.get_badge_info(tier)
	var icon = badge_info.get("icon", "❓")
	var name = badge_info.get("name", "Unknown")
	var min_val = badge_info.get("min", 0)
	
	badge_label.text = icon + " " + name + " (" + str(likes) + "/" + str(min_val) + "+)"

func _update_special_badges(likes: int, dislikes: int):
	if not special_badge_label:
		return
	
	var special = ReputationHandler.get_special_badge(likes, dislikes)
	if special.is_empty():
		special_badge_label.text = ""
	else:
		var icon = special.get("icon", "")
		var name = special.get("name", "")
		special_badge_label.text = icon + " " + name

func _on_can_give_result(can_give: bool, reason: String):
	_can_give = can_give
	
	if give_like_btn:
		give_like_btn.disabled = not can_give
	if give_dislike_btn:
		give_dislike_btn.disabled = not can_give
	
	if not can_give and reason:
		print("[ReputationPanel] Cannot give: ", reason)

func _on_give_like_pressed():
	_show_give_dialog("LIKE")

func _on_give_dislike_pressed():
	_show_give_dialog("DISLIKE")

func _show_give_dialog(type: String):
	# Simple dialog - in production would be a proper modal
	# For now, just give with default comment
	var comment = "Good player!" if type == "LIKE" else "Not recommended"
	var interaction_type = "TRADE"  # Default, could be selected
	
	if _reputation_handler and _target_user_id > 0:
		_reputation_handler.give_reputation(_target_user_id, type, comment, interaction_type)

func _on_reputation_given_success(data: Dictionary):
	print("[ReputationPanel] Reputation given successfully")
	# Refresh stats
	if _reputation_handler and _target_user_id > 0:
		_reputation_handler.get_user_reputation(_target_user_id)

func _on_error(message: String):
	print("[ReputationPanel] Error: ", message)

# === STATIC HELPERS ===

static func get_tier_color(tier: String) -> Color:
	var colors = {
		"NEWMONER": Color.GRAY,
		"NOVICE": Color.GREEN,
		"APPRENTICE": Color.BLUE,
		"JOURNEYMAN": Color.CYAN,
		"EXPERT": Color.PURPLE,
		"MASTER": Color.ORANGE,
		"CHAMPION": Color.GOLD,
		"LEGEND": Color.RED,
		"MYTHIC": Color.MAGENTA,
		"ASCENDANT": Color.YELLOW,
		"CELESTIAL": Color.WHITE,
		"DIVINE": Color(1, 0.84, 0)  # Gold
	}
	return colors.get(tier, Color.WHITE)

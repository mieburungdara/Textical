extends BaseNetworkHandler
class_name ReputationHandler

# === REPUTATION SIGNALS ===
signal reputation_given_success(data)
signal reputation_removed_success(to_user_id)
signal reputation_received(user_stats)
signal comments_received(comments)
signal given_reputations_received(reputations)
signal can_give_result(can_give, reason)
signal interactable_users_received(users)
signal leaderboard_received(players)
signal guild_reputation_received(guild_stats)
signal reputation_error(message)

var _base_handler = null

func _ready():
	_base_handler = get_node_or_null("/root/BaseNetworkHandler")
	if not _base_handler:
		push_error("[ReputationHandler] BaseNetworkHandler not found!")

# === API CALLS ===

# Give reputation (LIKE or DISLIKE)
func give_reputation(to_user_id: int, type: String, comment: String, interaction_type: String):
	if _base_handler:
		var endpoint = "/api/reputation/give"
		var body = {
			"toUserId": to_user_id,
			"type": type,  # "LIKE" or "DISLIKE"
			"comment": comment,
			"interactionType": interaction_type  # "GUILD", "TRADE", "PVP", "PROPERTY", "FRIEND"
		}
		_base_handler.post_request(endpoint, body, _on_give_success, _on_error)

# Remove reputation
func remove_reputation(to_user_id: int):
	if _base_handler:
		var endpoint = "/api/reputation/" + str(to_user_id)
		_base_handler.delete_request(endpoint, _on_remove_success, _on_error)

# Get user reputation stats
func get_user_reputation(user_id: int):
	if _base_handler:
		var endpoint = "/api/reputation/" + str(user_id)
		_base_handler.get_request(endpoint, _on_get_reputation, _on_error)

# Get user comments
func get_user_comments(user_id: int):
	if _base_handler:
		var endpoint = "/api/reputation/" + str(user_id) + "/comments"
		_base_handler.get_request(endpoint, _on_get_comments, _on_error)

# Get my given reputations
func get_given_reputations():
	if _base_handler:
		var endpoint = "/api/reputation/me/given"
		_base_handler.get_request(endpoint, _on_get_given, _on_error)

# Check if can give reputation to user
func can_give_reputation(to_user_id: int):
	if _base_handler:
		var endpoint = "/api/reputation/can-give/" + str(to_user_id)
		_base_handler.get_request(endpoint, _on_can_give, _on_error)

# Get users I can give reputation to (had interaction with)
func get_interactable_users():
	if _base_handler:
		var endpoint = "/api/reputation/interactable"
		_base_handler.get_request(endpoint, _on_interactable, _on_error)

# Get leaderboard
func get_leaderboard(type: String = "like", limit: int = 10):
	if _base_handler:
		var endpoint = "/api/reputation/leaderboard?type=" + type + "&limit=" + str(limit)
		_base_handler.get_request(endpoint, _on_leaderboard, _on_error)

# Get guild aggregate reputation
func get_guild_reputation(guild_id: int):
	if _base_handler:
		var endpoint = "/api/reputation/guild/" + str(guild_id)
		_base_handler.get_request(endpoint, _on_guild_reputation, _on_error)

# === CALLBACKS ===

func _on_give_success(data):
	print("[Reputation] Given successfully: ", JSON.stringify(data))
	reputation_given_success.emit(data)

func _on_remove_success(data):
	print("[Reputation] Removed successfully")
	reputation_removed_success.emit(data.get("toUserId", -1))

func _on_get_reputation(data):
	print("[Reputation] Got user stats: ", JSON.stringify(data))
	reputation_received.emit(data)

func _on_get_comments(data):
	print("[Reputation] Got comments: ", JSON.stringify(data))
	comments_received.emit(data.get("comments", []))

func _on_get_given(data):
	print("[Reputation] Got given: ", JSON.stringify(data))
	given_reputations_received.emit(data.get("reputations", []))

func _on_can_give(data):
	print("[Reputation] Can give: ", JSON.stringify(data))
	can_give_result.emit(data.get("canGive", false), data.get("reason", ""))

func _on_interactable(data):
	print("[Reputation] Got interactable users: ", JSON.stringify(data))
	interactable_users_received.emit(data.get("users", []))

func _on_leaderboard(data):
	print("[Reputation] Got leaderboard: ", JSON.stringify(data))
	leaderboard_received.emit(data.get("leaderboard", []))

func _on_guild_reputation(data):
	print("[Reputation] Got guild reputation: ", JSON.stringify(data))
	guild_reputation_received.emit(data)

func _on_error(error):
	print("[Reputation] Error: ", error)
	reputation_error.emit(error.get("message", "Unknown error"))

# === HELPER FUNCTIONS ===

# Get badge info for a given tier
static func get_badge_info(tier: String) -> Dictionary:
	var badges = {
		"NEWCOMER": {"icon": "⭐", "name": "Newcomer", "min": 0, "max": 9},
		"NOVICE": {"icon": "🌱", "name": "Novice", "min": 10, "max": 24},
		"APPRENTICE": {"icon": "🌿", "name": "Apprentice", "min": 25, "max": 49},
		"JOURNEYMAN": {"icon": "🌳", "name": "Journeyman", "min": 50, "max": 99},
		"EXPERT": {"icon": "💎", "name": "Expert", "min": 100, "max": 199},
		"MASTER": {"icon": "🏆", "name": "Master", "min": 200, "max": 349},
		"CHAMPION": {"icon": "👑", "name": "Champion", "min": 350, "max": 499},
		"LEGEND": {"icon": "🔥", "name": "Legend", "min": 500, "max": 749},
		"MYTHIC": {"icon": "⚡", "name": "Mythic", "min": 750, "max": 999},
		"ASCENDANT": {"icon": "🌟", "name": "Ascendant", "min": 1000, "max": 1499},
		"CELESTIAL": {"icon": "☀️", "name": "Celestial", "min": 1500, "max": 2499},
		"DIVINE": {"icon": "🔱", "name": "Divine", "min": 2500, "max": 999999}
	}
	return badges.get(tier, {"icon": "❓", "name": "Unknown", "min": 0, "max": 0})

# Get special badges (Angel/Devil)
static func get_special_badge(likes: int, dislikes: int) -> Dictionary:
	if likes >= 100:
		return {"icon": "👼", "name": "Angel Wings", "type": "angel"}
	elif dislikes >= 100:
		return {"icon": "😈", "name": "Devil Horns", "type": "devil"}
	return {}

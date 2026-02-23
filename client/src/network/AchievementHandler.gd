extends BaseNetworkHandler
class_name AchievementHandler

## Achievement Handler - Manages achievement-related API calls

# Signals
signal achievements_loaded(achievements_data)
signal achievement_unlocked(achievement_data)
signal progress_updated(achievement_code, progress_data)
signal reward_claimed(claim_data)
signal titles_loaded(titles_data)
signal title_equipped(title_data)

var _user_id: int = 0

func _ready():
	super._ready()
	base_url = "http://127.0.0.1:5000/api"

func setup(user_id: int):
	_user_id = user_id

# Get all achievements and player progress
func get_achievements():
	if _user_id == 0:
		push_error("[AchievementHandler] User ID not set")
		return
	
	_request("/user/" + str(_user_id) + "/achievements", HTTPClient.METHOD_GET)

func _handle_success(endpoint: String, json):
	if "/achievements" in endpoint and endpoint.ends_with("/achievements"):
		# Handle achievements list response
		if json.has("data"):
			emit_signal("achievements_loaded", json["data"])
	elif "/claim" in endpoint:
		# Handle reward claim response
		if json.has("data"):
			emit_signal("reward_claimed", json["data"])
	elif "/titles" in endpoint:
		# Handle titles response
		if json.has("data"):
			emit_signal("titles_loaded", json["data"])

# Get achievements by category
func get_achievements_by_category(category: String):
	_request("/achievements/categories?category=" + category, HTTPClient.METHOD_GET)

# Get specific achievement
func get_achievement(code: String):
	_request("/achievements/" + code, HTTPClient.METHOD_GET)

# Get player progress
func get_progress():
	if _user_id == 0:
		push_error("[AchievementHandler] User ID not set")
		return
	
	_request("/achievements/" + str(_user_id) + "/progress", HTTPClient.METHOD_GET)

# Claim reward for completed achievement
func claim_reward(code: String):
	if _user_id == 0:
		push_error("[AchievementHandler] User ID not set")
		return
	
	_request("/user/" + str(_user_id) + "/achievements/" + code + "/claim", HTTPClient.METHOD_POST)

# Get player titles
func get_titles():
	if _user_id == 0:
		push_error("[AchievementHandler] User ID not set")
		return
	
	_request("/user/" + str(_user_id) + "/titles", HTTPClient.METHOD_GET)

# Equip a title
func equip_title(title_id: int):
	if _user_id == 0:
		push_error("[AchievementHandler] User ID not set")
		return
	
	_request("/user/" + str(_user_id) + "/titles/equip", HTTPClient.METHOD_POST, {"titleId": title_id})

# Unequip current title
func unequip_title():
	if _user_id == 0:
		push_error("[AchievementHandler] User ID not set")
		return
	
	_request("/user/" + str(_user_id) + "/titles/unequip", HTTPClient.METHOD_POST)

# Handle achievement progress updates from game events
func on_monster_killed(_is_boss: bool = false):
	# This would typically be called from game logic
	# The actual counter update happens server-side
	pass

func on_battle_won():
	pass

func on_item_collected(_item_rarity: String):
	pass

func on_gold_earned(_amount: int):
	pass

func on_items_crafted(_count: int):
	pass

func on_arena_win():
	pass

func on_region_visited(_region_id: int):
	pass

func on_friend_added():
	pass

func on_guild_joined():
	pass

func on_guild_created():
	pass

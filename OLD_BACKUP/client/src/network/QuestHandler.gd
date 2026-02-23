extends BaseNetworkHandler
class_name QuestHandler

func fetch_quests(user_id: int):
	_request("/quests/" + str(user_id), HTTPClient.METHOD_GET)

func complete_quest(user_id: int, user_quest_id: int):
	_request("/quests/complete", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"userQuestId": user_quest_id
	})

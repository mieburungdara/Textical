extends BaseNetworkHandler
class_name BattleHandler

func start_battle(user_id: int, monster_id: int):
	_request("/battle/start", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"monsterId": monster_id
	})

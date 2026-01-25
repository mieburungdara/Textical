extends BaseNetworkHandler
class_name TavernHandler

func enter(id: int): _request("/tavern/enter", HTTPClient.METHOD_POST, {"userId": id})
func exit(id: int): _request("/tavern/exit", HTTPClient.METHOD_POST, {"userId": id})
func get_mercenaries(id: int): _request("/tavern/mercenaries?userId=" + str(id), HTTPClient.METHOD_GET)
func recruit(u_id: int, m_id: int): _request("/tavern/recruit", HTTPClient.METHOD_POST, {"userId": u_id, "mercenaryId": m_id})

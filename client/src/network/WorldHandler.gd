extends BaseNetworkHandler
class_name WorldHandler

func fetch_all_regions(): _request("/regions", HTTPClient.METHOD_GET)
func get_region_details(id: int): _request("/region/" + str(id), HTTPClient.METHOD_GET)
func travel(u_id: int, r_id: int): _request("/action/travel", HTTPClient.METHOD_POST, {"userId": u_id, "targetRegionId": r_id})
func gather(u_id: int, h_id: int, r_id: int): _request("/action/gather", HTTPClient.METHOD_POST, {"userId": u_id, "heroId": h_id, "resourceId": r_id})
func craft(u_id: int, r_id: int): _request("/action/craft", HTTPClient.METHOD_POST, {"userId": u_id, "recipeId": r_id})
func update_formation(u_id: int, p_id: int, slots: Array): _request("/action/formation/update", HTTPClient.METHOD_POST, {"userId": u_id, "presetId": p_id, "slots": slots})

func _handle_success(_endpoint: String, json):
	if json is Dictionary and json.has("type") and json.get("status") == "RUNNING":
		GameState.set_active_task(json)

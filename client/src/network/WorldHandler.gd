extends BaseNetworkHandler
class_name WorldHandler

func fetch_all_regions(): _request("/regions", HTTPClient.METHOD_GET)
func get_region_details(id: int): _request("/region/" + str(id), HTTPClient.METHOD_GET)
func travel(u_id: int, r_id: int): _request("/action/travel", HTTPClient.METHOD_POST, {"userId": u_id, "targetRegionId": r_id})
func gather(u_id: int, h_id: int, r_id: int): _request("/action/gather", HTTPClient.METHOD_POST, {"userId": u_id, "heroId": h_id, "resourceId": r_id})
func craft(u_id: int, r_id: int): _request("/action/craft", HTTPClient.METHOD_POST, {"userId": u_id, "recipeId": r_id})
func update_formation(u_id: int, p_id: int, slots: Array): _request("/action/formation/update", HTTPClient.METHOD_POST, {"userId": u_id, "presetId": p_id, "slots": slots})
func move_unit_position(u_id: int, p_id: int, h_id: int, x: int, y: int):
       _request("/action/formation/move", HTTPClient.METHOD_POST, {
               "userId": u_id, "presetId": p_id, "heroId": h_id, "gridX": x, "gridY": y
       })

func swap_units_position(u_id: int, p_id: int, hero_a: int, hero_b: int):
	_request("/action/formation/swap", HTTPClient.METHOD_POST, {
		"userId": u_id, "presetId": p_id, "heroA": hero_a, "heroB": hero_b
	})
func _handle_success(_endpoint: String, json):
	if json is Dictionary and json.has("type") and json.has("status"):
		var status = json.get("status", "")
		if status == "RUNNING" or status == "PENDING":
			GameState.set_active_task(json)

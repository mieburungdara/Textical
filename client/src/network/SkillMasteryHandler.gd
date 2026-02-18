extends BaseNetworkHandler
# class_name SkillMasteryHandler

## Handler for Skill Mastery API calls
## Handles fetching skill mastery data from the server

signal mastery_data_received(hero_id, masteries)
signal mastery_error(message)

## Fetch all mastery data for a hero
func fetch_hero_masteries(hero_id: int):
    _request("/skill-mastery/" + str(hero_id), HTTPClient.METHOD_GET)

func _handle_success(endpoint: String, json):
    if endpoint.contains("/skill-mastery/"):
        var unit_id = endpoint.get_file().to_int()
        var data = json.get("data", json) if json is Dictionary else json
        var masteries = []
        if data is Dictionary:
            masteries = data.get("masteries", [])
        elif data is Array:
            masteries = data
            
        mastery_data_received.emit(unit_id, masteries)

func _handle_error(_endpoint: String, _error_code: String, message: String):
    mastery_error.emit(message)

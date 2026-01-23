extends Node

## Singleton for fetching and syncing game data from GitHub.

signal data_synced

const GITHUB_URL = "https://raw.githubusercontent.com/username/repo/master/data/items.json"

var remote_item_data: Dictionary = {}

func fetch_remote_data():
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_request_completed)
	
	print("Fetching remote data from GitHub...")
	var err = http.request(GITHUB_URL)
	if err != OK:
		push_error("HTTP Request failed!")

func _on_request_completed(result, response_code, headers, body):
	if result != HTTPRequest.RESULT_SUCCESS:
		push_error("Failed to download data.")
		return
		
	var json = JSON.parse_string(body.get_as_text())
	if json:
		remote_item_data = json
		_sync_items_to_database()
		data_synced.emit()
		print("Remote data synced successfully!")

func _sync_items_to_database():
	# Here we map the JSON numbers back to our .tres resources
	for item_id in remote_item_data:
		var tres_item = load("res://data/items/" + item_id + ".tres")
		if tres_item and tres_item is EquipmentData:
			var remote_stats = remote_item_data[item_id]
			# Overwrite base stat with remote value!
			tres_item.stat_bonuses["attack_damage"] = remote_stats.get("dmg", 0)
			# ... more mapping logic ...

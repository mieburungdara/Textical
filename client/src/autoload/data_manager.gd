extends Node

signal sync_finished
signal sync_progress(current, total)

const DATA_DIR = "user://data/"
var _sync_queue = []
var _total_to_sync = 0

func _ready():
	_ensure_dirs()

func _ensure_dirs():
	var categories = ["regions", "items", "monsters"]
	for c in categories:
		var path = DATA_DIR + c + "/"
		if !DirAccess.dir_exists_absolute(path):
			DirAccess.make_dir_recursive_absolute(path)

func start_sync():
	print("[SYNC] Checking for updates...")
	# Use a one-shot connection to prevent multiple triggers
	if !ServerConnector.request_completed.is_connected(_on_manifest_received):
		ServerConnector.request_completed.connect(_on_manifest_received)
	
	ServerConnector._send_get("/assets/manifest")

func _on_manifest_received(endpoint, manifest):
	if !endpoint.contains("/assets/manifest"): return
	
	# Disconnect after receiving manifest
	if ServerConnector.request_completed.is_connected(_on_manifest_received):
		ServerConnector.request_completed.disconnect(_on_manifest_received)
	
	if !manifest is Dictionary:
		print("[SYNC] Error: Manifest is not a dictionary.")
		sync_finished.emit()
		return
	
	_sync_queue = []
	for category in manifest.keys():
		for id in manifest[category]:
			var file_path = DATA_DIR + category + "/" + str(id) + ".json"
			if !FileAccess.file_exists(file_path):
				_sync_queue.append({"cat": category, "id": id, "path": file_path})
	
	_total_to_sync = _sync_queue.size()
	if _total_to_sync == 0:
		print("[SYNC] Everything up to date.")
		sync_finished.emit()
	else:
		print("[SYNC] Found ", _total_to_sync, " new assets. Starting download...")
		_process_next_in_queue()

func _process_next_in_queue():
	if _sync_queue.is_empty():
		sync_finished.emit()
		return
		
	var item = _sync_queue.pop_front()
	sync_progress.emit(_total_to_sync - _sync_queue.size(), _total_to_sync)
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(result, code, headers, body): 
		_on_asset_downloaded(result, code, body, item.path)
		http.queue_free()
		_process_next_in_queue()
	)
	
	var url = ServerConnector.base_url + "/assets/raw/" + item.cat + "/" + str(item.id)
	http.request(url)

func _on_asset_downloaded(result, code, body, save_path):
	if result == OK and code == 200:
		var file = FileAccess.open(save_path, FileAccess.WRITE)
		if file:
			file.store_string(body.get_string_from_utf8())
			file.close()

# --- DATA ACCESS ---

func get_asset(category: String, id: int) -> Dictionary:
	var path = DATA_DIR + category + "/" + str(id) + ".json"
	if FileAccess.file_exists(path):
		var file = FileAccess.open(path, FileAccess.READ)
		var json = JSON.parse_string(file.get_as_text())
		return json if json else {}
	return {}

func get_region(id): return get_asset("regions", id)
func get_item(id): return get_asset("items", id)
func get_monster(id): return get_asset("monsters", id)
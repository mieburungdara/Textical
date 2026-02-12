extends Node

## Data Manager with Version Checking
## Downloads templates from server if version mismatch

signal sync_started()
signal sync_progress(current: int, total: int)
signal sync_finished()
signal sync_error(message: String)

signal version_check_started()
signal version_check_completed(needs_update: bool)
signal version_check_failed(error: String)

const DATA_DIR = "user://data/"
const VERSION_FILE = DATA_DIR + "versions.json"

var _local_versions = {}
var _server_versions = {}
var _fallback_data = {}
var _data_cache = {}

var _sync_queue = []
var _total_to_sync = 0

func _ready():
    _load_fallback_data()
    _ensure_dirs()
    _load_local_versions()

func _load_fallback_data():
    var files = ["regions", "items", "monsters"]
    for f in files:
        var path = "res://assets/data/" + f + ".json"
        if FileAccess.file_exists(path):
            var file = FileAccess.open(path, FileAccess.READ)
            var json = JSON.parse_string(file.get_as_text())
            if json: _fallback_data[f] = json

func _ensure_dirs():
    var categories = ["items", "monsters", "regions", "npcs", "skills", "classes", "recipes", "quests", "achievements", "factions", "world_events", "dialogues"]
    for c in categories:
        var path = DATA_DIR + c + "/"
        if !DirAccess.dir_exists_absolute(path):
            DirAccess.make_dir_recursive_absolute(path)

func _load_local_versions():
    if FileAccess.file_exists(VERSION_FILE):
        var file = FileAccess.open(VERSION_FILE, FileAccess.READ)
        var json = JSON.parse_string(file.get_as_text())
        if json and typeof(json) == TYPE_DICTIONARY:
            _local_versions = json

func _save_local_versions():
    var file = FileAccess.open(VERSION_FILE, FileAccess.WRITE)
    if file:
        file.store_string(JSON.stringify(_server_versions, "  "))
        file.close()

## === VERSION CHECK ===

func check_server_versions():
    version_check_started.emit()
    
    # DEBUG: Check if ServerConnector is available
    print("[DataManager.DEBUG] Checking ServerConnector availability...")
    if not ServerConnector:
        print("[DataManager.ERROR] ServerConnector is null!")
        version_check_failed.emit("ServerConnector not initialized")
        return
    
    print("[DataManager.DEBUG] ServerConnector found: " + str(ServerConnector))
    
    var result = await _fetch_json("/assets/versions")
    
    if not result:
        print("[DataManager.ERROR] _fetch_json returned null")
        version_check_failed.emit("Failed to connect to server")
        return
    
    if not result.has("data"):
        print("[DataManager.ERROR] Response missing 'data' key: " + str(result))
        version_check_failed.emit("Invalid response format")
        return
    
    # DEBUG: Log server response
    print("[DataManager.DEBUG] Server response: " + str(result.data))
    
    _server_versions = result.data.versions if result.data.has("versions") else {}
    
    # Compare versions
    var needs_update = false
    
    for cat in _server_versions.keys():
        var local = _local_versions.get(cat, 0)
        var server = _server_versions[cat]
        
        if server > local:
            print("[DataManager] %s: %d → %d (UPDATE NEEDED)" % [cat, local, server])
            needs_update = true
        else:
            print("[DataManager] %s: %d (UP TO DATE)" % [cat, server])
    
    if _server_versions.is_empty():
        print("[DataManager.WARN] No versions received from server!")
        needs_update = false # Default to no update if server error
    
    version_check_completed.emit(needs_update)

## === DOWNLOAD ALL ===

func download_all_templates():
    sync_started.emit()
    
    var categories = _server_versions.keys()
    var total_downloads = 0
    var completed_downloads = 0
    
    # Count total entries from manifest
    var manifest_result = await _fetch_json("/assets/manifest")
    if manifest_result and manifest_result.has("data"):
        for cat in categories:
            var cat_data = manifest_result.data.get(cat, {})
            var entries = cat_data.get("entries", [])
            total_downloads += entries.size()
    
    print("[DataManager] Total entries to download: %d" % total_downloads)
    
    # Download each category
    for cat in categories:
        var result = await _fetch_json("/assets/" + cat)
        
        if not result or not result.has("data"):
            continue
        
        var entries = result.data.entries if result.data.has("entries") else []
        
        for entry in entries:
            var entry_id = entry.id
            
            # Save to file
            var file_path = DATA_DIR + cat + "/" + str(entry_id) + ".json"
            var file = FileAccess.open(file_path, FileAccess.WRITE)
            if file:
                file.store_string(JSON.stringify(entry, "  "))
                file.close()
            
            # Cache in memory
            var cache_key = cat + "_" + str(entry_id)
            _data_cache[cache_key] = entry
            
            completed_downloads += 1
            sync_progress.emit(completed_downloads, total_downloads)
    
    # Save versions
    _local_versions = _server_versions.duplicate()
    _save_local_versions()
    
    print("[DataManager] Download complete: %d entries" % completed_downloads)
    sync_finished.emit()

## === BACKWARD COMPATIBILITY (uses manifest) ===

func start_sync():
    print("[SYNC] Checking for updates...")
    
    if ServerConnector and ServerConnector.has_signal("request_completed"):
        if !ServerConnector.request_completed.is_connected(_on_manifest_received):
            ServerConnector.request_completed.connect(_on_manifest_received)
    
    if ServerConnector:
        ServerConnector._send_get("/assets/manifest")

func _on_manifest_received(endpoint, manifest_response):
    if !endpoint.contains("/assets/manifest"): return
    
    if ServerConnector and ServerConnector.request_completed.is_connected(_on_manifest_received):
        ServerConnector.request_completed.disconnect(_on_manifest_received)
    
    if !manifest_response is Dictionary:
        print("[SYNC] Error: Manifest response is not a dictionary.")
        sync_finished.emit()
        return
    
    var manifest = manifest_response.get("data")
    if !manifest is Dictionary:
        print("[SYNC] Error: Manifest 'data' key is not a dictionary.")
        sync_finished.emit()
        return
    
    _sync_queue = []
    _total_to_sync = 0
    
    # Build sync queue from new manifest format
    for category in manifest.keys():
        var category_data = manifest[category]
        
        if typeof(category_data) == TYPE_DICTIONARY:
            var entries = category_data.get("entries", [])
            for entry in entries:
                var entry_id = entry.id if typeof(entry) == TYPE_DICTIONARY else entry
                var file_path = DATA_DIR + category + "/" + str(entry_id) + ".json"
                if !FileAccess.file_exists(file_path):
                    _sync_queue.append({"cat": category, "id": entry_id, "path": file_path})
        elif typeof(category_data) == TYPE_ARRAY:
            for id in category_data:
                var file_path = DATA_DIR + category + "/" + str(id) + ".json"
                if !FileAccess.file_exists(file_path):
                    _sync_queue.append({"cat": category, "id": id, "path": file_path})
    
    _total_to_sync = _sync_queue.size()
    if _total_to_sync == 0:
        print("[SYNC] Everything up to date.")
        sync_finished.emit()
    else:
        print("[SYNC] Found %d new assets. Starting download..." % _total_to_sync)
        _process_next_in_queue()

func _process_next_in_queue():
    if _sync_queue.is_empty():
        sync_finished.emit()
        return
    
    var item = _sync_queue.pop_front()
    sync_progress.emit(_total_to_sync - _sync_queue.size(), _total_to_sync)
    
    var http = HTTPRequest.new()
    add_child(http)
    http.request_completed.connect(func(result, code, _headers, body): 
        _on_asset_downloaded(result, code, body, item.path)
        http.queue_free()
        _process_next_in_queue()
    )
    
    var url = ""
    if ServerConnector:
        url = ServerConnector.base_url + "/assets/raw/" + item.cat + "/" + str(item.id)
        http.request(url)

func _on_asset_downloaded(result, code, body, save_path):
    if result == OK and code == 200:
        var file = FileAccess.open(save_path, FileAccess.WRITE)
        if file:
            file.store_string(body.get_string_from_utf8())
            file.close()

## === HELPER ===

func _fetch_json(url: String) -> Dictionary:
    print("[DataManager.DEBUG] _fetch_json called: " + url)
    
    if not ServerConnector:
        print("[DataManager.ERROR] _fetch_json: ServerConnector is null")
        return {}
    
    var result = await ServerConnector._send_get_raw(url)
    
    print("[DataManager.DEBUG] _fetch_json result for " + url + ": " + str(result))
    
    return result if result else {}

## === DATA ACCESS ===

func get_asset(category: String, id: int) -> Dictionary:
    var cache_key = category + "_" + str(id)
    
    # Try memory cache
    if _data_cache.has(cache_key):
        return _data_cache[cache_key]
    
    # Try local file
    var path = DATA_DIR + category + "/" + str(id) + ".json"
    if FileAccess.file_exists(path):
        var file = FileAccess.open(path, FileAccess.READ)
        var json = JSON.parse_string(file.get_as_text())
        if json:
            _data_cache[cache_key] = json
            return json
    
    # Try fallback
    if _fallback_data.has(category):
        var str_id = str(id)
        if _fallback_data[category].has(str_id):
            return _fallback_data[category][str_id]
    
    print("[DataManager] Asset not found: %s %d" % [category, id])
    return {}

# Convenience functions
func get_region(id: int) -> Dictionary: return get_asset("regions", id)
func get_item(id: int) -> Dictionary: return get_asset("items", id)
func get_monster(id: int) -> Dictionary: return get_asset("monsters", id)
func get_npc(id: int) -> Dictionary: return get_asset("npcs", id)
func get_skill(id: int) -> Dictionary: return get_asset("skills", id)
func get_class_data(id: int) -> Dictionary: return get_asset("classes", id)
func get_recipe(id: int) -> Dictionary: return get_asset("recipes", id)
func get_quest(id: int) -> Dictionary: return get_asset("quests", id)
func get_formation(id: int) -> Dictionary: return get_asset("formations", id)
func get_achievement(id: int) -> Dictionary: return get_asset("achievements", id)
func get_faction(id: int) -> Dictionary: return get_asset("factions", id)
func get_world_event(id: int) -> Dictionary: return get_asset("world_events", id)
func get_dialogue(id: int) -> Dictionary: return get_asset("dialogues", id)

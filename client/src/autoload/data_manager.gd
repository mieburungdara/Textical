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

func check_server_versions(max_retries: int = -1): # -1 for infinite retries
    version_check_started.emit()
    
    var retry_count = 0
    var success = false
    
    while not success:
        if max_retries != -1 and retry_count >= max_retries:
            print("[DataManager.ERROR] Max retries reached for version check.")
            version_check_failed.emit("Maximum connection attempts reached")
            return

        # Step 1: Check if ServerConnector is available
        if not ServerConnector:
            print("[DataManager.ERROR] ServerConnector is null!")
            version_check_failed.emit("ServerConnector not initialized")
            return
        
        # Step 2: Test server connectivity first
        print("[DataManager] Testing server connectivity (Attempt %d)..." % (retry_count + 1))
        var conn_success = await ServerConnector.test_connection(5.0)
        
        if not conn_success:
            print("[DataManager.WARN] Server unreachable. Retrying in 3 seconds...")
            version_check_failed.emit("Retrying connection (%d)..." % (retry_count + 1))
            retry_count += 1
            await get_tree().create_timer(3.0).timeout
            continue
        
        print("[DataManager] Server is reachable, fetching versions...")
        
        # Step 3: Fetch version data
        var result = await _fetch_json("/assets/versions")
        
        if not result or not result.has("data"):
            print("[DataManager.ERROR] Failed to fetch versions. Retrying in 3 seconds...")
            version_check_failed.emit("Retrying data fetch (%d)..." % (retry_count + 1))
            retry_count += 1
            await get_tree().create_timer(3.0).timeout
            continue
        
        success = true
        print("[DataManager] Server response received: " + str(result.data))
        
        _server_versions = result.data.versions if result.data.has("versions") else {}
        
        # Step 4: Compare versions
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
            needs_update = false
        
        version_check_completed.emit(needs_update)

## === DOWNLOAD ALL ===

func download_all_templates():
    sync_started.emit()
    
    var categories = _server_versions.keys()
    var total_downloads = 0
    var completed_downloads = 0
    
    # Count total entries from manifest (with retry)
    var manifest_result = null
    while not manifest_result:
        manifest_result = await _fetch_json("/assets/manifest")
        if not manifest_result or not manifest_result.has("data"):
            print("[DataManager.ERROR] Failed to fetch manifest. Retrying in 2s...")
            await get_tree().create_timer(2.0).timeout
            manifest_result = null
            continue
    
    for cat in categories:
        if not manifest_result.data is Dictionary:
            print("[DataManager.ERROR] manifest_result.data is not a Dictionary!")
            break
            
        var cat_data = manifest_result.data.get(cat, {})
        if cat_data is Dictionary:
            var entries = cat_data.get("entries", [])
            total_downloads += entries.size()
        elif cat_data is Array:
            total_downloads += cat_data.size()
    
    print("[DataManager] Total entries to download: %d" % total_downloads)
    
    # Download each category
    for cat in categories:
        var result = null
        while not result:
            result = await _fetch_json("/assets/" + cat)
            if not result or not result.has("data"):
                print("[DataManager.ERROR] Failed to fetch category %s. Retrying in 2s..." % cat)
                await get_tree().create_timer(2.0).timeout
                result = null
                continue
        
        var entries = []
        if result.data is Dictionary:
            entries = result.data.entries if result.data.has("entries") else []
        elif result.data is Array:
            entries = result.data
        
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

## === SYNC LOGIC ===

func start_sync():
    print("[SYNC] Starting mandatory template update...")
    download_all_templates()

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

class_name LoginPreloader
extends Node

## RESPONSIBILITY: Parallel data pre-loading after login
## SINGLE RESPONSIBILITY: Fetches heroes, inventory, and region data

signal preload_completed(region_data: Dictionary)
signal preload_progress(message: String)

var _heroes_loaded: bool = false
var _inventory_loaded: bool = false
var _region_loaded: bool = false
var _region_data: Dictionary = {}

func _ready() -> void:
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.error_occurred.connect(_on_error_occurred)

## Start preloading sequence
func start_preloading(user_id: int, current_region: int) -> void:
	print("[PRELOADER] Starting preloading for User:%d, Region:%d" % [user_id, current_region])
	_heroes_loaded = false
	_inventory_loaded = false
	_region_loaded = false
	
	preload_progress.emit("Syncing heroes...")
	ServerConnector.fetch_heroes(user_id)
	
	preload_progress.emit("Syncing inventory...")
	ServerConnector.fetch_inventory(user_id)
	
	# [OPTIMIZED] Load static data from local cache first, then fetch dynamic data
	preload_progress.emit("Loading region data...")
	_load_region_data(current_region)

func _on_request_completed(endpoint: String, data: Dictionary) -> void:
	print("[PRELOADER] Request completed: ", endpoint)
	if endpoint.contains("/heroes"):
		_heroes_loaded = true
	elif endpoint.contains("/inventory"):
		_inventory_loaded = true
	elif endpoint.contains("/region/"):
		_region_loaded = true
		var r_data = data.get("data", data)
		if r_data is Dictionary:
			# [OPTIMIZED] Merge dynamic data (monsters, resources) with existing static data
			# Keep static data from cache, update only dynamic fields
			if r_data.has("monsters"):
				_region_data["monsters"] = r_data.get("monsters", [])
			if r_data.has("resources"):
				_region_data["resources"] = r_data.get("resources", [])
			
			GameState.current_region_data = _region_data
			print("[PRELOADER] Merged dynamic data: monsters=%d, resources=%d" % [
				_region_data.get("monsters", []).size(),
				_region_data.get("resources", []).size()
			])
	
	_check_completion()

func _on_error_occurred(endpoint: String, message: String) -> void:
	print("[PRELOADER] Error occurred on %s: %s" % [endpoint, message])
	# Fallback to prevent getting stuck
	if endpoint.contains("/heroes"):
		_heroes_loaded = true
	elif endpoint.contains("/inventory"):
		_inventory_loaded = true
	elif endpoint.contains("/region/"):
		_region_loaded = true
	
	_check_completion()

func _check_completion() -> void:
	print("[PRELOADER] Progress: Heroes=%s, Inv=%s, Region=%s" % [str(_heroes_loaded), str(_inventory_loaded), str(_region_loaded)])
	if _heroes_loaded and _inventory_loaded and _region_loaded:
		print("[PRELOADER] All preloading tasks finished.")
		preload_completed.emit(_region_data)

## [NEW] Load region data with cache-first strategy
## 1. Static data from local cache (gridX, gridY, name, connections, lore)
## 2. Dynamic data from network (monsters, resources)
func _load_region_data(region_id: int) -> void:
	var rid = region_id if region_id > 0 else 1
	
	# STEP 1: Load static data from local cache (NO network)
	var static_data = DataManager.get_region(rid)
	if static_data and static_data.size() > 0:
		# Use local cache data immediately
		_region_data = static_data.duplicate(true)
		GameState.current_region_data = _region_data
		preload_progress.emit("Region: " + static_data.get("name", "Unknown"))
		print("[PRELOADER] Loaded static data from cache: " + static_data.get("name", "Unknown"))
	else:
		print("[PRELOADER] Warning: No cached data for region " + str(rid))
	
	# STEP 2: Fetch dynamic data from network (monsters, resources)
	# This is the only network call needed
	preload_progress.emit("Fetching dynamic region data...")
	ServerConnector.get_region_details(rid)

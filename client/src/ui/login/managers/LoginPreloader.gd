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

## Start preloading sequence
func start_preloading(user_id: int, current_region: int) -> void:
	_heroes_loaded = false
	_inventory_loaded = false
	_region_loaded = false
	
	preload_progress.emit("Syncing heroes...")
	ServerConnector.fetch_heroes(user_id)
	
	preload_progress.emit("Syncing inventory...")
	ServerConnector.fetch_inventory(user_id)
	
	preload_progress.emit("Fetching region details...")
	if current_region > 0:
		ServerConnector.get_region_details(current_region)
	else:
		ServerConnector.get_region_details(1) # Default

func _on_request_completed(endpoint: String, data: Dictionary) -> void:
	if endpoint.contains("/heroes"):
		_heroes_loaded = true
	elif endpoint.contains("/inventory"):
		_inventory_loaded = true
	elif endpoint.contains("/region/"):
		_region_loaded = true
		_region_data = data.get("data", data)
		GameState.current_region_data = _region_data
	
	_check_completion()

func _check_completion() -> void:
	if _heroes_loaded and _inventory_loaded and _region_loaded:
		preload_completed.emit(_region_data)

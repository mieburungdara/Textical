extends BaseNetworkHandler
class_name RegionCacheHandler

## RegionCacheHandler - Handles region data caching and synchronization
##
## Responsibilities:
## - Fetch regions version from server first (delta sync)
## - Compare version with local cache
## - Only fetch full data if server version > cached version
## - Update cache file when needed
## - Provide region data to GameState

signal cache_updated(version: int, region_count: int)
signal cache_up_to_date(version: int)
signal cache_fetch_failed(error_message: String)
signal cache_refresh_complete(version: int, was_forced: bool)

func _ready():
	super._ready()
	print("[RegionCacheHandler] Ready")

## Sync regions after login - uses delta sync (check version first)
func sync_regions_after_login() -> void:
	print("[RegionCacheHandler] Syncing regions after login (delta sync)...")
	
	# STEP 1: Get cached version FIRST
	var cached_version: int = 0
	if game_state and game_state.has_method("get_cached_regions_version"):
		cached_version = game_state.get_cached_regions_version()
	print("[RegionCacheHandler] Cached version: %d" % cached_version)
	
	# STEP 2: Request server version FIRST (lightweight request)
	var version_result = await _request_async("/regions/version", HTTPClient.METHOD_GET)
	
	if version_result.is_empty():
		push_error("[RegionCacheHandler] Failed to fetch version from server, falling back to full fetch")
		await _fetch_full_regions()
		return
	
	# Parse server version
	var server_version: int = 1
	if version_result is Dictionary:
		server_version = version_result.get("data", {}).get("version", 1)
		if version_result.get("version", 0) > 0:
			server_version = version_result.get("version", 1)
	elif version_result.has("version"):
		server_version = version_result.get("version", 1)
	
	print("[RegionCacheHandler] Server version: %d, Cached version: %d" % [server_version, cached_version])
	
	# STEP 3: Compare versions - only fetch full data if server version > cached version
	if server_version > cached_version:
		print("[RegionCacheHandler] Server has newer version, fetching full regions data...")
		await _fetch_full_regions(false)
		# Update the cached version to match server after fetching
		if game_state and game_state.has_method("get_cached_regions_version"):
			# The _fetch_full_regions will save with server_version, but we update our tracked version
			pass
	else:
		print("[RegionCacheHandler] Regions cache already up-to-date (v%d)" % cached_version)
		cache_up_to_date.emit(cached_version)
		cache_refresh_complete.emit(cached_version, false)

## Fetch full regions data from server and save to cache
func _fetch_full_regions(is_force_refresh: bool = false) -> void:
	var result = await _request_async("/regions", HTTPClient.METHOD_GET)
	
	if result.is_empty():
		push_error("[RegionCacheHandler] Failed to fetch regions from server")
		cache_fetch_failed.emit("Failed to fetch regions from server")
		return
	
	# Handle response format: { data: [...], version: X } or direct array
	var regions: Array = []
	var server_version: int = 1
	
	if result is Dictionary:
		regions = result.get("data", [])
		server_version = result.get("version", 1)
	elif result is Array:
		regions = result
		server_version = 1
	
	if regions.is_empty():
		print("[RegionCacheHandler] No regions received")
		cache_fetch_failed.emit("No regions received from server")
		return
	
	# Save to cache with server version
	if game_state and game_state.has_method("save_regions_to_cache"):
		game_state.save_regions_to_cache(regions, server_version)
		print("[RegionCacheHandler] Updated regions cache to v%d (%d regions)" % [server_version, regions.size()])
		cache_updated.emit(server_version, regions.size())
		cache_refresh_complete.emit(server_version, is_force_refresh)
	else:
		push_error("[RegionCacheHandler] GameState missing cache methods")
		cache_fetch_failed.emit("GameState missing cache methods")

## Force refresh cache from server (ignores version check, always fetches full data)
func force_refresh_cache() -> void:
	print("[RegionCacheHandler] Force refreshing regions cache...")
	await _fetch_full_regions(true)

## Helper to increment version (for testing purposes)
func _increment_version_for_testing() -> int:
	# This can be called by admin/debug tools to test delta sync
	var current = 1
	if game_state and game_state.has_method("get_cached_regions_version"):
		current = game_state.get_cached_regions_version()
	return current + 1

extends BaseNetworkHandler
class_name StatHandler

## StatHandler - Network handler untuk sistem stat unit
## Menghandle sync, comparison, dan real-time updates untuk stats

# === SIGNALS ===
signal stats_updated(unit_id, stats_data)
signal stat_changed(unit_id, stat_name, old_value, new_value)
signal stat_comparison_received(unit_id, comparison_data)
signal stat_allocation_received(unit_id, allocation_data)
signal stat_cap_reached(unit_id, stat_name, current_value, cap_value)
signal elemental_affinity_updated(unit_id, affinities)
signal set_bonus_updated(unit_id, bonuses)

# === EXPORT VARIABLES ===
@export var stat_sync_interval: float = 30.0  # Sync interval dalam detik
@export var enable_realtime_updates: bool = true

# === PRIVATE VARIABLES ===
var _stat_sync_timer: Timer
var _pending_comparisons: Dictionary = {}
var _cached_stats: Dictionary = {}

# === CONSTANTS ===
const STAT_EVENT_PREFIX = "stat:"
const STAT_UPDATE_EVENT = "stat:updated"
const STAT_CHANGE_EVENT = "stat:changed"
const STAT_COMPARE_EVENT = "stat:compare_result"
const STAT_ALLOCATE_EVENT = "stat:allocation_result"
const STAT_CAP_EVENT = "stat:cap_reached"
const ELEMENTAL_UPDATE_EVENT = "stat:elemental_update"
const SET_BONUS_UPDATE_EVENT = "stat:set_bonus_update"

func _ready():
	super._ready()
	_setup_stat_sync_timer()
	_register_socket_events()

func _setup_stat_sync_timer():
	_stat_sync_timer = Timer.new()
	_stat_sync_timer.wait_time = stat_sync_interval
	_stat_sync_timer.autostart = false
	_stat_sync_timer.timeout.connect(_on_stat_sync_timer_timeout)
	add_child(_stat_sync_timer)

func _register_socket_events():
	# Events akan diregister oleh SocketHandler
	pass

# === API METHODS ===

## Fetch complete stats untuk unit
func fetch_unit_stats(unit_id: int):
	_request("/stat/unit/%d" % unit_id, HTTPClient.METHOD_GET)

## Fetch single stat value
func fetch_stat(unit_id: int, stat_name: String):
	_request("/stat/unit/%d/%s" % [unit_id, stat_name], HTTPClient.METHOD_GET)

## Request stat comparison (base vs current)
func request_stat_comparison(unit_id: int, equipment_preview: Array = []):
	var body = {"unitId": unit_id}
	if not equipment_preview.is_empty():
		body["equipmentPreview"] = equipment_preview
	
	_request("/stat/compare", HTTPClient.METHOD_POST, body)

## Request stat allocation
func request_stat_allocation(unit_id: int, stat_points: Dictionary):
	# stat_points format: {"hp": 5, "mp": 3, "attack": 2}
	_request("/stat/allocate", HTTPClient.METHOD_POST, {
		"unitId": unit_id,
		"allocations": stat_points
	})

## Preview stat changes sebelum confirm
func preview_stat_allocation(unit_id: int, stat_points: Dictionary):
	_request("/stat/allocate/preview", HTTPClient.METHOD_POST, {
		"unitId": unit_id,
		"allocations": stat_points
	})

## Fetch elemental affinities
func fetch_elemental_affinities(unit_id: int):
	_request("/stat/unit/%d/elemental" % unit_id, HTTPClient.METHOD_GET)

## Fetch set bonuses
func fetch_set_bonuses(unit_id: int):
	_request("/stat/unit/%d/set-bonuses" % unit_id, HTTPClient.METHOD_GET)

## Fetch stat caps untuk unit
func fetch_stat_caps(unit_id: int):
	_request("/stat/unit/%d/caps" % unit_id, HTTPClient.METHOD_GET)

## Fetch growth curve data
func fetch_growth_curve(unit_id: int, stat_name: String):
	_request("/stat/growth/%d/%s" % [unit_id, stat_name], HTTPClient.METHOD_GET)

## Fetch available stat points
func fetch_available_stat_points(unit_id: int):
	_request("/stat/unit/%d/available-points" % unit_id, HTTPClient.METHOD_GET)

## Request real-time stat updates subscription
func subscribe_to_stat_updates(unit_id: int):
	_request("/stat/subscribe", HTTPClient.METHOD_POST, {"unitId": unit_id})

## Unsubscribe dari real-time updates
func unsubscribe_from_stat_updates(unit_id: int):
	_request("/stat/unsubscribe", HTTPClient.METHOD_POST, {"unitId": unit_id})

# === SOCKET METHODS ===

## Emit stat change event via socket
func emit_stat_change(unit_id: int, stat_name: String, old_value, new_value):
	var msg = '42["%s%s", %s]' % [STAT_EVENT_PREFIX, STAT_CHANGE_EVENT, JSON.stringify({
		"unitId": unit_id,
		"statName": stat_name,
		"oldValue": old_value,
		"newValue": new_value
	})]
	# Akan dihandle oleh SocketHandler
	pass

## Emit stat update via socket
func emit_stat_update_request(unit_id: int):
	_request("/stat/update/request", HTTPClient.METHOD_POST, {"unitId": unit_id})

# === HANDLER OVERRIDES ===

func _handle_success(endpoint: String, json):
	if "/stat/unit/" in endpoint:
		if "/elemental" in endpoint:
			_handle_elemental_response(endpoint, json)
		elif "/set-bonuses" in endpoint:
			_handle_set_bonuses_response(endpoint, json)
		elif "/caps" in endpoint:
			_handle_stat_caps_response(endpoint, json)
		elif "/available-points" in endpoint:
			_handle_available_points_response(endpoint, json)
		elif "/growth" in endpoint:
			_handle_growth_curve_response(endpoint, json)
		else:
			_handle_unit_stats_response(endpoint, json)
	
	elif "/stat/compare" in endpoint:
		_handle_comparison_response(endpoint, json)
	
	elif "/stat/allocate" in endpoint:
		if "/preview" in endpoint:
			_handle_allocation_preview_response(endpoint, json)
		else:
			_handle_allocation_response(endpoint, json)

func _handle_error(endpoint: String, message: String):
	print("[STAT_HANDLER] Error on %s: %s" % [endpoint, message])
	# Emit error signal yang bisa di-handle oleh UI

# === PRIVATE HANDLERS ===

func _handle_unit_stats_response(endpoint: String, json):
	var unit_id = _extract_unit_id_from_endpoint(endpoint)
	if unit_id != -1:
		_cached_stats[unit_id] = json
		stats_updated.emit(unit_id, json)

func _handle_comparison_response(endpoint: String, json):
	var unit_id = json.get("unitId", -1)
	if unit_id != -1:
		stat_comparison_received.emit(unit_id, json)

func _handle_allocation_response(endpoint: String, json):
	var unit_id = json.get("unitId", -1)
	if unit_id != -1:
		stat_allocation_received.emit(unit_id, json)

func _handle_allocation_preview_response(endpoint: String, json):
	var unit_id = json.get("unitId", -1)
	if unit_id != -1:
		stat_allocation_received.emit(unit_id, json)

func _handle_elemental_response(endpoint: String, json):
	var unit_id = _extract_unit_id_from_endpoint(endpoint)
	if unit_id != -1:
		elemental_affinity_updated.emit(unit_id, json)

func _handle_set_bonuses_response(endpoint: String, json):
	var unit_id = _extract_unit_id_from_endpoint(endpoint)
	if unit_id != -1:
		set_bonus_updated.emit(unit_id, json)

func _handle_stat_caps_response(endpoint: String, json):
	# Handle stat caps - bisa di-cache untuk tooltip display
	var unit_id = _extract_unit_id_from_endpoint(endpoint)
	if unit_id != -1:
		_cached_stats[unit_id].caps = json

func _handle_available_points_response(endpoint: String, json):
	var unit_id = _extract_unit_id_from_endpoint(endpoint)
	if unit_id != -1:
		_cached_stats[unit_id].availablePoints = json

func _handle_growth_curve_response(endpoint: String, json):
	# Growth curve data untuk visualization
	pass

func _extract_unit_id_from_endpoint(endpoint: String) -> int:
	# Extract unit ID dari endpoint pattern /stat/unit/{id}/...
	var pattern = Regex.new()
	pattern.compile(r"/stat/unit/(\d+)")
	var result = pattern.search(endpoint)
	if result:
		return int(result.get_string(1))
	return -1

# === TIMER CALLBACKS ===

func _on_stat_sync_timer_timeout():
	if GameState.selected_hero_id != -1:
		fetch_unit_stats(GameState.selected_hero_id)

# === PUBLIC UTILITY METHODS ===

## Start periodic stat sync
func start_stat_sync():
	if not _stat_sync_timer.is_stopped():
		_stat_sync_timer.stop()
	_stat_sync_timer.start()

## Stop periodic stat sync
func stop_stat_sync():
	_stat_sync_timer.stop()

## Get cached stats for unit
func get_cached_stats(unit_id: int) -> Dictionary:
	return _cached_stats.get(unit_id, {})

## Check if stats are cached for unit
func has_cached_stats(unit_id: int) -> bool:
	return _cached_stats.has(unit_id)

# === SOCKET EVENT HANDLERS (dipanggil dari SocketHandler) ===

func _on_stat_updated(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	if unit_id != -1:
		stats_updated.emit(unit_id, data.get("stats", {}))

func _on_stat_changed(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var stat_name = data.get("statName", "")
	var old_value = data.get("oldValue", 0)
	var new_value = data.get("newValue", 0)
	if unit_id != -1 and stat_name != "":
		stat_changed.emit(unit_id, stat_name, old_value, new_value)
		# Update cached stats
		if _cached_stats.has(unit_id):
			_cached_stats[unit_id][stat_name] = new_value

func _on_stat_cap_reached(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	var stat_name = data.get("statName", "")
	var current_value = data.get("currentValue", 0)
	var cap_value = data.get("capValue", 0)
	if unit_id != -1 and stat_name != "":
		stat_cap_reached.emit(unit_id, stat_name, current_value, cap_value)

func _on_elemental_update(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	if unit_id != -1:
		elemental_affinity_updated.emit(unit_id, data.get("affinities", []))

func _on_set_bonus_update(data: Dictionary):
	var unit_id = data.get("unitId", -1)
	if unit_id != -1:
		set_bonus_updated.emit(unit_id, data.get("bonuses", []))

class_name SyncManager
extends Node

## RESPONSIBILITY: Data synchronization with DataManager
## SINGLE RESPONSIBILITY: Only handles sync state and signals
## Godot 4.5 Compatible

signal sync_started()
signal sync_progress(current: int, total: int)
signal sync_completed()
signal sync_error(endpoint: String, message: String)

# State tracking
var _is_syncing: bool = false
var _sync_error_count: int = 0
const MAX_RETRY_COUNT: int = 3

func _ready() -> void:
	_connect_signals()

## Connect to DataManager signals
func _connect_signals() -> void:
	if DataManager and DataManager.has_signal("sync_progress"):
		DataManager.sync_progress.connect(_on_sync_progress)
	
	if DataManager and DataManager.has_signal("sync_finished"):
		DataManager.sync_finished.connect(_on_sync_finished)

## Start the synchronization process
func start_sync() -> void:
	if not DataManager:
		sync_error.emit("general", "DataManager not initialized")
		return
	
	if not DataManager.has_method("start_sync"):
		sync_error.emit("general", "DataManager.start_sync() method not found")
		return
	
	_is_syncing = true
	_sync_error_count = 0
	sync_started.emit()
	
	# Call start_sync and await if it returns a coroutine
	var result = DataManager.start_sync()
	if result != null:
		await result

## Handle sync progress updates
func _on_sync_progress(current: int, total: int) -> void:
	if _is_syncing:
		sync_progress.emit(current, total)

## Handle sync completion
func _on_sync_finished() -> void:
	_is_syncing = false
	sync_completed.emit()

## Handle sync errors
func _on_error(endpoint: String, message: String) -> void:
	_sync_error_count += 1
	sync_error.emit(endpoint, message)

## Check if currently syncing
func is_syncing() -> bool:
	return _is_syncing

## Get current error count
func get_error_count() -> int:
	return _sync_error_count

## Reset error count
func reset_error_count() -> void:
	_sync_error_count = 0

## Check if can retry
func can_retry() -> bool:
	return _sync_error_count < MAX_RETRY_COUNT

## Cleanup signals on exit
func _exit_tree() -> void:
	if DataManager:
		if DataManager.has_signal("sync_progress"):
			DataManager.sync_progress.disconnect(_on_sync_progress)
		if DataManager.has_signal("sync_finished"):
			DataManager.sync_finished.disconnect(_on_sync_finished)
	
	_is_syncing = false

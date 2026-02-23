class_name ProgressManager
extends Node

## RESPONSIBILITY: Progress bar and loading status
## SINGLE RESPONSIBILITY: Only handles progress display updates
## Godot 4.5 Compatible

signal progress_updated(current: int, total: int)
signal status_changed(new_status: String)

# Node references - will be set by LoadingScreen
var loading_bar: Control = null
var status_label: Label = null
var tip_label: Label = null

# Progress tracking
var _current_progress: float = 0.0

func _ready() -> void:
	_set_status("SUMMONING THE REALM...")

## Set the status text and emit signal
func _set_status(text: String) -> void:
	if status_label:
		status_label.text = text
	status_changed.emit(text)

## Update progress bar value
func update_progress(percent: float) -> void:
	_current_progress = percent
	if loading_bar and loading_bar.has_method("update_progress"):
		loading_bar.update_progress(percent)

## Update sync progress with current/total values
func update_sync_progress(current: int, total: int) -> void:
	var percent: float = 0.0
	if total > 0:
		percent = (float(current) / float(total)) * 100.0
	
	update_progress(percent)
	
	var status: String = "Updating Assets: %d / %d" % [current, total]
	_set_status(status)
	
	progress_updated.emit(current, total)

## Mark loading as complete
func set_loading_complete() -> void:
	update_progress(100.0)
	_set_status("The Realm is Ready. Welcome, Traveler.")

## Set status to checking updates
func set_checking_updates() -> void:
	_set_status("Checking for updates...")

## Set status to preparing
func set_preparing() -> void:
	_set_status("Preparing the realm...")

## Set error status
func set_error(message: String) -> void:
	_set_status("Error: " + message)

## Get current progress value
func get_progress() -> float:
	return _current_progress

## Reset progress to zero
func reset_progress() -> void:
	_current_progress = 0.0
	update_progress(0.0)

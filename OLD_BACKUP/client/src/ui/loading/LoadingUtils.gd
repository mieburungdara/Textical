class_name LoadingUtils
extends Node

## RESPONSIBILITY: Shared utility functions for Loading and Login systems
## SINGLE RESPONSIBILITY: Provides common logic to avoid redundancy

const SCENE_TRANSITION_TIMEOUT: float = 5.0

const RUNES: Array[String] = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛟ", "ᛞ"]

## Race between a signal and a timer timeout
static func race_signal_or_timer(tree: SceneTree, sig: Signal, timer: SceneTreeTimer, exit_flag_provider: Callable) -> void:
	var status = {"done": false}
	sig.connect(func(): status.done = true, CONNECT_ONE_SHOT)
	timer.timeout.connect(func(): status.done = true, CONNECT_ONE_SHOT)
	
	while not status.done and not exit_flag_provider.call() and tree:
		await tree.process_frame

## Whitelist for allowed scene transitions
static func validate_scene_path(path: String) -> bool:
	var allowed_paths = [
		"res://src/ui/login/LoginScreen.tscn",
		"res://src/ui/MainMenu.tscn",
		"res://src/ui/map/MapScreen.tscn",
		"res://src/ui/WorldAtlas.tscn",
		"res://src/ui/TownScreen.tscn"
	]
	
	# Add dynamic hub regions from GameState if possible, or keep it strict
	if path in allowed_paths:
		return true
		
	# Fallback check for regions
	if path.contains("/regions/"):
		return true
		
	push_error("Security: Unauthorized scene path attempt: " + path)
	return false

class_name HeroLayoutManager
extends Node

## RESPONSIBILITY: Handles the layout, visibility, and animation of the Hero Profile UI
## SINGLE RESPONSIBILITY: UI Layout and Animation logic

signal overlay_toggled(is_visible: bool)

# Nodes to manage (set by Coordinator)
var margin_container: MarginContainer = null
var profile_overlay: Control = null
var top_hud: Node = null
var side_hud: Node = null
var task_list_hud: Node = null

# Configuration
var animation_duration: float = 0.3
var _is_overlay_visible: bool = false

## Setup the screen as an overlay (padding adjustments)
func setup_as_overlay() -> void:
	if top_hud: top_hud.visible = false
	if side_hud: side_hud.visible = false
	if task_list_hud: task_list_hud.visible = false
	
	var parent = get_parent()
	if parent and parent is Control and parent.get_parent() is TabContainer:
		# Tab mode
		if margin_container:
			margin_container.offset_top = 0
			margin_container.offset_bottom = 0
			margin_container.offset_left = 0
		
		var root = get_parent()
		if root.has_node("Background"):
			root.get_node("Background").visible = false
	else:
		# Standalone overlay mode
		if margin_container:
			margin_container.offset_top = 40
			margin_container.offset_bottom = -40
			margin_container.offset_left = 160 # Space for sidebar

## Toggle the visibility of the profile overlay
func toggle_overlay() -> void:
	if _is_overlay_visible:
		hide_overlay()
	else:
		show_overlay()

## Show the overlay with animation
func show_overlay() -> void:
	if profile_overlay and profile_overlay.has_method("show_overlay"):
		profile_overlay.animation_duration = animation_duration
		profile_overlay.show_overlay()
		_is_overlay_visible = true
		overlay_toggled.emit(true)

## Hide the overlay with animation
func hide_overlay() -> void:
	if profile_overlay and profile_overlay.has_method("hide_overlay"):
		profile_overlay.hide_overlay()
		_is_overlay_visible = false
		overlay_toggled.emit(false)

func is_overlay_visible() -> bool:
	return _is_overlay_visible

func set_overlay_state(is_visible: bool) -> void:
	_is_overlay_visible = is_visible

extends Control

## CodexHub Orchestrator - SRP Refactor
## Coordinates universal knowledge components.

@onready var tab_container = %TabContainer
@onready var close_btn = %CloseBtn

func setup_as_overlay(data: Dictionary = {}):
	# Position container correctly
	if has_node("MarginContainer"):
		$MarginContainer.offset_left = 160 # SideHUD width
		$MarginContainer.offset_right = 0
		$MarginContainer.offset_top = 0
		$MarginContainer.offset_bottom = 0
	
	# Recursively setup children
	for child in tab_container.get_children():
		if child.has_method("setup_as_overlay"):
			child.setup_as_overlay(data)
	
	if data.has("tab_index"):
		tab_container.current_tab = data.tab_index

func _ready():
	close_btn.pressed.connect(func(): UIManager.close_overlay("CodexHub"))
	tab_container.tab_changed.connect(_on_tab_changed)
	
	# Trigger refresh for initial tab
	_on_tab_changed(tab_container.current_tab)

func _on_tab_changed(tab_idx: int):
	var current_tab = tab_container.get_child(tab_idx)
	if current_tab.has_method("refresh"):
		current_tab.refresh()

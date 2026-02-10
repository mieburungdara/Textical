extends Control

## CharacterHub - Unified Hub for Character-related screens
## Manages Hero List, Party/Formation, and Achievements as tabs.

@onready var tab_container = %TabContainer
@onready var close_btn = %CloseBtn

func setup_as_overlay(data: Dictionary = {}):
    # Position container correctly to clear sidebar
    if has_node("MarginContainer"):
        $MarginContainer.offset_left = 160 # Matches SideHUD width
        $MarginContainer.offset_right = 0
        $MarginContainer.offset_top = 0
        $MarginContainer.offset_bottom = 0
    
    # Recursively setup children that are designed as overlays
    for child in tab_container.get_children():
        if child.has_method("setup_as_overlay"):
            child.setup_as_overlay(data)
    
    # Handle initial tab selection if provided
    if data.has("tab_index"):
        tab_container.current_tab = data.tab_index

func _ready():
    close_btn.pressed.connect(func(): UIManager.close_overlay("CharacterHub"))
    
    # Optional: Logic to refresh child tabs when they become active
    tab_container.tab_changed.connect(_on_tab_changed)

func _on_tab_changed(tab_idx: int):
    var current_tab = tab_container.get_child(tab_idx)
    if current_tab.has_method("refresh"):
        current_tab.refresh()

extends Control

@onready var nav_hbox = $DockPanel/Margin/NavHBox
@onready var hub_btn = $DockPanel/Margin/NavHBox/Town

const ROUTES = {
    "Inventory": "res://src/ui/InventoryScreen.tscn",
    "Formation": "res://src/ui/FormationScreen.tscn",
    "Hero": "res://src/ui/HeroProfileScreen.tscn",
    "Atlas": "res://src/ui/WorldAtlas.tscn"
}

var _style_active: StyleBoxFlat
var _style_normal: StyleBoxFlat

func _ready():
    # Pre-configure styles
    _style_active = StyleBoxFlat.new()
    _style_active.bg_color = Color(1, 0.8, 0.4, 0.08)
    _style_active.border_width_bottom = 3
    _style_active.border_color = Color(1, 0.8, 0.2, 1)
    _style_active.corner_radius_top_left = 8
    _style_active.corner_radius_top_right = 8

    _style_normal = StyleBoxFlat.new()
    _style_normal.bg_color = Color(0, 0, 0, 0)
    _style_normal.border_width_bottom = 2
    _style_normal.border_color = Color(0, 0, 0, 0)
    _style_normal.corner_radius_top_left = 8
    _style_normal.corner_radius_top_right = 8

    # Connect fixed routes
    for btn_name in ROUTES.keys():
        var btn = nav_hbox.get_node(btn_name)
        if btn:
            btn.pressed.connect(_on_nav_pressed.bind(ROUTES[btn_name]))
    
    # Connect dynamic HUB button
    hub_btn.pressed.connect(_on_hub_pressed)

    # LISTEN FOR STATE CHANGES
    GameState.region_changed.connect(func(_d): _update_ui())
    ServerConnector.task_completed.connect(func(_d): _update_ui())
    
    # Delay initial update slightly to ensure scene tree is ready
    if is_inside_tree():
        _update_ui()
    else:
        await ready
        _update_ui()

func _on_nav_pressed(path: String):
    if get_tree().current_scene.scene_file_path == path: return
    get_tree().change_scene_to_file(path)

func _on_hub_pressed():
	var path = "res://src/ui/TownScreen.tscn"
	if GameState.current_region_data:
		path = GameState.get_region_scene(GameState.current_region_data.get("type", "TOWN"))
	
	if get_tree().current_scene.scene_file_path == path: return
	get_tree().change_scene_to_file(path)

func _update_ui():
    var current_path = get_tree().current_scene.scene_file_path
    
    # Update HUB Button Label with Emoji
    if GameState.current_region_data and GameState.current_region_data.get("type") != "TOWN":
        hub_btn.text = "🌲\nField"
    else:
        hub_btn.text = "🏰\nTown"
        
    # Highlight active
    var all_btns = {"Town": hub_btn}
    for k in ROUTES.keys(): all_btns[k] = nav_hbox.get_node(k)
    
    for b_name in all_btns:
        var btn = all_btns[b_name]
        var target_path = ROUTES.get(b_name, "")
        var is_active = false
        
        if b_name == "Town": # Special case for hub
            is_active = current_path.contains("TownScreen") or current_path.contains("WildernessScreen")
        else:
            is_active = (current_path == target_path)
            
        if is_active:
            # Active: Gold Color + Active Style
            btn.add_theme_color_override("font_color", Color(1, 0.8, 0.2, 1))
            btn.add_theme_stylebox_override("normal", _style_active)
        else:
            # Inactive: Muted Blue-Grey + Transparent Style
            btn.add_theme_color_override("font_color", Color(0.6, 0.6, 0.7, 1))
            btn.remove_theme_stylebox_override("normal") # Revert to default or normal style

extends Control
class_name AtlasBase

@onready var pins_layer = $MapLayer/Pins
@onready var landmarks_layer = $MapLayer/Landmarks
@onready var player_marker = $MapLayer/PlayerMarker
@onready var cam = $Camera2D

func _spawn_map_elements():
    for child in landmarks_layer.get_children(): child.queue_free()
    for lm in GameState.FLAVOR_LANDMARKS:
        var l = Label.new()
        l.text = lm.name
        l.position = lm.pos
        l.add_theme_color_override("font_color", Color(0.4, 0.3, 0.2))
        l.add_theme_font_size_override("font_size", 32)
        l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        landmarks_layer.add_child(l)
    ServerConnector.fetch_all_regions()

func _update_player_position(is_traveling: bool = false):
    if !GameState.current_user: return
    var rid_raw = GameState.current_user.get("currentRegion", 1)
    if is_traveling and GameState.active_task:
        rid_raw = GameState.active_task.get("originRegionId", rid_raw)
    
    var rid = int(str(rid_raw).to_float())
    player_marker.position = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))
    player_marker.show()

func _center_on_player():
    if GameState.current_user:
        var rid = int(str(GameState.current_user.get("currentRegion", 1)).to_float())
        cam.global_position = GameState.REGION_POSITIONS.get(rid, Vector2(2500, 2500))

func _populate_pins(regions, click_callback: Callable):
    for child in pins_layer.get_children(): child.queue_free()
    for r in regions:
        var btn = Button.new()
        btn.text = r.name
        btn.position = GameState.REGION_POSITIONS.get(int(r.id), Vector2(0,0)) - Vector2(100, 30)
        btn.custom_minimum_size = Vector2(200, 60)
        btn.pressed.connect(click_callback.bind(r))
        pins_layer.add_child(btn)

extends Camera2D

var min_zoom = 0.1
var max_zoom = 3.0
var zoom_speed = 0.1
var target_zoom = 0.5 
var is_dragging = false

func _process(_delta):
    zoom = zoom.lerp(Vector2(target_zoom, target_zoom), 0.1)

func _unhandled_input(event):
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_LEFT: is_dragging = event.pressed
        if event.button_index == MOUSE_BUTTON_WHEEL_UP: target_zoom = clamp(target_zoom + zoom_speed, min_zoom, max_zoom)
        if event.button_index == MOUSE_BUTTON_WHEEL_DOWN: target_zoom = clamp(target_zoom - zoom_speed, min_zoom, max_zoom)
    if event is InputEventMouseMotion and is_dragging:
        global_position -= event.relative / zoom

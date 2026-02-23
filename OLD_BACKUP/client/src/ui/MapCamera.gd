extends Control

## MapCamera - Controller for Map Panning and Zooming
## Manages manual transformation with full-screen coverage.

@export var target_node: Node2D
@export var map_size = Vector2(5000, 5000)
@export var sidebar_width = 160.0
@export var min_zoom = 0.25 
@export var max_zoom = 2.5
@export var zoom_speed = 0.1

var current_zoom = 0.5
var target_zoom = 0.5 
var is_dragging = false

func _ready():
    if not target_node:
        target_node = get_parent().get_node_or_null("MapLayer")
    
    # Calculate min zoom based on FULL width to ensure no black bars
    var view_size = get_viewport_rect().size
    min_zoom = max(view_size.x / map_size.x, view_size.y / map_size.y)
    target_zoom = max(target_zoom, min_zoom)
    current_zoom = target_zoom
    
    if target_node:
        target_node.scale = Vector2(current_zoom, current_zoom)
        _clamp_position()

func _process(_delta):
    if not target_node: return
    
    if abs(current_zoom - target_zoom) > 0.001:
        var old_zoom = current_zoom
        current_zoom = lerp(current_zoom, target_zoom, 0.15)
        
        # Center of the VISIBLE area (excluding sidebar)
        var view_size = get_viewport_rect().size
        var center = Vector2(sidebar_width + (view_size.x - sidebar_width)/2, view_size.y/2)
        
        var rel_pos = (target_node.position - center) * (current_zoom / old_zoom)
        target_node.position = center + rel_pos
        target_node.scale = Vector2(current_zoom, current_zoom)
        
    _clamp_position()

func _unhandled_input(event):
    if not is_visible_in_tree(): return
    
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_LEFT:
            is_dragging = event.pressed
        
        if event.button_index == MOUSE_BUTTON_WHEEL_UP:
            target_zoom = clamp(target_zoom + zoom_speed, min_zoom, max_zoom)
            
        if event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
            target_zoom = clamp(target_zoom - zoom_speed, min_zoom, max_zoom)
            
    if event is InputEventMouseMotion and is_dragging:
        if target_node:
            target_node.position += event.relative
            _clamp_position()

func _clamp_position():
    if not target_node: return
    
    var view_size = get_viewport_rect().size
    var mw = map_size.x * current_zoom
    var mh = map_size.y * current_zoom
    
    # Left edge can go to 0 (start of screen)
    # Right edge must be at least at view_size.x
    target_node.position.x = clamp(target_node.position.x, view_size.x - mw, 0)
    target_node.position.y = clamp(target_node.position.y, view_size.y - mh, 0)

func center_on(pos: Vector2):
    if not target_node: return
    
    var view_size = get_viewport_rect().size
    # Center player in the visible area to the right of sidebar
    var center = Vector2(sidebar_width + (view_size.x - sidebar_width)/2, view_size.y/2)
    
    target_node.position = center - (pos * current_zoom)
    _clamp_position()

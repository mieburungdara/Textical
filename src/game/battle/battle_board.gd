class_name BattleBoard
extends Node2D

## Handles the visual representation of the grid and units.

@export var unit_view_scene: PackedScene
@export var grid_width: int = 8
@export var grid_height: int = 8
@export var cell_size: int = 64

@export_group("Visuals")
@export var color_primary: Color = Color(0.2, 0.2, 0.2, 0.5)
@export var color_secondary: Color = Color(0.3, 0.3, 0.3, 0.5)
@export var color_border: Color = Color(0, 0, 0, 0.3)

var active_unit_views: Dictionary = {}

func _draw():
    for x in range(grid_width):
        for y in range(grid_height):
            var rect = Rect2(x * cell_size, y * cell_size, cell_size, cell_size)
            var color = color_primary
            if (x + y) % 2 == 1:
                color = color_secondary
            draw_rect(rect, color, true)
            draw_rect(rect, color_border, false, 1.0)

func grid_to_pixel(grid_pos: Vector2i) -> Vector2:
    var padding = 4.0
    return Vector2(grid_pos.x * cell_size + padding, grid_pos.y * cell_size + padding)

func spawn_unit_view(data: UnitData, team: int, pos: Vector2i) -> UnitView:
    var view = unit_view_scene.instantiate() as UnitView
    add_child(view)
    view.grid_size = Vector2(cell_size, cell_size)
    view.setup(data, team)
    view.position = grid_to_pixel(pos)
    active_unit_views[data.id] = view
    return view

func get_view(unit_id: String) -> UnitView:
    var view = active_unit_views.get(unit_id)
    if is_instance_valid(view):
        return view
    elif view != null:
        active_unit_views.erase(unit_id)
    return null

class_name BattleBoard
extends Node2D

## Handles the visual grid and terrain representation.

@export var unit_view_scene: PackedScene
@export var grid_width: int = 8
@export var grid_height: int = 10
@export var cell_size: int = 64

# Terrain Colors
const TERRAIN_COLORS = {
    0: Color(0.2, 0.4, 0.2), # Grass (Dark Green)
    1: Color(0.3, 0.2, 0.1), # Mud (Brown)
    2: Color(0.8, 0.9, 1.0), # Snow (White/Blue)
    3: Color(0.8, 0.2, 0.0), # Lava (Red/Orange)
    4: Color(0.0, 0.3, 0.6), # Water (Blue)
    5: Color(0.1, 0.3, 0.1), # Forest (Deep Green)
    6: Color(0.3, 0.3, 0.3), # Wall (Gray)
    7: Color(0.2, 0.3, 0.2), # Swamp (Dark Purple/Green)
    8: Color(0.5, 0.4, 0.3)  # Ruins (Stone)
}

var current_terrain_data: Array = []

func _draw():
    # 1. Draw Terrain Tiles
    if current_terrain_data.is_empty():
        _draw_default_grid()
    else:
        _draw_custom_terrain()

func _draw_default_grid():
    for y in range(grid_height):
        for x in range(grid_width):
            var rect = Rect2(x * cell_size, y * cell_size, cell_size, cell_size)
            var color = Color(0.1, 0.1, 0.1) if (x + y) % 2 == 0 else Color(0.12, 0.12, 0.12)
            draw_rect(rect, color)
            draw_rect(rect, Color(1, 1, 1, 0.05), false)

func _draw_custom_terrain():
    for y in range(grid_height):
        for x in range(grid_width):
            var type = current_terrain_data[y][x]
            var rect = Rect2(x * cell_size, y * cell_size, cell_size, cell_size)
            draw_rect(rect, TERRAIN_COLORS.get(type, Color.BLACK))
            draw_rect(rect, Color(1, 1, 1, 0.1), false)

func setup_terrain(data: Array):
    current_terrain_data = data
    queue_redraw()

func spawn_unit_view(data: UnitData, team_id: int, grid_pos: Vector2i) -> UnitView:
    var view = unit_view_scene.instantiate() as UnitView
    add_child(view)
    view.grid_size = Vector2(cell_size, cell_size)
    view.setup(data, team_id)
    view.position = grid_to_pixel(grid_pos) + Vector2(4, 4)
    return view

func grid_to_pixel(grid_pos: Vector2i) -> Vector2:
    return Vector2(grid_pos.x * cell_size, grid_pos.y * cell_size)

func get_view(p_unit_id: String) -> UnitView:
    for child in get_children():
        if child is UnitView and child.unit_id == p_unit_id:
            return child
    return null

extends Node2D
class_name GridVisual

@export var grid_width: int = 20
@export var grid_height: int = 20
@export var cell_size: int = 64

@export var grid_color: Color = Color(0.3, 0.3, 0.3, 0.5)
@export var background_color: Color = Color(0.1, 0.1, 0.15, 1.0)
@export var player_zone_color: Color = Color(0.2, 0.5, 0.2, 0.2)
@export var enemy_zone_color: Color = Color(0.5, 0.2, 0.2, 0.2)

@export var show_grid_lines: bool = true
@export var show_zone_colors: bool = true

var _highlighted_cells: Dictionary = {}

func _ready() -> void:
    pass

func setup(width: int, height: int, cell_sz: int = 64) -> void:
    grid_width = width
    grid_height = height
    cell_size = cell_sz
    queue_redraw()

func _draw() -> void:
    # Background
    draw_rect(Rect2(Vector2.ZERO, Vector2(grid_width * cell_size, grid_height * cell_size)), background_color)
    
    # Spawn zones
    if show_zone_colors:
        draw_rect(Rect2(0, 0, grid_width * cell_size, 2 * cell_size), player_zone_color)
        draw_rect(Rect2(0, (grid_height - 2) * cell_size, grid_width * cell_size, 2 * cell_size), enemy_zone_color)
    
    # Grid lines
    if show_grid_lines:
        for x in range(grid_width + 1):
            draw_line(Vector2(x * cell_size, 0), Vector2(x * cell_size, grid_height * cell_size), grid_color, 1.0)
        for y in range(grid_height + 1):
            draw_line(Vector2(0, y * cell_size), Vector2(grid_width * cell_size, y * cell_size), grid_color, 1.0)
    
    # Highlights
    for pos in _highlighted_cells:
        var color = _highlighted_cells[pos]
        draw_rect(Rect2(pos.x * cell_size + 2, pos.y * cell_size + 2, cell_size - 4, cell_size - 4), color)

func highlight_cell(x: int, y: int, color: Color) -> void:
    _highlighted_cells[Vector2i(x, y)] = color
    queue_redraw()

func highlight_cells(cells: Array, color: Color) -> void:
    for cell in cells:
        if cell is Vector2i:
            _highlighted_cells[cell] = color
        elif cell is Dictionary:
            _highlighted_cells[Vector2i(cell.x, cell.y)] = color
    queue_redraw()

func clear_highlight(x: int, y: int) -> void:
    _highlighted_cells.erase(Vector2i(x, y))
    queue_redraw()

func clear_all_highlights() -> void:
    _highlighted_cells.clear()
    queue_redraw()

func get_cell_center(x: int, y: int) -> Vector2:
    return Vector2(x * cell_size + cell_size / 2.0, y * cell_size + cell_size / 2.0)

func get_cell_position(x: int, y: int) -> Vector2:
    return Vector2(x * cell_size, y * cell_size)

func get_grid_size() -> Vector2i:
    return Vector2i(grid_width, grid_height)

func is_valid_cell(x: int, y: int) -> bool:
    return x >= 0 and x < grid_width and y >= 0 and y < grid_height

func world_to_grid(world_pos: Vector2) -> Vector2i:
    return Vector2i(int(world_pos.x / cell_size), int(world_pos.y / cell_size))

func grid_to_world(grid_pos: Vector2i) -> Vector2:
    return Vector2(grid_pos.x * cell_size, grid_pos.y * cell_size)

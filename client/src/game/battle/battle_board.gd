class_name BattleBoard
extends Node2D

## Handles the visual grid and unit placement on the board.

@export var unit_view_scene: PackedScene
@export var grid_width: int = 8
@export var grid_height: int = 10
@export var cell_size: int = 64

func spawn_unit_view(data: UnitData, team_id: int, grid_pos: Vector2i) -> UnitView:
	var view = unit_view_scene.instantiate() as UnitView
	add_child(view)
	view.grid_size = Vector2(cell_size, cell_size)
	view.setup(data, team_id)
	view.position = grid_to_pixel(grid_pos) + Vector2(4, 4)
	return view

func grid_to_pixel(grid_pos: Vector2i) -> Vector2:
	return Vector2(grid_pos.x * cell_size, grid_pos.y * cell_size)

## CRITICAL FIX: Find by UNIQUE instance ID
func get_view(p_unit_id: String) -> UnitView:
	for child in get_children():
		if child is UnitView and child.unit_id == p_unit_id:
			return child
	return null
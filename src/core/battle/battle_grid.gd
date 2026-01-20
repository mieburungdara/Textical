class_name BattleGrid
extends RefCounted

## Manages the board, unit positions, and pathfinding using AStarGrid2D.

var width: int
var height: int
var astar: AStarGrid2D
var unit_positions: Dictionary = {} # Key: Vector2i, Value: Object (BattleUnit)

func _init(w: int, h: int):
	width = w
	height = h
	_setup_astar()

func _setup_astar():
	astar = AStarGrid2D.new()
	astar.region = Rect2i(0, 0, width, height)
	astar.cell_size = Vector2(1, 1)
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ALWAYS
	astar.default_compute_heuristic = AStarGrid2D.HEURISTIC_CHEBYSHEV
	astar.default_estimate_heuristic = AStarGrid2D.HEURISTIC_CHEBYSHEV
	astar.update()

func place_unit(unit: Object, pos: Vector2i) -> bool:
	if not is_valid_pos(pos):
		return false
	if is_occupied(pos):
		return false
	
	unit_positions[pos] = unit
	unit.grid_pos = pos
	astar.set_point_solid(pos, true)
	return true

func move_unit(unit: Object, new_pos: Vector2i):
	var old_pos = unit.grid_pos
	if not is_valid_pos(new_pos): return
	if is_occupied(new_pos): return
	
	unit_positions.erase(old_pos)
	unit_positions[new_pos] = unit
	unit.grid_pos = new_pos
	
	astar.set_point_solid(old_pos, false)
	astar.set_point_solid(new_pos, true)

func remove_unit(unit: Object):
	if unit_positions.has(unit.grid_pos):
		astar.set_point_solid(unit.grid_pos, false)
		unit_positions.erase(unit.grid_pos)

func is_occupied(pos: Vector2i) -> bool:
	return unit_positions.has(pos)

func is_valid_pos(pos: Vector2i) -> bool:
	return astar.region.has_point(pos)

func get_unit_at(pos: Vector2i) -> Object:
	return unit_positions.get(pos)

func get_next_step_towards(start: Vector2i, target: Vector2i) -> Vector2i:
	var target_was_solid = astar.is_point_solid(target)
	if target_was_solid:
		astar.set_point_solid(target, false)
	
	var path = astar.get_id_path(start, target)
	
	if target_was_solid:
		astar.set_point_solid(target, true)
	
	if path.size() > 1:
		var next_step = path[1]
		if is_occupied(next_step) and next_step != target:
			return start
		return next_step
	return start

func get_distance(a: Vector2i, b: Vector2i) -> int:
	var dx = abs(a.x - b.x)
	var dy = abs(a.y - b.y)
	return max(dx, dy)

func get_tiles_in_pattern(center: Vector2i, pattern: int, size: int) -> Array[Vector2i]:
	var tiles: Array[Vector2i] = []
	if pattern == 0: # SINGLE
		tiles.append(center)
	elif pattern == 1: # CROSS
		tiles.append(center)
		for i in range(1, size + 1):
			tiles.append(center + Vector2i(i, 0))
			tiles.append(center + Vector2i(-i, 0))
			tiles.append(center + Vector2i(0, i))
			tiles.append(center + Vector2i(0, -i))
	elif pattern == 2: # SQUARE
		for x in range(-size, size + 1):
			for y in range(-size, size + 1):
				tiles.append(center + Vector2i(x, y))
	
	var valid_tiles: Array[Vector2i] = []
	for t in tiles:
		if is_valid_pos(t):
			valid_tiles.append(t)
	return valid_tiles
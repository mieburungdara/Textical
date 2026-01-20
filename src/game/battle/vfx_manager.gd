class_name VFXManager
extends Node2D

## Component responsible for spawning visual effects and projectiles.

var board: Node2D # Reference to BattleBoard for coordinates

func setup(p_board: Node2D):
	board = p_board

func spawn_projectile(scene: PackedScene, start: Vector2, target: Vector2, duration: float = 0.3, color: Color = Color.WHITE):
	var p = scene.instantiate()
	add_child(p)
	await p.launch(start, target, duration, color)

func spawn_vfx(path: String, grid_pos: Vector2i, color: Color = Color.WHITE):
	if path == "": return
	var scene = load(path)
	if scene:
		var vfx = scene.instantiate()
		add_child(vfx)
		if vfx is Node2D:
			vfx.z_index = 100
			vfx.position = board.grid_to_pixel(grid_pos) + Vector2(board.cell_size/2, board.cell_size/2)
			vfx.modulate = color
		
		if vfx is CPUParticles2D:
			vfx.emitting = true
			if vfx.has_method("restart"): vfx.restart()

func spawn_damage_text(value: int, grid_pos: Vector2i, color: Color = Color.WHITE):
	var scene = load("res://src/game/ui/DamageText.tscn")
	if not scene: return
	
	var text_node = scene.instantiate()
	add_child(text_node)
	
	# Position at top of cell
	var target_pixel = board.grid_to_pixel(grid_pos) + Vector2(board.cell_size/2 - 20, -10)
	text_node.position = target_pixel
	text_node.setup(str(value), color)
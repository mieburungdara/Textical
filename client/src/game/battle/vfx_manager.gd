class_name VFXManager
extends Node2D

## Component responsible for spawning visual effects and projectiles.
## Maps short names from server to local resource paths.

var board: Node2D

# Map short names to actual TSCN paths
const VFX_MAP = {
	"burn": "res://assets/vfx/FireEffect.tscn",
	"smoke": "res://assets/vfx/SmokeEffect.tscn",
	"heal": "res://assets/vfx/SmokeEffect.tscn" # Fallback
}

func setup(p_board: Node2D):
	board = p_board

func spawn_projectile(scene: PackedScene, start: Vector2, target: Vector2, duration: float = 0.3, color: Color = Color.WHITE):
	var p = scene.instantiate()
	add_child(p)
	await p.launch(start, target, duration, color)

func spawn_vfx(path_or_key: String, grid_pos: Vector2i, color: Color = Color.WHITE):
	if path_or_key == "": return
	
	# Check if it's a key first, otherwise assume full path
	var actual_path = VFX_MAP.get(path_or_key, path_or_key)
	
	var scene = load(actual_path)
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
	var target_pixel = board.grid_to_pixel(grid_pos) + Vector2(board.cell_size/2 - 20, -10)
	text_node.position = target_pixel
	text_node.setup(str(value), color)

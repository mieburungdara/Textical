class_name BaseCombatHandler
extends BaseLogHandler

## Shared logic for combat-related handlers in authoritative mode.
## Now supports critical hit coloring.

func apply_visual_impact(target_id: String, damage: int, hp_left: float, color: Color = Color.WHITE, is_crit: bool = false):
	var t_view = board.get_view(target_id)
	if t_view and is_instance_valid(t_view):
		t_view.play_hit_anim()
		
		# 1. Determine Damage Color
		var final_color = color
		if is_crit:
			final_color = Color.GOLD # Bright gold for criticals
		
		# 2. Show Damage Text
		var grid_pos = Vector2i(t_view.position / board.cell_size)
		vfx.spawn_damage_text(damage, grid_pos, final_color)
		
		# 3. Update HP
		var max_hp = 100.0
		if controller.has_method("get_max_hp"):
			max_hp = controller.get_max_hp(target_id)
			
		t_view.update_hp(hp_left, max_hp)

func get_projectile_start(actor_view: Control) -> Vector2:
	return actor_view.position + Vector2(board.cell_size/2, board.cell_size/2)

func get_projectile_target_pixel(target_grid: Vector2i) -> Vector2:
	return board.grid_to_pixel(target_grid) + Vector2(board.cell_size/2, board.cell_size/2)

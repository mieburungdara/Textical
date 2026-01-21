class_name BaseCombatHandler
extends BaseLogHandler

## Shared logic for combat-related handlers.

func apply_visual_impact(target_id: String, damage: int, hp_left: float, color: Color = Color.WHITE):
	var t_view = board.get_view(target_id)
	if t_view and is_instance_valid(t_view):
		t_view.play_hit_anim()
		
		# Show Damage Text
		var grid_pos = Vector2i(t_view.position / board.cell_size)
		vfx.spawn_damage_text(damage, grid_pos, color)
		
		# Update HP
		var sim_unit = controller.find_unit_in_sim(target_id)
		if sim_unit:
			t_view.update_hp(hp_left, sim_unit.stats.health_max.get_value())

func get_projectile_start(actor_view: Control) -> Vector2:
	return actor_view.position + Vector2(board.cell_size/2, board.cell_size/2)

func get_projectile_target_pixel(target_grid: Vector2i) -> Vector2:
	return board.grid_to_pixel(target_grid) + Vector2(board.cell_size/2, board.cell_size/2)

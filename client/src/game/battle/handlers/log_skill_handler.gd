class_name LogSkillHandler
extends BaseCombatHandler

func handle(entry: BattleLogEntry) -> void:
	if entry.type != BattleLogEntry.Type.CAST_SKILL: return
	
	var actor_id = entry.actor_id
	var target_grid = entry.data["target_pos"]
	var skill_name = entry.data["skill_name"]
	var result = entry.data["result"]
	
	var actor_view = board.get_view(actor_id)
	var actor_data = controller.get_unit_data(actor_id) # FIXED: Use registry
	
	if actor_view and actor_data:
		var skill_obj: SkillData = null
		for sk in actor_data.skills:
			if sk and sk.name == skill_name:
				skill_obj = sk
				break
		
		var skill_color = Color.WHITE
		if skill_obj:
			skill_color = skill_obj.get_element_color()
			if skill_obj.projectile_scene:
				await vfx.spawn_projectile(skill_obj.projectile_scene, get_projectile_start(actor_view), get_projectile_target_pixel(target_grid), 0.3, skill_color)
		
		# Re-validate
		actor_view = board.get_view(actor_id)
		if actor_view:
			vfx.spawn_vfx(entry.data.get("vfx_path", ""), target_grid, skill_color)
			await actor_view.play_attack_anim(target_grid)
	
	# Handle AoE Impacts using Snapshots
	if result.has("hit_ids"):
		var individual_hits = result.get("individual_hits", {})
		for hit_id in result["hit_ids"]:
			var damage_val = individual_hits.get(hit_id, result.get("damage_total", 0))
			if entry.unit_states.has(hit_id):
				var hp_snapshot = entry.unit_states[hit_id]["hp"]
				apply_visual_impact(hit_id, damage_val, hp_snapshot, Color.YELLOW)

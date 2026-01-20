class_name LogCombatHandler
extends BaseLogHandler

@export var default_arrow_scene: PackedScene
@export var default_magic_scene: PackedScene

func handle(entry: BattleLogEntry) -> void:
	match entry.type:
		BattleLogEntry.Type.CAST_SKILL:
			await _handle_skill(entry)
		BattleLogEntry.Type.ATTACK:
			await _handle_attack(entry)

func _handle_skill(entry: BattleLogEntry):
	var actor_id = entry.data["actor_id"]
	var target_grid = entry.data["target_pos"]
	var skill_name = entry.data["skill_name"]
	var result = entry.data["result"]
	
	var actor_view = board.get_view(actor_id)
	var sim_unit = controller.find_unit_in_sim(actor_id)
	
	if actor_view and sim_unit:
		var skill_obj: SkillData = null
		for sk in sim_unit.data.skills:
			if sk and sk.name == skill_name:
				skill_obj = sk
				break
		
		var skill_color = Color.WHITE
		if skill_obj:
			skill_color = skill_obj.get_element_color()
			if skill_obj.projectile_scene:
				var target_pixel = board.grid_to_pixel(target_grid) + Vector2(board.cell_size/2, board.cell_size/2)
				await vfx.spawn_projectile(skill_obj.projectile_scene, actor_view.position + Vector2(board.cell_size/2, board.cell_size/2), target_pixel, 0.3, skill_color)
		
		vfx.spawn_vfx(entry.data.get("vfx_path", ""), target_grid, skill_color)
		await actor_view.play_attack_anim(target_grid)
	
	_update_aoe_health(result)

func _handle_attack(entry: BattleLogEntry):
	var attacker_id = entry.data["actor_id"]
	var target_id = entry.data["target_id"]
	var a_view = board.get_view(attacker_id)
	var t_view = board.get_view(target_id)
	var sim_unit = controller.find_unit_in_sim(attacker_id)
	
	if a_view and t_view and sim_unit:
		var dist = (a_view.position - t_view.position).length()
		if dist > board.cell_size * 1.5:
			var proj_scene = sim_unit.data.default_projectile_scene
			var proj_color = Color.WHITE
			if proj_scene == null: proj_scene = default_arrow_scene
			
			if sim_unit.data is HeroData and sim_unit.data.hero_class == HeroData.HeroClass.MAGE:
				proj_color = Color.CYAN
				if proj_scene == default_arrow_scene: proj_scene = default_magic_scene
			
			if proj_scene:
				await vfx.spawn_projectile(proj_scene, a_view.position + Vector2(board.cell_size/2, board.cell_size/2), t_view.position + Vector2(board.cell_size/2, board.cell_size/2), 0.3, proj_color)
		
		await a_view.play_attack_anim(Vector2i(t_view.position / board.cell_size))
		t_view.play_hit_anim()
		
		var damage = entry.data.get("damage", 0)
		var grid_pos = Vector2i(t_view.position / board.cell_size)
		vfx.spawn_damage_text(damage, grid_pos, Color.WHITE)
		
		var victim_sim = controller.find_unit_in_sim(target_id)
		if victim_sim:
			t_view.update_hp(entry.data["target_hp_left"], victim_sim.stats.health_max.get_value())

func _update_aoe_health(result: Dictionary):
	if result.has("hit_ids"):
		var individual_hits = result.get("individual_hits", {})
		for hit_id in result["hit_ids"]:
			var v = board.get_view(hit_id)
			var sim = controller.find_unit_in_sim(hit_id)
			if v and sim:
				v.play_hit_anim()
				v.update_hp(sim.stats.current_health, sim.stats.health_max.get_value())
				var damage_val = individual_hits.get(hit_id, result.get("damage_total", 0))
				var grid_pos = Vector2i(v.position / board.cell_size)
				vfx.spawn_damage_text(damage_val, grid_pos, Color.YELLOW)

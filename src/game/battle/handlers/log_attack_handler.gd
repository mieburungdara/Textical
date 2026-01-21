class_name LogAttackHandler
extends BaseCombatHandler

@export var default_arrow_scene: PackedScene
@export var default_magic_scene: PackedScene

func handle(entry: BattleLogEntry) -> void:
	if entry.type != BattleLogEntry.Type.ATTACK: return
	
	var attacker_id = entry.data["actor_id"]
	var target_id = entry.data["target_id"]
	var a_view = board.get_view(attacker_id)
	var t_view = board.get_view(target_id)
	var sim_unit = controller.find_unit_in_sim(attacker_id)
	
	if a_view and t_view and sim_unit:
		# 1. Ranged Projectile Sequence
		var dist = (a_view.position - t_view.position).length()
		if dist > board.cell_size * 1.5:
			var proj_scene = sim_unit.data.default_projectile_scene
			var proj_color = Color.WHITE
			if proj_scene == null: proj_scene = default_arrow_scene
			
			if sim_unit.data is HeroData and sim_unit.data.hero_class == HeroData.HeroClass.MAGE:
				proj_color = Color.CYAN
				if proj_scene == default_arrow_scene: proj_scene = default_magic_scene
			
			if proj_scene:
				await vfx.spawn_projectile(proj_scene, get_projectile_start(a_view), get_projectile_start(t_view), 0.3, proj_color)
		
		# Re-validate after projectile await
		a_view = board.get_view(attacker_id)
		t_view = board.get_view(target_id)
		
		if a_view and t_view:
			# 2. Perform Attack Animation
			await a_view.play_attack_anim(Vector2i(t_view.position / board.cell_size))
			
			# 3. Apply Impact using accurate Snapshot HP
			if entry.unit_states.has(target_id):
				var hp_snapshot = entry.unit_states[target_id]["hp"]
				apply_visual_impact(target_id, entry.data["damage"], hp_snapshot)
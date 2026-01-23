class_name LogAttackHandler
extends BaseCombatHandler

@export var default_arrow_scene: PackedScene
@export var default_magic_scene: PackedScene

func handle(entry: BattleLogEntry) -> void:
	if entry.type != BattleLogEntry.Type.ATTACK: return
	
	var attacker_id = entry.actor_id
	var target_id = entry.target_id
	var a_view = board.get_view(attacker_id)
	var t_view = board.get_view(target_id)
	var actor_data = controller.get_unit_data(attacker_id)
	
	if a_view and t_view and actor_data:
		# 1. Ranged Projectile
		var dist = (a_view.position - t_view.position).length()
		if dist > board.cell_size * 1.5:
			var proj_scene = actor_data.default_projectile_scene
			var proj_color = Color.WHITE
			if proj_scene == null: proj_scene = default_arrow_scene
			if actor_data is HeroData and actor_data.hero_class == HeroData.HeroClass.MAGE:
				proj_color = Color.CYAN
				if proj_scene == default_arrow_scene: proj_scene = default_magic_scene
			if proj_scene:
				await vfx.spawn_projectile(proj_scene, get_projectile_start(a_view), get_projectile_start(t_view), 0.3, proj_color)
		
		a_view = board.get_view(attacker_id)
		t_view = board.get_view(target_id)
		
		if a_view and t_view:
			await a_view.play_attack_anim(Vector2i(t_view.position / board.cell_size))
			# PASS CRITICAL INFO
			apply_visual_impact(target_id, entry.data["damage"], entry.data["target_hp_left"], Color.WHITE, entry.data.get("is_crit", false))
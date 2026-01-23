class_name UnitView
extends BaseUnitView

@onready var visual: UnitVisualComponent = $VisualComponent
@onready var ui: UnitUIComponent = $UIComponent
@onready var animator: UnitAnimatorComponent = $AnimatorComponent

func setup(data: UnitData, team_id: int):
	# Note: unit_id is now handled by BattleController for Instance uniqueness
	if unit_id == "": 
		unit_id = data.id 
	
	visual.setup(data, team_id)
	ui.setup(data)
	animator.setup(self)
	
	var padding = 4.0
	custom_minimum_size = grid_size - Vector2(padding * 2, padding * 2)
	size = custom_minimum_size

func update_hp(current: float, max_hp: float):
	ui.update_hp(current, max_hp)

func update_mana(current: float, max_mana: float):
	ui.update_mana(current, max_mana)

func update_action_bar(current: float, max_ap: float = 100.0):
	ui.update_action_bar(current, max_ap)

func move_to_grid(grid_pos: Vector2i):
	var padding = 4.0
	var target_pixel = Vector2(grid_pos.x * grid_size.x + padding, grid_pos.y * grid_size.y + padding)
	await animator.move_to(target_pixel)

func play_attack_anim(target_grid: Vector2i):
	var padding = 4.0
	var target_pixel = Vector2(target_grid.x * grid_size.x + padding, target_grid.y * grid_size.y + padding)
	await animator.play_attack(target_pixel)

func play_hit_anim():
	await animator.play_hit()

func play_death_anim():
	await animator.play_death()
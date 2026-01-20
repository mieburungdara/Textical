class_name BaseUnitView
extends Control

## Abstract-ish base for Unit visual representation.

var unit_id: String
var grid_size: Vector2 = Vector2(64, 64)

func setup(_data: UnitData, _team_id: int):
    pass

func update_hp(_current: float, _max_hp: float):
    pass

func update_action_bar(_current: float, _max_ap: float):
    pass

func move_to_grid(_grid_pos: Vector2i):
    pass

func play_attack_anim(_target_grid: Vector2i):
    pass

func play_hit_anim():
    pass

func play_death_anim():
    pass

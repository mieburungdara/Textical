class_name Trait
extends Resource

@export var display_name: String = "Trait Name"
@export_multiline var description: String = "Description of what this trait does."
@export var icon: Texture2D

## Virtual method: Called when the battle simulation starts
func on_battle_start(owner_unit: Object, battle_sim: Object):
    pass

## Virtual method: Called when owner is about to attack (can modify damage)
func on_before_attack(owner_unit: Object, target_unit: Object, damage_info: Dictionary):
    pass

## Virtual method: Called after owner attacks successfully
func on_after_attack(owner_unit: Object, target_unit: Object, damage_info: Dictionary):
    pass

## Virtual method: Called when owner kills a unit
func on_kill(owner_unit: Object, victim_unit: Object):
    pass

## Virtual method: Called when owner takes damage
func on_take_damage(owner_unit: Object, attacker_unit: Object, damage_amount: float):
    pass

## Virtual method: Called on every tick (use carefully for performance)
func on_tick(owner_unit: Object, battle_sim: Object):
    pass

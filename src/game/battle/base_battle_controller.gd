class_name BaseBattleController
extends Node2D

## Base class for battle controllers, providing simulation access and signals.

@warning_ignore("unused_signal")
signal log_message(text: String)

var simulation: BattleSimulation

func find_unit_in_sim(id: String) -> Object:
	if not simulation: return null
	for u in simulation.units:
		if u.data.id == id:
			return u
	return null

## To be implemented by children
func start_battle():
	pass

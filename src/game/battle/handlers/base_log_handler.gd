class_name BaseLogHandler
extends Node

## Abstract base class for log type handlers.

var board: Node2D
var controller: Node
var vfx: Node2D

func setup(p_board: Node2D, p_controller: Node, p_vfx: Node2D):
	board = p_board
	controller = p_controller
	vfx = p_vfx

## Virtual method to be implemented by children
func handle(entry: BattleLogEntry) -> void:
	pass

class_name BasePartyComponent
extends Node

## Abstract base for party management components.

var manager: Control

func setup(p_manager: Control):
	manager = p_manager

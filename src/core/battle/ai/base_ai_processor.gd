class_name BaseAIProcessor
extends RefCounted

## Abstract-ish base for AI processing.

# Using absolute paths to ensure Godot finds the components regardless of class cache issues
var finder: RefCounted
var executor: RefCounted

func _init():
	finder = load("res://src/core/battle/ai/ai_target_finder.gd").new()
	executor = load("res://src/core/battle/ai/ai_executor.gd").new()

func decide_action(_actor: Object, _sim: Object) -> void:
	pass
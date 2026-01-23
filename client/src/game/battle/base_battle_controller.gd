class_name BaseBattleController
extends Node2D

## Base class for battle controllers in authoritative mode.

@warning_ignore("unused_signal")
signal log_message(text: String)

## Authoritative battle doesn't have a local simulation object.
## Registry is handled by the concrete BattleController.
class_name LogStateHandler
extends BaseLogHandler

func handle(entry: BattleLogEntry) -> void:
	match entry.type:
		BattleLogEntry.Type.DEATH:
			var view = board.get_view(entry.data["target_id"])
			if view: await view.play_death_anim()
		BattleLogEntry.Type.GAME_OVER:
			controller.emit_signal("log_message", "[color=yellow]=== " + entry.message + " ===[/color]")

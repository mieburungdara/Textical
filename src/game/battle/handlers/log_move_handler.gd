class_name LogMoveHandler
extends BaseLogHandler

func handle(entry: BattleLogEntry) -> void:
	if entry.type != BattleLogEntry.Type.MOVE: return
	
	var view = board.get_view(entry.data["actor_id"])
	if view: 
		await view.move_to_grid(entry.data["to"])

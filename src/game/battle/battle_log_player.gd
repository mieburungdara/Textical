class_name BattleLogPlayer
extends BaseLogPlayer

## Orchestra class that delegates log processing to specialized sub-components.

@onready var move_handler: LogMoveHandler = $MoveHandler
@onready var attack_handler: LogAttackHandler = $AttackHandler
@onready var skill_handler: LogSkillHandler = $SkillHandler
@onready var state_handler: LogStateHandler = $StateHandler

func setup(p_board: Node2D, p_controller: Node, p_vfx: Node2D):
    super.setup(p_board, p_controller, p_vfx)
    # Setup all components
    for child in get_children():
        if child is BaseLogHandler:
            child.setup(p_board, p_controller, p_vfx)

func process_entry(entry: BattleLogEntry):
    super.process_entry(entry)
    
    # We MUST use 'await' here to ensure that within a SINGLE TICK batch, 
    # the parallel execution still respects its own internal sequences 
    # (like projectile -> explosion).
    match entry.type:
        BattleLogEntry.Type.MOVE:
            await move_handler.handle(entry)
        BattleLogEntry.Type.ATTACK:
            await attack_handler.handle(entry)
        BattleLogEntry.Type.CAST_SKILL:
            await skill_handler.handle(entry)
        BattleLogEntry.Type.DEATH, BattleLogEntry.Type.GAME_OVER:
            await state_handler.handle(entry)
        BattleLogEntry.Type.WAIT:
            # Just a small pause for things like Dodge messages or AI waiting
            await get_tree().create_timer(0.3).timeout

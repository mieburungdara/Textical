class_name BattleController
extends BaseBattleController

## Main controller that coordinates the battle components.

@export_group("Grid Configuration")
@export var grid_width: int = 8
@export var grid_height: int = 8
@export var cell_size: int = 64

@export_group("Battle Setup")
## Drag and Drop .tres files here to define the initial party
@export var player_units: Array[HeroData] = []
@export var enemy_units: Array[MonsterData] = []

@onready var board: BattleBoard = $BattleBoard
@onready var vfx: VFXManager = $VFXManager
@onready var log_player: BattleLogPlayer = $BattleLogPlayer
@onready var log_label: RichTextLabel = $UI/LogPanel/ScrollContainer/LogLabel

func _ready():
    # Sync board config with controller config
    board.grid_width = grid_width
    board.grid_height = grid_height
    board.cell_size = cell_size
    
    vfx.setup(board)
    log_player.setup(board, self, vfx)
    log_message.connect(_on_log_message)
    
    start_battle()

func start_battle():
    simulation = BattleSimulation.new(grid_width, grid_height)
    
    # Add Players with Unique Runtime IDs
    var idx = 0
    var start_y = 1
    for data in player_units:
        if not data: continue
        var runtime_data = data.duplicate()
        runtime_data.id = data.id + "_" + str(idx) # Make ID unique
        
        var pos = Vector2i(1, start_y)
        simulation.add_unit(runtime_data, 0, pos)
        board.spawn_unit_view(runtime_data, 0, pos)
        start_y += 1
        idx += 1
    
    # Add Enemies with Unique Runtime IDs
    idx = 0
    start_y = 1
    for data in enemy_units:
        if not data: continue
        var runtime_data = data.duplicate()
        runtime_data.id = data.id + "_" + str(idx) # Make ID unique
        
        var pos = Vector2i(grid_width - 2, start_y)
        simulation.add_unit(runtime_data, 1, pos)
        board.spawn_unit_view(runtime_data, 1, pos)
        start_y += 1
        idx += 1
    
    # Run Simulation and Play Logs
    var logs = simulation.run_simulation()
    log_player.play_logs(logs)

func _on_log_message(text: String):
    log_label.append_text(text + "\n")

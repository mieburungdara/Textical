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
	
	if not log_message.is_connected(_on_log_message):
		log_message.connect(_on_log_message)
	
	start_battle()

func start_battle():
	simulation = BattleSimulation.new(grid_width, grid_height)
	
	# 1. Spawn Player Party with Unique Runtime IDs
	if GlobalGameManager.player_party.size() > 0:
		var idx = 0
		for pos in GlobalGameManager.player_party:
			var data = GlobalGameManager.player_party[pos]
			if not data: continue
			
			var runtime_data = data.duplicate()
			runtime_data.id = data.id + "_" + str(idx)
			
			simulation.add_unit(runtime_data, 0, pos)
			board.spawn_unit_view(runtime_data, 0, pos)
			idx += 1
	else:
		# Fallback to Inspector default (Debug mode)
		var idx = 0
		for i in range(player_units.size()):
			var data = player_units[i]
			if not data: continue
			var pos = Vector2i(1, i + 1)
			var runtime_data = data.duplicate()
			runtime_data.id = data.id + "_" + str(idx)
			
simulation.add_unit(runtime_data, 0, pos)
			board.spawn_unit_view(runtime_data, 0, pos)
			idx += 1
	
	# 2. Spawn Enemy Party with Level Scaling
	var enemies_to_use = GlobalGameManager.enemy_party_to_load if not GlobalGameManager.enemy_party_to_load.is_empty() else enemy_units
	var enemy_idx = 0
	for data in enemies_to_use:
		if not data: continue
		var runtime_data = data.duplicate()
		runtime_data.id = data.id + "_enemy_" + str(enemy_idx)
		
		# Apply Level Mult (+10% HP/DMG per level above 1)
		var level_mult = 1.0 + ((GlobalGameManager.enemy_level - 1) * 0.1)
		runtime_data.hp_base = int(data.hp_base * level_mult)
		runtime_data.damage_base = int(data.damage_base * level_mult)
		
		# Distribute enemies on the right side
		var pos = Vector2i(grid_width - 2, enemy_idx + 1)
		simulation.add_unit(runtime_data, 1, pos)
		board.spawn_unit_view(runtime_data, 1, pos)
		enemy_idx += 1
	
	# Clear temporary enemy data for next encounter
	GlobalGameManager.enemy_party_to_load = []
	
	# Run Simulation and Play Logs
	var logs = simulation.run_simulation()
	log_player.play_logs(logs)

func _on_log_message(text: String):
	log_label.append_text(text + "\n")
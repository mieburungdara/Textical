# =============================================================================
# REPLAY MANAGER USAGE EXAMPLE
# =============================================================================
# This shows how to set up and use ReplayManager in your Godot project.
# =============================================================================

extends Node2D

@onready var replay_manager: ReplayManager = $ReplayManager

# Unit scenes
var unit_scene: PackedScene = preload("res://Unit.tscn")

# =============================================================================
# SETUP
# =============================================================================

func _ready() -> void:
	# Create ReplayManager if not in scene
	if not replay_manager:
		replay_manager = Re		add_child(replayManager.new()
play_manager)
	
	# Connect playback control signals
	replay_manager.combat_started.connect(_on_combat_started)
	replay_manager.combat_ended.connect(_on_combat_ended)
	replay_manager.playback_finished.connect(_on_playback_finished)
	replay_manager.tick_reached.connect(_on_tick_reached)


func load_and_play_combat(replay_file: String) -> void:
	# 1. Load replay data
	var success = replay_manager.load_replay_from_file(replay_file)
	if not success:
		push_error("Failed to load replay!")
		return
	
	# 2. Get replay info
	var info = replay_manager.get_replay_info()
	print("Combat: %d ticks, winner: %s" % [info.total_ticks, info.winner])
	
	# 3. Spawn units based on replay data
	_spawn_units_from_replay(info.units)
	
	# 4. Start playback
	replay_manager.play()


func _spawn_units_from_replay(units: Array) -> void:
	for unit_data in units:
		var unit = unit_scene.instantiate()
		unit.position = Vector2(
			unit_data.position.x * 64,
			unit_data.position.y * 64
		)
		add_child(unit)
		
		# Set up unit with replay manager
		var combat_unit = unit as CombatUnit
		if combat_unit:
			combat_unit.setup(
				unit_data.id,
				unit_data.name,
				replay_manager
			)


# =============================================================================
# PLAYBACK CONTROLS (UI BUTTONS)
# =============================================================================

func _on_play_button_pressed() -> void:
	replay_manager.play()


func _on_pause_button_pressed() -> void:
	replay_manager.pause()


func _on_stop_button_pressed() -> void:
	replay_manager.stop()


func _on_speed_slider_value_changed(value: float) -> void:
	replay_manager.set_playback_speed(value)


func _on_seek_slider_value_changed(value: float) -> void:
	var max_tick = replay_manager.get_replay_info().total_ticks
	var target_tick = int(value * max_tick / 100.0)
	replay_manager.seek_to_tick(target_tick)


# =============================================================================
# SIGNAL HANDLERS
# =============================================================================

func _on_combat_started(total_ticks: int, seed: String) -> void:
	print("[Scene] Combat started! Ticks: %d, Seed: %s" % [total_ticks, seed])
	# Show "Combat Start" UI


func _on_combat_ended(winner: String) -> void:
	print("[Scene] Combat ended! Winner: %s" % winner)
	# Show victory/defeat UI


func _on_playback_finished() -> void:
	print("[Scene] Playback finished!")
	# Enable replay controls


func _on_tick_reached(tick: int) -> void:
	# Update UI progress bar
	var progress = tick * 100.0 / replay_manager.get_replay_info().total_ticks
	$UI/ProgressBar.value = progress
	$UI/TickLabel.text = "Tick: %d" % tick


# =============================================================================
# EXAMPLE: HOW TO CONNECT SIGNALS IN EDITOR
# =============================================================================
# 
# In Godot Editor:
# 1. Add a ReplayManager node to your scene
# 2. Add your unit scenes
# 3. Connect signals in the Node tab or via code:
#
#    replay_manager.unit_attack.connect(_on_attack)
#    replay_manager.unit_damage.connect(_on_damage)
#    replay_manager.unit_death.connect(_on_death)
#
# 4. Load replay and play:
#
#    replay_manager.load_replay_from_file("res://replays/combat_001.json")
#    replay_manager.play()
#
# =============================================================================

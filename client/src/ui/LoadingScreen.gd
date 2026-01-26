extends Control

@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var status_label = $VBoxContainer/StatusLabel

func _ready():
	status_label.text = "Initializing engine..."
	
	# Connect to DataManager signals
	DataManager.sync_progress.connect(_on_sync_progress)
	DataManager.sync_finished.connect(_on_sync_finished)
	
	# Small delay to ensure everything is ready
	await get_tree().create_timer(1.0).timeout
	
	status_label.text = "Checking for updates..."
	DataManager.start_sync()

func _on_sync_progress(current, total):
	var percent = float(current) / float(total) * 100
	progress_bar.value = percent
	status_label.text = "Updating Assets: %d / %d" % [current, total]

func _on_sync_finished():
	status_label.text = "All assets updated. Preparing Login..."
	progress_bar.value = 100
	await get_tree().create_timer(1.0).timeout
	
	# Transition to Login
	get_tree().change_scene_to_file("res://src/ui/LoginScreen.tscn")

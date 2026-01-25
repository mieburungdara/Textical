extends Control

@onready var title_label = $VBoxContainer/Title
@onready var resource_container = $VBoxContainer/ResourceList
@onready var action_label = $VBoxContainer/ActionStatus
@onready var map_btn = $VBoxContainer/MapButton

const GATHER_VFX = preload("res://assets/vfx/GatherEffect.tscn")

var current_region_data = null

func _ready():
	map_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://src/ui/WorldMapScreen.tscn"))
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.task_completed.connect(_on_task_completed)
	
	GameState.last_visited_hub = "res://src/ui/WildernessScreen.tscn"
	
	if GameState.current_user:
		_fetch_data()

func _fetch_data():
	ServerConnector.get_region_details(GameState.current_user.currentRegion)

func _on_request_completed(endpoint, _data):
	if "region/" in endpoint:
		current_region_data = _data
		_update_ui()

func _on_task_completed(data):
	if data.type == "GATHERING":
		action_label.text = "Gathering Success!"
		_play_vfx(GATHER_VFX)

func _play_vfx(vfx_scene: PackedScene):
	var effect = vfx_scene.instantiate()
	add_child(effect)
	# Center it on screen for now
	effect.position = get_viewport_rect().size / 2

func _update_ui():
	if not current_region_data: return
	title_label.text = current_region_data.name
	for child in resource_container.get_children(): child.queue_free()
	
	for res in current_region_data.resources:
		var btn = Button.new()
		btn.text = "Gather " + res.item.name
		btn.pressed.connect(func(): ServerConnector.gather(GameState.current_user.id, GameState.current_heroes[0].id, res.id))
		resource_container.add_child(btn)

	var hunt_btn = Button.new()
	hunt_btn.text = "Hunt Slime"
	hunt_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://src/ui/CombatScreen.tscn"))
	resource_container.add_child(hunt_btn)

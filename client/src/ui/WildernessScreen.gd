extends Control

@onready var title_label = $VBoxContainer/Title
@onready var resource_container = $VBoxContainer/ResourceList
@onready var action_label = $VBoxContainer/ActionStatus
@onready var map_btn = $VBoxContainer/MapButton

const GATHER_VFX = preload("res://assets/vfx/GatherEffect.tscn")

var current_region_data = null
var _last_clicked_button: Button = null

func _ready():
	map_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://src/ui/WorldMapScreen.tscn"))
	ServerConnector.request_completed.connect(_on_request_completed)
	ServerConnector.task_completed.connect(_on_task_completed)
	
	GameState.last_visited_hub = "res://src/ui/WildernessScreen.tscn"
	
	if GameState.current_user:
		_fetch_data()

func _fetch_data():
	ServerConnector.get_region_details(GameState.current_user.currentRegion)

func _on_request_completed(endpoint, data):
	if "region/" in endpoint:
		current_region_data = data
		_update_ui()
	elif "action/travel" in endpoint:
		get_tree().change_scene_to_file("res://src/ui/TravelScene.tscn")

func _on_task_completed(data):
	if data.type == "GATHERING":
		action_label.text = "Gathering Success!"
		var vfx_pos = get_viewport_rect().size / 2
		if is_instance_valid(_last_clicked_button):
			vfx_pos = _last_clicked_button.global_position + (_last_clicked_button.size / 2)
		_play_vfx(GATHER_VFX, vfx_pos)
		ServerConnector.fetch_inventory(GameState.current_user.id)
		ServerConnector.fetch_profile(GameState.current_user.id)

func _play_vfx(vfx_scene: PackedScene, pos: Vector2):
	var effect = vfx_scene.instantiate()
	add_child(effect)
	effect.global_position = pos

func _update_ui():
	if not current_region_data: return
	title_label.text = current_region_data.name
	for child in resource_container.get_children(): child.queue_free()
	
	for res in current_region_data.resources:
		var btn = Button.new()
		btn.text = "Gather " + res.item.name
		btn.custom_minimum_size = Vector2(0, 50)
		btn.pressed.connect(func(): _on_gather_pressed(res.id, btn))
		resource_container.add_child(btn)

	var hunt_btn = Button.new()
	hunt_btn.text = "Hunt Slime"
	hunt_btn.custom_minimum_size = Vector2(0, 60)
	hunt_btn.pressed.connect(_on_hunt_pressed)
	resource_container.add_child(hunt_btn)

func _on_hunt_pressed():
	get_tree().change_scene_to_file("res://src/ui/CombatScreen.tscn")

func _on_gather_pressed(resource_id, btn):
	_last_clicked_button = btn
	if GameState.current_heroes.size() > 0:
		ServerConnector.gather(GameState.current_user.id, GameState.current_heroes[0].id, resource_id)
		action_label.text = "Extracting..."
	else:
		ServerConnector.fetch_heroes(GameState.current_user.id)

extends Control

@onready var grid = $VBoxContainer/ScrollContainer/GridContainer
@onready var status_label = $VBoxContainer/StatusLabel
@onready var back_btn = $VBoxContainer/BackButton

func _ready():
	back_btn.pressed.connect(func(): get_tree().change_scene_to_file(GameState.last_visited_hub))
	ServerConnector.request_completed.connect(_on_request_completed)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_inventory(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if "inventory" in endpoint and data is Dictionary and data.has("items"):
		GameState.set_inventory(data)
		_populate_grid()

func _populate_grid():
	for child in grid.get_children(): child.queue_free()
	status_label.text = "Slots: %d / %d" % [GameState.inventory_status.used, GameState.inventory_status.max]
	for item in GameState.inventory:
		var item_node = Button.new()
		item_node.custom_minimum_size = Vector2(100, 100)
		var template = item.get("template", {})
		var item_name = template.get("name", "Unknown")
		var qty = item.get("quantity", 1)
		item_node.text = "%s\nx%d" % [item_name, qty]
		grid.add_child(item_node)

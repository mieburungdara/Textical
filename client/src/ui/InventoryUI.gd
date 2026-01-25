extends Control

@onready var grid = $Panel/VBoxContainer/ScrollContainer/GridContainer
@onready var status_label = $Panel/VBoxContainer/StatusLabel
@onready var close_btn = $Panel/VBoxContainer/CloseButton

func _ready():
	close_btn.pressed.connect(func(): hide())
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
	# Clear existing
	for child in grid.get_children():
		child.queue_free()
	
	status_label.text = "Slots: %d / %d" % [GameState.inventory_status.used, GameState.inventory_status.max]
	
	# Populate items
	for item in GameState.inventory:
		var item_node = Button.new()
		item_node.custom_minimum_size = Vector2(80, 80)
		item_node.text = "%s\nx%d" % [item.template.name, item.quantity]
		item_node.tooltip_text = item.template.description
		grid.add_child(item_node)
	
	# Fill empty slots to show the "20 slot" reality
	var empty_count = GameState.inventory_status.max - GameState.inventory_status.used
	for i in range(empty_count):
		var empty_node = Panel.new()
		empty_node.custom_minimum_size = Vector2(80, 80)
		grid.add_child(empty_node)

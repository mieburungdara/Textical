extends Control

# Private Island Screen - Overlay for farming system
# Access from Town/Citadel

# UI Elements
@onready var main_container = $MainContainer
@onready var header = $MainContainer/Header
@onready var title_label = $MainContainer/Header/Title
@onready var close_btn = $MainContainer/Header/CloseButton

# Tab buttons
@onready var garden_tab_btn = $MainContainer/TabContainer/GardenTab
@onready var storage_tab_btn = $MainContainer/TabContainer/StorageTab

# Garden view
@onready var garden_grid = $MainContainer/TabContainer/GardenView/GardenGrid
@onready var garden_info = $MainContainer/TabContainer/GardenView/GardenInfo
@onready var plots_label = $MainContainer/TabContainer/GardenView/GardenInfo/PlotsLabel
@onready var upgrade_plots_btn = $MainContainer/TabContainer/GardenView/GardenInfo/UpgradePlotsButton
@onready var seed_inventory_grid = $MainContainer/TabContainer/GardenView/SeedInventory

# Storage view
@onready var storage_grid = $MainContainer/TabContainer/StorageView/StorageGrid
@onready var storage_info = $MainContainer/TabContainer/StorageView/StorageInfo
@onready var slots_label = $MainContainer/TabContainer/StorageView/StorageInfo/SlotsLabel
@onready var upgrade_storage_btn = $MainContainer/TabContainer/StorageView/StorageInfo/UpgradeStorageButton

# Plant dialog
@onready var plant_dialog = $PlantDialog
@onready var plant_dialog_grid = $PlantDialog/PlantDialogContent/SeedGrid

# Garden plot scene
var garden_plot_scene = preload("res://src/ui/components/GardenPlot.tscn")

# Data
var island_data = {}
var seed_inventory = []
var crop_templates = []
var is_unlocked = false
var selected_plot_index = -1

func _ready():
	# Connect signals
	close_btn.pressed.connect(_on_close_pressed)
	garden_tab_btn.pressed.connect(_on_garden_tab_pressed)
	storage_tab_btn.pressed.connect(_on_storage_tab_pressed)
	upgrade_plots_btn.pressed.connect(_on_upgrade_plots_pressed)
	upgrade_storage_btn.pressed.connect(_on_upgrade_storage_pressed)
	
	# Connect to server
	ServerConnector.request_completed.connect(_on_request_completed)
	
	# Load data
	_load_island_data()

func _load_island_data():
	if GameState.current_user:
		var user_id = GameState.current_user.get("id")
		ServerConnector.get_private_island(user_id)
		ServerConnector.get_crop_templates()

func _on_request_completed(endpoint: String, data):
	if endpoint.begins_with("island"):
		_handle_island_response(endpoint, data)
	elif endpoint == "island/crops":
		_handle_crop_templates(data)

func _handle_island_response(endpoint: String, data):
	var response = data.get("data", data)
	
	if endpoint == "island/status" or endpoint.begins_with("island/"):
		island_data = response
		is_unlocked = island_data.get("isUnlocked", false)
		
		if is_unlocked:
			_show_island_content()
		else:
			_show_locked_screen()

func _handle_crop_templates(data):
	crop_templates = data.get("data", [])

func _show_locked_screen():
	# Show unlock dialog
	main_container.visible = false
	# TODO: Show unlock purchase dialog

func _show_island_content():
	main_container.visible = true
	_update_garden_view()
	_update_storage_view()
	_load_seed_inventory()

func _update_garden_view():
	var plots = island_data.get("plots", [])
	var plot_count = island_data.get("plotCount", 10)
	var max_plots = island_data.get("maxPlots", 50)
	
	plots_label.text = "Plots: %d / %d" % [plots.size(), max_plots]
	upgrade_plots_btn.disabled = plot_count >= max_plots
	
	# Clear and rebuild garden grid
	for child in garden_grid.get_children():
		child.queue_free()
	
	for i in range(plot_count):
		var plot_data = null
		for plot in plots:
			if plot.get("plotIndex") == i:
				plot_data = plot
				break
		
		var plot_ui = garden_plot_scene.instantiate()
		garden_grid.add_child(plot_ui)
		plot_ui.setup(i, plot_data)
		plot_ui.plot_clicked.connect(_on_plot_clicked)

func _update_storage_view():
	var storage_items = island_data.get("storageItems", [])
	var slot_count = island_data.get("storageSlotCount", 10)
	var max_slots = island_data.get("maxStorageSlots", 50)
	
	slots_label.text = "Slots: %d / %d" % [storage_items.size(), max_slots]
	upgrade_storage_btn.disabled = slot_count >= max_slots
	
	# Clear and rebuild storage grid
	for child in storage_grid.get_children():
		child.queue_free()
	
	for i in range(slot_count):
		var item_data = null
		for item in storage_items:
			if item.get("slotIndex") == i:
				item_data = item
				break
		
		var slot = _create_storage_slot(item_data, i)
		storage_grid.add_child(slot)

func _create_storage_slot(item_data, index):
	# TODO: Create storage slot UI
	var panel = Panel.new()
	panel.custom_minimum_size = Vector2(48, 48)
	return panel

func _load_seed_inventory():
	# Get seed items from inventory
	if GameState.current_user:
		var user_id = GameState.current_user.get("id")
		# TODO: Request seed items from inventory
		seed_inventory = []
		_update_seed_inventory()

func _update_seed_inventory():
	# Clear and rebuild seed inventory grid
	for child in seed_inventory_grid.get_children():
		child.queue_free()
	
	for seed_item in seed_inventory:
		var item = _create_seed_item(seed_item)
		seed_inventory_grid.add_child(item)

func _create_seed_item(seed_data):
	# TODO: Create seed item UI
	var panel = Panel.new()
	panel.custom_minimum_size = Vector2(48, 48)
	return panel

func _on_plot_clicked(plot_index, plot_data):
	selected_plot_index = plot_index
	
	if plot_data == null or plot_data.get("status") == "EMPTY":
		_show_plant_dialog(plot_index)
	elif plot_data.get("status") == "READY":
		_harvest_plot(plot_index)
	else:
		# Show plot info (growing, etc)
		pass

func _show_plant_dialog(plot_index):
	plant_dialog.visible = true
	
	# Clear and rebuild plant dialog
	for child in plant_dialog_grid.get_children():
		child.queue_free()
	
	for seed_item in seed_inventory:
		var seed_btn = Button.new()
		seed_btn.text = seed_item.get("template", {}).get("name", "Unknown")
		seed_btn.pressed.connect(_on_seed_selected.bind(plot_index, seed_item))
		plant_dialog_grid.add_child(seed_btn)

func _on_seed_selected(plot_index, seed_item):
	var seed_template_id = seed_item.get("templateId")
	ServerConnector.plant_seed(GameState.current_user.id, plot_index, seed_template_id)
	plant_dialog.visible = false

func _harvest_plot(plot_index):
	ServerConnector.harvest_crop(GameState.current_user.id, plot_index)

func _on_close_pressed():
	queue_free()

func _on_garden_tab_pressed():
	$MainContainer/TabContainer.current_tab = 0

func _on_storage_tab_pressed():
	$MainContainer/TabContainer.current_tab = 1

func _on_upgrade_plots_pressed():
	ServerConnector.upgrade_island_plots(GameState.current_user.id)

func _on_upgrade_storage_pressed():
	ServerConnector.upgrade_island_storage(GameState.current_user.id)

func _process(delta):
	# Update crop growth progress in real-time
	if is_unlocked:
		_update_crop_progress(delta)

func _update_crop_progress(delta):
	# Update visual progress bars for growing crops
	for child in garden_grid.get_children():
		if child.has_method("update_progress"):
			child.update_progress(delta)

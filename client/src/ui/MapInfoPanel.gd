extends Control

signal action_requested(region_id)

@onready var name_label = $Margin/VBox/RegionName
@onready var lore_label = $Margin/VBox/LoreLabel
@onready var tips_label = $Margin/VBox/TipsLabel
@onready var start_btn = $Margin/VBox/HBox/StartBtn
@onready var close_btn = $Margin/VBox/HBox/CloseBtn

func _ready():
	close_btn.pressed.connect(hide)
	start_btn.pressed.connect(func(): action_requested.emit(_current_id))

var _current_id = -1

func display_region(region_data):
	_current_id = int(str(region_data.id).to_float())
	var local = DataManager.get_region(_current_id)
	
	name_label.text = local.get("name", "Unknown")
	lore_label.text = local.get("lore", "...")
	tips_label.text = "TIP: " + local.get("tips", ["Safe."])[0]
	
	var is_here = _current_id == int(str(GameState.current_user.currentRegion).to_float())
	start_btn.text = "Enter" if is_here else "Start Journey"
	start_btn.disabled = false
	show()

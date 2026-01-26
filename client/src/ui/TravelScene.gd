extends ProgressBaseScene

@onready var dest_name = $VBoxContainer/DestName
@onready var lore_label = $VBoxContainer/LoreBox/Label
@onready var history_label = $VBoxContainer/InfoGrid/HistoryBox/Text
@onready var tips_label = $VBoxContainer/InfoGrid/TipsBox/Text
@onready var next_tip_btn = $VBoxContainer/InfoGrid/TipsBox/NextTipBtn

var _target_id = -1
var _target_type = "TOWN"
var _tips = []
var _current_tip_idx = 0

func _setup_scene():
    next_tip_btn.pressed.connect(_on_next_tip)
    
    var task = GameState.active_task
    if task and task.get("type") == "TRAVEL":
        _log("Incoming Task Data: " + str(task))
        _target_id = int(task.get("targetRegionId", -1))        
    		# Metadata Capture
    		if task.has("targetRegion"):
    			var region_template = task.get("targetRegion", {})
    			dest_name.text = region_template.get("name", "Unknown Region")
    			_target_type = region_template.get("type", "TOWN")
    			
    			# Parse Lore/Tips/History from metadata JSON string
    			var meta_str = region_template.get("metadata", "{}")        var meta = JSON.parse_string(meta_str)
        if meta is Dictionary:
            lore_label.text = meta.get("lore", "No lore recorded for this place.")
            history_label.text = meta.get("history", "History has forgotten this land.")
            _tips = meta.get("tips", ["Stay alert."])
            _show_tip(0)
        
        _log("Traveling to: " + dest_name.text)
    else:
        _force_sync()

func _show_tip(idx):
    if _tips.size() > 0:
        tips_label.text = _tips[idx % _tips.size()]

func _on_next_tip():
    _current_tip_idx += 1
    _show_tip(_current_tip_idx)

func _on_timer_finished():
    GameState.set_active_task(null)
    _route_by_type(_target_type)

func _handle_task_completion(data):
    if data.type == "TRAVEL":
        _is_waiting_for_socket = false

func _handle_request_result(endpoint, data):
    if endpoint.contains("/user/"):
        var active_task_on_server = data.get("activeTask")
        if active_task_on_server == null:
            var metadata = data.get("currentRegionData", {})
            _route_by_type(metadata.get("type", "TOWN"))

func _route_by_type(r_type: String):
    if _is_changing_scene: return
    _is_changing_scene = true
    if r_type == "TOWN": get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")
    else: get_tree().change_scene_to_file("res://src/ui/WildernessScreen.tscn")

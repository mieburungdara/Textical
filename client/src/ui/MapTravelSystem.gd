extends Node2D

signal travel_finished(target_id, target_type)

@onready var path_2d = $Path2D
@onready var line_2d = $Path2D/Line2D
@onready var follow_2d = $Path2D/PathFollow2D

var camera: Camera2D = null
var is_traveling = false
var _target_id = -1
var _target_type = "TOWN"
var _progress = 0.0
var _duration = 5.0

func _process(delta):
    if !is_traveling: return
    _progress += delta / _duration
    var p = clamp(_progress, 0.0, 1.0)
    
    if path_2d.curve and path_2d.curve.get_baked_length() > 0:
        follow_2d.progress_ratio = p
        # Notify camera to follow this position
        if camera:
            camera.global_position = camera.global_position.lerp(follow_2d.global_position, 0.1)
    
    if p >= 1.0:
        is_traveling = false
        travel_finished.emit(_target_id, _target_type)

func start_cinematic(task):
    var target_rid = int(str(task.get("targetRegionId", 1)).to_float())
    var origin_rid = int(str(task.get("originRegionId", 1)).to_float())
    _target_id = target_rid
    _target_type = DataManager.get_region(target_rid).get("type", "TOWN")
    
    var start_pos = GameState.REGION_POSITIONS.get(origin_rid, Vector2(2500, 2500))
    var end_pos = GameState.REGION_POSITIONS.get(target_rid, Vector2(2500, 2500))
    
    path_2d.curve = Curve2D.new()
    path_2d.curve.add_point(start_pos)
    path_2d.curve.add_point(end_pos)
    line_2d.points = PackedVector2Array([start_pos, end_pos])
    
    show()
    _progress = 0.0
    is_traveling = true

extends Node
class_name TestReplayManager

var timer: Timer
var events: Array = []
var current_index: int = 0
var current_tick: int = 0

signal e_attack(a, b, c)
signal e_move(a, b)
signal e_damage(a, b, c, d)

func _ready():
	timer = Timer.new()
	timer.wait_time = 0.5
	timer.timeout.connect(_on_timer)
	add_child(timer)

func load(data: String) -> bool:
	var j = JSON.new()
	if j.parse(data) != OK:
		return false
	events = j.get_data().get("events", [])
	events.sort_custom(func(a, b): return a.tick < b.tick)
	return true

func play():
	timer.start()

func stop():
	timer.stop()
	current_index = 0
	current_tick = 0

func _on_timer():
	if current_index >= events.size():
		stop()
		return
	
	current_tick += 1
	
	while current_index < events.size():
		var ev = events[current_index]
		if ev.tick > current_tick:
			break
		if ev.tick == current_tick:
			_process(ev)
		current_index += 1

func _process(ev: Dictionary):
	match ev.get("eventType"):
		"attack":
			e_attack.emit(ev.get("unitId"), ev.get("targetId"), ev.get("damage"))
		"move":
			e_move.emit(ev.get("unitId"), ev.get("position"))
		"damage_dealt":
			e_damage.emit(ev.get("targetId"), ev.get("damage"), ev.get("hpAfter"), ev.get("delta_hp"))

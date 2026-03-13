extends Node
class_name ReplayManager

var _units: Dictionary = {}
var _data: Dictionary = {}
var _events: Array = []
var _idx: int = 0
var _tick: int = 0
var _playing: bool = false
var _timer: Timer

signal s_attack(a, b, c, d, e, f)
signal s_move(a, b, c)
signal s_damage(a, b, c, d, e, f)  # target, attacker, damage, delta, crit, miss
signal s_heal(a, b, c, d, e)
signal s_mana(a, b, c, d)
signal s_death(a)
signal s_tick(t)
signal s_start(t, s)
signal s_end(w)
signal s_error(m)

func _ready():
    _timer = Timer.new()
    _timer.wait_time = 0.1
    _timer.timeout.connect(_tick_timer)
    add_child(_timer)

func load_file(path: String) -> bool:
    var f = FileAccess.open(path, FileAccess.READ)
    if f == null:
        s_error.emit("Cannot open file")
        return false
    var json = f.get_as_text()
    f.close()
    return load_json(json)

func load_json(js: String) -> bool:
    var j = JSON.new()
    if j.parse(js) != OK:
        s_error.emit("JSON error")
        return false
    _data = j.get_data()
    if not _data.has("events"):
        s_error.emit("No events")
        return false
    _events = _data["events"]
    _events.sort_custom(func(a, b): return a.get("tick", 0) < b.get("tick", 0))
    _idx = 0
    _tick = 0
    return true

func play():
    if _events.is_empty():
        s_error.emit("No events")
        return
    _playing = true
    _timer.start()
    s_start.emit(_data.get("totalTicks", 0), _data.get("seed", ""))

func pause():
    _playing = false
    _timer.stop()

func stop():
    _playing = false
    _tick = 0
    _idx = 0
    _timer.stop()

func speed(s: float):
    _timer.wait_time = 0.1 / clamp(s, 0.1, 10.0)

func info() -> Dictionary:
    return {
        "ticks": _data.get("totalTicks", 0),
        "winner": _data.get("winner", "?"),
        "count": _events.size()
    }

func reg(id: String, node: Node):
    _units[id] = node

func unreg(id: String):
    _units.erase(id)

func get_unit(id: String) -> Node:
    return _units.get(id)

func _tick_timer():
    if not _playing:
        return
    _tick += 1
    s_tick.emit(_tick)
    while _idx < _events.size():
        var ev = _events[_idx]
        var t = ev.get("tick", 0)
        if t > _tick:
            break
        if t == _tick:
            _dispatch(ev)
        _idx += 1
    if _idx >= _events.size():
        _playing = false
        _timer.stop()
        s_end.emit(_data.get("winner", "draw"))

func _dispatch(ev: Dictionary):
    var et = ev.get("eventType", "")
    # Handle new compact format (result enum: 0=normal, 1=crit, 2=miss, 3=dodge)
    var result_val = ev.get("result", 0)
    var is_crit = result_val == 1
    var is_miss = result_val == 2
    var is_dodge = result_val == 3
    
    match et:
        "attack":
            s_attack.emit(ev.get("unitId", ""), ev.get("targetId", ""), ev.get("damage", 0), is_crit, is_miss, is_dodge)
        "move":
            s_move.emit(ev.get("unitId", ""), _pos(ev.get("oldPosition")), _pos(ev.get("position")))
        "damage_taken":
            # Only handle damage_taken - damage_dealt is redundant
            # We don't need hpBefore/hpAfter - Godot tracks HP locally
            s_damage.emit(ev.get("unitId", ""), ev.get("targetId", ""), ev.get("damage", 0), ev.get("deltaHp", -ev.get("damage", 0)), is_crit, is_miss)
        "heal_received":
            s_heal.emit(ev.get("unitId", ""), ev.get("targetId", ""), ev.get("heal", 0), ev.get("hpBefore", 0), ev.get("hpAfter", 0))
        "mana_change":
            s_mana.emit(ev.get("unitId", ""), ev.get("manaBefore", 0), ev.get("manaAfter", 0), ev.get("delta", 0))
        "unit_death":
            s_death.emit(ev.get("unitId", ""))
        "combat_start":
            s_start.emit(_data.get("totalTicks", 0), _data.get("seed", ""))
        "combat_end":
            s_end.emit(ev.get("winner", "draw"))

func _pos(p):
    if p == null:
        return Vector2i.ZERO
    if p is Dictionary:
        return Vector2i(int(p.get("x", 0)), int(p.get("y", 0)))
    if p is Array:
        return Vector2i(int(p[0]), int(p[1]))
    return Vector2i.ZERO

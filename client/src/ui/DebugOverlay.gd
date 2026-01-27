extends CanvasLayer

@onready var panel = $Panel
@onready var text_label = $Panel/VBox/RichTextLabel

func _ready():
    process_mode = Node.PROCESS_MODE_ALWAYS
    panel.hide()
    _load_todo_list()

func _input(event):
    if event is InputEventKey:
        if event.ctrl_pressed and event.keycode == KEY_Y and event.pressed:
            _toggle_overlay()

func _toggle_overlay():
    panel.visible = !panel.visible
    if panel.visible:
        _load_todo_list()

func _load_todo_list():
    var file = FileAccess.open("res://assets/data/todo_list.json", FileAccess.READ)
    if file:
        var data = JSON.parse_string(file.get_as_text())
        if data:
            var output = "[center][b][color=yellow]TEXTICAL ROADMAP[/color][/b][/center]\n"
            output += "[color=cyan]Phase: %s[/color]\n\n" % data.current_phase
            
            for t in data.tasks:
                var color = "green" if t.status == "COMPLETED" else "white"
                if t.priority == "CRITICAL" : color = "red"
                output += "[color=%s]• [%s] %s[/color]\n" % [color, t.status, t.task]
            
            text_label.bbcode_text = output

extends Control

@onready var quest_container = $Panel/VBox

func _ready():
    GameState.quest_updated.connect(_refresh_display)
    # Initial refresh
    _refresh_display()

func _refresh_display():
    for child in quest_container.get_children():
        if child is Label and child.name != "Header":
            child.queue_free()
    
    var quests = GameState.active_quests
    if quests.size() == 0:
        hide()
        return
    
    show()
    for u_quest in quests:
        var quest = u_quest.get("quest", {})
        var q_name = quest.get("name", "Unknown Quest")
        var q_category = quest.get("category", "MAIN")
        var stage = u_quest.get("currentStage", {})
        
        var l = Label.new()
        l.text = "[" + q_category + "] " + q_name
        
        # Color based on category
        var color = Color(1, 0.9, 0.5) # Default MAIN
        if q_category == "SIDE":
            color = Color(0.7, 0.8, 1.0)
        elif q_category == "DAILY":
            color = Color(0.7, 1.0, 0.7)
            
        l.add_theme_color_override("font_color", color)
        quest_container.add_child(l)
        
        if stage:
            for obj in stage.get("objectives", []):
                var progress = JSON.parse_string(u_quest.get("progressData", "{}"))
                var current = progress.get(str(obj.get("targetId")), 0)
                var target = obj.get("amount", 1)
                
                var obj_l = Label.new()
                obj_l.text = "  - " + obj.get("type", "") + " " + str(obj.get("targetId")) + ": " + str(current) + "/" + str(target)
                obj_l.add_theme_font_size_override("font_size", 12)
                obj_l.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
                quest_container.add_child(obj_l)

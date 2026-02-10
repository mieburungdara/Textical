extends Control

## QuestScreen - "The Chronicle" Redesign
## Optimized for landscape overlay mode. Displays active quests and objectives.

@onready var quest_list = %QuestList
@onready var title_label = %Title

## Setup as overlay logic
func setup_as_overlay(_data: Dictionary = {}):
    # Standard overlay setup
    if has_node("SideHUD"): $SideHUD.visible = false
    
    # Position container correctly to clear sidebar
    if has_node("MarginContainer"):
        $MarginContainer.offset_left = 200
        $MarginContainer.offset_right = -40
        $MarginContainer.offset_top = 40
        $MarginContainer.offset_bottom = -40
    
    # Change title if viewed from sidebar
    if title_label:
        title_label.text = "ADVENTURER'S CHRONICLE"

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    refresh()

func refresh():
    if GameState.current_user:
        var uid = GameState.current_user.get("id")
        if uid:
            ServerConnector.fetch_quests(int(uid))

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if "quests/" in endpoint and not endpoint.contains("complete"):
        _populate_quests(data)
    elif "quests/complete" in endpoint:
        GameState.inventory_is_dirty = true
        refresh()
        var uid = GameState.current_user.get("id") if GameState.current_user else null
        if uid: ServerConnector.fetch_profile(int(uid))

func _populate_quests(quests):
    for child in quest_list.get_children(): child.queue_free()
    
    if not quests or quests.size() == 0:
        var l = Label.new()
        l.text = "Your chronicle is empty. Seek the Town Crier for new tasks."
        l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        l.modulate = Color(0.6, 0.6, 0.6)
        quest_list.add_child(l)
        return

    for u_quest in quests:
        if not u_quest is Dictionary: continue
        
        var quest = u_quest.get("quest", {})
        if not quest: continue
        
        var card = _create_quest_card(u_quest)
        quest_list.add_child(card)

func _create_quest_card(u_quest: Dictionary) -> Control:
    var quest = u_quest.get("quest", {})
    var q_name = quest.get("name", "Mysterious Task")
    var q_desc = quest.get("description", "No details provided.")
    var status = u_quest.get("status", "ACTIVE")
    
    var panel = PanelContainer.new()
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0.15, 0.12, 0.1, 0.8)
    style.border_width_left = 4
    style.border_color = Color(0.8, 0.6, 0.2) if status == "COMPLETED" else Color(0.4, 0.4, 0.4)
    style.content_margin_left = 20
    style.content_margin_right = 20
    style.content_margin_top = 15
    style.content_margin_bottom = 15
    style.corner_radius_top_right = 8
    style.corner_radius_bottom_right = 8
    panel.add_theme_stylebox_override("panel", style)
    
    var hbox = HBoxContainer.new()
    hbox.add_theme_constant_override("separation", 20)
    
    var vbox = VBoxContainer.new()
    vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    
    var name_lbl = Label.new()
    name_lbl.text = q_name.to_upper()
    name_lbl.add_theme_font_size_override("font_size", 20)
    name_lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.7))
    
    var desc_lbl = Label.new()
    desc_lbl.text = q_desc
    desc_lbl.add_theme_font_size_override("font_size", 14)
    desc_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
    desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    
    vbox.add_child(name_lbl)
    vbox.add_child(desc_lbl)
    
    var action_vbox = VBoxContainer.new()
    action_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
    
    var complete_btn = Button.new()
    complete_btn.text = "CLAIM REWARD" if status == "COMPLETED" else "IN PROGRESS"
    complete_btn.disabled = status != "COMPLETED"
    complete_btn.custom_minimum_size = Vector2(150, 45)
    
    if status == "COMPLETED":
        complete_btn.pressed.connect(func(): 
            if GameState.current_user:
                var uid = GameState.current_user.get("id")
                var qid = u_quest.get("id")
                if uid and qid:
                    ServerConnector.complete_quest(int(uid), int(qid))
        )
    
    action_vbox.add_child(complete_btn)
    
    hbox.add_child(vbox)
    hbox.add_child(action_vbox)
    panel.add_child(hbox)
    
    return panel

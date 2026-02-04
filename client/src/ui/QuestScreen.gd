extends Control

@onready var quest_list = $MarginContainer/VBoxContainer/ScrollContainer/QuestList

func _ready():
    ServerConnector.request_completed.connect(_on_request_completed)
    refresh()

func refresh():
    if GameState.current_user:
        ServerConnector.fetch_quests(GameState.current_user.id)

func _on_request_completed(endpoint, data):
    if !is_inside_tree(): return
    if "quests/" in endpoint and not endpoint.contains("complete"):
        _populate_quests(data)
    elif "quests/complete" in endpoint:
        GameState.inventory_is_dirty = true
        refresh()
        ServerConnector.fetch_profile(GameState.current_user.id)

func _populate_quests(quests):
    for child in quest_list.get_children(): child.queue_free()
    for u_quest in quests:
        # Validate u_quest is a Dictionary before accessing properties
        if not u_quest is Dictionary:
            print("QuestScreen: Skipping invalid quest data (not a Dictionary)")
            continue
        var quest = u_quest.get("quest", {})
        var rewards = quest.get("rewards", []) if quest is Dictionary else []
        var reward_amount = 0
        if rewards is Array and rewards.size() > 0:
            reward_amount = rewards[0].get("amount", 0) if rewards[0] is Dictionary else 0
            
        var btn = Button.new()
        btn.text = "%s - Reward: %d Gold" % [quest.get("name", "Unknown") if quest is Dictionary else "Unknown", reward_amount]
        btn.pressed.connect(func(): 
            if GameState.current_user:
                var quest_id = u_quest.get("id") if u_quest is Dictionary else 0
                if quest_id:
                    ServerConnector.complete_quest(GameState.current_user.id, quest_id)
        )
        quest_list.add_child(btn)

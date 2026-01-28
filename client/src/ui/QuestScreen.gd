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
		var quest = u_quest.get("quest", {})
		var rewards = quest.get("rewards", [])
		var reward_amount = 0
		if rewards.size() > 0:
			reward_amount = rewards[0].get("amount", 0)
			
		var btn = Button.new()
		btn.text = "%s - Reward: %d Gold" % [quest.get("name", "Unknown"), reward_amount]
		btn.pressed.connect(func(): 
			if GameState.current_user:
				ServerConnector.complete_quest(GameState.current_user.id, u_quest.id)
		)
		quest_list.add_child(btn)
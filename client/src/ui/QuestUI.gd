extends Control

@onready var quest_list = $Panel/VBoxContainer/ScrollContainer/QuestList
@onready var close_btn = $Panel/VBoxContainer/CloseButton

func _ready():
	close_btn.pressed.connect(func(): hide())
	ServerConnector.request_completed.connect(_on_request_completed)

func refresh():
	if GameState.current_user:
		quest_list.get_children().map(func(c): c.queue_free())
		var l = Label.new()
		l.text = "Fetching quests..."
		quest_list.add_child(l)
		ServerConnector.fetch_quests(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if "quests/" in endpoint and not endpoint.contains("complete"):
		_populate_quests(data)
	elif "quests/complete" in endpoint:
		# On success, refresh the list and user gold
		refresh()
		ServerConnector.fetch_profile(GameState.current_user.id)

func _populate_quests(quests):
	for child in quest_list.get_children():
		child.queue_free()
	
	if quests.size() == 0:
		var l = Label.new()
		l.text = "No active quests. Check back tomorrow!"
		quest_list.add_child(l)
		return

	for u_quest in quests:
		var quest = u_quest.quest
		var panel = PanelContainer.new()
		var vbox = VBoxContainer.new()
		
		var title = Label.new()
		title.text = quest.name
		title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(title)
		
		var desc = Label.new()
		desc.text = quest.description
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(desc)
		
		# Objectives
		for obj in quest.objectives:
			var ol = Label.new()
			ol.text = "- %s" % obj.description
			vbox.add_child(ol)
		
		# Rewards
		for rew in quest.rewards:
			var rl = Label.new()
			rl.text = "Reward: %d %s" % [rew.amount, rew.type]
			rl.modulate = Color.GOLD
			vbox.add_child(rl)
		
		var complete_btn = Button.new()
		complete_btn.text = "Complete Quest"
		complete_btn.pressed.connect(func(): _on_complete_pressed(u_quest.id))
		vbox.add_child(complete_btn)
		
		panel.add_child(vbox)
		quest_list.add_child(panel)

func _on_complete_pressed(user_quest_id):
	ServerConnector.complete_quest(GameState.current_user.id, user_quest_id)

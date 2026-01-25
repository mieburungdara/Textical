extends Control

@onready var quest_list = $VBoxContainer/ScrollContainer/QuestList
@onready var back_btn = $VBoxContainer/BackButton

func _ready():
	back_btn.pressed.connect(func(): get_tree().change_scene_to_file(GameState.last_visited_hub))
	ServerConnector.request_completed.connect(_on_request_completed)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_quests(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if "quests/" in endpoint and not endpoint.contains("complete"):
		_populate_quests(data)
	elif "quests/complete" in endpoint:
		refresh()
		ServerConnector.fetch_profile(GameState.current_user.id)

func _populate_quests(quests):
	for child in quest_list.get_children(): child.queue_free()
	for u_quest in quests:
		var quest = u_quest.quest
		var btn = Button.new()
		btn.text = "%s - Reward: %d Gold" % [quest.name, quest.rewards[0].amount]
		btn.pressed.connect(func(): ServerConnector.complete_quest(GameState.current_user.id, u_quest.id))
		quest_list.add_child(btn)
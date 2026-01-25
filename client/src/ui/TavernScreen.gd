extends Control

@onready var merc_list = $VBoxContainer/ScrollContainer/MercList
@onready var status_label = $VBoxContainer/StatusLabel
@onready var exit_btn = $VBoxContainer/ExitButton

func _ready():
	exit_btn.pressed.connect(_on_exit_pressed)
	ServerConnector.request_completed.connect(_on_request_completed)
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.get_mercenaries(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if "tavern/mercenaries" in endpoint:
		_populate_mercs(data)
	elif "tavern/recruit" in endpoint:
		status_label.text = "Recruitment Successful!"
		# Refresh list and user gold
		refresh()
		ServerConnector.fetch_profile(GameState.current_user.id)
	elif "tavern/exit" in endpoint:
		get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn")

func _populate_mercs(mercs):
	for child in merc_list.get_children():
		child.queue_free()
	
	if mercs.size() == 0:
		var l = Label.new()
		l.text = "No mercenaries currently looking for work."
		merc_list.add_child(l)
		return

	for merc in mercs:
		var hbox = HBoxContainer.new()
		
		var info = Label.new()
		info.text = "%s (Lvl %d %s) - %d Gold" % [
			merc.hero.name, 
			merc.hero.level, 
			merc.hero.combatClass.name, 
			merc.recruitmentCost
		]
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		
		var btn = Button.new()
		btn.text = "Recruit"
		btn.pressed.connect(func(): _on_recruit_pressed(merc.id))
		
		hbox.add_child(info)
		hbox.add_child(btn)
		merc_list.add_child(hbox)

func _on_recruit_pressed(merc_id):
	status_label.text = "Processing recruitment..."
	ServerConnector.recruit(GameState.current_user.id, merc_id)

func _on_exit_pressed():
	ServerConnector.exit_tavern(GameState.current_user.id)

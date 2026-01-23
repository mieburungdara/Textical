class_name QuestTracker
extends Control

@onready var list: VBoxContainer = $VBox/List

func _process(_delta):
	# Simple auto-update for prototype
	# In production, use signals for efficiency
	_update_tracker()

func _update_tracker():
	for child in list.get_children():
		child.queue_free()
		
	for quest in GlobalGameManager.active_quests:
		var lbl = Label.new()
		var status = "[DONE]" if quest.is_completed else "[%d/%d]" % [quest.current_amount, quest.target_amount]
		lbl.text = "%s: %s" % [quest.title, status]
		
		if quest.is_completed:
			lbl.add_theme_color_override("font_color", Color.LIME_GREEN)
		
		list.add_child(lbl)

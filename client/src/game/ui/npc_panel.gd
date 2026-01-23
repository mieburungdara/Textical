class_name NPCPanel
extends Control

signal quest_accepted(quest: QuestData)

@onready var name_label: Label = $Panel/VBox/Name
@onready var message_label: Label = $Panel/VBox/Message
@onready var action_button: Button = $Panel/VBox/AcceptButton

var current_npc: NPCData

func setup(npc: NPCData):
	current_npc = npc
	name_label.text = npc.name
	message_label.text = npc.welcome_message
	
	if npc.offered_quest:
		action_button.text = "ACCEPT QUEST: " + npc.offered_quest.title
		action_button.visible = true
	else:
		action_button.visible = false
	
	visible = true

func _on_accept_pressed():
	if current_npc.offered_quest:
		quest_accepted.emit(current_npc.offered_quest)
		message_label.text = "Excellent. Return to me when the task is done."
		action_button.disabled = true

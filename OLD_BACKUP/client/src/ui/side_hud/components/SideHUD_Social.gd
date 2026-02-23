extends Control

## SideHUD_Social - SRP Component
## Manages online friends display.

@onready var friends_list = %FriendsList

func _ready():
	GameState.friends_updated.connect(func(_f): _update_friends_display())
	_update_friends_display()

func update_display():
	_update_friends_display()

func _update_friends_display():
	if not friends_list: return
	for child in friends_list.get_children():
		child.queue_free()
		
	var friends = GameState.get_online_friends()
	for friend in friends:
		var hbox = HBoxContainer.new()
		var status_dot = Label.new()
		status_dot.text = "•"
		status_dot.modulate = Color.GREEN if friend.status == "online" else Color.YELLOW
		hbox.add_child(status_dot)
		
		var name_lbl = Label.new()
		name_lbl.text = friend.name
		name_lbl.add_theme_font_size_override("font_size", 9)
		hbox.add_child(name_lbl)
		friends_list.add_child(hbox)

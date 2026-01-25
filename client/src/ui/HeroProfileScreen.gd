extends Control

@onready var name_label = $VBoxContainer/HeroName
@onready var stats_label = $VBoxContainer/StatsLabel
@onready var traits_list = $VBoxContainer/TraitsList
@onready var back_btn = $VBoxContainer/BackButton

func _ready():
	back_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://src/ui/TownScreen.tscn"))
	ServerConnector.request_completed.connect(_on_request_completed)
	
	if GameState.selected_hero_id != -1:
		ServerConnector.fetch_hero_profile(GameState.selected_hero_id)

func _on_request_completed(endpoint, data):
	if "hero/" in endpoint and endpoint.contains("/profile"):
		_display_profile(data)

func _display_profile(profile):
	name_label.text = profile.name
	var stats_text = "STATS:\n"
	for key in profile.totalStats: stats_text += "- %s: %d\n" % [key.to_upper(), profile.totalStats[key]]
	stats_label.text = stats_text
	for child in traits_list.get_children(): child.queue_free()
	for t in profile.activeTraits:
		var l = Label.new()
		l.text = "• %s" % (t.name if t is Dictionary else t)
		traits_list.add_child(l)

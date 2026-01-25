extends Control

@onready var name_label = $Panel/VBoxContainer/HeroName
@onready var stats_label = $Panel/VBoxContainer/StatsLabel
@onready var traits_list = $Panel/VBoxContainer/TraitsList
@onready var close_btn = $Panel/VBoxContainer/CloseButton

func _ready():
    close_btn.pressed.connect(func(): hide())
    ServerConnector.request_completed.connect(_on_request_completed)

func show_hero(hero_id: int):
    show()
    name_label.text = "Loading Hero..."
    stats_label.text = ""
    for child in traits_list.get_children():
        child.queue_free()
    ServerConnector.fetch_hero_profile(hero_id)

func _on_request_completed(endpoint, data):
    if "hero/" in endpoint and endpoint.contains("/profile"):
        _display_profile(data)

func _display_profile(profile):
    name_label.text = profile.name
    
    # Stats
    var stats_text = "COMBAT STATS:\n"
    for key in profile.totalStats:
        stats_text += "- %s: %d\n" % [key.to_upper(), profile.totalStats[key]]
    stats_label.text = stats_text
    
    # Traits
    for t in profile.activeTraits:
        var l = Label.new()
        if t is Dictionary:
            l.text = "• %s (%s)" % [t.name, t.sourceSlot]
        else:
            l.text = "• %s (Hero)" % t
        traits_list.add_child(l)

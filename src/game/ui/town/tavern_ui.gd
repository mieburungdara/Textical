class_name TavernUI
extends Control

## UI for recruiting new heroes.

@onready var hero_list: VBoxContainer = $Panel/VBox/Scroll/List
@onready var gold_label: Label = $Panel/GoldLabel
@onready var card_container: CenterContainer = $Panel/CardContainer

var recruitment_cost = 100

func _ready():
	_update_gold_display()
	_generate_candidates()

func _update_gold_display():
	gold_label.text = "Your Gold: %d" % GlobalGameManager.gold

func _generate_candidates():
	# For prototype, we always offer 3 Novices
	for i in range(3):
		var novice = load("res://data/units/heroes/Novice.tres").duplicate()
		novice.name = ["Robin", "Cinder", "Kael", "Luna", "Bane"].pick_random() + " " + str(i+1)
		_add_candidate_entry(novice)

func _add_candidate_entry(data: HeroData):
	var btn = Button.new()
	btn.text = "Hire %s (%d Gold)" % [data.name, recruitment_cost]
	btn.custom_minimum_size = Vector2(0, 50)
	
	btn.pressed.connect(_on_hire_pressed.bind(data, btn))
	btn.mouse_entered.connect(func(): _show_preview(data))
	
	hero_list.add_child(btn)

func _show_preview(data: HeroData):
	for child in card_container.get_children():
		child.queue_free()
	
	var card = preload("res://src/game/ui/cards/HeroCard.tscn").instantiate()
	card_container.add_child(card)
	card.setup(data)

func _on_hire_pressed(data: HeroData, btn: Button):
	if GlobalGameManager.gold >= recruitment_cost:
		GlobalGameManager.gold -= recruitment_cost
		GlobalGameManager.owned_heroes.append(data)
		_update_gold_display()
		btn.disabled = true
		btn.text = "HIRED"
		SaveManager.save_game()
	else:
		print("Not enough gold!")

func _on_back_pressed():
	get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

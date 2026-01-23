class_name TavernUI
extends Control

## UI for recruiting new heroes with Rarity based on Fame.
## Recruited heroes go directly into the 5x10 party grid.

@onready var hero_list: VBoxContainer = $Panel/VBox/Scroll/List
@onready var gold_label: Label = $Panel/GoldLabel
@onready var card_container: CenterContainer = $Panel/CardContainer

var recruitment_cost = 100

func _ready():
	_update_gold_display()
	_generate_candidates()

func _update_gold_display():
	gold_label.text = "Your Gold: %d | Fame: %d" % [GlobalGameManager.gold, GlobalGameManager.fame_score]

func _generate_candidates():
	for i in range(3):
		var novice = load("res://data/units/heroes/Novice.tres").duplicate()
		novice.name = ["Robin", "Cinder", "Kael", "Luna", "Bane"].pick_random() + " " + str(i+1)
		var rolled_rarity = _roll_rarity(GlobalGameManager.fame_score)
		novice.generate_random_stats(rolled_rarity)
		_add_candidate_entry(novice)

func _roll_rarity(fame: int) -> int:
	var roll = randf()
	var legendary_chance = clamp(fame * 0.0005, 0.0, 0.05)
	var epic_chance = clamp(fame * 0.001, 0.0, 0.15)
	var rare_chance = clamp(0.05 + (fame * 0.002), 0.05, 0.3)
	var uncommon_chance = clamp(0.15 + (fame * 0.002), 0.15, 0.4)
	if roll < legendary_chance: return HeroData.Rarity.LEGENDARY
	if roll < legendary_chance + epic_chance: return HeroData.Rarity.EPIC
	if roll < legendary_chance + epic_chance + rare_chance: return HeroData.Rarity.RARE
	if roll < legendary_chance + epic_chance + rare_chance + uncommon_chance: return HeroData.Rarity.UNCOMMON
	return HeroData.Rarity.NORMAL

func _add_candidate_entry(data: HeroData):
	var btn = Button.new()
	var rarity_name = HeroData.Rarity.keys()[data.rarity]
	btn.text = "[%s] %s (%d Gold)" % [rarity_name, data.name, recruitment_cost]
	btn.custom_minimum_size = Vector2(0, 50)
	btn.add_theme_color_override("font_color", data.get_rarity_color())
	btn.pressed.connect(_on_hire_pressed.bind(data, btn))
	btn.mouse_entered.connect(func(): _show_preview(data))
	hero_list.add_child(btn)

func _show_preview(data: HeroData):
	for child in card_container.get_children(): child.queue_free()
	var card = preload("res://src/game/ui/cards/HeroCard.tscn").instantiate()
	card_container.add_child(card)
	card.setup(data)

func _on_hire_pressed(data: HeroData, btn: Button):
	if GlobalGameManager.gold >= recruitment_cost:
		# 1. Attempt to add to grid
		if _add_to_first_empty_slot(data):
			GlobalGameManager.gold -= recruitment_cost
			_update_gold_display()
			btn.disabled = true; btn.text = "HIRED"
			SaveManager.save_game()
		else:
			print("No space in party formation (Max 50)!")
	else:
		print("Not enough gold!")

func _add_to_first_empty_slot(hero: HeroData) -> bool:
	# Search the 5x10 grid (x: 1..5, y: 0..9)
	for y in range(10):
		for x in range(1, 6):
			var pos = Vector2i(x, y)
			if not GlobalGameManager.player_party.has(pos):
				GlobalGameManager.player_party[pos] = hero
				return true
	return false

func _on_back_pressed():
	get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

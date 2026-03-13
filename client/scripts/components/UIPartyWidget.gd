extends HBoxContainer
class_name UIPartyWidget

## Party Widget
## Shows hero status cards with HP bars

# UI Elements
var heroes_container: HBoxContainer

# Data
var _heroes: Array = []
var _hero_cards: Array = []  # Track created cards

# Signals
signal hero_clicked(hero_index: int)
signal hero_selected(hero_index: int)

const MAX_VISIBLE := 5
const CARD_WIDTH := 120
const CARD_HEIGHT := 80

func _ready() -> void:
	_setup_widget()

func _setup_widget() -> void:
	add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
	custom_minimum_size = Vector2(CARD_WIDTH * MAX_VISIBLE + GameTheme.SPACING_SMALL * (MAX_VISIBLE - 1), CARD_HEIGHT)
	
	heroes_container = HBoxContainer.new()
	heroes_container.add_theme_constant_override("separation", GameTheme.SPACING_SMALL)
	add_child(heroes_container)

## Load heroes from GameManager
func refresh_from_game_manager() -> void:
	var gm = get_tree().root.get_node("GameManager")
	if gm == null:
		return
	
	load_heroes(gm.heroes)

func load_heroes(heroes: Array) -> void:
	_heroes = heroes
	_clear_cards()
	
	# Show up to MAX_VISIBLE heroes
	var count = min(heroes.size(), MAX_VISIBLE)
	for i in range(count):
		var hero = heroes[i]
		var card = _create_hero_card(hero, i)
		heroes_container.add_child(card)
		_hero_cards.append(card)
	
	# Show count if more heroes
	if heroes.size() > MAX_VISIBLE:
		var more_label = Label.new()
		more_label.text = "+%d more" % (heroes.size() - MAX_VISIBLE)
		more_label.add_theme_font_size_override("font_size", GameTheme.FONT_CAPTION)
		more_label.modulate = GameTheme.COLOR_TEXT_SECONDARY
		heroes_container.add_child(more_label)

func _clear_cards() -> void:
	for card in _hero_cards:
		card.queue_free()
	_hero_cards.clear()
	
	for child in heroes_container.get_children():
		child.queue_free()

func _create_hero_card(hero: Dictionary, index: int) -> Control:
	var card = UICard.new()
	card.custom_minimum_size = Vector2(CARD_WIDTH, CARD_HEIGHT)
	
	# Get hero info
	var name = hero.get("name", "Hero")
	var level = hero.get("level", 1)
	var hero_class = hero.get("class", "Novice")
	var hp = hero.get("hp", 100)
	var max_hp = hero.get("max_hp", 100)
	
	# Determine status
	var status = hero.get("status", "active")
	var status_color = _get_status_color(status)
	
	# Setup card
	card.setup({
		"title": name,
		"subtitle": "Lv.%d %s" % [level, hero_class],
		"content": "HP: %d/%d" % [hp, max_hp],
		"rarity": "common",
		"color": status_color
	})
	
	# Connect click
	card.card_clicked.connect(_on_hero_card_clicked.bind(index))
	
	return card

func _get_status_color(status: String) -> Color:
	match status:
		"active": return GameTheme.COLOR_SUCCESS
		"resting": return GameTheme.COLOR_WARNING
		"dead": return GameTheme.COLOR_DANGER
		_: return GameTheme.COLOR_TEXT_SECONDARY

func _on_hero_card_clicked(data: Dictionary) -> void:
	hero_clicked.emit()

## Update single hero
func update_hero(index: int, hero: Dictionary) -> void:
	if index >= _hero_cards.size():
		return
	
	var card = _hero_cards[index]
	var hp = hero.get("hp", 100)
	var max_hp = hero.get("max_hp", 100)
	var status = hero.get("status", "active")
	var status_color = _get_status_color(status)
	
	card.setup({
		"title": hero.get("name", "Hero"),
		"subtitle": "Lv.%d %s" % [hero.get("level", 1), hero.get("class", "Novice")],
		"content": "HP: %d/%d" % [hp, max_hp],
		"rarity": "common",
		"color": status_color
	})

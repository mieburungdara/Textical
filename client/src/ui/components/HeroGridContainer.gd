extends PanelContainer
class_name HeroGridContainer

## HeroGridContainer - Container untuk menampilkan grid hero
## Features: Dynamic hero loading, filtering, selection management

signal hero_selected(hero_data: Dictionary)
signal heroes_loaded(count: int)

# === NODE REFERENCES ===
@onready var header_container: HBoxContainer = $HeaderContainer
@onready var title_label: Label = $HeaderContainer/TitleLabel
@onready var count_label: Label = $HeaderContainer/CountLabel
@onready var scroll_container: ScrollContainer = $ScrollContainer
@onready var grid_container: GridContainer = $ScrollContainer/GridContainer
@onready var empty_label: Label = $EmptyLabel
@onready var loading_label: Label = $LoadingLabel

# === PRIVATE VARIABLES ===
var _hero_cards: Array = []
var _selected_hero_id: int = -1

func _ready():
	_setup_ui()
	_connect_signals()
	_load_heroes()

func _setup_ui():
	# Setup grid columns
	grid_container.columns = 4
	grid_container.custom_minimum_size = Vector2(400, 0)
	
	# Hide empty/loading states initially
	empty_label.visible = false
	loading_label.visible = false

func _connect_signals():
	# Connect to GameState signals if available
	if GameState:
		# Refresh when heroes are updated
		pass

# === PUBLIC METHODS ===

func refresh_heroes():
	_load_heroes()

func select_hero(hero_id: int):
	_selected_hero_id = hero_id
	_update_selection()

func clear_selection():
	_selected_hero_id = -1
	_update_selection()

# === PRIVATE METHODS ===

func _load_heroes():
	loading_label.visible = true
	grid_container.visible = false
	empty_label.visible = false
	
	var heroes = GameState.current_heroes if GameState else []
	
	# Clear existing cards
	for card in _hero_cards:
		card.queue_free()
	_hero_cards.clear()
	
	# Wait a frame for UI to update
	await get_tree().process_frame
	
	if heroes.is_empty():
		_show_empty_state()
		return
	
	# Create hero cards
	for hero in heroes:
		_create_hero_card(hero)
	
	_update_header_count(heroes.size())
	_select_default_hero()
	
	loading_label.visible = false
	grid_container.visible = true
	
	heroes_loaded.emit(_hero_cards.size())

func _create_hero_card(hero_data: Dictionary):
	var card = Button.new()
	card.set_script(load("res://src/ui/components/HeroCard.gd"))
	
	# Set up the card
	card.custom_minimum_size = Vector2(120, 160)
	card.set_hero_data(hero_data)
	
	# Connect signals
	card.hero_selected.connect(_on_hero_card_selected.bind(hero_data))
	
	grid_container.add_child(card)
	_hero_cards.append(card)

func _on_hero_card_selected(hero_data: Dictionary):
	_selected_hero_id = hero_data.get("id", -1)
	_update_selection()
	hero_selected.emit(hero_data)

func _update_selection():
	for card in _hero_cards:
		var is_selected = card.hero_data.get("id", -1) == _selected_hero_id if card.has_method("set_selected") else false
		if card.has_method("set_selected"):
			card.set_selected(is_selected)

func _select_default_hero():
	if _selected_hero_id == -1 and not _hero_cards.is_empty():
		var first_hero = _hero_cards[0].hero_data if _hero_cards[0].has_method("set_hero_data") else {}
		if not first_hero.is_empty():
			_selected_hero_id = first_hero.get("id", -1)
			_update_selection()

func _show_empty_state():
	loading_label.visible = false
	grid_container.visible = false
	empty_label.visible = true
	empty_label.text = "No heroes found.\nRecruit heroes from the Tavern!"
	_update_header_count(0)

func _update_header_count(count: int):
	if count == 0:
		count_label.text = ""
	else:
		count_label.text = "[%d]" % count

# === FILTERING METHODS (optional) ===

func filter_by_rarity(rarity: String):
	for card in _hero_cards:
		if card.has_method("set_hero_data"):
			var card_rarity = card.hero_data.get("rarity", "COMMON")
			card.visible = (rarity == "ALL" or card_rarity == rarity)
	
	var visible_count = 0
	for card in _hero_cards:
		if card.visible:
			visible_count += 1
	_update_header_count(visible_count)

func filter_by_class(hero_class: String):
	for card in _hero_cards:
		if card.has_method("set_hero_data"):
			var combat_class = card.hero_data.get("combatClass", {})
			var hero_class_name = ""
			if combat_class is Dictionary:
				hero_class_name = combat_class.get("name", "")
			elif combat_class is String:
				hero_class_name = combat_class
			
			card.visible = (hero_class == "ALL" or hero_class_name == hero_class)
	
	var visible_count = 0
	for card in _hero_cards:
		if card.visible:
			visible_count += 1
	_update_header_count(visible_count)

func show_all():
	for card in _hero_cards:
		card.visible = true
	_update_header_count(_hero_cards.size())

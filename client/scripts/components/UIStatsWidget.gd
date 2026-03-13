extends HBoxContainer
class_name UIStatsWidget

## Stats Display Widget
## Shows quick stats: Gold, EXP, Power, Day

# UI Elements
var gold_label: Label
var exp_label: Label
var power_label: Label
var day_label: Label

# Data
var _gold: int = 0
var _exp: int = 0
var _power: int = 0
var _day: int = 1

# Size
const LABEL_WIDTH := 100

func _ready() -> void:
	_setup_widget()

func _setup_widget() -> void:
	add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	
	# Gold
	gold_label = _create_stat_label("💰", "Gold: 0")
	gold_label.custom_minimum_size = Vector2(LABEL_WIDTH, 0)
	add_child(gold_label)
	
	# Separator
	add_child(_create_separator())
	
	# EXP
	exp_label = _create_stat_label("✨", "EXP: 0")
	exp_label.custom_minimum_size = Vector2(LABEL_WIDTH, 0)
	add_child(exp_label)
	
	# Separator
	add_child(_create_separator())
	
	# Power
	power_label = _create_stat_label("⚔️", "Power: 0")
	power_label.custom_minimum_size = Vector2(LABEL_WIDTH, 0)
	add_child(power_label)
	
	# Separator
	add_child(_create_separator())
	
	# Day
	day_label = _create_stat_label("📅", "Day: 1")
	day_label.custom_minimum_size = Vector2(LABEL_WIDTH, 0)
	add_child(day_label)

func _create_stat_label(icon: String, text: String) -> Label:
	var label = Label.new()
	label.text = icon + " " + text
	label.add_theme_font_size_override("font_size", Theme.FONT_BODY)
	label.modulate = Theme.COLOR_TEXT_PRIMARY
	return label

func _create_separator() -> VSeparator:
	var sep = VSeparator.new()
	sep.modulate = Theme.COLOR_SURFACE_LIGHT
	return sep

## Update methods
func update_gold(amount: int) -> void:
	_gold = amount
	if gold_label:
		gold_label.text = "💰 Gold: %,d" % amount

func update_exp(amount: int) -> void:
	_exp = amount
	if exp_label:
		exp_label.text = "✨ EXP: %,d" % amount

func update_power(amount: int) -> void:
	_power = amount
	if power_label:
		power_label.text = "⚔️ Power: %,d" % amount

func update_day(day: int) -> void:
	_day = day
	if day_label:
		day_label.text = "📅 Day: %d" % day

## Update all from GameManager
func refresh_from_game_manager() -> void:
	var gm = Theme.get_game_manager()
	if gm == null:
		return
	
	update_gold(gm.gold)
	update_power(_calculate_total_power())
	# Day would come from game state

func _calculate_total_power() -> int:
	var gm = Theme.get_game_manager()
	if gm == null:
		return 0
	
	var total := 0
	for hero in gm.heroes:
		# Calculate power from stats
		var attack = hero.get("attack", 0)
		var defense = hero.get("defense", 0)
		var magic = hero.get("magic", 0)
		var level = hero.get("level", 1)
		
		# Power formula: (attack + defense + magic) * level
		var hero_power = (attack + defense + magic) * level
		total += hero_power
	
	return total

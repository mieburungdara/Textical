extends VBoxContainer
class_name UIQuestTracker

## Quest Tracker Widget
## Shows active quest progress

# UI Elements
var header_label: Label
var quests_container: VBoxContainer
var empty_label: Label

# Data
var _active_quests: Array = []
var _quest_items: Array = []

const MAX_VISIBLE := 3
const ITEM_HEIGHT := 50

signal quest_clicked(quest_id: String)
signal quest_selected(quest_id: String)

func _ready() -> void:
	_setup_widget()

func _setup_widget() -> void:
	add_theme_constant_override("separation", Theme.SPACING_SMALL)
	custom_minimum_size = Vector2(200, ITEM_HEIGHT * MAX_VISIBLE + Theme.SPACING_LARGE)
	
	# Header
	header_label = Label.new()
	header_label.text = "📜 Active Quests (0)"
	header_label.add_theme_font_size_override("font_size", Theme.FONT_BODY)
	header_label.modulate = Theme.COLOR_ACCENT
	add_child(header_label)
	
	# Separator
	var sep = HSeparator.new()
	sep.modulate = Theme.COLOR_SURFACE_LIGHT
	add_child(sep)
	
	# Quests container
	quests_container = VBoxContainer.new()
	quests_container.add_theme_constant_override("separation", Theme.SPACING_TINY)
	add_child(quests_container)
	
	# Empty state
	empty_label = Label.new()
	empty_label.text = "No active quests"
	empty_label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	empty_label.modulate = Theme.COLOR_TEXT_SECONDARY
	empty_label.visible = false
	quests_container.add_child(empty_label)

## Load quests from GameManager
func refresh_from_game_manager() -> void:
	var gm = Theme.get_game_manager()
	if gm == null:
		# Use sample quests for demo
		load_quests(_get_sample_quests())
		return
	
	# GameManager.active_quests is int (count), not array
	# For now, use sample quests or placeholder
	# TODO: Add quest_list array to GameManager
	load_quests(_get_sample_quests())

## Sample quests for demo purposes
func _get_sample_quests() -> Array:
	return [
		{
			"id": "quest_slime",
			"title": "Slime Problem",
			"difficulty": "easy",
			"progress": 3,
			"target": 5
		},
		{
			"id": "quest_goblin",
			"title": "Goblin Raid",
			"difficulty": "medium",
			"progress": 7,
			"target": 10
		}
	]

func load_quests(quests: Array) -> void:
	_active_quests = quests
	_clear_quests()
	
	if quests.is_empty():
		empty_label.visible = true
		header_label.text = "📜 Active Quests (0)"
		return
	
	empty_label.visible = false
	header_label.text = "📜 Active Quests (%d)" % quests.size()
	
	# Show up to MAX_VISIBLE
	var count = min(quests.size(), MAX_VISIBLE)
	for i in range(count):
		var quest = quests[i]
		var item = _create_quest_item(quest)
		quests_container.add_child(item)
		_quest_items.append(item)
	
	# Show count if more quests
	if quests.size() > MAX_VISIBLE:
		var more_label = Label.new()
		more_label.text = "+%d more" % (quests.size() - MAX_VISIBLE)
		more_label.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
		more_label.modulate = Theme.COLOR_TEXT_SECONDARY
		quests_container.add_child(more_label)

func _clear_quests() -> void:
	for item in _quest_items:
		item.queue_free()
	_quest_items.clear()
	
	for child in quests_container.get_children():
		if child != empty_label:
			child.queue_free()

func _create_quest_item(quest: Dictionary) -> Control:
	var container = PanelContainer.new()
	container.custom_minimum_size = Vector2(0, ITEM_HEIGHT)
	container.mouse_filter = Control.MOUSE_FILTER_STOP
	
	# Style based on difficulty
	var difficulty = quest.get("difficulty", "easy")
	var rarity = _difficulty_to_rarity(difficulty)
	var rarity_color = Theme.get_rarity_color(rarity)
	
	var style = StyleBoxFlat.new()
	style.bg_color = Theme.darken(rarity_color, 0.6)
	style.set_corner_radius_all(Theme.RADIUS_SMALL)
	container.add_theme_stylebox_override("panel", style)
	
	# Content
	var vbox = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 2)
	container.add_child(vbox)
	
	# Title
	var title = Label.new()
	title.text = "🎯 " + quest.get("title", "Unknown Quest")
	title.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	title.modulate = rarity_color
	title.text_overrun_behavior = TextServer.OVERRUN_TRIM_CHAR
	vbox.add_child(title)
	
	# Progress
	var current = quest.get("progress", 0)
	var target = quest.get("target", 10)
	var progress_text = "%d/%d" % [current, target]
	
	var progress = Label.new()
	progress.text = progress_text
	progress.add_theme_font_size_override("font_size", Theme.FONT_CAPTION)
	progress.modulate = Theme.COLOR_TEXT_SECONDARY
	vbox.add_child(progress)
	
	# Progress bar
	var bar = UIHPBar.new()
	bar.custom_minimum_size = Vector2(0, 8)
	bar.setup(current, target, rarity_color, "")
	vbox.add_child(bar)
	
	# Connect click
	container.gui_input.connect(_on_quest_input.bind(quest.get("id", "")))
	
	return container

func _difficulty_to_rarity(difficulty: String) -> String:
	match difficulty.to_lower():
		"easy": return "common"
		"medium": return "uncommon"
		"hard": return "rare"
		_: return "common"

func _on_quest_input(event: InputEvent, quest_id: String) -> void:
	if event is InputEventMouseButton:
		var mouse = event as InputEventMouseButton
		if mouse.button_index == MOUSE_BUTTON_LEFT and mouse.pressed:
			quest_clicked.emit(quest_id)

## Add single quest
func add_quest(quest: Dictionary) -> void:
	_active_quests.append(quest)
	load_quests(_active_quests)

## Update quest progress
func update_quest_progress(quest_id: String, progress: int) -> void:
	for quest in _active_quests:
		if quest.get("id", "") == quest_id:
			quest["progress"] = progress
			load_quests(_active_quests)
			return

## Remove completed quest
func remove_quest(quest_id: String) -> void:
	_active_quests = _active_quests.filter(func(q): return q.get("id", "") != quest_id)
	load_quests(_active_quests)

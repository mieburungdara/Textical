extends Control

## Codex_Achievements - Enhanced Achievement System UI
## Displays achievements with categories, progress tracking, and reward claiming.

@onready var achievement_list = %AchievementList
@onready var category_tabs = %CategoryTabs
@onready var progress_label = %ProgressLabel
@onready var claim_button = %ClaimButton

# Data
var achievements_data: Dictionary = {}
var current_category: String = "ALL"
var selected_achievement: Dictionary = {}

# Categories
const CATEGORIES = ["ALL", "COMBAT", "COLLECTION", "ECONOMY", "CRAFTING", "PVP", "EXPLORATION", "SOCIAL", "SPECIAL"]
const CATEGORY_ICONS = {
	"ALL": "📋",
	"COMBAT": "⚔️",
	"COLLECTION": "📦",
	"ECONOMY": "💰",
	"CRAFTING": "🔨",
	"PVP": "⚡",
	"EXPLORATION": "🗺️",
	"SOCIAL": "👥",
	"SPECIAL": "⭐"
}

func setup_as_overlay(_data: Dictionary = {}):
	var parent = get_parent()
	if parent is TabContainer:
		if has_node("Background"): $Background.visible = false
		if has_node("MarginContainer/VBoxContainer/Header"): 
			$MarginContainer/VBoxContainer/Header.visible = false
		if has_node("MarginContainer"):
			$MarginContainer.offset_left = 0
			$MarginContainer.offset_right = 0
			$MarginContainer.offset_top = 0
			$MarginContainer.offset_bottom = 0
	else:
		if has_node("MarginContainer"):
			$MarginContainer.offset_left = 160
			$MarginContainer.offset_right = -40
			$MarginContainer.offset_top = 40
			$MarginContainer.offset_bottom = -40

func _ready():
	ServerConnector.request_completed.connect(_on_request_completed)
	_setup_category_tabs()
	refresh()

func _setup_category_tabs():
	if not category_tabs: return
	
	for cat in CATEGORIES:
		var btn = Button.new()
		btn.text = CATEGORY_ICONS.get(cat, "📋") + " " + cat
		btn.pressed.connect(_on_category_selected.bind(cat))
		btn.name = cat
		category_tabs.add_child(btn)

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_achievements(GameState.current_user.id)

func _on_category_selected(category: String):
	current_category = category
	_populate_achievements(achievements_data)

func _on_request_completed(endpoint: String, response):
	if endpoint.contains("/achievements"):
		var data = response.get("data", response) if response is Dictionary else response
		if data is Dictionary:
			achievements_data = data
			_update_progress_display()
			_populate_achievements(data)

func _update_progress_display():
	if progress_label:
		var total = achievements_data.get("totalAchievements", 0)
		var completed = achievements_data.get("totalProgress", 0)
		progress_label.text = "Progress: %d / %d (%.1f%%)" % [completed, total, (float(completed)/float(total)*100.0) if total > 0 else 0]

func _populate_achievements(data: Dictionary):
	if not achievement_list: return
	for child in achievement_list.get_children(): child.queue_free()
	
	var completed = data.get("completed", [])
	var in_progress = data.get("inProgress", [])
	var locked = data.get("locked", [])
	
	var filtered_achievements = []
	
	# Filter by category
	for ach in completed:
		if _should_show_achievement(ach):
			filtered_achievements.append(ach)
	for ach in in_progress:
		if _should_show_achievement(ach):
			filtered_achievements.append(ach)
	for ach in locked:
		if _should_show_achievement(ach):
			filtered_achievements.append(ach)
	
	if filtered_achievements.is_empty():
		var lbl = Label.new()
		lbl.text = "No achievements in this category."
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		achievement_list.add_child(lbl)
		return
	
	for ach in filtered_achievements:
		var card = _create_achievement_card(ach)
		achievement_list.add_child(card)

func _should_show_achievement(ach: Dictionary) -> bool:
	if current_category == "ALL": return true
	return ach.get("category", "") == current_category

func _create_achievement_card(ach: Dictionary) -> Control:
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.12, 0.1, 0.08, 0.9)
	
	# Border color based on status
	var is_completed = ach.has("completedAt") and ach.get("completedAt") != null
	var is_in_progress = ach.has("currentValue") and ach.get("currentValue", 0) > 0
	var is_locked = ach.has("minLevel") or ach.has("requirement")
	
	if is_completed:
		style.border_width_left = 4
		style.border_color = Color(0.4, 0.8, 0.4) # Green for completed
	elif is_in_progress:
		style.border_width_left = 4
		style.border_color = Color(0.4, 0.6, 0.9) # Blue for in progress
	else:
		style.border_width_left = 2
		style.border_color = Color(0.3, 0.3, 0.3) # Gray for locked
	
	style.content_margin_left = 15
	style.content_margin_right = 15
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	style.corner_radius_top_right = 6
	style.corner_radius_bottom_right = 6
	panel.add_theme_stylebox_override("panel", style)
	
	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 15)
	
	# Icon
	var icon_lbl = Label.new()
	icon_lbl.text = ach.get("icon", "🏆")
	icon_lbl.add_theme_font_size_override("font_size", 24)
	
	# Content
	var vbox = VBoxContainer.new()
	vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var name_lbl = Label.new()
	name_lbl.text = ach.get("name", "Unknown Achievement").to_upper()
	name_lbl.add_theme_font_size_override("font_size", 16)
	name_lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.8))
	
	var desc_lbl = Label.new()
	desc_lbl.text = ach.get("description", "No details.")
	desc_lbl.add_theme_font_size_override("font_size", 12)
	desc_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
	
	vbox.add_child(name_lbl)
	vbox.add_child(desc_lbl)
	
	# Progress bar for in-progress achievements
	if is_in_progress and not is_completed:
		var progress_bar = ProgressBar.new()
		progress_bar.custom_minimum_size.y = 8
		var current = ach.get("currentValue", 0)
		var target = ach.get("targetValue", 1)
		progress_bar.max_value = target
		progress_bar.value = current
		progress_bar.show_percentage = false
		
		var bar_style = StyleBoxFlat.new()
		bar_style.bg_color = Color(0.2, 0.2, 0.2)
		progress_bar.add_theme_stylebox_override("background", bar_style)
		
		var fill_style = StyleBoxFlat.new()
		fill_style.bg_color = Color(0.3, 0.5, 0.9)
		progress_bar.add_theme_stylebox_override("fill", fill_style)
		
		var progress_lbl = Label.new()
		progress_lbl.text = "%d / %d (%.0f%%)" % [current, target, (float(current)/float(target)*100.0)]
		progress_lbl.add_theme_font_size_override("font_size", 10)
		progress_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		
		vbox.add_child(progress_bar)
		vbox.add_child(progress_lbl)
	
	# Status and action buttons
	var status_vbox = VBoxContainer.new()
	status_vbox.alignment = BoxContainer.ALIGNMENT_END
	
	if is_completed:
		var status_lbl = Label.new()
		if ach.get("rewardsClaimed", false):
			status_lbl.text = "✓ COMPLETED"
			status_lbl.add_theme_color_override("font_color", Color(0.4, 0.8, 0.4))
		else:
			status_lbl.text = "REWARD READY!"
			status_lbl.add_theme_color_override("font_color", Color(1, 0.8, 0.2))
		status_lbl.add_theme_font_size_override("font_size", 12)
		status_vbox.add_child(status_lbl)
		
		# Claim button if rewards not claimed
		if not ach.get("rewardsClaimed", false):
			var claim_btn = Button.new()
			claim_btn.text = "Claim"
			claim_btn.pressed.connect(_on_claim_pressed.bind(ach))
			status_vbox.add_child(claim_btn)
	elif is_locked:
		var status_lbl = Label.new()
		status_lbl.text = "🔒 LOCKED"
		status_lbl.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5))
		status_lbl.add_theme_font_size_override("font_size", 12)
		status_vbox.add_child(status_lbl)
		
		# Show requirements
		if ach.has("minLevel"):
			var req_lbl = Label.new()
			req_lbl.text = "Req. Level: %d" % ach["minLevel"]
			req_lbl.add_theme_font_size_override("font_size", 10)
			status_vbox.add_child(req_lbl)
	
	hbox.add_child(icon_lbl)
	hbox.add_child(vbox)
	hbox.add_child(status_vbox)
	
	panel.add_child(hbox)
	
	# Click to select
	panel.gui_input.connect(_on_card_input.bind(ach, panel))
	
	return panel

func _on_card_input(event: InputEvent, ach: Dictionary, panel: Control):
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		selected_achievement = ach

func _on_claim_pressed(ach: Dictionary):
	if GameState.current_user:
		var code = ach.get("code", "")
		if code:
			ServerConnector.claim_achievement_reward(GameState.current_user.id, code)

# Signal handlers for achievement events
func _on_achievement_unlocked(achievement_data: Dictionary):
	# Show celebration popup
	_show_celebration(achievement_data)

func _show_celebration(data: Dictionary):
	# This would show a celebration animation
	print("[ACHIEVEMENT] Unlocked: ", data.get("name", "Unknown"))

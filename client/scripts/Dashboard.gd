extends Control
class_name Dashboard

## Dashboard Controller
## Main dashboard that orchestrates all widgets

# Widgets
var stats_widget: UIStatsWidget
var party_widget: UIPartyWidget
var quest_tracker: UIQuestTracker
var notification_feed: UINotificationFeed
var quick_actions: UIQuickActions

# Layout containers
var main_container: VBoxContainer
var top_row: HBoxContainer
var middle_row: HBoxContainer
var bottom_row: HBoxContainer

# Data
var game_manager: Node = null
var is_visible: bool = true

# Signals
signal action_requested(action_id: String)

func _ready() -> void:
	# Get GameManager
	game_manager = Theme.get_game_manager()
	
	# Setup UI
	_setup_layout()
	_connect_signals()

func _setup_layout() -> void:
	# Main container
	main_container = VBoxContainer.new()
	main_container.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_container.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	main_container.position = Vector2(Theme.SPACING_MEDIUM, Theme.SPACING_MEDIUM)
	add_child(main_container)
	
	# Top row - Stats
	top_row = HBoxContainer.new()
	top_row.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	main_container.add_child(top_row)
	
	stats_widget = UIStatsWidget.new()
	top_row.add_child(stats_widget)
	
	# Middle row - Party + Quests
	middle_row = HBoxContainer.new()
	middle_row.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	main_container.add_child(middle_row)
	
	party_widget = UIPartyWidget.new()
	middle_row.add_child(party_widget)
	
	quest_tracker = UIQuestTracker.new()
	middle_row.add_child(quest_tracker)
	
	# Bottom row - Quick Actions + Notifications
	bottom_row = HBoxContainer.new()
	bottom_row.add_theme_constant_override("separation", Theme.SPACING_MEDIUM)
	main_container.add_child(bottom_row)
	
	quick_actions = UIQuickActions.new()
	bottom_row.add_child(quick_actions)
	
	notification_feed = UINotificationFeed.new()
	bottom_row.add_child(notification_feed)

func _connect_signals() -> void:
	# Connect quick actions
	if quick_actions:
		quick_actions.action_triggered.connect(_on_action_triggered)

## Refresh all data from GameManager
func refresh() -> void:
	if stats_widget:
		stats_widget.refresh_from_game_manager()
	
	if party_widget:
		party_widget.refresh_from_game_manager()
	
	if quest_tracker:
		quest_tracker.refresh_from_game_manager()

## Show/Hide dashboard
func show_dashboard() -> void:
	visible = true
	is_visible = true
	refresh()

func hide_dashboard() -> void:
	visible = false
	is_visible = false

func toggle_dashboard() -> void:
	if is_visible:
		hide_dashboard()
	else:
		show_dashboard()

## Notification helpers
func notify_success(message: String) -> void:
	if notification_feed:
		notification_feed.notify_success(message)

func notify_warning(message: String) -> void:
	if notification_feed:
		notification_feed.notify_warning(message)

func notify_error(message: String) -> void:
	if notification_feed:
		notification_feed.notify_error(message)

func notify_quest(message: String) -> void:
	if notification_feed:
		notification_feed.notify_quest(message)

func notify_combat(message: String) -> void:
	if notification_feed:
		notification_feed.notify_combat(message)

## Update from external sources
func update_gold(amount: int) -> void:
	if stats_widget:
		stats_widget.update_gold(amount)

func update_exp(amount: int) -> void:
	if stats_widget:
		stats_widget.update_exp(amount)

func update_power(amount: int) -> void:
	if stats_widget:
		stats_widget.update_power(amount)

func update_day(day: int) -> void:
	if stats_widget:
		stats_widget.update_day(day)

func update_party() -> void:
	if party_widget:
		party_widget.refresh_from_game_manager()

func add_quest(quest: Dictionary) -> void:
	if quest_tracker:
		quest_tracker.add_quest(quest)

func update_quest_progress(quest_id: String, progress: int) -> void:
	if quest_tracker:
		quest_tracker.update_quest_progress(quest_id, progress)

func complete_quest(quest_id: String) -> void:
	if quest_tracker:
		quest_tracker.remove_quest(quest_id)
		notify_success("Quest completed!")

## Handle action requests
func _on_action_triggered(action_id: String) -> void:
	action_requested.emit(action_id)
	
	# Forward to GameScene
	var game_scene = get_tree().root.get_node_or_null("GameScene")
	if game_scene and game_scene.has_method("_on_dashboard_action"):
		game_scene._on_dashboard_action(action_id)

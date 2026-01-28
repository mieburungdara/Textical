extends Control

@onready var buy_list = $"MainContainer/WoodenBoard/VBox/TabContainer/BROWSE/Scroll/BuyList"
@onready var sell_list = $"MainContainer/WoodenBoard/VBox/TabContainer/YOUR PACK/Scroll/SellList"
@onready var status_label = $MainContainer/WoodenBoard/VBox/StatusLabel

# Filter Nodes
@onready var search_edit = $MainContainer/WoodenBoard/VBox/FilterBar/SearchEdit
@onready var category_filter = $MainContainer/WoodenBoard/VBox/FilterBar/CategoryFilter
@onready var sort_filter = $MainContainer/WoodenBoard/VBox/FilterBar/SortFilter

# Price Prompt Nodes
@onready var price_popup = $PricePopup
@onready var price_input = $PricePopup/Panel/VBox/PriceInput
@onready var confirm_btn = $PricePopup/Panel/VBox/HBox/ConfirmBtn
@onready var cancel_btn = $PricePopup/Panel/VBox/HBox/CancelBtn

var _pending_list_item_id: int = -1
var _raw_listings = []
var _raw_inventory = []

func _ready():
	ServerConnector.request_completed.connect(_on_request_completed)
	confirm_btn.pressed.connect(_on_price_confirmed)
	cancel_btn.pressed.connect(func(): price_popup.hide())
	
	# Setup Filter Callbacks
	search_edit.text_changed.connect(func(_t): _apply_filters())
	category_filter.item_selected.connect(func(_i): _apply_filters())
	sort_filter.item_selected.connect(func(_i): _apply_filters())
	
	_setup_filter_options()
	refresh()

func _setup_filter_options():
	category_filter.clear()
	category_filter.add_item("All Categories")
	category_filter.add_item("Equipment")
	category_filter.add_item("Resource")
	category_filter.add_item("Consumable")
	
	sort_filter.clear()
	sort_filter.add_item("Sort: Newest")       # Index 0
	sort_filter.add_item("Price: Low to High") # Index 1
	sort_filter.add_item("Price: High to Low") # Index 2
	sort_filter.add_item("Qty: Highest")       # Index 3

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_market_listings(GameState.current_user.id)
		ServerConnector.fetch_inventory(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if !is_inside_tree(): return
	if "market/listings" in endpoint:
		_raw_listings = data if data is Array else []
		_apply_filters()
	elif "inventory" in endpoint:
		if data is Dictionary and data.has("items"):
			_raw_inventory = data.items
			_apply_filters()
	elif "market/buy" in endpoint or "market/list" in endpoint or "market/sell-npc" in endpoint:
		status_label.text = "LEDGER UPDATED"
		GameState.inventory_is_dirty = true
		refresh()
		if GameState.current_user:
			ServerConnector.fetch_profile(GameState.current_user.id)

func _apply_filters():
	var search_text = search_edit.text.to_lower()
	var category_idx = category_filter.selected
	var sort_idx = sort_filter.selected
	
	# --- 1. PROCESS MARKET LISTINGS ---
	var filtered_listings = _raw_listings.filter(func(l):
		var match_name = search_text == "" or l.itemTemplate.name.to_lower().contains(search_text)
		var match_cat = category_idx <= 0 or l.itemTemplate.category == category_filter.get_item_text(category_idx).to_upper()
		return match_name and match_cat
	)
	
	# Apply Sorting
	match sort_idx:
		1: filtered_listings.sort_custom(func(a, b): return a.pricePerUnit < b.pricePerUnit)
		2: filtered_listings.sort_custom(func(a, b): return a.pricePerUnit > b.pricePerUnit)
		3: filtered_listings.sort_custom(func(a, b): return a.itemInstance.quantity > b.itemInstance.quantity)
	
	_populate_buy_list(filtered_listings)
	
	# --- 2. PROCESS INVENTORY ---
	var filtered_inv = _raw_inventory.filter(func(i):
		var match_name = search_text == "" or i.template.name.to_lower().contains(search_text)
		var match_cat = category_idx <= 0 or i.template.category == category_filter.get_item_text(category_idx).to_upper()
		return match_name and match_cat
	)
	
	# Inventory sorting (By Base Value if sorted by price)
	match sort_idx:
		1: filtered_inv.sort_custom(func(a, b): return a.template.baseValue < b.template.baseValue)
		2: filtered_inv.sort_custom(func(a, b): return a.template.baseValue > b.template.baseValue)
		3: filtered_inv.sort_custom(func(a, b): return a.quantity > b.quantity)
		
	_populate_sell_list(filtered_inv)

func _populate_buy_list(listings):
	for child in buy_list.get_children(): child.queue_free()
	if listings.size() == 0:
		_add_empty_label(buy_list, "No items match your criteria.")
		return

	for list in listings:
		var card = _create_minimalist_row(
			list.itemTemplate.name,
			list.itemTemplate.description,
			"STOCK: %d" % list.itemInstance.quantity,
			"%d G" % list.pricePerUnit,
			"BUY",
			func(): ServerConnector.buy_item(GameState.current_user.id, list.id)
		)
		buy_list.add_child(card)

func _populate_sell_list(items):
	for child in sell_list.get_children(): child.queue_free()
	if items.size() == 0:
		_add_empty_label(sell_list, "No items in pack.")
		return

	for item in items:
		var card = _create_minimalist_row(
			item.template.name,
			item.template.description,
			"QTY: %d" % item.quantity,
			"NPC: %d G" % item.template.baseValue,
			"LIST",
			func(): _on_list_pressed(item.id)
		)
		sell_list.add_child(card)

# --- MINIMALIST UI BUILDERS ---

func _create_minimalist_row(title, desc, qty, price, action_label, callback):
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.85, 0.8, 0.7, 0.9)
	style.border_width_bottom = 1
	style.border_color = Color(0.4, 0.3, 0.2, 0.3)
	style.content_margin_left = 15
	style.content_margin_right = 10
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	panel.add_theme_stylebox_override("panel", style)
	
	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 15)
	
	var main_vbox = VBoxContainer.new()
	main_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	main_vbox.add_theme_constant_override("separation", 0)
	
	var title_lbl = Label.new()
	title_lbl.text = title.to_upper()
	title_lbl.add_theme_font_size_override("font_size", 18)
	title_lbl.add_theme_color_override("font_color", Color(0.2, 0.1, 0))
	
	var desc_lbl = Label.new()
	desc_lbl.text = desc
	desc_lbl.add_theme_font_size_override("font_size", 12)
	desc_lbl.add_theme_color_override("font_color", Color(0.4, 0.3, 0.2))
	desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	
	main_vbox.add_child(title_lbl)
	main_vbox.add_child(desc_lbl)
	
	var stats_vbox = VBoxContainer.new()
	stats_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	
	var qty_lbl = Label.new()
	qty_lbl.text = qty
	qty_lbl.add_theme_font_size_override("font_size", 14)
	qty_lbl.add_theme_color_override("font_color", Color(0.3, 0.2, 0.1))
	qty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	
	var price_lbl = Label.new()
	price_lbl.text = price
	price_lbl.add_theme_font_size_override("font_size", 16)
	price_lbl.add_theme_color_override("font_color", Color(0.5, 0.3, 0))
	price_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	
	stats_vbox.add_child(qty_lbl)
	stats_vbox.add_child(price_lbl)
	
	var btn = Button.new()
	btn.text = action_label
	btn.custom_minimum_size = Vector2(90, 45)
	btn.pressed.connect(callback)
	
	hbox.add_child(main_vbox)
	hbox.add_child(stats_vbox)
	hbox.add_child(btn)
	panel.add_child(hbox)
	return panel

func _add_empty_label(parent, text):
	var l = Label.new()
	l.text = text
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.add_theme_font_size_override("font_size", 18)
	l.modulate = Color(0.5, 0.4, 0.3)
	parent.add_child(l)

func _on_list_pressed(item_id):
	_pending_list_item_id = item_id
	price_popup.show()
	price_input.value = 50 
	price_input.get_line_edit().grab_focus()

func _on_price_confirmed():
	var price = int(price_input.value)
	if GameState.current_user and _pending_list_item_id != -1:
		ServerConnector.list_item(GameState.current_user.id, _pending_list_item_id, price)
		price_popup.hide()
		status_label.text = "ITEM LISTED"
		_pending_list_item_id = -1
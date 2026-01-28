extends Control

@onready var buy_list = $MarginContainer/MainFrame/VBoxContainer/TabContainer/BROWSE/ScrollContainer/BuyList
@onready var sell_list = $MarginContainer/MainFrame/VBoxContainer/TabContainer/SELL/ScrollContainer/SellList
@onready var status_label = $MarginContainer/MainFrame/VBoxContainer/StatusLabel

# NEW: Price Prompt Nodes
@onready var price_popup = $PricePopup
@onready var price_input = $PricePopup/Panel/VBox/PriceInput
@onready var confirm_btn = $PricePopup/Panel/VBox/HBox/ConfirmBtn
@onready var cancel_btn = $PricePopup/Panel/VBox/HBox/CancelBtn

var _pending_list_item_id: int = -1

func _ready():
	ServerConnector.request_completed.connect(_on_request_completed)
	
	# Connect Price Popup Signals
	confirm_btn.pressed.connect(_on_price_confirmed)
	cancel_btn.pressed.connect(func(): price_popup.hide())
	
	refresh()

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_market_listings(GameState.current_user.id)
		ServerConnector.fetch_inventory(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if !is_inside_tree(): return
	if "market/listings" in endpoint:
		_populate_buy_list(data)
	elif "inventory" in endpoint:
		if data is Dictionary and data.has("items"):
			_populate_sell_list()
	elif "market/buy" in endpoint or "market/list" in endpoint or "market/sell-npc" in endpoint:
		status_label.text = "Transaction successful!"
		status_label.add_theme_color_override("font_color", Color.CYAN)
		GameState.inventory_is_dirty = true
		refresh()
		if GameState.current_user:
			ServerConnector.fetch_profile(GameState.current_user.id)

func _populate_buy_list(listings):
	for child in buy_list.get_children(): child.queue_free()
	
	if listings.size() == 0:
		var l = Label.new()
		l.text = "The stalls are empty today..."
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.modulate = Color(0.6, 0.6, 0.6)
		buy_list.add_child(l)
		return

	for list in listings:
		var rarity = list.itemTemplate.get("rarity", "COMMON")
		var card = _create_item_card(
			list.itemTemplate.name, 
			"Qty: %d" % list.itemInstance.quantity, 
			"%d Gold" % list.pricePerUnit,
			rarity,
			func(): 
				if GameState.current_user:
					ServerConnector.buy_item(GameState.current_user.id, list.id)
		)
		buy_list.add_child(card)

func _populate_sell_list():
	for child in sell_list.get_children(): child.queue_free()
	
	if GameState.inventory.size() == 0:
		var l = Label.new()
		l.text = "Your pack is empty."
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.modulate = Color(0.6, 0.6, 0.6)
		sell_list.add_child(l)
		return

	for item in GameState.inventory:
		var card = _create_sell_card(item)
		sell_list.add_child(card)

# --- UI COMPONENT BUILDERS ---

func _create_item_card(title, sub, price, rarity, callback):
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.15, 0.25, 0.5) 
	style.corner_radius_top_left = 15
	style.corner_radius_top_right = 15
	style.corner_radius_bottom_left = 15
	style.corner_radius_bottom_right = 15
	
	# RARITY COLORS
	var rarity_color = Color(0.4, 0.8, 1.0) # COMMON (CYAN)
	if rarity == "RARE": rarity_color = Color(1.0, 0.8, 0.2) # GOLD
	elif rarity == "EPIC": rarity_color = Color(0.8, 0.4, 1.0) # PURPLE
	elif rarity == "LEGENDARY": rarity_color = Color(1.0, 0.4, 0.2) # ORANGE
	
	style.border_width_left = 6
	style.border_color = rarity_color
	style.content_margin_left = 15
	style.content_margin_right = 15
	style.content_margin_top = 15
	style.content_margin_bottom = 15
	panel.add_theme_stylebox_override("panel", style)
	
	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 20)
	
	var info_vbox = VBoxContainer.new()
	info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var name_lbl = Label.new()
	name_lbl.text = title.to_upper()
	name_lbl.add_theme_font_size_override("font_size", 24)
	name_lbl.add_theme_color_override("font_color", rarity_color)
	
	var details_lbl = Label.new()
	details_lbl.text = sub + " • " + price
	details_lbl.modulate = Color(0.8, 0.8, 0.8)
	
	info_vbox.add_child(name_lbl)
	info_vbox.add_child(details_lbl)
	
	var btn = Button.new()
	btn.text = "BUY"
	btn.custom_minimum_size = Vector2(130, 65)
	
	var btn_style = StyleBoxFlat.new()
	btn_style.bg_color = rarity_color.darkened(0.5)
	btn_style.corner_radius_top_left = 10
	btn_style.corner_radius_top_right = 10
	btn_style.corner_radius_bottom_left = 10
	btn_style.corner_radius_bottom_right = 10
	btn.add_theme_stylebox_override("normal", btn_style)
	
	btn.pressed.connect(callback)
	
	hbox.add_child(info_vbox)
	hbox.add_child(btn)
	panel.add_child(hbox)
	return panel

func _create_sell_card(item):
	var rarity = item.template.get("rarity", "COMMON")
	var rarity_color = Color(0.4, 0.8, 1.0)
	if rarity == "RARE": rarity_color = Color(1.0, 0.8, 0.2)
	elif rarity == "EPIC": rarity_color = Color(0.8, 0.4, 1.0)
	
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.12, 0.2, 0.6)
	style.corner_radius_top_left = 15
	style.corner_radius_top_right = 15
	style.corner_radius_bottom_left = 15
	style.corner_radius_bottom_right = 15
	style.border_width_left = 4
	style.border_color = rarity_color
	style.content_margin_left = 20
	style.content_margin_right = 20
	style.content_margin_top = 15
	style.content_margin_bottom = 15
	panel.add_theme_stylebox_override("panel", style)
	
	var main_vbox = VBoxContainer.new()
	main_vbox.add_theme_constant_override("separation", 15)
	
	var header_hbox = HBoxContainer.new()
	var name_lbl = Label.new()
	name_lbl.text = item.template.name + " (x%d)" % item.quantity
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_lbl.add_theme_font_size_override("font_size", 24)
	name_lbl.add_theme_color_override("font_color", rarity_color)
	header_hbox.add_child(name_lbl)
	
	var actions_hbox = HBoxContainer.new()
	actions_hbox.add_theme_constant_override("separation", 15)
	
	var npc_btn = Button.new()
	npc_btn.text = "NPC SELL"
	npc_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	npc_btn.custom_minimum_size = Vector2(0, 70)
	npc_btn.pressed.connect(func():
		if GameState.current_user:
			ServerConnector.sell_to_npc(GameState.current_user.id, item.id)
	)
	
	var list_btn = Button.new()
	list_btn.text = "LIST ITEM"
	list_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list_btn.custom_minimum_size = Vector2(0, 70)
	list_btn.pressed.connect(func(): _on_list_pressed(item.id))
	
	actions_hbox.add_child(npc_btn)
	actions_hbox.add_child(list_btn)
	
	main_vbox.add_child(header_hbox)
	main_vbox.add_child(actions_hbox)
	
	panel.add_child(main_vbox)
	return panel

func _on_list_pressed(item_id):
	_pending_list_item_id = item_id
	price_popup.show()
	price_input.value = 50 # Default starting price
	price_input.get_line_edit().grab_focus()

func _on_price_confirmed():
	var price = int(price_input.value)
	if GameState.current_user and _pending_list_item_id != -1:
		ServerConnector.list_item(GameState.current_user.id, _pending_list_item_id, price)
		price_popup.hide()
		status_label.text = "Listing item..."
		_pending_list_item_id = -1

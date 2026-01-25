extends Control

@onready var buy_list = $Panel/VBoxContainer/TabContainer/Browse/ScrollContainer/BuyList
@onready var sell_list = $Panel/VBoxContainer/TabContainer/Inventory/ScrollContainer/SellList
@onready var status_label = $Panel/VBoxContainer/StatusLabel
@onready var close_btn = $Panel/VBoxContainer/CloseButton

func _ready():
	close_btn.pressed.connect(func(): hide())
	ServerConnector.request_completed.connect(_on_request_completed)

func refresh():
	if GameState.current_user:
		ServerConnector.fetch_market_listings(GameState.current_user.id)
		ServerConnector.fetch_inventory(GameState.current_user.id)

func _on_request_completed(endpoint, data):
	if "market/listings" in endpoint:
		_populate_buy_list(data)
	elif "inventory" in endpoint:
		if data is Dictionary and data.has("items"):
			_populate_sell_list()
	elif "market/buy" in endpoint or "market/list" in endpoint or "market/sell-npc" in endpoint:
		status_label.text = "Transaction successful!"
		refresh()
		ServerConnector.fetch_profile(GameState.current_user.id)

func _populate_buy_list(listings):
	for child in buy_list.get_children(): child.queue_free()
	
	if listings.size() == 0:
		var l = Label.new()
		l.text = "No items for sale."
		buy_list.add_child(l)
		return

	for list in listings:
		var hbox = HBoxContainer.new()
		var info = Label.new()
		info.text = "%s (x%d) - %d Gold" % [list.itemTemplate.name, list.itemInstance.quantity, list.pricePerUnit]
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		
		var btn = Button.new()
		btn.text = "Buy"
		btn.pressed.connect(func(): ServerConnector.buy_item(GameState.current_user.id, list.id))
		
		hbox.add_child(info)
		hbox.add_child(btn)
		buy_list.add_child(hbox)

func _populate_sell_list():
	for child in sell_list.get_children(): child.queue_free()
	
	for item in GameState.inventory:
		var hbox = HBoxContainer.new()
		var info = Label.new()
		info.text = "%s (x%d)" % [item.template.name, item.quantity]
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		
		# NPC Sell Button
		var npc_btn = Button.new()
		npc_btn.text = "NPC Sell (10%)"
		npc_btn.pressed.connect(func(): ServerConnector.sell_to_npc(GameState.current_user.id, item.id))
		
		# Market List Button
		var list_btn = Button.new()
		list_btn.text = "List (5% Tax)"
		list_btn.pressed.connect(func(): _on_list_pressed(item.id))
		
		hbox.add_child(info)
		hbox.add_child(npc_btn)
		hbox.add_child(list_btn)
		sell_list.add_child(hbox)

func _on_list_pressed(item_id):
	# Simplified: Just list for 10 gold for demo
	ServerConnector.list_item(GameState.current_user.id, item_id, 10)

extends VBoxContainer

@onready var gold_label = $AmountDisplay/GoldLabel
@onready var silver_label = $AmountDisplay/SilverLabel
@onready var deposit_btn = $Controls/DepositBtn
@onready var withdraw_btn = $Controls/WithdrawBtn

var _current_gold = 0
var _current_silver = 0
var _socket_handler = null
var _guild_handler = null

func _ready():
	_socket_handler = get_node_or_null("/root/SocketHandler")
	_guild_handler = get_node_or_null("/root/GuildHandler")
	if deposit_btn:
		deposit_btn.pressed.connect(_on_deposit_pressed)
	if withdraw_btn:
		withdraw_btn.pressed.connect(_on_withdraw_pressed)

func update_treasury(treasury_data):
	if treasury_data is Dictionary:
		_current_gold = treasury_data.get("gold", 0)
		_current_silver = treasury_data.get("silver", 0)
	elif typeof(treasury_data) == TYPE_INT:
		# treasury is stored as total silver (1,000,000 silver = 1 gold)
		_current_gold = int(treasury_data / 1000)
		_current_silver = int(treasury_data % 1000)
	else:
		_current_gold = 0
		_current_silver = 0
	_update_display()

func _update_display():
	gold_label.text = "Gold: %d" % _current_gold
	silver_label.text = "Silver: %d" % _current_silver

func _on_deposit_pressed():
	if _guild_handler:
		_guild_handler.deposit_treasury(100)  # Default 100 gold for now

func _on_withdraw_pressed():
	if _guild_handler:
		_guild_handler.withdraw_treasury(50)  # Default 50 gold for now

func update_history(history: Array):
	# Populate transaction history
	pass

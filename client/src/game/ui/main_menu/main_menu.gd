class_name MainMenu
extends Control

@onready var continue_btn: Button = $UI/VBox/Continue

func _ready():
	# Only show CONTINUE if a save file exists
	if SaveManager.has_save():
		continue_btn.visible = true
	else:
		continue_btn.visible = false

func _on_new_game_pressed():
	# 1. Reset Global Data
	GlobalGameManager.player_party.clear()
	InventoryManager.items.clear()
	
	# 2. Add Initial Novice Character (Starting Unit)
	GlobalGameManager.player_party[Vector2i(1, 1)] = load("res://data/units/heroes/Novice.tres")
	
	# 3. Add Starter Items
	InventoryManager.add_item(load("res://data/items/IronSword.tres"))
	InventoryManager.add_item(load("res://data/items/LeatherArmor.tres"))
	
	# 4. Create Initial Save
	SaveManager.save_game()
	
	# 4. Go to Adventure Hub (starting in village)
	get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

func _on_continue_pressed():
	if SaveManager.load_game():
		get_tree().change_scene_to_file("res://src/game/ui/adventure_hub.tscn")

func _on_options_pressed():
	print("Options menu not yet implemented")

func _on_about_pressed():
	print("Textical: A Tactical Idle RPG Prototype")

func _on_exit_pressed():
	get_tree().quit()
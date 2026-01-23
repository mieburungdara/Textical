class_name BarracksComponent
extends BasePartyComponent

@export var hero_list_container: VBoxContainer

func populate(heroes: Array[HeroData]):
	for child in hero_list_container.get_children():
		child.queue_free()
		
	for hero in heroes:
		if not hero: continue
		var card = _create_hero_card(hero)
		hero_list_container.add_child(card)

func _create_hero_card(data: HeroData) -> Control:
	var btn = Button.new()
	btn.custom_minimum_size = Vector2(0, 60)
	btn.text = data.name
	btn.alignment = HorizontalAlignment.HORIZONTAL_ALIGNMENT_LEFT
	
	# Connect Selection
	btn.pressed.connect(func(): manager.show_hero_details(data))
	
	# Attach the drag script
	var drag_script = load("res://src/game/ui/formation/draggable_unit.gd")
	btn.set_script(drag_script)
	
	# Wait one frame if needed for script properties to initialize
	btn.call("setup", data)
	
	return btn
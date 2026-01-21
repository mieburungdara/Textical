class_name HeroDetailsComponent
extends BasePartyComponent

@export var card_container: CenterContainer
var card_scene = preload("res://src/game/ui/cards/HeroCard.tscn")
var current_card: HeroCard = null

func display(data: HeroData):
	# Clear old card
	if current_card:
		current_card.queue_free()
	
	# Instantiate new card
	current_card = card_scene.instantiate()
	card_container.add_child(current_card)
	current_card.setup(data)


class_name RogueRequirement
extends Resource

func can_equip(hero: HeroData) -> bool:
	# Assume ROGUE is an enum value or mapped string
	return "rogue" in hero.current_job.id.to_lower()

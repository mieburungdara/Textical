class_name PaladinRequirement
extends Resource

func can_equip(hero: HeroData) -> bool:
	return hero.hero_class == HeroData.HeroClass.PALADIN

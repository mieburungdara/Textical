class_name HeroData
extends UnitData

enum HeroClass { WARRIOR, RANGER, MAGE, CLERIC, ROGUE }

@export_group("Hero Specifics")
@export var hero_class: HeroClass = HeroClass.WARRIOR
@export var starting_level: int = 1
@export var growth_rate: float = 1.1 # 10% stat increase per level (simple curve)

# Future: Equipment Slots
# @export var main_hand: ItemData
# @export var armor: ItemData

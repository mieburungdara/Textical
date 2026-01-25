class_name EquipmentData
extends ItemData

enum Slot { MAIN_HAND, OFF_HAND, ARMOR, ACCESSORY }
enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }

@export_group("Classification")
@export var slot: Slot = Slot.MAIN_HAND
@export var rarity: Rarity = Rarity.COMMON
@export var required_classes: Array[HeroData.HeroClass] = []

@export_group("Stats & Effects")
@export var stat_bonuses: Dictionary = {}
@export var traits: Array[ItemTrait] = []

func _init():
    type = ItemType.EQUIPMENT
    stackable = false

func can_be_equipped_by(hero: Object) -> bool:
    if required_classes.is_empty(): return true
    return hero.hero_class in required_classes

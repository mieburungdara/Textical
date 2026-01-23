@tool
extends SceneTree

func _init():
	print("Creating Test Equipment...")
	
	# 1. Iron Sword
	var sword = EquipmentData.new()
	sword.id = "wpn_iron_sword"
	sword.name = "Iron Sword"
	sword.description = "A basic blade. reliable."
	sword.slot = EquipmentData.Slot.MAIN_HAND
	sword.stat_bonuses = {"attack_damage": 10}
	ResourceSaver.save(sword, "res://data/items/IronSword.tres")
	
	# 2. Wooden Shield
	var shield = EquipmentData.new()
	shield.id = "wpn_wood_shield"
	shield.name = "Wooden Shield"
	shield.description = "Better than nothing."
	shield.slot = EquipmentData.Slot.OFF_HAND
	shield.stat_bonuses = {"defense": 5}
	ResourceSaver.save(shield, "res://data/items/WoodenShield.tres")
	
	# 3. Leather Armor
	var armor = EquipmentData.new()
	armor.id = "arm_leather"
	armor.name = "Leather Armor"
	armor.description = "Light and flexible."
	armor.slot = EquipmentData.Slot.ARMOR
	armor.stat_bonuses = {"health_max": 20, "speed": 1}
	ResourceSaver.save(armor, "res://data/items/LeatherArmor.tres")
	
	print("Done!")
	quit()

extends Node

## Professional Inventory Manager.
## Manages unique ItemInstances across the game.

signal inventory_changed

# List of ItemInstance objects currently in the bag
var items: Array[ItemInstance] = []

func add_item(data: ItemData) -> ItemInstance:
	var inst = ItemInstance.new(data)
	items.append(inst)
	inventory_changed.emit()
	return inst

func remove_item(uid: String):
	for i in range(items.size()):
		if items[i].uid == uid:
			items.remove_at(i)
			inventory_changed.emit()
			return

func get_equipment_for_slot(slot: EquipmentData.Slot) -> Array[ItemInstance]:
	var filtered: Array[ItemInstance] = []
	for inst in items:
		if inst.data is EquipmentData and inst.data.slot == slot:
			filtered.append(inst)
	return filtered

## Mark an item as "In Use" (remove from bag)
func equip_item(inst: ItemInstance):
	if inst in items:
		items.erase(inst)
		inventory_changed.emit()

## Mark an item as "Available" (add back to bag)
func unequip_item(inst: ItemInstance):
	if inst:
		if not inst in items:
			items.append(inst)
			inventory_changed.emit()
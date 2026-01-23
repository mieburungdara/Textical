class_name ItemData
extends Resource

enum ItemType { CONSUMABLE, EQUIPMENT, MATERIAL, KEY_ITEM }

@export_group("Item Info")
@export var id: String = "item_id"
@export var name: String = "Item Name"
@export_multiline var description: String = "Description"
@export var icon: Texture2D
@export var type: ItemType = ItemType.MATERIAL
@export var price: int = 10
@export var stackable: bool = true
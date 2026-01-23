class_name ItemFactory
extends Node

## Professional Item Factory that assembles items from JSON Blueprints.

# Preload all logic parts into a dictionary for instant access
const PARTS = {
	"effect_poison": preload("res://src/core/item/parts/effect_poison.gd"),
	"effect_burn": preload("res://src/core/item/parts/effect_burn.gd"),
	"req_paladin": preload("res://src/core/item/parts/req_paladin.gd"),
	"req_rogue": preload("res://src/core/item/parts/req_rogue.gd")
}

static func build_item(id: String, json_data: Dictionary, icon_texture: Texture2D) -> ItemInstance:
	var base_data = EquipmentData.new()
	base_data.id = id
	base_data.name = json_data.get("name", "Unknown Item")
	base_data.description = json_data.get("desc", "")
	base_data.icon = icon_texture
	
	# 1. Apply Stats from JSON
	var stats = json_data.get("stats", {})
	base_data.stat_bonuses = stats
	
	# 2. Assemble Logic Parts (Traits/Requirements)
	var part_keys = json_data.get("parts", [])
	for key in part_keys:
		if PARTS.has(key):
			var part_instance = PARTS[key].new()
			if part_instance is ItemTrait:
				base_data.traits.append(part_instance)
			# Add specialized logic for requirements here if needed
	
	return ItemInstance.new(base_data)

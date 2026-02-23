extends "res://src/network/BaseNetworkHandler.gd"
class_name PrivateIslandHandler

## PrivateIslandHandler - Handles Private Island API calls

func _ready():
	super._ready()

## Get user's private island data
func get_island(user_id: int):
	_request("/island/" + str(user_id))

## Get island status (unlocked, plots, storage info)
func get_island_status(user_id: int):
	_request("/island/" + str(user_id) + "/status")

## Unlock the private island (premium feature - costs 500 gems)
func unlock_island(user_id: int):
	_request("/island/unlock", HTTPClient.METHOD_POST, {"userId": user_id})

## Plant a seed in a garden plot
func plant_seed(user_id: int, plot_index: int, seed_template_id: int):
	_request("/island/plant", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"plotIndex": plot_index,
		"seedTemplateId": seed_template_id
	})

## Harvest a ready crop from a plot
func harvest_crop(user_id: int, plot_index: int):
	_request("/island/harvest", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"plotIndex": plot_index
	})

## Add item to island storage
func add_to_storage(user_id: int, item_template_id: int, quantity: int):
	_request("/island/storage/add", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"itemTemplateId": item_template_id,
		"quantity": quantity
	})

## Remove item from island storage
func remove_from_storage(user_id: int, slot_index: int, quantity: int):
	_request("/island/storage/remove", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"slotIndex": slot_index,
		"quantity": quantity
	})

## Upgrade garden plot count
func upgrade_plots(user_id: int):
	_request("/island/upgrade/plots", HTTPClient.METHOD_POST, {"userId": user_id})

## Upgrade storage slot count
func upgrade_storage(user_id: int):
	_request("/island/upgrade/storage", HTTPClient.METHOD_POST, {"userId": user_id})

## Get available crop templates
func get_crop_templates():
	_request("/island/crops")

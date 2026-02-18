extends Node

## PrivateIslandHandler - Handles Private Island API calls

signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

var base_url = "http://127.0.0.1:5000/api"

func _request(endpoint: String, method: int = HTTPClient.METHOD_GET, body: Dictionary = {}):
	var http = HTTPRequest.new()
	add_child(http)
	
	var url = base_url + endpoint
	var headers = ["Content-Type: application/json"]
	
	var err = 0
	if method == HTTPClient.METHOD_GET:
		err = http.request(url, headers, method)
	elif method == HTTPClient.METHOD_POST:
		err = http.request(url, headers, method, JSON.stringify(body))
	
	if err != OK:
		push_error("[PrivateIslandHandler] Request failed to start: " + str(err))
		error_occurred.emit(endpoint, "Request failed to start")
		http.queue_free()
		return
	
	var response = await http.request_completed
	http.queue_free()
	
	var _result = response[0]
	var code = response[1]
	var _headers = response[2]
	var response_body = response[3]
	
	if code != 200:
		push_error("[PrivateIslandHandler] Error: " + str(code))
		error_occurred.emit(endpoint, "HTTP Error: " + str(code))
		return
	
	var json = JSON.new()
	var parse_result = json.parse(response_body.get_string_from_utf8())
	
	if parse_result != OK:
		push_error("[PrivateIslandHandler] JSON parse error")
		error_occurred.emit(endpoint, "JSON parse error")
		return
	
	var data = json.data
	request_completed.emit(endpoint, data)

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

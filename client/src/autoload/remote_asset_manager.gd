extends Node

## Singleton for downloading and caching game assets from GitHub.

signal initialization_complete
signal asset_downloaded(id: String)

const BASE_URL = "https://raw.githubusercontent.com/username/repo/master/"
const JSON_URL = BASE_URL + "data/items.json"
const ICON_DIR = BASE_URL + "assets/icons/"

var item_database: Dictionary = {} # ID -> ItemInstance
var texture_cache: Dictionary = {} # FileName -> Texture2D

func start_initialization():
	_fetch_json()

func _fetch_json():
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_json_loaded)
	print("Downloading master item list...")
	http.request(JSON_URL)

func _on_json_loaded(result, _code, _headers, body):
	if result != HTTPRequest.RESULT_SUCCESS:
		push_error("Internet Connection Required!")
		return
		
	var data = JSON.parse_string(body.get_as_text())
	if data:
		item_database = data
		_download_all_icons()

func _download_all_icons():
	var pending_downloads = 0
	for item_id in item_database:
		var item_info = item_database[item_id]
		var icon_file = item_info.get("icon_file", "")
		
		if icon_file != "" and not texture_cache.has(icon_file):
			pending_downloads += 1
			_download_image(icon_file)
	
	if pending_downloads == 0:
		initialization_complete.emit()

func _download_image(file_name: String):
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(res, code, head, body): _on_image_loaded(res, code, head, body, file_name))
	http.request(ICON_DIR + file_name)

func _on_image_loaded(result, _code, _headers, body, file_name):
	if result == HTTPRequest.RESULT_SUCCESS:
		var image = Image.new()
		var error = OK
		
		if file_name.ends_with(".png"): error = image.load_png_from_buffer(body)
		elif file_name.ends_with(".jpg"): error = image.load_jpg_from_buffer(body)
		
		if error == OK:
			var tex = ImageTexture.create_from_image(image)
			texture_cache[file_name] = tex
			print("Downloaded icon: ", file_name)
	
	# Simple check: if all icons in database are in cache, we are done
	if _is_everything_loaded():
		initialization_complete.emit()

func _is_everything_loaded() -> bool:
	for id in item_database:
		var icon = item_database[id].get("icon_file", "")
		if icon != "" and not texture_cache.has(icon):
			return false
	return true

## Helper to build an ItemData object from remote data
func get_remote_item(id: String) -> ItemInstance:
	if not item_database.has(id): return null
	
	var info = item_database[id]
	var data = EquipmentData.new() # Or determine type from JSON
	data.id = id
	data.name = info["name"]
	data.description = info["desc"]
	
	# Attach the downloaded texture
	var icon_file = info.get("icon_file", "")
	if texture_cache.has(icon_file):
		data.icon = texture_cache[icon_file]
	
	# Stats
	if info.has("stats"):
		data.stat_bonuses = info["stats"]
		
	return ItemInstance.new(data)

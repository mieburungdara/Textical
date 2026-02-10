extends BaseNetworkHandler
class_name AssetHandler

func fetch_templates(category: String):
	_request("/assets/templates/" + category, HTTPClient.METHOD_GET)

func get_manifest():
	_request("/assets/manifest", HTTPClient.METHOD_GET)

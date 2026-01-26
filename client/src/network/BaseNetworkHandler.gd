extends Node
class_name BaseNetworkHandler

signal request_completed(endpoint, data)
signal error_occurred(endpoint, message)

var base_url = "http://localhost:3000/api"

func _request(endpoint: String, method: HTTPClient.Method, body: Dictionary = {}):
	var url = base_url + endpoint
	var headers = ["Content-Type: application/json"]
	var json_str = JSON.stringify(body) if not body.is_empty() else ""
	
	var http = HTTPRequest.new()
	add_child(http)
	
	http.request_completed.connect(func(result, response_code, response_headers, response_body): 
		_on_request_completed(http, endpoint, result, response_code, response_headers, response_body)
	)
	
	var error = http.request(url, headers, method, json_str)
	if error != OK:
		emit_signal("error_occurred", endpoint, "Connection Error")
		http.queue_free()

func _on_request_completed(http_node: HTTPRequest, endpoint: String, _result, response_code, _headers, body):
	var response_text = body.get_string_from_utf8()
	
	# DEFENSIVE PARSING
	var json = JSON.parse_string(response_text)
	if json == null:
		var error_msg = "Invalid JSON response from server. Check if server is running or route exists."
		print("[NETWORK_ERROR] Endpoint: ", endpoint)
		print("[NETWORK_ERROR] Response Code: ", response_code)
		print("[NETWORK_ERROR] Raw Body: ", response_text.left(200)) # Log first 200 chars
		emit_signal("error_occurred", endpoint, error_msg)
		http_node.queue_free()
		return
	
	if response_code >= 400:
		var msg = json.get("error", "Server Error") if json is Dictionary else "Unknown Error"
		emit_signal("error_occurred", endpoint, msg)
		_handle_error(endpoint, msg)
	else:
		# AUTHORITATIVE ORDER: Update State BEFORE emitting signal
		_handle_success(endpoint, json)
		emit_signal("request_completed", endpoint, json)
	
	http_node.queue_free()

func _handle_success(_endpoint: String, _json):
	pass

func _handle_error(_endpoint: String, _message: String):
	pass
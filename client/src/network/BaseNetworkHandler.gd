extends Node
class_name BaseNetworkHandler

## Import centralized error codes
const ErrorCodes = preload("res://src/constants/ErrorCodes.gd")

## Signals for request handling
signal request_completed(endpoint, data)
signal error_occurred(endpoint, error_code, message)

var base_url = "http://127.0.0.1:5000/api"

func _ready():
    # Support environment-based configuration
    if GameState and GameState.has_method("get_api_url") and GameState.get("api_url"):
        base_url = GameState.api_url

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
        emit_signal("error_occurred", endpoint, ErrorCodes.NETWORK_CONNECTION_ERROR, "Connection Error")
        http.queue_free()

## Asynchronous request that returns data directly
func _request_async(endpoint: String, method: HTTPClient.Method, body: Dictionary = {}) -> Dictionary:
    var url = base_url + endpoint
    var headers = ["Content-Type: application/json"]
    var json_str = JSON.stringify(body) if not body.is_empty() else ""
    
    var http = HTTPRequest.new()
    add_child(http)
    
    var error = http.request(url, headers, method, json_str)
    if error != OK:
        http.queue_free()
        return {"success": false, "error": ErrorCodes.NETWORK_CONNECTION_ERROR, "message": "Connection Error"}
    
    var response = await http.request_completed
    var result = response[0]
    var response_code = response[1]
    var response_body = response[3]
    
    var response_text = response_body.get_string_from_utf8()
    var json = JSON.parse_string(response_text)
    
    var final_result = {}
    if result == OK and response_code < 400 and json != null:
        final_result = json
        _handle_success(endpoint, json)
    else:
        var error_code = _extract_error_code(json)
        var error_msg = _extract_error_message(json)
        _handle_error(endpoint, error_code, error_msg)
        
    http.queue_free()
    return final_result

func _on_request_completed(http_node: HTTPRequest, endpoint: String, _result, response_code, _headers, body):
    var response_text = body.get_string_from_utf8()
    
    # DEFENSIVE PARSING - Use JSON.new() and parse() to avoid throwing errors
    var json_parser = JSON.new()
    var parse_result = json_parser.parse(response_text)
    if parse_result != OK:
        var error_msg = "Invalid JSON response from server. Check if server is running or route exists."
        print("[NETWORK_ERROR] Endpoint: ", endpoint)
        print("[NETWORK_ERROR] Response Code: ", response_code)
        print("[NETWORK_ERROR] Raw Body: ", response_text.left(200)) # Log first 200 chars
        emit_signal("error_occurred", endpoint, ErrorCodes.NETWORK_INVALID_RESPONSE, error_msg)
        http_node.queue_free()
        return
    
    var json = json_parser.data
    
    if response_code >= 400:
        var error_code = _extract_error_code(json)
        var error_msg = _extract_error_message(json)
        emit_signal("error_occurred", endpoint, error_code, error_msg)
        _handle_error(endpoint, error_code, error_msg)
    else:
        # AUTHORITATIVE ORDER: Update State BEFORE emitting signal
        _handle_success(endpoint, json)
        emit_signal("request_completed", endpoint, json)
    
    http_node.queue_free()

## Extract error code from server response
func _extract_error_code(json) -> String:
    if json == null or not json is Dictionary:
        return ErrorCodes.NETWORK_INVALID_RESPONSE
    
    # Server sends error code in "error" field
    var error_code = json.get("error", "")
    if error_code.is_empty():
        return ErrorCodes.NETWORK_UNKNOWN_ERROR
    
    return error_code

## Extract error message from server response
func _extract_error_message(json) -> String:
    if json == null or not json is Dictionary:
        return "Unknown Error"
    
    # Server sends message in "message" field
    return json.get("message", "Server Error")

## Check if error code indicates a recoverable error
func _is_recoverable_error(error_code: String) -> bool:
    return ErrorCodes.is_recoverable(error_code)

## Get user-friendly error message for an error code
func _get_error_message(error_code: String) -> String:
    return ErrorCodes.get_message(error_code)

## Check if error is authentication-related
func _is_auth_error(error_code: String) -> bool:
    return ErrorCodes.is_auth_error(error_code)

## Check if error is funds-related
func _is_funds_error(error_code: String) -> bool:
    return ErrorCodes.is_funds_error(error_code)

## Check if error indicates user/entity is busy
func _is_busy_error(error_code: String) -> bool:
    return ErrorCodes.is_busy_error(error_code)

func _handle_success(_endpoint: String, _json):
    pass

func _handle_error(_endpoint: String, _error_code: String, _message: String):
    pass

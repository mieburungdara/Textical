# scripts/validate_scenes.gd
@tool
extends SceneTree

func _init():
	print("--- Scene Validation Started ---")
	var results = validate_loading_screen()
	if results.size() == 0:
		print("✅ LoadingScreen validation passed.")
	else:
		for err in results:
			push_error("❌ " + err)
	
	print("--- Scene Validation Finished ---")
	quit()

func validate_loading_screen() -> Array[String]:
	var errors: Array[String] = []
	var path = "res://src/ui/loading/LoadingScreen.tscn"
	
	if not FileAccess.file_exists(path):
		errors.append("LoadingScreen.tscn not found at " + path)
		return errors
		
	var scene = load(path)
	if not scene:
		errors.append("Failed to load LoadingScreen.tscn")
		return errors
		
	var instance = scene.instantiate()
	
	# Check required nodes
	var required_nodes = ["MagicSigil", "VBoxContainer", "VBoxContainer/LoadingBar", "ChronicleLogs"]
	for node_path in required_nodes:
		if not instance.has_node(node_path):
			errors.append("Missing required node: " + node_path)
			
	instance.queue_free()
	
	# Check UID validity in the file content
	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text()
	file.close()
	
	var uid_regex = RegEx.new()
	uid_regex.compile("uid="uid://[a-zA-Z0-9]{8,}"")
	
	# Specifically check for the placeholder uid mentioned in analysis
	if "uid="uid://loading_bar"" in content:
		errors.append("Invalid placeholder UID found: uid://loading_bar")
		
	return errors

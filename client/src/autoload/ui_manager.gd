extends Node

## UIManager - Mengelola layar Overlay (Inventory, Profile, dll)
## Memungkinkan menu muncul di atas layar game tanpa ganti scene total.

var ui_layer: CanvasLayer
var active_overlays: Dictionary = {}
var _world_hud: Control = null

signal overlay_opened(overlay_name)
signal overlay_closed(overlay_name)

func _ready():
	# Buat layer khusus untuk UI Overlay agar selalu di depan
	ui_layer = CanvasLayer.new()
	ui_layer.layer = 100
	add_child(ui_layer)
	print("[UI] UIManager ready.")

## Register world HUD to be managed by UIManager
func register_world_hud(hud: Control):
	_world_hud = hud

## Membuka layar sebagai overlay
func open_overlay(overlay_name: String, scene_path: String, data: Dictionary = {}):
	if active_overlays.has(overlay_name):
		print("[UI] Overlay already open: ", overlay_name)
		return active_overlays[overlay_name]
	
	print("[UI] Opening overlay: ", overlay_name)
	var scene = load(scene_path)
	if scene:
		var instance = scene.instantiate()
		ui_layer.add_child(instance)
		active_overlays[overlay_name] = instance
		
		# Sembunyikan HUD dunia jika ini adalah overlay utama
		if _world_hud:
			_world_hud.visible = false
		
		# Beri tahu instance bahwa ia adalah overlay
		if instance.has_method("setup_as_overlay"):
			instance.setup_as_overlay(data)
		
		# Animasi muncul (opsional)
		instance.modulate.a = 0
		var tw = create_tween()
		tw.tween_property(instance, "modulate:a", 1.0, 0.2)
		
		overlay_opened.emit(overlay_name)
		return instance
	return null

## Menutup layar overlay tertentu
func close_overlay(overlay_name: String):
	if active_overlays.has(overlay_name):
		print("[UI] Closing overlay: ", overlay_name)
		var instance = active_overlays[overlay_name]
		
		var tw = create_tween()
		tw.tween_property(instance, "modulate:a", 0.0, 0.15)
		tw.tween_callback(func(): 
			if is_instance_valid(instance):
				instance.queue_free()
			
			# Tampilkan kembali HUD dunia jika tidak ada overlay lain
			active_overlays.erase(overlay_name)
			if active_overlays.size() == 0 and _world_hud:
				_world_hud.visible = true
				
			overlay_closed.emit(overlay_name)
		)

## Menutup semua overlay yang sedang aktif
func close_all_overlays():
	for _ov_name in active_overlays.keys():
		close_overlay(_ov_name)

## Mengecek apakah ada overlay yang sedang terbuka
func has_active_overlay() -> bool:
	return active_overlays.size() > 0

func is_overlay_open(overlay_name: String) -> bool:
	return active_overlays.has(overlay_name)

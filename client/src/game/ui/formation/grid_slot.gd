class_name GridSlot
extends Panel

## Slot in the formation grid that handles unit placement and swapping.

var grid_pos: Vector2i
var current_unit: UnitData = null

@onready var icon_rect: TextureRect = $Icon

func setup(pos: Vector2i):
    grid_pos = pos
    custom_minimum_size = Vector2(56, 56)

# --- DRAG & DROP LOGIC ---

func _get_drag_data(_at_position: Vector2):
    if not current_unit: return null
    
    var preview = TextureRect.new()
    preview.texture = icon_rect.texture
    preview.modulate = icon_rect.modulate
    preview.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    preview.custom_minimum_size = Vector2(40, 40)
    preview.position = Vector2(-20, -20)
    
    var c = Control.new()
    c.add_child(preview)
    set_drag_preview(c)
    
    # Pack source info for swapping
    return {"source_slot": self, "unit": current_unit}

func _can_drop_data(_at_position: Vector2, data: Variant) -> bool:
    # Can accept if data has a unit, regardless of source
    var can_drop = (data is Dictionary and data.has("unit")) or (data is UnitData)
    if can_drop:
        modulate = Color(1.5, 1.5, 1.5, 1.0)
    return can_drop

func _drop_data(_at_position: Vector2, data: Variant):
    modulate = Color.WHITE
    
    var incoming_unit: UnitData
    var source_slot = null
    
    # Determine if this is a Swap or a New Placement
    if data is Dictionary:
        incoming_unit = data["unit"]
        source_slot = data.get("source_slot") # Might be null if from barracks
    else:
        incoming_unit = data # Direct UnitData from Barracks
    
    # SWAP/PLACEMENT LOGIC
    var target_existing_unit = current_unit
    
    # 1. Place incoming unit here
    set_unit(incoming_unit)
    
    # 2. If there was a source slot, put this slot's old unit back there (Swap)
	if source_slot and is_instance_valid(source_slot):
		source_slot.set_unit(target_existing_unit)
	
	# Notify Manager
	var editor = _find_editor(self)
	if editor and editor.has_signal("formation_changed"):
		editor.emit_signal("formation_changed")

func _notification(what):
	if what == NOTIFICATION_DRAG_END:
		modulate = Color.WHITE

# --- VISUALS ---

func set_unit(p_data: UnitData):
	current_unit = p_data
	if not icon_rect: icon_rect = get_node("Icon")
	
	if p_data:
		icon_rect.texture = p_data.icon
		if not icon_rect.texture:
			icon_rect.texture = PlaceholderTexture2D.new()
			icon_rect.texture.set_size(Vector2(40, 40))
		icon_rect.modulate = p_data.model_color
		icon_rect.visible = true
	else:
		icon_rect.texture = null
		icon_rect.visible = false

func _find_editor(node: Node) -> Node:
	if node is PartyManagerUI: return node
	if node.get_parent(): return _find_editor(node.get_parent())
	return null

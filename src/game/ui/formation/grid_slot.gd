class_name GridSlot
extends Panel

## Slot in the formation grid that supports Drag & Drop, Swapping, and Checkerboard visual.

var grid_pos: Vector2i
var current_unit: UnitData = null

@onready var icon_rect: TextureRect = $Icon

func setup(pos: Vector2i):
    grid_pos = pos
    custom_minimum_size = Vector2(50, 50)
    _update_slot_visual()
func _update_slot_visual():
    # Create a checkerboard pattern style
    var style = StyleBoxFlat.new()
    style.set_corner_radius_all(4)
    style.set_border_width_all(1)
    style.border_color = Color(0.3, 0.3, 0.3, 0.5)    
    # Alternate colors based on grid position (x + y)
    if (grid_pos.x + grid_pos.y) % 2 == 0:
        style.bg_color = Color(0.15, 0.15, 0.15, 1.0) # Darker
    else:
        style.bg_color = Color(0.25, 0.25, 0.25, 1.0) # Lighter
        
    add_theme_stylebox_override("panel", style)

# --- DRAG & DROP LOGIC ---

func _get_drag_data(_at_position: Vector2):
    if not current_unit: return null
    
    var preview = TextureRect.new()
    preview.texture = icon_rect.texture
    preview.modulate = icon_rect.modulate
    preview.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    preview.custom_minimum_size = Vector2(48, 48)
    preview.position = Vector2(-24, -24)
    
    var c = Control.new()
    c.add_child(preview)
    set_drag_preview(c)
    
    return { "unit": current_unit, "source": self }

func _can_drop_data(_at_position: Vector2, data: Variant) -> bool:
    return data is UnitData or (data is Dictionary and data.has("unit"))

func _drop_data(_at_position: Vector2, data: Variant):
    var incoming_unit: UnitData = null
    var source_slot: GridSlot = null
    
    if data is UnitData:
        incoming_unit = data
    else:
        incoming_unit = data["unit"]
        source_slot = data["source"]
    
    if source_slot:
        if current_unit:
            source_slot.set_unit(current_unit)
        else:
            source_slot.set_unit(null)
    
    set_unit(incoming_unit)
    _notify_change()

# --- INPUTS ---

func _gui_input(event: InputEvent):
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
            if current_unit:
                set_unit(null)
                _notify_change()
        elif event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
            if current_unit:
                var editor = _find_editor(self)
                if editor and editor.has_method("show_hero_details"):
                    editor.show_hero_details(current_unit)

func set_unit(data: UnitData):
    current_unit = data
    if not icon_rect: icon_rect = get_node("Icon")
    
    if data:
        icon_rect.texture = data.icon
        if not icon_rect.texture:
            icon_rect.texture = PlaceholderTexture2D.new()
            icon_rect.texture.set_size(Vector2(48, 48))
        icon_rect.modulate = data.model_color
        icon_rect.visible = true
    else:
        current_unit = null
        icon_rect.texture = null
        icon_rect.visible = false

func _notify_change():
    var editor = _find_editor(self)
    if editor and editor.has_signal("formation_changed"):
        editor.emit_signal("formation_changed")

func _find_editor(node: Node) -> Node:
    if node is PartyManagerUI: return node
    if node.get_parent(): return _find_editor(node.get_parent())
    return null

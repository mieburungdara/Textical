extends Control

## Generic drag-and-drop script using dynamic property checking.
## Note: We removed 'class_name' to avoid type-check errors when attached to different nodes.

@export var unit_data: UnitData

func setup(data: UnitData):
    unit_data = data
    
    # Use dynamic property setting to avoid type mismatch
    if "texture" in self:
        self.texture = data.icon
    elif "icon" in self:
        self.icon = data.icon
        if "expand_icon" in self:
            self.expand_icon = true
    
    modulate = data.model_color
    
    # Make it draggable
    mouse_default_cursor_shape = Control.CURSOR_DRAG

func _get_drag_data(_at_position: Vector2):
    var preview = TextureRect.new()
    
    # Try to get texture from current node dynamically
    var source_tex = null
    if "texture" in self:
        source_tex = self.texture
    elif "icon" in self:
        source_tex = self.icon
    
    if not source_tex and unit_data:
        source_tex = unit_data.icon
        
    preview.texture = source_tex
    preview.modulate = modulate
    preview.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    preview.custom_minimum_size = Vector2(48, 48)
    
    # Small offset so it's centered under cursor
    preview.position = Vector2(-24, -24)
    
    var c = Control.new()
    c.add_child(preview)
    set_drag_preview(c)
    
    return unit_data

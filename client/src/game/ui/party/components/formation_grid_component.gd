class_name FormationGridComponent
extends BasePartyComponent

@export var grid_container: GridContainer
var slot_scene = preload("res://src/game/ui/formation/GridSlot.tscn")

func setup_grid(party_data: Dictionary):
    for child in grid_container.get_children():
        child.queue_free()
    
    # Compact 5x10 Grid
    grid_container.columns = 5
    # Reduce spacing to save screen space
    grid_container.add_theme_constant_override("h_separation", 6)
    grid_container.add_theme_constant_override("v_separation", 6)
    
    for y in range(10):
        for x in range(5):
            var pos = Vector2i(x, y)
            var slot = slot_scene.instantiate() as GridSlot
            grid_container.add_child(slot)
            slot.setup(pos)
            
            # Map to battle positions
            var battle_pos = Vector2i(x + 1, y)
            if party_data.has(battle_pos):
                slot.set_unit(party_data[battle_pos])
            
            slot.gui_input.connect(_on_slot_gui_input.bind(slot))

func _on_slot_gui_input(event: InputEvent, slot: GridSlot):
    if event is InputEventMouseButton and event.pressed:
        if slot.current_unit:
            manager.show_hero_details(slot.current_unit)

func get_formation_data() -> Dictionary:
    var new_party = {}
    for slot in grid_container.get_children():
        if slot is GridSlot and slot.current_unit:
            var battle_pos = Vector2i(slot.grid_pos.x + 1, slot.grid_pos.y)
            new_party[battle_pos] = slot.current_unit
    return new_party

extends CanvasLayer
class_name GlobalHUD

## Global HUD that appears on all location scenes
## Shows: Gold, Party Count, Location, Floor

@onready var gold_label: Label = $TopBar/GoldLabel if has_node("TopBar/GoldLabel") else null
@onready var party_label: Label = $TopBar/PartyLabel if has_node("TopBar/PartyLabel") else null
@onready var location_label: Label = $TopBar/LocationLabel if has_node("TopBar/LocationLabel") else null
@onready var floor_label: Label = $TopBar/FloorLabel if has_node("TopBar/FloorLabel") else null
@onready var nav_buttons: HBoxContainer = $BottomBar/NavButtons if has_node("BottomBar/NavButtons") else null
@onready var hero_roster_button: Button = $TopBar/HeroRosterButton if has_node("TopBar/HeroRosterButton") else null
@onready var inventory_button: Button = $TopBar/InventoryButton if has_node("TopBar/InventoryButton") else null

var location_manager: Node = null
var game_manager: Node = null

# Cache for navigation buttons
var _cached_buttons: Array = []
var _last_location: int = -1
var _last_floor: int = -1

func _ready() -> void:
    # Cache manager references
    location_manager = get_tree().root.get_node("LocationManager")
    game_manager = get_tree().root.get_node("GameManager")
    
    # Connect to location changes (prevent duplicates)
    if location_manager:
        if not location_manager.location_changed.is_connected(_on_location_changed):
            location_manager.location_changed.connect(_on_location_changed)
        if not location_manager.floor_changed.is_connected(_on_floor_changed):
            location_manager.floor_changed.connect(_on_floor_changed)
    
    # Connect HeroRoster button
    if hero_roster_button:
        if not hero_roster_button.pressed.is_connected(_on_hero_roster_pressed):
            hero_roster_button.pressed.connect(_on_hero_roster_pressed)
    
    # Connect Inventory button
    if inventory_button:
        if not inventory_button.pressed.is_connected(_on_inventory_pressed):
            inventory_button.pressed.connect(_on_inventory_pressed)
    
    _update_hud()

func _on_hero_roster_pressed() -> void:
    # Find and toggle HeroRoster in the scene tree
    var game_scene = get_tree().root.get_node("GameScene")
    if game_scene:
        var hero_roster = game_scene.get_node_or_null("HeroRoster")
        if hero_roster and hero_roster.has_method("toggle"):
            hero_roster.toggle()

func _on_inventory_pressed() -> void:
    # Find and toggle InventoryUI in the scene tree
    var game_scene = get_tree().root.get_node("GameScene")
    if game_scene:
        var inventory_ui = game_scene.get_node_or_null("InventoryUI")
        if inventory_ui and inventory_ui.has_method("toggle"):
            inventory_ui.toggle()

func _on_location_changed(_from: int, _to: int) -> void:
    _update_hud()

func _on_floor_changed(_from: int, _to: int) -> void:
    _update_hud()

func _update_hud() -> void:
    # Skip if no managers
    if location_manager == null:
        return
    
    var current_loc = location_manager.current_location
    var current_floor = location_manager.current_floor
    
    # Skip update if nothing changed
    if current_loc == _last_location and current_floor == _last_floor:
        return
    
    _last_location = current_loc
    _last_floor = current_floor
    
    # Update Gold
    if gold_label and game_manager:
        gold_label.text = "💰 GOLD: %,d" % game_manager.gold
    
    # Update Party (use MAX_HEROES constant)
    if party_label and game_manager:
        party_label.text = "⚔️ PARTY: %d/%d" % [game_manager.hero_count, 50]
    
    # Update Location
    if location_label:
        location_label.text = "📍 " + location_manager.get_location_name(current_loc)
    
    # Update Floor (only show in dungeon)
    if floor_label:
        if current_loc == location_manager.LocationType.DUNGEON:
            floor_label.text = "FLOOR: %d/100" % current_floor
            floor_label.visible = true
        else:
            floor_label.visible = false
    
    # Update Navigation Buttons
    _update_navigation_buttons()

func _update_navigation_buttons() -> void:
    if nav_buttons == null or location_manager == null:
        return
    
    # Clear existing buttons
    for btn in _cached_buttons:
        if is_instance_valid(btn):
            btn.queue_free()
    _cached_buttons.clear()
    
    var exits = location_manager.get_exits()
    
    # Add travel buttons
    for exit_loc in exits:
        var btn = Button.new()
        btn.text = "🚪 " + location_manager.get_location_name(exit_loc)
        btn.pressed.connect(_on_travel_pressed.bind(exit_loc))
        nav_buttons.add_child(btn)
        _cached_buttons.append(btn)
    
    # Special buttons for dungeon
    if location_manager.current_location == location_manager.LocationType.DUNGEON:
        var btn_exit = Button.new()
        btn_exit.text = "⬇ EXIT"
        btn_exit.pressed.connect(_on_exit_dungeon_pressed)
        nav_buttons.add_child(btn_exit)
        _cached_buttons.append(btn_exit)
        
        var btn_floor = Button.new()
        btn_floor.text = "⬆ NEXT FLOOR"
        btn_floor.pressed.connect(_on_next_floor_pressed)
        nav_buttons.add_child(btn_floor)
        _cached_buttons.append(btn_floor)

func _on_travel_pressed(exit_location: int) -> void:
    if location_manager:
        location_manager.travel_to(exit_location)

func _on_exit_dungeon_pressed() -> void:
    if location_manager:
        location_manager.exit_dungeon()

func _on_next_floor_pressed() -> void:
    if location_manager:
        location_manager.go_up_floor()

func refresh() -> void:
    _last_location = -1  # Force refresh
    _last_floor = -1
    _update_hud()

extends PanelContainer
class_name ElementalPanel

## ElementalPanel - Component untuk menampilkan elemental affinities
## Menggunakan StatRow component untuk tampilan yang konsisten dengan combat stats

# === NODE REFERENCES ===
@onready var elemental_content: VBoxContainer = $ElementalContent
@onready var elemental_grid: GridContainer = $ElementalContent/ElementalGrid

# === PRIVATE VARIABLES ===
var _elemental_affinities: Dictionary = {}
var _parent_stats_tab: VBoxContainer = null

# Map node names to display names and icons
const ELEMENT_CONFIG = {
	"FireElement": {"name": "FIRE", "icon": "🔥", "key": "fire"},
	"WaterElement": {"name": "WATER", "icon": "💧", "key": "water"},
	"EarthElement": {"name": "EARTH", "icon": "🌍", "key": "earth"},
	"WindElement": {"name": "WIND", "icon": "🌪️", "key": "wind"},
	"LightElement": {"name": "LIGHT", "icon": "☀️", "key": "light"},
	"DarkElement": {"name": "DARK", "icon": "🌙", "key": "dark"}
}

# === Lifecycle Methods ===

func _ready():
	_setup_elemental_click_handlers()

# === PUBLIC METHODS ===

## Set reference ke StatsTab parent
func set_parent_stats_tab(tab: VBoxContainer):
	_parent_stats_tab = tab

## Set elemental data
func set_elemental_data(affinities: Dictionary):
	_elemental_affinities = affinities

## Update elemental affinities
func update_affinities(affinities: Dictionary = {}):
	if not affinities.is_empty():
		_elemental_affinities = affinities
	
	for node_name in ELEMENT_CONFIG:
		var row = elemental_grid.get_node_or_null(node_name)
		if row and row.has_method("setup_stat"):
			var config = ELEMENT_CONFIG[node_name]
			var value = _elemental_affinities.get(config.key, 0)
			row.setup_stat(config.name, config.icon, config.key, int(value))

## Reset affinities ke default
func reset_affinities():
	_elemental_affinities = {}
	for node_name in ELEMENT_CONFIG:
		var row = elemental_grid.get_node_or_null(node_name)
		if row and row.has_method("update_value"):
			row.update_value(0)

# === PRIVATE METHODS ===

func _setup_elemental_click_handlers():
	if not elemental_grid:
		return
	
	for child in elemental_grid.get_children():
		if child.has_signal("stat_clicked"):
			if not child.stat_clicked.is_connected(_on_element_clicked):
				child.stat_clicked.connect(_on_element_clicked.bind(child.name))

func _on_element_clicked(element_node_name: String):
	print("[ElementalPanel] Element clicked: ", element_node_name)
	if _parent_stats_tab and _parent_stats_tab.has_method("show_elemental_detail"):
		_parent_stats_tab.show_elemental_detail(element_node_name, _elemental_affinities)

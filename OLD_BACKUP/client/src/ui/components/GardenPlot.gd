extends Control
class_name GardenPlot
## GardenPlot - Individual plot in the private island garden
## Handles display and interaction for a single farming plot

signal plot_clicked(plot_index: int, plot_data: Dictionary)

# Plot state constants
const STATE_EMPTY := "EMPTY"
const STATE_PLANTED := "PLANTED"
const STATE_GROWING := "GROWING"
const STATE_READY := "READY"
const STATE_WITHERED := "WITHERED"

# UI Elements
@onready var plot_panel = $PlotPanel
@onready var plot_icon = $PlotPanel/PlotIcon
@onready var progress_bar = $PlotPanel/ProgressBar
@onready var plot_label = $PlotPanel/PlotLabel

# Plot data
var plot_index: int = -1
var plot_data: Dictionary = {}
var current_state: String = STATE_EMPTY

# Visual colors
const COLORS := {
    STATE_EMPTY: Color(0.3, 0.25, 0.2, 0.8),      # Brown soil
    STATE_PLANTED: Color(0.4, 0.5, 0.3, 0.9),      # Light green
    STATE_GROWING: Color(0.3, 0.6, 0.3, 0.9),      # Growing green
    STATE_READY: Color(0.2, 0.8, 0.2, 1.0),        # Bright green
    STATE_WITHERED: Color(0.4, 0.3, 0.2, 0.8),     # Brown/withered
}

func _ready() -> void:
    # Connect click signal
    plot_panel.gui_input.connect(_on_plot_input)
    
    # Initial state
    _update_visual()

func setup(index: int, data: Dictionary) -> void:
    plot_index = index
    plot_data = data
    
    # Determine state from data
    if data.is_empty():
        current_state = STATE_EMPTY
    else:
        current_state = data.get("status", STATE_EMPTY)
    
    plot_label.text = "Plot %d" % (index + 1)
    _update_visual()

func _update_visual() -> void:
    var color = COLORS.get(current_state, COLORS[STATE_EMPTY])
    
    # Update panel color
    var style = plot_panel.get_theme_default_stylebox().duplicate() if plot_panel.get_theme_default_stylebox() else null
    if style:
        plot_panel.add_theme_stylebox_override("panel", _create_style(color))
    else:
        plot_panel.add_theme_stylebox_override("panel", _create_style(color))
    
    # Update icon based on state
    match current_state:
        STATE_EMPTY:
            plot_icon.text = "🟫"  # Soil
            progress_bar.visible = false
        STATE_PLANTED:
            plot_icon.text = "🌱"  # Seed
            progress_bar.visible = false
        STATE_GROWING:
            plot_icon.text = "🌿"  # Growing
            progress_bar.visible = true
            _update_progress()
        STATE_READY:
            plot_icon.text = "🌾"  # Ready to harvest
            progress_bar.visible = false
        STATE_WITHERED:
            plot_icon.text = "🥀"  # Withered
            progress_bar.visible = false

func _create_style(color: Color) -> StyleBoxFlat:
    var style = StyleBoxFlat.new()
    style.bg_color = color
    style.border_width_left = 2
    style.border_width_top = 2
    style.border_width_right = 2
    style.border_width_bottom = 2
    style.border_color = color.darkened(0.3)
    style.corner_radius_top_left = 8
    style.corner_radius_top_right = 8
    style.corner_radius_bottom_right = 8
    style.corner_radius_bottom_left = 8
    return style

func _update_progress() -> void:
    if plot_data.is_empty():
        progress_bar.value = 0
        return
    
    var planted_at = plot_data.get("plantedAt", 0)
    var growth_time = plot_data.get("growthTime", 60)  # Default 60 seconds
    var current_time = Time.get_unix_time_from_system()
    
    var elapsed = current_time - planted_at
    var progress = min(float(elapsed) / float(growth_time), 1.0)
    progress_bar.value = progress * 100

func update_progress(delta: float) -> void:
    # Called every frame from parent
    if current_state == STATE_GROWING:
        _update_progress()

func _on_plot_input(event: InputEvent) -> void:
    if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        plot_clicked.emit(plot_index, plot_data)

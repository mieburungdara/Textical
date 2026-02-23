extends Control

@onready var progress_bar = $ProgressBar
@onready var percent_label = $PercentLabel
@onready var spark = $ProgressBar/Spark

var _display_percent = 0.0

func update_progress(value: float):

    # Issue 15: Validate input range

    var clamped_value = clamp(value, 0.0, progress_bar.max_value)

    

    if progress_bar:

        progress_bar.value = clamped_value

        # Visual feedback on complete

        if clamped_value >= progress_bar.max_value:

            _on_complete_feedback()

    else:

        push_error("LoadingBar: ProgressBar node missing!")



func set_max_progress(value: float):

    if progress_bar:

        progress_bar.max_value = value

    else:

        push_error("LoadingBar: ProgressBar node missing!")



func _on_complete_feedback():


    var tw = create_tween()
    tw.tween_property(progress_bar, "modulate", Color(1.2, 1.2, 1.5, 1.0), 0.2)
    tw.tween_property(progress_bar, "modulate", Color.WHITE, 0.2)

func _process(_delta):
    if not progress_bar or not percent_label or not spark: return
    
    _display_percent = lerp(_display_percent, float(progress_bar.value), 0.1)
    percent_label.text = "%.1f%%" % _display_percent

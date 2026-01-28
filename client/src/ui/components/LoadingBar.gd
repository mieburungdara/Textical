extends Control

@onready var progress_bar = $ProgressBar
@onready var percent_label = $PercentLabel
@onready var spark = $ProgressBar/Spark

var _display_percent = 0.0

func update_progress(value: float):
    progress_bar.value = value

func _process(_delta):
    _display_percent = lerp(_display_percent, float(progress_bar.value), 0.1)
    percent_label.text = "%.1f%%" % _display_percent
    
    var bar_width = progress_bar.size.x
    var fill_pos = (progress_bar.value / 100.0) * bar_width
    spark.position.x = fill_pos - 2

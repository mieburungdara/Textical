extends TextureRect

@onready var outer_ring = $OuterRing
@onready var inner_ring = $InnerRing
@onready var hexagon = $Hexagon
@onready var rune_ring = $RuneRing
@onready var outer_rune_ring = $OuterRuneRing

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛟ", "ᛞ"]

func _ready():
	_generate_runes(rune_ring, 16, 350, 0.4)
	_generate_runes(outer_rune_ring, 24, 460, 0.2)

func update_animation(delta: float, progress: float):
	var intensity = 0.5 + (progress / 100.0) * 0.5
	self_modulate = Color(1, 1, 1, intensity)
	
	var speed_mult = 1.0 + (progress / 100.0) * 3.0
	rotation += delta * 0.2 * speed_mult
	
	outer_ring.rotation += delta * 0.1 * speed_mult
	inner_ring.rotation -= delta * 0.15 * speed_mult
	hexagon.rotation += delta * 0.8 * speed_mult
	outer_rune_ring.rotation -= delta * 0.4 * speed_mult

func _generate_runes(container, count, radius, opacity):
	for i in range(count):
		var angle = i * (PI * 2 / count)
		var rune = Label.new()
		rune.text = RUNES.pick_random()
		rune.add_theme_font_size_override("font_size", 24)
		rune.add_theme_color_override("font_color", Color(1, 0.8, 0.4, opacity))
		rune.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		var pos = Vector2(cos(angle), sin(angle)) * radius
		rune.position = pos - Vector2(20, 20)
		rune.rotation = angle + PI/2
		container.add_child(rune)

func play_final_flash():
	var tw = create_tween()
	tw.tween_property(self, "scale", Vector2(2, 2), 0.5).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)
	tw.parallel().tween_property(self, "modulate:a", 0.0, 0.5)
	return tw.finished

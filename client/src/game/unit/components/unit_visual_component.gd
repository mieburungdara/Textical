class_name UnitVisualComponent
extends Node

@export var bg_panel: Panel
@export var icon_rect: TextureRect

func setup(data: UnitData, team_id: int):
	if data.icon:
		icon_rect.texture = data.icon
		icon_rect.modulate = data.model_color
	else:
		icon_rect.texture = null
	
	# Team Coloring
	var style = StyleBoxFlat.new()
	style.set_corner_radius_all(8)
	var base_color = data.model_color
	
	if team_id == 0:
		style.bg_color = base_color.lerp(Color.DODGER_BLUE, 0.5)
	else:
		style.bg_color = base_color.lerp(Color.CRIMSON, 0.5)
		
	bg_panel.add_theme_stylebox_override("panel", style)
	
	# Apply scale to owner
	get_parent().scale = Vector2.ONE * data.model_scale

class_name SkillData
extends Resource

enum TargetType { SELF, ENEMY, ALLY, GROUND }
enum AoEPattern { SINGLE, CROSS, SQUARE, CIRCLE }
enum Element { NONE, FIRE, WATER, WIND, EARTH, LIGHTNING, ARCANE }

@export_group("Identity")
@export var id: String = "skill_id"
@export var name: String = "Skill Name"
@export_multiline var description: String = ""
@export var icon: Texture2D
@export var element: Element = Element.NONE

@export_group("Costs & Rules")
@export var mana_cost: int = 0
@export var cooldown_turns: int = 3
@export var range: int = 1
@export var target_type: TargetType = TargetType.ENEMY

@export_group("Area of Effect")
@export var aoe_pattern: AoEPattern = AoEPattern.SINGLE
@export var aoe_size: int = 0 # 0 = 1 tile, 1 = 3x3 or + shape

@export_group("Visuals")
@export var animation_name: String = "attack" # Animation to play on the Unit (e.g. "cast")
@export var vfx_scene: PackedScene # The effect to spawn on target (e.g. Smoke, Fireball)
@export var projectile_scene: PackedScene # Optional: If it shoots something

func get_element_color() -> Color:
	match element:
		Element.FIRE: return Color.ORANGE_RED
		Element.WATER: return Color.DODGER_BLUE
		Element.WIND: return Color.WHITE
		Element.EARTH: return Color.SADDLE_BROWN
		Element.LIGHTNING: return Color.YELLOW
		Element.ARCANE: return Color.CYAN
		_: return Color.WHITE

## Virtual Function: Override this in sub-classes
## Returns a Dictionary containing log data.
## Note: We now pass 'target_pos' (Grid Coordinate) instead of a specific unit.
## We remove the explicit BattleUnit type hint to avoid circular dependency (BattleUnit -> UnitData -> SkillData -> BattleUnit)
func execute(user: Object, target_pos: Vector2i, grid_ref: Object) -> Dictionary:
	return {}

class_name RegionData
extends Resource

enum Biome { VILLAGE, TOWN, FOREST, RUINS, DUNGEON, DESERT, VOLCANO }

@export_group("Identity")
@export var id: String = "region_001"
@export var name: String = "Region Name"
@export var biome: Biome = Biome.FOREST
@export_multiline var description: String = ""

@export_group("Stats")
@export var min_level: int = 1
@export var max_level: int = 10
@export var is_safe_zone: bool = false

@export_group("Content")
## List of monsters that can be found here
@export var encounter_pool: Array[MonsterData] = []
## Items sold if this is a village/town
@export var shop_items: Array[Resource] = [] 
## NPCs present in this region (Quest givers, Job masters)
@export var npcs: Array[Resource] = [] 

@export_group("Connections")
@export var connected_regions: Array[RegionData] = []
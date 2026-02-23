# Region Visual Type Registry

Use these strings in the `type` column of the `RegionTemplate` table to apply the corresponding visual theme and atmosphere.

| Type ID | Scene Name | Description |
| :--- | :--- | :--- |
| `TOWN` | TownScreen.tscn | Golden hour hub with menu grid. |
| `FOREST` | ForestScreen.tscn | Deep green woods with fireflies (Default). |
| `MINE` | MineScreen.tscn | Dark tunnels with floating dust and ore glow. |
| `DUNGEON` | DungeonScreen.tscn | Purple mystic vaults with magic mist. |
| `RUINS` | RuinsScreen.tscn | Desaturated teal ruins with floating ash. |
| `VOLCANO` | VolcanoScreen.tscn | Red/Black theme with rising fire embers. |
| `DESERT` | DesertScreen.tscn | Golden sands with drifting wind particles. |
| `SNOW` | SnowScreen.tscn | Frozen blue theme with falling snowflakes. |
| `SWAMP` | SwampScreen.tscn | Murky green theme with thick toxic fog. |
| `GRAVEYARD` | GraveyardScreen.tscn | Ghostly grey/purple theme with wisps. |
| `OCEAN` | OceanScreen.tscn | Deep underwater blue theme with bubbles. |
| `STORM` | StormScreen.tscn | Dark blue theme with constant rain. |
| `AUTUMN` | AutumnScreen.tscn | Warm orange theme with falling maple leaves. |
| `CORAL` | CoralScreen.tscn | Vibrant turquoise reef with bubbles. |
| `ICE` | GlacierScreen.tscn | Pure white/cyan ice theme with frost dust. |
| `LAVA` | LavaScreen.tscn | Deep magma tubes with fire particles. |
| `FAIRY` | FairyScreen.tscn | Pastel pink glade with floating glitter. |
| `ARENA` | ArenaScreen.tscn | Dusty colosseum theme with battle dust. |
| `CASTLE` | CastleScreen.tscn | High-altitude blue theme with wind streaks. |
| `SHIP` | ShipScreen.tscn | Rotten wood theme with spectral fog. |
| `PRISON` | PrisonScreen.tscn | Cold iron and stone grey theme. |
| `GIANT` | GiantScreen.tscn | Desolate brown wastes with bone dust. |
| `HELL` | HellScreen.tscn | Crimson abyss with falling blood rain. |
| `GARDEN` | GardenScreen.tscn | Vibrant paradise with falling flower petals. |
| `WASTELAND` | WastelandScreen.tscn | Radioactive yellow theme with static noise. |

---

## How to use:
When creating a new Region in the database:
1. Set the `name` to anything you want (e.g., "Mount Drago").
2. Set the `type` to one of the **Type IDs** above (e.g., "VOLCANO").
3. The Godot client will automatically load the correct atmosphere when a player enters that region.

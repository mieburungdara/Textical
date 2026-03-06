# Creatures Folder - Modular Creature Data

## Summary

Created a dedicated `creatures/` folder for creature data, following the same pattern as `classes/` and `races/` folders. This makes the system more modular and flexible.

## Folder Structure

```
server/src/templates/creatures/
├── CreatureBase.ts      # Base interfaces and types
├── slimes.ts           # Slime family (base + variants)
├── skeletons.ts        # Skeleton family (base + variants)
├── wolves.ts          # (to be added)
├── goblins.ts         # (to be added)
├── humans.ts          # (to be added)
├── dragons.ts         # (to be added)
└── index.ts           # Central export
```

## What Was Implemented

### CreatureBase.ts
- `CreatureType` enum (BEAST, UNDEAD, DRAGON, etc.)
- `CreatureRank` enum (NORMAL, ELITE, BOSS, etc.)
- `CreatureTier` enum (TIER_1-5)
- `CreatureTemplate` interface
- `RANK_MULTIPLIERS` and `TIER_SCALING`

### slimes.ts
```
base_slime
├── fire_slime (+element)
├── water_slime (+element)
├── ice_slime (+element)
├── dark_slime (+element)
├── king_slime (BOSS)
└── slime_archer (+class)
```

### skeletons.ts
```
base_skeleton
├── skeleton_warrior (+class)
├── skeleton_archer (+class)
├── skeleton_mage (+class)
├── skeleton_knight (+class)
├── skeleton_assassin (+class)
├── fire_skeleton (+element)
├── dark_skeleton (+element)
└── lich (BOSS)
```

### index.ts
- `CREATURE_TEMPLATES` - Registry of all creatures
- `getCreatureTemplate(id)` - Get by ID
- `getCreaturesByType(type)` - Filter by type
- `getBossCreatures()` - Get all bosses

## Test Results (35 tests passing)

```
✓ Slime variants: Slime, Fire Slime, King Slime
  - Fire Slime abilities: acid_splash, fireball, flame_touch
  - King Slime legendary drops: king_slime_mount
✓ Skeleton variants: Skeleton, Skeleton Warrior, Skeleton Archer, Lich
  - Archer abilities: bone_club, aimed_shot, piercing_arrow, volley
  - Lich abilities: dark_bolt, fireball, ice_bolt, summon_undead, soul_drain, immortality
✓ Creatures by type: BEAST=3, UNDEAD=7
✓ Boss creatures: King Slime, Lich
```

## Benefits

1. **Modular** - Each creature family in separate file
2. **Scalable** - Easy to add new creatures
3. **Organized** - Clear folder structure
4. **Flexible** - Can customize each creature individually
5. **Query Functions** - Built-in filters (by type, rank, tier)

## Next Steps

- Add more creature families (wolves, goblins, humans, dragons, etc.)
- Create more class/element variants
- Add helper functions for spawning creatures

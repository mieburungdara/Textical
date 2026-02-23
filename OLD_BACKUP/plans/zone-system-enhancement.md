# Zone System Enhancement Plan

## Overview
Enhance the existing 3-zone system (Green/Blue/Red) with 2 additional zones: Yellow and Black.

## Zone Progression

| Zone | Color | Risk Level | PvP | Death Effect | Purpose |
|------|-------|------------|-----|--------------|---------|
| **Green** | 🟢 | Safe | None | N/A | Town, market, crafting |
| **Blue** | 🔵 | Low | None | KO only | PvE grinding, farming |
| **Yellow** | 🟡 | Medium | Opt-in Flag | KO + Equipment damage | Transition to PvP |
| **Red** | 🔴 | High | Free-for-all | Permadeath | Hardcore PvP |
| **Black** | ⚫ | Extreme | Free-for-all | Permadeath | Elite/Boss content |

## Detailed Zone Definitions

### 1. Green Zone (Safe Haven)
- **Monsters**: None
- **PvP**: Disabled
- **Features**: Town, market, crafting stations, guild recruitment
- **Death**: N/A (no combat)

### 2. Blue Zone (PvE Safe Ground)
- **Monsters**: Yes (PvE only)
- **Elite Boss**:
  - Spawns **randomly** in the zone (even when no players present)
  - Visible when players enter the area
  - Players can invite others to come and defeat it together
  - Each player faces Elite Boss at **full HP**
  - Disappears after time expires if not defeated
  - Smaller HP pool than World Boss
- **Random Events** (occur periodically):
  - **Resource Surge**: 2x drop rate for all resources
  - **Peaceful Day**: No monsters spawn (safe grinding)
  - **Beast Migration**: New monster types appear with unique drops
- **PvP**: Disabled
- **Death**: Knockout only, no permadeath
- **Features**: Safe farming, resource gathering, leveling

### 3. Yellow Zone (Transition Zone)
- **Monsters**: Yes
- **Elite Boss**:
  - Spawns **randomly** in the zone (even when no players present)
  - Visible when players enter the area
  - Players can invite others to come and defeat it together
  - Each player faces Elite Boss at **full HP**
  - Disappears after time expires if not defeated
  - Smaller HP pool than World Boss
- **PvP**: Opt-in Flagging System
  - Player must activate "Flag" to attack others
  - 5-minute cooldown to unflag
  - Self-defense does not flag the victim
- **Death**:
  - KO state (3-5 minutes)
  - **No unit permadeath** (all units survive)
  - Equipment durability damage only (not loss)
  - Recovery window (1 minute peace)
- **Loot**: Limited (cannot steal equipped items)
- **Purpose**: Bridge for players learning PvP

### 4. Red Zone (Hardcore PvP)
- **Monsters**: Yes
- **PvP**: Free-for-all (no flag needed)
- **Elite Boss**:
  - Spawns **randomly** in the zone (even when no players present)
  - Visible when players enter the area
  - Players can invite others to come and defeat it together
  - Each player faces Elite Boss at **full HP**
  - Disappears after time expires if not defeated
  - Smaller HP pool than World Boss
- **Death**:
  - **Non-main units**: Permadeath (deleted from DB)
  - **Main unit survives but**:
    - Loses **all inventory** (looted by winner)
    - Equipment **durability decreases 2x** (not protected, must repair in town)
- **Loot**: Full inventory lootdrop for winner
- **Purpose**: Hardcore PvP, maximum risk/reward

### 5. Black Zone (Abyssal Danger)
- **Monsters**: Elite-only + **World Boss Guardian**
- **World Boss** (Black Zone Exclusive - Fixed Location):
  - **Fixed location** - Guardian of that specific Black Zone region
  - Players must travel to the specific region to fight it
  - **Always present** at that location (not random spawn)
  - Stays until **defeated by a player**
  - HP **persists** across different players (cumulative damage)
  - HP **resets to full** after 5 minutes of no attacks
  - **Larger HP pool** than Elite Boss
  - Disappears from the region once defeated
- **PvP**: Free-for-all
- **Death**:
  - **All units die** (including main unit)
  - **Main unit respawns in town NAKED** (loses everything except money)
  - Money is the **only thing that doesn't decrease** due to death
- **Combat Lock**: ALL zones (cannot flee from battle - applies to PvE and PvP)
- **Entry Requirement**: Must have 30+ units in party to enter
- **Healing Rules**:
  - **No auto-heal during combat** (unlike other zones)
  - **Can only heal AFTER combat** using potions from inventory
  - Cannot use NPC healing or skills
- **Guild/Faction**: **NO POWER** - Outside guild and faction control
- **Unique Mechanics**:
  - **No Record Keeping**: Kills in Black Zone are NOT recorded
    - No reputation changes with guilds or kingdoms
    - No kill count in player profiles
    - **Moral Penalty Only**: Attacker loses morale, victim unaffected
  - **Unknown Player**: Other players display as "Unknown Player" (no names visible)
  - **Soulbound Equipment**: Equipment found in Black Zone is soulbound (cannot trade/sell)
    - Resources can still be traded/sold normally
  - **Elite Encounters**: Every battle is Elite or higher
  - **World Boss**: 10% chance for unique boss spawns
- **Purpose**: Truly lawless zone with no political consequences, requires large party

## Region Type Assignment

```javascript
const ZONE_BY_TYPE = {
    // GREEN ZONE - Towns (No monsters)
    'TOWN': { zone: 'GREEN', level: [0, 0] },
    'VILLAGE': { zone: 'GREEN', level: [0, 0] },
    
    // BLUE ZONE - Safe PvE (Level 1-5)
    'FOREST': { zone: 'BLUE', level: [1, 3] },
    'GARDEN': { zone: 'BLUE', level: [1, 3] },
    'OCEAN': { zone: 'BLUE', level: [2, 4] },
    'CORAL': { zone: 'BLUE', level: [2, 4] },
    'FAIRY': { zone: 'BLUE', level: [2, 4] },
    'AUTUMN': { zone: 'BLUE', level: [3, 5] },
    
    // YELLOW ZONE - Transition PvP (Level 4-6)
    'MINE': { zone: 'YELLOW', level: [4, 5] },
    'SNOW': { zone: 'YELLOW', level: [4, 6] },
    'SWAMP': { zone: 'YELLOW', level: [5, 6] },
    'DESERT': { zone: 'YELLOW', level: [5, 6] },
    'GLACIER': { zone: 'YELLOW', level: [5, 6] },
    
    // RED ZONE - Hardcore PvP (Level 7-9)
    'DUNGEON': { zone: 'RED', level: [7, 8] },
    'RUINS': { zone: 'RED', level: [7, 8] },
    'STORM': { zone: 'RED', level: [7, 9] },
    'CASTLE': { zone: 'RED', level: [7, 9] },
    'PRISON': { zone: 'RED', level: [8, 9] },
    'SHIP': { zone: 'RED', level: [8, 9] },
    
    // BLACK ZONE - Elite/Boss (Level 10+)
    'VOLCANO': { zone: 'BLACK', level: [10, 10] },
    'LAVA': { zone: 'BLACK', level: [10, 10] },
    'HELL': { zone: 'BLACK', level: [10, 10] },
    'GRAVEYARD': { zone: 'BLACK', level: [10, 10] },
    'WASTELAND': { zone: 'BLACK', level: [10, 10] },
    'ARENA': { zone: 'BLACK', level: [10, 10] }
};
```

## Implementation Tasks

### 1. Database Schema Update
- Add `ZoneType` enum with 5 values
- Add `zoneType` field to `RegionTemplate`
- Create `ZoneConfig` table for zone rules

### 2. Backend Services
- `DeathResolver.js` - Handle Yellow zone KO, Black zone mechanics
- `RewardProcessor.js` - Zone-aware loot distribution
- `TravelService.js` - Zone transition validation
- `BattleService.js` - Combat lock for Black Zone
- `HealService.js` - Healing restriction in Black Zone

### 3. Seed Script
- `seed_zone_types.js` - Assign zones to existing regions

### 4. Client Updates
- `WorldAtlas.gd` - Zone color indicators on map
- `LoadingScreen.gd` - Zone-specific tips
- UI indicators for zone boundaries

### 5. Documentation
- Update `docs/CONCEPT_ADVENTURE.md`
- Update `docs/REGION_TYPES.md`
- Create zone-specific rules documentation

## Priority

| Phase | Zone | Effort | Reason |
|-------|------|--------|--------|
| 1 | Yellow | Medium | New PvP mechanics needed |
| 2 | Black | High | Combat lock + no healing system |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Black Zone too punishing | Provide clear warnings before entry |
| Zone transition confusion | UI indicators on map |
| Elite spawn too frequent | Adjust World Boss rate |
| Combat lock frustrating | Clear UI indication when in combat |
| 30+ unit requirement too high | Allow flexible party size for testing |

## Zone Comparison Summary

| Feature | Green | Blue | Yellow | Red | Black |
|---------|-------|------|--------|-----|-------|
| Monsters | None | PvE | PvE+PvP | PvE+PvP | Elite+ |
| PvP | ❌ | ❌ | ⚠️ Opt-in | ⚔️ All | ⚔️ All |
| **Death Effect** | N/A | KO only | No death | Non-main die | All die |
| **Main Unit** | N/A | Survives | Survives | Survives | **Naked** |
| **Inventory** | N/A | Safe | Safe | Lost | **Lost** |
| **Equipment** | N/A | Safe | Durability ↓ | **Durability 2x ↓** | **Lost** |
| **Money** | N/A | Safe | Safe | Safe | **Safe** |
| **Auto-Heal** | ✅ | ✅ | ✅ | ✅ | **❌ No** |
| **Potion Heal** | ✅ | ✅ | ✅ | ✅ | **Post-combat only** |
| Retreat | ✅ | ✅ | ✅ | ✅ | ❌ Lock |
| **Boss Type** | None | Elite Boss | Elite Boss | Elite Boss | **World Boss Guardian** |
| **Boss Spawn** | N/A | Random (always present) | Random (always present) | Random (always present) | **Fixed Location** |
| **Boss HP** | N/A | Full per player | Full per player | Full per player | **Persistent (cumulative)** |
| **HP Reset** | N/A | Each player | Each player | Each player | **5 min idle = Full** |
| **Invite Others** | N/A | ✅ Yes | ✅ Yes | ✅ Yes | N/A (fixed location) |
| **Record** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | **❌ None** |
| **Guild/Faction** | ✅ Active | ✅ Active | ✅ Active | ✅ Active | **❌ No Power** |
| **Entry Req** | None | None | None | None | **30+ units** |
| **Player ID** | Visible | Visible | Visible | Visible | **Unknown** |
| **Soulbound** | ❌ | ❌ | ❌ | ❌ | **Equipment** |

## Testing Requirements

- [ ] Yellow zone: No unit permadeath, only equipment durability loss
- [ ] Yellow zone flagging cooldown works
- [ ] Yellow zone KO recovery window functions
- [ ] Red zone: Non-main units die permanently
- [ ] Red zone: Main unit survives but loses inventory
- [ ] Red zone: Main unit equipment remains but durability reduced
- [ ] Black zone: All units die including main unit
- [ ] Black zone: Main unit respawns naked (only money remains)
- [ ] Black zone healing completely disabled
- [ ] Black zone combat lock prevents retreat
- [ ] World Boss spawn rate is balanced
- [ ] Black zone entry requires 30+ units
- [ ] Black zone players display as "Unknown Player"
- [ ] Soulbound equipment cannot be traded/sold
- [ ] Resources from Black zone can be traded normally
- [ ] Zone transitions are smooth
- [ ] Death rules match zone type

# Travel System & Map Data Implementation Plan

**Version:** 1.0.0  
**Created:** 2026-02-23  
**Status:** Ready for Implementation  
**Target:** Godot 4.5 Client + Node.js Server + SQLite/Prisma Database

---

## 1. Executive Summary

Dokumen ini berisi rencana implementasi untuk Travel System dan Map Data di Textical. Sistem sudah terdokumentasi secara komprehensif di:

- [`docs/TRAVEL_SYSTEM.md`](../docs/TRAVEL_SYSTEM.md) - Full travel system documentation
- [`docs/konsep/MAP_SYSTEM.md`](../docs/konsep/MAP_SYSTEM.md) - Full map system documentation
- [`plans/MAPS.json`](../plans/MAPS.json) - Grid terrain layout
- [`plans/maps/`](../plans/maps/) - Zone-specific map data files

### Sistem yang Sudah Ada (Fully Implemented):
| Component | Status | Documentation |
|-----------|--------|---------------|
| Travel API | ✅ Implemented | docs/TRAVEL_SYSTEM.md |
| Region System | ✅ Implemented | docs/TRAVEL_SYSTEM.md |
| Travel Animation | ✅ Implemented | Client: MapTravelSystem.gd |
| Bandit Ambush | ✅ Implemented | TravelIncidentResolver.js |
| Fast Travel (Tavern) | ✅ Implemented | tavernService.js |

---

## 2. Current Architecture

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Godot 4.5)                        │
├─────────────────────────────────────────────────────────────────┤
│  WorldAtlas.gd         - Map overlay (travel + treasure)         │
│  MapScreen.gd         - Standalone 35x35 grid map viewer       │
│  MapTravelSystem.gd   - Travel animation & path rendering       │
│  MapInfoPanel.gd      - Region info display                     │
│  MapCamera.gd         - Camera control                          │
│  GameState.gd         - Global state (currentRegion, etc)        │
│  DataManager.gd       - Region data caching                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Node.js + Express)                  │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/action/travel   - Initiate travel                   │
│  GET  /api/regions         - Get all regions                   │
│  GET  /api/region/:id      - Get region details                │
│  GET  /api/world/state     - Get world state                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite + Prisma)                    │
├─────────────────────────────────────────────────────────────────┤
│  RegionTemplate          - 70+ fields per region                │
│  RegionConnection        - Travel routes between regions        │
│  TaskQueue               - Active travel tasks                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Map Grid System

- **Grid Size:** 35 x 35 (1,225 total cells)
- **Coordinate System:** x * 35 + y = regionId
- **Zone Types:** WATER, GREEN, BLUE, YELLOW, RED, BLACK, CITADEL, VILLAGE, BRIDGE, CHASM, BOSS
- **Regions Created:** 1,225 (all grid cells become playable regions)

#### Zone Distribution (1,225 Regions Total)

| Zone Type | Count | Description |
|-----------|-------|-------------|
| YELLOW | 324 | Moderate danger zones |
| BLUE | 240 | Intermediate danger zones |
| WATER | 240 | Requires boat traversal |
| GREEN | 176 | Safe starter areas |
| RED | 168 | High danger zones |
| CHASM | 44 | Fly-only zones |
| BLACK | 20 | Extreme danger (min 30 units) |
| CITADEL | 4 | Royal cities (starting points) |
| VILLAGE | 4 | Safe rest points |
| BRIDGE | 4 | Connection passages |
| BOSS | 1 | World boss location |

> **Note:** Data ini TIDAK redundant. Setiap cell dalam 35x35 grid menjadi satu region yang dapat dimainkan. seed_regions.js secara otomatis membuat RegionTemplate untuk semua 1,225 coordinates.

### 2.3 Two Map Implementations (BERBEDA FUNGSI)

There are **TWO** map implementations in the client with **DIFFERENT** purposes:

| File | Type | Primary Purpose | Key Features |
|------|------|-----------------|--------------|
| [`WorldAtlas.gd`](../client/src/ui/WorldAtlas.gd) | Overlay | Travel + Treasure Map | Travel cinematic, path rendering, treasure dig UI |
| [`MapScreen.gd`](../client/src/ui/map/MapScreen.gd) | Standalone Screen | World Map Explorer | 35x35 grid view, pan/zoom, click region info |

**Penjelasan:**
- **WorldAtlas.gd** = Overlay yang muncul SAAT travel, fokus ke animasi perjalanan dan treasure map
- **MapScreen.gd** = Layar dedicated untuk MELIHAT peta dunia penuh (35x35 grid), pan/zoom, pilih region

**Kesimpulan:** Mereka BUKAN duplikasi tapi **komponen berbeda** yang saling melengkapi.

---

## 3. Implementation Roadmap

### Phase 1: Core Travel System ✅ COMPLETED
- [x] Travel API endpoint (POST /action/travel)
- [x] Region data model (RegionTemplate - 70+ fields)
- [x] Region connections (RegionConnection)
- [x] Travel task queue (TaskQueue)
- [x] Energy cost system (5 energy per travel)
- [x] Travel duration (15 seconds server-side)

### Phase 2: Client Implementation ✅ COMPLETED
- [x] WorldAtlas.gd - Map overlay (travel + treasure map)
- [x] MapScreen.gd - Standalone 35x35 grid map viewer
- [x] MapTravelSystem.gd - Cinematic animation
- [x] MapInfoPanel.gd - Region info display
- [x] GameState.gd - State management
- [x] Region data caching

### Phase 3: Travel Incidents ✅ COMPLETED
- [x] Bandit ambush system
- [x] Spirit encounters
- [x] Ambient signs/messages
- [x] Escort protection

### Phase 4: Advanced Features 📋 IN PROGRESS
- [ ] Fast Travel via Tavern (tavernService.js - exists but needs integration)
- [ ] World map optimization
- [ ] Zone-specific visual themes
- [ ] Player discovery system

---

## 4. Data Structures

### 4.1 RegionTemplate Schema

```prisma
model RegionTemplate {
  // Core
  id              Int     @id
  name            String
  description     String
  visualType      String  @default("TOWN")
  zoneType        String  @default("GREEN")
  zoneLevel       Int     @default(1)
  isSafeZone      Boolean @default(true)
  
  // Position & Navigation
  gridX           Int     @default(0)
  gridY           Int     @default(0)
  traversalType   TraversalType @default(WALK)
  
  // Danger & Combat
  dangerLevel     Int     @default(1)
  banditThreatLevel Float  @default(0.0)
  spiritDensity   Float   @default(0.0)
  corruptionLevel Float   @default(0.0)
  
  // Resources
  resourceModifier    Float @default(1.0)
  resourceScarcity   Float @default(1.0)
  regionalTaxRate    Float @default(0.10)
  
  // Requirements
  requiredLevel       Int  @default(1)
  minRequiredUnits    Int  @default(0)
  minRequiredHeroLevel Int @default(1)
}
```

### 4.2 Travel API Request/Response

**Request:**
```json
{
  "userId": 1,
  "targetRegionId": 2
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "type": "TRAVEL",
    "status": "RUNNING",
    "startedAt": 1739312400000,
    "finishesAt": 1739312415000,
    "originRegionId": 1,
    "targetRegionId": 2,
    "targetRegion": {
      "id": 2,
      "name": "Forest of Beginnings",
      "visualType": "forest"
    }
  }
}
```

**Response (Ambush):**
```json
{
  "success": true,
  "data": {
    "status": "AMBUSHED",
    "message": "Bandits have ambushed you on the road!",
    "ransomCost": 150,
    "regionId": 5
  }
}
```

---

## 5. Map Data Files

### 5.1 File Structure

```
plans/
├── MAPS.json              # Terrain layout (35x35 grid)
├── maps/
│   ├── _meta.json         # Map metadata
│   ├── GREEN.json         # Green zone regions
│   ├── BLUE.json          # Blue zone regions
│   ├── YELLOW.json        # Yellow zone regions
│   ├── RED.json           # Red zone regions
│   ├── BLACK.json         # Black zone regions
│   ├── WATER.json         # Water zones
│   ├── CITADEL.json       # Citadel zones
│   ├── VILLAGE.json       # Village zones
│   ├── BRIDGE.json        # Bridge zones
│   ├── CHASM.json         # Chasm zones
│   └── BOSS.json          # Boss zones
```

### 5.2 Zone Properties Reference

| Zone Type | Zone Level | Bandit Threat | Safe Zone | Min Units | Traversal |
|-----------|------------|---------------|-----------|-----------|----------|
| CITADEL | 0 | 0% | Yes | 0 | WALK |
| VILLAGE | 1 | 5% | Yes | 0 | WALK |
| WATER | 1 | 5% | No | 0 | BOAT |
| GREEN | 1-2 | 10% | Yes | 0 | WALK |
| BLUE | 2-3 | 20% | No | 0 | WALK |
| BRIDGE | 2-4 | 25% | No | 0 | WALK |
| YELLOW | 3-4 | 35% | No | 0 | WALK |
| CHASM | 3-5 | 40% | No | 0 | FLY |
| RED | 4-5 | 50% | No | 0 | WALK |
| BOSS | 6+ | 60% | No | 0 | WALK |
| BLACK | 5-6 | 80% | No | 30 | WALK |

---

## 6. Implementation Checklist

### Server-Side
- [x] TravelService.js - Main travel logic
- [x] TravelController.js - API endpoint handler
- [x] RegionRepository.js - Region data access
- [x] TravelIncidentResolver.js - Bandit/spirit encounters
- [x] tavernService.js - Fast travel system

### Client-Side
- [x] WorldAtlas.gd - Map overlay controller (travel + treasure map)
- [x] MapScreen.gd - Standalone world map screen (35x35 grid view)
- [x] MapTravelSystem.gd - Travel animation
- [x] MapInfoPanel.gd - Info display
- [x] MapCamera.gd - Camera control
- [x] WorldHandler.gd - Network calls
- [x] GameState.gd - State management

### Database
- [x] RegionTemplate model (70+ fields)
- [x] RegionConnection model
- [x] TaskQueue model
- [x] User model (currentRegion, active task fields)

---

## 7. Travel Rules Summary

| Parameter | Value | Description |
|-----------|-------|-------------|
| Energy Cost | 5 | Deducted on travel initiation |
| Duration | 15s | Server-side travel time |
| Animation | 5s | Client-side cinematic |
| From Wilderness | ❌ Disabled | Must return to town first |
| Black Zone | 30+ units | Minimum party size |

### Validation Checks
1. Player must not be unconscious (knocked out)
2. Player must not be in recovery window
3. Player must have at least 5 energy
4. Player must not have active tasks
5. RegionConnection must exist between origin and target
6. Player must meet level/unit requirements for BLACK zones

---

## 8. Visual Themes (25 Types)

| Theme | Scene File | Atmosphere |
|-------|------------|------------|
| TOWN | TownScreen.tscn | Golden hour |
| FOREST | ForestScreen.tscn | Fireflies |
| MINE | MineScreen.tscn | Ore glow |
| DUNGEON | DungeonScreen.tscn | Magic mist |
| RUINS | RuinsScreen.tscn | Floating ash |
| VOLCANO | VolcanoScreen.tscn | Fire embers |
| DESERT | DesertScreen.tscn | Drifting sand |
| SNOW | SnowScreen.tscn | Snowflakes |
| SWAMP | SwampScreen.tscn | Toxic fog |
| GRAVEYARD | GraveyardScreen.tscn | Ghostly wisps |
| OCEAN | OceanScreen.tscn | Bubbles |
| STORM | StormScreen.tscn | Rain |
| AUTUMN | AutumnScreen.tscn | Maple leaves |
| CORAL | CoralScreen.tscn | Vibrant bubbles |
| ICE | GlacierScreen.tscn | Frost dust |
| LAVA | LavaScreen.tscn | Fire particles |
| FAIRY | FairyScreen.tscn | Floating glitter |
| ARENA | ArenaScreen.tscn | Battle dust |
| CASTLE | CastleScreen.tscn | Wind streaks |
| SHIP | ShipScreen.tscn | Spectral fog |
| PRISON | PrisonScreen.tscn | Cold iron |
| GIANT | GiantScreen.tscn | Bone dust |
| HELL | HellScreen.tscn | Blood rain |
| GARDEN | GardenScreen.tscn | Flower petals |
| WASTELAND | WastelandScreen.tscn | Static noise |

---

## 9. Next Steps / Enhancement Ideas

### Priority 1 - Quick Wins
- [ ] Integrate tavernService.js with client for fast travel
- [ ] Add more region connections for exploration
- [ ] Implement world map minimap in HUD

### Priority 2 - Gameplay Enhancements
- [ ] Scouting power for Archer/Rogue heroes
- [ ] Random world events (treasure chests, merchants)
- [ ] Chain quests spanning multiple regions

### Priority 3 - Advanced Features
- [ ] Global world boss encounters
- [ ] Faction territory control
- [ ] Dynamic weather effects on travel speed
- [ ] Mount system for faster travel

---

## 10. Reference Links

### Documentation
- [Travel System Documentation](../docs/TRAVEL_SYSTEM.md)
- [Map System Documentation](../docs/konsep/MAP_SYSTEM.md)
- [Region Types Reference](../docs/REGION_TYPES.md)
- [API Reference](../docs/konsep/API.md)
- [Combat System](../docs/COMBAT_SYSTEM.md)

### Source Code
- Server: `server/src/services/travelService.js`
- Server: `server/src/controllers/TravelController.js`
- Server: `server/src/logic/world/TravelIncidentResolver.js`
- Client: `client/src/ui/WorldAtlas.gd` (overlay with travel + treasure)
- Client: `client/src/ui/map/MapScreen.gd` (standalone 35x35 grid map)
- Client: `client/src/autoload/game_state.gd`

### Database
- Schema: `server/prisma/schema.prisma` (RegionTemplate, RegionConnection, TaskQueue)
- Seeds: `server/prisma/seed_regions.js`

---

## 11. Migration Notes

### Adding New Regions
1. Add region data to appropriate zone JSON file in `plans/maps/`
2. Create migration: `npx prisma migrate dev --name add_new_region`
3. Seed data will be auto-generated from map data
4. Restart server to load new regions

### Updating Zone Properties
1. Edit zone defaults in `plans/maps/{ZONE}.json`
2. Regenerate map data if needed
3. Test with development server

---

## 12. Catatan Penting: Apakah 1225 Regions Redundant?

### Jawaban: TIDAK - Data Ini Valid

Setiap cell dalam 35x35 grid (1,225 cells) telah dirancang untuk menjadi region yang dapat dimainkan. Berikut penjelasannya:

| Pertanyaan | Jawaban |
|------------|---------|
| Apakah semua 1,225 region dibuat di database? | Ya, via `seed_regions.js` |
| Apakah pemain bisa посещать semua region? | Ya, selama ada RegionConnection |
| Apakah ada batasan? | WATER memerlukan boat, CHASM memerlukan fly mount |

### Jika Ingin Mengurangi Jumlah Region

Jika ingin mengurangi jumlah region (misal: hanya 100-200 region utama), maka:

1. **Edit `plans/maps/{ZONE}.json`** - Hapus coordinate yang tidak diinginkan
2. **Jalankan ulang seed** - `npx prisma migrate dev --name reduce_regions`
3. **Test connectivity** - Pastikan region yang tersisa masih terhubung

### Zone yang Mungkin Ingin Dikurangi/Dihapus:
- WATER (240) - Bisa dibuat non-playable ocean
- CHASM (44) - Mungkin terlalu banyak fly zones
- Beberapa RED/YELLOW zones di area yang jarang dikunjungi

---

*Document Version: 1.0.1*  
*Last Updated: 2026-02-23*

---

## 13. Legacy Region Files - DELETED

### Old Region Files (Previously Existed)
Location: `server/public/assets/raw/regions/`

| File | ID | Name | Description | ZoneType |
|------|-----|------|-------------|----------|
| 1.json | 1 | Oakhaven Hub | The Town | GREEN |
| 2.json | 2 | Iron Mine | Ore Mine | GREEN |
| 3.json | 3 | Crystal Depths | Gems | GREEN |
| 4.json | 4 | Elm Forest | Lumber | GREEN |
| 5.json | 5 | Forbidden Grove | Dark | GREEN |

**Status**: ✅ **DELETED** - These old files have been removed from the project.

### New Map System
Location: `plans/maps/`

| Property | Value |
|----------|-------|
| Grid Size | 35x35 = 1,225 regions |
| Zone Types | 11 (WATER, YELLOW, RED, CHASM, GREEN, BLUE, CITADEL, BRIDGE, VILLAGE, BLACK, BOSS) |
| Region ID Formula | `x * 35 + y` |
| Version | 1.0.0 |

### Old vs New Comparison

| Aspect | Old System | New System |
|--------|------------|------------|
| Total Regions | 5 | 1,225 |
| Grid Layout | Manual connections | 35x35 automatic grid |
| Zone Types | 1 (GREEN only) | 11 zone types |
| Structure | Simple JSON | Zone-separated JSON files |
| City/Town | 1 (Oakhaven) | 8 (4 Citadel + 4 Village) |

---

*Document Version: 1.0.2*  
*Last Updated: 2026-02-23*

---

## 14. Player Starting Region

### Current Configuration
Location: `server/prisma/seed_users.js` line 103

```javascript
currentRegion: 180, // Start at Northwind Citadel (ID 180)
```

### Region Details:
| ID | Name | Type | Grid Position |
|----|------|------|---------------|
| 1 | Oakhaven Hub | TOWN | gridX=0, gridY=0 |
| 180 | Northwind Citadel | ROYAL | gridX=5, gridY=5 |

### Issue
Player saat ini dimulai di **Northwind Citadel (ID 180)** bukan **Oakhaven Hub (ID 1)**.

Apakah ingin ubah ke Oakhaven? Jika ya, perlu:
1. Edit `server/prisma/seed_users.js` - ubah `currentRegion: 180` → `currentRegion: 1`
2. Re-run seed atau update existing users

---

*Document Version: 1.0.3*  
*Last Updated: 2026-02-23*

# Wagon System - Modular Folder Structure Proposal

> **Status**: Proposal for Implementation
> **Created**: 2026-02-17

---

## Executive Summary

Dokumen ini mengusulkan struktur folder modular untuk sistem Wagon yang terpisah di sisi server dan client. Tujuannya adalah:
- **Modularitas**: Memisahkan wagon dari sistem lain
- **Maintainability**: Mudah menemukan dan memodifikasi kode terkait wagon
- **Isolasi**: Pengembangan wagon tidak mempengaruhi sistem lain

---

## 1. Current State Analysis

### 1.1 Server Side (Current)

```
server/src/
├── services/
│   └── logistics/
│       ├── HaulingService.js   ← Wagon service
│       └── LootService.js      ← Related (loot interruption)
├── scripts/
│   ├── hauling_rental_audit.js
│   ├── hauling_master_audit.js
│   ├── inventory_wagon_capacity_audit.js
│   ├── loot_interruption_*.js  (5 files)
│   └── ...
└── routes/
    └── api.js                  ← No wagon endpoints exposed
```

**Issues:**
- Wagon service berada di folder `logistics` yang umum
- Tidak ada controller/route khusus wagon
- Scripts tersebar di folder scripts utama

### 1.2 Client Side (Current)

```
client/src/
├── network/
│   ├── InventoryHandler.gd    ← Maybe wagon-related
│   └── ...
├── ui/
│   ├── TownScreen.gd          ← Wagon rental UI potential
│   └── ...
└── assets/
    └── (no wagon-specific assets)
```

**Issues:**
- Tidak ada folder/handler khusus wagon
- UI wagon terintegrasi dengan TownScreen
- Tidak ada asset/prefab wagon

---

## 2. Proposed Server Structure

### 2.1 Folder Structure

```
server/src/
├── wagon/
│   ├── index.js                    # Export barrel
│   │
│   ├── controllers/
│   │   └── WagonController.js      # REST API endpoints
│   │
│   ├── services/
│   │   ├── HaulingService.js       # Core hauling logic
│   │   ├── WagonValidator.js        # Validation rules
│   │   ├── AmbushCalculator.js     # Ambush probability
│   │   └── WagonEventEmitter.js    # Event handling
│   │
│   ├── routes/
│   │   └── wagonRoutes.js          # Express router
│   │
│   ├── models/
│   │   ├── Wagon.js                # Prisma model wrapper
│   │   └── WagonItem.js            # Prisma model wrapper
│   │
│   ├── dto/
│   │   ├── RentWagonDTO.js         # Input validation
│   │   ├── LoadItemDTO.js
│   │   ├── UnloadItemDTO.js
│   │   └── WagonStatusDTO.js
│   │
│   ├── constants/
│   │   ├── WagonTiers.js            # TIER_CAPACITY mapping
│   │   ├── WagonErrors.js          # Error codes
│   │   └── WagonConfig.js          # Game balance constants
│   │
│   └── events/
│       ├── WagonEvents.js           # Event definitions
│       └── WagonEventHandler.js     # Event listeners
│
├── services/
│   └── logistics/                  # Keep for backward compatibility
│       ├── HaulingService.js        # Re-export from wagon/
│       └── LootService.js          # Related but separate
│
└── scripts/
    ├── wagon/                       # Dedicated audit scripts
    │   ├── hauling_rental_audit.js
    │   ├── hauling_master_audit.js
    │   ├── inventory_wagon_capacity_audit.js
    │   └── wagon_integration_test.js
    │
    └── loot/                        # Keep related loot scripts
        ├── loot_interruption_master_audit.js
        ├── loot_interruption_battle_audit.js
        └── loot_service_audit.js
```

### 2.2 File Descriptions

| File | Responsibility |
|------|----------------|
| `WagonController.js` | Handle HTTP requests for wagon operations |
| `HaulingService.js` | Core business logic for rental, loading, unloading |
| `WagonValidator.js` | Validate wagon operations |
| `AmbushCalculator.js` | Calculate ambush probability based on zone |
| `WagonEventEmitter.js` | Emit events for wagon state changes |
| `WagonRoutes.js` | Express router configuration |
| `WagonTiers.js` | Constants for tier capacities and costs |
| `WagonErrors.js` | Error code definitions |

### 2.3 Export Barrel (index.js)

```javascript
// server/src/wagon/index.js
module.exports = {
    // Controllers
    WagonController: require('./controllers/WagonController'),
    
    // Services
    HaulingService: require('./services/HaulingService'),
    WagonValidator: require('./services/WagonValidator'),
    AmbushCalculator: require('./services/AmbushCalculator'),
    
    // Constants
    WAGON_TIERS: require('./constants/WagonTiers'),
    WAGON_ERRORS: require('./constants/WagonErrors'),
    
    // Models
    Wagon: require('./models/Wagon'),
    WagonItem: require('./models/WagonItem'),
};
```

---

## 3. Proposed Client Structure

### 3.1 Folder Structure

```
client/src/
├── ui/
│   └── wagon/                       # Wagon UI screens
│       ├── WagonScreen.gd           # Main wagon management
│       ├── WagonScreen.tscn
│       ├── WagonRentalPanel.gd      # Rental UI
│       ├── WagonRentalPanel.tscn
│       ├── WagonCargoPanel.gd       # Loading/Unloading UI
│       ├── WagonCargoPanel.tscn
│       ├── WagonStatusHUD.gd       # In-game status indicator
│       └── WagonStatusHUD.tscn
│
├── network/
│   └── WagonHandler.gd              # API communication
│
├── components/
│   └── wagon/
│       ├── WagonSlot.gd             # Single cargo slot
│       ├── WagonSlot.tscn
│       ├── WagonTierButton.gd       # Tier selection button
│       ├── WagonTierButton.tscn
│       ├── WagonProgressBar.gd      # Hauling progress
│       ├── WagonProgressBar.tscn
│       └── WagonIcon.gd             # Visual representation
│
├── managers/
│   └── WagonManager.gd              # Client-side state management
│
├── scenes/
│   └── wagon/
│       ├── WagonWorldObject.tscn     # Wagon in world view
│       └── WagonEffects.tscn         # VFX for wagon
│
└── assets/
    └── wagon/
        ├── sprites/
        │   ├── wagon_small.png
        │   ├── wagon_medium.png
        │   ├── wagon_large.png
        │   └── wagon_heavy.png
        ├── icons/
        │   ├── tier_small.png
        │   ├── tier_medium.png
        │   ├── tier_large.png
        │   └── tier_heavy.png
        └── vfx/
            ├── wagon_move.tres
            ├── wagon_ambush.tres
            └── wagon_arrive.tres
```

### 3.2 File Descriptions

| File | Responsibility |
|------|----------------|
| `WagonScreen.gd` | Main screen for wagon management |
| `WagonRentalPanel.gd` | UI for renting wagon (tier selection) |
| `WagonCargoPanel.gd` | UI for loading/unloading items |
| `WagonStatusHUD.gd` | In-game indicator showing active wagon |
| `WagonHandler.gd` | Network communication with server |
| `WagonManager.gd` | Client state and logic |
| `WagonSlot.gd` | Individual cargo slot component |
| `WagonTierButton.gd` | Selectable tier button |
| `WagonProgressBar.gd` | Show hauling progress |
| `WagonWorldObject.tscn` | Wagon visual in world map |

---

## 4. API Endpoints Design

### 4.1 REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wagon/status` | Get active wagon status |
| POST | `/wagon/rent` | Rent a new wagon |
| POST | `/wagon/load` | Load item to wagon |
| POST | `/wagon/unload` | Unload item from wagon |
| POST | `/wagon/complete` | Complete hauling journey |
| DELETE | `/wagon/cancel` | Cancel active wagon |
| GET | `/wagon/tiers` | Get available tiers |

### 4.2 Socket Events (Future)

```javascript
// Client → Server
'wagon:rent'
'wagon:load'
'wagon:unload'
'wagon:complete'
'wagon:cancel'

// Server → Client
'wagon:status_update'
'wagon:ambush_warning'
'wagon:journey_complete'
'wagon:cargo_updated'
```

---

## 5. Integration Points

### 5.1 Server Integration

| System | Integration Point |
|--------|-------------------|
| Travel System | Trigger `completeHaul()` on arrival |
| Inventory System | `hasSpace()` checks wagon capacity |
| Battle System | `RewardProcessor` destroys wagon on defeat |
| Quest System | New quest type: "Hauling Quest" |
| Economy System | Silver deduction for rental |

### 5.2 Client Integration

| Screen | Integration |
|--------|--------------|
| TownScreen | Add "Rent Wagon" button |
| InventoryScreen | Show "Load to Wagon" option |
| MapTravelSystem | Show wagon icon during hauling |
| SideHUD | Show wagon status indicator |

---

## 6. Migration Plan

### Phase 1: Create Folder Structure
1. Create `server/src/wagon/` folder
2. Move `HaulingService.js` to wagon/services/
3. Create controller and routes
4. Register routes in api.js

### Phase 2: Client Structure
1. Create `client/src/ui/wagon/` folder
2. Create `WagonHandler.gd` in network/
3. Create UI components
4. Integrate with TownScreen

### Phase 3: Refactor & Cleanup
1. Update imports across services
2. Remove duplicate code
3. Create audit scripts in wagon/scripts/
4. Add documentation

---

## 7. Benefits

### 7.1 Modularity
- Wagon system completely isolated
- Easy to enable/disable feature
- Clear boundaries with other systems

### 7.2 Maintainability
- All wagon code in one place
- Easy to find related files
- Clear responsibility per file

### 7.3 Scalability
- Easy to add new features (escort, upgrades)
- Can create versioned APIs
- Modular testing possible

### 7.4 Developer Experience
- New developers can find wagon code easily
- Clear API contracts
- Better code organization

---

## 8. Implementation Checklist

### Server Side
- [ ] Create `server/src/wagon/` directory
- [ ] Create `index.js` barrel export
- [ ] Move `HaulingService.js` to `wagon/services/`
- [ ] Create `WagonController.js`
- [ ] Create `wagonRoutes.js`
- [ ] Create constants (`WagonTiers.js`, `WagonErrors.js`)
- [ ] Create DTOs for validation
- [ ] Register routes in `api.js`
- [ ] Create audit scripts in `server/scripts/wagon/`

### Client Side
- [ ] Create `client/src/ui/wagon/` directory
- [ ] Create `WagonHandler.gd` in network/
- [ ] Create `WagonManager.gd` in managers/
- [ ] Create UI screens and components
- [ ] Add assets (sprites, icons, VFX)
- [ ] Integrate with existing screens

---

## 9. Considerations

### 9.1 Backward Compatibility
- Keep re-exports in old locations
- Deprecate old imports with warnings
- Provide migration guide

### 9.2 Testing Strategy
- Unit tests per service
- Integration tests for API
- E2E tests for complete flow
- Load tests for performance

### 9.3 Security
- Validate wagon ownership
- Check user location for rental
- Rate limiting for API endpoints
- Anti-cheat for capacity exploits

---

*Document generated for Textical Wagon System Refactoring - 2026-02-17*

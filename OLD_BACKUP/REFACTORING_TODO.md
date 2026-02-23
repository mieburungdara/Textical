# Refactoring TODO - Textical Game Engine

> Last Updated: 2026-02-16

> This document lists remaining refactoring tasks that need to be addressed.
> Items marked as ACCEPTABLE are working as intended and do not require changes.

---

## 🚨 CRITICAL - Requires Action

### 1. Deprecated Services

#### VitalityService (Needs Migration)
| ID | Item | Details |
|----|------|---------|
| DEP-001 | **VitalityService** | `server/src/services/vitalityService.js` |
| | **Reason** | Replaced by `energyService.js` |
| | **Recommendation** | Migrate all consumers to `energyService.js` |

#### VitalityCalculator (Needs Migration)
| ID | Item | Details |
|----|------|---------|
| DEP-002 | **VitalityCalculator** | `server/src/services/vitality/VitalityCalculator.js` |
| | **Reason** | Use `EnergyCalculator` instead |
| | **Recommendation** | Replace all imports |

---

### 2. Legacy Code Patterns

#### 2.1 BT Nodes (21 files) - Library-Specific
These use `b3.Class()` from behavior3js library. Converting to ES6 requires careful refactoring.

| ID | File |
|----|------|
| DEP-025 | `server/src/logic/bt/nodes/conditions/CheckMana.js` |
| DEP-026 | `server/src/logic/bt/nodes/conditions/CheckTerrain.js` |
| DEP-027 | `server/src/logic/bt/nodes/conditions/NearbyUnitsCount.js` |
| DEP-028 | `server/src/logic/bt/nodes/conditions/LogicGate.js` |
| DEP-029 | `server/src/logic/bt/nodes/conditions/IsStunned.js` |
| DEP-030 | `server/src/logic/bt/nodes/conditions/IsTargetInRange.js` |
| DEP-031 | `server/src/logic/bt/nodes/conditions/IsLowHP.js` |
| DEP-032 | `server/src/logic/bt/nodes/conditions/CheckTrait.js` |
| DEP-033 | `server/src/logic/bt/nodes/conditions/CheckTargetStatus.js` |
| DEP-034 | `server/src/logic/bt/nodes/conditions/CheckSkillReady.js` |
| DEP-035 | `server/src/logic/bt/nodes/conditions/CheckLineOfSight.js` |
| DEP-036 | `server/src/logic/bt/nodes/actions/MoveToTarget.js` |
| DEP-037 | `server/src/logic/bt/nodes/conditions/CheckHealth.js` |
| DEP-038 | `server/src/logic/bt/nodes/actions/KiteTarget.js` |
| DEP-039 | `server/src/logic/bt/nodes/conditions/CheckElement.js` |
| DEP-040 | `server/src/logic/bt/nodes/actions/FindTarget.js` |
| DEP-041 | `server/src/logic/bt/nodes/conditions/CheckDistance.js` |
| DEP-042 | `server/src/logic/bt/nodes/actions/UseSkill.js` |
| DEP-043 | `server/src/logic/bt/nodes/actions/BaseMove.js` |
| DEP-044 | `server/src/logic/bt/nodes/conditions/CheckAllyCount.js` |
| DEP-045 | `server/src/logic/bt/nodes/actions/AttackTarget.js` |

#### 2.2 Legacy JSON Fallback (2 files)
| ID | File | Lines |
|----|------|-------|
| DEP-047 | `server/src/controllers/userController.js` | 52-97 |
| DEP-048 | `server/src/services/dataSyncService.js` | 20 |

---

## ⚠️ MEDIUM PRIORITY

### 3. Console Logging (~8 files)
Consider upgrading to Winston logger for structured logging.

| ID | File |
|----|------|
| DEP-049 | `server/src/services/world/TreasureDiscoveryService.js` |
| DEP-050 | `server/src/services/world/TerritoryManager.js` |
| DEP-051 | `server/src/services/world/DailyScheduler.js` |
| DEP-052 | `server/src/services/socketService.js` |
| DEP-053 | `server/src/services/sessionService.js` |
| DEP-054 | `server/src/services/rateLimitService.js` |
| DEP-055 | `server/src/services/battleService.js` |
| DEP-056 | `server/src/server.js` |

---

## ✅ ACCEPTABLE - No Action Needed

### Date.now() Non-Combat (19 items)
These are acceptable for real-time operations (rate limiting, sessions, etc.):
- Rate limiting windows
- Session management
- Cache expiration
- Weather timestamps
- Admin logging

### setTimeout/setInterval (7 items)
These are acceptable for non-combat timing:
- Heartbeat intervals
- Weather updates
- Socket disconnect delays
- Session delays

### __dirname Usage (9 items)
Standard CommonJS pattern, not deprecated.

### .substr() in GDScript (3 items)
`substr()` is valid in GDScript.

### Legacy Error Codes (1 item)
Intentional backward-compatibility layer.

---

## 📋 TODO Patterns (3 items)

| ID | File | Description |
|----|------|-------------|
| DEP-071 | `server/src/services/world/TreasureDiscoveryService.js:177` | Integrate dengan real loot table system |
| DEP-072 | `server/src/services/EventCoordinator.js:19` | Implement random event logic |
| DEP-073 | `server/src/services/DailyTaskService.js:82` | If reputation system is expanded |

---

## 📊 SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| Deprecated Services | 2 | Needs Migration |
| BT Nodes | 21 | Library-Specific |
| Legacy JSON | 2 | Needs Migration |
| Console Logging | ~8 | Upgrade to Winston |
| TODO Patterns | 3 | Work Items |
| **TOTAL** | **~36** | |

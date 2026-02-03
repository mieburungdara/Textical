# Unit Stat System - API Endpoints

## Overview
API endpoints baru untuk kalkulasi dan manajemen stat.

---

## Endpoints

### 1. Calculate Hero Stats
```http
GET /api/stats/:heroId
POST /api/stats/calculate
```

**Query Parameters:**
- `context`: GLOBAL | COMBAT | GATHERING | CRAFTING
- `breakdown`: true | false

**Request Body:**
```json
{
    "heroId": 1,
    "contextType": "COMBAT",
    "includeBreakdown": true
}
```

**Response:**
```json
{
    "attributes": {
        "str": 50,
        "dex": 40,
        "int": 30,
        "vit": 60,
        "luk": 10
    },
    "health_max": 1000,
    "mana_max": 300,
    "attack_damage": 150,
    "defense": 50,
    "crit_chance": 0.15,
    "crit_damage": 1.75,
    "accuracy": 120,
    "dodge_rate": 0.12,
    "speed": 8,
    "skill_power": 80,
    "tenacity": 0.05,
    "lifesteal_rate": 0.03,
    "fire_damage": 20,
    "fire_resistance": 0.1,
    // ... more stats
    
    "_breakdown": {
        "attack_damage": {
            "base": 100,
            "modifiers": {
                "flat": [
                    {"value": 20, "source": "Equipment:Sword"},
                    {"value": 10, "source": "Buff:Power"}
                ],
                "percentAdd": [
                    {"value": 0.1, "source": "Skill:Sharpness"}
                ]
            },
            "final": 143
        }
    }
}
```

---

### 2. Allocate Stat Point
```http
POST /api/stats/allocate
```

**Request Body:**
```json
{
    "heroId": 1,
    "statKey": "str",
    "points": 1
}
```

**Response:**
```json
{
    "allocation": {
        "availablePoints": 4,
        "strAllocated": 11,
        "dexAllocated": 5
    },
    "stats": {
        // ... calculated stats
    }
}
```

---

### 3. Reset Stat Allocation
```http
POST /api/stats/reset
```

**Request Body:**
```json
{
    "heroId": 1
}
```

**Response:**
```json
{
    "allocation": {
        "availablePoints": 20,
        "strAllocated": 0,
        "dexAllocated": 0,
        "intAllocated": 0,
        "vitAllocated": 0,
        "totalSpent": 0
    },
    "refundedPoints": 20,
    "stats": {
        // ... recalculated stats
    }
}
```

---

### 4. Preview Allocation
```http
POST /api/stats/preview
```

**Request Body:**
```json
{
    "heroId": 1,
    "proposedAllocation": {
        "str": 5,
        "dex": 2,
        "int": 0,
        "vit": 3,
        "luk": 0
    }
}
```

**Response:**
```json
{
    "previewStats": {
        "attack_damage": 180,
        "health_max": 1200,
        "crit_chance": 0.18
    },
    "pointsUsed": 10,
    "pointsRemaining": 5,
    "changes": {
        "attack_damage": "+30",
        "health_max": "+200",
        "crit_chance": "+0.03"
    }
}
```

---

### 5. Get Stat Allocation
```http
GET /api/stats/allocation/:heroId
```

**Response:**
```json
{
    "allocation": {
        "availablePoints": 5,
        "strAllocated": 10,
        "dexAllocated": 5,
        "intAllocated": 3,
        "vitAllocated": 8,
        "lukAllocated": 2,
        "totalSpent": 28,
        "statCaps": {
            "str": 500,
            "dex": 500,
            "int": 500,
            "vit": 500,
            "luk": 300
        }
    },
    "caps": {
        "str": 500,
        "dex": 500,
        "int": 500,
        "vit": 500,
        "luk": 300,
        "health_max": 100000,
        "mana_max": 50000
    }
}
```

---

### 6. Get Stat Recommendations
```http
GET /api/stats/recommendations/:heroId
```

**Response:**
```json
{
    "recommendedDistribution": {
        "str": 15,
        "dex": 8,
        "int": 5,
        "vit": 10,
        "luk": 2
    },
    "reasoning": "Warrior class benefits most from STR and VIT",
    "alternativeBuilds": [
        {
            "name": "DPS Focus",
            "distribution": {
                "str": 20,
                "dex": 10,
                "int": 2,
                "vit": 5,
                "luk": 3
            }
        }
    ]
}
```

---

## Error Responses

```json
{
    "error": "Hero not found",
    "code": "HERO_NOT_FOUND"
}
```

```json
{
    "error": "Insufficient stat points",
    "code": "INSUFFICIENT_POINTS"
}
```

```json
{
    "error": "Stat cap reached",
    "code": "STAT_CAP_REACHED",
    "current": 500,
    "cap": 500
}
```

---

## WebSocket Events (Optional)

### Subscribe to Stat Updates
```javascript
// Client → Server
socket.emit("subscribe_stats", { heroId: 1 });

// Server → Client (when stats change)
socket.on("stats_updated", (data) => {
    console.log("New stats:", data);
});
```

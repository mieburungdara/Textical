# Textical API Documentation

**Version:** 2.0.0  
**Base URL:** `http://localhost:3000/api`  
**Last Updated:** 2026-02-12

This API powers the Textical Godot Client. All requests accept and return `application/json`.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Authentication](#2-authentication)
3. [Rate Limiting](#3-rate-limiting)
4. [Error Handling](#4-error-handling)
5. [User & Profile](#5-user--profile)
6. [World & Regions](#6-world--regions)
7. [Gameplay Actions](#7-gameplay-actions)
8. [Formation System](#8-formation-system)
9. [Inventory Management](#9-inventory-management)
10. [Equipment System](#10-equipment-system)
11. [Hero Stats & Progression](#11-hero-stats--progression)
12. [The Living Tavern](#12-the-living-tavern)
13. [The Marketplace](#13-the-marketplace)
14. [Quest System](#14-quest-system)
15. [Battle Engine](#15-battle-engine)
16. [Chat System](#16-chat-system)
17. [Assets & Data Sync](#17-assets--data-sync)
18. [Breaking Changes](#18-breaking-changes)

---

## 1. Introduction

The Textical API is a RESTful service that enables the Godot client to interact with the game server. The API manages all game state including user profiles, heroes, inventory, battles, quests, marketplace transactions, and social features.

### API Versioning

This documentation covers **API v2.0**. All endpoints are prefixed with `/api/` and include version markers where applicable.

### Content Type

All requests and responses use JSON format:

```http
Content-Type: application/json
```

### Base URL

```
http://localhost:3000/api
```

---

## 2. Authentication

Textical uses a simple token-based authentication system.

### Login

Authenticates a user and returns user session data.

- **Endpoint:** `POST /auth/login`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "username": "player1",
  "password": "secure_password"
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "player1",
    "gold": 1500,
    "vitality": 100,
    "currentRegion": 1,
    "isInTavern": false,
    "settings": {}
  }
}
```

- **Error Responses:**
  - `401 Unauthorized` - Invalid password
  - `404 Not Found` - User not found

---

## 3. Rate Limiting

The API implements rate limiting to prevent abuse.

| Tier | Requests | Window |
|------|----------|--------|
| Standard | 100 | 1 minute |
| Premium | 500 | 1 minute |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## 4. Error Handling

All errors follow a consistent JSON format.

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `INVALID_USER_ID` | Invalid User ID | User ID must be a valid integer |
| `INVALID_HERO_ID` | Invalid Hero ID | Hero ID must be a valid integer |
| `INSUFFICIENT_VITALITY` | Not enough vitality | Action requires more vitality |
| `INVENTORY_FULL` | Inventory is full | No space for new items |
| `NOT_IN_TAVERN` | User not in tavern | Action requires tavern context |
| `NOT_IN_TOWN` | User must be in town | Action requires town region |

---

## 5. User & Profile

### Get User Profile

Retrieves comprehensive user profile with vitality sync.

- **Endpoint:** `GET /user/:id`
- **Version:** v1.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "player1",
    "gold": 1500,
    "vitality": 100,
    "maxVitality": 100,
    "currentRegion": 1,
    "isInTavern": false,
    "activeTask": null,
    "currentRegionData": {
      "type": "TOWN",
      "visualType": "town",
      "name": "Starting Town"
    }
  }
}
```

### Get User Heroes

Retrieves all heroes owned by the user.

- **Endpoint:** `GET /user/:id/heroes`
- **Version:** v1.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Hero Name",
      "level": 5,
      "experience": 1250,
      "combatClass": {
        "id": 1,
        "name": "Warrior",
        "description": "Melee fighter"
      },
      "equipment": [],
      "skills": [
        {
          "id": 1,
          "name": "Slash",
          "description": "Basic attack"
        }
      ],
      "primaryAttributes": {
        "strength": 10,
        "agility": 8,
        "intelligence": 5
      },
      "buffs": [],
      "isInFormation": false
    }
  ]
}
```

### Get User Recipes

Retrieves all recipes known by the user.

- **Endpoint:** `GET /user/:id/recipes`
- **Version:** v2.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 8001,
      "name": "Iron Sword",
      "description": "Basic iron sword",
      "resultItem": {
        "templateId": 5001,
        "name": "Iron Sword"
      },
      "materials": [
        { "templateId": 4001, "quantity": 2 }
      ],
      "vitalityCost": 10,
      "duration": 30
    }
  ]
}
```

### Get User Formation

Retrieves user's formation presets.

- **Endpoint:** `GET /user/:id/formation`
- **Version:** v2.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Formation",
      "slots": [
        {
          "position": 0,
          "hero": {
            "id": 10,
            "name": "Warrior"
          }
        },
        {
          "position": 1,
          "hero": {
            "id": 11,
            "name": "Archer"
          }
        }
      ]
    }
  ]
}
```

### Get User Friends

Retrieves user's friend list.

- **Endpoint:** `GET /user/:id/friends`
- **Version:** v2.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "friend_player",
      "status": "online",
      "location": "World"
    }
  ]
}
```

### Get User Achievements

Retrieves user's achievements with unlock status.

- **Endpoint:** `GET /user/:id/achievements`
- **Version:** v2.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Blood",
      "description": "Win your first battle",
      "unlocked": true,
      "unlockedAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### Update User Settings

Updates user settings/preferences.

- **Endpoint:** `POST /user/settings`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "settings": {
    "notifications": true,
    "soundVolume": 0.8,
    "musicVolume": 0.6
  }
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "settings": {
      "notifications": true,
      "soundVolume": 0.8,
      "musicVolume": 0.6
    }
  }
}
```

### Get World State

Retrieves current world state information.

- **Endpoint:** `GET /world/state`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "activePlayers": 42,
    "serverStatus": "online",
    "eventActive": "none",
    "timestamp": "2026-02-12T01:00:00Z"
  }
}
```

---

## 6. World & Regions

### Get All Regions

Retrieves list of all available regions.

- **Endpoint:** `GET /regions`
- **Version:** v2.0+
- **Query Parameters:**
  - `type` (optional) - Filter by region type (TOWN, WILDERNESS, DUNGEON)
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Starting Town",
      "type": "TOWN",
      "visualType": "town",
      "isSafe": true,
      "monsters": []
    },
    {
      "id": 2,
      "name": "Forest of Beginnings",
      "type": "WILDERNESS",
      "visualType": "forest",
      "isSafe": false,
      "monsters": [
        { "templateId": 6001, "name": "Wolf", "level": 2 }
      ]
    }
  ]
}
```

### Get Global Influence

Retrieves global influence/territory control data.

- **Endpoint:** `GET /regions/influence`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "regions": [
      {
        "regionId": 1,
        "controllingFaction": "neutral",
        "influenceLevel": 100
      }
    ]
  }
}
```

### Get Region Details

Retrieves detailed information about a specific region.

- **Endpoint:** `GET /region/:id`
- **Version:** v2.0+
- **Path Parameters:**
  - `id` (integer) - Region ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Starting Town",
    "type": "TOWN",
    "visualType": "town",
    "description": "A peaceful town for new adventurers.",
    "npcs": [
      {
        "id": 101,
        "name": "Blacksmith",
        "role": "CRAFTER",
        "services": ["repair", "craft"]
      }
    ],
    "buildings": [],
    "terrainModifiers": {
      "defenseBonus": 0,
      "resourceBonus": 0
    }
  }
}
```

---

## 7. Gameplay Actions

### Travel

Initiates travel to a target region.

- **Endpoint:** `POST /action/travel`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "targetRegionId": 2
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "taskId": 1001,
    "type": "TRAVEL",
    "status": "RUNNING",
    "startedAt": "2026-02-12T01:00:00Z",
    "estimatedCompletion": "2026-02-12T01:00:15Z",
    "destination": {
      "id": 2,
      "name": "Forest of Beginnings"
    }
  }
}
```

- **Rules:**
  - Cost: 5 Vitality
  - Duration: 15 seconds
  - User must be idle (no active task)
  - Cannot travel from WILDERNESS

### Gather Resource

Initiates resource gathering action.

- **Endpoint:** `POST /action/gather`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "heroId": 10,
  "resourceId": 5
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "taskId": 1002,
    "type": "GATHERING",
    "status": "RUNNING",
    "resource": {
      "templateId": 5,
      "name": "Iron Ore"
    },
    "startedAt": "2026-02-12T01:00:00Z",
    "estimatedCompletion": "2026-02-12T01:00:10Z"
  }
}
```

- **Rules:**
  - Cost: 3 Vitality
  - Duration: 10 seconds
  - Requires hero with GATHERING skill
  - Checks inventory space

### Craft Item

Initiates crafting action.

- **Endpoint:** `POST /action/craft`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "recipeId": 8001,
  "quantity": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "taskId": 1003,
    "type": "CRAFTING",
    "status": "RUNNING",
    "recipe": {
      "id": 8001,
      "name": "Iron Sword"
    },
    "startedAt": "2026-02-12T01:00:00Z",
    "estimatedCompletion": "2026-02-12T01:00:30Z"
  }
}
```

- **Rules:**
  - Cost: 10 Vitality
  - Duration: 30 seconds
  - Consumes materials from inventory
  - **Town Only** - User must be in TOWN region

### Get Active Task

Retrieves user's current active task (if any).

- **Endpoint:** `GET /user/:id/task`
- **Version:** v1.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "taskId": 1001,
    "type": "TRAVEL",
    "status": "RUNNING",
    "progress": 50,
    "targetRegion": {
      "id": 2,
      "name": "Forest of Beginnings"
    }
  }
}
```

- **Response (200 OK - No Task):**

```json
{
  "success": true,
  "data": null
}
```

---

## 8. Formation System

### Update Formation

Updates the entire formation preset.

- **Endpoint:** `POST /action/formation/update`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "presetId": 1,
  "formation": {
    "name": "Main Formation",
    "slots": [
      { "position": 0, "heroId": 10 },
      { "position": 1, "heroId": 11 },
      { "position": 2, "heroId": 12 }
    ]
  }
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Formation",
    "slots": [
      { "position": 0, "heroId": 10 },
      { "position": 1, "heroId": 11 },
      { "position": 2, "heroId": 12 }
    ]
  }
}
```

### Move Formation Unit

Moves a hero to a new position in formation.

- **Endpoint:** `POST /action/formation/move`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "presetId": 1,
  "heroId": 10,
  "fromPosition": 0,
  "toPosition": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Formation updated successfully"
  }
}
```

### Swap Formation Units

Swaps two heroes' positions in formation.

- **Endpoint:** `POST /action/formation/swap`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "presetId": 1,
  "heroIdA": 10,
  "heroIdB": 11,
  "positionA": 0,
  "positionB": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Formation units swapped successfully"
  }
}
```

---

## 9. Inventory Management

### Get Inventory

Retrieves user's inventory with status.

- **Endpoint:** `GET /user/:id/inventory`
- **Version:** v1.0+
- **Path Parameters:**
  - `id` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "status": {
      "used": 5,
      "max": 20,
      "isFull": false
    },
    "items": [
      {
        "id": 100,
        "templateId": 2001,
        "name": "Health Potion",
        "quantity": 3,
        "durability": 100,
        "quality": "COMMON",
        "stackable": true
      }
    ]
  }
}
```

### Discard Item

Removes an item from inventory.

- **Endpoint:** `POST /inventory/discard`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "itemId": 100,
  "quantity": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Item discarded successfully"
  }
}
```

### Use Item

Uses an item from inventory (e.g., consumables).

- **Endpoint:** `POST /inventory/use`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "itemId": 100,
  "targetHeroId": 10
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Item used successfully",
    "effects": {
      "healthRestored": 50
    }
  }
}
```

---

## 10. Equipment System

### Get Hero Profile

Retrieves detailed hero combat profile.

- **Endpoint:** `GET /hero/:id/profile`
- **Version:** v2.0+
- **Path Parameters:**
  - `id` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Hero Name",
    "level": 5,
    "combatClass": {
      "id": 1,
      "name": "Warrior",
      "primaryStat": "strength"
    },
    "stats": {
      "health": 150,
      "mana": 50,
      "attack": 25,
      "defense": 20,
      "speed": 12
    },
    "equipment": [],
    "equipmentSlots": {
      "HEAD": null,
      "BODY": null,
      "LEGS": null,
      "WEAPON": null,
      "SHIELD": null,
      "ACCESSORY": null
    },
    "setBonuses": [],
    "elementalAffinities": {
      "fire": 0,
      "ice": 0,
      "lightning": 0
    }
  }
}
```

### Equip Item

Equips an item to a hero.

- **Endpoint:** `POST /action/equip`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "heroId": 10,
  "itemId": 500
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Item equipped successfully",
    "slot": "WEAPON",
    "equipment": {
      "templateId": 500,
      "name": "Iron Sword",
      "slot": "WEAPON"
    }
  }
}
```

### Unequip Item

Unequips an item from a hero.

- **Endpoint:** `POST /action/unequip`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "heroId": 10,
  "slot": "WEAPON"
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Item unequipped successfully"
  }
}
```

---

## 11. Hero Stats & Progression

### Get Hero Stats

Retrieves complete hero stats with breakdown.

- **Endpoint:** `GET /stats/:heroId`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Query Parameters:**
  - `forceRecalculate` (boolean) - Force recalculation from base values
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "baseStats": {
      "health": 150,
      "mana": 50,
      "attack": 25,
      "defense": 20,
      "speed": 12
    },
    "bonuses": {
      "equipment": { "attack": 5 },
      "buffs": { "attack": 0 },
      "setBonuses": { "attack": 0 }
    },
    "finalStats": {
      "health": 150,
      "mana": 50,
      "attack": 30,
      "defense": 20,
      "speed": 12
    },
    "caps": {
      "health": 500,
      "attack": 100
    }
  }
}
```

### Calculate Stats

Calculates stats with custom context/environment.

- **Endpoint:** `POST /stats/calculate`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "heroId": 10,
  "context": {
    "includeBuffs": true,
    "includeEquipment": true
  },
  "environment": {
    "regionId": 2,
    "isInCombat": true
  },
  "includeBreakdown": true
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "breakdown": {
      "baseAttack": 25,
      "equipmentBonus": 5,
      "buffBonus": 0,
      "regionBonus": 0,
      "totalAttack": 30
    }
  }
}
```

### Get Stat Metadata

Retrieves stat formulas, caps, and metadata.

- **Endpoint:** `GET /stats/metadata`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "health": {
        "base": 100,
        "perLevel": 10,
        "cap": 500,
        "formula": "base + (level * perLevel)"
      },
      "attack": {
        "base": 10,
        "perLevel": 2,
        "cap": 100,
        "formula": "base + (level * perLevel) + equipment + buffs"
      }
    },
    "primaryAttributes": {
      "strength": {
        "affects": ["attack", "defense"]
      },
      "agility": {
        "affects": ["speed", "criticalChance"]
      },
      "intelligence": {
        "affects": ["mana", "spellPower"]
      }
    }
  }
}
```

### Allocate Stat Point

Allocates a stat point to a specific attribute.

- **Endpoint:** `POST /stats/:heroId/allocate`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Request Body:**

```json
{
  "statName": "strength",
  "points": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Stat allocated successfully",
    "availablePoints": 2,
    "attributes": {
      "strength": 11,
      "agility": 8,
      "intelligence": 5
    }
  }
}
```

### Batch Allocate Stats

Allocates multiple stat points at once.

- **Endpoint:** `POST /stats/:heroId/allocate/batch`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Request Body:**

```json
{
  "batch": {
    "strength": 2,
    "agility": 1
  }
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Stats allocated successfully",
    "availablePoints": 0
  }
}
```

### Preview Stat Changes

Previews/simulates stat changes before applying.

- **Endpoint:** `POST /stats/:heroId/preview`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Request Body:**

```json
{
  "additions": {
    "strength": 5,
    "agility": 3
  },
  "context": {
    "isInCombat": false
  }
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currentStats": {
      "attack": 25
    },
    "previewedStats": {
      "attack": 35
    },
    "changes": {
      "attack": 10
    }
  }
}
```

### Reset Stat Allocation

Resets all allocated stat points.

- **Endpoint:** `POST /stats/:heroId/reset`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Stats reset successfully",
    "refundedPoints": 5,
    "attributes": {
      "strength": 10,
      "agility": 8,
      "intelligence": 5
    }
  }
}
```

### Get Stat History

Retrieves stat allocation history.

- **Endpoint:** `GET /stats/:heroId/history`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Query Parameters:**
  - `limit` (integer) - Number of records (default: 50)
  - `offset` (integer) - Pagination offset (default: 0)
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "ALLOCATE",
      "statName": "strength",
      "oldValue": 10,
      "newValue": 11,
      "timestamp": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

### Get Recovery Stats

Retrieves HP/Mana/Vitality recovery stats.

- **Endpoint:** `GET /stats/:heroId/recovery`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "healthRecovery": 5,
    "manaRecovery": 2,
    "vitalityRecovery": 1,
    "timeToFullHealth": 30,
    "timeToFullMana": 25
  }
}
```

### Get Stat Capabilities

Retrieves stat caps and available points.

- **Endpoint:** `GET /stats/:heroId/capabilities`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "availablePoints": 5,
    "totalPointsEarned": 10,
    "totalPointsSpent": 5,
    "caps": {
      "strength": 100,
      "agility": 100,
      "intelligence": 100
    },
    "growthInfo": {
      "pointsPerLevel": 3,
      "nextLevel": 6
    }
  }
}
```

### Get Elemental Stats

Retrieves elemental affinities and resistances.

- **Endpoint:** `GET /stats/elemental/:heroId`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "affinities": {
      "fire": 0,
      "ice": 10,
      "lightning": -5
    },
    "resistances": {
      "fire": 0,
      "ice": 10,
      "lightning": -5
    },
    "bonusDamage": {
      "fire": 0,
      "ice": 0,
      "lightning": 0
    }
  }
}
```

### Get Set Bonuses

Retrieves equipped set bonuses and synergies.

- **Endpoint:** `GET /stats/sets/:heroId`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "activeSets": [
      {
        "id": 1,
        "name": "Iron Set",
        "piecesEquipped": 2,
        "maxPieces": 3,
        "bonuses": {
          "2": { "defense": 5 },
          "3": { "defense": 10, "attack": 5 }
        }
      }
    ],
    "synergies": []
  }
}
```

### Get Equipment Stats

Retrieves equipment stat bonuses and quality modifiers.

- **Endpoint:** `GET /stats/equipment/:heroId`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalBonuses": {
      "attack": 15,
      "defense": 10,
      "health": 20
    },
    "qualityModifiers": {
      "attackMultiplier": 1.1,
      "durabilityRetention": 1.0
    },
    "durabilityImpact": {
      "totalDurability": 85,
      "maxDurability": 100,
      "repairNeeded": false
    },
    "items": [
      {
        "id": 500,
        "slot": "WEAPON",
        "name": "Iron Sword",
        "quality": "COMMON",
        "durability": 100,
        "bonuses": {
          "attack": 15
        }
      }
    ]
  }
}
```

### Predict Stats at Level

Predicts hero stats at a target level.

- **Endpoint:** `GET /stats/:heroId/predict/:targetLevel`
- **Version:** v2.0+
- **Path Parameters:**
  - `heroId` (integer) - Hero ID
  - `targetLevel` (integer) - Target level
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currentLevel": 5,
    "targetLevel": 10,
    "currentStats": {
      "health": 150,
      "attack": 25
    },
    "predictedStats": {
      "health": 200,
      "attack": 35
    },
    "pointRequirements": {
      "statPointsNeeded": 15,
      "experienceNeeded": 5000
    }
  }
}
```

---

## 12. The Living Tavern

### Enter Tavern

Enters the tavern for rest and vitality regeneration.

- **Endpoint:** `POST /tavern/enter`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Entered Tavern",
    "user": {
      "id": 1,
      "isInTavern": true,
      "tavernTimeSpent": 0
    },
    "regenActive": true,
    "regenMultiplier": 10
  }
}
```

- **Rules:**
  - Checks 24-minute daily limit
  - 10x Vitality regeneration starts
  - Cannot enter if already in tavern

### Exit Tavern

Exits the tavern and stops regeneration.

- **Endpoint:** `POST /tavern/exit`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Exited Tavern",
    "user": {
      "id": 1,
      "isInTavern": false,
      "tavernTimeSpent": 15
    },
    "regenActive": false,
    "vitalityGained": 150
  }
}
```

- **Rules:**
  - Enforces 1-minute minimum stay
  - Stops regeneration boost
  - Updates daily tavern time tracker

### Get Mercenaries

Retrieves available mercenaries for recruitment.

- **Endpoint:** `GET /tavern/mercenaries`
- **Version:** v1.0+
- **Query Parameters:**
  - `userId` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 50,
      "name": "Novice Mercenary",
      "combatClass": {
        "id": 1,
        "name": "Warrior"
      },
      "level": 3,
      "recruitCost": 100,
      "skills": [
        {
          "id": 1,
          "name": "Slash"
        }
      ],
      "isAvailable": true
    }
  ]
}
```

- **Rules:**
  - User must be `isInTavern: true`
  - Only shows mercenaries in the same tavern

### Recruit Mercenary

Recruits a mercenary to user's hero roster.

- **Endpoint:** `POST /tavern/recruit`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "mercenaryId": 50
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Mercenary recruited successfully",
    "hero": {
      "id": 51,
      "name": "Novice Mercenary",
      "combatClass": "Warrior",
      "level": 3
    },
    "goldSpent": 100
  }
}
```

- **Rules:**
  - Deducts gold from user
  - Transfers mercenary ownership to user
  - Mercenary is removed from tavern pool

---

## 13. The Marketplace

### Get Market Listings

Retrieves active market listings.

- **Endpoint:** `GET /market/listings`
- **Version:** v1.0+
- **Query Parameters:**
  - `userId` (integer) - User ID
  - `templateId` (optional) - Filter by item template
  - `sortBy` (optional) - Sort field (price, time)
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 99,
      "seller": {
        "id": 2,
        "username": "seller_player"
      },
      "item": {
        "templateId": 2001,
        "name": "Health Potion",
        "quality": "COMMON"
      },
      "price": 50,
      "quantity": 5,
      "listedAt": "2026-02-12T00:00:00Z",
      "expiresAt": "2026-02-13T00:00:00Z"
    }
  ]
}
```

- **Rules:**
  - User must be in TOWN region
  - Returns listings for all sellers

### Get Price Index

Retrieves price index for an item template.

- **Endpoint:** `GET /market/price-index/:templateId`
- **Version:** v2.0+
- **Path Parameters:**
  - `templateId` (integer) - Item template ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "templateId": 2001,
    "name": "Health Potion",
    "priceIndex": {
      "average": 45,
      "minimum": 30,
      "maximum": 60,
      "volume24h": 150,
      "lastUpdated": "2026-02-12T01:00:00Z"
    },
    "recentSales": [
      {
        "price": 50,
        "quantity": 2,
        "soldAt": "2026-02-12T00:30:00Z"
      }
    ]
  }
}
```

### List Item

Lists an item for sale on the marketplace.

- **Endpoint:** `POST /market/list`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "itemId": 500,
  "price": 100,
  "quantity": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "listingId": 100,
    "message": "Item listed successfully",
    "listing": {
      "id": 100,
      "item": {
        "templateId": 500,
        "name": "Iron Sword"
      },
      "price": 100,
      "quantity": 1,
      "taxPaid": 5,
      "expiresAt": "2026-02-13T01:00:00Z"
    }
  }
}
```

- **Rules:**
  - 5% upfront tax (non-refundable)
  - 24-hour expiry
  - **Town Only**
  - Item is removed from inventory

### Buy Item

Purchases an item from a listing.

- **Endpoint:** `POST /market/buy`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 2,
  "listingId": 99,
  "quantity": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Item purchased successfully",
    "purchase": {
      "listingId": 99,
      "item": {
        "templateId": 2001,
        "name": "Health Potion"
      },
      "price": 50,
      "salesTax": 2.5
    },
    "inventory": {
      "used": 6,
      "max": 20
    }
  }
}
```

- **Rules:**
  - Deducts gold from buyer
  - Seller receives 95% of sale price (5% sales tax)
  - **Town Only**
  - Checks buyer's inventory space

### Sell to NPC

Sells an item to NPC shop.

- **Endpoint:** `POST /market/sell-npc`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "itemId": 500,
  "quantity": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Item sold to NPC",
    "sale": {
      "itemId": 500,
      "baseValue": 100,
      "sellPrice": 10,
      "quantity": 1,
      "totalGold": 10
    }
  }
}
```

- **Rules:**
  - Payout is 10% of `baseValue`
  - **Town Only**
  - Item is removed from inventory

---

## 14. Quest System

### Get Daily Quests

Retrieves user's daily quests.

- **Endpoint:** `GET /quests/:userId`
- **Version:** v1.0+
- **Path Parameters:**
  - `userId` (integer) - User ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 55,
      "templateId": 1,
      "name": "Gather Iron Ore",
      "description": "Gather 5 iron ore from the mines",
      "objectives": [
        {
          "type": "GATHER",
          "targetTemplateId": 5,
          "required": 5,
          "current": 3
        }
      ],
      "rewards": {
        "gold": 100,
        "experience": 250
      },
      "expiresAt": "2026-02-13T00:00:00Z",
      "isCompleted": false
    }
  ]
}
```

- **Rules:**
  - Auto-generates 3 new quests every 24 hours
  - Daily reset at server midnight

### Complete Quest

Submits quest completion.

- **Endpoint:** `POST /quests/complete`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "userQuestId": 55
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Quest completed successfully",
    "completion": {
      "questId": 55,
      "rewards": {
        "gold": 100,
        "experience": 250
      },
      "bonusRewards": []
    },
    "newQuestsAvailable": false
  }
}
```

- **Rules:**
  - Validates all objectives are met
  - Awards gold and experience
  - Removes quest from active quests

---

## 15. Battle Engine

### Start Battle

Initiates battle with a monster.

- **Endpoint:** `POST /battle/start`
- **Version:** v1.0+
- **Request Body:**

```json
{
  "userId": 1,
  "monsterId": 6001,
  "formationId": 1
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "battleId": 10001,
    "result": "VICTORY",
    "battleLog": [
      "Turn 1: Your Warrior attacks Wolf for 25 damage",
      "Wolf attacks Your Warrior for 15 damage",
      "Turn 2: Your Warrior attacks Wolf for 27 damage",
      "Wolf is defeated!"
    ],
    "rewards": {
      "experience": 50,
      "loot": [
        {
          "templateId": 2005,
          "name": "Wolf Pelt",
          "quantity": 1,
          "dropRate": 0.5
        }
      ],
      "gold": 10
    },
    "casualties": [],
    "duration": 15
  }
}
```

- **Response (200 OK - Defeat):**

```json
{
  "success": true,
  "data": {
    "battleId": 10002,
    "result": "DEFEAT",
    "battleLog": [...],
    "rewards": {
      "experience": 10,
      "loot": [],
      "gold": 0
    },
    "casualties": [],
    "duration": 8
  }
}
```

- **Rules:**
  - Cost: 5 Vitality
  - Requires formation with at least 1 hero
  - Loot requires inventory space
  - Zero gold dropped on defeat

### Get Battle Replay

Retrieves a battle replay by ID.

- **Endpoint:** `GET /battle/replay/:battleId`
- **Version:** v2.0+
- **Path Parameters:**
  - `battleId` (integer) - Battle ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "battleId": 10001,
    "battleType": "PVE",
    "result": "VICTORY",
    "timestamp": "2026-02-12T01:00:00Z",
    "participants": {
      "heroes": [
        {
          "heroId": 10,
          "name": "Warrior",
          "damageDealt": 100,
          "damageReceived": 30
        }
      ],
      "monsters": [
        {
          "templateId": 6001,
          "name": "Wolf",
          "damageDealt": 30,
          "damageReceived": 52
        }
      ]
    },
    "turns": [
      {
        "turn": 1,
        "actions": [
          {
            "actor": "hero_10",
            "action": "ATTACK",
            "target": "monster_6001",
            "damage": 25
          }
        ]
      }
    ],
    "loot": [
      {
        "templateId": 2005,
        "quantity": 1
      }
    ]
  }
}
```

---

## 16. Chat System

### Send Message

Sends a chat message.

- **Endpoint:** `POST /chat/send`
- **Version:** v2.0+
- **Request Body:**

```json
{
  "userId": 1,
  "channel": "world",
  "message": "Hello, adventurers!"
}
```

- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "messageId": 10001,
    "timestamp": "2026-02-12T01:00:00Z",
    "status": "delivered"
  }
}
```

### Get Chat History

Retrieves chat message history.

- **Endpoint:** `GET /chat/history`
- **Version:** v2.0+
- **Query Parameters:**
  - `channel` (string) - Channel name (world, guild, party, trade)
  - `limit` (integer) - Number of messages (default: 50)
  - `before` (optional) - Timestamp to get messages before
- **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "messageId": 10001,
      "userId": 1,
      "username": "player1",
      "channel": "world",
      "message": "Hello, adventurers!",
      "timestamp": "2026-02-12T01:00:00Z"
    }
  ]
}
```

### Get Online Users

Retrieves list of online users.

- **Endpoint:** `GET /chat/online-users`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalOnline": 42,
    "users": [
      {
        "id": 2,
        "username": "friend_player",
        "status": "online",
        "location": "World"
      }
    ]
  }
}
```

---

## 17. Assets & Data Sync

### Get Data Version

Retrieves current data versions for sync.

- **Endpoint:** `GET /data/version`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "monsters": {
    "version": "20260212_001",
    "lastUpdated": "2026-02-12T01:00:00Z"
  },
  "items": {
    "version": "20260212_001",
    "lastUpdated": "2026-02-12T00:30:00Z"
  },
  "heroes": {
    "version": "20260211_001",
    "lastUpdated": "2026-02-11T12:00:00Z"
  },
  "regions": {
    "version": "20260210_001",
    "lastUpdated": "2026-02-10T08:00:00Z"
  }
}
```

### Sync Monsters

Triggers manual data sync for monsters (Admin).

- **Endpoint:** `POST /data/sync/monsters`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Monster sync completed",
    "syncResult": {
      "totalMonsters": 150,
      "added": 2,
      "updated": 10,
      "removed": 0
    },
    "version": "20260212_002"
  }
}
```

### Get Asset Manifest

Retrieves asset manifest for version checking.

- **Endpoint:** `GET /assets/manifest`
- **Version:** v2.0+
- **Response (200 OK):**

```json
{
  "version": "2.0.0",
  "assets": {
    "textures": {
      "version": "20260212_001",
      "files": ["character_01.png", "monster_01.png"]
    },
    "audio": {
      "version": "20260211_001",
      "files": ["bgm_town.mp3", "sfx_attack.wav"]
    },
    "data": {
      "version": "20260212_001",
      "files": ["items.json", "monsters.json"]
    }
  }
}
```

### Get Asset Templates

Retrieves templates by category.

- **Endpoint:** `GET /assets/templates/:category`
- **Version:** v2.0+
- **Path Parameters:**
  - `category` (string) - Category name (heroes, monsters, items, regions)
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "category": "monsters",
    "version": "20260212_001",
    "templates": [
      {
        "templateId": 6001,
        "name": "Wolf",
        "stats": {
          "health": 80,
          "attack": 15,
          "defense": 5
        },
        "drops": [
          { "templateId": 2005, "dropRate": 0.5 }
        ]
      }
    ]
  }
}
```

### Get Raw Asset

Retrieves raw asset data by category and ID.

- **Endpoint:** `GET /assets/raw/:category/:id`
- **Version:** v2.0+
- **Path Parameters:**
  - `category` (string) - Category name
  - `id` (integer) - Asset ID
- **Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "category": "items",
    "id": 2001,
    "rawData": {
      "name": "Health Potion",
      "description": "Restores 50 health",
      "effects": [
        {
          "type": "HEAL",
          "value": 50
        }
      ]
    }
  }
}
```

---

## 18. Breaking Changes

This section documents breaking changes between API versions.

### v2.0.0 (Current)

**New Endpoints:**
- `/data/version` - Data version tracking
- `/data/sync/monsters` - Admin sync endpoint
- `/world/state` - World state API
- `/chat/*` - Full chat system
- `/stats/*` - Comprehensive stat management
- `/action/formation/*` - Formation control
- `/inventory/discard` - Item disposal
- `/inventory/use` - Item usage
- `/action/equip` & `/action/unequip` - Equipment management
- `/battle/replay/*` - Battle replay

**Modified Endpoints:**
- `GET /user/:id/heroes` - Now returns `skills` as array of objects with `id`, `name`, `description` instead of JSON string
- `GET /user/:id/inventory` - Added `quality` and `durability` fields to items
- `POST /action/craft` - Added `quantity` parameter

**Response Format Changes:**
- All successful responses now include `success: true` wrapper
- Error responses include `code` field for programmatic handling
- DateTime fields use ISO 8601 format with UTC timezone

**Authentication Changes:**
- Added password field to login (was previously optional)

**Deprecations:**
- `GET /user/:id/task` - Response `TaskQueue` object replaced with simplified format (v2.1)

---

### v1.0.0 → v2.0.0 Migration Guide

**Response Wrapper Standardization:**

```json
// v1.0 Response
{
  "id": 1,
  "username": "player1"
}

// v2.0 Response
{
  "success": true,
  "data": {
    "id": 1,
    "username": "player1"
  }
}
```

**Error Code Usage:**

```javascript
// v1.0
throw new Error("Invalid User ID")

// v2.0
throw new Error("INVALID_USER_ID")
```

---

## Appendix A: Data Types

### Region Types

| Type | Description |
|------|-------------|
| `TOWN` | Safe zone with NPCs and crafting |
| `WILDERNESS` | Open world with monsters |
| `DUNGEON` | instanced content |

### Item Quality

| Quality | Modifier |
|---------|----------|
| `COMMON` | 1.0x |
| `UNCOMMON` | 1.2x |
| `RARE` | 1.5x |
| `EPIC` | 2.0x |
| `LEGENDARY` | 3.0x |

### Combat Classes

| Class | Primary Stat | Role |
|-------|--------------|------|
| `Warrior` | Strength | Tank/DPS |
| `Archer` | Agility | Ranged DPS |
| `Mage` | Intelligence | Spell DPS |
| `Cleric` | Intelligence | Healer |

---

## Appendix B: HTTP Status Quick Reference

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check request body |
| 401 | Unauthorized | Re-authenticate |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource exists |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

---

*Documentation maintained by Textical Development Team*  
*For questions, refer to the project wiki or create an issue on GitHub*

# Textical API Documentation

**Base URL:** `http://localhost:3000/api`

This API powers the Textical Godot Client. All requests accept and return `application/json`.

---

## 1. Authentication & User

### Login
*   **POST** `/auth/login`
*   **Body:** `{ "username": "player1" }`
*   **Response:** `User` object (includes `id`, `gold`, `vitality`, `currentRegion`).

### Get Profile
*   **GET** `/user/:id`
*   **Response:** `User` object. (Triggers Vitality sync).

### Get Heroes
*   **GET** `/user/:id/heroes`
*   **Response:** Array of `Hero` objects (includes `combatClass`, `equipment`).

### Get Inventory
*   **GET** `/user/:id/inventory`
*   **Response:** 
    ```json
    {
      "status": { "used": 5, "max": 20, "isFull": false },
      "items": [ { "templateId": 2001, "quantity": 1, ... } ]
    }
    ```

### Get Active Task
*   **GET** `/user/:id/task`
*   **Response:** `TaskQueue` object (or `null` if idle).

---

## 2. Gameplay Actions

### Travel
*   **POST** `/action/travel`
*   **Body:** `{ "userId": 1, "targetRegionId": 2 }`
*   **Response:** `TaskQueue` object (Type: TRAVEL).
*   **Rules:** Cost 5 Vitality. 15s Duration. Must be idle.

### Gather Resource
*   **POST** `/action/gather`
*   **Body:** `{ "userId": 1, "heroId": 10, "resourceId": 5 }`
*   **Response:** `TaskQueue` object (Type: GATHERING).
*   **Rules:** Cost 3 Vitality. 10s Duration. Checks inventory space.

### Craft Item
*   **POST** `/action/craft`
*   **Body:** `{ "userId": 1, "recipeId": 8001 }`
*   **Response:** `TaskQueue` object (Type: CRAFTING).
*   **Rules:** Cost 10 Vitality. 30s Duration. Consumes materials. Town Only.

---

## 3. The Living Tavern

### Enter Tavern
*   **POST** `/tavern/enter`
*   **Body:** `{ "userId": 1 }`
*   **Response:** `{ "message": "Entered Tavern", "user": ... }`
*   **Rules:** Checks 24-minute daily limit. 10x Vitality Regen starts.

### Exit Tavern
*   **POST** `/tavern/exit`
*   **Body:** `{ "userId": 1 }`
*   **Response:** `{ "message": "Exited Tavern", "user": ... }`
*   **Rules:** Enforces 1-minute minimum rounding. Stops Regen boost.

### Get Mercenaries
*   **GET** `/tavern/mercenaries?userId=1`
*   **Response:** Array of `TavernMercenary` objects.
*   **Rules:** User must be `isInTavern: true`.

### Recruit Mercenary
*   **POST** `/tavern/recruit`
*   **Body:** `{ "userId": 1, "mercenaryId": 50 }`
*   **Response:** `{ "success": true }`
*   **Rules:** Deducts Gold. Transfers Hero ownership.

---

## 4. The Marketplace

### Get Listings
*   **GET** `/market/listings?userId=1`
*   **Response:** Array of `MarketListing` objects.
*   **Rules:** User must be in a TOWN region.

### List Item
*   **POST** `/market/list`
*   **Body:** `{ "userId": 1, "itemId": 500, "price": 100 }`
*   **Response:** `{ "success": true }`
*   **Rules:** 5% Upfront Tax (Non-refundable). 24h Expiry. Town Only.

### Buy Item
*   **POST** `/market/buy`
*   **Body:** `{ "userId": 2, "listingId": 99 }`
*   **Response:** `{ "success": true }`
*   **Rules:** Seller pays 5% Sales Tax from profit. Town Only.

### Sell to NPC
*   **POST** `/market/sell-npc`
*   **Body:** `{ "userId": 1, "itemId": 500 }`
*   **Response:** `{ "success": true }`
*   **Rules:** Payout is 10% of `baseValue`. Town Only.

---

## 5. Quest System

### Get Daily Quests
*   **GET** `/quests/:userId`
*   **Response:** Array of `UserQuest` objects.
*   **Rules:** Auto-generates 3 new quests every 24h.

### Complete Quest
*   **POST** `/quests/complete`
*   **Body:** `{ "userId": 1, "userQuestId": 55 }`
*   **Response:** `{ "success": true }`
*   **Rules:** Validates objectives (items gathered). Awards Gold.

---

## 6. Battle Engine

### Start Battle
*   **POST** `/battle/start`
*   **Body:** `{ "userId": 1, "monsterId": 6001 }`
*   **Response:**
    ```json
    {
      "result": "VICTORY",
      "battleLog": ["Turn 1...", "Hero attacks..."],
      "loot": [ { "templateId": 2005, "quantity": 1 } ]
    }
    ```
*   **Rules:** Cost 5 Vitality. Loot requires inventory space. Zero Gold dropped.

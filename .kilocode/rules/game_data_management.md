# Game Data Management Rules

## Core Principle: JSON vs Database

Pilih penyimpanan data berdasarkan jenis data:

| Jenis Data | Penyimpanan | Alasan |
|------------|--------------|--------|
| Static definitions | JSON | Tidak berubah, hanya dibaca |
| Dynamic state | Database | Berubah terus-menerus |

---

## JSON untuk Static Data (Game Definitions)

**Gunakan JSON untuk data yang:**
- Tidak berubah saat game berjalan
- Hanya dibaca oleh game
- Diedit oleh developer/designer
- Tidak butuh query kompleks

**Contoh JSON:**
```json
// res://data/monsters.json
{
  "slime": {
    "id": "slime",
    "name": "Slime",
    "hp": 50,
    "attack": 10,
    "defense": 5,
    "drops": ["slime_gel", "coin"],
    "experience": 10
  },
  "goblin": {
    "id": "goblin",
    "name": "Goblin",
    "hp": 80,
    "attack": 15,
    "defense": 8,
    "drops": ["iron_ore", "goblin_ear"],
    "experience": 25
  }
}
```

```json
// res://data/items.json
{
  "iron_sword": {
    "id": "iron_sword",
    "name": "Iron Sword",
    "type": "weapon",
    "damage": 15,
    "rarity": "common",
    "price": 100
  },
  "health_potion": {
    "id": "health_potion",
    "name": "Health Potion",
    "type": "consumable",
    "effect": { "hp": 50 },
    "rarity": "common",
    "price": 25
  }
}
```

### Mengapa JSON untuk Monster/Item?

| Aspek | JSON | Database |
|-------|------|----------|
| Editibility | Mudah, text editor mana pun | Butuh DB client |
| Git Versioning | ✅ native | ❌ perlu export |
| Godot Integration | `load()` langsung | perlu konektor |
| Hot Reload | ✅ restart tidak perlu | lebih lambat |
| Prototyping | Cepat | Setup migration |

### Jenis Data yang Sesuai JSON

- **Monster definitions** - stats, drops, spawn locations
- **Item definitions** - stats, rarity, price
- **Skill/Spell data** - effects, cooldown, mana cost
- **Quest templates** - objectives, rewards
- **NPC dialogue** - lines, branches
- **Map/Zone data** - terrain, spawn points
- **Buff/Debuff definitions** - duration, effects

---

## Database untuk Dynamic Data

**Gunakan Database untuk data yang:**
- Berubah terus-menerus saat game berjalan
- Membutuhkan query kompleks
- Bersifat individual per player
-Perlu integritas referensial

### Jenis Data yang Sesuai Database

- **Player progress** - level, experience, quest completion
- **Player inventory** - item owned, quantities
- **World state** - destroyed objects, time, weather
- **Economy transactions** - player gold, trade history
- **Guild/Faction state** - members, reputation
- **Leaderboards** - rankings, scores
- **Multiplayer state** - room, player positions
- **Logs/Audit** - combat logs, transactions

### Contoh Struktur Database

```prisma
// Player yang bersifat individual
model Player {
  id        String   @id @default(uuid())
  name      String
  level     Int      @default(1)
  experience Int    @default(0)
  gold      Int      @default(0)
  inventory Inventory[]
  quests    QuestProgress[]
  createdAt DateTime @default(now())
}

model Inventory {
  id        String  @id @default(uuid())
  playerId  String
  itemId    String
  quantity  Int     @default(1)
  player    Player  @relation(fields: [playerId], references: [id])
}

model QuestProgress {
  id          String  @id @default(uuid())
  playerId    String
  questId     String
  status      String  // "started" | "completed" | "failed"
  progress    Json    // { "slay_goblins": 5 }
  player      Player  @relation(fields: [playerId], references: [id])
}
```

---

## Hybrid Approach Pattern

Gabungkan JSON dan Database:

```
Game Data Flow:
┌─────────────────┐     ┌─────────────────┐
│   JSON Files    │     │   Database      │
│                 │     │                 │
│ - monsters.json │     │ - Player        │
│ - items.json    │     │ - Inventory     │
│ - skills.json   │     │ - QuestProgress │
│ - quests.json   │     │ - Gold          │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │   Game Engine   │
            │    (Godot)      │
            └─────────────────┘
```

### Implementation di Godot

```gdscript
# Load monster definitions dari JSON
var monster_data = preload("res://data/monsters.json")

func get_monster_stats(monster_id: String) -> Dictionary:
    return monster_data.get(monster_id, {})

# Load item definitions dari JSON
var item_data = preload("res://data/items.json")

func get_item_info(item_id: String) -> Dictionary:
    return item_data.get(item_id, {})
```

---

## Enforcement Checklist

- [ ] Monster definitions menggunakan JSON
- [ ] Item definitions menggunakan JSON
- [ ] Skill/spell definitions menggunakan JSON
- [ ] Player data menggunakan Database
- [ ] Inventory menggunakan Database
- [ ] World state menggunakan Database
- [ ] Transaction logs menggunakan Database

---

## Best Practices

1. **JSON Schema Validation** - Validasi JSON dengan schema sebelum load
2. **Versioning** - Tambahkan version field di JSON untuk migration
3. **Separation** - Pisahkan data besar jadi multiple JSON files
4. **Caching** - Cache JSON di memory saat game start
5. **Hot Reload** - Implementasikan reload tanpa restart untuk development

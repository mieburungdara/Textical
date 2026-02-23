# Game Design Document: Item Categorization System

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-20 | AI Documentation Specialist | Initial GDD creation |

---

## 1. Executive Summary

> **Related Documentation**: Untuk detail sistem senjata (weapon types, damage types, passive effects, mastery), lihat [`WEAPON_TYPE_SYSTEM_DESIGN.md`](./WEAPON_TYPE_SYSTEM_DESIGN.md)

This document specifies the comprehensive item categorization system for Textical, a hardcore RPG game. The system defines all item categories, their attributes, database structures, and implementation requirements. Currently, the system supports basic categories (EQUIPMENT, MATERIAL), but this GDD expands it to support a full RPG experience with 8 main categories and comprehensive sub-categories.

> **Catatan**: Dokumen ini berfokus pada **kategori item secara umum**. Untuk detail lengkap tentang sistem senjata (weapon types, damage types, passive effects, mastery system), silakan merujuk ke dokumen `WEAPON_TYPE_SYSTEM_DESIGN.md`.

### 1.1 Design Goals

| Goal | Description |
|------|-------------|
| **Completeness** | Cover all item types needed for hardcore RPG gameplay |
| **Scalability** | Support future expansion without schema changes |
| **Performance** | Efficient database queries for inventory management |
| **Balance** | Clear item value progression for gameplay depth |

---

## 2. Item Category Overview

Textical uses a hierarchical category system with **8 main categories** and **multiple sub-categories** within each:

```
Item Categories
├── EQUIPMENT (Weapons, Armor, Accessories)
├── CONSUMABLE (Potions, Food, Scrolls)
├── MATERIAL (Crafting, Reagents, Gems)
├── QUEST_ITEM (Story, Collection, Event)
├── CURRENCY (Coins, Tokens, Premium)
├── KEY_ITEM (Unlock, Proof, Trophy)
├── BOOK (Skill, Lore, Recipe)
└── MISCELLANEOUS (Fragments, Containers)
```

---

## 3. Detailed Category Specifications

### 3.1 EQUIPMENT

> **Referensi Weapon System**: Untuk detail lengkap tentang weapon types, damage types, unique passives, mastery system, dan upgrade system, lihat [`WEAPON_TYPE_SYSTEM_DESIGN.md`](./WEAPON_TYPE_SYSTEM_DESIGN.md)

Equipment items provide permanent stat bonuses when equipped. They have durability and can be enhanced.

#### 3.1.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **WEAPON** | Offensive equipment with attack stats | Sword, Bow, Wand |
| **ARMOR** | Defensive equipment with defense stats | Helmet, Chestplate, Boots |
| **ACCESSORY** | Utility equipment with special bonuses | Ring, Necklace, Belt |

#### 3.1.2 Equipment-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `minLevel` | Int | Minimum level required to equip | 1 |
| `minStr` | Int | Minimum Strength requirement | 0 |
| `minDex` | Int | Minimum Dexterity requirement | 0 |
| `minInt` | Int | Minimum Intelligence requirement | 0 |
| `isTwoHanded` | Boolean | Requires both hands | false |
| `weaponType` | String | Weapon classification | null |
| `damageType` | String | Physical/Magical damage type | "PHYSICAL" |
| `attackRange` | Int | Attack range in tiles | 1 |
| `attackSpeed` | Float | Attack tick cost | 1.0 |
| `slotKey` | String | Equipment slot (HEAD, CHEST, etc.) | null |
| `defenseBase` | Int | Base defense value | 0 |
| `durabilityMax` | Int | Maximum durability | 100 |
| `enhancementLevel` | Int | Current enhancement (+0 to +10) | 0 |

#### 3.1.3 Equipment Slots

| Slot Key | Description | Compatible Sub-Categories |
|----------|-------------|---------------------------|
| HEAD | Helmet, Hat | ARMOR |
| CHEST | Chestplate, Robe | ARMOR |
| LEGS | Pants, Greaves | ARMOR |
| FEET | Boots, Shoes | ARMOR |
| HANDS | Gloves, Gauntlets | ARMOR |
| MAIN_HAND | Primary weapon | WEAPON |
| OFF_HAND | Secondary weapon/shield | WEAPON, ARMOR (Shield) |
| RING_1 | First ring slot | ACCESSORY |
| RING_2 | Second ring slot | ACCESSORY |
| NECKLACE | Amulet slot | ACCESSORY |
| BELT | Belt slot | ACCESSORY |

---

### 3.2 CONSUMABLE

Consumable items are used once and provide temporary effects.

#### 3.2.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **POTION** | Healing, Mana, Status restoration | Health Potion, Mana Crystal |
| **FOOD** | Buff food, Restores stamina | Roasted Meat, Mana Soup |
| **SCROLL** | One-time spell usage | Scroll of Fireball, Teleport Scroll |
| **ELIXIR** | Permanent stat boosts (limited) | Elixir of Strength, EXP Boost |
| **ANTIDOTE** | Cures poisons, diseases | Antidote, Curing Salve |
| **DYE** | Changes equipment appearance | Red Dye, Blue Dye |

#### 3.2.2 Consumable-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `effectType` | String | Type of effect (HEAL, BUFF, etc.) | null |
| `effectValue` | Int/Float | Magnitude of effect | 0 |
| `effectDuration` | Int | Duration in seconds (0 = instant) | 0 |
| `targetType` | String | SELF, ALLY, ENEMY | "SELF" |
| `cooldownSeconds` | Int | Cooldown before reuse | 0 |
| `stackLimit` | Int | Max quantity in one stack | 99 |
| `consumeOnPickup` | Boolean | Auto-use when picked up | false |
| `requiredLevel` | Int | Minimum level to use | 1 |

#### 3.2.3 Effect Types

| Effect Type | Description | Value Interpretation |
|-------------|-------------|---------------------|
| HP_HEAL | Restore Health Points | Absolute value or % of max HP |
| MP_HEAL | Restore Mana Points | Absolute value or % of max MP |
| STAMINA_HEAL | Restore Stamina | Absolute value |
| BUFF | Temporary stat boost | Stat multiplier or flat bonus |
| DEBUFF_REMOVE | Remove negative status | Status name to remove |
| TELEPORT | Instant location change | Region ID or location type |
| EXPERIENCE | Grant XP bonus | XP amount or multiplier |
| ITEM_SUMMON | Create temporary item | Item template ID |

---

### 3.3 MATERIAL

Materials are used for crafting, upgrading, and enhancing equipment.

#### 3.3.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **ORE** | Metal crafting materials | Iron Ore, Mithril |
| **WOOD** | Wood crafting materials | Oak Log, Ebony |
| **CLOTH** | Fabric materials | Cotton, Silk |
| **LEATHER** | Animal hide materials | Wolf Pelt, Dragon Scale |
| **HERB** | Alchemical ingredients | Silverleaf, Bloodroot |
| **GEM** | Socketable gems | Ruby, Emerald, Diamond |
| **ESSENCE** | Magic crafting materials | Mana Crystal, Soul Fragment |
| **FRAGMENT** | Rare component pieces | Ancient Fragment, Boss Relic |
| **DUST** | Refined powder materials | Iron Dust, Magic Dust |

#### 3.3.2 Material-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `materialGrade` | String | Material tier (BASIC, ADVANCED, RARE, EPIC) | "BASIC" |
| `craftingProfession` | String | Required profession | null |
| `transmutationTarget` | Int | Item ID this can become | null |
| `gatherType` | String | Mining, Lumbering, Herbalism, etc. | null |
| `regionId` | Int | Primary gathering region | null |
| `dropMonsterId` | Int | Monster that drops this (if any) | null |
| `recyclingYield` | Int | Items obtained when recycled | 1 |

#### 3.3.3 Material Grades

| Grade | Rarity | Description | Value Multiplier |
|-------|--------|-------------|------------------|
| BASIC | Common | Basic crafting material | 1.0x |
| ADVANCED | Uncommon | Enhanced materials | 2.0x |
| RARE | Rare | Hard to find materials | 5.0x |
| EPIC | Epic | Extremely rare materials | 15.0x |
| LEGENDARY | Legendary | Mythical materials | 50.0x |

---

### 3.4 QUEST_ITEM

Items required for quest completion or progression.

#### 3.4.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **QUEST_REQUIRED** | Items needed to start/complete quests | Goblin Ear, Ancient Key |
| **QUEST_COLLECT** | Collection quest targets | Butterfly Wings, Rare Coins |
| **QUEST_PROOF** | Proof of achievement | Boss Head, Champion Medal |
| **QUEST_EVENT** | Limited-time event items | Festival Token, Holiday Gift |

#### 3.4.2 Quest Item Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `questId` | Int | Associated quest (if specific) | null |
| `requiredQuantity` | Int | Amount needed for completion | 1 |
| `isTradable` | Boolean | Can be traded to others | false |
| `isDestroyable` | Boolean | Can be discarded | false |
| `expirationDate` | DateTime | Auto-delete after date | null |

---

### 3.5 CURRENCY

In-game and premium currencies.

#### 3.5.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **COIN** | Basic trade currency | Silver, Gold |
| **TOKEN** | Event/Guild currency | Guild Token, Arena Token |
| **GEM** | Premium currency (real money) | Ruby, Diamond |
| **BADGE** | Reputation currency | Honor Badge, PvP Medal |
| **POINT** | Loyalty/Activity points | Loyalty Points, Contribution |

#### 3.5.2 Currency Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `currencyType` | String | Trade, Premium, Faction | "TRADE" |
| `iconPath` | String | UI icon resource path | null |
| `exchangeRate` | Float | Conversion rate to base currency | 1.0 |
| `maxStack` | Int | Maximum wallet amount | 999999999 |
| `isPremium` | Boolean | Real-money currency | false |

---

### 3.6 KEY_ITEM

Unique, non-consumable items with special purposes.

#### 3.6.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **KEY** | Door/chest unlocking | Dungeon Key, Boss Room Key |
| **PROOF** | Achievement proof | Victory Medal, Tournament Winner Token |
| **TROPHY** | Collection/achievement display | Monster Trophy, Rare Find |
| **RECIPE** | Crafting recipe unlock | Blueprint, Schematic |
| **MAP** | Location guidance | World Map, Treasure Map |
| **BINDING** | Account/character binding | Soulstone, Bind Scroll |

#### 3.6.2 Key Item Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `useEffect` | String | Effect when used | null |
| `bindOnEquip` | Boolean | Binds when equipped | false |
| `bindOnUse` | Boolean | Binds when used | false |
| `uniquePerAccount` | Boolean | One per account max | false |
| `displayInCodex` | Boolean | Show in achievement codex | false |

---

### 3.7 BOOK

Reading materials that provide benefits.

#### 3.7.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **SKILL_BOOK** | Unlocks or upgrades skills | Advanced Sword Techniques |
| **LORE_BOOK** | Story/lore collection | History of the Kingdom |
| **MANUAL** | Stat progression guide | Strength Training Guide |
| **RECIPE_BOOK** | Recipe collection | Alchemist's Cookbook |
| **MAP_FRAGMENT** | Map piece for discovery | Torn Map Piece |

#### 3.7.2 Book Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `readEffect` | String | Effect on reading | null |
| `skillId` | Int | Skill to unlock (if applicable) | null |
| `readCount` | Int | Times can be read (0 = unlimited) | 1 |
| `collectionBonus` | String | Set collection bonus | null |

---

### 3.8 MISCELLANEOUS

Items that don't fit other categories.

#### 3.8.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **CONTAINER** | Holds other items | Bag, Box, Chest |
| **FRAGMENT** | Incomplete item pieces | Ancient Fragment |
| **TRASH** | Discardable items | Broken Weapon, Rubbish |
| **SPECIAL** | Unique miscellaneous | Pet Egg, Mount Token |

#### 3.8.2 Miscellaneous Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `containerSlots` | Int | Number of inventory slots | 0 |
| `isOpenable` | Boolean | Can be opened for contents | false |
| `requiredKeyId` | Int | Key needed to open | null |

---

## 4. Shared Item Attributes

All items share these core attributes defined in the current schema:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Int | Yes | Unique identifier |
| `name` | String | Yes | Display name |
| `description` | String | Yes | Item description/lore |
| `category` | String | Yes | Main category (EQUIPMENT, etc.) |
| `subCategory` | String | No | Sub-category (WEAPON, POTION, etc.) |
| `rarity` | String | Yes | COMMON, UNCOMMON, RARE, EPIC, LEGENDARY |
| `baseValue` | Int | Yes | Base silver value |
| `maxStack` | Int | Yes | Stack limit |
| `iconPath` | String | No | Icon resource path |
| `modelPath` | String | No | 3D model path |
| `isQuestItem` | Boolean | Yes | Quest-locked flag |
| `dropLevel` | Int | No | Level requirement |
| `weight` | Float | No | Item weight |
| `category` | String | Yes | Item category |

---

## 5. Rarity System

### 5.1 Rarity Tiers

| Rarity | Color Code | Drop Rate | Value Multiplier | Stat Variance |
|--------|------------|-----------|-----------------|--------------|
| **COMMON** | #FFFFFF (White) | 50% | 1.0x | ±10% |
| **UNCOMMON** | #1EFF00 (Green) | 30% | 2.0x | ±15% |
| **RARE** | #0070DD (Blue) | 15% | 5.0x | ±20% |
| **EPIC** | #A335EE (Purple) | 4% | 15.0x | ±25% |
| **LEGENDARY** | #FF8000 (Orange) | 1% | 50.0x | ±30% |

### 5.2 Rarity-Based Bonuses

| Rarity | Required Level Bonus | Random Bonus Stats |
|--------|---------------------|-------------------|
| COMMON | Base | None |
| UNCOMMON | Base + 5 | +1 random stat |
| RARE | Base + 10 | +2 random stats |
| EPIC | Base + 15 | +3 random stats, +1 set bonus |
| LEGENDARY | Base + 20 | +4 random stats, +2 set bonus |

---

## 6. Database Structure Recommendations

### 6.1 Current Schema Analysis

The existing `ItemTemplate` model already supports most required fields:

```prisma
model ItemTemplate {
  id                Int                       @id @default(autoincrement())
  version           Int                       @default(1)
  name              String
  description       String
  category          String                    @default("EQUIPMENT")  // NEEDS EXPANSION
  subCategory       String?                   // ADD: Sub-category field
  rarity            String                    @default("COMMON")
  baseValue         Int                       @default(10)
  maxStack          Int                       @default(1)
  isQuestItem       Boolean                   @default(false)
  // fields
}
```

### 6.2 Recommended Schema Changes

#### Option A: Minimal Changes (Recommended)
Add only the essential new fields:

```prisma
model ItemTemplate {
  id                Int                       @id @default(autoincrement())
  name              String
  description       String
  category          String                    @default("EQUIPMENT")
  subCategory       String?                   // NEW: Sub-category
  rarity            String                    @default("COMMON")
  baseValue         Int                       @default(10)
  maxStack          Int                       @default(1)
  isQuestItem       Boolean                   @default(false)
  
  // NEW: Extended attributes (JSON)
  categorySpecific  String                    @default("{}")  // JSON blob for category-specific attrs
  useEffect         String?                   // For consumables/key items
  requiredLevel     Int                       @default(1)
  requiredProfession String?                  // For materials
  dropLevel         Int                       @default(1)
  weight            Float                     @default(0.0)
  
  // Relations
  stats             ItemStat[]
  equipSlots        ItemEquipSlot[]
}
```

#### Option B: Full Normalization (For Complex Systems)
Create separate tables for each category:

```prisma
// Equipment-specific data
model ItemEquipmentData {
  id              Int           @id @default(autoincrement())
  itemTemplateId  Int           @unique
  slotKey         String
  weaponType      String?
  damageType      String?
  attackRange     Int           @default(1)
  attackSpeed     Float         @default(1.0)
  minStr          Int           @default(0)
  minDex          Int           @default(0)
  minInt          Int           @default(0)
  isTwoHanded     Boolean       @default(false)
  defenseBase     Int           @default(0)
  durabilityMax   Int           @default(100)
}

// Consumable-specific data
model ItemConsumableData {
  id              Int           @id @default(autoincrement())
  itemTemplateId  Int           @unique
  effectType      String
  effectValue     Float
  effectDuration  Int           @default(0)
  targetType      String        @default("SELF")
  cooldownSeconds Int           @default(0)
}

// Material-specific data
model ItemMaterialData {
  id              Int           @id @default(autoincrement())
  itemTemplateId  Int           @unique
  materialGrade   String        @default("BASIC")
  profession      String?
  gatherType      String?
}
```

---

## 7. Implementation Examples

### 7.1 Equipment Examples

#### Iron Sword (Basic Weapon)

```json
{
  "id": 1001,
  "name": "Iron Sword",
  "description": "A standard soldier's blade. Reliable and balanced.",
  "category": "EQUIPMENT",
  "subCategory": "WEAPON",
  "rarity": "COMMON",
  "baseValue": 50,
  "maxStack": 1,
  "requiredLevel": 1,
  "minStr": 10,
  "weaponType": "SWORD",
  "damageType": "SLASH",
  "attackRange": 1,
  "attackSpeed": 60,
  "isTwoHanded": false,
  "slotKey": "MAIN_HAND",
  "stats": [
    { "statKey": "attack_damage", "statValue": 10 },
    { "statKey": "accuracy", "statValue": 5 }
  ]
}
```

#### Dragon Scale Armor (Epic Armor)

```json
{
  "id": 2005,
  "name": "Dragon Scale Armor",
  "description": "Armor forged from the scales of an ancient dragon. Nearly impenetrable.",
  "category": "EQUIPMENT",
  "subCategory": "ARMOR",
  "rarity": "EPIC",
  "baseValue": 15000,
  "maxStack": 1,
  "requiredLevel": 40,
  "slotKey": "CHEST",
  "stats": [
    { "statKey": "defense", "statValue": 150 },
    { "statKey": "fire_resistance", "statValue": 30 },
    { "statKey": "hp", "statValue": 200 }
  ],
  "traits": [
    { "traitId": 45 }
  ]
}
```

### 7.2 Consumable Examples

#### Health Potion

```json
{
  "id": 3001,
  "name": "Health Potion",
  "description": "Restores 50 HP. The most basic healing solution.",
  "category": "CONSUMABLE",
  "subCategory": "POTION",
  "rarity": "COMMON",
  "baseValue": 10,
  "maxStack": 99,
  "requiredLevel": 1,
  "effectType": "HP_HEAL",
  "effectValue": 50,
  "effectDuration": 0,
  "targetType": "SELF"
}
```

#### Greater Mana Elixir

```json
{
  "id": 3015,
  "name": "Greater Mana Elixir",
  "description": "Restores 500 MP and increases magic damage by 10% for 30 minutes.",
  "category": "CONSUMABLE",
  "subCategory": "ELIXIR",
  "rarity": "UNCOMMON",
  "baseValue": 500,
  "maxStack": 10,
  "requiredLevel": 20,
  "effectType": "MP_HEAL",
  "effectValue": 500,
  "effectDuration": 1800,
  "targetType": "SELF",
  "buffEffect": {
    "statKey": "magic_damage",
    "statValue": 0.10,
    "isPercent": true
  }
}
```

### 7.3 Material Examples

#### Mithril Ore

```json
{
  "id": 4001,
  "name": "Mithril Ore",
  "description": "A rare, lightweight metal ore prized by master smiths.",
  "category": "MATERIAL",
  "subCategory": "ORE",
  "rarity": "RARE",
  "baseValue": 200,
  "maxStack": 999,
  "requiredLevel": 1,
  "materialGrade": "RARE",
  "profession": "BLACKSMITH",
  "gatherType": "MINING",
  "regionId": 15,
  "stats": []
}
```

#### Fire Ruby (Gem)

```json
{
  "id": 4101,
  "name": "Fire Ruby",
  "description": "A gem pulsing with inner fire. Can be socketed into equipment.",
  "category": "MATERIAL",
  "subCategory": "GEM",
  "rarity": "RARE",
  "baseValue": 1000,
  "maxStack": 99,
  "requiredLevel": 1,
  "materialGrade": "RARE",
  "gemType": "FIRE",
  "gemTier": 1,
  "socketEffect": {
    "statKey": "fire_damage",
    "statValue": 15,
    "isPercent": false
  }
}
```

### 7.4 Quest Item Examples

#### Goblin Ear

```json
{
  "id": 5001,
  "name": "Goblin Ear",
  "description": "The severed ear of a goblin. Gross but proves the kill.",
  "category": "QUEST_ITEM",
  "subCategory": "QUEST_REQUIRED",
  "rarity": "COMMON",
  "baseValue": 1,
  "maxStack": 99,
  "isQuestItem": true,
  "isTradable": false,
  "questId": 101,
  "requiredQuantity": 10
}
```

### 7.5 Currency Examples

#### Arena Token

```json
{
  "id": 6001,
  "name": "Arena Token",
  "description": "Earned by participating in arena battles. Trade for arena rewards.",
  "category": "CURRENCY",
  "subCategory": "TOKEN",
  "rarity": "UNCOMMON",
  "baseValue": 1,
  "maxStack": 9999,
  "currencyType": "EVENT",
  "iconPath": "res://assets/icons/currency/arena_token.png"
}
```

### 7.6 Key Item Examples

#### Dungeon Master Key

```json
{
  "id": 7001,
  "name": "Dungeon Master Key",
  "description": "Opens the entrance to any dungeon. A mark of a true adventurer.",
  "category": "KEY_ITEM",
  "subCategory": "KEY",
  "rarity": "LEGENDARY",
  "baseValue": 0,
  "maxStack": 1,
  "isTradable": false,
  "useEffect": "DUNGEON_UNLOCK",
  "bindOnUse": true
}
```

---

## 8. Inventory System Integration

### 8.1 Inventory Slot Structure

The `InventoryItem` model tracks instance-specific data:

```prisma
model InventoryItem {
  id                Int                 @id @default(autoincrement())
  userId            Int
  templateId        Int
  quantity          Int                 @default(1)
  currentDurability Int                 @default(100)
  maxDurability     Int                 @default(100)
  isTrash           Boolean             @default(false)
  isCursed          Boolean             @default(false)
  quality           String              @default("COMMON")
  powerScale        Float               @default(1.0)
  isSoulbound       Boolean             @default(false)
  isStolen          Boolean             @default(false)
  // Instance-specific stats (for random rolled stats)
  instanceStats     String              @default("[]")
  
  template          ItemTemplate        @relation(fields: [templateId], references: [id])
  user              User                @relation(fields: [userId], references: [id])
}
```

### 8.2 Inventory Display Categories

UI should group items by category:

| Tab | Categories Shown |
|-----|-----------------|
| **All** | All items |
| **Equipment** | WEAPON, ARMOR, ACCESSORY |
| **Consumables** | POTION, FOOD, SCROLL, ELIXIR |
| **Materials** | ORE, WOOD, CLOTH, LEATHER, HERB, GEM, ESSENCE |
| **Quest** | QUEST_ITEM (all sub-categories) |
| **Currency** | CURRENCY (all sub-categories) |
| **Key Items** | KEY_ITEM, BOOK |

---

## 9. Balance Guidelines

### 9.1 Value Calculation Formula

```
Item Value = Base Value × Rarity Multiplier × Quality Multiplier × Stat Weight
```

| Component | Calculation |
|-----------|-------------|
| Base Value | Defined per item template |
| Rarity Multiplier | See Section 5.1 |
| Quality Multiplier | DURABLE=1.2x, FINE=1.5x, MASTERCRAFT=2.0x |
| Stat Weight | Sum of (stat_value × stat_weight_factor) |

### 9.2 Stat Weight Reference

| Stat | Weight Factor | Notes |
|------|---------------|-------|
| HP | 0.5 | Per point |
| MP | 0.3 | Per point |
| Attack Damage | 1.0 | Per point |
| Defense | 0.8 | Per point |
| Critical Rate | 10.0 | Per 1% |
| Critical Damage | 5.0 | Per 1% |
| Attack Speed | 8.0 | Per 1% |
| Movement Speed | 5.0 | Per 1% |
| Elemental Damage | 1.2 | Per point |
| Resistance | 1.5 | Per point |

---

## 10. Migration Strategy

### Phase 1: Schema Update (Priority: High)
1. Add `subCategory` field to ItemTemplate
2. Add `categorySpecific` JSON field
3. Add `requiredLevel`, `weight`, `requiredProfession` fields
4. Create category-specific data tables (optional, for v2)

### Phase 2: Data Migration (Priority: High)
1. Update existing items with proper categories
2. Set subCategory for all items
3. Populate categorySpecific JSON

### Phase 3: UI Updates (Priority: Medium)
1. Update inventory tabs to show categories
2. Add category filter in inventory
3. Update item tooltips with category info

### Phase 4: New Content (Priority: Medium)
1. Add new consumable items
2. Add new quest items
3. Add currency items

---

## 11. Appendix: Quick Reference

### Category to Sub-Category Mapping

| Main Category | Valid Sub-Categories |
|---------------|---------------------|
| EQUIPMENT | WEAPON, ARMOR, ACCESSORY |
| CONSUMABLE | POTION, FOOD, SCROLL, ELIXIR, ANTIDOTE, DYE |
| MATERIAL | ORE, WOOD, CLOTH, LEATHER, HERB, GEM, ESSENCE, FRAGMENT, DUST |
| QUEST_ITEM | QUEST_REQUIRED, QUEST_COLLECT, QUEST_PROOF, QUEST_EVENT |
| CURRENCY | COIN, TOKEN, GEM, BADGE, POINT |
| KEY_ITEM | KEY, PROOF, TROPHY, RECIPE, MAP, BINDING |
| BOOK | SKILL_BOOK, LORE_BOOK, MANUAL, RECIPE_BOOK, MAP_FRAGMENT |
| MISCELLANEOUS | CONTAINER, FRAGMENT, TRASH, SPECIAL |

### Rarity by Category (General Guide)

| Category | Common Rarities | Notes |
|----------|-----------------|-------|
| WEAPON | COMMON to LEGENDARY | Full range |
| ARMOR | COMMON to LEGENDARY | Full range |
| ACCESSORY | UNCOMMON to LEGENDARY | Rare below Uncommon |
| POTION | COMMON to RARE | Basic healing common |
| FOOD | COMMON to UNCOMMON | Buff food uncommon+ |
| SCROLL | COMMON to EPIC | Epic very rare |
| MATERIAL | COMMON to EPIC | Legendary only from bosses |
| QUEST_ITEM | COMMON to LEGENDARY | Depends on quest |
| CURRENCY | COMMON to EPIC | Varies by source |
| KEY_ITEM | RARE to LEGENDARY | Always valuable |

---

*End of Document*

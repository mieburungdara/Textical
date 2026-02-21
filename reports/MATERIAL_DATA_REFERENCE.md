# Material Data Reference - REVISED EDITION

> **Note**: Materials use a **relational database design** with proper IDs, foreign keys, and enums. No arrays or JSON fields.

---

## 1. Material Database Schema Design

### Entity Relationship Overview

```
MaterialCategory (1) ----< (N) MaterialTemplate
MaterialGrade (1) ----< (N) MaterialTemplate
MaterialSource (1) ----< (N) MaterialTemplate
```

### Prisma Schema (Relational, No JSON/Arrays)

```prisma
// ============================================
// ENUMS
// ============================================

enum MaterialCategory {
  ORE
  WOOD
  CLOTH
  LEATHER
  HERB
  ESSENCE
  GEM
  FRAGMENT
  DUST
  BONE
  SCALE
  FOOD
  OTHER
}

enum MaterialGrade {
  BASIC
  REFINED
  ADVANCED
  RARE
  EPIC
  LEGENDARY
}

enum MaterialSource {
  MINING
  LUMBERING
  SKINNING
  HERBALISM
  ALCHEMY
  FISHING
  FARMING
  HUNTING
  DUNGEON_DROP
  RAID_DROP
  CRAFTING
  EVENT
}

enum MaterialElement {
  FIRE
  ICE
  LIGHTNING
  EARTH
  WIND
  WATER
  NATURE
  DARK
  DIVINE
  VOID
  NEUTRAL
}

// ============================================
// MATERIAL TAG ENUM
// ============================================

enum MaterialTag {
  // Crafting Type
  WEAPON_CRAFT      // Used for weapon crafting
  ARMOR_CRAFT       // Used for armor crafting
  ACCESSORY_CRAFT   // Used for accessory crafting
  ALCHEMY           // Used for alchemy
  COOKING           // Used for cooking
  ENCHANTING        // Used for enchanting
  SMITHING          // Used for smithing
  
  // Elemental Type
  FIRE_ELEMENT      // Fire-associated
  ICE_ELEMENT       // Ice-associated
  LIGHTNING_ELEMENT // Lightning-associated
  EARTH_ELEMENT     // Earth-associated
  WIND_ELEMENT      // Wind-associated
  WATER_ELEMENT     // Water-associated
  NATURE_ELEMENT    // Nature-associated
  DARK_ELEMENT      // Dark-associated
  DIVINE_ELEMENT    // VOID_ELEMENT      // Void-associated
  
 Divine-associated
   // Usage Type
  CONSUMABLE        // Can be consumed directly
 // Can be traded  TRADABLE         
  QUEST_ITEM        // Required for quests
  GUILD_MATERIAL    // Guild crafting material
}
```

---

## 2. Material Type ID Reference

### ORE Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 1001 | COPPER_ORE | Copper Ore | BASIC | MINING | T1 Weapons, T1 Armor |
| 1002 | IRON_ORE | Iron Ore | BASIC | MINING | T, T1-T1-T2 Weapons2 Armor |
| 1003 | SILVER_ORE | Silver Ore | REFINED | MINING | T2 Accessories, Jewelry |
| 1004 | GOLD_ORE | Gold Ore | ADVANCED | MINING | T3-T4 Accessories, Trading |
| 1005 | MITHRIL_ORE | Mithril Ore | RARE | MINING | T4-T5 Weapons, T4-T5 Armor |
| 1006 | ADAMANTITE_ORE | Adamantite Ore | EPIC | MINING | T5-T6 Weapons, T5-T6 Armor |
| 1007 | ETHER_ORE | Ether Ore | LEGENDARY | MINING | T6-T7 Weapons, T6-T7 Armor |
| 1008 | TITANIUM_ORE | Titanium Ore | EPIC | MINING | T6 Armor, Heavy Armor |
| 1009 | ORICHALCUM | Orichalcum | LEGENDARY | MINING | T7-T8 Weapons |
| 1010 | MYTHRIL | Mythril | LEGENDARY | MINING | T8-T9 Weapons, Jewelry |
| 1011 | PRIMORDIAL_ORE | Primordial Ore | LEGENDARY | MINING | T10 Weapons, Legendary Items |

### WOOD Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 2001 | OAK_WOOD | Oak Wood | BASIC | LUMBERING | T1 Weapons, T1 Armor |
| 2002 | YEW_WOOD | Yew Wood | REFINED | LUMBERING | T2 Weapons, Bows |
| 2003 | IRONWOOD | Ironwood | ADVANCED | LUMBERING | T3 Weapons, Shields |
| 2004 | SPIRIT_WOOD | Spirit Wood | RARE | LUMBERING | T4-T5 Magic Weapons |
| 2005 | ETHER_WOOD | Ether Wood | EPIC | LUMBERING | T5-T6 Weapons |
| 2006 | WORLD_TREE_BRANCH | World-Tree Branch | LEGENDARY | LUMBERING | T6-T7 Legendary Weapons |
| 2007 | MOON_WOOD | Moon Wood | RARE | LUMBERING | Magic bows, Staves |
| 2008 | SUN_WOOD | Sun Wood | RARE | LUMBERING | Divine weapons |
| 2009 | SHADOW_WOOD | Shadow Wood | EPIC | LUMBERING | Void weapons |
| 2010 | PRIMORDIAL_WOOD | Primordial Wood | LEGENDARY | LUMBERING | T10 Weapons |

### CLOTH Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 3001 | CLOTH | Cloth | BASIC | FARMING | T1 Armor, Clothing |
| 3002 | COTTON | Cotton | BASIC | FARMING | T1-T2 Armor |
| 3003 | SILK | Silk | REFINED | FARMING | T2-T3 Armor, Accessories |
| 3004 | WOOL | Wool | BASIC | FARMING | T1 Armor |
| 3005 | MYSTIC_CLOTH | Mystic Cloth | ADVANCED | CRAFTING | T3-T4 Armor |
| 3006 | DRAGON_SILK | Dragon Silk | EPIC | HUNTING | T5-T6 Armor |
| 3007 | ETHER_CLOTH | Ether Cloth | LEGENDARY | CRAFTING | T6-T7 Armor |
| 3008 | VOID_SILK | Void Silk | LEGENDARY | CRAFTING | T7-T8 Armor |
| 3009 | DIVINE_CLOTH | Divine Cloth | LEGENDARY | CRAFTING | T7-T8 Armor |
| 3010 | PRIMORDIAL_CLOTH | Primordial Cloth | LEGENDARY | CRAFTING | T10 Armor |

### LEATHER Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 4001 | LEATHER | Leather | BASIC | SKINNING | T1 Armor, Accessories |
| 4002 | WOLF_PELT | Wolf Pelt | REFINED | HUNTING | T2-T3 Armor |
| 4003 | BEAR_HIDE | Bear Hide | ADVANCED | HUNTING | T3-T4 Armor |
| 4004 | SERPENT_SCALE | Serpent Scale | RARE | HUNTING | T4-T5 Armor |
| 4005 | DRAGON_SCALE | Dragon Scale | EPIC | RAID_DROP | T5-T6 Armor |
| 4006 | GIANT_HIDE | Giant Hide | EPIC | HUNTING | T5-T6 Armor |
| 4007 | ETHER_LEATHER | Ether Leather | LEGENDARY | CRAFTING | T6-T7 Armor |
| 4008 | PRIMORDIAL_HIDE | Primordial Hide | LEGENDARY | CRAFTING | T10 Armor |
| 4009 | VOID_LEATHER | Void Leather | LEGENDARY | CRAFTING | T7-T8 Armor |
| 4010 | DEMON_HIDE | Demon Hide | LEGENDARY | RAID_DROP | T7-T8 Armor |

### HERB Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 5001 | SILVERLEAF | Silverleaf | BASIC | HERBALISM | Potions, Alchemy |
| 5002 | BLOODROOT | Bloodroot | BASIC | HERBALISM | Healing potions |
| 5003 | MOONWORT | Moonwort | REFINED | HERBALISM | Mana potions |
| 5004 | SUNFLOWER | Sunflower | REFINED | HERBALISM | Buff potions |
| 5005 | WOLFSBANE | Wolfsbane | ADVANCED | HERBALISM | Strength elixirs |
| 5006 | MANA_ROOT | Mana Root | ADVANCED | HERBALISM | Mana elixirs |
| 5007 | GHOST_ROOT | Ghost Root | RARE | HERBALISM | Ethereal potions |
| 5008 | DRAGON_HEART | Dragon Heart | EPIC | HERBALISM | Elite potions |
| 5009 | VOID_THORN | Void Thorn | EPIC | HERBALISM | Void potions |
| 5010 | DIVINE_LOTUS | Divine Lotus | LEGENDARY | HERBALISM | Legendary elixirs |
| 5011 | PRIMORDIAL_HERB | Primordial Herb | LEGENDARY | HERBALISM | T10 Potions |

### ESSENCE Materials

| Type ID | Name | Display Name | Grade | Source | Element | Used For |
|---------|------|--------------|-------|--------|---------|----------|
| 6001 | MANA_ESSENCE | Mana Essence | BASIC | ALCHEMY | NEUTRAL | Potions, Magic items |
| 6002 | ARCANE_ESSENCE | Arcane Essence | REFINED | ALCHEMY | NEUTRAL | Magic weapons |
| 6003 | ELEMENTAL_ESSENCE | Elemental Essence | ADVANCED | ALCHEMY | VARIED | Elemental items |
| 6004 | FIRE_ESSENCE | Fire Essence | RARE | ALCHEMY | FIRE | Fire weapons |
| 6005 | ICE_ESSENCE | Ice Essence | RARE | ALCHEMY | ICE | Ice weapons |
| 6006 | LIGHTNING_ESSENCE | Lightning Essence | RARE | ALCHEMY | LIGHTNING | Lightning weapons |
| 6007 | EARTH_ESSENCE | Earth Essence | RARE | ALCHEMY | EARTH | Earth weapons |
| 6008 | WIND_ESSENCE | Wind Essence | RARE | ALCHEMY | WIND | Wind weapons |
| 6009 | WATER_ESSENCE | Water Essence | RARE | ALCHEMY | WATER | Water weapons |
| 6010 | NATURE_ESSENCE | Nature Essence | RARE | ALCHEMY | NATURE | Nature items |
| 6011 | DARK_ESSENCE | Dark Essence | EPIC | DUNGEON_DROP | DARK | Dark weapons |
| 6012 | DIVINE_ESSENCE | Divine Essence | EPIC | DUNGEON_DROP | DIVINE | Divine weapons |
| 6013 | VOID_ESSENCE | Void Essence | LEGENDARY | RAID_DROP | VOID | Void weapons |
| 6014 | HOLY_ESSENCE | Holy Essence | EPIC | DUNGEON_DROP | DIVINE | Holy weapons |
| 6015 | SHADOW_ESSENCE | Shadow Essence | EPIC | DUNGEON_DROP | DARK | Shadow items |
| 6016 | BLOOD_ESSENCE | Blood Essence | EPIC | HUNTING | NEUTRAL | Blood weapons |
| 6017 | SOUL_FRAGMENT | Soul Fragment | LEGENDARY | DUNGEON_DROP | DARK | Soul items |
| 6018 | PRIMORDIAL_ESSENCE | Primordial Essence | LEGENDARY | RAID_DROP | VOID | T10 Items |

### GEM Materials

| Type ID | Name | Display Name | Grade | Element | Used For |
|---------|------|--------------|-------|---------|----------|
| 7001 | QUARTZ_CRYSTAL | Quartz Crystal | BASIC | NEUTRAL | Magic accessories |
| 7002 | RUBY | Ruby | REFINED | FIRE | Fire socket items |
| 7003 | SAPPHIRE | Sapphire | REFINED | ICE | Ice socket items |
| 7004 | EMERALD | Emerald | REFINED | NATURE | Nature socket items |
| 7005 | TOPAZ | Topaz | REFINED | LIGHTNING | Lightning socket items |
| 7006 | AMETHYST | Amethyst | RARE | VOID | Void socket items |
| 7007 | DIAMOND | Diamond | EPIC | NEUTRAL | Elite socket items |
| 7008 | ONYX | Onyx | EPIC | DARK | Dark socket items |
| 7009 | OPAL | Opal | RARE | WATER | Water socket items |
| 7010 | JADE | Jade | RARE | EARTH | Earth socket items |
| 7011 | AMBER | Amber | RARE | FIRE | Fire accessories |
| 7012 | PEARL | Pearl | RARE | WATER | Water accessories |
| 7013 | BLACK_PEARL | Black Pearl | EPIC | DARK | Dark accessories |
| 7014 | DRAGON_EYE | Dragon Eye | LEGENDARY | FIRE | Legendary socket |
| 7015 | PRIMORDIAL_GEM | Primordial Gem | LEGENDARY | VOID | T10 Socket |

### FRAGMENT Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 8001 | ANCIENT_FRAGMENT | Ancient Fragment | RARE | DUNGEON_DROP | Ancient crafting |
| 8002 | BOSS_RELIC | Boss Relic | RARE | RAID_DROP | Legendary crafting |
| 8003 | HEROIC_FRAGMENT | Heroic Fragment | EPIC | DUNGEON_DROP | Epic crafting |
| 8004 | LEGENDARY_PART | Legendary Monster Part | EPIC | RAID_DROP | Legendary items |
| 8005 | VOID_SHARD | Void Shard | LEGENDARY | RAID_DROP | Void items |
| 8006 | DIVINE_FRAGMENT | Divine Fragment | LEGENDARY | RAID_DROP | Divine items |
| 8007 | CHAOS_FRAGMENT | Chaos Fragment | LEGENDARY | EVENT | Chaos items |
| 8008 | CREATION_FRAGMENT | Creation Fragment | LEGENDARY | RAID_DROP | T10 Items |
| 8009 | DESTRUCTION_FRAGMENT | Destruction Fragment | LEGENDARY | RAID_DROP | T10 Items |
| 8010 | ETERNAL_FRAGMENT | Eternal Fragment | LEGENDARY | RAID_DROP | T10 Items |

### DUST Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 9001 | IRON_DUST | Iron Dust | BASIC | CRAFTING | Basic crafting |
| 9002 | STEEL_DUST | Steel Dust | REFINED | CRAFTING | Advanced crafting |
| 9003 | MAGIC_DUST | Magic Dust | BASIC | CRAFTING | Enchanting |
| 9004 | ENCHANTING_DUST | Enchanting Dust | REFINED | ENCHANTING | Magic enchanting |
| 9005 | GEM_DUST | Gem Dust | REFINED | CRAFTING | Socket gems |
| 9006 | MYSTIC_DUST | Mystic Dust | ADVANCED | ENCHANTING | Epic enchanting |
| 9007 | VOID_DUST | Void Dust | EPIC | CRAFTING | Void enchanting |
| 9008 | DIVINE_DUST | Divine Dust | EPIC | ENCHANTING | Divine enchanting |
| 9009 | PRIMORDIAL_DUST | Primordial Dust | LEGENDARY | ENCHANTING | T10 enchanting |

### BONE Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 10001 | BONE | Bone | BASIC | HUNTING | Basic weapons |
| 10002 | SKELETON_BONE | Skeleton Bone | REFINED | HUNTING | Undead weapons |
| 10003 | ORC_BONE | Orc Bone | ADVANCED | HUNTING | Orc weapons |
| 10004 | GIANT_BONE | Giant Bone | RARE | HUNTING | Giant weapons |
| 10005 | DRAGON_BONE | Dragon Bone | EPIC | RAID_DROP | Dragon weapons |
| 10006 | DEMON_BONE | Demon Bone | LEGENDARY | RAID_DROP | Demon weapons |
| 10007 | PRIMORDIAL_BONE | Primordial Bone | LEGENDARY | RAID_DROP | T10 Weapons |

### FOOD Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 11001 | MEAT | Raw Meat | BASIC | HUNTING | Cooking |
| 11002 | FISH | Raw Fish | BASIC | FISHING | Cooking |
| 11003 | VEGETABLES | Vegetables | BASIC | FARMING | Cooking |
| 11004 | GRAIN | Grain | BASIC | FARMING | Cooking |
| 11005 | FRUIT | Fruit | BASIC | FARMING | Cooking |
| 11006 | SPICES | Spices | REFINED | FARMING | Advanced cooking |
| 11007 | RARE_HERB | Rare Herb | RARE | HERBALISM | Elite cooking |
| 11008 | EXOTIC_FRUIT | Exotic Fruit | RARE | FARMING | Elite cooking |
| 11009 | MYTHICAL_MEAT | Mythical Meat | EPIC | HUNTING | Legendary cooking |
| 11010 | DRAGON_MEAT | Dragon Meat | LEGENDARY | RAID_DROP | T10 Cooking |

### OTHER Materials

| Type ID | Name | Display Name | Grade | Source | Used For |
|---------|------|--------------|-------|--------|----------|
| 12001 | ROPE | Rope | BASIC | FARMING | Crafting |
| 12002 | THREAD | Thread | BASIC | FARMING | Crafting |
| 12003 | LEATHER_STRIP | Leather Strip | BASIC | SKINNING | Crafting |
| 12004 | METAL_BAR | Metal Bar | REFINED | SMITHING | Basic metalwork |
| 12005 | CRYSTAL_SHARD | Crystal Shard | REFINED | MINING | Magic crafting |
| 12006 | ENCHANTED_LOG | Enchanted Log | REFINED | LUMBERING | Magic crafting |
| 12007 | Phoenix_FEATHER | Phoenix Feather | LEGENDARY | RAID_DROP | Legendary crafting |
| 12008 | UNICORN_HORN | Unicorn Horn | LEGENDARY | RAID_DROP | Holy crafting |

---

## 3. Material Grade Reference

### Grade Hierarchy

| Grade | Rarity Color | Value Multiplier | Drop Rate | Used For |
|-------|-------------|-----------------|-----------|----------|
| BASIC | Gray (#888888) | 1.0x | 50% | Entry-level crafting |
| REFINED | Green (#00FF00) | 2.0x | 25% | Standard crafting |
| ADVANCED | Yellow (#FFFF00) | 4.0x | 15% | Mid-tier crafting |
| RARE | Blue (#0088FF) | 8.0x | 7% | High-tier crafting |
| EPIC | Purple (#9900FF) | 20.0x | 2.5% | Elite crafting |
| LEGENDARY | Orange (#FF8800) | 50.0x | 0.5% | Legendary crafting |

---

## 4. Material Source Distribution

### Gathering Sources

| Source | Materials | Tier Range | Respawn Time |
|--------|-----------|------------|--------------|
| MINING | ORE | T1-T10 | 5-30 minutes |
| LUMBERING | WOOD | T1-T10 | 5-30 minutes |
| SKINNING | LEATHER | T1-T10 | 10-60 minutes |
| HERBALISM | HERB | T1-T10 | 5-20 minutes |
| FISHING | FOOD | T1-T10 | 1-10 minutes |
| FARMING | CLOTH, FOOD | T1-T5 | Instant |
| HUNTING | LEATHER, FOOD, BONE | T1-T10 | Respawn on kill |

### Drop Sources

| Source | Materials | Tier Range | Drop Rate |
|--------|-----------|------------|-----------|
| DUNGEON_DROP | ESSENCE, FRAGMENT | T4-T8 | 5-15% |
| RAID_DROP | LEGENDARY materials | T7-T10 | 1-10% |
| BOSS_DROP | Boss-specific materials | T5-T10 | 10-30% |

---

## 5. Material Tag Mapping

### Crafting Tags

| Material | Primary Tag | Secondary Tag | Used For |
|----------|------------|---------------|----------|
| ORE (T1-T3) | SMITHING | WEAPON_CRAFT | Basic weapons/armor |
| ORE (T4-T6) | SMITHING | ARMOR_CRAFT | Advanced armor |
| ORE (T7-T10) | SMITHING | WEAPON_CRAFT | Legendary weapons |
| WOOD (T1-T3) | SMITHING | WEAPON_CRAFT | Basic weapons |
| WOOD (T4-T6) | SMITHING | ARMOR_CRAFT | Shields |
| WOOD (T7-T10) | SMITHING | WEAPON_CRAFT | Legendary weapons |
| CLOTH | ARMOR_CRAFT | CLOTH | Armor |
| LEATHER | ARMOR_CRAFT | ACCESSORY_CRAFT | Armor, accessories |
| HERB | ALCHEMY | COOKING | Potions, food |
| ESSENCE | ALCHEMY | ENCHANTING | Magic items |
| GEM | ACCESSORY_CRAFT | ENCHANTING | Sockets |
| FRAGMENT | WEAPON_CRAFT | ARMOR_CRAFT | Legendary items |

### Elemental Tags

| Material | Element | Associated Damage |
|----------|---------|------------------|
| FIRE_ESSENCE | FIRE | Fire damage |
| ICE_ESSENCE | ICE | Ice damage |
| LIGHTNING_ESSENCE | LIGHTNING | Lightning damage |
| EARTH_ESSENCE | EARTH | Earth damage |
| WIND_ESSENCE | WIND | Wind damage |
| WATER_ESSENCE | WATER | Water damage |
| NATURE_ESSENCE | NATURE | Nature damage |
| DARK_ESSENCE | DARK | Dark damage |
| DIVINE_ESSENCE | DIVINE | Holy damage |
| VOID_ESSENCE | VOID | Void damage |

---

## 6. Material Usage by Equipment Tier

### T1-T3 Materials (Entry Level)

| Material | Source | Equipment Types |
|----------|--------|-----------------|
| COPPER_ORE | MINING | T1 Weapons, Armor |
| IRON_ORE | MINING | T2 Weapons, Armor |
| OAK_WOOD | LUMBERING | T1 Weapons |
| YEW_WOOD | LUMBERING | T2 Weapons |
| LEATHER | SKINNING | T1-T2 Armor |
| CLOTH | FARMING | T1 Armor |
| SILVERLEAF | HERBALISM | T1 Potions |
| BLOODROOT | HERBALISM | T1 Potions |

### T4-T6 Materials (Mid Level)

| Material | Source | Equipment Types |
|----------|--------|-----------------|
| MITHRIL_ORE | MINING | T4-T5 Weapons, Armor |
| ADAMANTITE_ORE | MINING | T5-T6 Weapons, Armor |
| IRONWOOD | LUMBERING | T3-T4 Weapons, Shields |
| SPIRIT_WOOD | LUMBERING | T4-T5 Magic Weapons |
| WOLF_PELT | HUNTING | T2-T3 Armor |
| BEAR_HIDE | HUNTING | T3-T4 Armor |
| SERPENT_SCALE | HUNTING | T4-T5 Armor |
| DRAGON_SCALE | RAID_DROP | T5-T6 Armor |
| ARCANE_ESSENCE | ALCHEMY | Magic weapons |
| ELEMENTAL_ESSENCE | ALCHEMY | Elemental items |

### T7-T10 Materials (High Level)

| Material | Source | Equipment Types |
|----------|--------|-----------------|
| ETHER_ORE | MINING | T6-T7 Weapons |
| ORICHALCUM | MINING | T7-T8 Weapons |
| MYTHRIL | MINING | T8-T9 Weapons |
| PRIMORDIAL_ORE | MINING | T10 Weapons |
| WORLD_TREE_BRANCH | LUMBERING | T6-T7 Legendary |
| ETHER_LEATHER | CRAFTING | T6-T7 Armor |
| DRAGON_SILK | HUNTING | T5-T6 Armor |
| VOID_SILK | CRAFTING | T7-T8 Armor |
| DIVINE_CLOTH | CRAFTING | T7-T8 Armor |
| VOID_ESSENCE | RAID_DROP | Void weapons |
| DIVINE_ESSENCE | RAID_DROP | Divine weapons |
| LEGENDARY_PART | RAID_DROP | Legendary items |
| VOID_SHARD | RAID_DROP | Void items |
| PRIMORDIAL_ESSENCE | RAID_DROP | T10 Items |

---

## 7. Crafting Recipes Summary

### Weapon Crafting Materials

| Weapon Tier | Primary Material | Secondary Material | Quantity |
|-------------|-----------------|-------------------|----------|
| T1 | COPPER_ORE / OAK_WOOD | LEATHER | 3-5 |
| T2 | IRON_ORE / YEW_WOOD | LEATHER | 5-8 |
| T3 | STEEL_BAR / IRONWOOD | MYSTIC_CLOTH | 8-12 |
| T4 | MITHRIL_ORE / SPIRIT_WOOD | SERPENT_SCALE | 10-15 |
| T5 | ADAMANTITE_ORE / WORLD_TREE | DRAGON_SCALE | 12-18 |
| T6 | ETHER_ORE / ETHER_WOOD | LEGENDARY_PART | 15-20 |
| T7 | ORICHALCUM / PRIMORDIAL_WOOD | VOID_ESSENCE | 20-25 |
| T8 | MYTHRIL / SPIRIT_WOOD | DIVINE_ESSENCE | 25-30 |
| T9 | MYTHRIL / MOON_WOOD | VOID_SHARD | 30-35 |
| T10 | PRIMORDIAL_ORE / PRIMORDIAL_WOOD | PRIMORDIAL_ESSENCE | 40-50 |

### Armor Crafting Materials

| Armor Tier | Primary Material | Secondary Material | Quantity |
|------------|-----------------|-------------------|----------|
| T1 | CLOTH / LEATHER | - | 3-5 |
| T2 | IRON_ORE / LEATHER | WOOL | 5-8 |
| T3 | STEEL_BAR / WOLF_PELT | COTTON | 8-12 |
| T4 | MITHRIL_ORE / BEAR_HIDE | SERPENT_SCALE | 10-15 |
| T5 | ADAMANTITE_ORE / DRAGON_SCALE | SILK | 12-18 |
| T6 | ETHER_ORE / ETHER_LEATHER | DRAGON_SILK | 15-20 |
| T7 | TITANIUM_ORE / VOID_LEATHER | DIVINE_CLOTH | 20-25 |
| T8 | ORICHALCUM / DEMON_HIDE | VOID_SILK | 25-30 |
| T9 | ORICHALCUM / PRIMORDIAL_HIDE | PRIMORDIAL_CLOTH | 30-35 |
| T10 | PRIMORDIAL_ORE / PRIMORDIAL_HIDE | PRIMORDIAL_DUST | 40-50 |

### Accessory Crafting Materials

| Accessory Tier | Primary Material | Secondary Material | Quantity |
|----------------|-----------------|-------------------|----------|
| T1 | COPPER_ORE / SILVER_ORE | QUARTZ_CRYSTAL | 2-3 |
| T2 | IRON_ORE / SILVER_ORE | QUARTZ_CRYSTAL | 3-5 |
| T3 | STEEL_BAR / GOLD_ORE | MANA_ESSENCE | 5-8 |
| T4 | MITHRIL_ORE / GOLD_ORE | ARCANE_ESSENCE | 8-10 |
| T5 | ADAMANTITE_ORE / ETHER_ORE | ELEMENTAL_ESSENCE | 10-15 |
| T6 | ETHER_ORE / MYTHRIL | DIVINE_ESSENCE | 15-18 |
| T7 | ORICHALCUM / MYTHRIL | VOID_ESSENCE | 18-22 |
| T8 | MYTHRIL / ORICHALCUM | DARK_ESSENCE | 22-25 |
| T9 | PRIMORDIAL_ORE / MYTHRIL | VOID_SHARD | 25-30 |
| T10 | PRIMORDIAL_ORE / PRIMORDIAL_GEM | PRIMORDIAL_ESSENCE | 30-40 |

### Potion/Elixir Crafting Materials

| Potion Tier | Primary Material | Secondary Material | Quantity |
|-------------|-----------------|-------------------|----------|
| T1 | SILVERLEAF / BLOODROOT | WATER | 2-3 |
| T2 | MOONWORT / SUNFLOWER | MANA_ESSENCE | 3-5 |
| T3 | WOLFSBANE / MANA_ROOT | ARCANE_ESSENCE | 5-8 |
| T4 | GHOST_ROOT / RARE_HERB | ELEMENTAL_ESSENCE | 8-10 |
| T5 | DRAGON_HEART / EXOTIC_FRUIT | DIVINE_ESSENCE | 10-15 |
| T6 | VOID_THORN / MYTHICAL_MEAT | VOID_ESSENCE | 15-18 |
| T7 | DIVINE_LOTUS / DRAGON_MEAT | HOLY_ESSENCE | 18-22 |
| T8 | DIVINE_LOTUS / DRAGON_MEAT | DIVINE_ESSENCE | 22-25 |
| T9 | PRIMORDIAL_HERB / MYTHICAL_MEAT | VOID_SHARD | 25-30 |
| T10 | PRIMORDIAL_HERB / DRAGON_MEAT | PRIMORDIAL_ESSENCE | 30-40 |

---

*Document Version: 1.0 - Material Edition*
*Related: WEAPON_DATA_REFERENCE.md, ACCESSORY_DATA_REFERENCE.md, ITEM_CATEGORIZATION_GDD.md*

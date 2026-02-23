# Material Data Reference - ENGINE-ALIGNED EDITION

> **Note**: Dalam engine Textical, Material **bukan model database terpisah** — material adalah `ItemTemplate` dengan `category = "MATERIAL"`. Dokumen ini menstandarkan data material agar selaras dengan `schema.prisma`, `GemTemplate`, dan `CraftingSkill` yang ada di engine.

> **Revisi**: Dokumen ini telah diperbaiki dari versi sebelumnya yang menggunakan enum dan model yang tidak ada di engine.

---

## 1. Arsitektur Material dalam Engine

### Prinsip Utama

Material di Textical **bukan** entitas terpisah. Material disimpan sebagai baris di tabel `ItemTemplate`:

```
ItemTemplate (category = "MATERIAL")
├── subCategory: "ORE" / "WOOD" / "CLOTH" / "LEATHER" / "HERB" / "ESSENCE" / "FRAGMENT" / "DUST" / "BONE" / "FOOD" / "OTHER"
├── rarity: "COMMON" / "UNCOMMON" / "RARE" / "EPIC" / "LEGENDARY"
└── maxStack: 999 (default untuk material)
```

### Schema Aktual (dari `schema.prisma`)

```prisma
model ItemTemplate {
  id                Int       @id @default(autoincrement())
  name              String
  description       String
  category          String    @default("EQUIPMENT")  // "MATERIAL" untuk material
  rarity            String    @default("COMMON")
  baseValue         Int       @default(10)
  maxStack          Int       @default(1)             // Material: 999
  isQuestItem       Boolean   @default(false)
  hardness          Int       @default(1)
  // ... relasi lainnya
  ingredients       RecipeIngredient[]
}

model RecipeTemplate {
  id               Int                @id @default(autoincrement())
  name             String
  description      String
  resultItemId     Int
  craftTimeSeconds Int                @default(30)
  ingredients      RecipeIngredient[]
  resultItem       ItemTemplate       @relation(fields: [resultItemId], references: [id])
}

model RecipeIngredient {
  id       Int            @id @default(autoincrement())
  recipeId Int
  itemId   Int            // Merujuk ke ItemTemplate (material)
  quantity Int
}
```

### Gem System (Terpisah dari ItemTemplate)

Gem memiliki model sendiri di engine:

```prisma
model GemTemplate {
  id           Int    @id @default(autoincrement())
  name         String
  element      String // FIRE, WATER, EARTH, WIND, LIGHT, DARK
  tier         Int    // 1-5
  statKey      String
  statValue    Float
  percentValue Float  @default(0)
  dropChance   Float  @default(0.01)
  baseValue    Int    @default(100)
}
```

> **⚠️ PENTING**: Gem **BUKAN** bagian dari `ItemTemplate`. Gem menggunakan `GemTemplate` dan socket system (`InventoryItemSocket`). Jangan masukkan gem ke material ID range.

---

## 2. Sistem Elemen (Engine Canonical)

Engine Textical hanya mengenal **6 elemen + 2 special**:

| Elemen | Kode Engine | Digunakan Pada |
|--------|------------|----------------|
| FIRE | `FIRE` | Senjata, Gem, Monster, Essence |
| WATER | `WATER` | Senjata, Gem, Monster, Essence |
| EARTH | `EARTH` | Senjata, Gem, Monster, Essence |
| WIND | `WIND` | Senjata, Gem, Monster, Essence |
| LIGHT | `LIGHT` | Senjata, Gem, Monster, Essence |
| DARK | `DARK` | Senjata, Gem, Monster, Essence |
| PHYSICAL | `PHYSICAL` | Default attack_element |
| NEUTRAL | `NEUTRAL` | Default region affinity |

> **❌ TIDAK ADA**: `LIGHTNING`, `NATURE`, `DIVINE`, `VOID` — elemen-elemen ini **tidak dikenali** engine.

---

## 3. Sistem Rarity (Engine Canonical)

Engine menggunakan **5 tier rarity**, bukan grade terpisah:

| Rarity | Warna | Value Multiplier | Drop Rate |
|--------|-------|-----------------|-----------|
| COMMON | White (#FFFFFF) | 1.0x | 50% |
| UNCOMMON | Green (#1EFF00) | 2.0x | 30% |
| RARE | Blue (#0070DD) | 5.0x | 15% |
| EPIC | Purple (#A335EE) | 15.0x | 4% |
| LEGENDARY | Orange (#FF8000) | 50.0x | 1% |

> **❌ TIDAK ADA**: `BASIC`, `REFINED`, `ADVANCED` — ini bukan rarity yang dikenali engine. Gunakan rarity standar di atas.

---

## 4. Profesi Crafting (Engine Canonical)

Engine mengenal **4 profesi** via model `CraftingSkill`:

| Profesi | Kode Engine | Material yang Diolah |
|---------|------------|---------------------|
| Blacksmith | `BLACKSMITH` | ORE, WOOD, BONE, LEATHER |
| Alchemist | `ALCHEMIST` | HERB, ESSENCE, DUST |
| Enchanter | `ENCHANTER` | ESSENCE, DUST, FRAGMENT |
| Tailor | `TAILOR` | CLOTH, LEATHER |

> **❌ TIDAK ADA**: `MINING`, `LUMBERING`, `SKINNING`, `HERBALISM`, `FISHING`, `FARMING`, `HUNTING` sebagai profesi engine. Ini adalah **sumber gathering** (flavor text), bukan skill yang di-track di database.

---

## 5. Material Type ID Reference (Engine-Aligned)

### ORE Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 1001 | Copper Ore | COMMON | BLACKSMITH | T1 Weapons, T1 Armor |
| 1002 | Iron Ore | COMMON | BLACKSMITH | T1-T2 Weapons, T2 Armor |
| 1003 | Silver Ore | UNCOMMON | BLACKSMITH | T2 Accessories |
| 1004 | Gold Ore | RARE | BLACKSMITH | T3-T4 Accessories |
| 1005 | Mithril Ore | RARE | BLACKSMITH | T4-T5 Weapons, T4-T5 Armor |
| 1006 | Adamantite Ore | EPIC | BLACKSMITH | T5-T6 Weapons, T5-T6 Armor |
| 1007 | Ether Ore | LEGENDARY | BLACKSMITH | T6-T7 Weapons, T6-T7 Armor |
| 1008 | Titanium Ore | EPIC | BLACKSMITH | T6 Heavy Armor |
| 1009 | Orichalcum | LEGENDARY | BLACKSMITH | T7-T8 Weapons |
| 1010 | Mythril | LEGENDARY | BLACKSMITH | T8-T9 Weapons |
| 1011 | Primordial Ore | LEGENDARY | BLACKSMITH | T10 Legendary Items |

### WOOD Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 2001 | Oak Wood | COMMON | BLACKSMITH | T1 Weapons |
| 2002 | Yew Wood | UNCOMMON | BLACKSMITH | T2 Weapons, Bows |
| 2003 | Ironwood | RARE | BLACKSMITH | T3 Weapons, Shields |
| 2004 | Spirit Wood | RARE | BLACKSMITH | T4-T5 Magic Weapons |
| 2005 | Ether Wood | EPIC | BLACKSMITH | T5-T6 Weapons |
| 2006 | World-Tree Branch | LEGENDARY | BLACKSMITH | T6-T7 Legendary Weapons |
| 2007 | Moon Wood | RARE | BLACKSMITH | Magic Bows, Staves |
| 2008 | Sun Wood | RARE | BLACKSMITH | LIGHT weapons |
| 2009 | Shadow Wood | EPIC | BLACKSMITH | DARK weapons |
| 2010 | Primordial Wood | LEGENDARY | BLACKSMITH | T10 Weapons |

### CLOTH Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 3001 | Cloth | COMMON | TAILOR | T1 Armor, Clothing |
| 3002 | Cotton | COMMON | TAILOR | T1-T2 Armor |
| 3003 | Silk | UNCOMMON | TAILOR | T2-T3 Armor, Accessories |
| 3004 | Wool | COMMON | TAILOR | T1 Armor |
| 3005 | Mystic Cloth | RARE | TAILOR | T3-T4 Armor |
| 3006 | Dragon Silk | EPIC | TAILOR | T5-T6 Armor |
| 3007 | Ether Cloth | LEGENDARY | TAILOR | T6-T7 Armor |
| 3008 | Shadow Silk | LEGENDARY | TAILOR | T7-T8 Armor |
| 3009 | Holy Cloth | LEGENDARY | TAILOR | T7-T8 Armor |
| 3010 | Primordial Cloth | LEGENDARY | TAILOR | T10 Armor |

### LEATHER Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 4001 | Leather | COMMON | TAILOR | T1 Armor |
| 4002 | Wolf Pelt | UNCOMMON | TAILOR | T2-T3 Armor |
| 4003 | Bear Hide | RARE | TAILOR | T3-T4 Armor |
| 4004 | Serpent Scale | RARE | TAILOR | T4-T5 Armor |
| 4005 | Dragon Scale | EPIC | TAILOR | T5-T6 Armor |
| 4006 | Giant Hide | EPIC | TAILOR | T5-T6 Armor |
| 4007 | Ether Leather | LEGENDARY | TAILOR | T6-T7 Armor |
| 4008 | Primordial Hide | LEGENDARY | TAILOR | T10 Armor |
| 4009 | Shadow Leather | LEGENDARY | TAILOR | T7-T8 Armor |
| 4010 | Demon Hide | LEGENDARY | TAILOR | T7-T8 Armor |

### HERB Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 5001 | Silverleaf | COMMON | ALCHEMIST | Basic potions |
| 5002 | Bloodroot | COMMON | ALCHEMIST | Healing potions |
| 5003 | Moonwort | UNCOMMON | ALCHEMIST | Mana potions |
| 5004 | Sunflower | UNCOMMON | ALCHEMIST | Buff potions |
| 5005 | Wolfsbane | RARE | ALCHEMIST | Strength elixirs |
| 5006 | Mana Root | RARE | ALCHEMIST | Mana elixirs |
| 5007 | Ghost Root | RARE | ALCHEMIST | Ethereal potions |
| 5008 | Dragon Heart | EPIC | ALCHEMIST | Elite potions |
| 5009 | Dark Thorn | EPIC | ALCHEMIST | DARK potions |
| 5010 | Sacred Lotus | LEGENDARY | ALCHEMIST | Legendary elixirs |
| 5011 | Primordial Herb | LEGENDARY | ALCHEMIST | T10 Potions |

### ESSENCE Materials

| ID | Name | Rarity | Element | Crafted By | Used For |
|----|------|--------|---------|-----------|----------|
| 6001 | Mana Essence | COMMON | — | ENCHANTER | Potions, Magic items |
| 6002 | Arcane Essence | UNCOMMON | — | ENCHANTER | Magic weapons |
| 6003 | Elemental Essence | RARE | VARIED | ENCHANTER | Elemental items |
| 6004 | Fire Essence | RARE | FIRE | ENCHANTER | FIRE weapons |
| 6005 | Water Essence | RARE | WATER | ENCHANTER | WATER weapons |
| 6006 | Earth Essence | RARE | EARTH | ENCHANTER | EARTH weapons |
| 6007 | Wind Essence | RARE | WIND | ENCHANTER | WIND weapons |
| 6008 | Light Essence | EPIC | LIGHT | ENCHANTER | LIGHT weapons |
| 6009 | Dark Essence | EPIC | DARK | ENCHANTER | DARK weapons |
| 6010 | Blood Essence | EPIC | — | ENCHANTER | Blood weapons |
| 6011 | Soul Fragment | LEGENDARY | DARK | ENCHANTER | Soul items |
| 6012 | Primordial Essence | LEGENDARY | — | ENCHANTER | T10 Items |

### FRAGMENT Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 8001 | Ancient Fragment | RARE | ENCHANTER | Ancient crafting |
| 8002 | Boss Relic | RARE | ENCHANTER | Legendary crafting |
| 8003 | Heroic Fragment | EPIC | ENCHANTER | Epic crafting |
| 8004 | Legendary Part | EPIC | BLACKSMITH | Legendary items |
| 8005 | Dark Shard | LEGENDARY | ENCHANTER | DARK items |
| 8006 | Sacred Fragment | LEGENDARY | ENCHANTER | LIGHT items |
| 8007 | Chaos Fragment | LEGENDARY | ENCHANTER | Chaos items |
| 8008 | Creation Fragment | LEGENDARY | ENCHANTER | T10 Items |
| 8009 | Destruction Fragment | LEGENDARY | ENCHANTER | T10 Items |
| 8010 | Eternal Fragment | LEGENDARY | ENCHANTER | T10 Items |

### DUST Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 9001 | Iron Dust | COMMON | ENCHANTER | Basic enchanting |
| 9002 | Steel Dust | UNCOMMON | ENCHANTER | Advanced enchanting |
| 9003 | Magic Dust | COMMON | ENCHANTER | Enchanting |
| 9004 | Enchanting Dust | UNCOMMON | ENCHANTER | Magic enchanting |
| 9005 | Gem Dust | UNCOMMON | ENCHANTER | Socket preparation |
| 9006 | Mystic Dust | RARE | ENCHANTER | Epic enchanting |
| 9007 | Shadow Dust | EPIC | ENCHANTER | DARK enchanting |
| 9008 | Sacred Dust | EPIC | ENCHANTER | LIGHT enchanting |
| 9009 | Primordial Dust | LEGENDARY | ENCHANTER | T10 enchanting |

### BONE Materials

| ID | Name | Rarity | Crafted By | Used For |
|----|------|--------|-----------|----------|
| 10001 | Bone | COMMON | BLACKSMITH | Basic weapons |
| 10002 | Skeleton Bone | UNCOMMON | BLACKSMITH | Undead weapons |
| 10003 | Orc Bone | RARE | BLACKSMITH | Orc weapons |
| 10004 | Giant Bone | RARE | BLACKSMITH | Giant weapons |
| 10005 | Dragon Bone | EPIC | BLACKSMITH | Dragon weapons |
| 10006 | Demon Bone | LEGENDARY | BLACKSMITH | Demon weapons |
| 10007 | Primordial Bone | LEGENDARY | BLACKSMITH | T10 Weapons |

### FOOD Materials

| ID | Name | Rarity | Used For |
|----|------|--------|----------|
| 11001 | Raw Meat | COMMON | Cooking |
| 11002 | Raw Fish | COMMON | Cooking |
| 11003 | Vegetables | COMMON | Cooking |
| 11004 | Grain | COMMON | Cooking |
| 11005 | Fruit | COMMON | Cooking |
| 11006 | Spices | UNCOMMON | Advanced cooking |
| 11007 | Rare Herb | RARE | Elite cooking |
| 11008 | Exotic Fruit | RARE | Elite cooking |
| 11009 | Mythical Meat | EPIC | Legendary cooking |
| 11010 | Dragon Meat | LEGENDARY | T10 Cooking |

### OTHER Materials

| ID | Name | Rarity | Used For |
|----|------|--------|----------|
| 12001 | Rope | COMMON | Crafting |
| 12002 | Thread | COMMON | Crafting |
| 12003 | Leather Strip | COMMON | Crafting |
| 12004 | Metal Bar | UNCOMMON | Basic metalwork |
| 12005 | Crystal Shard | UNCOMMON | Magic crafting |
| 12006 | Enchanted Log | UNCOMMON | Magic crafting |
| 12007 | Phoenix Feather | LEGENDARY | Legendary crafting |
| 12008 | Unicorn Horn | LEGENDARY | LIGHT crafting |

---

## 6. Material Gathering Sources (Flavor / Lore)

Sumber berikut adalah **flavor text** dan **bukan profesi yang di-track di database**. Profesi crafting yang mengolah material tercantum di Section 4.

| Sumber Gathering | Material yang Didapat | Tier |
|------------------|-----------------------|------|
| Mining | ORE | T1-T10 |
| Lumbering | WOOD | T1-T10 |
| Skinning | LEATHER | T1-T10 |
| Herbalism | HERB | T1-T10 |
| Fishing | FOOD (fish) | T1-T10 |
| Farming | CLOTH, FOOD | T1-T5 |
| Hunting | LEATHER, FOOD, BONE | T1-T10 |
| Monster Drop | ESSENCE, FRAGMENT | T4-T8 |
| Boss/Raid Drop | LEGENDARY materials | T7-T10 |

---

## 7. Profession-Material Mapping

| Profesi | Primary Materials | Secondary Materials |
|---------|-------------------|---------------------|
| BLACKSMITH | ORE, WOOD, BONE | LEATHER (untuk senjata) |
| TAILOR | CLOTH, LEATHER | WOOD (untuk frame) |
| ALCHEMIST | HERB, FOOD | ESSENCE (untuk elixir) |
| ENCHANTER | ESSENCE, DUST, FRAGMENT | GEM (via GemTemplate) |

---

## 8. Crafting Recipes Summary

### Weapon Crafting (BLACKSMITH)

| Tier | Primary | Secondary | Qty |
|------|---------|-----------|-----|
| T1 | Copper Ore / Oak Wood | Leather | 3-5 |
| T2 | Iron Ore / Yew Wood | Leather | 5-8 |
| T3 | Metal Bar / Ironwood | Mystic Cloth | 8-12 |
| T4 | Mithril Ore / Spirit Wood | Serpent Scale | 10-15 |
| T5 | Adamantite Ore / Ether Wood | Dragon Scale | 12-18 |
| T6 | Ether Ore / Shadow Wood | Legendary Part | 15-20 |
| T7 | Orichalcum / Primordial Wood | Dark Essence | 20-25 |
| T8 | Mythril / Spirit Wood | Light Essence | 25-30 |
| T9 | Mythril / Moon Wood | Dark Shard | 30-35 |
| T10 | Primordial Ore / Primordial Wood | Primordial Essence | 40-50 |

### Armor Crafting (BLACKSMITH + TAILOR)

| Tier | Primary | Secondary | Qty |
|------|---------|-----------|-----|
| T1 | Cloth / Leather | — | 3-5 |
| T2 | Iron Ore / Leather | Wool | 5-8 |
| T3 | Metal Bar / Wolf Pelt | Cotton | 8-12 |
| T4 | Mithril Ore / Bear Hide | Serpent Scale | 10-15 |
| T5 | Adamantite Ore / Dragon Scale | Silk | 12-18 |
| T6 | Ether Ore / Ether Leather | Dragon Silk | 15-20 |
| T7 | Titanium Ore / Shadow Leather | Holy Cloth | 20-25 |
| T8 | Orichalcum / Demon Hide | Shadow Silk | 25-30 |
| T9 | Orichalcum / Primordial Hide | Primordial Cloth | 30-35 |
| T10 | Primordial Ore / Primordial Hide | Primordial Dust | 40-50 |

### Potion Crafting (ALCHEMIST)

| Tier | Primary | Secondary | Qty |
|------|---------|-----------|-----|
| T1 | Silverleaf / Bloodroot | Water | 2-3 |
| T2 | Moonwort / Sunflower | Mana Essence | 3-5 |
| T3 | Wolfsbane / Mana Root | Arcane Essence | 5-8 |
| T4 | Ghost Root / Rare Herb | Elemental Essence | 8-10 |
| T5 | Dragon Heart / Exotic Fruit | Light Essence | 10-15 |
| T6 | Dark Thorn / Mythical Meat | Dark Essence | 15-18 |
| T7 | Sacred Lotus / Dragon Meat | Light Essence | 18-22 |
| T8 | Sacred Lotus / Dragon Meat | Dark Essence | 22-25 |
| T9 | Primordial Herb / Mythical Meat | Dark Shard | 25-30 |
| T10 | Primordial Herb / Dragon Meat | Primordial Essence | 30-40 |

---

## 9. Perbedaan dengan Gem System

Gem di engine menggunakan **model terpisah** (`GemTemplate`), bukan `ItemTemplate`:

| Aspek | Material (ItemTemplate) | Gem (GemTemplate) |
|-------|------------------------|-------------------|
| Model | `ItemTemplate` | `GemTemplate` |
| Elemen | Tidak wajib | Wajib (6 elemen) |
| Tier | Tidak ada | 1-5 |
| Stacking | `maxStack: 999` | N/A (socket system) |
| Socket | Tidak bisa | Bisa via `InventoryItemSocket` |
| Upgrade | Tidak ada | 3x tier N → 1x tier N+1 |

---

## 10. Changelog

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | — | Versi awal (banyak inkonsistensi dengan engine) |
| 2.0 | 2026-02-22 | Diselaraskan dengan engine: rarity 5-tier, elemen 6+2, profesi 4, gem terpisah, hapus enum tidak valid |

---

*Document Version: 2.0 - Engine-Aligned Edition*
*Related: WEAPON_DATA_REFERENCE.md, ITEM_CATEGORIZATION_GDD.md*

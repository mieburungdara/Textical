# Game Design Document: Monster Categorization System

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | AI Documentation Specialist | Initial GDD creation |

---

## 1. Executive Summary

> **Related Documentation**: Untuk detail sistem combat dan AI behavior, lihat dokumen Battle System dan Behavior Tree terkait.

This document specifies the comprehensive monster categorization system for Textical, a hardcore RPG game. The system defines all monster categories, their attributes, database structures, AI behaviors, and implementation requirements. The monster system supports multiple creature types with unique mechanics, behaviors, and loot tables.

> **Catatan**: Dokumen ini berfokus pada **kategori monster secara umum**. Untuk detail lengkap tentang monster stats, AI behavior, dan spawn mechanics, silakan merujuk ke dokumen terpisah.

### 1.1 Design Goals

| Goal | Description |
|------|-------------|
| **Completeness** | Cover all monster types needed for hardcore RPG gameplay |
| **Scalability** | Support future expansion without schema changes |
| **Variety** | Diverse monster types with unique behaviors |
| **Balance** | Clear progression for dungeon/raid content |
| **Lore Integration** | Monster categories align with world lore |

---

## 2. Monster Category Overview

Textical uses a hierarchical category system with **7 main categories** and **multiple sub-categories** within each:

```
Monster Categories
├── BEAST (Normal, Beast, Predator, Beastlord)
├── UNDEAD (Skeleton, Zombie, Ghost, Lich)
├── ELEMENTAL (Fire, Water, Earth, Air, Nature)
├── DEMON (Imp, Hellspawn, Demon Lord, Archdemon)
├── HUMANOID (Bandit, Mercenary, Cultist, Warlord)
├── CONSTRUCT (Golem, Automaton, War Machine)
└── DRAGON (Wyrm, Drake, Dragon, Elder Dragon)
```

---

## 3. Detailed Category Specifications

### 3.1 BEAST

> Monsters from the animal kingdom and mythical beasts.

#### 3.1.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **NORMAL_BEAST** | Basic animals | Wolf, Bear, Boar |
| **PREDATOR** | Hunting predators | Lion, Tiger, Wolf Pack |
| **BEASTLORD** | Alpha beasts | Direwolf, Cave Bear |
| **MYTHICAL_BEAST** | Fantasy creatures | Griffin, Chimera, Minotaur |
| **INSECT** | Bug-type monsters | Spider, Scorpion, Beetle |

#### 3.1.2 Beast-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `beastType` | String | Beast classification | null |
| `isPackLeader` | Boolean | Commands other beasts | false |
| `packSize` | Int | Number of minions | 0 |

| `attackPattern` | String | Melee, Ranged, Charge | "MELEE" |
| `traits` | String | Unique monster traits | null |
| `passives` | String | Passive abilities | null |

---

### 3.2 UNDEAD

> Monsters that were once alive but now serve death.

#### 3.2.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **SKELETON** | Bone warriors | Skeleton Warrior, Skeleton Archer |
| **ZOMBIE** | Flesh-eaters | Zombie, Ghoul, Crawler |
| **GHOST** | Spectral beings | Specter, Wraith, Phantom |
| **LICH** | Undead mages | Lich, Necromancer, Death Knight |
| **VAMPIRE** | Blood drinkers | Vampire, Vampire Lord |

#### 3.2.2 Undead-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `undeadType` | String | Undead classification | null |
| `isReviving` | Boolean | Can resurrect | false |
| `reviveTimer` | Int | Seconds to revive | 0 |
| `soulBound` | Boolean | Requires soul gem to kill | false |
| `negativeEnergy` | Int | Damage from healing | 0 |
| `fearAura` | Int | Fear radius in tiles | 0 |

---

### 3.3 ELEMENTAL

> Monsters born from pure elemental energy.

#### 3.3.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **FIRE_ELEMENTAL** | Flame creatures | Fire Sprite, Magma Elemental |
| **WATER_ELEMENTAL** | Aquatic creatures | Water Nymph, Siren |
| **EARTH_ELEMENTAL** | Ground creatures | Golem, Rock Elemental |
| **AIR_ELEMENTAL** | Wind creatures | Wind Djinn, Storm Spirit |
| **NATURE_ELEMENTAL** | Plant creatures | Treant, Mandragora |
| **VOID_ELEMENTAL** | Cosmic entities | Void Spawn, Cosmic Horror |

#### 3.3.2 Elemental-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `elementType` | String | FIRE, WATER, EARTH, AIR, NATURE, VOID | null |
| `elementAffinity` | Float | Elemental damage bonus | 1.0 |
| `elementWeakness` | String | Weakness element | null |
| `isEthereal` | Boolean | Physical immune | false |
| `elementalPhase` | Int | Phase shifts (0=none) | 0 |
| `environmentalEffect` | String | Creates hazard | null |

---

### 3.4 DEMON

> Malevolent entities from the demonic realms.

#### 3.4.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **IMP** | Minor demons | Imp, Hellfire |
| **HELLFIRE** | Fire demons | Hellhound, Fire Drake |
| **DEMON_LORD** | Noble demons | Pit Lord, Wrathful |
| **ARCHDEMON** | Prime demons | Archdemon, Prime Evil |
| **SATANIC** | Dark lords | Dark Prince, Satan |

#### 3.4.2 Demon-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `demonRank` | String | Imp, Lord, Archdemon | null |
| `isFiend` | Boolean | Enhanced demon | false |
| `corruptionAura` | Int | Corruption radius | 0 |
| `summonMinions` | Boolean | Can summon | false |
| `maxMinions` | Int | Max summoned | 0 |
| `isBoss` | Boolean | Named boss | false |

---

### 3.5 HUMANOID

> Human-like creatures with equipment and tactics.

#### 3.5.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **BANDIT** | Outlaws | Highwayman, Bandit Chief |
| **MERCENARY** | Soldiers of fortune | Mercenary, Mercenary Captain |
| **CULTIST** | Dark worshippers | Cultist, High Priest |
| **KNIGHT** | Armored warriors | Dark Knight, Death Knight |
| **WIZARD** | Magic users | Sorcerer, Warlock |
| **BERSERKER** | Mad fighters | Berserker, Frenzy |

#### 3.5.2 Humanoid-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `humanoidClass` | String | Fighter, Mage, Healer | null |
| `equipmentLevel` | Int | Gear tier | 1 |
| `hasShield` | Boolean | Uses shield | false |
| `formationType` | String | Solo, Pair, Squad | "SOLO" |
| `aiTactic` | String | Combat behavior | "AGGRESSIVE" |
| `commandBonus` | Int | Leadership bonus | 0 |

---

### 3.6 CONSTRUCT

> Artificial beings created through magic or technology.

#### 3.6.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **GOLEM** | Magic constructs | Stone Golem, Iron Golem |
| **AUTOMATON** | Mechanical beings | Clockwork, Steam Machine |
| **WAR_MACHINE** | Siege weapons | Siege Tower, Catapult |
| **SENTINEL** | Guardian constructs | Guardian, Watcher |

#### 3.6.2 Construct-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `constructType` | String | Material type | null |
| `isAnimated` | Boolean | Self-moving | true |
| `coreWeakness` | Boolean | Has destroyable core | false |
| `armorPlating` | Int | Extra DEF | 0 |
| `selfRepair` | Int | HP/tick regeneration | 0 |
| `magicImmune` | Boolean | Immune to magic | false |

---

### 3.7 DRAGON

> The most powerful creature category.

#### 3.7.1 Sub-Categories

| Sub-Category | Description | Examples |
|--------------|-------------|----------|
| **WYRM** | Young dragons | Desert Wyrm, Swamp Drake |
| **DRAKE** | Lesser dragons | Fire Drake, Ice Drake |
| **DRAGON** | True dragons | Ancient Dragon, Elder Dragon |
| **ELDER_DRAGON** | Primal dragons | World Serpent, Prime Dragon |
| **GOD_DRAGON** | Divine dragons | Solar Dragon, Lunar Dragon |

#### 3.7.2 Dragon-Specific Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `dragonAge` | String | Wyrm, Drake, Dragon, Elder | null |
| `breathType` | String | Element of breath | null |
| `breathArea` | Int | Cone radius | 0 |
| `hasWings` | Boolean | Can fly | true |
| `isLegendary` | Boolean | Named dragon | false |
| `scaleHardness` | Int | Extra DEF vs weapons | 0 |
| `terrifyAura` | Int | Fear radius | 0 |

---

## 4. Monster Attributes

### 4.1 Primary Stats

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `hp` | Int | Health Points | 100 |
| `mp` | Int | Magic Points | 0 |
| `attack_damage` | Int | Physical damage output | 10 |
| `magic_attack` | Int | Magic damage output | 0 |
| `defense` | Int | Physical damage mitigation | 0 |
| `magic_defense` | Int | Magic damage mitigation | 0 |
| `speed` | Int | Turn order/initiative | 100 |

### 4.2 Secondary Stats

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `accuracy` | Int | Hit chance base (100 default) | 100 |
| `dodge_rate` | Int | Evasion chance (0-75%) | 0 |
| `crit_chance` | Float | Critical hit probability (5% default) | 0.05 |
| `crit_damage` | Float | Critical multiplier (1.5x default) | 1.5 |
| `attack_range` | Int | Attack range in tiles | 1 |
| `parry_chance` | Float | Weapon parry probability (0-50%) | 0 |
| `block_chance` | Float | Shield block probability (0-75%) | 0 |
| `block_power` | Float | Block damage reduction (0.5 default) | 0.5 |
| `armor_penetration` | Int | Defense ignore | 0 |

### 4.3 Elemental Stats

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `fireResistance` | Int | Fire damage reduction | 0 |
| `iceResistance` | Int | Ice damage reduction | 0 |
| `lightningResistance` | Int | Lightning damage reduction | 0 |
| `darkResistance` | Int | Dark damage reduction | 0 |
| `divineResistance` | Int | Holy damage reduction | 0 |
| `voidResistance` | Int | Void damage reduction | 0 |

### 4.4 Status Effect Stats

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `poisonResistance` | Int | Poison immunity | 0 |
| `stunResistance` | Int | Stun immunity | 0 |
| `sleepResistance` | Int | Sleep immunity | 0 |
| `fearResistance` | Int | Fear immunity | 0 |
| `silenceResistance` | Int | Silence immunity | 0 |

---

## 5. Monster Behavior System

### 5.1 Behavior Types

| Behavior | Description | Used By |
|----------|-------------|----------|
| **PASSIVE** | Does not attack unless provoked | Herbivores, scavengers |
| **GUARD** | Stays in area, attacks intruders | Sentinels, guards |
| **AGGRESSIVE** | Attacks on sight | Most predators |
| **HUNTING** | Tracks and pursues prey | Predators |
| **PATROL** | Wanders in pattern | Guards, scouts |
| **AMBUSH** | Hidden until player approaches | Traps, assassins |
| **SWARM** | Groups together | Insects, undead |
| **BERSERK** | Increases attack when low HP | Berserkers, some bosses |

### 5.2 AI Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `aiBehavior` | String | Primary AI type | "AGGRESSIVE" |
| `aiSubType` | String | Specialized behavior | null |
| `decisionRate` | Int | AI update milliseconds | 1000 |
| `pathfindingType` | String | A*, Dijkstra, Flow | "A_STAR" |
| `stateMachine` | String | Behavior tree name | "COMMON" |

### 5.3 Special Abilities

| Ability Type | Description | Trigger |
|-------------|-------------|----------|
| **CLEAVE** | Attack multiple targets | On attack |
| **CHARGE** | Rush toward target | Below HP% |
| **ENRAGE** | Boost stats when low HP | Below HP% |
| **SUMMON** | Call additional monsters | HP threshold |
| **TELEPORT** | Instant position change | Distance/HP |
| **PHASE_SHIFT** | Change form | Phase transitions |
| **AURA** | Area effect around monster | Always active |

---

## 6. Loot System

### 6.1 Drop Categories

| Category | Description | Drop Rate |
|----------|-------------|-----------|
| **GUARANTEED** | Always drops | 100% |
| **COMMON** | Frequent drops | 30-50% |
| **UNCOMMON** | Moderate drops | 10-30% |
| **RARE** | Rare drops | 5-10% |
| **EPIC** | Very rare drops | 1-5% |
| **LEGENDARY** | Extremely rare | <1% |

### 6.2 Loot Tables

| Loot Type | Description | Examples |
|------------|-------------|----------|
| **ITEM_DROP** | Regular item drops | Equipment, materials |
| **GOLD_DROP** | Currency drops | Gold, silver |
| **QUEST_ITEM** | Quest-required drops | Keys, proofs |
| **BADGE_DROP** | Reputation items | Badges, tokens |
| **SCALE_DROP** | Monster parts | Scales, bones, hides |

### 6.3 Loot Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `lootTableId` | Int | Reference to loot table | null |
| `goldMin` | Int | Minimum gold drop | 0 |
| `goldMax` | Int | Maximum gold drop | 0 |
| `experienceValue` | Int | XP given on death | 0 |
| `levelDifferencePenalty` | Float | XP reduction for overlevel | 0.5 |

---

## 7. Spawn System

### 7.1 Spawn Types

| Spawn Type | Description | Respawn Time |
|------------|-------------|--------------|
| **STATIC** | Fixed position | None (single spawn) |
| **DYNAMIC** | Random position in area | 5-30 minutes |
| **TIMED** | Specific schedule | Based on timer |
| **EVENT** | Triggered spawn | On event trigger |
| **BOSS** | Rare spawn | Hours to days |
| **WORLD_BOSS** | Global spawn | Weekly/Events |

### 7.2 Spawn Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `spawnType` | String | Static, Dynamic, Timed | "DYNAMIC" |
| `spawnArea` | String | Region/zone name | null |
| `spawnCount` | Int | Number to spawn | 1 |
| `respawnTime` | Int | Seconds to respawn | 300 |
| `maxPopulation` | Int | Max in area | 10 |
| `spawnCondition` | String | Trigger condition | null |

---

## 8. Difficulty Tiers

### 8.1 Monster Level Scaling

| Tier | Level Range | Stat Multiplier | Notes |
|------|-------------|-----------------|-------|
| **NORMAL** | 1-30 | 1.0x | Basic content |
| **ELITE** | 31-50 | 1.5x | Enhanced stats |
| **CHAMPION** | 51-70 | 2.0x | Special abilities |
| **ELITE_CHAMPION** | 71-85 | 2.5x | Boss-tier |
| **LEGENDARY** | 86-95 | 3.0x | Named bosses |
| **MYTHIC** | 96-99 | 4.0x | End-game content |

### 8.2 Difficulty Modifiers

| Modifier | HP | ATK | DEF | XP |
|----------|-----|-----|-----|-----|
| **NONE** | 1.0x | 1.0x | 1.0x | 1.0x |
| **DANGER_1** | 1.2x | 1.1x | 1.1x | 1.2x |
| **DANGER_2** | 1.5x | 1.2x | 1.2x | 1.5x |
| **DANGER_3** | 2.0x | 1.5x | 1.5x | 2.0x |
| **DEADLY** | 3.0x | 2.0x | 2.0x | 3.0x |

---

## 9. Region Distribution

### 9.1 Recommended Monster Distribution by Region

| Region Type | Primary Category | Level Range | Difficulty |
|-------------|-----------------|-------------|------------|
| **Grassland** | BEAST | 1-15 | Easy |
| **Forest** | BEAST, HUMANOID | 10-30 | Easy-Medium |
| **Cave** | UNDEAD, BEAST | 20-40 | Medium |
| **Swamp** | UNDEAD, ELEMENTAL | 30-50 | Medium-Hard |
| **Mountain** | DRAGON, CONSTRUCT | 40-60 | Hard |
| **Volcano** | ELEMENTAL, DEMON | 50-70 | Hard-Very Hard |
| **Dungeon** | VARIED | 30-80 | Medium-Very Hard |
| **Raid** | DRAGON, DEMON | 70-99 | Extreme |

---

## 10. Database Structure

### 10.1 Monster Template Schema

```prisma
model MonsterTemplate {
  id                Int       @id @default(autoincrement())
  name              String
  description       String
  category          String    // BEAST, UNDEAD, ELEMENTAL, etc.
  subCategory      String?   // Specific type
  level            Int       @default(1)
  
  // Primary Stats
  hp                Int       @default(100)
  mp                Int       @default(0)
  attack_damage     Int       @default(10)
  magic_attack      Int       @default(0)
  defense           Int       @default(0)
  magic_defense     Int       @default(0)
  speed             Int       @default(100)
  
  // Secondary Stats
  accuracy          Int       @default(100)
  dodge_rate        Int       @default(0)
  crit_chance       Float     @default(0.05)
  crit_damage       Float     @default(1.5)
  attack_range      Int       @default(1)
  parry_chance     Float     @default(0)
  block_chance     Float     @default(0)
  block_power       Float     @default(0.5)
  armor_penetration Int       @default(0)
  
  // Elemental Resistances
  fireResistance   Int       @default(0)
  iceResistance   Int       @default(0)
  lightningResistance Int    @default(0)
  darkResistance  Int       @default(0)
  divineResistance Int      @default(0)
  voidResistance  Int       @default(0)
  
  // Behavior
  aiBehavior       String    @default("AGGRESSIVE")
  aiSubType        String?
  decisionRate     Int       @default(1000)
  
  // Loot
  goldMin          Int       @default(0)
  goldMax          Int       @default(0)
  experienceValue  Int       @default(10)
  lootTableId     Int?
  
  // Spawn
  spawnType        String    @default("DYNAMIC")
  respawnTime      Int       @default(300)
  
  // Category-specific (JSON)
  specificStats    String    @default("{}")
  
  // Relations
  drops            MonsterDrop[]
  spawns           MonsterSpawn[]
}
```

### 10.2 Monster Drop Schema

```prisma
model MonsterDrop {
  id              Int       @id @default(autoincrement())
  monsterId       Int
  itemTemplateId Int
  dropRate       Float     @default(0.1)  // 10% base
  dropCategory   String    // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
  minQuantity    Int       @default(1)
  maxQuantity    Int       @default(1)
  isQuestItem    Boolean   @default(false)
  
  monster         MonsterTemplate @relation(fields: [monsterId], references: [id])
}
```

### 10.3 Monster Spawn Schema

```prisma
model MonsterSpawn {
  id              Int       @id @default(autoincrement())
  monsterId       Int
  regionId        Int
  spawnType       String    @default("DYNAMIC")
  spawnArea       String?   // Specific area within region
  positionX       Int?
  positionY       Int?
  respawnTime     Int       @default(300)
  maxPopulation   Int       @default(10)
  spawnCondition  String?
  
  monster         MonsterTemplate @relation(fields: [monsterId], references: [id])
  region          Region          @relation(fields: [regionId], references: [id])
}
```

---

## 11. Implementation Examples

### 11.1 Beast Example - Direwolf

```json
{
  "id": 5001,
  "name": "Direwolf",
  "description": "A massive wolf that hunts in packs. Its glowing eyes strike fear into travelers.",
  "category": "BEAST",
  "subCategory": "PREDATOR",
  "level": 25,
  
  "hp": 450,
  "mp": 0,
  "attack_damage": 65,
  "magic_attack": 0,
  "defense": 35,
  "magic_defense": 10,
  "speed": 120,
  
  "accuracy": 100,
  "dodge_rate": 10,
  "crit_chance": 0.08,
  "crit_damage": 1.5,
  "attack_range": 1,
  "parry_chance": 0,
  "block_chance": 0,
  "block_power": 0.5,
  "armor_penetration": 0,
  
  "fireResistance": 0,
  "iceResistance": 0,
  
  "aiBehavior": "HUNTING",
  "aiSubType": "PACK_LEADER",
  
  "goldMin": 15,
  "goldMax": 35,
  "experienceValue": 150,
  
  "specificStats": {
    "beastType": "WOLF",
    "isPackLeader": true,
    "packSize": 4,
    "attackPattern": "CHARGE",
    "traits": "PACK_HUNTER",
    "passives": "HOWL, PREDATOR"
  }
}
```

### 11.2 Undead Example - Lich

```json
{
  "id": 5201,
  "name": "Dark Lich",
  "description": "An undead sorcerer who has transcended mortality through dark magic.",
  "category": "UNDEAD",
  "subCategory": "LICH",
  "level": 60,
  
  "hp": 2500,
  "mp": 1500,
  "attack_damage": 150,
  "magic_attack": 450,
  "defense": 120,
  "magic_defense": 300,
  "speed": 80,
  
  "accuracy": 130,
  "dodge_rate": 20,
  "crit_chance": 0.15,
  "crit_damage": 1.5,
  "attack_range": 6,
  "parry_chance": 0,
  "block_chance": 0,
  "block_power": 0.5,
  "armor_penetration": 0,
  
  "fireResistance": -20,
  "iceResistance": 50,
  "darkResistance": 80,
  "divineResistance": -30,
  
  "aiBehavior": "GUARD",
  "aiSubType": "CASTER",
  
  "goldMin": 200,
  "goldMax": 500,
  "experienceValue": 1200,
  
  "specificStats": {
    "undeadType": "LICH",
    "isReviving": true,
    "reviveTimer": 30,
    "soulBound": true,
    "negativeEnergy": 50,
    "fearAura": 3
  }
}
```

### 11.3 Dragon Example - Ancient Fire Dragon

```json
{
  "id": 5401,
  "name": "Ignatius the Flame",
  "description": "An ancient dragon whose flames have scorched mountains for millennia.",
  "category": "DRAGON",
  "subCategory": "DRAGON",
  "level": 85,
  
  "hp": 50000,
  "mp": 5000,
  "attack_damage": 1500,
  "magic_attack": 2000,
  "defense": 800,
  "magic_defense": 1000,
  "speed": 50,
  
  "accuracy": 150,
  "dodge_rate": 30,
  "crit_chance": 0.20,
  "crit_damage": 2.0,
  "attack_range": 2,
  "parry_chance": 0.25,
  "block_chance": 0,
  "block_power": 0.5,
  "armor_penetration": 200,
  
  "fireResistance": 90,
  "iceResistance": -50,
  "lightningResistance": 30,
  "darkResistance": 50,
  "divineResistance": -30,
  
  "aiBehavior": "BERSERK",
  "aiSubType": "DRAGON",
  
  "goldMin": 5000,
  "goldMax": 15000,
  "experienceValue": 10000,
  
  "specificStats": {
    "dragonAge": "ANCIENT",
    "breathType": "FIRE",
    "breathArea": 5,
    "hasWings": true,
    "isLegendary": true,
    "scaleHardness": 200,
    "terrifyAura": 8,
    "traits": "FLAME_BREATH, TERRIFYING_PRESENCE",
    "passives": "SCALE_ARMOR, DRAGON_MAGE"
  }
}
```

---

## 12. Balance Guidelines

### 12.1 HP Calculation Formula

```
Monster HP = Base HP × Level × Tier Multiplier × Region Difficulty
```

### 12.2 Damage Scaling

| Monster Level | ATK Multiplier | DEF Multiplier |
|---------------|----------------|----------------|
| 1-10 | 1.0x | 1.0x |
| 11-20 | 1.5x | 1.3x |
| 21-30 | 2.0x | 1.6x |
| 31-40 | 2.8x | 2.0x |
| 41-50 | 3.8x | 2.5x |
| 51-60 | 5.0x | 3.2x |
| 61-70 | 6.5x | 4.0x |
| 71-80 | 8.5x | 5.0x |
| 81-90 | 11.0x | 6.2x |
| 91-99 | 14.0x | 7.8x |

### 12.3 XP Value Calculation

```
Base XP = Monster Level × 10 × Tier Multiplier
Player XP = Base XP × (1 - LevelDifferencePenalty)
```

---

## 13. Appendix: Quick Reference

### Category to Sub-Category Mapping

| Main Category | Valid Sub-Categories |
|---------------|---------------------|
| BEAST | NORMAL_BEAST, PREDATOR, BEASTLORD, MYTHICAL_BEAST, INSECT |
| UNDEAD | SKELETON, ZOMBIE, GHOST, LICH, VAMPIRE |
| ELEMENTAL | FIRE_ELEMENTAL, WATER_ELEMENTAL, EARTH_ELEMENTAL, AIR_ELEMENTAL, NATURE_ELEMENTAL, VOID_ELEMENTAL |
| DEMON | IMP, HELLFIRE, DEMON_LORD, ARCHDEMON, SATANIC |
| HUMANOID | BANDIT, MERCENARY, CULTIST, KNIGHT, WIZARD, BERSERKER |
| CONSTRUCT | GOLEM, AUTOMATON, WAR_MACHINE, SENTINEL |
| DRAGON | WYRM, DRAKE, DRAGON, ELDER_DRAGON, GOD_DRAGON |

### Recommended Spawn Densities

| Region Danger | Monster Density | Respawn Time |
|---------------|----------------|--------------|
| SAFE | Low (1-3) | Long (10+ min) |
| NORMAL | Medium (4-8) | Normal (3-5 min) |
| DANGER | High (8-15) | Short (1-3 min) |
| DEADLY | Very High (15-25) | Very Short (30s-1 min) |

---

*End of Document*

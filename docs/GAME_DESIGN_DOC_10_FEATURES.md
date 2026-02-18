# 🎮 Textical: 10 New Game Logic Features
## Comprehensive Game Design Document

**Document Version:** 1.0  
**Created:** 2026-02-17  
**Status:** Design Complete - Ready for Implementation

---

## Table of Contents
1. [Elemental Reactions System](#1-elemental-reactions-system)
2. [Skill Specialization System](#2-skill-specialization-system)
3. [Hero Bond System](#3-hero-bond-system)
4. [Item Enchantment System](#4-item-enchantment-system)
5. [Item Socketing System](#5-item-socketing-system)
6. [Crafting Fail System](#6-crafting-fail-system)
7. [Dynamic Dungeon System](#7-dynamic-dungeon-system)
8. [Treasure Map System](#8-treasure-map-system)
9. [PvP Arena Ladder System](#9-pvp-arena-ladder-system)
10. [Weekly Boss Raid System](#10-weekly-boss-raid-system)

---

## 1. Elemental Reactions System

### Overview
Extends the existing elemental system to include **elemental reactions** - powerful combo effects when two different elements interact on a target.

### Existing System Reference
- Current: [`ElementalResolver.js`](server/src/services/stat/ElementalResolver.js)
- Current elements: Fire, Water, Earth, Wind, Light, Dark

### Reaction Table

| Element A | Element B | Reaction | Effect | Damage Bonus |
|----------|-----------|----------|--------|--------------|
| Fire | Ice/ Water | **Steam** | AoE explosion + Blind | +50% |
| Fire | Wind | **Firestorm** | Burn spread to nearby units | +30% |
| Fire | Earth | **Magma** | Armor penetration (ignore 30% DEF) | +40% |
| Ice/ Water | Wind | **Blizzard** | Freeze + Slow stack +1 | +35% |
| Lightning | Water | **Shock** | Stun 2s + Damage chain | +60% |
| Lightning | Earth | **Seismic Shock** | Root 3s + AoE tremor | +45% |
| Dark | Light | **Annihilation** | True damage + Debuff cleanse | +100% |
| Earth | Water | **Mud** | Heavy Slow (-50% speed) | +25% |

### Implementation Requirements

#### Database Schema (Prisma)
```prisma
model ElementalReaction {
  id            Int    @id @default(autoincrement())
  elementA      String // fire, water, earth, wind, light, dark
  elementB      String
  reactionName  String // steam, firestorm, magma, etc.
  effectType   String // stun, root, blind, etc.
  effectValue  Float  // duration or magnitude
  damageBonus  Float  // multiplier (e.g., 1.5 = +50%)
  aoeRadius    Int    @default(0) // 0 = single target
  isPositive   Boolean @default(false) // for ally buffs
}
```

#### Combat Integration
- **Trigger Point:** After damage calculation, before damage application
- **Detection:** Check target's active status effects for elements
- **Priority:** Reaction > Normal damage > On-hit effects

### Code Architecture
```
server/src/logic/combat/
├── elemental/
│   ├── ElementalReactionResolver.js  // Main reaction logic
│   ├── reaction/
│   │   ├── SteamReaction.js
│   │   ├── ShockReaction.js
│   │   ├── FirestormReaction.js
│   │   └── ... (other reactions)
```

### Gameplay Impact
- **Meta Shift:** Teams will build around elemental combos
- **Build Diversity:** New "Reaction Master" builds possible
- **Difficulty Increase:** Bosses may resist certain reactions

---

## 2. Skill Specialization System

### Overview
A mastery system where **repeated use of specific skills** unlocks permanent passive bonuses. Players become true "specialists" in their favorite abilities.

### Mechanic Design

#### Mastery Levels (per skill)
| Level | Uses Required | Passive Bonus |
|-------|---------------|---------------|
| Novice | 0 | None |
| Apprentice | 50 | +5% skill damage |
| Expert | 150 | +10% skill damage, +5% effect duration |
| Master | 400 | +15% skill damage, +10% effect duration, +5% crit chance |
| Grandmaster | 1000 | +20% skill damage, +15% effect duration, +10% crit chance, +10% cost reduction |

#### Mastery Categories
- **Damage Skills:** Attack skills of each element
- **Healing Skills:** All heal abilities
- **Support Skills:** Buffs and debuffs
- **Utility Skills:** Movement, teleportation

### Database Schema
```prisma
model SkillMastery {
  id          Int     @id @default(autoincrement())
  userId      Int
  heroId      Int
  skillId     Int
  useCount    Int     @default(0)
  level       String  @default("NOVICE") // NOVICE, APPRENTICE, EXPERT, MASTER, GRANDMASTER
  unlockedAt  DateTime @default(now())
  
  @@unique([heroId, skillId])
}

model SkillMasteryReward {
  skillId     Int
  level       String
  statKey     String  // attack_damage, crit_chance, etc.
  statValue   Float
  effectDurationBonus Float @default(0)
  costReduction Float   @default(0)
}
```

### Integration Points
- **Battle End:** Increment useCount for each skill used
- **Stat Calculation:** Include mastery bonuses in 12-layer pipeline (Layer 7: SKILLS)
- **UI:** Display mastery level and progress bar on skill tooltip

### Code Architecture
```javascript
// server/src/services/skill/SkillMasteryService.js
class SkillMasteryService {
  async recordSkillUse(userId, heroId, skillId, battleId) {
    // 1. Increment use count
    // 2. Check for level up
    // 3. Trigger notification if level up
    // 4. Log to battle for replay
  }
  
  getMasteryBonus(skillId, level) {
    // Return stat modifiers based on level
  }
}
```

### Progression Feel
- Players feel rewarded for "maining" specific skills
- Long-term engagement: 1000 uses = ~hours of gameplay
- No FOMO: Each skill can be mastered independently

---

## 3. Hero Bond System

### Overview
Party synergy system where having **specific hero combinations** provides bonus stats based on class combinations, race synergies, or story connections.

### Bond Types

#### Class Bonds (3-hero party)
| Combination | Bond Name | Bonus |
|-------------|-----------|-------|
| Warrior + Warrior + Warrior | **Trinity Force** | +15% ATK, +10% DEF |
| Mage + Mage + Mage | **Arcane Ascension** | +20% MATK, +10% MP |
| Warrior + Mage + Healer | **Holy Trinity** | +10% all stats |
| Ranger + Ranger + Ranger | **Pack Hunters** | +25% evasion |
| Tank + DPS + Support | **Balanced Party** | +10% HP, +10% ATK, +10% Heal |

#### Race Bonds
| Race Combo | Bonus |
|------------|-------|
| 3x Undead | Immortality: Revive once per battle at 25% HP |
| 3x Dragonkin | Dragon's Roar: +30% fire damage |
| 2x Vampire + 1x Any | Blood Thirst: +40% lifesteal |

#### Elemental Bonds
- All heroes same element: +20% elemental damage

### Database Schema
```prisma
model HeroBond {
  id          Int     @id @default(autoincrement())
  bondType    String  // CLASS, RACE, ELEMENTAL
  name        String  // e.g., "Holy Trinity"
  description String
  requirement String  // JSON: { class: ["WARRIOR", "MAGE", "HEALER"] }
  bonuses     Json    // { attack_damage: 0.10, defense: 0.10 }
}

model UserHeroBond {
  id        Int      @id @default(autoincrement())
  userId    Int
  heroId    Int      // Primary hero (bond owner)
  bondId    Int
  activated Boolean  @default(false)
  activatedAt DateTime?
}
```

### Stat Integration
- Applied in Layer 9: PARTY (new layer after GUILD)
- Dynamic: Recalculated when party composition changes
- Display: Show active bonds in party UI

### Implementation Notes
```javascript
// Calculate party bonds
function calculatePartyBonds(heroIds) {
  const heroes = await getHeroesByIds(heroIds);
  const bonds = [];
  
  // Check class bonds
  const classes = heroes.map(h => h.combatClass);
  bonds.push(findMatchingClassBond(classes));
  
  // Check race bonds
  const races = heroes.map(h => h.race);
  bonds.push(findMatchingRaceBond(races));
  
  // Check elemental bonds
  const elements = heroes.map(h => h.element);
  if (allSame(elements)) bonds.push(createElementalBond(elements[0]));
  
  return bonds;
}
```

---

## 4. Item Enchantment System

### Overview
Add **magical properties** to equipment using enchantment materials. Each equipment can have multiple enchantments.

### Enchantment Types

| Category | Enchantment | Effect | Materials Required |
|----------|-------------|--------|-------------------|
| **Attack** | Sharpness | +10 ATK | 5x Sharp Stone, 100 Gold |
| **Attack** | Berserker | +15% ATK when HP < 50% | 3x Blood Ruby, 500 Gold |
| **Defense** | Fortification | +10 DEF | 5x Iron Ingot, 100 Gold |
| **Defense** | Stone Skin | +5% damage reduction | 3x Earth Crystal, 300 Gold |
| **Elemental** | Flame | +15 Fire damage | 5x Fire Essence, 250 Gold |
| **Elemental** | Frost | +15 Ice damage | 5x Frost Essence, 250 Gold |
| **Special** | Lucky | +5% drop rate | 3x Clover Leaf, 1000 Gold |
| **Special** | Soul Bind | Prevents item loss on death | 1x Soul Gem, 5000 Gold |

### Enchantment Rules
- **Max Enchantments per Item:** 3 (equipment) / 2 (accessories)
- **Enchantment Level Cap:** +10 (scales with item quality)
- **Cost:** Scales with item tier (Common/Rare/Epic/Legendary)
- **Failure:** Failed enchantment preserves item but loses materials

### Database Schema
```prisma
model ItemEnchantment {
  id              Int     @id @default(autoincrement())
  name            String
  category        String  // ATTACK, DEFENSE, ELEMENTAL, SPECIAL
  statKey         String  // attack_damage, defense, etc.
  statValue       Float
  condition       String? // JSON condition for conditional effects
  materialId      Int
  materialCount   Int
  goldCost        Int
  successRate     Float   @default(0.8) // 80%
}

model InventoryItemEnchantment {
  id              Int     @id @default(autoincrement())
  inventoryItemId Int
  enchantmentId   Int
  appliedAt       DateTime @default(now())
  
  @@unique([inventoryItemId, enchantmentId])
}
```

### UI Requirements
- Enchantment tab in equipment detail
- Preview of bonuses before confirming
- Success/failure animation
- Enchantment scroll (one-click apply)

---

## 5. Item Socketing System

### Overview
Insert **gems** into equipment slots to gain additional stats. Each piece of equipment has a specific number of socket slots.

### Socket Rules
| Equipment Type | Socket Slots |
|----------------|--------------|
| Weapon | 3 slots |
| Armor | 2 slots |
| Helmet | 2 slots |
| Boots | 1 slot |
| Accessory | 1 slot |

### Gem Types

| Gem | Color | Effect | Source |
|-----|-------|--------|--------|
| Ruby | 🔴 Red | +10 ATK | Mining |
| Sapphire | 🔵 Blue | +10 MATK | Mining |
| Emerald | 🟢 Green | +10 DEF | Mining |
| Diamond | ⚪ White | +5% crit chance | Mining (rare) |
| Amethyst | 🟣 Purple | +50 HP | Mining |
| Topaz | 🟡 Yellow | +10% gold find | Mining |
| Onyx | ⚫ Black | +5% damage reduction | Boss drops |
| Citrine | 🟠 Orange | +10% XP gain | Events |

### Gem Combinations (Set Bonuses)
| 2 Gems Same Color | Bonus |
|-------------------|-------|
| 2x Ruby | +5% ATK |
| 2x Sapphire | +5% MATK |
| 2x Diamond | +10% crit damage |
| 2x Onyx | +10% damage reduction |

### Database Schema
```prisma
model GemTemplate {
  id          Int     @id @default(autoincrement())
  name        String
  color       String  // RED, BLUE, GREEN, WHITE, PURPLE, YELLOW, BLACK, ORANGE
  statKey     String
  statValue   Float
  rarity      String  // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
  setBonusId  Int?   // Optional set bonus
}

model InventoryItemSocket {
  id              Int     @id @default(autoincrement())
  inventoryItemId Int
  slotIndex       Int     // 0, 1, 2
  gemId           Int?    // null if empty
  insertedAt      DateTime?
}
```

### Mechanics
- **Socket Creation:** Random chance when crafting (10% per slot)
- **Gem Removal:** Costs 50% of gem value
- **Gem Upgrade:** 3x same gem = 1x next tier

---

## 6. Crafting Fail System

### Overview
Introduces **risk and reward** to crafting. Failed crafts may result in item destruction or quality degradation.

### Failure Mechanics

#### Failure Outcomes
| Outcome | Chance | Effect |
|---------|--------|--------|
| **Safe Fail** | 40% | Materials lost, item not created |
| **Quality Drop** | 30% | Item created but -20% quality |
| **Item Destroyed** | 20% | Existing item (if upgrading) destroyed |
| **Catastrophic** | 10% | All materials + tools lost |

#### Skill-Based Mitigation
- **Novice Crafter:** Base failure rates
- **Apprentice:** -10% failure chance
- **Expert:** -20% failure chance, +10% quality drop prevention
- **Master:** -30% failure chance, never catastrophic
- **Grandmaster:** 100% success (within quality range)

### Database Schema
```prisma
model CraftingSkill {
  id          Int     @id @default(autoincrement())
  userId      Int
  profession  String  // BLACKSMITH, ENCHANTER, ALCHEMIST, TAILOR
  level       Int     @default(1)
  experience  Int     @default(0)
  
  @@unique([userId, profession])
}

model CraftingRecipe {
  id              Int     @id @default(autoincrement())
  name            String
  profession      String
  inputs          Json    // [{ itemId, quantity }]
  outputItemId    Int
  outputQuantity  Int     @default(1)
  baseSuccessRate Float   @default(0.8)
  experienceGain  Int
  
  // Failure weights
  safeFailWeight  Float   @default(0.4)
  qualityDropWeight Float @default(0.3)
  destroyWeight   Float   @default(0.2)
  catastrophicWeight Float @default(0.1)
}
```

### Crafting Formula
```javascript
function calculateCraftingSuccess(recipe, professionLevel) {
  const baseRate = recipe.baseSuccessRate;
  const skillBonus = Math.min(0.3, professionLevel * 0.02); // Max 30%
  const toolBonus = hasQualityTools ? 0.05 : 0;
  const materialBonus = highQualityMaterials ? 0.1 : 0;
  
  const finalRate = Math.min(1.0, baseRate + skillBonus + toolBonus + materialBonus);
  const roll = Math.random();
  
  return roll < finalRate ? 'SUCCESS' : determineFailure(recipe);
}
```

### UI Feedback
- Success rate display before crafting
- Animated crafting process
- Clear failure message with outcome

---

## 7. Dynamic Dungeon System

### Overview
Each dungeon entry features **random modifiers** that change the difficulty and strategy required.

### Modifier Types

#### Difficulty Modifiers
| Modifier | Effect | Difficulty |
|----------|--------|-------------|
| **Enraged** | Enemies +30% ATK, +20% HP | +1 |
| **Fortified** | Enemies +40% DEF | +1 |
| **Swarm** | 2x enemy count, -20% HP each | +1 |
| **Elite** | All enemies are elite variants | +2 |
| **Boss Rush** | No normal enemies, 3x bosses | +3 |

#### Elemental Modifiers
| Modifier | Effect |
|----------|--------|
| **Fire Realm** | Fire damage +50%, Fire resistance +30% |
| **Frost Realm** | Ice damage +50%, Ice resistance +30% |
| **Void Realm** | Dark/Light damage +50% |

#### Special Modifiers
| Modifier | Effect |
|----------|--------|
| **No Healing** | No HP regeneration allowed |
| **Time Attack** | Clear in X minutes or fail |
| **Solo Run** | Only 1 hero allowed |
| **Equipment Lock** | Cannot change equipment mid-dungeon |

### Generation Rules
- **Modifier Count:** Level 1-10 = 1 modifier, 11-30 = 2, 31+ = 3
- **Rarity Weight:** Common 50%, Uncommon 30%, Rare 15%, Legendary 5%
- **Impossible Combo:** Never generate conflicting modifiers

### Database Schema
```prisma
model DungeonModifier {
  id          Int     @id @default(autoincrement())
  name        String
  category    String  // DIFFICULTY, ELEMENTAL, SPECIAL
  effect      Json    // { statKey: value, operation: "multiply" }
  rarity      String  // COMMON, UNCOMMON, RARE, LEGENDARY
  difficulty  Int     // -2 to +3
  icon        String  // icon path
}

model DungeonEntry {
  id              Int     @id @default(autoincrement())
  userId          Int
  dungeonTemplateId Int
  modifiers       Json    // Array of modifier IDs
  startedAt       DateTime
  completedAt     DateTime?
  success         Boolean?
  rewardClaimed   Boolean @default(false)
}
```

### UI Display
- Modifier icons shown before entering
- Tooltip explaining each modifier
- "Roll New Modifiers" option (costs tokens)

---

## 8. Treasure Map System

### Overview
Items that reveal **hidden treasure locations** on the world map. Players must travel to the coordinates and "dig" to claim rewards.

### Map Rarity & Rewards
| Map Rarity | Coordinates | Rewards |
|------------|-------------|---------|
| Common | Exact location | 100-500 Gold, Common items |
| Uncommon | Region only | 500-2000 Gold, Uncommon items |
| Rare | General area | 2000-10000 Gold, Rare items, Chance for Epic |
| Legendary | Vague hint | 10000+ Gold, Epic/Legendary items, Unique collectibles |

### Mechanics

#### Map Generation
- Generated from: Boss drops, achievements, daily login, events
- Player-to-player tradeable
- Expiration: 7 days after acquisition

#### Treasure Discovery
1. Use map → Shows coordinates/region
2. Travel to location
3. Click "Dig" action (3 second channel)
4. Random roll for quality
5. Loot distributed to inventory

#### Anti-Exploit
- One treasure per map
- Map binds to account on use
- Coordinates slightly randomized (±1-3 tiles)

### Database Schema
```prisma
model TreasureMap {
  id              Int     @id @default(autoincrement())
  ownerId         Int
  rarity          String  // COMMON, UNCOMMON, RARE, LEGENDARY
  regionId        Int?    // Exact or null
  coordinatesX    Int?
  coordinatesY    Int?
  hints           String? // For legendary maps
  expiresAt       DateTime
  usedAt          DateTime?
  treasureClaimed Boolean @default(false)
  
  @@index([ownerId])
}

model TreasureLootTable {
  id          Int     @id @default(autoincrement())
  rarity      String
  itemId      Int
  quantityMin Int
  quantityMax Int
  weight      Int     // For random selection
}
```

### UI Components
- Map inventory tab showing all maps
- "Use Map" action in region view
- Dig button appears when at correct location
- Treasure chest animation on success

---

## 9. PvP Arena Ladder System

### Overview
Ranked PvP competition with **season-based rewards**. Players climb the ladder for exclusive titles and items.

### Season Structure
| Parameter | Value |
|-----------|-------|
| Season Duration | 4 weeks |
| Qualifying Matches | 10 matches minimum |
| Promotion/Demotion | Based on MMR |
| Rank Reset | Partial (current rank → new season -1) |

### Rank Tiers
| Tier | Rank | MMR Range | Title | Rewards |
|------|------|-----------|-------|---------|
| Bronze | V-IV-III-II-I | 0-999 | Bronze Warrior | 1000 Gold |
| Silver | V-IV-III-II-I | 1000-1499 | Silver Knight | 5000 Gold, Silver weapon skin |
| Gold | V-IV-III-II-I | 1500-1999 | Gold Champion | 20000 Gold, Gold weapon skin |
| Platinum | V-IV-III-II-I | 2000-2499 | Platinum Hero | 50000 Gold, Platinum mount |
| Diamond | V-IV-III-II-I | 2500-2999 | Diamond Legend | 100000 Gold, Diamond title |
| Champion | I | 3000+ | Champion | 500000 Gold, Unique aura |

### Match Mechanics
- **Format:** 3v3 or 5v5 (based on queue)
- **Map:** Arena-specific (no terrain advantage)
- **Bans:** Each team bans 1 hero
- **Watchable:** Other players can spectate

### Database Schema
```prisma
model PvPMatch {
  id              Int     @id @default(autoincrement())
  seasonId        Int
  winnerTeam      Json    // [userId, heroId]
  loserTeam       Json
  duration        Int     // seconds
  mmrChange       Json    // { userId: change }
  createdAt       DateTime @default(now())
}

model PvPSeason {
  id          Int     @id @default(autoincrement())
  name        String  // "Season 1: Rise of Champions"
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean @default(false)
}

model UserPvPProfile {
  id          Int     @id @default(autoincrement())
  userId      Int     @unique
  seasonId    Int
  mmr         Int     @default(1000)
  rank        String  // BRONZE_V, SILVER_IV, etc.
  wins        Int     @default(0)
  losses      Int     @default(0)
  matches     Int     @default(0)
  
  @@unique([userId, seasonId])
}
```

### Reward Distribution
- **End of Season:** Based on final rank
- **Weekly Rewards:** Bonus for playing X matches
- **Milestone:** Special reward at 50, 100, 500 matches

---

## 10. Weekly Boss Raid System

### Overview
End-game content where players team up to defeat powerful bosses that **respawn weekly** with increasing difficulty.

### Boss Mechanics

#### Weekly Boss Structure
| Day | Boss | Region | Recommended Power |
|-----|------|--------|-------------------|
| Monday | **Giant Crab** | Ocean | 5000 |
| Tuesday | **Fire Dragon** | Volcano | 6000 |
| Wednesday | **Ancient Golem** | Mine | 7000 |
| Thursday | **Shadow Assassin** | Ruins | 7500 |
| Friday | **Frost Wyrm** | Glacier | 8000 |
| Saturday | **Demon Lord** | Hell | 9000 |
| Sunday | **World Eater** |随机 | 10000 |

#### Difficulty Scaling
- **Week 1-4:** Base difficulty
- **Week 5-8:** +10% HP/Damage
- **Week 9-12:** +20% HP/Damage, new abilities
- **Week 13+:** Infinite scaling (10% per 4 weeks)

### Raid Mechanics

#### Entry Requirements
- **Party Size:** 5-20 players
- **Level Minimum:** 30
- **Entry Cost:** 1000 Gold or 1 Raid Token
- **Daily Attempts:** 3 (resets at midnight)

#### Boss Abilities (Example: Fire Dragon)
1. **Flame Breath:** AoE fire damage to front cone
2. **Tail Whip:** Knockback + damage
3. **Fire Nova:** 360° damage blast
4. **Enrage:** After 5 minutes, +50% damage
5. **Meteor Shower:** Random targeting, dodge required

### Rewards

#### Participation Rewards
| Damage % | Reward |
|----------|--------|
| 1-24% | 1000 Gold, 1x Rare |
| 25-49% | 2500 Gold, 2x Rare |
| 50-74% | 5000 Gold, 1x Epic |
| 75-99% | 10000 Gold, 2x Epic |
| 100% (Kill) | 25000 Gold, 1x Legendary |

#### Loot Table
- Boss-specific equipment sets
- Rare crafting materials
- Mounts (1% drop rate)
- Titles (first kill each week)

### Database Schema
```prisma
model WeeklyBoss {
  id          Int     @id @default(autoincrement())
  dayOfWeek   Int     // 0-6 (Sunday-Saturday)
  name        String
  templateId  Int
  baseHP      Int
  baseDamage  Int
  abilities   Json    // Array of ability definitions
  lootTableId Int
}

model RaidEntry {
  id          Int     @id @default(autoincrement())
  bossId      Int
  partyId     Int
  startedAt   DateTime
  endedAt     DateTime?
  damageDealt Int
  killed      Boolean
  rewardClaimed Boolean @default(false)
}

model RaidParticipant {
  id          Int     @id @default(autoincrement())
  raidEntryId Int
  userId      Int
  heroId      Int
  damage      Int
  healing     Int
  died        Boolean @default(false)
}
```

### UI Components
- Weekly boss schedule in calendar
- Raid lobby (party creation)
- Real-time damage meter
- Loot distribution UI

---

## Implementation Priority & Dependencies

### Phase 1: Combat & Progression (Weeks 1-3)
1. **Elemental Reactions** - Low complexity, high impact
2. **Skill Specialization** - Medium complexity, high engagement

### Phase 2: Item Enhancement (Weeks 3-5)
3. **Item Enchantment** - Medium complexity
4. **Item Socketing** - Medium complexity
5. **Crafting Fail System** - Low complexity

### Phase 3: Content & Exploration (Weeks 5-7)
6. **Dynamic Dungeon** - Medium complexity
7. **Treasure Map** - Low complexity

### Phase 4: Competitive (Weeks 7-10)
8. **PvP Arena Ladder** - High complexity
9. **Weekly Boss Raid** - High complexity
10. **Hero Bond** - Can be parallelized

---

## Risk Assessment

| Feature | Risk Level | Mitigation |
|---------|------------|------------|
| Elemental Reactions | Low | Extend existing system |
| Skill Specialization | Medium | Add new table, modify battle log |
| Hero Bond | Medium | Requires party system update |
| Enchantment | Medium | New UI needed |
| Socketing | Medium | New slot system |
| Crafting Fail | Low | Configurable rates |
| Dynamic Dungeon | High | Need dungeon template expansion |
| Treasure Map | Low | Straightforward implementation |
| PvP Ladder | High | New matchmaking needed |
| Weekly Boss | High | Complex coordination |

---

## Summary

This document provides complete design specifications for **10 new game features**:

1. **Elemental Reactions** - Combo system extending elemental interactions
2. **Skill Specialization** - Mastery-based progression per skill
3. **Hero Bond** - Party synergy bonuses
4. **Item Enchantment** - Add magical properties to equipment
5. **Item Socketing** - Gem insertion system
6. **Crafting Fail** - Risk/reward crafting mechanics
7. **Dynamic Dungeon** - Random modifier dungeons
8. **Treasure Map** - Exploration and discovery
9. **PvP Arena Ladder** - Ranked competitive PvP
10. **Weekly Boss Raid** - End-game cooperative content

Each feature includes:
- Complete mechanic design
- Database schema (Prisma)
- Implementation architecture
- UI requirements
- Risk assessment

**Ready for implementation team!**

---

*End of Document*

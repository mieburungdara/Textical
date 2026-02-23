# Player Progression Stat System - Implementation Plan

## Overview
Sistem untuk tracking dan menampilkan progresi pemain termasuk level, XP, achievements, milestones, dan lifetime statistics.

## Current State
- **Hero Model**: sudah memiliki `unitLevel`, `unitXp`, `classLevel`, `classXp`
- **ProgressionService**: sudah handle XP/Level progression
- **StatService**: sudah calculate hero stats
- **Missing**: Achievements, Milestones, Lifetime Stats, Progression History

---

## Phase 1: Database Foundation

### 1.1 Add New Models to schema.prisma

```prisma
// server/prisma/schema.prisma

// Achievement Templates (static data)
model AchievementTemplate {
  id            Int      @id @default(autoincrement())
  name          String
  description   String
  category      String   // COMBAT, GATHERING, CRAFTING, SOCIAL, EXPLORATION, SPECIAL
  icon          String   // icon resource path
  tier          String   // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
  
  // Requirements
  requirementType String  // KILL_COUNT, GATHER_AMOUNT, CRAFT_COUNT, LEVEL_REACH, etc.
  requirementValue Int    // target value to complete
  
  // Rewards
  rewardSilver  Int      @default(0)
  rewardGold    Int      @default(0)
  rewardXp      Int      @default(0)
  rewardTitle   String?  // optional title reward
  
  // Meta
  isSecret      Boolean  @default(false)
  isRepeatable  Boolean  @default(false)
  cooldownHours Int?     // for repeatable achievements
  
  heroes         HeroAchievement[]
}

// Hero's Earned Achievements
model HeroAchievement {
  id                Int      @id @default(autoincrement())
  heroId            Int
  hero              Hero     @relation(fields: [heroId], references: [id])
  achievementId     Int
  achievement       AchievementTemplate @relation(fields: [achievementId], references: [id])
  
  progress          Int      @default(0)
  isCompleted       Boolean  @default(false)
  completedAt       DateTime?
  completedCount    Int      @default(0) // for repeatable achievements
  lastProgressAt    DateTime @default(now())
  
  @@unique([heroId, achievementId])
}

// Milestone Templates (阶梯式目标)
model MilestoneTemplate {
  id            Int      @id @default(autoincrement())
  name          String
  description   String
  category      String   // LEVEL, COMBAT, GATHERING, CRAFTING, WEALTH, SOCIAL
  
  // Progression Data (multiple tiers per milestone)
  tiers         MilestoneTier[]
  
  heroes        HeroMilestone[]
}

// Individual Milestone Tiers
model MilestoneTier {
  id              Int      @id @default(autoincrement())
  milestoneId     Int
  milestone       MilestoneTemplate @relation(fields: [milestoneId], references: [id])
  
  tierNumber      Int      // 1, 2, 3, etc.
  targetValue     Int      // required value for this tier
  
  rewardSilver    Int      @default(0)
  rewardGold      Int      @default(0)
  rewardXp        Int      @default(0)
  rewardTitle     String?
  
  @@unique([milestoneId, tierNumber])
}

// Hero's Milestone Progress
model HeroMilestone {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  milestoneId     Int
  milestone       MilestoneTemplate @relation(fields: [milestoneId], references: [id])
  
  currentTier     Int      @default(0)
  currentValue    Int      @default(0)
  isCompleted     Boolean  @default(false)
  
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  
  @@unique([heroId, milestoneId])
}

// Lifetime Statistics (aggregate stats)
model LifetimeStats {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  // Combat Stats
  kills           Int      @default(0)
  deaths          Int      @default(0)
  bossKills       Int      @default(0)
  pvPkills        Int      @default(0)
  totalDamageDealt BigInt  @default(0)
  totalDamageTaken BigInt  @default(0)
  
  // Gathering Stats
  totalGathered   Int      @default(0)
  miningYield     Int      @default(0)
  lumberingYield  Int      @default(0)
  herbalismYield  Int      @default(0)
  fishingYield    Int      @default(0)
  
  // Crafting Stats
  itemsCrafted    Int      @default(0)
  craftsCompleted Int      @default(0)
  
  // Social Stats
  questsCompleted Int      @default(0)
  bountiesCompleted Int    @default(0)
  guildContributions Int   @default(0)
  
  // Exploration
  regionsVisited  Int      @default(0)
  distanceTraveled BigInt  @default(0)
  
  // Economy
  goldEarned      BigInt   @default(0)
  goldSpent       BigInt   @default(0)
  itemsSold       Int      @default(0)
  itemsBought     Int      @default(0)
  
  // Time
  totalPlayTimeSeconds BigInt @default(0)
  lastActiveAt    DateTime @default(now())
  
  updatedAt       DateTime @updatedAt
}

// Progression History (for charts/analytics)
model ProgressionHistory {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  recordedAt      DateTime @default(now())
  
  // Snapshot Data
  unitLevel       Int
  classLevel      Int
  totalXp         Int
  silver          BigInt
  gold            BigInt
  
  // Daily Stats Snapshot
  dailyKills      Int      @default(0)
  dailyGathered   Int      @default(0)
  dailyCrafted    Int      @default(0)
  
  @@index([heroId, recordedAt])
}

// Title System
model TitleTemplate {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  description     String
  icon            String?
  
  // Requirements
  requirementType String   // ACHIEVEMENT_COUNT, LEVEL_REACH, KILL_COUNT, etc.
  requirementValue Int
  
  isPrefix        Boolean  @default(false) // prefix goes before name
  isHidden        Boolean  @default(false)
  
  heroes          HeroTitle[]
}

// Hero's Earned Titles
model HeroTitle {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  titleId         Int
  title           TitleTemplate @relation(fields: [titleId], references: [id])
  
  isActive        Boolean  @default(false)
  earnedAt        DateTime @default(now())
  
  @@unique([heroId, titleId])
}
```

### 1.2 Update Hero Model (Optional Enhancement)
Tambahkan field untuk active title:
```prisma
model Hero {
  // ... existing fields ...
  
  activeTitleId   Int?
  activeTitle     TitleTemplate? @relation(fields: [activeTitleId], references: [id])
}
```

---

## Phase 2: Backend Services

### 2.1 AchievementService.js
**File**: `server/src/services/achievementService.js`

```javascript
class AchievementService extends BaseService {
  // Core Methods
  async checkAndUpdateProgress(heroId, eventType, value);
  async getHeroAchievements(heroId);
  async getAchievementProgress(heroId, achievementId);
  async claimAchievementReward(heroId, achievementId);
  async getCategoryProgress(heroId, category);
  
  // Bulk Updates
  async processKillEvent(heroId, targetType, isBoss);
  async processGatherEvent(heroId, resourceType, amount);
  async processCraftEvent(heroId, recipeId);
  async processLevelUp(heroId, newLevel);
}
```

### 2.2 MilestoneService.js
**File**: `server/src/services/milestoneService.js`

```javascript
class MilestoneService extends BaseService {
  // Core Methods
  async checkMilestoneProgress(heroId, category, currentValue);
  async getHeroMilestones(heroId);
  async getMilestoneProgress(heroId, milestoneId);
  async claimMilestoneReward(heroId, milestoneId, tierNumber);
  async getNextMilestone(heroId, category);
  
  // Progress Tracking
  async updateMilestoneValue(heroId, category, addedValue);
}
```

### 2.3 LifetimeStatsService.js
**File**: `server/src/services/lifetimeStatsService.js`

```javascript
class LifetimeStatsService extends BaseService {
  // Core Methods
  async getLifetimeStats(heroId);
  async incrementStat(heroId, statKey, amount = 1);
  async recordDailySnapshot(heroId);
  async getStatsHistory(heroId, days = 30);
  async getLeaderboard(statKey, limit = 10);
  
  // Event Handlers
  async onKill(heroId, targetType);
  async onDeath(heroId);
  async onGather(heroId, resourceType, amount);
  async onCraft(heroId);
  async onTrade(heroId, amount, type); // buy/sell
  async onTravel(heroId, distance);
}
```

### 2.4 TitleService.js
**File**: `server/src/services/titleService.js`

```javascript
class TitleService extends BaseService {
  // Core Methods
  async checkTitleEligibility(heroId);
  async earnTitle(heroId, titleId);
  async setActiveTitle(heroId, titleId);
  async removeActiveTitle(heroId);
  async getHeroTitles(heroId);
  async getAvailableTitles(heroId);
}
```

### 2.5 ProgressionHandler.js (Socket Integration)
**File**: `server/src/handlers/progressionHandler.js`

```javascript
// Socket Events
// Client → Server
progression:get_achievements     // Get all achievements and progress
progression:get_milestones       // Get all milestones and progress
progression:get_lifetime_stats   // Get lifetime statistics
progression:get_titles           // Get earned titles
progression:set_active_title     // Set active title
progression:get_history          // Get progression history for charts
progression:get_leaderboard      // Get leaderboard for a stat

// Server → Client
progression:achievements_list    // List of achievements with progress
progression:milestones_list      // List of milestones with progress
progression:stats_data           // Lifetime stats data
progression:titles_list          // List of earned titles
progression:title_earned         // Notification when title earned
progression:achievement_completed // Notification when achievement completed
progression:milestone_completed  // Notification when milestone completed
progression:history_data         // History data for charts
progression:leaderboard_data     // Leaderboard data
```

---

## Phase 3: Backend Repository

### 3.1 ProgressionRepository.js
**File**: `server/src/repositories/progressionRepository.js`

```javascript
class ProgressionRepository {
  // Achievement queries
  async getHeroAchievements(heroId);
  async getAchievementById(achievementId);
  async getAchievementsByCategory(category);
  
  // Milestone queries
  async getHeroMilestones(heroId);
  async getMilestoneById(milestoneId);
  async getMilestonesByCategory(category);
  
  // Stats queries
  async getLifetimeStats(heroId);
  async getStatsHistory(heroId, days);
  async getLeaderboard(statKey, limit);
  
  // Title queries
  async getHeroTitles(heroId);
  async getAvailableTitles(heroId);
}
```

---

## Phase 4: Client-Side Network Layer

### 4.1 ProgressionHandler.gd (Godot)
**File**: `client/src/network/ProgressionHandler.gd`

```gdscript
extends Node

signal achievements_updated(achievements)
signal milestones_updated(milestones)
signal stats_updated(stats)
signal titles_updated(titles)
signal title_earned(title_name)
signal achievement_completed(achievement_name)
signal milestone_completed(milestone_name)
signal history_received(data)
signal leaderboard_received(data)

func get_achievements():
    socket.emit_signal("send_data", "progression:get_achievements", {})

func get_milestones():
    socket.emit_signal("send_data", "progression:get_milestones", {})

func get_lifetime_stats():
    socket.emit_signal("send_data", "progression:get_lifetime_stats", {})

func get_titles():
    socket.emit_signal("send_data", "progression:get_titles", {})

func set_active_title(title_id):
    socket.emit_signal("send_data", "progression:set_active_title", {"titleId": title_id})

func get_history(days = 30):
    socket.emit_signal("send_data", "progression:get_history", {"days": days})

func get_leaderboard(stat_key, limit = 10):
    socket.emit_signal("send_data", "progression:get_leaderboard", {"statKey": stat_key, "limit": limit})

func _on_data_received(event, data):
    match event:
        "progression:achievements_list":
            emit_signal("achievements_updated", data)
        "progression:milestones_list":
            emit_signal("milestones_updated", data)
        "progression:stats_data":
            emit_signal("stats_updated", data)
        "progression:titles_list":
            emit_signal("titles_updated", data)
        "progression:title_earned":
            emit_signal("title_earned", data.name)
        "progression:achievement_completed":
            emit_signal("achievement_completed", data.name)
        "progression:milestone_completed":
            emit_signal("milestone_completed", data.name)
        "progression:history_data":
            emit_signal("history_received", data)
        "progression:leaderboard_data":
            emit_signal("leaderboard_received", data)
```

### 4.2 Integrate with SocketHandler.gd
**File**: `client/src/network/SocketHandler.gd`

```gdscript
# Add ProgressionHandler as child
var progression_handler = null

func _ready():
    progression_handler = preload("res://src/network/ProgressionHandler.gd").new()
    add_child(progression_handler)
```

---

## Phase 5: Client UI Components

### 5.1 ProgressionScreen.tscn + ProgressionScreen.gd
**File**: `client/src/ui/ProgressionScreen.tscn`

Main tab-based UI for progression:
- Achievements Tab
- Milestones Tab
- Statistics Tab
- Titles Tab

### 5.2 AchievementPanel.tscn + AchievementPanel.gd
**File**: `client/src/ui/AchievementPanel.tscn`

Display achievements with:
- Category filter
- Progress bar
- Completion status
- Reward preview

### 5.3 MilestonePanel.tscn + MilestonePanel.gd
**File**: `client/src/ui/MilestonePanel.tscn`

Display milestones with:
- Tier progress
- Next reward preview
- Category filter

### 5.4 StatsPanel.tscn + StatsPanel.gd
**File**: `client/src/ui/StatsPanel.tscn`

Display lifetime statistics with:
- Combat stats (kills, deaths, etc.)
- Gathering stats
- Economy stats
- Play time

### 5.5 TitlePanel.tscn + TitlePanel.gd
**File**: `client/src/ui/TitlePanel.tscn`

Display and manage titles with:
- Earned titles list
- Active title selector
- Title preview

---

## Phase 6: Integration Points

### 6.1 Event Hooks (Where to Call Services)

| Event | Service Method | File |
|-------|----------------|------|
| Hero kills monster | `AchievementService.processKillEvent` | battleHandler.js |
| Hero gathers resource | `AchievementService.processGatherEvent` | gatheringHandler.js |
| Hero crafts item | `AchievementService.processCraftEvent` | craftingHandler.js |
| Hero levels up | `AchievementService.processLevelUp` | progressionService.js |
| Hero earns XP | `LifetimeStatsService.recordXpGain` | progressionService.js |
| Hero trades | `LifetimeStatsService.onTrade` | economyHandler.js |
| Hero travels | `LifetimeStatsService.onTravel` | travelHandler.js |

### 6.2 Daily Snapshot Job
**File**: `server/src/services/dailySnapshotJob.js`

```javascript
// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  // Record daily snapshot for all active heroes
  // Reset daily counters
});
```

---

## Socket Events Reference

### Client → Server (RPC)
| Event | Payload | Description |
|-------|---------|-------------|
| `progression:get_achievements` | `{}` | Get all achievements and progress |
| `progression:get_milestones` | `{}` | Get all milestones and progress |
| `progression:get_lifetime_stats` | `{}` | Get lifetime statistics |
| `progression:get_titles` | `{}` | Get earned titles |
| `progression:set_active_title` | `{titleId}` | Set active title |
| `progression:get_history` | `{days}` | Get history for charts |
| `progression:get_leaderboard` | `{statKey, limit}` | Get leaderboard |

### Server → Client (Events)
| Event | Payload | Description |
|-------|---------|-------------|
| `progression:achievements_list` | `[achievements]` | List of achievements |
| `progression:milestones_list` | `[milestones]` | List of milestones |
| `progression:stats_data` | `{stats}` | Lifetime stats |
| `progression:titles_list` | `[titles]` | Earned titles |
| `progression:title_earned` | `{id, name}` | Title earned notification |
| `progression:achievement_completed` | `{id, name}` | Achievement completed |
| `progression:milestone_completed` | `{id, name, tier}` | Milestone tier completed |
| `progression:history_data` | `{data}` | History for charts |
| `progression:leaderboard_data` | `{entries}` | Leaderboard data |

---

## Sample Achievement Templates

```javascript
// server/prisma/seed/achievements.js
const achievements = [
  {
    name: "First Blood",
    description: "Defeat your first monster",
    category: "COMBAT",
    tier: "BRONZE",
    requirementType: "KILL_COUNT",
    requirementValue: 1,
    rewardXp: 100
  },
  {
    name: "Monster Hunter",
    description: "Defeat 100 monsters",
    category: "COMBAT",
    tier: "SILVER",
    requirementType: "KILL_COUNT",
    requirementValue: 100,
    rewardXp: 1000,
    rewardTitle: "Monster Hunter"
  },
  {
    name: "Master Gatherer",
    description: "Gather 10,000 resources",
    category: "GATHERING",
    tier: "GOLD",
    requirementType: "GATHER_AMOUNT",
    requirementValue: 10000,
    rewardXp: 5000
  }
];
```

---

## Dependencies

```
Phase 1 (Database) → Phase 2 (Services) → Phase 3 (Repository)
        ↓                                           ↓
                                                Phase 4 (Client Network)
                                                        ↓
                                                Phase 5 (UI Components)
                                                        ↓
                                                Phase 6 (Integration)
```

---

## Migration Command

```bash
cd server && npx prisma migrate dev --name player_progression_stat_system
```

---

## Additional Features (Expanded Scope)

### A. Daily/Weekly Quest Tracker

**Database Models:**
```prisma
model DailyQuestTemplate {
  id              Int      @id @default(autoincrement())
  name            String
  description     String
  category        String   // COMBAT, GATHERING, CRAFTING, EXPLORATION
  requirementType String   // KILL_COUNT, GATHER_AMOUNT, CRAFT_COUNT, etc.
  requirementValue Int
  rewardSilver    Int
  rewardGold      Int
  rewardXp        Int
  
  expiresAt       DateTime // Reset time
  heroes          HeroDailyQuest[]
}

model HeroDailyQuest {
  id                    Int      @id @default(autoincrement())
  heroId                Int
  hero                  Hero     @relation(fields: [heroId], references: [id])
  questId               Int
  quest                 DailyQuestTemplate @relation(fields: [questId], references: [id])
  
  progress              Int      @default(0)
  isCompleted           Boolean  @default(false)
  completedAt           DateTime?
  date                  DateTime // Which day this quest is for
  
  @@unique([heroId, questId, date])
}

model WeeklyQuestTemplate {
  id              Int      @id @default(autoincrement())
  name            String
  description     String
  requirementType String
  requirementValue Int
  rewardSilver    Int
  rewardGold      Int
  rewardXp        Int
  
  expiresAt       DateTime // Weekly reset
  heroes          HeroWeeklyQuest[]
}

model HeroWeeklyQuest {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  questId         Int
  quest           WeeklyQuestTemplate @relation(fields: [questId], references: [id])
  
  progress        Int      @default(0)
  isCompleted     Boolean  @default(false)
  completedAt     DateTime?
  weekStart       DateTime // Which week this quest is for
  
  @@unique([heroId, questId, weekStart])
}

// Quest Streak Tracking
model QuestStreak {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  dailyStreak     Int      @default(0)
  weeklyStreak    Int      @default(0)
  maxDailyStreak  Int      @default(0)
  maxWeeklyStreak Int      @default(0)
  lastDailyQuestAt DateTime?
  lastWeeklyQuestAt DateTime?
  
  updatedAt       DateTime @updatedAt
}
```

**Service Methods:**
```javascript
class DailyQuestService {
  async generateDailyQuests(heroId);
  async getDailyQuests(heroId);
  async getWeeklyQuests(heroId);
  async updateQuestProgress(heroId, questType, amount);
  async completeQuest(heroId, questId);
  async getStreakInfo(heroId);
  async claimStreakReward(heroId, streakType);
}
```

---

### B. Skill Mastery Tracking

**Database Models:**
```prisma
model SkillTemplate {
  id              Int      @id
  name            String
  category        String   // COMBAT, GATHERING, CRAFTING, SUPPORT
  maxMasteryLevel Int      @default(100)
  
  skillInstances HeroSkill[]
}

model HeroSkill {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  skillId         Int
  skill           SkillTemplate @relation(fields: [skillId], references: [id])
  
  isActive        Boolean  @default(false)
  masteryLevel    Int      @default(1)
  masteryXp       Int      @default(0)
  totalUses       Int      @default(0)
  lastUsedAt      DateTime?
  
  @@unique([heroId, skillId])
}

model MasteryLevelReward {
  id              Int      @id @default(autoincrement())
  skillId         Int
  skill           SkillTemplate @relation(fields: [skillId], references: [id])
  
  masteryLevel    Int
  statBonus       String?  // JSON: { "attack_damage": 0.1 }
  effectBonus     String?  // JSON: { "cooldown_reduction": 0.05 }
}
```

**Service Methods:**
```javascript
class SkillMasteryService {
  async useSkill(heroId, skillId);
  async getMasteryInfo(heroId, skillId);
  async getAllMasteryInfo(heroId);
  async levelUpMastery(heroId, skillId);
  async getMasteryLeaderboard(skillId, limit = 10);
}
```

---

### C. Collection System (Compendium)

**Database Models:**
```prisma
// Monster Compendium
model MonsterCompendiumEntry {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  monsterId       Int
  
  firstSeenAt    DateTime @default(now())
  killCount       Int      @default(0)
  lastKillAt      DateTime?
  
  @@unique([heroId, monsterId])
}

// Item Collection (discovered/crafted/owned at least once)
model ItemCollectionEntry {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  itemId          Int
  
  firstDiscoveredAt DateTime @default(now())
  totalOwned      Int      @default(0)
  totalCrafted    Int      @default(0)
  currentOwned    Int      @default(0)
  
  @@unique([heroId, itemId])
}

// Recipe Discovery
model RecipeDiscovery {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  recipeId        Int
  
  discoveredAt    DateTime @default(now())
  craftCount      Int      @default(0)
  
  @@unique([heroId, recipeId])
}

// Region Discovery (exploration)
model RegionDiscovery {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  regionId        Int
  
  firstVisitedAt  DateTime @default(now())
  visitCount      Int      @default(0)
  lastVisitedAt   DateTime?
  
  @@unique([heroId, regionId])
}

// Discovery Statistics
model DiscoveryStats {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  monstersSeen    Int      @default(0)
  monstersKilled  Int      @default(0)
  itemsDiscovered Int      @default(0)
  recipesLearned  Int      @default(0)
  regionsExplored Int      @default(0)
  
  discoveryPercentage Float @default(0) // % of total game content discovered
  
  updatedAt       DateTime @updatedAt
}
```

**Service Methods:**
```javascript
class CollectionService {
  async onMonsterKill(heroId, monsterId);
  async onItemDiscovery(heroId, itemId);
  async onRecipeCraft(heroId, recipeId);
  async onRegionVisit(heroId, regionId);
  async getCompendium(heroId, category);
  async getCollectionProgress(heroId);
  async getDiscoveryPercentage(heroId);
}
```

---

### D. Social & Reputation Tracking

**Database Models:**
```prisma
// Friendship / Social Connections
model FriendRelation {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  friendHeroId    Int
  
  status          String   // PENDING, ACCEPTED, BLOCKED
  createdAt       DateTime @default(now())
  
  @@unique([heroId, friendHeroId])
}

// Party History
model PartyHistory {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  partyId         String
  joinedAt        DateTime
  leftAt          DateTime?
  isLeader        Boolean  @default(false)
  
  @@index([heroId, joinedAt])
}

// Reputation with Factions
model HeroReputation {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  factionId       Int
  faction         Faction  @relation(fields: [factionId], references: [id])
  
  reputation      Int      @default(0) // Can be negative
  reputationTier  Int      @default(0) // 0-10 tiers
  totalGained     Int      @default(0)
  totalLost       Int      @default(0)
  
  lastUpdatedAt   DateTime @default(now())
  
  @@unique([heroId, factionId])
}

// Reputation Milestones per Faction
model FactionReputationMilestone {
  id              Int      @id @default(autoincrement())
  factionId       Int
  faction         Faction  @relation(fields: [factionId], references: [id])
  
  tier            Int
  tierName        String   // e.g., "Stranger", "Ally", "Friend"
  requirement     Int      // reputation needed
  
  perkDescription String?
  perkBonus       String?  // JSON bonus
}

// Trading Partners
model TradePartner {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  partnerHeroId   Int
  
  tradesCount     Int      @default(0)
  totalValue      BigInt   @default(0)
  firstTradeAt    DateTime @default(now())
  lastTradeAt     DateTime?
  
  @@unique([heroId, partnerHeroId])
}

// Social Statistics
model SocialStats {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  friendsCount    Int      @default(0)
  partiesJoined   Int      @default(0)
  partiesLed      Int      @default(0)
  tradesMade      Int      @default(0)
  totalTradesValue BigInt  @default(0)
  
  updatedAt       DateTime @updatedAt
}
```

**Service Methods:**
```javascript
class SocialService {
  // Friends
  async sendFriendRequest(heroId, targetHeroId);
  async acceptFriendRequest(heroId, requestHeroId);
  async getFriends(heroId);
  async removeFriend(heroId, friendHeroId);
  
  // Party
  async joinParty(heroId, partyId);
  async leaveParty(heroId);
  async getPartyHistory(heroId);
  
  // Reputation
  async updateReputation(heroId, factionId, delta);
  async getReputation(heroId, factionId);
  async getAllReputation(heroId);
  async getReputationMilestone(heroId, factionId);
  
  // Trading
  async recordTrade(heroId, partnerHeroId, value);
  async getTradePartners(heroId);
  
  // Stats
  async getSocialStats(heroId);
}
```

---

## Socket Events - Extended

### Client → Server (Extended)
| Event | Payload | Description |
|-------|---------|-------------|
| `progression:get_daily_quests` | `{}` | Get daily quests |
| `progression:get_weekly_quests` | `{}` | Get weekly quests |
| `progression:claim_quest_reward` | `{questId}` | Claim quest reward |
| `progression:get_skill_mastery` | `{skillId?}` | Get mastery info |
| `progression:get_collection` | `{category}` | Get compendium |
| `progression:get_discovery_progress` | `{}` | Get discovery % |
| `progression:get_friends` | `{}` | Get friend list |
| `progression:get_reputation` | `{factionId?}` | Get reputation |
| `progression:get_social_stats` | `{}` | Get social statistics |
| `progression:add_friend` | `{heroId}` | Send friend request |
| `progression:accept_friend` | `{heroId}` | Accept friend request |

### Server → Client (Extended)
| Event | Payload | Description |
|-------|---------|-------------|
| `progression:daily_quests` | `[quests]` | Daily quest list |
| `progression:weekly_quests` | `[quests]` | Weekly quest list |
| `progression:quest_completed` | `{quest}` | Quest completed |
| `progression:skill_mastery` | `{skillId, level, xp}` | Mastery data |
| `progression:skill_level_up` | `{skillId, level}` | Mastery leveled |
| `progression:collection_data` | `{data}` | Compendium data |
| `progression:discovery_progress` | `{percentage}` | Discovery % |
| `progression:friends_list` | `[friends]` | Friend list |
| `progression:friend_request` | `{fromHero}` | Friend request received |
| `progression:reputation_data` | `{data}` | Reputation data |
| `progression:social_stats` | `{stats}` | Social statistics |

---

## Additional UI Components

### DailyQuestPanel.tscn
- Quest list with progress bars
- Claim reward buttons
- Streak counter display

### SkillMasteryPanel.tscn
- Skill grid with mastery levels
- XP progress bars
- Mastery rewards preview
- Leaderboard button

### CollectionPanel.tscn
- Tabs: Monsters, Items, Recipes, Regions
- Discovery progress indicators
- Locked/unlocked items

### SocialPanel.tscn
- Friends list with online status
- Reputation display per faction
- Social stats summary

---

## Summary of New Features

| Feature | Models | Services | UI Panels |
|---------|--------|----------|-----------|
| Daily/Weekly Quests | 4 | 1 | DailyQuestPanel |
| Skill Mastery | 3 | 1 | SkillMasteryPanel |
| Collection System | 5 | 1 | CollectionPanel |
| Social/Reputation | 6 | 1 | SocialPanel |

**Total New Models:** ~18
**Total New Services:** ~4
**Total New UI Panels:** ~4

---

## Additional Premium Features

### Season Pass / Event Pass System

**Apa itu?** Sistem season dengan tiered rewards. Pemain beli pass untuk unlock premium rewards seiring progression.

**Database Models:**
```prisma
model SeasonPassTemplate {
  id              Int      @id @default(autoincrement())
  name            String   // e.g., "Season 1: Rise of Heroes"
  description     String
  startDate       DateTime
  endDate         DateTime
  
  // Pricing
  basePriceGold   Int      @default(0)
  premiumPriceGold Int     @default(1000)
  
  // Season Stats
  totalXpRequired Int      @default(10000)
  tiersCount      Int      @default(50)
  
  tiers           SeasonPassTier[]
  purchases       HeroSeasonPass[]
}

model SeasonPassTier {
  id              Int      @id @default(autoincrement())
  seasonId        Int
  season          SeasonPassTemplate @relation(fields: [seasonId], references: [id])
  
  tierNumber      Int
  xpRequired      Int
  
  // Free Reward
  freeRewardType  String   // SILVER, GOLD, ITEM, TITLE
  freeRewardValue Int
  freeItemId      Int?
  
  // Premium Reward (jika premium pass)
  premiumRewardType String
  premiumRewardValue Int
  premiumItemId   Int?
  
  @@unique([seasonId, tierNumber])
}

model HeroSeasonPass {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  seasonId        Int
  season          SeasonPassTemplate @relation(fields: [seasonId], references: [id])
  
  isPremium       Boolean  @default(false)
  currentXp       Int      @default(0)
  currentTier     Int      @default(0)
  claimedTiers    String   // JSON array of claimed tier numbers
  
  purchasedAt     DateTime @default(now())
  
  @@unique([heroId, seasonId])
}

model SeasonPassXpGrant {
  id              Int      @id @default(autoincrement())
  seasonId        Int
  season          SeasonPassTemplate @relation(fields: [seasonId], references: [id])
  
  sourceType      String   // DAILY_QUEST, ACHIEVEMENT, BOSS_KILL, etc.
  sourceId        Int?
  xpAmount        Int
  
  @@unique([seasonId, sourceType, sourceId])
}
```

**Service Methods:**
```javascript
class SeasonPassService {
  async purchasePass(heroId, seasonId, isPremium);
  async grantXp(heroId, seasonId, xpAmount, sourceType);
  async claimTierReward(heroId, seasonId, tierNumber);
  async getSeasonProgress(heroId, seasonId);
  async getAvailableSeasons(heroId);
  async calculateXpToNextTier(heroId, seasonId);
}
```

---

### Badge System

**Apa itu?** Visual badges kecil yang ditempel di profile. Berbeda dari title - badges murni dekoratif.

**Database Models:**
```prisma
model BadgeTemplate {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  description     String
  icon            String   // icon resource path
  category        String   // COMBAT, SOCIAL, EVENT, SPECIAL, LEGENDARY
  
  // Requirements (sama seperti achievements)
  requirementType String
  requirementValue Int
  
  // Visual
  frameColor      String   // e.g., "#FFD700" for gold
  isAnimated      Boolean  @default(false)
  
  heroes          HeroBadge[]
}

model HeroBadge {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  badgeId         Int
  badge           BadgeTemplate @relation(fields: [badgeId], references: [id])
  
  earnedAt        DateTime @default(now())
  
  @@unique([heroId, badgeId])
}

// Badge loadout - badges yang ditampilkan
model HeroBadgeLoadout {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  // Slots untuk badge (max 6-8 badges ditampilkan)
  slot1BadgeId    Int?
  slot2BadgeId    Int?
  slot3BadgeId    Int?
  slot4BadgeId    Int?
  slot5BadgeId    Int?
  slot6BadgeId    Int?
}
```

**Service Methods:**
```javascript
class BadgeService {
  async checkAndAwardBadge(heroId, eventType, value);
  async getHeroBadges(heroId);
  async setBadgeLoadout(heroId, slotAssignments);
  async getAvailableBadges(heroId);
  async getBadgeLeaderboard(category, limit = 10);
}
```

---

### Challenge System

**Apa itu?** Challenge time-limited dengan high scores dan leaderboards.

**Database Models:**
```prisma
model ChallengeTemplate {
  id              Int      @id @default(autoincrement())
  name            String
  description     String
  category        String   // COMBAT, GATHERING, CRAFTING, SURVIVAL
  
  // Challenge Config
  durationSeconds Int      // 3600 for 1 hour, 86400 for 1 day
  isRecurring     Boolean  @default(true)
  recurrenceType  String?  // DAILY, WEEKLY
  
  // Scoring
  scoringType     String   // HIGHER_BEST, LOWER_BEST, TARGET_VALUE
  targetValue     Int?
  
  // Rewards
  rewardSilver    Int
  rewardGold      Int
  rewardXp        Int
  rewardBadgeId   Int?
  
  // Leaderboard
  topRewardSilver Int      @default(0)
  topRewardGold   Int      @default(0)
  
  instances       ChallengeInstance[]
}

model ChallengeInstance {
  id              Int      @id @default(autoincrement())
  templateId      Int
  template        ChallengeTemplate @relation(fields: [templateId], references: [id])
  
  startTime       DateTime
  endTime         DateTime
  
  isActive        Boolean  @default(true)
  
  participants   HeroChallengeParticipant[]
}

model HeroChallengeParticipant {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  instanceId      Int
  instance        ChallengeInstance @relation(fields: [instanceId], references: [id])
  
  score           Int      @default(0)
  progress        Int      @default(0)
  isCompleted     Boolean  @default(false)
  completedAt     DateTime?
  
  // Leaderboard tracking
  currentRank     Int?
  
  @@unique([heroId, instanceId])
}

model ChallengeLeaderboard {
  id              Int      @id @default(autoincrement())
  instanceId      Int      @unique
  instance        ChallengeInstance @relation(fields: [instanceId], references: [id])
  
  // Top 10 stored directly
  rank1HeroId     Int?
  rank1Score      Int?
  rank2HeroId     Int?
  rank2Score      Int?
  rank3HeroId     Int?
  rank3Score      Int?
  
  updatedAt       DateTime @updatedAt
}
```

**Service Methods:**
```javascript
class ChallengeService {
  async getActiveChallenges(heroId);
  async joinChallenge(heroId, challengeInstanceId);
  async updateProgress(heroId, instanceId, score, progress);
  async completeChallenge(heroId, instanceId);
  async getLeaderboard(instanceId, limit = 10);
  async claimTopReward(heroId, instanceId);
  async getMyRank(heroId, instanceId);
}
```

---

### PvP Season Tracker

**Apa itu?** Tracking ranking dan statistics untuk PvP seasons.

**Database Models:**
```prisma
model PvPSeason {
  id              Int      @id @default(autoincrement())
  seasonNumber    Int
  name            String   // e.g., "Season 1: Arena Wars"
  startDate       DateTime
  endDate         DateTime
  
  isActive        Boolean  @default(false)
  isCompleted     Boolean  @default(false)
  
  participants    PvPSeasonParticipant[]
  rewards         PvPSeasonReward[]
}

model PvPSeasonReward {
  id              Int      @id @default(autoincrement())
  seasonId        Int
  season          PvPSeason @relation(fields: [seasonId], references: [id])
  
  minRank         Int
  maxRank         Int
  
  rewardSilver    Int
  rewardGold      Int
  rewardBadgeId   Int?
  rewardTitleId   Int?
  
  @@unique([seasonId, minRank, maxRank])
}

model PvPSeasonParticipant {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  seasonId        Int
  season          PvPSeason @relation(fields: [seasonId], references: [id])
  
  // Ranking
  currentRank     Int      @default(0)
  peakRank        Int      @default(0)
  
  // Stats
  matchesPlayed   Int      @default(0)
  matchesWon      Int      @default(0)
  matchesLost     Int      @default(0)
  
  winStreak       Int      @default(0)
  maxWinStreak    Int      @default(0)
  
  totalKills      Int      @default(0)
  totalDeaths     Int      @default(0)
  
  // Rating
  rating          Int      @default(1000)
  
  // Rewards
  claimedRewards  String   // JSON array of claimed reward IDs
  
  @@unique([heroId, seasonId])
}

model PvPMatchHistory {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  seasonId        Int
  
  matchId         String
  opponentHeroId  Int?
  
  result          String   // WIN, LOSS, DRAW
  
  ratingChange    Int      @default(0)
  ratingAfter     Int
  
  kills           Int      @default(0)
  deaths          Int      @default(0)
  assists         Int      @default(0)
  
  matchDuration   Int      // seconds
  
  playedAt        DateTime @default(now())
  
  @@index([heroId, seasonId])
}
```

**Service Methods:**
```javascript
class PvPSeasonService {
  async getCurrentSeason();
  async getSeasonStats(heroId, seasonId);
  async getLeaderboard(seasonId, limit = 100);
  async recordMatch(heroId, matchData);
  async claimSeasonReward(heroId, seasonId);
  async getMatchHistory(heroId, seasonId, limit = 20);
  async calculateNewRating(winnerRating, loserRating, isWinner);
}
```

---

### World Boss Participation

**Apa itu?** Tracking partisipasi dan kills di event world boss.

**Database Models:**
```prisma
model WorldBossTemplate {
  id              Int      @id
  name            String
  description     String
  
  // Stats
  maxHp           BigInt
  damagePerHit    Int
  
  // Respawn
  spawnInterval   Int      // hours
  nextSpawnAt     DateTime?
  
  // Rewards
  participationRewardXp Int @default(100)
  killRewardXp    Int      @default(1000)
  killRewardGold  Int      @default(100)
  
  bossKills       WorldBossKill[]
  participations  WorldBossParticipation[]
}

model WorldBossKill {
  id              Int      @id @default(autoincrement())
  bossId          Int
  boss            WorldBossTemplate @relation(fields: [bossId], references: [id])
  
  killedAt        DateTime @default(now())
  damageDealt     BigInt
  
  killerHeroId    Int
  killerHero      Hero     @relation(fields: [killerHeroId], references: [id])
  
  participants    WorldBossParticipation[]
}

model WorldBossParticipation {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  killId          Int
  kill            WorldBossKill @relation(fields: [killId], references: [id])
  
  damageDealt     BigInt   @default(0)
  damagePercent   Float    @default(0)
  isKiller        Boolean  @default(false)
  
  rewardXp        Int      @default(0)
  rewardGold      Int      @default(0)
  isClaimed       Boolean  @default(false)
  
  @@unique([heroId, killId])
}

model HeroWorldBossStats {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  bossesKilled    Int      @default(0)
  totalDamage     BigInt   @default(0)
  totalKills      Int      @default(0)
  
  // Per boss stats (JSON for flexibility)
  perBossStats    String   // JSON: { "boss_1": { "kills": 5, "damage": 10000 } }
  
  lastParticipation DateTime?
  
  updatedAt       DateTime @updatedAt
}
```

**Service Methods:**
```javascript
class WorldBossService {
  async recordParticipation(heroId, bossId, damage);
  async recordKill(killData);
  async claimReward(heroId, killId);
  async getHeroWorldBossStats(heroId);
  async getWorldBossLeaderboard(bossId, limit = 10);
  async getUpcomingBosses();
}
```

---

### Equipment Set Collection

**Apa itu?** Track complete equipment sets yang pemain miliki.

**Database Models:**
```prisma
model EquipmentSetTemplate {
  id              Int      @id @default(autoincrement())
  name            String
  description     String
  
  setBonus        String   // JSON: { "2": "+5% ATK", "4": "+10% ATK" }
  
  requiredPieces  Int      // Total pieces in set
  
  pieces          EquipmentSetPiece[]
  heroSets        HeroEquipmentSet[]
}

model EquipmentSetPiece {
  id              Int      @id @default(autoincrement())
  setId           Int
  set             EquipmentSetTemplate @relation(fields: [setId], references: [id])
  
  pieceNumber     Int      // 1, 2, 3...
  itemId          Int
  item            ItemTemplate @relation(fields: [itemId], references: [id])
  
  @@unique([setId, pieceNumber])
}

model HeroEquipmentSet {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  setId           Int
  set             EquipmentSetTemplate @relation(fields: [setId], references: [id])
  
  piecesOwned     Int      @default(0)
  pieces          String   // JSON array of piece numbers owned
  
  setBonusActive  Int      @default(0) // How many pieces needed for active bonus
  
  firstCompletedAt DateTime?
  
  @@unique([heroId, setId])
}

model HeroEquipmentCollection {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  totalSetsOwned  Int      @default(0)
  totalPiecesOwned Int     @default(0)
  
  completedSets   Int      @default(0)
  maxBonusSets    Int      @default(0) // Sets with full bonus activated
  
  updatedAt       DateTime @updatedAt
}
```

**Service Methods:**
```javascript
class EquipmentCollectionService {
  async onItemObtained(heroId, itemId);
  async checkSetCompletion(heroId, setId);
  async getHeroCollection(heroId);
  async getCollectionProgress(heroId);
  async getSetBonusInfo(heroId, setId);
  async getCollectionLeaderboard(limit = 10);
}
```

---

### Server-First Achievements

**Apa itu?** Achievement khusus untuk pemain pertama yang mencapai sesuatu.

**Database Models:**
```prisma
model ServerFirstAchievement {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  description     String
  icon            String
  
  // Target yang harus dicapai
  targetType      String   // LEVEL_REACH, FIRST_KILL, FIRST_CRAFT, FIRST_SELL
  targetValue     Int
  
  // Status
  isClaimed       Boolean  @default(false)
  claimedByHeroId Int?
  claimedByHero   Hero?    @relation(fields: [claimedByHeroId], references: [id])
  claimedAt       DateTime?
  
  // Rewards (special)
  rewardSilver    Int      @default(0)
  rewardGold      Int      @default(0)
  rewardBadgeId   Int?
  exclusiveTitle  String?  // Only for first achiever
}

// Tracking untuk server-first candidates
model ServerFirstCandidate {
  id              Int      @id @default(autoincrement())
  achievementId   Int
  achievement     ServerFirstAchievement @relation(fields: [achievementId], references: [id])
  
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  currentValue    Int      @default(0)
  targetValue     Int
  
  isEligible      Boolean  @default(true) // If false, someone else already claimed
  
  updatedAt       DateTime @updatedAt
  
  @@unique([achievementId, heroId])
}
```

**Service Methods:**
```javascript
class ServerFirstService {
  async checkProgress(heroId, targetType, currentValue);
  async claimServerFirst(heroId, achievementId);
  async getAvailableServerFirsts(heroId);
  async getServerFirstHistory();
  async isEligible(heroId, achievementId);
}
```

---

### Combo System

**Apa itu?** Track consecutive actions untuk achievement dan rewards.

**Database Models:**
```prisma
model ComboTemplate {
  id              Int      @id @default(autoincrement())
  name            String
  description     String
  category        String   // COMBAT, GATHERING, CRAFTING
  
  // Combo Config
  actionType      String   // KILL_MONSTER, GATHER_RESOURCE, CRAFT_ITEM
  targetValue     Int      // Consecutive count needed
  
  // Timeout (reset jika tidak ada aksi dalam X waktu)
  timeoutSeconds  Int      @default(300) // 5 minutes
  
  // Rewards per tier
  rewardXp        Int      // XP per combo completion
  rewardSilver    Int
  rewardBadgeId   Int?
  
  heroes          HeroComboProgress[]
}

model HeroComboProgress {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  comboId         Int
  combo           ComboTemplate @relation(fields: [comboId], references: [id])
  
  currentStreak   Int      @default(0)
  maxStreak       Int      @default(0)
  totalCompletions Int     @default(0)
  
  lastActionAt    DateTime?
  isActive        Boolean  @default(true)
  
  @@unique([heroId, comboId])
}

model ComboHistory {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  comboId         Int
  combo           ComboTemplate @relation(fields: [comboId], references: [id])
  
  streakReached   Int
  completedAt     DateTime @default(now())
  
  @@index([heroId, completedAt])
}
```

**Service Methods:**
```javascript
class ComboService {
  async recordAction(heroId, actionType, value);
  async getComboProgress(heroId, comboId);
  async getAllComboProgress(heroId);
  async resetCombo(heroId, comboId);
  async claimComboReward(heroId, comboId);
  async getComboLeaderboard(comboId, limit = 10);
}
```

---

### Easter Egg Discovery

Apa itu? Hidden achievements untuk secrets dan easter eggs di game.

**Database Models:**
```prisma
model EasterEggTemplate {
  id              Int      @id @default(autoincrement())
  name            String
  description     String   // Vague hint, tidak jelaskan achievement
  icon            String
  
  // Trigger conditions (complex, bisa multiple conditions)
  triggerType     String   // LOCATION_VISIT, ITEM_COMBINATION, TIME_BASED, etc.
  triggerData     String   // JSON: { "regionId": 5, "time": "23:00-04:00" }
  
  // Hints
  hint1           String?
  hint2           String?
  hint3           String?
  
  // Rewards
  rewardSilver    Int
  rewardGold      Int
  rewardBadgeId   Int?
  rewardTitleId   Int?
  
  discoveredBy    HeroEasterEgg[]
}

model HeroEasterEgg {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  eggId           Int
  egg             EasterEggTemplate @relation(fields: [eggId], references: [id])
  
  discoveredAt    DateTime @default(now())
  
  // Hints used (for statistics)
  hintsUsed       Int      @default(0)
  
  @@unique([heroId, eggId])
}

model EasterEggHintProgress {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  eggId           Int
  egg             EasterEggTemplate @relation(fields: [eggId], references: [id])
  
  hintsRevealed   Int      @default(0)
  lastHintRevealAt DateTime?
  
  @@unique([heroId, eggId])
}
```

**Service Methods:**
```javascript
class EasterEggService {
  async checkTrigger(heroId, triggerType, triggerData);
  async discoverEgg(heroId, eggId);
  async requestHint(heroId, eggId);
  async getUndiscoveredEggs(heroId);
  async getHintProgress(heroId, eggId);
  async getAllEggStats(); // Admin only
}
```

---

### Global Leaderboard System

**Apa itu?** Centralized leaderboard system yang mengagregasi semua jenis rankings.

**Database Models:**
```prisma
model LeaderboardConfig {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  displayName     String   // e.g., "Combat Power", "Level", "Kills"
  category        String   // COMBAT, PROGRESSION, ECONOMY, SOCIAL, GATHERING
  
  // Configuration
  statKey         String?  // Which stat to track (e.g., "unitLevel", "kills")
  aggregation     String   // SUM, MAX, AVG
  timeFilter      String?  // ALL_TIME, SEASON, WEEKLY, DAILY
  
  // Display
  icon            String?
  description     String?
  isActive        Boolean  @default(true)
  
  entries         LeaderboardEntry[]
  lastUpdated     DateTime @default(now())
}

model LeaderboardEntry {
  id              Int      @id @default(autoincrement())
  configId        Int
  config          LeaderboardConfig @relation(fields: [configId], references: [id])
  
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  heroName        String   // Cached for performance
  
  rank            Int
  value           BigInt
  previousRank    Int?
  rankChange      Int      @default(0)
  
  updatedAt       DateTime @default(now())
  
  @@unique([configId, heroId])
  @@index([configId, value DESC])
}

// Weekly/Daily snapshots untuk historical data
model LeaderboardSnapshot {
  id              Int      @id @default(autoincrement())
  configId        Int
  config          LeaderboardConfig @relation(fields: [configId], references: [id])
  
  snapshotDate    DateTime @default(now()) // Date only
  
  // Top 100 snapshot
  top100Data      String   // JSON array of top 100 entries
  
  @@unique([configId, snapshotDate])
}

// Hero's personal ranking history
model HeroRankingHistory {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  
  configId        Int
  config          LeaderboardConfig @relation(fields: [configId], references: [id])
  
  rank            Int
  value           BigInt
  
  recordedAt      DateTime @default(now())
  
  @@index([heroId, configId, recordedAt])
}
```

**Leaderboard Categories:**
```javascript
const LEADERBOARD_CATEGORIES = {
  PROGRESSION: [
    { name: "level", displayName: "Level", statKey: "unitLevel" },
    { name: "xp", displayName: "Total XP", statKey: "unitXp" },
    { name: "class_level", displayName: "Class Level", statKey: "classLevel" },
  ],
  COMBAT: [
    { name: "kills", displayName: "Total Kills", statKey: "kills" },
    { name: "boss_kills", displayName: "Boss Kills", statKey: "bossKills" },
    { name: "pvp_kills", displayName: "PvP Kills", statKey: "pvPkills" },
    { name: "kdr", displayName: "K/D Ratio", statKey: null, custom: true },
  ],
  ECONOMY: [
    { name: "gold_earned", displayName: "Gold Earned", statKey: "goldEarned" },
    { name: "gold_spent", displayName: "Gold Spent", statKey: "goldSpent" },
    { name: "items_sold", displayName: "Items Sold", statKey: "itemsSold" },
  ],
  GATHERING: [
    { name: "total_gathered", displayName: "Resources Gathered", statKey: "totalGathered" },
    { name: "mining", displayName: "Mining", statKey: "miningYield" },
    { name: "lumbering", displayName: "Lumbering", statKey: "lumberingYield" },
  ],
  SOCIAL: [
    { name: "friends", displayName: "Friends", statKey: "friendsCount" },
    { name: "guild_contributions", displayName: "Guild Contributions", statKey: "guildContributions" },
  ],
  ACHIEVEMENTS: [
    { name: "achievements", displayName: "Achievements Completed", statKey: "achievementsCompleted" },
    { name: "badges", displayName: "Badges Earned", statKey: "badgesEarned" },
  ],
  TIME: [
    { name: "playtime", displayName: "Total Play Time", statKey: "totalPlayTimeSeconds" },
  ]
};
```

**Service Methods:**
```javascript
class LeaderboardService {
  // Core Methods
  async getLeaderboard(configName, page = 1, limit = 50);
  async getHeroRank(heroId, configName);
  async getHeroNearby(heroId, configName, range = 5);
  async getTopPlayers(configName, limit = 10);
  
  // Admin Methods
  async updateLeaderboard(configName); // Recalculate entire leaderboard
  async updateAllLeaderboards(); // Update all
  async takeSnapshot(configName); // Save historical snapshot
  
  // History
  async getHeroHistory(heroId, configName, days = 30);
  async getHistoricalSnapshot(configName, date);
  
  // Utils
  async calculateKDRatio(heroId); // For custom leaderboards
  async getLeaderboardSummary(); // Get all leaderboard counts
}
```

**Leaderboard UI Data Structure:**
```javascript
// Response untuk client
{
  config: {
    name: "kills",
    displayName: "Total Kills",
    category: "COMBAT"
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 12500,
    totalPages: 250
  },
  entries: [
    {
      rank: 1,
      heroId: 123,
      heroName: "PlayerOne",
      value: 15420,
      previousRank: 2,
      rankChange: 1, // +1 means improved
      isCurrentPlayer: false
    },
    // ... more entries
  ],
  currentPlayer: {
    rank: 1250,
    value: 520,
    previousRank: 1280,
    rankChange: 30
  }
}
```

---

## Socket Events - Premium Features

### Client → Server (Premium)
| Event | Payload | Description |
|-------|---------|-------------|
| `progression:buy_season_pass` | `{seasonId, isPremium}` | Beli season pass |
| `progression:claim_season_tier` | `{seasonId, tier}` | Claim tier reward |
| `progression:set_badge_loadout` | `{slots}` | Set badge display |
| `progression:get_challenges` | `{}` | Get active challenges |
| `progression:join_challenge` | `{instanceId}` | Join challenge |
| `progression:update_challenge` | `{instanceId, score}` | Update challenge progress |
| `progression:get_pvp_season` | `{}` | Get current PvP season |
| `progression:get_pvp_leaderboard` | `{seasonId, limit}` | Get PvP leaderboard |
| `progression:get_world_boss_status` | `{}` | Get boss spawn status |
| `progression:claim_world_boss` | `{killId}` | Claim boss reward |
| `progression:get_equipment_collection` | `{}` | Get equipment sets |
| `progression:get_server_firsts` | `{}` | Get available server-firsts |
| `progression:claim_server_first` | `{achievementId}` | Claim server-first |
| `progression:get_combos` | `{}` | Get combo progress |
| `progression:request_easter_egg_hint` | `{eggId}` | Request hint |
| `progression:get_leaderboard` | `{category, page, limit}` | Get global leaderboard |
| `progression:get_my_rank` | `{category}` | Get player's rank |
| `progression:get_rank_history` | `{category, days}` | Get rank history |
| `progression:get_leaderboard_nearby` | `{category, range}` | Get nearby players |

### Server → Client (Premium)
| Event | Payload | Description |
|-------|---------|-------------|
| `progression:season_pass_data` | `{season, progress}` | Season pass info |
| `progression:tier_claimed` | `{tier, rewards}` | Tier reward claimed |
| `progression:badge_awarded` | `{badge}` | New badge earned |
| `progression:challenge_list` | `[challenges]` | Active challenges |
| `progression:challenge_joined` | `{instanceId}` | Joined challenge |
| `progression:challenge_completed` | `{instanceId, score, rank}` | Challenge done |
| `progression:pvp_season_data` | `{season, stats}` | PvP season info |
| `progression:pvp_match_result` | `{match}` | Match result |
| `progression:pvp_rank_changed` | `{oldRank, newRank}` | Rank updated |
| `progression:world_boss_spawned` | `{boss}` | Boss spawned |
| `progression:world_boss_killed` | `{killData}` | Boss killed |
| `progression:equipment_set_complete` | `{set}` | Set completed |
| `progression:server_first_claimed` | `{achievement, reward}` | Server-first claimed |
| `progression:combo_streak` | `{combo, streak, reward}` | Combo streak |
| `progression:easter_egg_discovered` | `{egg}` | Easter egg found |
| `progression:easter_egg_hint` | `{hint}` | Hint revealed |
| `progression:leaderboard_data` | `{config, entries, pagination, currentPlayer}` | Leaderboard data |
| `progression:my_rank_data` | `{config, rank, value, history}` | Player's rank info |
| `progression:rank_history_data` | `{config, history}` | Rank history |
| `progression:nearby_players` | `{config, players}` | Nearby players |

---

## Summary - All Features

| Feature | Models | Services | UI Panels |
|---------|--------|----------|-----------|
| Core Progression | ~18 | 4 | 4 |
| Daily/Weekly Quests | 4 | 1 | 1 |
| Skill Mastery | 3 | 1 | 1 |
| Collection System | 5 | 1 | 1 |
| Social/Reputation | 6 | 1 | 1 |
| Season Pass | 4 | 1 | 1 |
| Badge System | 3 | 1 | 1 |
| Challenge System | 4 | 1 | 1 |
| PvP Season Tracker | 4 | 1 | 1 |
| World Boss | 4 | 1 | 1 |
| Equipment Set | 4 | 1 | 1 |
| Server-First | 2 | 1 | 0 |
| Combo System | 3 | 1 | 0 |
| Easter Egg | 3 | 1 | 0 |
| Global Leaderboard | 4 | 1 | 1 |

**TOTAL:** ~69 Models, ~16 Services, ~11 UI Panels

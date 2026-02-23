# 🏆 Achievement System - Game Design Document

## 1. Overview

**Feature Name:** Achievement System  
**Type:** Progression & Motivation System  
**Core Functionality:** Players unlock achievements by completing specific milestones, earning titles, rewards, and tracking their progress across all gameplay aspects.

---

## 2. Achievement Categories

### 2.1 Category Types

| Category | Icon | Description | Example |
|----------|------|-------------|---------|
| **Combat** | ⚔️ | Battle-related accomplishments | Kill 1000 monsters |
| **Collection** | 📦 | Item and resource gathering | Collect 100 rare items |
| **Economy** | 💰 | Gold and trading milestones | Earn 1 million gold |
| **Social** | 👥 | Guild and friend activities | Join a guild |
| **Crafting** | 🔨 | Crafting and production | Craft 100 weapons |
| **Exploration** | 🗺️ | World discovery | Visit all regions |
| **PvP** | ⚡ | Arena and combat rankings | Win 100 arena matches |
| **Special** | ⭐ | Unique/secret achievements | First to reach max level |

---

## 3. Achievement Structure

### 3.1 Achievement Data Model

```prisma
model Achievement {
    id              String   @id @default(uuid())
    code            String   @unique // Unique identifier
    
    // Basic Info
    name            String
    description     String
    category        AchievementCategory
    icon            String
    
    // Requirements
    requirementType String   // counter, milestone, event, hidden
    targetValue     Int      // Target number to achieve
    counterName     String   // Internal counter name
    
    // Progression
    isProgressive   Boolean  @default(false) // Multiple tiers?
    tiers           Json?    // [{tier: 1, value: 100}, {tier: 2, value: 1000}]
    
    // Rewards
    rewardGold      Int      @default(0)
    rewardGems      Int      @default(0)
    rewardItems     Json?    // [{itemId: 1, quantity: 1}]
    rewardTitle     String?  // Title to unlock
    
    // Visibility
    isHidden        Boolean  @default(false) // Secret achievement
    hiddenCondition String?  // When to reveal
    
    // Requirements
    prereqCode      String?  // Required achievement code
    minLevel        Int      @default(1)
    
    isActive        Boolean  @default(true)
    sortOrder       Int      @default(0)
    
    @@index([category, isActive])
}
```

### 3.2 Player Achievement Progress

```prisma
model PlayerAchievement {
    id              String   @id @default(uuid())
    userId          String
    achievementCode String
    
    // Progress
    currentValue    Int      @default(0)
    isCompleted     Boolean  @default(false)
    completedAt     DateTime?
    
    // Tiers (if progressive)
    currentTier     Int      @default(0)
    unlockedTiers   Int[]    @default([])
    
    // Rewards Claimed
    rewardsClaimed  Boolean  @default(false)
    
    // Discovery (for hidden achievements)
    isDiscovered    Boolean  @default(false)
    discoveredAt    DateTime?
    
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    
    @@unique([userId, achievementCode])
}
```

---

## 4. Achievement List

### 4.1 Combat Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| COMBAT_001 | First Blood | Win your first battle | 1 | 50 Gold, Title: "Brawler" |
| COMBAT_002 | Monster Slayer | Defeat monsters | 100 | 100 Gold |
| COMBAT_003 | Monster Hunter | Defeat monsters | 1,000 | 500 Gold, "Hunter" |
| COMBAT_004 | Monster Champion | Defeat monsters | 10,000 | 2,000 Gold, 50 Gems, "Champion" |
| COMBAT_005 | Boss Killer | Defeat boss monsters | 10 | 500 Gold |
| COMBAT_006 | Boss Nemesis | Defeat boss monsters | 100 | 2,500 Gold, 100 Gems |
| COMBAT_007 | Undefeated | Win battles consecutively | 10 | 300 Gold |
| COMBAT_008 | War Machine | Win battles consecutively | 50 | 1,500 Gold, "Warrior" |
| COMBAT_009 | Legendary Hero | Win battles consecutively | 100 | 5,000 Gold, 200 Gems, "Legend" |
| COMBAT_010 | Critical Master | Land critical hits | 100 | 200 Gold |
| COMBAT_011 | Elemental Master | Use elemental skills | 500 | 500 Gold |
| COMBAT_012 | Tank | Receive damage | 10,000 | 800 Gold |

### 4.2 Collection Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| COLLECT_001 | Pack Rat | Collect items | 100 | 50 Gold |
| COLLECT_002 | Hoarder | Collect items | 1,000 | 500 Gold |
| COLLECT_003 | Treasure Collector | Collect rare items | 10 | 200 Gold |
| COLLECT_004 | Rare Collector | Collect rare items | 50 | 1,000 Gold, 25 Gems |
| COLLECT_005 | Epic Collector | Collect epic items | 10 | 500 Gold, 50 Gems |
| COLLECT_006 | Legendary Collector | Collect legendary items | 5 | 2,000 Gold, 100 Gems |
| COLLECT_007 | Equipment Complete | Complete equipment sets | 1 | 1,000 Gold |

### 4.3 Economy Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| ECON_001 | Small Fortune | Earn gold | 10,000 | 100 Gold |
| ECON_002 | Wealthy | Earn gold | 100,000 | 500 Gold |
| ECON_003 | Millionaire | Earn gold | 1,000,000 | 2,500 Gold, 50 Gems |
| ECON_004 | Tycoon | Earn gold | 10,000,000 | 10,000 Gold, 200 Gems |
| ECON_005 | First Sale | Sell items on market | 1 | 25 Gold |
| ECON_006 | Merchant | Sell items on market | 100 | 300 Gold |
| ECON_007 | Master Merchant | Sell items on market | 1,000 | 1,500 Gold, "Merchant" |
| ECON_008 | Big Spender | Spend gold | 10,000 | 100 Gold |
| ECON_009 | Gambler | Use gacha/lottery | 10 | 50 Gems |

### 4.4 Crafting Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| CRAFT_001 | Apprentice Crafter | Craft items | 10 | 50 Gold |
| CRAFT_002 | Journeyman Crafter | Craft items | 100 | 300 Gold |
| CRAFT_003 | Expert Crafter | Craft items | 500 | 1,000 Gold, "Crafter" |
| CRAFT_004 | Master Crafter | Craft items | 1,000 | 3,000 Gold, 100 Gems, "Master Smith" |
| CRAFT_005 | Legendary Crafter | Craft legendary items | 1 | 5,000 Gold, 200 Gems |
| CRAFT_006 | First Enhancement | Enhance equipment | 1 | 100 Gold |
| CRAFT_007 | Enhancement Master | Enhance equipment | 50 | 800 Gold |

### 4.5 PvP Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| PVP_001 | First Duel | Win arena match | 1 | 100 Gold |
| PVP_002 | Arena Fighter | Win arena matches | 10 | 300 Gold |
| PVP_003 | Arena Veteran | Win arena matches | 100 | 1,500 Gold, "Duelist" |
| PVP_004 | Arena Champion | Win arena matches | 500 | 5,000 Gold, 100 Gems, "Champion" |
| PVP_005 | Undefeated | Win without losing | 10 | 500 Gold |
| PVP_006 | Perfect Record | Win without losing | 50 | 2,000 Gold, "Undefeated" |
| PVP_007 | Rank Pioneer | Reach Silver rank | 1 | 500 Gold |
| PVP_008 | Rank Elite | Reach Gold rank | 1 | 2,000 Gold, 50 Gems |
| PVP_009 | Rank Mythic | Reach Mythic rank | 1 | 5,000 Gold, 100 Gems, "Mythic" |

### 4.6 Exploration Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| EXPLORE_001 | Traveler | Visit regions | 3 | 50 Gold |
| EXPLORE_002 | Explorer | Visit regions | 10 | 200 Gold |
| EXPLORE_003 | Adventurer | Visit regions | 20 | 800 Gold, "Adventurer" |
| EXPLORE_004 | World Traveler | Visit all regions | 1 | 2,000 Gold, 50 Gems |
| EXPLORE_005 | Dungeon Delver | Complete dungeons | 10 | 300 Gold |
| EXPLORE_006 | Dungeon Master | Complete dungeons | 100 | 2,000 Gold, "Dungeon Master" |

### 4.7 Social Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| SOCIAL_001 | Social Butterfly | Make friends | 1 | 25 Gold |
| SOCIAL_002 | Popular | Have friends | 10 | 200 Gold |
| SOCIAL_003 | Guild Member | Join guild | 1 | 50 Gold |
| SOCIAL_004 | Guild Leader | Create guild | 1 | 500 Gold, "Leader" |
| SOCIAL_005 | Guild Contributor | Contribute to guild | 100 | 300 Gold |
| SOCIAL_006 | Guild Master | Reach guild master | 1 | 2,000 Gold |

### 4.8 Special Achievements

| Code | Name | Description | Target | Rewards |
|------|------|-------------|--------|---------|
| SPECIAL_001 | Early Bird | First to login on launch day | 1 | 1,000 Gems, "Pioneer" |
| SPECIAL_002 | Whale | Spend money | $100 | 1,000 Gems, "Whale" |
| SPECIAL_003 | Lucky | Get lucky drop | 1 | 500 Gems |
| SPECIAL_004 | First Legacy | First hero reaches max level | 1 | 10,000 Gold, "Legacy" |

---

## 5. Title System

### 5.1 Combat Titles

| Title | Requirement | Badge Color |
|-------|-------------|-------------|
| Brawler | COMBAT_001 | Bronze |
| Hunter | COMBAT_003 | Bronze |
| Champion | COMBAT_004 | Silver |
| Warrior | COMBAT_008 | Silver |
| Legend | COMBAT_009 | Gold |
| God of War | COMBAT_009 (Tier 3) | Diamond |

### 5.2 Economy Titles

| Title | Requirement | Badge Color |
|-------|-------------|-------------|
| Merchant | ECON_006 | Bronze |
| Tycoon | ECON_004 | Gold |
| Billionaire | ECON_004 (Tier 3) | Diamond |

### 5.3 Crafting Titles

| Title | Requirement | Badge Color |
|-------|-------------|-------------|
| Crafter | CRAFT_003 | Bronze |
| Master Smith | CRAFT_004 | Gold |
| Artisan of Legends | CRAFT_005 | Diamond |

---

## 6. API Endpoints

### 6.1 Achievement Endpoints

```
GET    /api/achievements              - Get all achievements
GET    /api/achievements/categories  - Get achievements by category
GET    /api/achievements/:code       - Get specific achievement
GET    /api/achievements/progress    - Get player's progress
POST   /api/achievements/:code/claim - Claim reward for completed achievement
GET    /api/achievements/titles       - Get player's unlocked titles
```

### 6.2 Response Formats

**GET /api/achievements/progress**
```json
{
    "completed": [
        {
            "code": "COMBAT_001",
            "name": "First Blood",
            "currentValue": 1,
            "completedAt": "2024-01-15T10:00:00Z",
            "rewardsClaimed": true,
            "title": "Brawler"
        }
    ],
    "inProgress": [
        {
            "code": "COMBAT_002",
            "name": "Monster Slayer",
            "currentValue": 45,
            "targetValue": 100,
            "progressPercent": 45
        }
    ],
    "locked": [
        {
            "code": "COMBAT_003",
            "name": "Monster Hunter",
            "requirement": "Complete COMBAT_002",
            "minLevel": 10
        }
    ],
    "titles": ["Brawler"],
    "totalProgress": 15
}
```

---

## 7. Service Implementation

### 7.1 AchievementService

```javascript
class AchievementService {
    
    // Initialize achievements in database
    async seedAchievements() {
        const achievements = [
            // Combat
            { code: 'COMBAT_001', name: 'First Blood', category: 'COMBAT', ... },
            { code: 'COMBAT_002', name: 'Monster Slayer', category: 'COMBAT', ... },
            // ... more achievements
        ];
        
        for (const achievement of achievements) {
            await prisma.achievement.upsert({
                where: { code: achievement.code },
                update: achievement,
                create: achievement
            });
        }
    }
    
    // Update achievement progress
    async updateProgress(userId, counterName, amount) {
        const achievements = await prisma.achievement.findMany({
            where: {
                counterName,
                isActive: true
            }
        });
        
        for (const achievement of achievements) {
            const playerAchievement = await this.getOrCreateProgress(userId, achievement.code);
            
            if (playerAchievement.isCompleted) continue;
            
            // Update progress
            playerAchievement.currentValue += amount;
            
            // Check completion
            const targetValue = achievement.targetValue;
            if (playerAchievement.currentValue >= targetValue) {
                await this.completeAchievement(userId, achievement.code);
            }
            
            await playerAchievement.save();
        }
        
        // Notify player of progress
        await this.notifyProgress(userId);
    }
    
    // Complete achievement
    async completeAchievement(userId, achievementCode) {
        const playerAchievement = await prisma.playerAchievement.findUnique({
            where: {
                userId_achievementCode: { userId, achievementCode }
            }
        });
        
        playerAchievement.isCompleted = true;
        playerAchievement.completedAt = new Date();
        
        await playerAchievement.save();
        
        // Notify player
        await this.notificationService.notify(userId, {
            type: 'ACHIEVEMENT_UNLOCKED',
            achievementCode,
            canClaim: true
        });
    }
    
    // Claim rewards
    async claimReward(userId, achievementCode) {
        const achievement = await prisma.achievement.findUnique({
            where: { code: achievementCode }
        });
        
        const playerAchievement = await prisma.playerAchievement.findUnique({
            where: {
                userId_achievementCode: { userId, achievementCode }
            }
        });
        
        if (!playerAchievement.isCompleted) {
            throw new Error('Achievement not completed');
        }
        
        if (playerAchievement.rewardsClaimed) {
            throw new Error('Rewards already claimed');
        }
        
        // Grant rewards
        await this.grantRewards(userId, achievement);
        
        // Grant title if exists
        if (achievement.rewardTitle) {
            await this.titleService.grantTitle(userId, achievement.rewardTitle);
        }
        
        playerAchievement.rewardsClaimed = true;
        await playerAchievement.save();
        
        return {
            success: true,
            rewards: achievement,
            title: achievement.rewardTitle
        };
    }
    
    // Get all progress
    async getProgress(userId) {
        const playerAchievements = await prisma.playerAchievement.findMany({
            where: { userId }
        });
        
        const achievements = await prisma.achievement.findMany({
            where: { isActive: true }
        });
        
        const completed = [];
        const inProgress = [];
        const locked = [];
        
        for (const achievement of achievements) {
            const playerProgress = playerAchievements.find(
                p => p.achievementCode === achievement.code
            );
            
            if (!playerProgress) {
                // Check if locked
                if (this.isLocked(achievement, playerAchievements)) {
                    locked.push(this.formatLocked(achievement, playerAchievements));
                } else {
                    inProgress.push({
                        code: achievement.code,
                        name: achievement.name,
                        currentValue: 0,
                        targetValue: achievement.targetValue,
                        progressPercent: 0
                    });
                }
            } else if (playerProgress.isCompleted) {
                completed.push(this.formatCompleted(playerProgress, achievement));
            } else {
                inProgress.push(this.formatInProgress(playerProgress, achievement));
            }
        }
        
        return { completed, inProgress, locked };
    }
    
    isLocked(achievement, playerAchievements) {
        if (achievement.prereqCode) {
            const prereq = playerAchievements.find(
                p => p.achievementCode === achievement.prereqCode
            );
            return !prereq?.isCompleted;
        }
        
        const user = playerAchievements[0]?.user; // Get user for level check
        return user?.level < achievement.minLevel;
    }
}
```

### 7.2 Counter System

```javascript
// Track various counters that trigger achievements
const COUNTER_TRIGGERS = {
    // Combat
    'monster_kill': async (userId, data) => {
        await achievementService.updateProgress(userId, 'monster_kill', 1);
        if (data.isBoss) {
            await achievementService.updateProgress(userId, 'boss_kill', 1);
        }
    },
    
    'battle_win': async (userId, data) => {
        await achievementService.updateProgress(userId, 'battle_win', 1);
    },
    
    'critical_hit': async (userId, data) => {
        await achievementService.updateProgress(userId, 'critical_hit', 1);
    },
    
    // Economy
    'gold_earned': async (userId, amount) => {
        await achievementService.updateProgress(userId, 'gold_earned', amount);
    },
    
    'item_sold': async (userId, data) => {
        await achievementService.updateProgress(userId, 'item_sold', 1);
    },
    
    // Crafting
    'item_crafted': async (userId, data) => {
        await achievementService.updateProgress(userId, 'item_crafted', 1);
        if (data.rarity === 'legendary') {
            await achievementService.updateProgress(userId, 'legendary_crafted', 1);
        }
    },
    
    // Exploration
    'region_visited': async (userId, regionId) => {
        await achievementService.updateProgress(userId, 'region_visited', 1);
    }
};
```

---

## 8. Client Integration

### 8.1 Achievement UI Screens

```
Main Achievement Screen:
├── Category Tabs (Combat, Collection, Economy, etc.)
├── Progress Overview (X/Y completed)
├── Achievement List
│   ├── Icon + Name + Description
│   ├── Progress Bar (if in progress)
│   ├── Completion Badge (if done)
│   ├── Claim Button (if ready)
│   └── Lock Icon (if locked)
├── Filter: All / Completed / In Progress
└── Sort: Category / Progress / Recently Updated
```

### 8.2 Client Handler

```javascript
// client/src/network/AchievementHandler.gd
extends BaseNetworkHandler

signal achievement_unlocked(data)
signal progress_updated(data)
signal reward_claimed(data)

func get_achievements():
    request_get("/api/achievements")

func get_progress():
    request_get("/api/achievements/progress")

func claim_reward(code):
    request_post("/api/achievements/" + code + "/claim")

func _handle_response(response):
    match response.action:
        "progress":
            _update_achievement_list(response.data)
        "unlocked":
            _show_unlock_celebration(response.data)
        "reward_claimed":
            _show_reward_received(response.data)

func _show_unlock_celebration(data):
    var popup = preload("res://ui/AchievementPopup.tscn").instantiate()
    get_tree().current_scene.add_child(popup)
    popup.setup(data.name, data.description, data.icon)
    popup.play_animation()
```

---

## 9. Notification System

### 9.1 Achievement Notifications

```javascript
// When achievement is unlocked
{
    type: 'ACHIEVEMENT_UNLOCKED',
    title: 'Achievement Unlocked!',
    body: 'First Blood - Win your first battle',
    icon: 'achievement_combat_001',
    action: 'VIEW_ACHIEVEMENT',
    rewards: {
        gold: 50,
        title: 'Brawler'
    }
}
```

### 9.2 In-Game Popup

```
┌─────────────────────────────────────┐
│  🏆 ACHIEVEMENT UNLOCKED!           │
│                                     │
│  First Blood                        │
│  Win your first battle              │
│                                     │
│  ┌─────────┐  Rewards:             │
│  │  ⚔️    │  +50 Gold              │
│  └─────────┘  Title: Brawler       │
│                                     │
│  [Claim Rewards]                    │
└─────────────────────────────────────┘
```

---

## 10. Analytics

### 10.1 Metrics

| Metric | Description |
|--------|-------------|
| Completion Rate | % players completing each achievement |
| Average Progress | Average progress per achievement |
| Popular Categories | Most completed categories |
| Time to Complete | Average time to complete |
| Reward Claim Rate | % claiming rewards |
| Title Usage | Most equipped titles |

### 10.2 Dashboard

```json
{
    "total_achievements": 50,
    "completed_total": 125040,
    "completion_rate": 68.5,
    "by_category": {
        "COMBAT": { "completed": 45000, "rate": 72 },
        "ECONOMY": { "completed": 38000, "rate": 61 },
        "CRAFTING": { "completed": 28000, "rate": 45 }
    },
    "most_completed": [
        { "code": "COMBAT_001", "name": "First Blood", "count": 52000 },
        { "code": "SOCIAL_003", "name": "Guild Member", "count": 48000 }
    ],
    "titles_equipped": {
        "Brawler": 15000,
        "Hunter": 8000,
        "Champion": 3000
    }
}
```

---

## 11. Implementation Checklist

### Phase 1: Core System
- [ ] Add Achievement and PlayerAchievement models
- [ ] Create migration
- [ ] Implement AchievementService
- [ ] Seed achievement data

### Phase 2: Progress Tracking
- [ ] Add counter triggers throughout game
- [ ] Implement progress update logic
- [ ] Add completion detection
- [ ] Add notification system

### Phase 3: Rewards
- [ ] Implement reward claiming
- [ ] Add title system
- [ ] Integrate with economy

### Phase 4: Client
- [ ] Create AchievementHandler
- [ ] Build Achievement UI
- [ ] Add celebration animations
- [ ] Add to Codex screen

---

## 12. Lore Integration

> *"The Hall of Legends stands as a testament to the greatest heroes of the realm. Every achievement recorded here echoes through eternity, inspiring generations of adventurers to follow in the footsteps of greatness."*
> 
> — Inscription on the Hall of Legends

---

## 13. Future Extensions

| Feature | Description |
|---------|-------------|
| **Seasonal Achievements** | Time-limited achievements with exclusive rewards |
| **Hidden Achievements** | Secret achievements revealed through gameplay |
| **Achievement Sets** | Complete sets for bonus rewards |
| **Social Sharing** | Share achievements to chat/social |
| **Leaderboards** | Compare achievement progress |

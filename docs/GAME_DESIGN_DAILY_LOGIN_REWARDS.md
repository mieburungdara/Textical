# 📅 Daily Login Rewards System - Game Design Document

## 1. Overview

**Feature Name:** Daily Login Rewards  
**Type:** Progression & Retention System  
**Core Functionality:** Players receive increasingly valuable rewards for consecutive daily logins, with a 7-day cycle that resets if they miss a day.

---

## 2. Core Mechanics

### 2.1 Streak System

| Day | Reward Tier | Gold | Gems | Items | Streak Bonus |
|-----|-------------|------|------|-------|--------------|
| 1 | Common | 100 | 5 | - | - |
| 2 | Uncommon | 200 | 10 | - | - |
| 3 | Rare | 300 | 15 | Common Chest | - |
| 4 | Epic | 500 | 25 | Uncommon Chest | - |
| 5 | Legendary | 800 | 50 | Rare Chest | +50% Gold |
| 6 | Mythic | 1200 | 75 | Epic Chest | +100% Gold |
| 7 | Divine | 2000 | 100 | Legendary Chest | +200% Gold |

### 2.2 Reset Logic

```
IF (lastLoginDate < yesterday):
    streak = 0
    
IF (lastLoginDate == today):
    // Already claimed, no action
    
IF (lastLoginDate == yesterday):
    streak += 1
```

### 2.3 Missed Day Handling

- **Grace Period:** None (strict daily reset)
- **Streak Recovery:** Not available (prevents exploit)
- **Weekend Bonus:** +10% all rewards on weekends (Saturday/Sunday)

---

## 3. Database Schema

```prisma
model DailyLoginReward {
    id              String   @id @default(uuid())
    userId          String
    
    // Streak Tracking
    currentStreak   Int      @default(0)
    longestStreak   Int      @default(0)
    totalDays       Int      @default(0)
    
    // Last Claim
    lastClaimDate   DateTime?
    lastClaimDay    Int?     // Day 1-7 of cycle
    
    // Weekly Reset
    currentWeek     Int      @default(1) // Week 1-52
    weekClaimed     Boolean  @default(false)
    
    // Lifetime Stats
    totalGold       Int      @default(0)
    totalGems       Int      @default(0)
    totalChests     Int      @default(0)
    
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    
    @@unique([userId])
}

model DailyRewardTier {
    id              Int      @id @default(autoincrement())
    day             Int      // 1-7
    tier            String   // Common/Uncommon/Rare/Epic/Legendary/Mythic/Divine
    
    // Base Rewards
    goldMin         Int
    goldMax         Int
    gemsMin         Int
    gemsMax         Int
    chestType       String?  // Common/Uncommon/Rare/Epic/Legendary
    
    // Bonuses
    streakMultiplier Float  @default(1.0) // 1.0 = 100%
    weekendBonus    Float   @default(1.1) // 1.1 = +10%
    
    isActive        Boolean  @default(true)
}
```

---

## 4. Reward Tables

### 4.1 Gold & Gems (Random Range)

```javascript
const REWARD_TIERS = {
    1: { gold: [100, 100], gems: [5, 5], chest: null },
    2: { gold: [200, 200], gems: [10, 10], chest: null },
    3: { gold: [300, 300], gems: [15, 15], chest: 'common' },
    4: { gold: [500, 500], gems: [25, 25], chest: 'uncommon' },
    5: { gold: [800, 800], gems: [50, 50], chest: 'rare', streakBonus: 1.5 },
    6: { gold: [1200, 1200], gems: [75, 75], chest: 'epic', streakBonus: 2.0 },
    7: { gold: [2000, 2000], gems: [100, 100], chest: 'legendary', streakBonus: 3.0 }
};
```

### 4.2 Chest Contents

| Chest Type | Item Count | Rarity Distribution |
|------------|------------|-------------------|
| Common | 1-2 | 100% Common |
| Uncommon | 2-3 | 70% Common, 30% Uncommon |
| Rare | 2-4 | 50% Common, 40% Uncommon, 10% Rare |
| Epic | 3-5 | 30% Uncommon, 50% Rare, 20% Epic |
| Legendary | 4-6 | 20% Rare, 50% Epic, 30% Legendary |

---

## 5. API Endpoints

### 5.1 Reward Management

```
GET    /api/daily/status          - Get current streak & claim status
POST   /api/daily/claim           - Claim today's reward
GET    /api/daily/history         - Get claim history
GET    /api/daily/stats           - Get lifetime stats
```

### 5.2 Response Formats

**GET /api/daily/status**
```json
{
    "canClaim": true,
    "currentStreak": 3,
    "nextReward": {
        "day": 4,
        "tier": "Epic",
        "gold": 500,
        "gems": 25,
        "chest": "uncommon"
    },
    "lastClaimDate": "2024-01-15T00:00:00Z",
    "nextClaimAt": "2024-01-16T00:00:00Z",
    "isWeekend": false
}
```

**POST /api/daily/claim**
```json
{
    "success": true,
    "reward": {
        "gold": 300,
        "gems": 15,
        "chest": {
            "type": "common",
            "items": [
                { "id": 1001, "name": "Iron Sword", "rarity": "common" }
            ]
        }
    },
    "newStreak": 4,
    "message": "Day 4 Reward Claimed!"
}
```

---

## 6. Service Implementation

### 6.1 DailyRewardService

```javascript
class DailyRewardService {
    
    // Core Methods
    async getRewardStatus(userId) {
        const reward = await this.getOrCreateReward(userId);
        const lastClaim = reward.lastClaimDate;
        const now = new Date();
        
        // Check if streak should reset
        if (this.shouldResetStreak(lastClaim, now)) {
            reward.currentStreak = 0;
            reward.weekClaimed = false;
        }
        
        // Check if can claim
        const canClaim = !this.hasClaimedToday(lastClaim, now);
        
        return {
            canClaim,
            currentStreak: reward.currentStreak,
            nextReward: this.getRewardForDay(reward.currentStreak + 1),
            lastClaimDate: reward.lastClaimDate,
            isWeekend: this.isWeekend(now)
        };
    }
    
    async claimReward(userId) {
        const status = await this.getRewardStatus(userId);
        
        if (!status.canClaim) {
            throw new Error('Cannot claim reward yet');
        }
        
        const reward = await this.getOrCreateReward(userId);
        const day = reward.currentStreak + 1;
        const rewardData = this.calculateReward(day, status.isWeekend);
        
        // Apply streak bonus for days 5-7
        if (day >= 5) {
            rewardData.gold = Math.floor(rewardData.gold * rewardData.streakBonus);
        }
        
        // Grant rewards
        await this.grantRewards(userId, rewardData);
        
        // Update streak
        reward.currentStreak = day;
        reward.longestStreak = Math.max(reward.longestStreak, day);
        reward.totalDays += 1;
        reward.lastClaimDate = new Date();
        reward.lastClaimDay = day;
        reward.totalGold += rewardData.gold;
        reward.totalGems += rewardData.gems;
        
        // Check for week completion
        if (day === 7) {
            reward.currentStreak = 0; // Reset for new week
            reward.currentWeek += 1;
        }
        
        await reward.save();
        
        return {
            success: true,
            reward: rewardData,
            newStreak: reward.currentStreak
        };
    }
    
    // Helper Methods
    shouldResetStreak(lastClaim, now) {
        if (!lastClaim) return false;
        
        const lastClaimDay = new Date(lastClaim).setHours(0,0,0,0);
        const today = new Date(now).setHours(0,0,0,0);
        const yesterday = today - 86400000; // 24 hours
        
        return lastClaimDay < yesterday;
    }
    
    hasClaimedToday(lastClaim, now) {
        if (!lastClaim) return false;
        
        const lastClaimDay = new Date(lastClaim).setHours(0,0,0,0);
        const today = new Date(now).setHours(0,0,0,0);
        
        return lastClaimDay >= today;
    }
    
    calculateReward(day, isWeekend) {
        const base = REWARD_TIERS[day];
        const gold = this.randomInt(base.goldMin, base.goldMax);
        const gems = this.randomInt(base.gemsMin, base.gemsMax);
        
        let reward = {
            gold,
            gems,
            chest: base.chestType ? this.generateChest(base.chestType) : null,
            streakBonus: base.streakMultiplier
        };
        
        // Apply weekend bonus
        if (isWeekend) {
            reward.gold = Math.floor(reward.gold * 1.1);
            reward.gems = Math.floor(reward.gems * 1.1);
            reward.weekendBonus = true;
        }
        
        return reward;
    }
    
    async grantRewards(userId, rewardData) {
        const user = await this.userService.findById(userId);
        
        // Add Gold
        await this.economyService.addGold(userId, rewardData.gold);
        
        // Add Gems
        await this.economyService.addGems(userId, rewardData.gems);
        
        // Add Chest (as item)
        if (rewardData.chest) {
            await this.inventoryService.addItem(userId, {
                type: 'chest',
                subType: rewardData.chest.type,
                items: rewardData.chest.items
            });
        }
    }
}
```

---

## 7. Client Integration

### 7.1 Client Handler

```javascript
// client/src/network/DailyRewardHandler.gd
extends BaseNetworkHandler

signal reward_claimed(reward_data)
signal streak_updated(new_streak)

func get_status():
    request_get("/api/daily/status")

func claim_reward():
    request_post("/api/daily/claim")

func _handle_response(response):
    match response.action:
        "status":
            _update_ui(response.data)
        "claim":
            _process_claim(response.data)

func _update_ui(data):
    var hud = get_tree().get_first_node_in_group("daily_hud")
    if hud:
        hud.update_streak(data.currentStreak)
        hud.show_claim_button(data.canClaim)
        hud.preview_reward(data.nextReward)

func _process_claim(data):
    emit_signal("reward_claimed", data.reward)
    emit_signal("streak_updated", data.newStreak)
    
    // Show celebration animation
    _show_celebration(data.reward)
```

### 7.2 UI Components

**Daily Reward Popup:**
- Streak counter with fire animation
- Reward preview (gold, gems, chest)
- "Claim" button with cooldown indicator
- "Tomorrow's Reward" preview

**Side HUD Integration:**
- Small streak badge next to resources
- Glowing indicator when reward available

---

## 8. Anti-Exploit Measures

### 8.1 Security Rules

| Measure | Implementation |
|---------|---------------|
| **Server-Side Only** | All reward calculations done on server |
| **Time Validation** | Server clock check, reject suspicious requests |
| **Rate Limiting** | Max 1 claim per 20 seconds |
| **IP Tracking** | Flag suspicious multiple accounts |
| **No Client Trust** | Validate streak from database, not client state |
| **Audit Log** | Log all claims with timestamp, IP, user agent |

### 8.2 Fraud Detection

```javascript
async detectSuspiciousActivity(userId, ip) {
    const recentClaims = await this.getRecentClaims(userId, '1 hour');
    
    // Flag if too many claims
    if (recentClaims.length > 1) {
        await this.flagUser(userId, 'excessive_claims');
    }
    
    // Flag if different IPs in short time
    const recentIPs = await this.getRecentIPs(userId, '1 hour');
    if (new Set(recentIPs).size > 2) {
        await this.flagUser(userId, 'ip_fluctuation');
    }
}
```

---

## 9. Analytics & Metrics

### 9.1 KPIs to Track

| Metric | Description |
|--------|-------------|
| **Daily Claim Rate** | % of active users who claim daily reward |
| **Avg Streak Length** | Average consecutive days |
| **Week 7 Completion** | % users reaching day 7 |
| **Retention Impact** | Correlation between claiming and retention |
| **Weekend Bonus Usage** | % claiming on weekends |

### 9.2 Dashboard Data

```json
{
    "daily_claims": 15420,
    "unique_claimers": 12305,
    "avg_streak": 3.2,
    "week7_completions": 2840,
    "total_gold_distributed": 15420000,
    "total_gems_distributed": 771000
}
```

---

## 10. Implementation Checklist

### Phase 1: Core System
- [ ] Add DailyLoginReward model to schema
- [ ] Create migration
- [ ] Implement DailyRewardService
- [ ] Add API routes

### Phase 2: Rewards
- [ ] Create reward calculation logic
- [ ] Implement chest generation
- [ ] Add economy integration (gold/gems)

### Phase 3: Client
- [ ] Create DailyRewardHandler
- [ ] Add reward popup UI
- [ ] Integrate with SideHUD

### Phase 4: Polish
- [ ] Add celebration animations
- [ ] Add sound effects
- [ ] Implement analytics tracking
- [ ] Add anti-exploit measures

---

## 11. Lore Integration

> *"The Ancient Calendar of the Realm grants blessings to those who visit daily. Each seventh day marks a sacred moment when the divine chest appears, containing treasures fit for heroes who have proven their dedication."*
> 
> — Archmage Voltran, Keeper of the Daily Archives

---

## 12. Future Extensions

| Feature | Description |
|---------|-------------|
| **Monthly Bonus** | Extra reward at month end for perfect month |
| **Special Events** | Double rewards during holidays |
| **Referral Bonus** | Extra streak days for referred players |
| **VIP Multiplier** | Premium users get 2x rewards |

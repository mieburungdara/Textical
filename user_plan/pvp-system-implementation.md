# PvP System Implementation Plan

## Overview
The PvP system will allow players to battle against each other in tactical 1v1 matches. It will feature:
- Matchmaking system to find opponents of similar skill level
- Arena battle interface
- Ranking system with tiers and rewards
- Spectator mode
- Seasonal PvP events

## Implementation Steps

### Step 1: Create PvP Models
Add PvP-related models to Prisma schema:

```prisma
// server/prisma/schema.prisma
model PvPSeason {
  id          Int      @id @default(autoincrement())
  seasonNumber Int     @unique
  startDate   DateTime
  endDate     DateTime
  status      String   @default("ACTIVE") // ACTIVE, ENDED
  rewards     Json     @default("{}")
}

model PvPProfile {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  user        User     @relation(fields: [userId], references: [id])
  currentSeasonId Int
  currentSeason   PvPSeason @relation(fields: [currentSeasonId], references: [id])
  rank        Int      @default(1000) // ELO rank
  tier        String   @default("BRONZE") // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
  wins        Int      @default(0)
  losses      Int      @default(0)
  draws       Int      @default(0)
  seasonPoints Int     @default(0)
  lastMatchAt DateTime?
}

model PvPMatch {
  id          Int      @id @default(autoincrement())
  player1Id   Int
  player1     User     @relation("Player1Relation", fields: [player1Id], references: [id])
  player2Id   Int
  player2     User     @relation("Player2Relation", fields: [player2Id], references: [id])
  winnerId    Int?
  winner      User?    @relation("WinnerRelation", fields: [winnerId], references: [id])
  seasonId    Int
  season      PvPSeason @relation(fields: [seasonId], references: [id])
  startTime   DateTime @default(now())
  endTime     DateTime?
  duration    Int?
  rankChange1 Int      @default(0)
  rankChange2 Int      @default(0)
  rewards1    Json     @default("{}")
  rewards2    Json     @default("{}")
  status      String   @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}

model PvPMatchAction {
  id          Int      @id @default(autoincrement())
  matchId     Int
  match       PvPMatch @relation(fields: [matchId], references: [id])
  playerId    Int
  player      User     @relation(fields: [playerId], references: [id])
  heroId      Int
  actionType  String
  targetId    Int?
  positionX   Int?
  positionY   Int?
  timestamp   DateTime @default(now())
}
```

### Step 2: Create PvP Service
```javascript
// server/src/services/pvpService.js
class PvPService {
    async findMatch(userId) {
        // Find suitable opponent using matchmaking algorithm
    }
    
    async startMatch(matchId) {
        // Initialize match
        // Load player formations
        // Set match status to IN_PROGRESS
    }
    
    async performAction(matchId, playerId, action) {
        // Validate action
        // Execute action
        // Calculate damage/healing
        // Check for match end
    }
    
    async endMatch(matchId, winnerId) {
        // Determine winner
        // Calculate rank changes
        // Distribute rewards
        // Update player stats
    }
    
    async getMatchHistory(userId) {
        // Get recent matches for a player
    }
    
    async getSeasonLeaderboard(seasonId, limit = 100) {
        // Get top players for the season
    }
    
    async claimSeasonRewards(userId, seasonId) {
        // Check eligibility
        // Distribute rewards
    }
}

module.exports = new PvPService();
```

### Step 3: Create PvP Controller
```javascript
// server/src/controllers/PvPController.js
class PvPController extends BaseController {
    async findMatch(req, res) {
        // Handle finding a match
    }
    
    async startMatch(req, res) {
        // Handle starting a match
    }
    
    async performAction(req, res) {
        // Handle performing an action in a match
    }
    
    async endMatch(req, res) {
        // Handle ending a match
    }
    
    async getMatchHistory(req, res) {
        // Handle getting match history
    }
    
    async getSeasonLeaderboard(req, res) {
        // Handle getting season leaderboard
    }
    
    async claimSeasonRewards(req, res) {
        // Handle claiming season rewards
    }
}
```

### Step 4: Create PvP Handler (Client)
```gdscript
# client/src/network/PvPHandler.gd
extends BaseNetworkHandler
class_name PvPHandler

func find_match(user_id: int):
	_request("/pvp/find-match", HTTPClient.METHOD_POST, {"userId": user_id})

func start_match(user_id: int, match_id: int):
	_request("/pvp/start-match", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"matchId": match_id
	})

func perform_action(user_id: int, match_id: int, action: Dictionary):
	_request("/pvp/perform-action", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"matchId": match_id,
		"action": action
	})

func end_match(user_id: int, match_id: int, winner_id: int):
	_request("/pvp/end-match", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"matchId": match_id,
		"winnerId": winner_id
	})

func get_match_history(user_id: int, limit: int = 10):
	_request("/pvp/match-history?userId=" + str(user_id) + "&limit=" + str(limit), HTTPClient.METHOD_GET)

func get_season_leaderboard(season_id: int, limit: int = 100):
	_request("/pvp/season-leaderboard?seasonId=" + str(season_id) + "&limit=" + str(limit), HTTPClient.METHOD_GET)

func claim_season_rewards(user_id: int, season_id: int):
	_request("/pvp/claim-rewards", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"seasonId": season_id
	})
```

### Step 5: Implement Matchmaking Algorithm
```javascript
// server/src/services/pvpService.js
async findMatch(userId) {
    const playerProfile = await pvpRepository.getProfileByUserId(userId);
    
    // Find players within 50 rank points
    const potentialOpponents = await pvpRepository.getProfilesByRankRange(
        playerProfile.rank - 50,
        playerProfile.rank + 50,
        userId
    );
    
    // Sort by online status and proximity to rank
    potentialOpponents.sort((a, b) => {
        const rankDiffA = Math.abs(a.rank - playerProfile.rank);
        const rankDiffB = Math.abs(b.rank - playerProfile.rank);
        return rankDiffA - rankDiffB;
    });
    
    // Find first available opponent
    const opponent = potentialOpponents.find(async (opp) => {
        const oppStatus = await userRepository.getStatus(opp.userId);
        return oppStatus.isOnline && !oppStatus.isInMatch;
    });
    
    if (opponent) {
        // Create match
        const match = await pvpRepository.createMatch({
            player1Id: userId,
            player2Id: opponent.userId,
            seasonId: playerProfile.currentSeasonId
        });
        
        return match;
    } else {
        // Wait for opponent or expand rank range
        return null;
    }
}
```

### Step 6: Implement ELO Rank Calculation
```javascript
// server/src/services/pvpService.js
calculateRankChange(player1Rank, player2Rank, player1Won) {
    const expected1 = 1 / (1 + Math.pow(10, (player2Rank - player1Rank) / 400));
    const expected2 = 1 / (1 + Math.pow(10, (player1Rank - player2Rank) / 400));
    
    const actual1 = player1Won ? 1 : 0;
    const actual2 = player1Won ? 0 : 1;
    
    const kFactor = 32; // K-factor for rank changes
    
    const rankChange1 = Math.round(kFactor * (actual1 - expected1));
    const rankChange2 = Math.round(kFactor * (actual2 - expected2));
    
    return { rankChange1, rankChange2 };
}
```

### Step 7: Create PvP UI Screens
1. **Arena Queue Screen**: Show queue status and match information
2. **PvP Match Screen**: Tactical battle interface for 1v1 matches
3. **Match History Screen**: Display recent matches and results
4. **Leaderboard Screen**: Show top players for current season
5. **Season Rewards Screen**: Display available rewards and claim functionality

### Step 8: Implement Real-Time Communication
```javascript
// server/src/services/socketService.js
io.on('connection', (socket) => {
    // Existing socket handlers...
    
    socket.on('pvp:join-queue', (userId) => {
        socket.join(`pvp:queue:${userId}`);
    });
    
    socket.on('pvp:leave-queue', (userId) => {
        socket.leave(`pvp:queue:${userId}`);
    });
    
    socket.on('pvp:match-found', (matchData) => {
        const { player1Id, player2Id, matchId } = matchData;
        io.to(`pvp:queue:${player1Id}`).emit('pvp:match-found', matchData);
        io.to(`pvp:queue:${player2Id}`).emit('pvp:match-found', matchData);
    });
    
    socket.on('pvp:action', (data) => {
        const { matchId, userId, action } = data;
        io.to(`pvp:match:${matchId}`).emit('pvp:action', data);
    });
});
```

### Step 9: Balance and Test
1. Test matchmaking algorithm
2. Balance ELO rank system
3. Test PvP battle mechanics
4. Balance season rewards
5. Test spectator mode
6. Performance testing for multiple simultaneous matches

---

The PvP system will provide a competitive environment for players to test their tactical skills against each other, with seasonal rewards and rankings to keep players engaged. The implementation plan focuses on creating a fair and engaging experience for all skill levels.

## Overview
The PvP system will allow players to battle against each other in tactical 1v1 matches. It will feature:
- Matchmaking system to find opponents of similar skill level
- Arena battle interface
- Ranking system with tiers and rewards
- Spectator mode
- Seasonal PvP events

## Implementation Steps

### Step 1: Create PvP Models
Add PvP-related models to Prisma schema:

```prisma
// server/prisma/schema.prisma
model PvPSeason {
  id          Int      @id @default(autoincrement())
  seasonNumber Int     @unique
  startDate   DateTime
  endDate     DateTime
  status      String   @default("ACTIVE") // ACTIVE, ENDED
  rewards     Json     @default("{}")
}

model PvPProfile {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  user        User     @relation(fields: [userId], references: [id])
  currentSeasonId Int
  currentSeason   PvPSeason @relation(fields: [currentSeasonId], references: [id])
  rank        Int      @default(1000) // ELO rank
  tier        String   @default("BRONZE") // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
  wins        Int      @default(0)
  losses      Int      @default(0)
  draws       Int      @default(0)
  seasonPoints Int     @default(0)
  lastMatchAt DateTime?
}

model PvPMatch {
  id          Int      @id @default(autoincrement())
  player1Id   Int
  player1     User     @relation("Player1Relation", fields: [player1Id], references: [id])
  player2Id   Int
  player2     User     @relation("Player2Relation", fields: [player2Id], references: [id])
  winnerId    Int?
  winner      User?    @relation("WinnerRelation", fields: [winnerId], references: [id])
  seasonId    Int
  season      PvPSeason @relation(fields: [seasonId], references: [id])
  startTime   DateTime @default(now())
  endTime     DateTime?
  duration    Int?
  rankChange1 Int      @default(0)
  rankChange2 Int      @default(0)
  rewards1    Json     @default("{}")
  rewards2    Json     @default("{}")
  status      String   @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}

model PvPMatchAction {
  id          Int      @id @default(autoincrement())
  matchId     Int
  match       PvPMatch @relation(fields: [matchId], references: [id])
  playerId    Int
  player      User     @relation(fields: [playerId], references: [id])
  heroId      Int
  actionType  String
  targetId    Int?
  positionX   Int?
  positionY   Int?
  timestamp   DateTime @default(now())
}
```

### Step 2: Create PvP Service
```javascript
// server/src/services/pvpService.js
class PvPService {
    async findMatch(userId) {
        // Find suitable opponent using matchmaking algorithm
    }
    
    async startMatch(matchId) {
        // Initialize match
        // Load player formations
        // Set match status to IN_PROGRESS
    }
    
    async performAction(matchId, playerId, action) {
        // Validate action
        // Execute action
        // Calculate damage/healing
        // Check for match end
    }
    
    async endMatch(matchId, winnerId) {
        // Determine winner
        // Calculate rank changes
        // Distribute rewards
        // Update player stats
    }
    
    async getMatchHistory(userId) {
        // Get recent matches for a player
    }
    
    async getSeasonLeaderboard(seasonId, limit = 100) {
        // Get top players for the season
    }
    
    async claimSeasonRewards(userId, seasonId) {
        // Check eligibility
        // Distribute rewards
    }
}

module.exports = new PvPService();
```

### Step 3: Create PvP Controller
```javascript
// server/src/controllers/PvPController.js
class PvPController extends BaseController {
    async findMatch(req, res) {
        // Handle finding a match
    }
    
    async startMatch(req, res) {
        // Handle starting a match
    }
    
    async performAction(req, res) {
        // Handle performing an action in a match
    }
    
    async endMatch(req, res) {
        // Handle ending a match
    }
    
    async getMatchHistory(req, res) {
        // Handle getting match history
    }
    
    async getSeasonLeaderboard(req, res) {
        // Handle getting season leaderboard
    }
    
    async claimSeasonRewards(req, res) {
        // Handle claiming season rewards
    }
}
```

### Step 4: Create PvP Handler (Client)
```gdscript
# client/src/network/PvPHandler.gd
extends BaseNetworkHandler
class_name PvPHandler

func find_match(user_id: int):
	_request("/pvp/find-match", HTTPClient.METHOD_POST, {"userId": user_id})

func start_match(user_id: int, match_id: int):
	_request("/pvp/start-match", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"matchId": match_id
	})

func perform_action(user_id: int, match_id: int, action: Dictionary):
	_request("/pvp/perform-action", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"matchId": match_id,
		"action": action
	})

func end_match(user_id: int, match_id: int, winner_id: int):
	_request("/pvp/end-match", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"matchId": match_id,
		"winnerId": winner_id
	})

func get_match_history(user_id: int, limit: int = 10):
	_request("/pvp/match-history?userId=" + str(user_id) + "&limit=" + str(limit), HTTPClient.METHOD_GET)

func get_season_leaderboard(season_id: int, limit: int = 100):
	_request("/pvp/season-leaderboard?seasonId=" + str(season_id) + "&limit=" + str(limit), HTTPClient.METHOD_GET)

func claim_season_rewards(user_id: int, season_id: int):
	_request("/pvp/claim-rewards", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"seasonId": season_id
	})
```

### Step 5: Implement Matchmaking Algorithm
```javascript
// server/src/services/pvpService.js
async findMatch(userId) {
    const playerProfile = await pvpRepository.getProfileByUserId(userId);
    
    // Find players within 50 rank points
    const potentialOpponents = await pvpRepository.getProfilesByRankRange(
        playerProfile.rank - 50,
        playerProfile.rank + 50,
        userId
    );
    
    // Sort by online status and proximity to rank
    potentialOpponents.sort((a, b) => {
        const rankDiffA = Math.abs(a.rank - playerProfile.rank);
        const rankDiffB = Math.abs(b.rank - playerProfile.rank);
        return rankDiffA - rankDiffB;
    });
    
    // Find first available opponent
    const opponent = potentialOpponents.find(async (opp) => {
        const oppStatus = await userRepository.getStatus(opp.userId);
        return oppStatus.isOnline && !oppStatus.isInMatch;
    });
    
    if (opponent) {
        // Create match
        const match = await pvpRepository.createMatch({
            player1Id: userId,
            player2Id: opponent.userId,
            seasonId: playerProfile.currentSeasonId
        });
        
        return match;
    } else {
        // Wait for opponent or expand rank range
        return null;
    }
}
```

### Step 6: Implement ELO Rank Calculation
```javascript
// server/src/services/pvpService.js
calculateRankChange(player1Rank, player2Rank, player1Won) {
    const expected1 = 1 / (1 + Math.pow(10, (player2Rank - player1Rank) / 400));
    const expected2 = 1 / (1 + Math.pow(10, (player1Rank - player2Rank) / 400));
    
    const actual1 = player1Won ? 1 : 0;
    const actual2 = player1Won ? 0 : 1;
    
    const kFactor = 32; // K-factor for rank changes
    
    const rankChange1 = Math.round(kFactor * (actual1 - expected1));
    const rankChange2 = Math.round(kFactor * (actual2 - expected2));
    
    return { rankChange1, rankChange2 };
}
```

### Step 7: Create PvP UI Screens
1. **Arena Queue Screen**: Show queue status and match information
2. **PvP Match Screen**: Tactical battle interface for 1v1 matches
3. **Match History Screen**: Display recent matches and results
4. **Leaderboard Screen**: Show top players for current season
5. **Season Rewards Screen**: Display available rewards and claim functionality

### Step 8: Implement Real-Time Communication
```javascript
// server/src/services/socketService.js
io.on('connection', (socket) => {
    // Existing socket handlers...
    
    socket.on('pvp:join-queue', (userId) => {
        socket.join(`pvp:queue:${userId}`);
    });
    
    socket.on('pvp:leave-queue', (userId) => {
        socket.leave(`pvp:queue:${userId}`);
    });
    
    socket.on('pvp:match-found', (matchData) => {
        const { player1Id, player2Id, matchId } = matchData;
        io.to(`pvp:queue:${player1Id}`).emit('pvp:match-found', matchData);
        io.to(`pvp:queue:${player2Id}`).emit('pvp:match-found', matchData);
    });
    
    socket.on('pvp:action', (data) => {
        const { matchId, userId, action } = data;
        io.to(`pvp:match:${matchId}`).emit('pvp:action', data);
    });
});
```

### Step 9: Balance and Test
1. Test matchmaking algorithm
2. Balance ELO rank system
3. Test PvP battle mechanics
4. Balance season rewards
5. Test spectator mode
6. Performance testing for multiple simultaneous matches

---

The PvP system will provide a competitive environment for players to test their tactical skills against each other, with seasonal rewards and rankings to keep players engaged. The implementation plan focuses on creating a fair and engaging experience for all skill levels.


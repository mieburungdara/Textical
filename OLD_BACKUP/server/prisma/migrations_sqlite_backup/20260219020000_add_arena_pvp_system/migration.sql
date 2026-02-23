-- Create Arena/PvP System Tables

-- Game Mode Enum
CREATE TABLE IF NOT EXISTS "GameMode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "GameMode" ("id", "name") VALUES (1, 'DUEL_1V1'), (2, 'SKIRMISH_2V2'), (3, 'FREE_FOR_ALL'), (4, 'TOURNAMENT');

-- Match Status Enum  
CREATE TABLE IF NOT EXISTS "MatchStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "MatchStatus" ("id", "name") VALUES (1, 'QUEUED'), (2, 'MATCHING'), (3, 'READY'), (4, 'IN_PROGRESS'), (5, 'COMPLETED'), (6, 'CANCELLED'), (7, 'TIMEOUT');

-- Win Condition Enum
CREATE TABLE IF NOT EXISTS "WinCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "WinCondition" ("id", "name") VALUES (1, 'ELIMINATION'), (2, 'SCORE_LIMIT'), (3, 'TIME_LIMIT'), (4, 'SURRENDER'), (5, 'FORFEIT');

-- Tournament Type Enum
CREATE TABLE IF NOT EXISTS "TournamentType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "TournamentType" ("id", "name") VALUES (1, 'DAILY_CUP'), (2, 'WEEKLY'), (3, 'MONTHLY'), (4, 'SPECIAL_EVENT');

-- Bracket Type Enum
CREATE TABLE IF NOT EXISTS "BracketType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "BracketType" ("id", "name") VALUES (1, 'SINGLE_ELIMINATION'), (2, 'DOUBLE_ELIMINATION');

-- Tournament Status Enum
CREATE TABLE IF NOT EXISTS "TournamentStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "TournamentStatus" ("id", "name") VALUES (1, 'REGISTRATION'), (2, 'CHECK_IN'), (3, 'SEEDING'), (4, 'IN_PROGRESS'), (5, 'COMPLETED'), (6, 'CANCELLED');

-- Participant Status Enum
CREATE TABLE IF NOT EXISTS "ParticipantStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT OR IGNORE INTO "ParticipantStatus" ("id", "name") VALUES (1, 'REGISTERED'), (2, 'CHECKED_IN'), (3, 'PLAYING'), (4, 'ELIMINATED'), (5, 'WITHDRAWN');

-- Arena Season
CREATE TABLE IF NOT EXISTS "ArenaSeason" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonNumber" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "topRewards" TEXT NOT NULL DEFAULT '{}',
    "participation" INTEGER NOT NULL DEFAULT 0,
    "isActive" INTEGER NOT NULL DEFAULT 0,
    "isComplete" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Arena Rating
CREATE TABLE IF NOT EXISTS "ArenaRating" (
    "playerId" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "soloRating" INTEGER NOT NULL DEFAULT 1000,
    "soloWins" INTEGER NOT NULL DEFAULT 0,
    "soloLosses" INTEGER NOT NULL DEFAULT 0,
    "soloStreak" INTEGER NOT NULL DEFAULT 0,
    "teamRating" INTEGER NOT NULL DEFAULT 1000,
    "teamWins" INTEGER NOT NULL DEFAULT 0,
    "teamLosses" INTEGER NOT NULL DEFAULT 0,
    "ffaPoints" INTEGER NOT NULL DEFAULT 0,
    "ffaWins" INTEGER NOT NULL DEFAULT 0,
    "ffaPlays" INTEGER NOT NULL DEFAULT 0,
    "currentRank" TEXT NOT NULL DEFAULT 'Bronze V',
    "highestRank" TEXT NOT NULL DEFAULT 'Bronze V',
    "division" INTEGER NOT NULL DEFAULT 5,
    "seasonWins" INTEGER NOT NULL DEFAULT 0,
    "seasonMatches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    UNIQUE("playerId", "seasonId")
);

-- Arena Match
CREATE TABLE IF NOT EXISTS "ArenaMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchCode" TEXT NOT NULL UNIQUE,
    "gameMode" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "playerIds" TEXT NOT NULL DEFAULT '[]',
    "teamAIds" TEXT NOT NULL DEFAULT '[]',
    "teamBIds" TEXT NOT NULL DEFAULT '[]',
    "winnerId" TEXT,
    "winCondition" INTEGER,
    "scores" TEXT NOT NULL DEFAULT '{}',
    "ratingChanges" TEXT NOT NULL DEFAULT '{}',
    "queuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "duration" INTEGER,
    "seasonId" TEXT,
    "isRanked" INTEGER NOT NULL DEFAULT 1,
    "battleId" TEXT
);

CREATE INDEX IF NOT EXISTS "ArenaMatch_seasonId_gameMode" ON "ArenaMatch"("seasonId", "gameMode");
CREATE INDEX IF NOT EXISTS "ArenaMatch_status" ON "ArenaMatch"("status");
CREATE INDEX IF NOT EXISTS "ArenaMatch_winnerId" ON "ArenaMatch"("winnerId");

-- Arena Leaderboard
CREATE TABLE IF NOT EXISTS "ArenaLeaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "gameMode" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "winRate" REAL NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "spectatedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    UNIQUE("playerId", "seasonId", "gameMode")
);

CREATE INDEX IF NOT EXISTS "ArenaLeaderboard_seasonId_gameMode_rank" ON "ArenaLeaderboard"("seasonId", "gameMode", "rank");

-- Tournament
CREATE TABLE IF NOT EXISTS "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "bracketType" INTEGER NOT NULL DEFAULT 1,
    "registrationStart" DATETIME NOT NULL,
    "registrationEnd" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "entryFee" INTEGER NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 50,
    "prizePool" TEXT NOT NULL DEFAULT '{}',
    "participationReward" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Tournament_status_startDate" ON "Tournament"("status", "startDate");

-- Tournament Participant
CREATE TABLE IF NOT EXISTS "TournamentParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "elo" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "checkedIn" INTEGER NOT NULL DEFAULT 0,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "isEliminated" INTEGER NOT NULL DEFAULT 0,
    "bracketPosition" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("tournamentId", "playerId")
);

CREATE INDEX IF NOT EXISTS "TournamentParticipant_tournamentId_seed" ON "TournamentParticipant"("tournamentId", "seed");

-- Tournament Match
CREATE TABLE IF NOT EXISTS "TournamentMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "bracketType" INTEGER NOT NULL DEFAULT 1,
    "playerAId" TEXT,
    "playerBId" TEXT,
    "winnerId" TEXT,
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "arenaMatchId" TEXT,
    "nextMatchId" TEXT,
    "loserNextMatchId" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS "TournamentMatch_tournamentId_round" ON "TournamentMatch"("tournamentId", "round");
CREATE INDEX IF NOT EXISTS "TournamentMatch_status" ON "TournamentMatch"("status");

-- Tournament Bracket
CREATE TABLE IF NOT EXISTS "TournamentBracket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL UNIQUE,
    "bracketData" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL,
    "activeMatches" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);

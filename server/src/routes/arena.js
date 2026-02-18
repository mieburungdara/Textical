/**
 * Arena Routes
 * REST endpoints untuk PvP Arena system
 */
const express = require('express');
const router = express.Router();
const prisma = require('../db');
const RatingSystem = require('../services/arena/RatingSystem');
const ArenaQueueService = require('../services/arena/ArenaQueueService');


/**
 * Helper to handle async route errors
 */
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standardized success response handler
 */
const handleResponse = (res, data) => res.json({ success: true, data });

/**
 * GET /api/arena/modes
 * Get available game modes
 */
router.get('/modes', asyncHandler(async (req, res) => {
    const modes = [
        {
            id: 'DUEL_1V1',
            name: '1v1 Duel',
            description: 'Solo ELO ranked matches',
            teamSize: 1,
            minLevel: 30,
            maxPlayers: 2
        },
        {
            id: 'SKIRMISH_2V2',
            name: '2v2 Skirmish',
            description: 'Team ELO ranked matches',
            teamSize: 2,
            minLevel: 40,
            maxPlayers: 4
        },
        {
            id: 'FREE_FOR_ALL',
            name: 'Free-For-All',
            description: 'Point-based battles',
            teamSize: 1,
            minLevel: 35,
            maxPlayers: 8
        }
    ];
    handleResponse(res, modes);
}));

/**
 * GET /api/arena/seasons
 * Get current and past seasons
 */
router.get('/seasons', asyncHandler(async (req, res) => {
    const seasons = await prisma.arenaSeason.findMany({
        orderBy: { startDate: 'desc' },
        take: 10
    });
    handleResponse(res, seasons);
}));

/**
 * GET /api/arena/seasons/current
 * Get current active season
 */
router.get('/seasons/current', asyncHandler(async (req, res) => {
    const season = await prisma.arenaSeason.findFirst({
        where: {
            status: 'ACTIVE'
        },
        orderBy: { startDate: 'desc' }
    });
    
    if (!season) {
        // Return default season if none exists
        return handleResponse(res, {
            id: 'default',
            name: 'Season 1',
            status: 'ACTIVE',
            startDate: new Date('2025-01-01'),
            endDate: null
        });
    }
    
    handleResponse(res, season);
}));

/**
 * GET /api/arena/ranks
 * Get rank tiers and thresholds
 */
router.get('/ranks', asyncHandler(async (req, res) => {
    const ranks = [
        { tier: 'Bronze V', minRating: 0, maxRating: 199, division: 5 },
        { tier: 'Bronze IV', minRating: 200, maxRating: 399, division: 4 },
        { tier: 'Bronze III', minRating: 400, maxRating: 599, division: 3 },
        { tier: 'Bronze II', minRating: 600, maxRating: 799, division: 2 },
        { tier: 'Bronze I', minRating: 800, maxRating: 999, division: 1 },
        { tier: 'Silver V', minRating: 1000, maxRating: 1199, division: 5 },
        { tier: 'Silver IV', minRating: 1200, maxRating: 1399, division: 4 },
        { tier: 'Silver III', minRating: 1400, maxRating: 1599, division: 3 },
        { tier: 'Silver II', minRating: 1600, maxRating: 1799, division: 2 },
        { tier: 'Silver I', minRating: 1800, maxRating: 1999, division: 1 },
        { tier: 'Gold V', minRating: 2000, maxRating: 2199, division: 5 },
        { tier: 'Gold IV', minRating: 2200, maxRating: 2399, division: 4 },
        { tier: 'Gold III', minRating: 2400, maxRating: 2599, division: 3 },
        { tier: 'Gold II', minRating: 2600, maxRating: 2799, division: 2 },
        { tier: 'Gold I', minRating: 2800, maxRating: 2999, division: 1 },
        { tier: 'Platinum V', minRating: 3000, maxRating: 3249, division: 5 },
        { tier: 'Platinum IV', minRating: 3250, maxRating: 3499, division: 4 },
        { tier: 'Platinum III', minRating: 3500, maxRating: 3749, division: 3 },
        { tier: 'Platinum II', minRating: 3750, maxRating: 3999, division: 2 },
        { tier: 'Platinum I', minRating: 4000, maxRating: 4249, division: 1 },
        { tier: 'Diamond V', minRating: 4250, maxRating: 4499, division: 5 },
        { tier: 'Diamond IV', minRating: 4500, maxRating: 4749, division: 4 },
        { tier: 'Diamond III', minRating: 4750, maxRating: 4999, division: 3 },
        { tier: 'Diamond II', minRating: 5000, maxRating: 5249, division: 2 },
        { tier: 'Diamond I', minRating: 5250, maxRating: 5499, division: 1 },
        { tier: 'Ascended V', minRating: 5500, maxRating: 5749, division: 5 },
        { tier: 'Ascended IV', minRating: 5750, maxRating: 5999, division: 4 },
        { tier: 'Ascended III', minRating: 6000, maxRating: 6249, division: 3 },
        { tier: 'Ascended II', minRating: 6250, maxRating: 6499, division: 2 },
        { tier: 'Ascended I', minRating: 6500, maxRating: 6749, division: 1 },
        { tier: 'Divine', minRating: 6750, maxRating: null, division: 0 }
    ];
    handleResponse(res, ranks);
}));

/**
 * GET /api/arena/rating/:playerId
 * Get player rating for a specific game mode
 */
router.get('/rating/:playerId', asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const { gameMode } = req.query;
    
    if (!gameMode) {
        // Return all ratings for player
        const ratings = await prisma.arenaRating.findMany({
            where: { playerId: parseInt(playerId) }
        });
        return handleResponse(res, ratings);
    }
    
    const rating = await RatingSystem.getPlayerRating(parseInt(playerId), gameMode);
    handleResponse(res, rating);
}));

/**
 * GET /api/arena/leaderboard
 * Get arena leaderboard
 */
router.get('/leaderboard', asyncHandler(async (req, res) => {
    const { gameMode, seasonId, limit = 50 } = req.query;
    
    const where = {};
    if (gameMode) where.gameMode = gameMode;
    if (seasonId) where.seasonId = seasonId;
    
    const leaderboard = await prisma.arenaLeaderboard.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: parseInt(limit),
        include: {
            player: {
                select: { id: true, username: true }
            }
        }
    });
    
    const formatted = leaderboard.map((entry, index) => ({
        rank: index + 1,
        playerId: entry.playerId,
        username: entry.player?.username || 'Unknown',
        rating: entry.rating,
        wins: entry.wins,
        losses: entry.losses,
        winStreak: entry.winStreak,
        gameMode: entry.gameMode
    }));
    
    handleResponse(res, formatted);
}));

/**
 * GET /api/arena/queue
 * Get current queue status for all game modes
 */
router.get('/queue', asyncHandler(async (req, res) => {
    const queueStatus = ArenaQueueService.getAllQueueStatuses();
    handleResponse(res, queueStatus);
}));

/**
 * GET /api/arena/queue/:playerId
 * Get specific player's queue status
 */
router.get('/queue/:playerId', asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const queueInfo = ArenaQueueService.getPlayerQueueInfo(parseInt(playerId));
    
    if (!queueInfo) {
        return res.status(404).json({ 
            success: false, 
            error: 'Player not in queue' 
        });
    }
    
    handleResponse(res, queueInfo);
}));

/**
 * POST /api/arena/queue/join
 * Join arena queue
 */
router.post('/queue/join', asyncHandler(async (req, res) => {
    const { playerId, gameMode, playerLevel } = req.body;
    
    if (!playerId || !gameMode) {
        return res.status(400).json({
            success: false,
            error: 'playerId and gameMode are required'
        });
    }
    
    // Check if player is already in a match or queue
    if (ArenaQueueService.isInQueue(playerId)) {
        return res.status(400).json({
            success: false,
            error: 'Player is already in queue'
        });
    }
    
    const result = await ArenaQueueService.addToQueue(playerId, gameMode, playerLevel);
    handleResponse(res, {
        message: 'Joined queue successfully',
        queueStatus: result
    });
}));

/**
 * POST /api/arena/queue/leave
 * Leave arena queue
 */
router.post('/queue/leave', asyncHandler(async (req, res) => {
    const { playerId } = req.body;
    
    if (!playerId) {
        return res.status(400).json({
            success: false,
            error: 'playerId is required'
        });
    }
    
    const result = ArenaQueueService.removeFromQueue(playerId);
    
    if (!result.success) {
        return res.status(404).json({
            success: false,
            error: result.message
        });
    }
    
    handleResponse(res, {
        message: 'Left queue successfully',
        gameMode: result.gameMode
    });
}));

/**
 * GET /api/arena/match/:matchId
 * Get match details
 */
router.get('/match/:matchId', asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    
    const match = await prisma.arenaMatch.findUnique({
        where: { id: parseInt(matchId) }
    });
    
    if (!match) {
        return res.status(404).json({
            success: false,
            error: 'Match not found'
        });
    }
    
    // Parse JSON fields
    const formatted = {
        ...match,
        playerIds: JSON.parse(match.playerIds || '[]'),
        teamAIds: JSON.parse(match.teamAIds || '[]'),
        teamBIds: JSON.parse(match.teamBIds || '[]'),
        winnerIds: match.winnerIds ? JSON.parse(match.winnerIds) : null
    };
    
    handleResponse(res, formatted);
}));

/**
 * GET /api/arena/match/code/:matchCode
 * Get match by code
 */
router.get('/match/code/:matchCode', asyncHandler(async (req, res) => {
    const { matchCode } = req.params;
    
    const match = await prisma.arenaMatch.findFirst({
        where: { matchCode }
    });
    
    if (!match) {
        return res.status(404).json({
            success: false,
            error: 'Match not found'
        });
    }
    
    const formatted = {
        ...match,
        playerIds: JSON.parse(match.playerIds || '[]'),
        teamAIds: JSON.parse(match.teamAIds || '[]'),
        teamBIds: JSON.parse(match.teamBIds || '[]'),
        winnerIds: match.winnerIds ? JSON.parse(match.winnerIds) : null
    };
    
    handleResponse(res, formatted);
}));

/**
 * GET /api/arena/matches/recent
 * Get recent matches
 */
router.get('/matches/recent', asyncHandler(async (req, res) => {
    const { playerId, gameMode, limit = 20 } = req.query;
    
    const where = {};
    if (playerId) {
        // Match by checking if player is in playerIds JSON
        where.playerIds = { contains: `"${playerId}"` };
    }
    if (gameMode) {
        where.gameMode = gameMode;
    }
    
    const matches = await prisma.arenaMatch.findMany({
        where,
        orderBy: { completedAt: 'desc' },
        take: parseInt(limit)
    });
    
    const formatted = matches.map(m => ({
        ...m,
        playerIds: JSON.parse(m.playerIds || '[]'),
        teamAIds: JSON.parse(m.teamAIds || '[]'),
        teamBIds: JSON.parse(m.teamBIds || '[]'),
        winnerIds: m.winnerIds ? JSON.parse(m.winnerIds) : null
    }));
    
    handleResponse(res, formatted);
}));

/**
 * GET /api/arena/stats/:playerId
 * Get player arena statistics
 */
router.get('/stats/:playerId', asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const { gameMode } = req.query;
    
    const playerIdInt = parseInt(playerId);
    
    // Get all ratings
    const ratings = await prisma.arenaRating.findMany({
        where: { playerId: playerIdInt }
    });
    
    // Filter by game mode if specified
    const filteredRatings = gameMode 
        ? ratings.filter(r => r.gameMode === gameMode)
        : ratings;
    
    // Calculate totals
    const totals = filteredRatings.reduce((acc, r) => ({
        totalWins: acc.totalWins + r.wins,
        totalLosses: acc.totalLosses + r.losses,
        totalMatches: acc.totalMatches + r.wins + r.losses,
        highestRating: Math.max(acc.highestRating, r.rating)
    }), { totalWins: 0, totalLosses: 0, totalMatches: 0, highestRating: 0 });
    
    // Get win rate
    const winRate = totals.totalMatches > 0 
        ? Math.round((totals.totalWins / totals.totalMatches) * 100) 
        : 0;
    
    // Get recent matches
    const recentMatches = await prisma.arenaMatch.findMany({
        where: {
            playerIds: { contains: `"${playerIdInt}"` },
            status: 'COMPLETED'
        },
        orderBy: { completedAt: 'desc' },
        take: 10
    });
    
    const formattedRecent = recentMatches.map(m => {
        const playerIds = JSON.parse(m.playerIds || '[]');
        const winnerIds = m.winnerIds ? JSON.parse(m.winnerIds) : [];
        const isWinner = winnerIds.includes(playerIdInt);
        
        return {
            id: m.id,
            gameMode: m.gameMode,
            isWinner,
            completedAt: m.completedAt
        };
    });
    
    handleResponse(res, {
        playerId: playerIdInt,
        ratings: filteredRatings,
        totals: {
            ...totals,
            winRate
        },
        recentMatches: formattedRecent
    });
}));

/**
 * POST /api/arena/match/:matchId/result
 * Submit match result (called after battle completes)
 */
router.post('/match/:matchId/result', asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    const { winnerIds, gameMode, battleDuration } = req.body;
    
    if (!winnerIds || !Array.isArray(winnerIds)) {
        return res.status(400).json({
            success: false,
            error: 'winnerIds array is required'
        });
    }
    
    const match = await prisma.arenaMatch.findUnique({
        where: { id: parseInt(matchId) }
    });
    
    if (!match) {
        return res.status(404).json({
            success: false,
            error: 'Match not found'
        });
    }
    
    if (match.status !== 'IN_PROGRESS') {
        return res.status(400).json({
            success: false,
            error: 'Match is not in progress'
        });
    }
    
    // Parse player IDs
    const playerIds = JSON.parse(match.playerIds || '[]');
    const teamAIds = JSON.parse(match.teamAIds || '[]');
    const teamBIds = JSON.parse(match.teamBIds || '[]');
    
    // Determine losers
    const loserIds = playerIds.filter(id => !winnerIds.includes(id));
    
    // Process ratings for each player
    const ratingUpdates = [];
    
    for (const winnerId of winnerIds) {
        for (const loserId of loserIds) {
            const result = await RatingSystem.processMatchResult({
                winnerId: parseInt(winnerId),
                loserId: parseInt(loserId),
                gameMode: match.gameMode
            });
            ratingUpdates.push(result);
        }
    }
    
    // Update match record
    const updatedMatch = await prisma.arenaMatch.update({
        where: { id: parseInt(matchId) },
        data: {
            status: 'COMPLETED',
            winnerIds: JSON.stringify(winnerIds),
            completedAt: new Date(),
            battleDuration
        }
    });
    
    handleResponse(res, {
        message: 'Match result processed',
        match: updatedMatch,
        ratingUpdates
    });
}));

/**
 * GET /api/arena/tournaments
 * Get upcoming and active tournaments
 */
router.get('/tournaments', asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    const tournaments = await prisma.tournament.findMany({
        where,
        orderBy: { startTime: 'asc' },
        include: {
            _count: {
                select: { participants: true }
            }
        }
    });
    
    const formatted = tournaments.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        status: t.status,
        maxParticipants: t.maxParticipants,
        currentParticipants: t._count.participants,
        startTime: t.startTime,
        prizePool: t.prizePool
    }));
    
    handleResponse(res, formatted);
}));

/**
 * GET /api/arena/tournaments/:tournamentId
 * Get tournament details
 */
router.get('/tournaments/:tournamentId', asyncHandler(async (req, res) => {
    const { tournamentId } = req.params;
    
    const tournament = await prisma.tournament.findUnique({
        where: { id: parseInt(tournamentId) },
        include: {
            participants: {
                include: {
                    player: {
                        select: { id: true, username: true }
                    }
                }
            },
            matches: true
        }
    });
    
    if (!tournament) {
        return res.status(404).json({
            success: false,
            error: 'Tournament not found'
        });
    }
    
    handleResponse(res, tournament);
}));

/**
 * POST /api/arena/tournaments/:tournamentId/register
 * Register for tournament
 */
router.post('/tournaments/:tournamentId/register', asyncHandler(async (req, res) => {
    const { tournamentId } = req.params;
    const { playerId } = req.body;
    
    const tournament = await prisma.tournament.findUnique({
        where: { id: parseInt(tournamentId) }
    });
    
    if (!tournament) {
        return res.status(404).json({
            success: false,
            error: 'Tournament not found'
        });
    }
    
    if (tournament.status !== 'REGISTRATION_OPEN') {
        return res.status(400).json({
            success: false,
            error: 'Tournament registration is not open'
        });
    }
    
    // Check if already registered
    const existing = await prisma.tournamentParticipant.findFirst({
        where: {
            tournamentId: parseInt(tournamentId),
            playerId: parseInt(playerId)
        }
    });
    
    if (existing) {
        return res.status(400).json({
            success: false,
            error: 'Already registered for this tournament'
        });
    }
    
    // Check max participants
    const currentCount = await prisma.tournamentParticipant.count({
        where: { tournamentId: parseInt(tournamentId) }
    });
    
    if (currentCount >= tournament.maxParticipants) {
        return res.status(400).json({
            success: false,
            error: 'Tournament is full'
        });
    }
    
    // Register player
    const participant = await prisma.tournamentParticipant.create({
        data: {
            tournamentId: parseInt(tournamentId),
            playerId: parseInt(playerId),
            status: 'REGISTERED'
        }
    });
    
    handleResponse(res, {
        message: 'Successfully registered for tournament',
        participant
    });
}));

/**
 * Error handler for this router
 */
router.use((err, req, res, next) => {
    console.error(`[ArenaRoutes Error] ${err.message}`);
    const statusCode = err.status || (err.message.includes('not found') ? 404 : 400);
    res.status(statusCode).json({ success: false, error: err.message });
});

module.exports = router;

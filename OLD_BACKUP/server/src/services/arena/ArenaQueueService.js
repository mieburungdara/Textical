/**
 * Arena Queue Service - Matchmaking System
 * Manages player queues for different game modes
 */

const prisma = require('../../db');
const logger = require('../../utils/logger');


// Queue configurations
const QUEUE_CONFIG = {
    DUEL_1V1: {
        minPlayers: 2,
        maxPlayers: 2,
        teamSize: 1,
        matchmakingRange: 200, // ELO range for matchmaking
        queueTimeout: 120, // seconds
        minLevel: 30
    },
    SKIRMISH_2V2: {
        minPlayers: 4,
        maxPlayers: 4,
        teamSize: 2,
        matchmakingRange: 200,
        queueTimeout: 180,
        minLevel: 40
    },
    FREE_FOR_ALL: {
        minPlayers: 4,
        maxPlayers: 8,
        teamSize: 1,
        matchmakingRange: 300,
        queueTimeout: 60,
        minLevel: 35
    }
};

// In-memory queue storage (would be Redis in production)
class ArenaQueueService {
    constructor() {
        // Maps: gameMode -> Set of player objects
        this.queues = {
            DUEL_1V1: new Map(),
            SKIRMISH_2V2: new Map(),
            FREE_FOR_ALL: new Map()
        };
        
        // Active matches
        this.activeMatches = new Map();
        
        // Matchmaking interval
        this.matchmakingInterval = null;
        
        // Start matchmaking processor
        this.startMatchmakingProcessor();
    }

    /**
     * Add player to queue
     */
    async addToQueue(playerId, gameMode, playerLevel) {
        logger.info('[ArenaQueueService.addToQueue] Player joining queue', {
            playerId,
            gameMode,
            playerLevel
        });

        const config = QUEUE_CONFIG[gameMode];
        if (!config) {
            throw new Error(`Invalid game mode: ${gameMode}`);
        }

        // Check level requirement
        if (playerLevel < config.minLevel) {
            throw new Error(`Player level ${playerLevel} is below minimum ${config.minLevel} for ${gameMode}`);
        }

        // Check if already in queue
        if (this.isInQueue(playerId)) {
            throw new Error('Player is already in a queue');
        }

        // Get player rating
        const ratingInfo = await RatingSystem.getPlayerRating(playerId, gameMode);

        // Add to queue
        const queueEntry = {
            playerId,
            gameMode,
            rating: ratingInfo.rating,
            level: playerLevel,
            joinedAt: Date.now(),
            preferredPlaystyle: 'normal' // Could be expanded
        };

        this.queues[gameMode].set(playerId, queueEntry);

        logger.info('[ArenaQueueService.addToQueue] Player joined queue', {
            playerId,
            gameMode,
            queueSize: this.queues[gameMode].size,
            rating: ratingInfo.rating
        });

        // Return queue status
        return this.getQueueStatus(gameMode);
    }

    /**
     * Remove player from queue
     */
    removeFromQueue(playerId) {
        logger.info('[ArenaQueueService.removeFromQueue] Player leaving queue', { playerId });

        for (const [gameMode, queue] of Object.entries(this.queues)) {
            if (queue.has(playerId)) {
                queue.delete(playerId);
                logger.info('[ArenaQueueService.removeFromQueue] Player removed', {
                    playerId,
                    gameMode,
                    remainingQueueSize: queue.size
                });
                return { success: true, gameMode };
            }
        }

        return { success: false, message: 'Player not in queue' };
    }

    /**
     * Check if player is in any queue
     */
    isInQueue(playerId) {
        for (const queue of Object.values(this.queues)) {
            if (queue.has(playerId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get player's queue info
     */
    getPlayerQueueInfo(playerId) {
        for (const [gameMode, queue] of Object.entries(this.queues)) {
            const entry = queue.get(playerId);
            if (entry) {
                return {
                    gameMode,
                    ...entry,
                    waitTime: Math.floor((Date.now() - entry.joinedAt) / 1000)
                };
            }
        }
        return null;
    }

    /**
     * Get queue status for a game mode
     */
    getQueueStatus(gameMode) {
        const queue = this.queues[gameMode];
        const config = QUEUE_CONFIG[gameMode];
        
        const players = Array.from(queue.values()).map(p => ({
            playerId: p.playerId,
            rating: p.rating,
            level: p.level,
            waitTime: Math.floor((Date.now() - p.joinedAt) / 1000)
        }));

        return {
            gameMode,
            playersInQueue: players.length,
            minPlayersRequired: config.minPlayers,
            players,
            estimatedWaitTime: this.estimateWaitTime(gameMode)
        };
    }

    /**
     * Get all queue statuses
     */
    getAllQueueStatuses() {
        return {
            DUEL_1V1: this.getQueueStatus('DUEL_1V1'),
            SKIRMISH_2V2: this.getQueueStatus('SKIRMISH_2V2'),
            FREE_FOR_ALL: this.getQueueStatus('FREE_FOR_ALL')
        };
    }

    /**
     * Estimate wait time based on queue size
     */
    estimateWaitTime(gameMode) {
        const queueSize = this.queues[gameMode].size;
        const config = QUEUE_CONFIG[gameMode];
        
        if (queueSize >= config.minPlayers) {
            return 0; // Ready to match
        }
        
        // Rough estimate: 10 seconds per missing player
        return (config.minPlayers - queueSize) * 10;
    }

    /**
     * Find optimal match for a player
     */
    findOptimalOpponent(gameMode, playerRating) {
        const queue = this.queues[gameMode];
        const config = QUEUE_CONFIG[gameMode];
        
        let bestOpponent = null;
        let bestRatingDiff = Infinity;

        for (const [opponentId, opponent] of queue) {
            const ratingDiff = Math.abs(opponent.rating - playerRating);
            
            // Check if within matchmaking range
            if (ratingDiff <= config.matchmakingRange && ratingDiff < bestRatingDiff) {
                bestOpponent = opponent;
                bestRatingDiff = ratingDiff;
            }
        }

        return bestOpponent;
    }

    /**
     * Create a match between players
     */
    async createMatch(players, gameMode) {
        logger.info('[ArenaQueueService.createMatch] Creating new match', {
            players: players.map(p => p.playerId),
            gameMode
        });

        const config = QUEUE_CONFIG[gameMode];
        const matchCode = this.generateMatchCode();
        
        // Determine teams
        let teamAIds = [];
        let teamBIds = [];
        
        if (gameMode === 'SKIRMISH_2V2') {
            // Split into two teams
            teamAIds = players.slice(0, 2).map(p => p.playerId);
            teamBIds = players.slice(2, 4).map(p => p.playerId);
        } else {
            // 1v1 or FFA - just list all players
            teamAIds = [players[0].playerId];
            teamBIds = [players[1]?.playerId].filter(Boolean);
        }

        // Create match in database
        const match = await prisma.arenaMatch.create({
            data: {
                matchCode,
                gameMode,
                status: 'READY',
                queuedAt: new Date(),
                participants: {
                    create: players.map(p => {
                        let teamId = null;
                        if (teamAIds.includes(p.playerId)) teamId = 'A';
                        else if (teamBIds.includes(p.playerId)) teamId = 'B';
                        
                        return {
                            playerId: String(p.playerId),
                            teamId
                        };
                    })
                }
            },
            include: {
                participants: true
            }
        });

        // Store in active matches
        this.activeMatches.set(match.id, {
            ...match,
            players,
            gameMode,
            createdAt: Date.now()
        });

        // Remove players from queue
        for (const player of players) {
            this.removeFromQueue(player.playerId);
        }

        logger.info('[ArenaQueueService.createMatch] Match created', {
            matchId: match.id,
            matchCode,
            gameMode,
            players: players.map(p => p.playerId)
        });

        return match;
    }

    /**
     * Generate unique match code
     */
    generateMatchCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'ARENA-';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Start matchmaking processor (runs every 500ms)
     */
    startMatchmakingProcessor() {
        if (this.matchmakingInterval) {
            return;
        }

        this.matchmakingInterval = setInterval(async () => {
            await this.processMatchmaking();
        }, 500);

        logger.info('[ArenaQueueService] Matchmaking processor started');
    }

    /**
     * Process matchmaking for all queues
     */
    async processMatchmaking() {
        for (const gameMode of Object.keys(this.queues)) {
            const queue = this.queues[gameMode];
            const config = QUEUE_CONFIG[gameMode];

            // Check if we have enough players
            if (queue.size < config.minPlayers) {
                continue;
            }

            // For 1v1: Find pairs
            if (gameMode === 'DUEL_1V1') {
                await this.processDuelMatchmaking(queue, config);
            }
            // For 2v2: Find groups of 4
            else if (gameMode === 'SKIRMISH_2V2') {
                await this.processTeamMatchmaking(queue, config, 4);
            }
            // For FFA: Find groups of 4-8
            else if (gameMode === 'FREE_FOR_ALL') {
                await this.processFFAMatchmaking(queue, config);
            }
        }
    }

    /**
     * Process 1v1 duel matchmaking
     */
    async processDuelMatchmaking(queue, config) {
        const players = Array.from(queue.values());
        
        // Try to find opponents for each player
        for (const player of players) {
            const opponent = this.findOptimalOpponent('DUEL_1V1', player.rating);
            
            if (opponent && player.playerId !== opponent.playerId) {
                // Create match
                await this.createMatch([player, opponent], 'DUEL_1V1');
                return; // Process one match at a time
            }
        }

        // If no good matches, create match with closest ratings
        if (players.length >= 2) {
            // Sort by rating
            const sorted = players.sort((a, b) => a.rating - b.rating);
            
            // Pair closest ratings
            for (let i = 0; i < sorted.length - 1; i++) {
                const player = sorted[i];
                const opponent = sorted[i + 1];
                
                // Check if both still in queue
                if (queue.has(player.playerId) && queue.has(opponent.playerId)) {
                    await this.createMatch([player, opponent], 'DUEL_1V1');
                    return;
                }
            }
        }
    }

    /**
     * Process team matchmaking (2v2)
     */
    async processTeamMatchmaking(queue, config, teamSize) {
        const players = Array.from(queue.values());
        
        if (players.length < teamSize) {
            return;
        }

        // Sort by rating
        const sorted = players.sort((a, b) => b.rating - a.rating);
        
        // Take first teamSize * 2 players (two teams)
        const matchedPlayers = sorted.slice(0, teamSize * 2);
        
        // Verify all still in queue
        const allInQueue = matchedPlayers.every(p => queue.has(p.playerId));
        
        if (allInQueue && matchedPlayers.length >= teamSize * 2) {
            await this.createMatch(matchedPlayers, 'SKIRMISH_2V2');
        }
    }

    /**
     * Process FFA matchmaking
     */
    async processFFAMatchmaking(queue, config) {
        const players = Array.from(queue.values());
        
        if (players.length < config.minPlayers) {
            return;
        }

        // Take 4-8 players
        const matchSize = Math.min(players.length, config.maxPlayers);
        const matchedPlayers = players.slice(0, matchSize);
        
        // Verify all still in queue
        const allInQueue = matchedPlayers.every(p => queue.has(p.playerId));
        
        if (allInQueue) {
            await this.createMatch(matchedPlayers, 'FREE_FOR_ALL');
        }
    }

    /**
     * Get active match info
     */
    getMatchInfo(matchId) {
        return this.activeMatches.get(matchId);
    }

    /**
     * Get all active matches
     */
    getActiveMatches() {
        return Array.from(this.activeMatches.values()).map(m => ({
            id: m.id,
            matchCode: m.matchCode,
            gameMode: m.gameMode,
            players: m.players.map(p => p.playerId),
            createdAt: m.createdAt
        }));
    }

    /**
     * Stop matchmaking processor
     */
    stopMatchmakingProcessor() {
        if (this.matchmakingInterval) {
            clearInterval(this.matchmakingInterval);
            this.matchmakingInterval = null;
            logger.info('[ArenaQueueService] Matchmaking processor stopped');
        }
    }
}

module.exports = new ArenaQueueService();

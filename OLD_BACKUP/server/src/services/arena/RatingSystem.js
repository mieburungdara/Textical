/**
 * Arena Rating System - ELO Calculation
 * Based on PvP Arena plan: Bronze V (0) → Divine (3000+)
 * K-Factor: 32, Streak bonus: +8 max
 */

const prisma = require('../../db');
const logger = require('../../utils/logger');


// ELO Constants
const K_FACTOR = 32;
const MAX_STREAK_BONUS = 8;
const STARTING_ELO = 1000;

// Rank definitions from plan
const RANK_TIERS = [
    { rank: 'Bronze V', min: 0, max: 799, title: 'Novice' },
    { rank: 'Bronze IV', min: 800, max: 999, title: 'Fighter' },
    { rank: 'Bronze III', min: 1000, max: 1199, title: 'Warrior' },
    { rank: 'Bronze II', min: 1200, max: 1399, title: 'Gladiator' },
    { rank: 'Bronze I', min: 1400, max: 1599, title: 'Champion' },
    { rank: 'Silver IV', min: 1600, max: 1799, title: 'Elite' },
    { rank: 'Silver III', min: 1800, max: 1999, title: 'Veteran' },
    { rank: 'Silver II', min: 2000, max: 2199, title: 'Hero' },
    { rank: 'Silver I', min: 2200, max: 2399, title: 'Legend' },
    { rank: 'Gold IV', min: 2400, max: 2599, title: 'Mythic' },
    { rank: 'Gold III', min: 2600, max: 2799, title: 'Demigod' },
    { rank: 'Gold II', min: 2800, max: 2999, title: 'Celestial' },
    { rank: 'Gold I', min: 3000, max: Infinity, title: 'Divine' }
];

class RatingSystem {
    /**
     * Calculate expected score for ELO
     * Formula: 1 / (1 + 10^((OpponentRating - PlayerRating) / 400))
     */
    calculateExpectedScore(playerRating, opponentRating) {
        const exponent = (opponentRating - playerRating) / 400;
        return 1 / (1 + Math.pow(10, exponent));
    }

    /**
     * Calculate new ELO rating after a match
     * Formula: NewRating = PlayerRating + K * (ActualScore - ExpectedScore)
     */
    calculateNewRating(playerRating, kFactor, actualScore, expectedScore) {
        const change = kFactor * (actualScore - expectedScore);
        return Math.round(playerRating + change);
    }

    /**
     * Calculate streak bonus (max +8 at 10+ streak)
     */
    calculateStreakBonus(streak) {
        if (streak < 0) return 0; // No bonus for losses
        if (streak >= 10) return MAX_STREAK_BONUS;
        return Math.floor(streak * MAX_STREAK_BONUS / 10);
    }

    /**
     * Get rank info from rating
     */
    getRankFromRating(rating) {
        for (const tier of RANK_TIERS) {
            if (rating >= tier.min && rating <= tier.max) {
                return {
                    rank: tier.rank,
                    title: tier.title,
                    division: this.getDivision(rating, tier.min, tier.max)
                };
            }
        }
        // Default to highest if somehow over max
        return {
            rank: 'Gold I',
            title: 'Divine',
            division: 1
        };
    }

    /**
     * Get division within a tier (1-5)
     */
    getDivision(rating, min, max) {
        const range = max - min;
        const position = rating - min;
        const percent = position / range;
        return Math.max(1, Math.ceil(5 - percent * 5));
    }

    /**
     * Get next rank info
     */
    getNextRank(currentRank) {
        const currentIndex = RANK_TIERS.findIndex(t => t.rank === currentRank);
        if (currentIndex === -1 || currentIndex === RANK_TIERS.length - 1) {
            return null;
        }
        return RANK_TIERS[currentIndex + 1];
    }

    /**
     * Process match result and update ratings
     * @param {string} playerId - Player ID
     * @param {string} opponentId - Opponent ID (or null for FFA)
     * @param {number} playerRating - Current player rating
     * @param {number} opponentRating - Current opponent rating
     * @param {boolean} isWin - Did player win?
     * @param {number} streak - Current win/loss streak (positive for wins, negative for losses)
     * @param {string} gameMode - DUEL_1V1, SKIRMISH_2V2, or FREE_FOR_ALL
     * @param {string} seasonId - Current season ID
     */
    async processMatchResult({
        playerId,
        opponentId = null,
        playerRating,
        opponentRating,
        isWin,
        streak,
        gameMode,
        seasonId
    }) {
        logger.info('[RatingSystem.processMatchResult] Processing match result', {
            playerId,
            opponentId,
            playerRating,
            opponentRating,
            isWin,
            streak,
            gameMode,
            seasonId
        });

        try {
            // Calculate expected score
            const expectedScore = this.calculateExpectedScore(playerRating, opponentRating);
            
            // Actual score: 1 for win, 0.5 for draw, 0 for loss
            const actualScore = isWin ? 1 : 0;
            
            // Get K-factor (could be adjusted based on games played)
            const adjustedKFactor = this.getAdjustedKFactor(playerRating);
            
            // Calculate streak bonus (only for wins)
            const streakBonus = isWin ? this.calculateStreakBonus(streak) : 0;
            
            // Calculate new rating
            let newRating = this.calculateNewRating(
                playerRating,
                adjustedKFactor,
                actualScore,
                expectedScore
            );
            
            // Apply streak bonus
            newRating = Math.max(0, newRating + streakBonus);
            
            // Get rank info
            const rankInfo = this.getRankFromRating(newRating);
            
            // Update player rating in database
            await this.updatePlayerRating({
                playerId,
                seasonId,
                gameMode,
                newRating,
                isWin,
                streak
            });
            
            const result = {
                playerId,
                oldRating: playerRating,
                newRating,
                delta: newRating - playerRating,
                streakBonus,
                newRank: rankInfo.rank,
                newTitle: rankInfo.title,
                newDivision: rankInfo.division
            };
            
            logger.info('[RatingSystem.processMatchResult] Rating updated successfully', result);
            return result;
            
        } catch (error) {
            logger.error('[RatingSystem.processMatchResult] Error processing match result', {
                error: error.message,
                stack: error.stack,
                playerId
            });
            throw error;
        }
    }

    /**
     * Get adjusted K-factor based on rating
     * Higher-rated players have less to gain/lose
     */
    getAdjustedKFactor(rating) {
        if (rating >= 2400) return 16; // Gold tier - lower variance
        if (rating >= 1600) return 24; // Silver tier
        return K_FACTOR; // Bronze - full K-factor
    }

    /**
     * Update player rating in database
     */
    async updatePlayerRating({
        playerId,
        seasonId,
        gameMode,
        newRating,
        isWin,
        streak
    }) {
        logger.debug('[RatingSystem.updatePlayerRating] Updating player rating', {
            playerId,
            seasonId,
            gameMode,
            newRating,
            isWin,
            streak
        });

        // Get current rating record or create new one
        let rating = await prisma.arenaRating.findUnique({
            where: { playerId }
        });

        if (!rating) {
            // Create new rating record
            rating = await prisma.arenaRating.create({
                data: {
                    playerId,
                    seasonId,
                    soloRating: gameMode === 'DUEL_1V1' ? newRating : STARTING_ELO,
                    teamRating: gameMode === 'SKIRMISH_2V2' ? newRating : STARTING_ELO,
                    ffaPoints: gameMode === 'FREE_FOR_ALL' ? newRating : 0
                }
            });
            logger.info('[RatingSystem.updatePlayerRating] Created new rating record', { playerId });
        }

        // Update based on game mode
        const updateData = {};
        
        if (gameMode === 'DUEL_1V1') {
            updateData.soloRating = newRating;
            if (isWin) {
                updateData.soloWins = { increment: 1 };
                updateData.soloStreak = Math.max(0, rating.soloStreak + 1);
            } else {
                updateData.soloLosses = { increment: 1 };
                updateData.soloStreak = Math.min(0, rating.soloStreak - 1);
            }
        } else if (gameMode === 'SKIRMISH_2V2') {
            updateData.teamRating = newRating;
            if (isWin) {
                updateData.teamWins = { increment: 1 };
            } else {
                updateData.teamLosses = { increment: 1 };
            }
        } else if (gameMode === 'FREE_FOR_ALL') {
            // FFA uses points, not ELO
            updateData.ffaPoints = newRating;
            if (isWin) {
                updateData.ffaWins = { increment: 1 };
            }
            updateData.ffaPlays = { increment: 1 };
        }

        // Update rank
        const rankInfo = this.getRankFromRating(newRating);
        updateData.currentRank = rankInfo.rank;
        
        // Update highest rank if exceeded
        if (this.compareRanks(newRating, rating.highestRank) > 0) {
            updateData.highestRank = rankInfo.rank;
        }

        // Update season stats
        if (isWin) {
            updateData.seasonWins = { increment: 1 };
        }
        updateData.seasonMatches = { increment: 1 };

        // Apply update
        await prisma.arenaRating.update({
            where: { playerId },
            data: updateData
        });
        
        logger.debug('[RatingSystem.updatePlayerRating] Rating updated', { playerId, newRating });
    }

    /**
     * Compare two rank strings (returns 1 if first is higher, -1 if lower, 0 if equal)
     */
    compareRanks(rating, rankName) {
        const currentInfo = this.getRankFromRating(rating);
        const targetInfo = RANK_TIERS.find(t => t.rank === rankName);
        
        if (!targetInfo) return 1;
        
        if (rating >= targetInfo.max) return 1;
        if (rating < targetInfo.min) return -1;
        return 0;
    }

    /**
     * Get player rating for a specific mode
     */
    async getPlayerRating(playerId, gameMode = 'DUEL_1V1') {
        logger.debug('[RatingSystem.getPlayerRating] Getting player rating', { playerId, gameMode });
        
        const rating = await prisma.arenaRating.findUnique({
            where: { playerId }
        });

        if (!rating) {
            return {
                rating: STARTING_ELO,
                rank: 'Bronze V',
                title: 'Novice',
                division: 5,
                wins: 0,
                losses: 0,
                streak: 0
            };
        }

        let currentRating;
        let wins;
        let losses;
        let streak;

        switch (gameMode) {
            case 'DUEL_1V1':
                currentRating = rating.soloRating;
                wins = rating.soloWins;
                losses = rating.soloLosses;
                streak = rating.soloStreak;
                break;
            case 'SKIRMISH_2V2':
                currentRating = rating.teamRating;
                wins = rating.teamWins;
                losses = rating.teamLosses;
                streak = 0;
                break;
            case 'FREE_FOR_ALL':
                currentRating = rating.ffaPoints;
                wins = rating.ffaWins;
                losses = rating.ffaPlays - rating.ffaWins;
                streak = 0;
                break;
            default:
                currentRating = rating.soloRating;
                wins = rating.soloWins;
                losses = rating.soloLosses;
                streak = rating.soloStreak;
        }

        const rankInfo = this.getRankFromRating(currentRating);

        return {
            rating: currentRating,
            rank: rankInfo.rank,
            title: rankInfo.title,
            division: rankInfo.division,
            wins,
            losses,
            streak,
            highestRank: rating.highestRank,
            seasonWins: rating.seasonWins,
            seasonMatches: rating.seasonMatches
        };
    }

    /**
     * Get division progress for UI
     */
    getDivisionProgress(rating) {
        const rankInfo = this.getRankFromRating(rating);
        const tier = RANK_TIERS.find(t => t.rank === rankInfo.rank);
        
        if (!tier || tier.max === Infinity) {
            return { current: rating, max: rating, progress: 100 };
        }

        const progress = ((rating - tier.min) / (tier.max - tier.min)) * 100;
        
        return {
            current: rating - tier.min,
            max: tier.max - tier.min,
            progress: Math.round(progress)
        };
    }

    /**
     * Get all rank tiers (for UI display)
     */
    getAllRankTiers() {
        return RANK_TIERS.map((tier, index) => ({
            ...tier,
            tierNumber: RANK_TIERS.length - index,
            isTopTier: tier.min >= 3000
        }));
    }
}

module.exports = new RatingSystem();

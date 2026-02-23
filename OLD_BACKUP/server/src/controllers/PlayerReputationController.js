const BaseController = require('./BaseController');
const playerReputationService = require('../services/playerReputationService');
const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

class PlayerReputationController extends BaseController {
    /**
     * Helper to get authenticated user from token
     */
    async getAuthenticatedUser(req) {
        const token = req.headers['x-session-token'];
        if (!token) {
            throw new Error('Authentication required. No session token provided.');
        }
        
        const session = await sessionService.validateSession(token);
        if (!session) {
            throw new Error('Invalid or expired session. Please login again.');
        }
        
        return session.userId;
    }

    /**
     * Give like or dislike to a player
     * POST /reputation/give
     */
    async giveReputation(req, res) {
        await this.execute(res, async () => {
            const currentUserId = await this.getAuthenticatedUser(req);

            const { toUserId, type, comment } = req.body;
            
            if (!toUserId || !type) {
                return this.sendError(res, "Missing required fields: toUserId and type", 400);
            }

            const result = await playerReputationService.giveReputation(
                currentUserId,
                parseInt(toUserId),
                type.toUpperCase(),
                comment || null
            );

            logger.info('[PlayerReputationController.giveReputation]', {
                fromUserId: currentUserId,
                toUserId,
                type
            });

            this.sendSuccess(res, result);
        });
    }

    /**
     * Remove reputation
     * DELETE /reputation/:toUserId
     */
    async removeReputation(req, res) {
        await this.execute(res, async () => {
            const currentUserId = await this.getAuthenticatedUser(req);

            const toUserId = parseInt(req.params.toUserId);
            if (isNaN(toUserId)) {
                return this.sendError(res, "Invalid target user ID", 400);
            }

            const result = await playerReputationService.removeReputation(
                currentUserId,
                toUserId
            );

            this.sendSuccess(res, result);
        });
    }

    /**
     * Get user reputation stats
     * GET /reputation/:userId
     */
    async getUserReputation(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid user ID", 400);
            }

            const stats = await playerReputationService.getUserReputationStats(userId);
            this.sendSuccess(res, stats);
        });
    }

    /**
     * Get comments for a user
     * GET /reputation/:userId/comments
     */
    async getUserComments(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid user ID", 400);
            }

            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;

            const comments = await playerReputationService.getUserComments(userId, limit, offset);
            this.sendSuccess(res, comments);
        });
    }

    /**
     * Get reputation given by current user
     * GET /reputation/me/given
     */
    async getGivenReputations(req, res) {
        await this.execute(res, async () => {
            const currentUserId = await this.getAuthenticatedUser(req);

            const reputations = await playerReputationService.getGivenReputations(currentUserId);
            this.sendSuccess(res, reputations);
        });
    }

    /**
     * Check if current user can give reputation to target
     * GET /reputation/can-give/:toUserId
     */
    async canGiveReputation(req, res) {
        await this.execute(res, async () => {
            const currentUserId = await this.getAuthenticatedUser(req);

            const toUserId = parseInt(req.params.toUserId);
            if (isNaN(toUserId)) {
                return this.sendError(res, "Invalid target user ID", 400);
            }

            const result = await playerReputationService.canGiveReputation(currentUserId, toUserId);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Get list of users current user can give reputation to
     * GET /reputation/interactable
     */
    async getInteractableUsers(req, res) {
        await this.execute(res, async () => {
            const currentUserId = await this.getAuthenticatedUser(req);

            const users = await playerReputationService.getInteractableUsers(currentUserId);
            this.sendSuccess(res, users);
        });
    }

    /**
     * Get leaderboard of top players
     * GET /reputation/leaderboard?type=likes&limit=50
     */
    async getLeaderboard(req, res) {
        await this.execute(res, async () => {
            const type = req.query.type || 'likes';
            const limit = parseInt(req.query.limit) || 50;

            if (type !== 'likes' && type !== 'dislikes') {
                return this.sendError(res, "Invalid type. Use 'likes' or 'dislikes'", 400);
            }

            const leaders = await playerReputationService.getLeaderboard(type, limit);
            this.sendSuccess(res, leaders);
        });
    }

    /**
     * Get guild aggregate reputation
     * GET /reputation/guild/:guildId
     */
    async getGuildReputation(req, res) {
        await this.execute(res, async () => {
            const guildId = parseInt(req.params.guildId);
            if (isNaN(guildId)) {
                return this.sendError(res, "Invalid guild ID", 400);
            }

            const guildRep = await playerReputationService.getGuildReputation(guildId);
            this.sendSuccess(res, guildRep);
        });
    }
}

module.exports = new PlayerReputationController();

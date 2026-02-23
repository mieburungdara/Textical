const prisma = require('../../db');

/**
 * Shared utilities for Guild Services
 */
const GuildUtils = {
    /**
     * Add history entry for a guild event
     */
    async addHistory(guildId, eventType, userId, targetUserId, description) {
        await prisma.guildHistory.create({
            data: {
                guildId,
                eventType,
                userId,
                targetUserId,
                description
            }
        });
    },

    /**
     * Generate unique invite code
     */
    generateInviteCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
};

module.exports = GuildUtils;

const BaseService = require('./BaseService');

/**
 * InnGuestbookService
 * Handles player comments left in regional guestbooks.
 */
class InnGuestbookService extends BaseService {
    constructor() {
        super();
        this.MAX_MESSAGES = 50;
    }

    /**
     * Leave a message in a region's guestbook
     */
    async leaveMessage(userId, regionId, message) {
        if (!message || message.trim().length === 0) {
            throw new Error("Message cannot be empty.");
        }

        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { username: true }
        });

        if (!user) throw new Error("User not found.");

        return await this.db.innGuestbook.create({
            data: {
                userId,
                regionId,
                playerUserName: user.username,
                message: message.substring(0, 200) // Caps at 200 chars
            }
        });
    }

    /**
     * Get messages for a region
     */
    async getGuestbook(regionId) {
        return await this.db.innGuestbook.findMany({
            where: { regionId },
            orderBy: { createdAt: 'desc' },
            take: this.MAX_MESSAGES
        });
    }
}

module.exports = new InnGuestbookService();

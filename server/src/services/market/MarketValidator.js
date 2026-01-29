const BaseService = require('../BaseService');

class MarketValidator extends BaseService {
    /**
     * Checks if a user is currently in a Town and not busy.
     */
    async verifyInTown(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });
        
        if (!user) throw new Error("User not found.");
        if (user.taskQueue.length > 0) throw new Error("You are too busy to use the market right now.");

        // Find current region template
        const region = await this.db.regionTemplate.findUnique({
            where: { id: user.currentRegion }
        });

        if (!region || region.type !== "TOWN") {
            throw new Error(`Market actions are forbidden in ${region ? region.name : 'the wilderness'}. Return to a Town.`);
        }
        return user;
    }
}

module.exports = new MarketValidator();

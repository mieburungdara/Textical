const BaseService = require('../BaseService');
const AppError = require('../../utils/AppError');
const ErrorCodes = require('../../constants/ErrorCodes');

class MarketValidator extends BaseService {
    /**
     * Checks if a user is currently in a Town and not busy.
     */
    async verifyInTown(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });
        
        if (!user) {
            throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not found.');
        }
        if (user.taskQueue.length > 0) {
            throw new AppError(ErrorCodes.MARKET_BUSY, 'You are too busy to use the market right now.');
        }

        // Find current region template
        const region = await this.db.regionTemplate.findUnique({
            where: { id: user.currentRegion }
        });

        if (!region || region.visualType !== "TOWN") {
            throw new AppError(ErrorCodes.MARKET_NOT_IN_TOWN, `Market actions are forbidden in ${region ? region.name : 'the wilderness'}. Return to a Town.`);
        }
        return user;
    }
}

module.exports = new MarketValidator();

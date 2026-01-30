const BaseService = require('./BaseService');
const transactionManager = require('./economy/TransactionManager');

/**
 * EconomyService
 * Thin orchestrator for all gold-related business logic.
 * Inherits from BaseService and delegates to TransactionManager.
 */
class EconomyService extends BaseService {
    /**
     * Unified method to credit a user's account.
     */
    async creditUser(userId, amount, type, sourceId = null, sourceType = null) {
        return await this.runTransaction(async (tx) => {
            return await transactionManager.addGold(tx, userId, amount, type, sourceId, sourceType);
        });
    }

    /**
     * Unified method to debit a user's account.
     */
    async debitUser(userId, amount, type, sourceId = null, sourceType = null) {
        return await this.runTransaction(async (tx) => {
            return await transactionManager.removeGold(tx, userId, amount, type, sourceId, sourceType);
        });
    }

    /**
     * Returns the user's current gold balance.
     */
    async getBalance(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { gold: true }
        });
        return user ? user.gold : 0;
    }
}

module.exports = new EconomyService();
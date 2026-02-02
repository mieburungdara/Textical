const resolver = require('../../logic/economy/CurrencyResolver');

/**
 * AAA TransactionManager
 * Core component for handling tiered multi-currency movements.
 * Manages Copper, Silver, Gold, Platinum, and Diamond denominations.
 */
class TransactionManager {
    /**
     * Credits currency to a user and records it in the ledger.
     * @param {Object} tx - Prisma Transaction Client.
     * @param {number} amountCopper - Amount to add in base copper units.
     */
    async addCurrency(tx, userId, amountCopper, type, sourceId = null, sourceType = null) {
        if (amountCopper <= 0) return;

        const user = await tx.user.findUnique({ 
            where: { id: userId },
            select: { copper: true, silver: true, gold: true, platinum: true, diamond: true }
        });

        // 1. Calculate New Total in Copper
        const currentTotal = resolver.getTotalCopper(user);
        const newTotal = currentTotal + amountCopper;

        // 2. Resolve new denominations
        const newTiers = resolver.resolveTiers(newTotal);

        // 3. Update User
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: newTiers
        });

        // 4. Record Ledger
        await tx.transactionLedger.create({
            data: {
                userId,
                type,
                currencyTier: "TIERED",
                copperDelta: amountCopper,
                copperBalance: newTotal,
                sourceId,
                sourceType
            }
        });

        return updatedUser;
    }

    /**
     * Debits currency from a user and records it in the ledger.
     * Handles automatic "breaking" of higher tiers into lower ones.
     * @param {Object} tx - Prisma Transaction Client.
     * @param {number} amountCopper - Amount to deduct in base copper units.
     */
    async removeCurrency(tx, userId, amountCopper, type, sourceId = null, sourceType = null) {
        if (amountCopper <= 0) return;

        const user = await tx.user.findUnique({ 
            where: { id: userId },
            select: { copper: true, silver: true, gold: true, platinum: true, diamond: true }
        });

        const currentTotal = resolver.getTotalCopper(user);
        if (currentTotal < amountCopper) throw new Error("Insufficient funds across all currency tiers.");

        // 1. Calculate New Total
        const newTotal = currentTotal - amountCopper;

        // 2. Resolve new denominations
        const newTiers = resolver.resolveTiers(newTotal);

        // 3. Update User
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: newTiers
        });

        // 4. Record Ledger
        await tx.transactionLedger.create({
            data: {
                userId,
                type,
                currencyTier: "TIERED",
                copperDelta: -amountCopper,
                copperBalance: newTotal,
                sourceId,
                sourceType
            }
        });

        return updatedUser;
    }

    // --- Legacy Aliases for Compatibility during Refactor ---
    async addGold(tx, userId, amount, type, sId, sT) { return await this.addCurrency(tx, userId, amount, type, sId, sT); }
    async removeGold(tx, userId, amount, type, sId, sT) { return await this.removeCurrency(tx, userId, amount, type, sId, sT); }
}

module.exports = new TransactionManager();
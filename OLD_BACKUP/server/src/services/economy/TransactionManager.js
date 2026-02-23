const resolver = require('../../logic/economy/CurrencyResolver');

/**
 * AAA TransactionManager
 * Core component for handling simplified dual-currency movements.
 * Manages Silver and Gold denominations (1,000,000:1 ratio).
 */
class TransactionManager {
    /**
     * Credits currency to a user and records it in the ledger.
     * @param {Object} tx - Prisma Transaction Client.
     * @param {number|BigInt} amountSilver - Amount to add in base silver units.
     */
    async addCurrency(tx, userId, amountSilver, type, sourceId = null, sourceType = null) {
        if (amountSilver <= 0) return;

        const user = await tx.user.findUnique({ 
            where: { id: userId },
            select: { silver: true, gold: true }
        });

        // 1. Calculate New Total in Silver
        const currentTotal = BigInt(resolver.getTotalSilver(user));
        const newTotal = currentTotal + BigInt(amountSilver);

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
                currencyTier: "DUAL",
                silverDelta: BigInt(amountSilver),
                silverBalance: newTotal,
                sourceId,
                sourceType
            }
        });

        return updatedUser;
    }

    /**
     * Debits currency from a user and records it in the ledger.
     * Handles automatic "breaking" of gold into silver.
     * @param {Object} tx - Prisma Transaction Client.
     * @param {number|BigInt} amountSilver - Amount to deduct in base silver units.
     */
    async removeCurrency(tx, userId, amountSilver, type, sourceId = null, sourceType = null) {
        if (amountSilver <= 0) return;

        const user = await tx.user.findUnique({ 
            where: { id: userId },
            select: { silver: true, gold: true }
        });

        const currentTotal = BigInt(resolver.getTotalSilver(user));
        if (currentTotal < BigInt(amountSilver)) throw new Error("Insufficient funds across Silver and Gold.");

        // 1. Calculate New Total
        const newTotal = currentTotal - BigInt(amountSilver);

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
                currencyTier: "DUAL",
                silverDelta: -BigInt(amountSilver),
                silverBalance: newTotal,
                sourceId,
                sourceType
            }
        });

        return updatedUser;
    }

    // --- Legacy Aliases for Compatibility ---
    async addGold(tx, userId, amount, type, sId, sT) { return await this.addCurrency(tx, userId, amount, type, sId, sT); }
    async removeGold(tx, userId, amount, type, sId, sT) { return await this.removeCurrency(tx, userId, amount, type, sId, sT); }
}

module.exports = new TransactionManager();
